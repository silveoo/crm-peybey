import {expect, it} from 'vitest';
import {bookingSchema} from '../booking.schema';

it('validates booking form', () => {
    expect(bookingSchema.safeParse({
        tableId: 't',
        bookingDate: '2026-07-15',
        startTime: '10:00',
        endTime: '11:00',
        guestName: 'Иван',
        phone: '',
        guestCount: 2,
        comment: '',
        status: 'confirmed'
    }).success).toBe(true);
    expect(bookingSchema.safeParse({
        tableId: 't',
        bookingDate: '2026-07-15',
        startTime: '11:00',
        endTime: '10:00',
        guestName: '',
        guestCount: 0,
        status: 'confirmed'
    }).success).toBe(false)
});

it('allows an empty phone and requires a complete started phone', () => {
    const booking = {
        tableId: 't', bookingDate: '2026-07-15', startTime: '10:00', endTime: '11:00',
        guestName: 'Иван', guestCount: 2, comment: '', status: 'confirmed' as const
    };
    expect(bookingSchema.parse({...booking, phone: '+7'}).phone).toBe('');
    expect(bookingSchema.safeParse({...booking, phone: '+7 (999) 12'}).success).toBe(false);
    expect(bookingSchema.parse({...booking, phone: '89991234567'}).phone).toBe('+7 (999) 123-45-67')
});
