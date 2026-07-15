export interface AppSettings {
    restaurantName: string;
    dayStart: string;
    dayEnd: string;
}

export interface SettingsRepository {
    get(): Promise<AppSettings>;

    save(s: AppSettings): Promise<AppSettings>
}
