import {RestaurantTable} from '../tables/table.types';

export const minutesFromTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m
};
export const timeFromMinutes = (minutes: number) => {
    const normalized = ((minutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
};
export const shiftMinute = (time: string, dayStart: string) => {
    const minute = minutesFromTime(time), start = minutesFromTime(dayStart);
    return minute < start ? minute + 1440 : minute
};
export const shiftEndMinute = (dayStart: string, dayEnd: string) => {
    const start = minutesFromTime(dayStart), end = minutesFromTime(dayEnd);
    return end <= start ? end + 1440 : end
};
export const isEndAfterStart = (start: string, end: string) => start !== end;
const normalizedRange = (start: string, end: string) => {
    const s = minutesFromTime(start), rawEnd = minutesFromTime(end);
    return [s, rawEnd <= s ? rawEnd + 1440 : rawEnd] as const
};
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
    const [as, ae] = normalizedRange(aStart, aEnd), [bs, be] = normalizedRange(bStart, bEnd);
    return [-1440, 0, 1440].some(offset => as < be + offset && bs + offset < ae)
};
export const topForTime = (time: string, dayStart: string, pxPerMinute: number) => Math.max(0, (shiftMinute(time, dayStart) - minutesFromTime(dayStart)) * pxPerMinute);
export const heightForRange = (start: string, end: string, pxPerMinute: number) => {
    const [s, e] = normalizedRange(start, end);
    return Math.max(0, (e - s) * pxPerMinute)
};
export const sortTables = (tables: RestaurantTable[]) => [...tables].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));
export const snapMinutes = (minutes: number, step: number) => Math.floor(minutes / step) * step;
