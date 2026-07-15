import {getDb} from '../../lib/database';
import {nowIso} from '../../lib/dates';
import {BookingRepository} from '../BookingRepository';
import {Booking, BookingInput} from '../../features/bookings/booking.types';
import {mapBooking, BookingRow} from './map';
import {DomainError} from '../../lib/errors';

const id = () => crypto.randomUUID();

export class SqliteBookingRepository implements BookingRepository {
    async assertAvailable(input: BookingInput, exclude?: string) {
        const db = await getDb();
        const t = await db.select<{
            is_active: number
        }[]>('select is_active from restaurant_tables where id=$1', [input.tableId]);
        if (!t[0]?.is_active) throw new DomainError('Нельзя создать бронь для отключённого стола');
        const rows = await db.select<{
            c: number
        }[]>('select count(*) c from bookings where table_id=$1 and booking_date=$2 and status<>\'cancelled\' and id<>$3 and start_time < $4 and end_time > $5', [input.tableId, input.bookingDate, exclude ?? '', input.endTime, input.startTime]);
        if ((rows[0]?.c ?? 0) > 0) throw new DomainError('На выбранном столе уже есть бронь на это время')
    }

    async listByDate(date: string) {
        const db = await getDb();
        return (await db.select<BookingRow[]>('select * from bookings where booking_date=$1 order by start_time', [date])).map(mapBooking)
    }

    async create(input: BookingInput) {
        await this.assertAvailable(input);
        const db = await getDb();
        const n = nowIso(), bid = id();
        await db.execute('insert into bookings(id,table_id,booking_date,start_time,end_time,guest_name,phone,guest_count,comment,status,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', [bid, input.tableId, input.bookingDate, input.startTime, input.endTime, input.guestName, input.phone, input.guestCount, input.comment, input.status, n, n]);
        return {...input, id: bid, createdAt: n, updatedAt: n}
    }

    async update(bid: string, input: BookingInput) {
        await this.assertAvailable(input, bid);
        const db = await getDb();
        const n = nowIso();
        await db.execute('update bookings set table_id=$1,booking_date=$2,start_time=$3,end_time=$4,guest_name=$5,phone=$6,guest_count=$7,comment=$8,status=$9,updated_at=$10 where id=$11', [input.tableId, input.bookingDate, input.startTime, input.endTime, input.guestName, input.phone, input.guestCount, input.comment, input.status, n, bid]);
        const rows = await db.select<BookingRow[]>('select * from bookings where id=$1', [bid]);
        return mapBooking(rows[0])
    }

    async delete(bid: string) {
        const db = await getDb();
        await db.execute('delete from bookings where id=$1', [bid])
    }

    async addDemo(date: string, tableIds: string[]) {
        for (const [i, t] of tableIds.entries()) await this.create({
            tableId: t,
            bookingDate: date,
            startTime: `${String(10 + i).padStart(2, '0')}:00`,
            endTime: `${String(11 + i).padStart(2, '0')}:30`,
            guestName: `Гость ${i + 1}`,
            phone: '',
            guestCount: 2 + i,
            comment: 'Демонстрационная бронь',
            status: 'confirmed'
        })
    }
}
