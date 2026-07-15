import {create} from 'zustand';
import {Booking} from '../features/bookings/booking.types';
import {RestaurantTable} from '../features/tables/table.types';
import {AppSettings} from '../repositories/SettingsRepository';
import {todayIso} from '../lib/dates';
import {Client} from '../features/clients/client.types';

export type Page = 'calendar' | 'tables' | 'clients' | 'settings';

interface State {
    page: Page;
    date: string;
    tables: RestaurantTable[];
    bookings: Booking[];
    clients: Client[];
    settings: AppSettings | null;
    loading: boolean;
    error: string | null;
    toast: string | null;
    set: (p: Partial<State>) => void
}

export const useAppStore = create<State>(set => ({
    page: 'calendar',
    date: todayIso(),
    tables: [],
    bookings: [],
    clients: [],
    settings: null,
    loading: false,
    error: null,
    toast: null,
    set
}));
