import { describe, expect, it } from 'vitest';
import { fromZoned, offsetMinutes, toZoned } from '../src/time/zone.js';
import { gregorianToDayNumber } from '../src/calendar/gregorian.js';

const utc = (s: string) => Date.parse(s);

describe('time zones via Intl', () => {
  it('offsets at specific instants, including the date-line zones', () => {
    expect(offsetMinutes('Asia/Jerusalem', utc('2026-01-15T12:00:00Z'))).toBe(120);
    expect(offsetMinutes('Asia/Jerusalem', utc('2026-07-15T12:00:00Z'))).toBe(180);
    expect(offsetMinutes('America/New_York', utc('2026-01-15T12:00:00Z'))).toBe(-300);
    expect(offsetMinutes('Australia/Sydney', utc('2026-01-15T12:00:00Z'))).toBe(660); // DST in January
    expect(offsetMinutes('Pacific/Auckland', utc('2026-01-15T12:00:00Z'))).toBe(780);
    expect(offsetMinutes('Pacific/Chatham', utc('2026-01-15T12:00:00Z'))).toBe(825); // +13:45
    expect(offsetMinutes('Asia/Kolkata', utc('2026-01-15T12:00:00Z'))).toBe(330);
  });
  it('Chatham noon on a civil date is the previous UTC day', () => {
    const t = fromZoned(gregorianToDayNumber(2026, 1, 15), 12 * 3600_000, 'Pacific/Chatham');
    expect(new Date(t).toISOString()).toBe('2026-01-14T22:15:00.000Z');
    const z = toZoned(t, 'Pacific/Chatham');
    expect([z.year, z.month, z.day, z.hour, z.minute]).toEqual([2026, 1, 15, 12, 0]);
  });
  it('spring-forward gap shifts forward; fall-back overlap takes the earlier instant', () => {
    // New York 2026-03-08 02:30 does not exist.
    const gap = fromZoned(gregorianToDayNumber(2026, 3, 8), 2.5 * 3600_000, 'America/New_York');
    expect(new Date(gap).toISOString()).toBe('2026-03-08T07:30:00.000Z'); // 03:30 EDT
    // 2026-11-01 01:30 happens twice; earlier is EDT (05:30Z).
    const overlap = fromZoned(gregorianToDayNumber(2026, 11, 1), 1.5 * 3600_000, 'America/New_York');
    expect(new Date(overlap).toISOString()).toBe('2026-11-01T05:30:00.000Z');
  });
  it('unknown zones throw', () => {
    expect(() => offsetMinutes('Not/AZone', 0)).toThrow();
  });
  it('custom provider', () => {
    expect(offsetMinutes('X', 0, () => 42)).toBe(42);
  });
});
