import {getDb} from '../../lib/database';
import {AppSettings, SettingsRepository} from '../SettingsRepository';

const defaults: AppSettings = {
    restaurantName: 'Peybey CRM',
    dayStart: '09:00',
    dayEnd: '23:00',
    stepMinutes: 30,
    showCompleted: true
};

export class SqliteSettingsRepository implements SettingsRepository {
    async get() {
        const db = await getDb();
        const rows = await db.select<{ key: string; value: string }[]>('select key,value from app_settings');
        const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
        return {
            ...defaults,
            restaurantName: map.restaurantName ?? defaults.restaurantName,
            dayStart: map.dayStart ?? defaults.dayStart,
            dayEnd: map.dayEnd ?? defaults.dayEnd,
            stepMinutes: Number(map.stepMinutes ?? defaults.stepMinutes) as 15 | 30 | 60,
            showCompleted: (map.showCompleted ?? 'true') === 'true'
        }
    }

    async save(s: AppSettings) {
        const db = await getDb();
        for (const [k, v] of Object.entries(s)) await db.execute('insert into app_settings(key,value) values($1,$2) on conflict(key) do update set value=excluded.value', [k, String(v)]);
        return s
    }
}
