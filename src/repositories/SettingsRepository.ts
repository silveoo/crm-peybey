export interface AppSettings {
    restaurantName: string;
    dayStart: string;
    dayEnd: string;
    stepMinutes: 15 | 30 | 60;
    showCompleted: boolean
}

export interface SettingsRepository {
    get(): Promise<AppSettings>;

    save(s: AppSettings): Promise<AppSettings>
}
