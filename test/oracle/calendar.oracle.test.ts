// Oracle: @hebcal/core (GPL-2.0-or-later), used only as an independent check. Never imported by src/.
import { describe, expect, it } from 'vitest';
import { HDate, Molad } from '@hebcal/core';
import { dayNumberToHebrew, roshHashana, daysInYear, hebrewToDayNumber, monthsInOrder } from '../../src/calendar/hebrew.js';
import { molad } from '../../src/calendar/molad.js';
import { dayNumberToGregorian, gregorianToDayNumber } from '../../src/calendar/gregorian.js';

describe('calendar vs hebcal, every day 1900–2240', () => {
  it('Gregorian → Hebrew agrees', () => {
    const first = gregorianToDayNumber(1900, 1, 1);
    const last = gregorianToDayNumber(2240, 12, 31);
    let mismatches = 0;
    let count = 0;
    for (let n = first; n <= last; n += 1) {
      const g = dayNumberToGregorian(n);
      const h = new HDate(new Date(g.year, g.month - 1, g.day));
      const ours = dayNumberToHebrew(n);
      count += 1;
      if (h.getFullYear() !== ours.year || h.getMonth() !== ours.month || h.getDate() !== ours.day) mismatches += 1;
    }
    expect(count).toBeGreaterThan(124_000);
    expect(mismatches).toBe(0);
  });

  it('year lengths and Rosh Hashana agree, years 3000–7000', () => {
    for (let y = 3000; y <= 7000; y += 1) {
      expect(daysInYear(y)).toBe(HDate.daysInYear(y));
      const rh = new HDate(1, 7, y).greg();
      expect(dayNumberToGregorian(roshHashana(y))).toEqual({
        year: rh.getFullYear(),
        month: rh.getMonth() + 1,
        day: rh.getDate(),
      });
    }
  });

  it('Hebrew → Gregorian agrees for 15 Nisan over 5660–6000', () => {
    for (let y = 5660; y <= 6000; y += 1) {
      const g = new HDate(15, 1, y).greg();
      expect(dayNumberToGregorian(hebrewToDayNumber(y, 1, 15))).toEqual({
        year: g.getFullYear(),
        month: g.getMonth() + 1,
        day: g.getDate(),
      });
    }
  });

  it('molad agrees for every month 5660–6000', () => {
    for (let y = 5660; y <= 6000; y += 1) {
      for (const m of monthsInOrder(y)) {
        const theirs = new Molad(y, m);
        const ours = molad(y, m);
        expect([ours.civilDayOfWeek, ours.civilHour, ours.minutes, ours.chalakimAfterMinute]).toEqual([
          theirs.getDow(),
          theirs.getHour(),
          theirs.getMinutes(),
          theirs.getChalakim(),
        ]);
      }
    }
  });
});
