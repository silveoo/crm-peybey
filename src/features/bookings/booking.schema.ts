import {z} from 'zod';
import {isEndAfterStart} from '../calendar/calendar.utils';
import {normalizeOptionalPhone, PHONE_PATTERN} from '../../lib/phone';

export const bookingSchema = z.object({
    tableId: z.string().min(1, 'Выберите стол'),
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    guestName: z.string().min(1, 'Укажите имя гостя'),
    phone: z.string().optional().default('').transform(normalizeOptionalPhone)
        .refine(value => value === '' || PHONE_PATTERN.test(value), 'Введите номер полностью или оставьте поле пустым'),
    guestCount: z.coerce.number().positive('Количество гостей должно быть положительным'),
    comment: z.string().optional().default(''),
    status: z.enum(['confirmed', 'pending', 'seated', 'completed', 'cancelled'])
}).refine(v => isEndAfterStart(v.startTime, v.endTime), {
    message: 'Начало и окончание не могут совпадать',
    path: ['endTime']
});
export type BookingFormInput = z.input<typeof bookingSchema>;
export type BookingFormValues = z.output<typeof bookingSchema>;
