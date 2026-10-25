import { describe, expect, it } from 'vitest';
import { anniversary, barMitzvahDate, Month, isLeapYear, monthLength } from '../src/index';

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
  it('born 30 Adar I, birthday in a common year: 1 Nisan (Magen Avraham 55:10; Mishna Berura 55:45)', () => {
    const birth = { year: 5784, month: Month.ADAR_I, day: 30 };
    expect(isLeapYear(5784)).toBe(true);
    expect(isLeapYear(5797)).toBe(false);
    const b = barMitzvahDate(birth);
    expect([b.year, b.month, b.day]).toEqual([5797, Month.NISAN, 1]);
    // A yahrzeit keeps 30 Shevat (unchanged).
    const y = anniversary(birth, 5797, { kind: 'yahrzeit' });
    expect([y.month, y.day]).toEqual([Month.SHEVAT, 30]);
  });
  it('born in Adar I, birthday in a leap year: Adar I (Levush, default) or Adar II (Magen Avraham 55:10)', () => {
    const birth = { year: 5784, month: Month.ADAR_I, day: 15 };
    expect(isLeapYear(5790)).toBe(true);
    const def = anniversary(birth, 5790, { kind: 'birthday' });
    expect([def.month, def.day]).toEqual([Month.ADAR_I, 15]);
    const lev = anniversary(birth, 5790, { kind: 'birthday', adarI: 'levush' });
    expect([lev.month, lev.day]).toEqual([Month.ADAR_I, 15]);
    const ma = anniversary(birth, 5790, { kind: 'birthday', adarI: 'magen-avraham' });
    expect([ma.month, ma.day]).toEqual([Month.ADAR_II, 15]);
    // 30 Adar I under the Magen Avraham: Adar II has 29 days, so 1 Nisan.
    const ma30 = anniversary({ year: 5784, month: Month.ADAR_I, day: 30 }, 5790, { kind: 'birthday', adarI: 'magen-avraham' });
    expect([ma30.month, ma30.day]).toEqual([Month.NISAN, 1]);
    // Born in Adar II: Adar II either way.
    const a2 = anniversary({ year: 5784, month: Month.ADAR_II, day: 15 }, 5790, { kind: 'birthday', adarI: 'magen-avraham' });
    expect([a2.month, a2.day]).toEqual([Month.ADAR_II, 15]);
    // A yahrzeit ignores the option: Adar I.
    const yz = anniversary(birth, 5790, { kind: 'yahrzeit', adarI: 'magen-avraham' });
    expect(yz.month).toBe(Month.ADAR_I);
    // Bar mitzvah passes the option through (5782 and 5795 are both leap years).
    expect(isLeapYear(5782) && isLeapYear(5795)).toBe(true);
    const bm = barMitzvahDate({ year: 5782, month: Month.ADAR_I, day: 15 }, 13, { adarI: 'magen-avraham' });
    expect([bm.year, bm.month, bm.day]).toEqual([5795, Month.ADAR_II, 15]);
    const bmDefault = barMitzvahDate({ year: 5782, month: Month.ADAR_I, day: 15 });
    expect([bmDefault.year, bmDefault.month, bmDefault.day]).toEqual([5795, Month.ADAR_I, 15]);
  });
});
