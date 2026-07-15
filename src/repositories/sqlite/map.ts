import {Booking} from '../../features/bookings/booking.types';
import {RestaurantTable} from '../../features/tables/table.types';
import {Client} from '../../features/clients/client.types';

export type BookingRow = {
    id: string;
    table_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    guest_name: string;
    phone: string | null;
    guest_count: number;
    comment: string | null;
    status: Booking['status'];
    created_at: string;
    updated_at: string
};
export const mapBooking = (r: BookingRow): Booking => ({
    id: r.id,
    tableId: r.table_id,
    bookingDate: r.booking_date,
    startTime: r.start_time,
    endTime: r.end_time,
    guestName: r.guest_name,
    phone: r.phone ?? '',
    guestCount: r.guest_count,
    comment: r.comment ?? '',
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at
});
export type TableRow = {
    id: string;
    name: string;
    sort_order: number;
    is_active: number;
    created_at: string;
    updated_at: string
};
export const mapTable = (r: TableRow): RestaurantTable => ({
    id: r.id,
    name: r.name,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    updatedAt: r.updated_at
});
export type ClientRow = {
    id: string;
    name: string;
    phone: string;
    note: string;
    created_at: string;
    updated_at: string;
};
export const mapClient = (r: ClientRow): Client => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at
});
