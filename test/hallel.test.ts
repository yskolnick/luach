import { describe, expect, it } from 'vitest';
import { hallel } from '../src/holidays/hallel.js';
import { hebrewToDayNumber, KISLEV, NISAN, SIVAN, TISHREI, TEVES, ADAR_II } from '../src/calendar/hebrew.js';
import * as Z from '../src/zmanim/zmanim.js';
import { TEST_CITIES } from './fixtures/cities.js';

const h = (m: number, d: number, loc: 'israel' | 'diaspora' = 'diaspora', y = 5787) => hallel(hebrewToDayNumber(y, m, d), loc);

describe('Hallel', () => {
  it('whole, half and none', () => {
    expect(h(TISHREI, 1)).toBeNull(); // Rosh Hashana
    expect(h(TISHREI, 10)).toBeNull();
    expect(h(TISHREI, 15)).toBe('whole');
    expect(h(TISHREI, 23)).toBe('whole');
    expect(h(TISHREI, 23, 'israel')).toBeNull();
    expect(h(TISHREI, 30)).toBe('half'); // Rosh Chodesh Cheshvan, day 1
    expect(h(KISLEV, 25)).toBe('whole');
    expect(h(TEVES, 2)).toBe('whole'); // 8th day of Chanukah (Kislev 5787 has 30 days? either way within 8 days)
    expect(h(ADAR_II, 14)).toBeNull(); // Purim
    expect(h(NISAN, 16)).toBe('whole');
    expect(h(NISAN, 16, 'israel')).toBe('half');
    expect(h(NISAN, 22)).toBe('half');
    expect(h(NISAN, 22, 'israel')).toBeNull();
    expect(h(SIVAN, 7)).toBe('whole');
    expect(h(SIVAN, 7, 'israel')).toBeNull();
    expect(h(NISAN, 1)).toBe('half');
  });
});

describe('horizon dip option', () => {
  it('a caller-supplied dip moves netz earlier and shkiah later', () => {
    const d = { year: 2026, month: 6, day: 1 };
    const loc = TEST_CITIES.Jerusalem;
    const a = Z.netz(d, loc, { rounding: 'none' }).time!.getTime();
    const b = Z.netz(d, loc, { rounding: 'none', horizonDip: 0.5 }).time!.getTime();
    expect(a - b).toBeGreaterThan(60_000);
    const c = Z.shkiah(d, loc, { rounding: 'none', horizonDip: 0.5 }).time!.getTime();
    expect(c).toBeGreaterThan(Z.shkiah(d, loc, { rounding: 'none' }).time!.getTime());
    // Sea-level opinions ignore it.
    expect(Z.alos72(d, loc, { rounding: 'none', horizonDip: 0.5 }).time!.getTime()).toBe(Z.alos72(d, loc, { rounding: 'none' }).time!.getTime());
  });
});
