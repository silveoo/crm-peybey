import {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {bookingSchema, BookingFormInput, BookingFormValues} from '../booking.schema';
import {Booking} from '../booking.types';
import {RestaurantTable} from '../../tables/table.types';
import {Button} from '../../../components/ui/Button';
import {Input} from '../../../components/ui/Input';
import {Client} from '../../clients/client.types';
import {formatPhone, PHONE_PATTERN} from '../../../lib/phone';
import {PhoneInput} from '../../../components/ui/PhoneInput';

export function BookingDialog({initial, tables, clients, onClose, onSave, onDelete}: {
    initial: Partial<BookingFormValues> & Partial<Booking>;
    tables: RestaurantTable[];
    clients: Client[];
    onClose: () => void;
    onSave: (v: BookingFormValues) => Promise<void>;
    onDelete?: () => Promise<void>
}) {
    const [dirtyClose, setDirtyClose] = useState(false);
    const [saving, setSaving] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {errors, isDirty},
        reset,
        control,
        getValues,
        setValue
    } = useForm<BookingFormInput, unknown, BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            tableId: initial.tableId ?? '',
            bookingDate: initial.bookingDate ?? '',
            startTime: initial.startTime ?? '09:00',
            endTime: initial.endTime ?? '10:00',
            guestName: initial.guestName ?? '',
            phone: initial.phone ? formatPhone(initial.phone) : '+7',
            guestCount: initial.guestCount ?? 2,
            comment: initial.comment ?? '',
            status: initial.status ?? 'confirmed'
        }
    });
    useEffect(() => {
        reset(undefined, {keepValues: true})
    }, [reset]);
    const close = () => {
        if (isDirty && !dirtyClose) {
            setDirtyClose(true);
            return
        }
        onClose()
    };
    return <div onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
    }} className="fixed inset-0 z-50 flex justify-end bg-black/20">
        <form onSubmit={handleSubmit(async v => {
            setSaving(true);
            try {
                await onSave(v);
                onClose()
            } finally {
                setSaving(false)
            }
        })} className="h-full w-[440px] overflow-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><h2
                className="text-xl font-semibold">{initial.id ? 'Бронь' : 'Новая бронь'}</h2>
                <button type="button" onClick={close}>✕</button>
            </div>
            {dirtyClose &&
                <p className="mb-3 rounded bg-amber-50 p-2 text-sm">Есть несохранённые изменения. Нажмите закрыть ещё
                    раз.</p>}
            <div className="space-y-3"><label>Стол<select
                className="w-full rounded-lg border p-2" {...register('tableId')}>{tables.filter(t => t.isActive || t.id === initial.tableId).map(t =>
                <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><Input
                type="date" {...register('bookingDate')}/>
                <div className="grid grid-cols-2 gap-2"><Input type="time" step={900} {...register('startTime')}/><Input
                    type="time" step={900} {...register('endTime')}/></div>
                <Input placeholder="Имя гостя" {...register('guestName')}/><Controller name="phone" control={control}
                    render={({field}) => <PhoneInput {...field} value={field.value ?? '+7'}
                                               placeholder="+7 (___) ___-__-__" onValueChange={phone => {
                        field.onChange(phone);
                        if (!PHONE_PATTERN.test(phone)) return;
                        const client = clients.find(item => item.phone === phone);
                        if (client?.name && !getValues('guestName')?.trim()) {
                            setValue('guestName', client.name, {shouldDirty: true, shouldValidate: true})
                        }
                        if (client?.note && !getValues('comment')?.trim()) {
                            setValue('comment', client.note, {shouldDirty: true})
                        }
                    }}/>} /><Input type="number"
                                                                         min={1} {...register('guestCount')}/><textarea
                    className="w-full rounded-lg border p-2" placeholder="Комментарий" {...register('comment')}/><select
                    className="w-full rounded-lg border p-2" {...register('status')}>
                    <option value="confirmed">Подтверждена</option>
                    <option value="pending">Ожидает</option>
                    <option value="seated">Посажены</option>
                    <option value="completed">Завершена</option>
                    <option value="cancelled">Отменена</option>
                </select>{Object.values(errors).map((e, i) => <p className="text-sm text-red-600"
                                                                 key={i}>{e?.message}</p>)}{initial.createdAt && <div
                    className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">Создана: {initial.createdAt}<br/>Изменена: {initial.updatedAt}
                </div>}<Button disabled={saving}
                               className="w-full bg-neutral-900 text-white">Сохранить</Button>{initial.id && <Button
                    type="button" onClick={onDelete} className="w-full text-red-600">Удалить</Button>}</div>
        </form>
    </div>
}
