import {addDays, format, parseISO} from 'date-fns';
import {useState} from 'react';
import {Button} from '../components/ui/Button';
import {useAppStore} from '../store/appStore';
import {CalendarBoard} from '../features/calendar/components/CalendarBoard';
import {BookingDialog} from '../features/bookings/forms/BookingDialog';
import {Booking, BookingInput} from '../features/bookings/booking.types';
import {bookingService} from '../app/providers';
import {todayIso, displayDate} from '../lib/dates';
import {toUserMessage} from '../lib/errors';
import {minutesFromTime, overlaps, timeFromMinutes} from '../features/calendar/calendar.utils';

export function CalendarPage({reload}: { reload: () => Promise<void> }) {
    const s = useAppStore();
    const [edit, setEdit] = useState<Partial<Booking> | null>(null);
    const [pendingMove, setPendingMove] = useState<{
        booking: Booking;
        tableId: string;
        startTime: string;
        endTime: string
    } | null>(null);
    const save = async (v: BookingInput) => {
        try {
            const clientNote = s.clients.find(client => client.phone === v.phone)?.note;
            const input = {...v, comment: v.comment.trim() || clientNote || ''};
            if (edit?.id) await bookingService.update(edit.id, input, s.settings!); else await bookingService.create(input, s.settings!);
            s.set({toast: 'Бронь сохранена'});
            await reload()
        } catch (e) {
            s.set({toast: toUserMessage(e)});
            throw e
        }
    };
    const move = (booking: Booking, tableId: string, startTime: string, endTime: string) => {
        if (booking.tableId === tableId && booking.startTime === startTime) return;
        const conflict = s.bookings.some(item => item.id !== booking.id && item.tableId === tableId &&
            item.status !== 'cancelled' && overlaps(item.startTime, item.endTime, startTime, endTime));
        if (conflict) {
            s.set({toast: 'На выбранном столе уже есть бронь на это время'});
            return
        }
        setPendingMove({booking, tableId, startTime, endTime})
    };
    const confirmMove = async () => {
        if (!pendingMove) return;
        const {booking, tableId, startTime, endTime} = pendingMove;
        try {
            await bookingService.update(booking.id, {...booking, tableId, startTime, endTime}, s.settings!);
            s.set({toast: 'Бронь перенесена'});
            setPendingMove(null);
            await reload()
        } catch (e) {
            s.set({toast: toUserMessage(e)})
        }
    };
    return <div className="flex h-full flex-col p-5">
        <header className="mb-4 flex items-center justify-between">
            <div><h1 className="text-2xl font-semibold">Календарь</h1><p
                className="text-neutral-500">{displayDate(s.date)} {s.date === todayIso() ? '· текущая смена' : ''}</p></div>
            <div className="flex gap-2"><Button
                onClick={() => s.set({date: format(addDays(parseISO(s.date), -1), 'yyyy-MM-dd')})}>←</Button><Button
                onClick={() => s.set({date: todayIso()})}>Текущая смена</Button><Button
                onClick={() => s.set({date: format(addDays(parseISO(s.date), 1), 'yyyy-MM-dd')})}>→</Button><Button
                className="bg-neutral-900 text-white" onClick={() => setEdit({
                bookingDate: s.date,
                startTime: s.settings!.dayStart,
                endTime: timeFromMinutes(minutesFromTime(s.settings!.dayStart) + 60),
                tableId: s.tables.find(t => t.isActive)?.id
            })}>Новая бронь</Button></div>
        </header>
        {s.settings && <CalendarBoard date={s.date} tables={s.tables} bookings={s.bookings} settings={s.settings}
                                      onSlot={(tableId, startTime, endTime) => setEdit({
                                          tableId,
                                          bookingDate: s.date,
                                          startTime,
                                          endTime,
                                          status: 'confirmed',
                                          guestCount: 2
                                      })} onBooking={setEdit} onMove={move}/>} {edit &&
        <BookingDialog initial={edit} tables={s.tables} clients={s.clients} onClose={() => setEdit(null)} onSave={save}
                       onDelete={edit.id ? async () => {
                           if (confirm('Удалить бронь?')) {
                               await bookingService.delete(edit.id!);
                               setEdit(null);
                               await reload()
                           }
                       } : undefined}/>} {pendingMove && <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="move-booking-title"
             className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="move-booking-title" className="text-lg font-semibold">Перенести бронь?</h2>
            <p className="mt-3 text-sm text-neutral-600">
                Бронь гостя <b>{pendingMove.booking.guestName}</b> будет перенесена с
                {' '}{pendingMove.booking.startTime}–{pendingMove.booking.endTime} на
                {' '}{pendingMove.startTime}–{pendingMove.endTime}.
            </p>
            <div className="mt-6 flex justify-end gap-2">
                <Button onClick={() => setPendingMove(null)}>Отмена</Button>
                <Button className="bg-neutral-900 text-white" onClick={confirmMove}>Перенести</Button>
            </div>
        </div>
    </div>}</div>
}
