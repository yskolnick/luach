import { describe, expect, it } from 'vitest';
import { holidayName, holidaysInYear, holidaysOn, roshChodeshDays } from '../src/holidays/holidays.js';
import { dayOfWeek, gregorianToDayNumber } from '../src/calendar/gregorian.js';
import { ADAR_I, CHESHVAN, KISLEV, TISHREI, hebrewToDayNumber } from '../src/calendar/hebrew.js';

const g = (y: number, m: number, d: number) => gregorianToDayNumber(y, m, d);
const ids = (n: number, location: 'israel' | 'diaspora' = 'diaspora') => holidaysOn(n, { location }).map((h) => h.id);

describe('holidays', () => {
  it('Israel keeps one day of Yom Tov, the diaspora two', () => {
    // Pesach 5787 begins Thursday 22 April 2027.
    expect(ids(g(2027, 4, 23), 'israel')).toContain('chol-hamoed-pesach');
    expect(ids(g(2027, 4, 23), 'diaspora')).toContain('pesach-2');
    expect(ids(g(2027, 4, 29), 'israel')).toContain('isru-chag-pesach');
    expect(ids(g(2027, 4, 29), 'diaspora')).toContain('pesach-8');
  });

  it('no fast falls on Shabbos except Yom Kippur (property, 5660–6000)', () => {
    for (let y = 5660; y <= 6000; y += 1) {
      for (const location of ['israel', 'diaspora'] as const) {
        for (const h of holidaysInYear(y, { location, behab: true, yomKippurKatan: true })) {
          if (h.fast && h.id !== 'yom-kippur') expect(dayOfWeek(h.dayNumber)).not.toBe(6);
        }
      }
    }
  });

  it('Asara B\'Teves can fall on Friday and is not moved', () => {
    const fridays = [];
    for (let y = 5660; y <= 6000; y += 1) {
      const h = holidaysInYear(y, { location: 'diaspora' }).find((x) => x.id === 'asara-beteves')!;
      if (dayOfWeek(h.dayNumber) === 5) fridays.push(y);
      expect(h.postponed).toBe(false);
    }
    expect(fridays.length).toBeGreaterThan(10);
  });

  it('Chanukah: eight days from 25 Kislev; candles tonight 1…8', () => {
    const c = holidaysInYear(5787, { location: 'diaspora' }).filter((h) => h.id === 'chanukah' || h.id === 'erev-chanukah');
    expect(c[0].id).toBe('erev-chanukah');
    expect(c.map((h) => h.candlesTonight ?? 0)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    expect(c[1].dayNumber).toBe(hebrewToDayNumber(5787, KISLEV, 25));
  });

  it('Rosh Chodesh is two days after a 30-day month', () => {
    expect(roshChodeshDays(5787, CHESHVAN)).toEqual([hebrewToDayNumber(5787, TISHREI, 30), hebrewToDayNumber(5787, CHESHVAN, 1)]);
    expect(roshChodeshDays(5787, TISHREI)).toEqual([]);
  });

  it('Purim Katan only in leap years', () => {
    expect(holidaysInYear(5787, { location: 'diaspora' }).some((h) => h.id === 'purim-katan')).toBe(true); // leap
    expect(holidaysInYear(5786, { location: 'diaspora' }).some((h) => h.id === 'purim-katan')).toBe(false);
    expect(holidaysInYear(5787, { location: 'diaspora' }).find((h) => h.id === 'purim-katan')!.date.month).toBe(ADAR_I);
  });

  it('optional customs are off by default', () => {
    const all = holidaysInYear(5787, { location: 'diaspora' });
    expect(all.some((h) => h.optional)).toBe(false);
    const withCustoms = holidaysInYear(5787, { location: 'diaspora', behab: true, yomKippurKatan: true, shovavim: true, leilSelichos: true, modernIsraeli: true });
    expect(withCustoms.filter((h) => h.id === 'behab')).toHaveLength(6);
    expect(withCustoms.filter((h) => h.id === 'shovavim')).toHaveLength(8); // leap year: Shovavim Tat
    expect(withCustoms.some((h) => h.id === 'yom-haatzmaut')).toBe(true);
  });

  it('BeHaB: Monday, Thursday, Monday after the first Shabbos after Rosh Chodesh', () => {
    const b = holidaysInYear(5787, { location: 'diaspora', behab: true }).filter((h) => h.id === 'behab');
    expect(b.map((h) => dayOfWeek(h.dayNumber))).toEqual([1, 4, 1, 1, 4, 1]);
  });

  it('names in four styles', () => {
    const rc = holidaysInYear(5787, { location: 'diaspora' }).find((h) => h.id === 'rosh-chodesh' && h.month === KISLEV)!;
    expect(holidayName(rc, 'ashkenazi')).toBe('Rosh Chodesh Kislev');
    expect(holidayName(rc, 'he')).toBe('ראש חודש כסלו');
    const ch3 = holidaysInYear(5787, { location: 'diaspora' }).find((h) => h.id === 'chanukah' && h.day === 3)!;
    expect(holidayName(ch3, 'he')).toBe('חנוכה ג׳');
    expect(holidayName(ch3)).toBe('Hanukkah: day 3');
  });
});
