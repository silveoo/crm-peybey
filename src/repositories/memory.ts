import { Booking, BookingInput } from '../features/bookings/booking.types';
import { RestaurantTable, TableInput } from '../features/tables/table.types';
import { overlaps } from '../features/calendar/calendar.utils';
import { nowIso } from '../lib/dates';
import { DomainError } from '../lib/errors';
import { BookingRepository } from './BookingRepository';
import { AppSettings, SettingsRepository } from './SettingsRepository';
import { TableRepository } from './TableRepository';

const createId = () => crypto.randomUUID();
const stamp = nowIso();

let tables: RestaurantTable[] = [1, 2, 3, 4].map((n) => ({
  id: `demo-table-${n}`,
  name: `Стол ${n}`,
  sortOrder: n,
  isActive: true,
  createdAt: stamp,
  updatedAt: stamp,
}));

let bookings: Booking[] = [];
let settings: AppSettings = {
  restaurantName: 'Peybey CRM',
  dayStart: '09:00',
  dayEnd: '23:00',
  stepMinutes: 30,
  showCompleted: true,
};

export class MemoryTableRepository implements TableRepository {
  async list() {
    return [...tables];
  }

  async create(input: TableInput) {
    const now = nowIso();
    const table: RestaurantTable = { id: createId(), ...input, createdAt: now, updatedAt: now };
    tables = [...tables, table];
    return table;
  }

  async update(id: string, input: TableInput) {
    const now = nowIso();
    const table = { id, ...input, updatedAt: now, createdAt: tables.find((t) => t.id === id)?.createdAt ?? now };
    tables = tables.map((t) => (t.id === id ? table : t));
    return table;
  }

  async delete(id: string) {
    if (bookings.some((b) => b.tableId === id && b.status !== 'cancelled' && b.bookingDate >= new Date().toISOString().slice(0, 10))) {
      throw new DomainError('Нельзя удалить стол с будущими бронями');
    }
    tables = tables.filter((t) => t.id !== id);
  }
}

export class MemoryBookingRepository implements BookingRepository {
  async listByDate(date: string) {
    return bookings.filter((b) => b.bookingDate === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  private assertAvailable(input: BookingInput, exclude = '') {
    const table = tables.find((t) => t.id === input.tableId);
    if (!table?.isActive) throw new DomainError('Нельзя создать бронь для отключённого стола');
    const conflict = bookings.some(
      (b) =>
        b.id !== exclude &&
        b.tableId === input.tableId &&
        b.bookingDate === input.bookingDate &&
        b.status !== 'cancelled' &&
        overlaps(b.startTime, b.endTime, input.startTime, input.endTime),
    );
    if (conflict) throw new DomainError('На выбранном столе уже есть бронь на это время');
  }

  async create(input: BookingInput) {
    this.assertAvailable(input);
    const now = nowIso();
    const booking: Booking = { id: createId(), ...input, createdAt: now, updatedAt: now };
    bookings = [...bookings, booking];
    return booking;
  }

  async update(id: string, input: BookingInput) {
    this.assertAvailable(input, id);
    const now = nowIso();
    const booking: Booking = { id, ...input, createdAt: bookings.find((b) => b.id === id)?.createdAt ?? now, updatedAt: now };
    bookings = bookings.map((b) => (b.id === id ? booking : b));
    return booking;
  }

  async delete(id: string) {
    bookings = bookings.filter((b) => b.id !== id);
  }

  async addDemo(date: string, tableIds: string[]) {
    for (const [i, tableId] of tableIds.entries()) {
      await this.create({
        tableId,
        bookingDate: date,
        startTime: `${String(10 + i).padStart(2, '0')}:00`,
        endTime: `${String(11 + i).padStart(2, '0')}:30`,
        guestName: `Гость ${i + 1}`,
        phone: '',
        guestCount: 2 + i,
        comment: 'Демонстрационная бронь для браузерного dev-режима',
        status: 'confirmed',
      });
    }
  }
}

export class MemorySettingsRepository implements SettingsRepository {
  async get() {
    return settings;
  }

  async save(next: AppSettings) {
    settings = next;
    return settings;
  }
}
