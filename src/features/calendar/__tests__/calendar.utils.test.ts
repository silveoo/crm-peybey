import {describe, expect, it} from 'vitest';
import {heightForRange, isEndAfterStart, overlaps, shiftEndMinute, sortTables, topForTime} from '../calendar.utils';

describe('calendar utils', () => {
    it('detects overlaps', () => {
        expect(overlaps('10:00', '11:00', '10:30', '11:30')).toBe(true);
        expect(overlaps('10:00', '11:00', '11:00', '12:00')).toBe(false);
        expect(overlaps('23:00', '01:00', '00:30', '02:00')).toBe(true)
    });
    it('calculates top', () => expect(topForTime('10:00', '09:00', 2)).toBe(120));
    it('calculates height', () => expect(heightForRange('10:00', '11:30', 2)).toBe(180));
    it('calculates an overnight shift', () => {
        expect(shiftEndMinute('11:00', '03:00')).toBe(1620);
        expect(topForTime('01:00', '11:00', 2)).toBe(1680);
        expect(heightForRange('23:30', '01:00', 2)).toBe(180)
    });
    it('validates end after start', () => {
        expect(isEndAfterStart('10:00', '10:30')).toBe(true);
        expect(isEndAfterStart('10:00', '10:00')).toBe(false)
    });
    it('sorts tables', () => expect(sortTables([{
        id: '2',
        name: 'Б',
        sortOrder: 2,
        isActive: true,
        createdAt: '',
        updatedAt: ''
    }, {
        id: '1',
        name: 'А',
        sortOrder: 1,
        isActive: true,
        createdAt: '',
        updatedAt: ''
    }]).map(t => t.id)).toEqual(['1', '2']))
});
