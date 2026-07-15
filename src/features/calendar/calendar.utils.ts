import {RestaurantTable} from '../tables/table.types';

export const minutesFromTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m
};
export const timeFromMinutes = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export const isEndAfterStart = (start: string, end: string) => minutesFromTime(end) > minutesFromTime(start);
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => minutesFromTime(aStart) < minutesFromTime(bEnd) && minutesFromTime(bStart) < minutesFromTime(aEnd);
export const topForTime = (time: string, dayStart: string, pxPerMinute: number) => Math.max(0, (minutesFromTime(time) - minutesFromTime(dayStart)) * pxPerMinute);
export const heightForRange = (start: string, end: string, pxPerMinute: number) => Math.max(0, (minutesFromTime(end) - minutesFromTime(start)) * pxPerMinute);
export const sortTables = (tables: RestaurantTable[]) => [...tables].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));
export const snapMinutes = (minutes: number, step: number) => Math.floor(minutes / step) * step;
