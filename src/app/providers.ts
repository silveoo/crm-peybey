import {isTauriRuntime} from '../lib/runtime';
import {MemoryBookingRepository, MemorySettingsRepository, MemoryTableRepository} from '../repositories/memory';
import {SqliteBookingRepository} from '../repositories/sqlite/SqliteBookingRepository';
import {SqliteSettingsRepository} from '../repositories/sqlite/SqliteSettingsRepository';
import {SqliteTableRepository} from '../repositories/sqlite/SqliteTableRepository';
import {BookingService} from '../services/BookingService';
import {TableService} from '../services/TableService';

export const tableRepo = isTauriRuntime() ? new SqliteTableRepository() : new MemoryTableRepository();
export const bookingRepo = isTauriRuntime() ? new SqliteBookingRepository() : new MemoryBookingRepository();
export const settingsRepo = isTauriRuntime() ? new SqliteSettingsRepository() : new MemorySettingsRepository();
export const tableService = new TableService(tableRepo);
export const bookingService = new BookingService(bookingRepo);
