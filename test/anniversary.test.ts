import { describe, expect, it } from 'vitest';
import { HDate, HebrewCalendar } from '@hebcal/core';
import { anniversary, barMitzvahDate, HebrewDate, Month, isLeapYear, monthLength } from '../src/index';

describe('anniversary rules', () => {
  it('Adar of a common year in a leap year', () => {
    const death = { year: 5786, month: Month.ADAR, day: 10 };
    expect(anniversary(death, 5787, { kind: 'yahrzeit' }).month).toBe(Month.ADAR_I);
    expect(anniversary(death, 5787, { kind: 'yahrzeit', adarInLeapYear: 'adar2' }).month).toBe(Month.ADAR_II);
    expect(anniversary(death, 5787, { kind: 'birthday' }).month).toBe(Month.ADAR_II);
  });
  it('Adar I / II of a leap year in a common year is Adar', () => {
    expect(anniversary({ year: 5787, month: Month.ADAR_I, day: 5 }, 5788, { kind: 'yahrzeit' }).month).toBe(Month.ADAR);
    expect(anniversary({ year: 5787, month: Month.ADAR_II, day: 5 }, 5788, { kind: 'birthday' }).month).toBe(Month.ADAR);
    const r = anniversary({ year: 5787, month: Month.ADAR_I, day: 30 }, 5788, { kind: 'yahrzeit' });
    expect([r.month, r.day]).toEqual([Month.SHEVAT, 30]);
  });
  it('30 Cheshvan, both customs', () => {
    // Find a death year with 30 Cheshvan whose next year has only 29.
    let y = 5700;
    while (!(monthLength(y, Month.CHESHVAN) === 30 && monthLength(y + 1, Month.CHESHVAN) === 29)) y++;
    const death = { year: y, month: Month.CHESHVAN, day: 30 };
    let longYear = y + 2;
    while (monthLength(longYear, Month.CHESHVAN) !== 30) longYear++;
    // firstAnniversary: the 30th when it exists; first year was short → 29 in short years.
    const a = anniversary(death, longYear, { kind: 'yahrzeit' });
    expect([a.month, a.day]).toEqual([Month.CHESHVAN, 30]);
    const a2 = anniversary(death, y + 1, { kind: 'yahrzeit' });
    expect([a2.month, a2.day]).toEqual([Month.CHESHVAN, 29]);
    // nextMonth: the 30th when it exists.
    const b = anniversary(death, longYear, { kind: 'yahrzeit', missingThirtieth: 'nextMonth' });
    expect([b.month, b.day]).toEqual([Month.CHESHVAN, 30]);
    const c = anniversary(death, y + 1, { kind: 'birthday' });
    expect([c.month, c.day]).toEqual([Month.KISLEV, 1]);
  });
  it('bar mitzvah', () => {
    // Born in Adar of a common year (5777), bar mitzvah in a leap year (5790): Adar II.
    expect(isLeapYear(5777)).toBe(false);
    expect(isLeapYear(5790)).toBe(true);
    const b = barMitzvahDate({ year: 5777, month: Month.ADAR, day: 7 });
    expect([b.year, b.month, b.day]).toEqual([5790, Month.ADAR_II, 7]);
  });
  it('oracle: hebcal yahrzeit matches the "firstAnniversary" + Adar I options (5700–5800 deaths, 40 years)', () => {
    let checked = 0;
    for (let d = new HebrewDate(5700, 7, 1); d.year < 5800; d = d.addDays(3)) {
      for (let target = d.year + 1; target <= d.year + 40; target += 3) {
        const ours = anniversary(d, target, { kind: 'yahrzeit', adarInLeapYear: 'adar1', missingThirtieth: 'firstAnniversary' });
        const theirs = HebrewCalendar.getYahrzeit(target, new HDate(d.day, d.month, d.year));
        if (!theirs) continue;
        const t = new HDate(theirs);
        expect([ours.year, ours.month, ours.day], `${d} → ${target}`).toEqual([t.getFullYear(), t.getMonth(), t.getDate()]);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(10000);
  });
});
