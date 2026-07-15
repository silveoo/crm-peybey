import {useEffect, useMemo, useState} from 'react';
import {Booking} from '../../bookings/booking.types';
import {RestaurantTable} from '../../tables/table.types';
import {AppSettings} from '../../../repositories/SettingsRepository';
import {heightForRange, minutesFromTime, shiftEndMinute, shiftMinute, sortTables, timeFromMinutes, topForTime} from '../calendar.utils';

const rowH = 48;
const majorStep = 30;
const selectionStep = 15;

const localIsoDate = (value: Date) => {
    const year = value.getFullYear(), month = String(value.getMonth() + 1).padStart(2, '0'), day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`
};

export function CalendarBoard({date, tables, bookings, settings, onSlot, onBooking, onMove}: {
    date: string;
    tables: RestaurantTable[];
    bookings: Booking[];
    settings: AppSettings;
    onSlot: (tableId: string, start: string, end: string) => void;
    onBooking: (b: Booking) => void;
    onMove: (booking: Booking, tableId: string, start: string, end: string) => void
}) {
    const active = sortTables(tables).filter(t => t.isActive);
    const start = minutesFromTime(settings.dayStart), end = shiftEndMinute(settings.dayStart, settings.dayEnd),
        ppm = rowH / majorStep;
    const slots = useMemo(() => Array.from({length: Math.ceil((end - start) / selectionStep)}, (_, i) => start + i * selectionStep), [start, end]);
    const [sel, setSel] = useState<{ t: string; s: number; e: number } | null>(null);
    const [dragged, setDragged] = useState<Booking | null>(null);
    const [dropTarget, setDropTarget] = useState<{tableId: string; minute: number} | null>(null);
    const draggedDuration = dragged ? (() => {
        const bookingStart = shiftMinute(dragged.startTime, settings.dayStart);
        let bookingEnd = shiftMinute(dragged.endTime, settings.dayStart);
        if (bookingEnd <= bookingStart) bookingEnd += 1440;
        return bookingEnd - bookingStart
    })() : 0;
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 30_000);
        return () => window.clearInterval(timer)
    }, []);
    const nowClock = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const overnight = end > 1440;
    const shiftDate = new Date(now);
    if (overnight && nowClock < start) shiftDate.setDate(shiftDate.getDate() - 1);
    const nowOnScale = nowClock < start ? nowClock + 1440 : nowClock;
    const showNow = localIsoDate(shiftDate) === date && nowOnScale >= start && nowOnScale <= end;
    const finish = () => {
        if (sel) {
            const a = Math.min(sel.s, sel.e), b = Math.min(end, Math.max(sel.s, sel.e));
            onSlot(sel.t, timeFromMinutes(a), timeFromMinutes(b));
            setSel(null)
        }
    };
    return <div onMouseUp={finish}
                className="h-full overflow-auto scrollbar no-select rounded-2xl border bg-white shadow-sm">
        <div style={{
            gridTemplateColumns: `80px repeat(${active.length}, minmax(180px, 1fr))`,
            gridTemplateRows: `auto repeat(${slots.length}, ${rowH / 2}px)`
        }}
             className="grid min-w-max">
            <div className="sticky left-0 top-0 z-30 border-b bg-white"/>
            <>{active.map(t => <div key={t.id}
                                    className="sticky top-0 z-20 border-b border-l bg-white/95 p-3 font-medium backdrop-blur">{t.name}</div>)}</>
            {slots.map(m => <div key={m} className="contents">
                <div className={`sticky left-0 z-10 h-6 bg-white px-2 pt-1.5 text-xs leading-none text-neutral-500 ${
                    (m - start) % majorStep === 0 ? 'border-t border-neutral-200' : 'border-t border-neutral-100'
                }`}>{(m - start) % majorStep === 0 ? timeFromMinutes(m) : ''}</div>
                {active.map(t => <div key={t.id + m} onDragOver={event => {
                    if (!dragged) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDropTarget({tableId: t.id, minute: Math.min(m, end - draggedDuration)})
                }} onDrop={event => {
                    event.preventDefault();
                    if (!dragged) return;
                    const targetStart = Math.min(m, end - draggedDuration);
                    onMove(dragged, t.id, timeFromMinutes(targetStart), timeFromMinutes(targetStart + draggedDuration));
                    setDragged(null);
                    setDropTarget(null)
                }} onMouseDown={e => {
                    if ((e.target as HTMLElement).dataset.booking) return;
                    setSel({t: t.id, s: m, e: Math.min(end, m + selectionStep)})
                }} onMouseMove={event => {
                    if (sel?.t !== t.id) return;
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const boundary = event.clientY - bounds.top < bounds.height / 2 ? m : m + selectionStep;
                    const nextEnd = boundary === sel.s ? Math.min(end, sel.s + selectionStep) : boundary;
                    setSel({...sel, e: nextEnd})
                }}
                                      className={`relative border-l ${dropTarget?.tableId === t.id && dropTarget.minute === m ? 'bg-blue-100' : Math.floor((m - start) / 60) % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} ${
                                          (m - start) % majorStep === 0 ? 'border-t border-neutral-200' : 'border-t border-neutral-100'
                                      }`}
                                      style={{height: rowH / 2}}>{sel?.t === t.id && m >= Math.min(sel.s, sel.e) && m < Math.max(sel.s, sel.e) &&
                    <div className="absolute inset-x-2 inset-y-0.5 rounded bg-neutral-900/10"/>}</div>)}</div>)}</div>
        <div className="pointer-events-none relative grid min-w-max" style={{
            marginLeft: 80,
            marginTop: -slots.length * rowH / 2,
            height: slots.length * rowH / 2,
            width: `max(${active.length * 180}px, calc(100% - 80px))`,
            gridTemplateColumns: `repeat(${active.length}, minmax(180px, 1fr))`
        }}>{showNow && <div className="absolute inset-x-0 z-20 border-t-2 border-red-500" style={{top: (nowOnScale - start) * ppm}}>
            <span className="absolute -left-[72px] -top-2.5 rounded bg-red-500 px-1 text-[10px] font-medium text-white">{timeFromMinutes(Math.floor(nowClock))}</span>
        </div>}{active.map(t => <div key={t.id} className="relative h-full">
            {dragged && dropTarget?.tableId === t.id && <div
                className="absolute left-2 right-2 z-30 overflow-hidden rounded-xl border-2 border-blue-600 bg-blue-100/95 p-2 text-left text-xs text-blue-950 shadow-lg"
                style={{
                    top: (dropTarget.minute - start) * ppm,
                    height: draggedDuration * ppm
                }}>
                <b>{timeFromMinutes(dropTarget.minute)} {dragged.guestName}</b>
                <p className="truncate opacity-70">{timeFromMinutes(dropTarget.minute)}–{timeFromMinutes(dropTarget.minute + draggedDuration)}</p>
            </div>}
            {bookings.filter(b => b.tableId === t.id).map(b =>
            <button data-booking="1" draggable key={b.id} onClick={() => {
                if (!dragged) onBooking(b)
            }} onDragOver={event => {
                if (!dragged || dragged.id !== b.id) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                const columnBounds = event.currentTarget.parentElement!.getBoundingClientRect();
                const hoveredMinute = start + Math.floor((event.clientY - columnBounds.top) / (selectionStep * ppm)) * selectionStep;
                setDropTarget({tableId: b.tableId, minute: Math.max(start, Math.min(hoveredMinute, end - draggedDuration))})
            }} onDrop={event => {
                if (!dragged || dragged.id !== b.id) return;
                event.preventDefault();
                const columnBounds = event.currentTarget.parentElement!.getBoundingClientRect();
                const hoveredMinute = start + Math.floor((event.clientY - columnBounds.top) / (selectionStep * ppm)) * selectionStep;
                const targetStart = Math.max(start, Math.min(hoveredMinute, end - draggedDuration));
                onMove(dragged, b.tableId, timeFromMinutes(targetStart), timeFromMinutes(targetStart + draggedDuration));
                setDragged(null);
                setDropTarget(null)
            }} onDragStart={event => {
                setDragged(b);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', b.id);
                const transparentPreview = document.createElement('canvas');
                transparentPreview.width = 1;
                transparentPreview.height = 1;
                event.dataTransfer.setDragImage(transparentPreview, 0, 0)
            }} onDragEnd={() => {
                setDragged(null);
                setDropTarget(null)
            }}
                    className={`pointer-events-auto absolute left-2 right-2 cursor-grab overflow-hidden rounded-xl border border-neutral-300 bg-white p-2 text-left text-xs shadow-md hover:shadow-lg active:cursor-grabbing ${dragged?.id === b.id ? 'opacity-25' : ''}`}
                    style={{
                        top: topForTime(b.startTime, settings.dayStart, ppm),
                        height: heightForRange(b.startTime, b.endTime, ppm)
                    }} title={`${b.guestName}, ${b.guestCount} гостей, ${b.startTime}-${b.endTime}`}>
                <b>{b.startTime} {b.guestName}</b><p className="truncate text-neutral-500">{b.comment}</p>
            </button>)}</div>)}</div>
    </div>
}
