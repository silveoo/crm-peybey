import {z} from 'zod';
import {formatPhone, PHONE_PATTERN} from '../../lib/phone';

export const clientSchema = z.object({
    name: z.string().trim().min(1, 'Укажите имя клиента'),
    phone: z.string().transform(formatPhone).refine(value => PHONE_PATTERN.test(value), 'Введите номер полностью'),
    note: z.string().trim().default('')
});
