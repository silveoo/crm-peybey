import {useEffect, useMemo, useRef, useState} from 'react';
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
    const pointerDrag = useRef<{booking: Booking; x: number; y: number; moving: boolean} | null>(null);
    const dropTargetRef = useRef<{tableId: string; minute: number} | null>(null);
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
    useEffect(() => {
        const clearDrag = () => {
            pointerDrag.current = null;
            dropTargetRef.current = null;
            setDragged(null);
            setDropTarget(null)
        };
        const movePointer = (event: PointerEvent) => {
            const drag = pointerDrag.current;
            if (!drag) return;
            if (!drag.moving && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
            drag.moving = true;
            setDragged(drag.booking);
            const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-drop-table]');
            if (!slot) {
                dropTargetRef.current = null;
                setDropTarget(null);
                return
            }
            const bookingStart = shiftMinute(drag.booking.startTime, settings.dayStart);
            let bookingEnd = shiftMinute(drag.booking.endTime, settings.dayStart);
            if (bookingEnd <= bookingStart) bookingEnd += 1440;
            const duration = bookingEnd - bookingStart;
            const slotMinute = Number(slot.dataset.dropMinute);
            const minute = Math.max(start, Math.min(slotMinute, end - duration));
            const target = {tableId: slot.dataset.dropTable!, minute};
            dropTargetRef.current = target;
            setDropTarget(target)
        };
        const finishPointer = () => {
            const drag = pointerDrag.current;
            const target = dropTargetRef.current;
            if (!drag) return;
            if (drag.moving && target) {
                const bookingStart = shiftMinute(drag.booking.startTime, settings.dayStart);
                let bookingEnd = shiftMinute(drag.booking.endTime, settings.dayStart);
                if (bookingEnd <= bookingStart) bookingEnd += 1440;
                const duration = bookingEnd - bookingStart;
                onMove(drag.booking, target.tableId, timeFromMinutes(target.minute), timeFromMinutes(target.minute + duration))
            } else if (!drag.moving) {
                onBooking(drag.booking)
            }
            clearDrag()
        };
        window.addEventListener('pointermove', movePointer);
        window.addEventListener('pointerup', finishPointer);
        window.addEventListener('pointercancel', clearDrag);
        return () => {
            window.removeEventListener('pointermove', movePointer);
            window.removeEventListener('pointerup', finishPointer);
            window.removeEventListener('pointercancel', clearDrag)
        }
    }, [end, onBooking, onMove, settings.dayStart, start]);
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
                {active.map(t => <div key={t.id + m} data-drop-table={t.id} data-drop-minute={m} onMouseDown={e => {
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
                                      style={{height: rowH / 2}}/>)}</div>)}</div>
        <div className="pointer-events-none relative grid min-w-max" style={{
            marginLeft: 80,
            marginTop: -slots.length * rowH / 2,
            height: slots.length * rowH / 2,
            width: `max(${active.length * 180}px, calc(100% - 80px))`,
            gridTemplateColumns: `repeat(${active.length}, minmax(180px, 1fr))`
        }}>{showNow && <div className="absolute inset-x-0 z-20 border-t-2 border-red-500" style={{top: (nowOnScale - start) * ppm}}>
            <span className="absolute -left-[72px] -top-2.5 rounded bg-red-500 px-1 text-[10px] font-medium text-white">{timeFromMinutes(Math.floor(nowClock))}</span>
        </div>}{active.map(t => <div key={t.id} className="relative h-full">
            {sel?.t === t.id && <div
                className="absolute left-2 right-2 z-20 rounded-xl border border-neutral-500 bg-neutral-500/25 p-2 text-left text-xs text-neutral-800 shadow-sm"
                style={{
                    top: (Math.min(sel.s, sel.e) - start) * ppm,
                    height: (Math.max(sel.s, sel.e) - Math.min(sel.s, sel.e)) * ppm
                }}>
                <b>{timeFromMinutes(Math.min(sel.s, sel.e))} – {timeFromMinutes(Math.max(sel.s, sel.e))}</b>
            </div>}
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
            <button data-booking="1" key={b.id} onPointerDown={event => {
                if (event.button !== 0) return;
                event.preventDefault();
                pointerDrag.current = {booking: b, x: event.clientX, y: event.clientY, moving: false}
            }}
                    className={`${dragged?.id === b.id ? 'pointer-events-none opacity-25' : 'pointer-events-auto'} absolute left-2 right-2 cursor-grab touch-none overflow-hidden rounded-xl border border-neutral-300 bg-white p-2 text-left text-xs shadow-md hover:shadow-lg active:cursor-grabbing`}
                    style={{
                        top: topForTime(b.startTime, settings.dayStart, ppm),
                        height: heightForRange(b.startTime, b.endTime, ppm)
                    }} title={`${b.guestName}, ${b.guestCount} гостей, ${b.startTime}-${b.endTime}`}>
                <b>{b.startTime} {b.guestName}</b><p className="truncate text-neutral-500">{b.comment}</p>
            </button>)}</div>)}</div>
    </div>
}
