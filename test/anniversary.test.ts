import { describe, expect, it } from 'vitest';
import { ADAR, ADAR_I, ADAR_II, CHESHVAN, KISLEV, NISAN, SHVAT, TEVES, daysInMonth, isLeapYear } from '../src/calendar/hebrew.js';
import { hebrewBirthday, yahrzeit } from '../src/calendar/anniversary.js';

const dates = (r: { date: { year: number; month: number; day: number }; custom: string }[]) =>
  r.map((x) => [x.date.month, x.date.day, x.custom]);

describe('yahrzeit', () => {
  it('ordinary date carries over', () => {
    expect(dates(yahrzeit({ year: 5780, month: NISAN, day: 3 }, 5787))).toEqual([[NISAN, 3, 'plain']]);
  });
  it('Adar of a common year → leap year: both customs by default, labelled', () => {
    expect(isLeapYear(5784)).toBe(true);
    expect(dates(yahrzeit({ year: 5783, month: ADAR, day: 7 }, 5784))).toEqual([
      [ADAR_I, 7, 'rema'],
      [ADAR_II, 7, 'mechaber'],
    ]);
    expect(dates(yahrzeit({ year: 5783, month: ADAR, day: 7 }, 5784, { adar: 'mechaber' }))).toEqual([[ADAR_II, 7, 'mechaber']]);
  });
  it('Adar II of a leap year stays in Adar II; Adar in a common year', () => {
    expect(dates(yahrzeit({ year: 5784, month: ADAR_II, day: 7 }, 5787))).toEqual([[ADAR_II, 7, 'plain']]); // 5787 is leap
    expect(dates(yahrzeit({ year: 5784, month: ADAR_II, day: 7 }, 5786))).toEqual([[ADAR, 7, 'plain']]);
  });
  it('30 Adar I in a common year is 30 Shvat (Mishna Berura 568:42)', () => {
    expect(dates(yahrzeit({ year: 5784, month: ADAR_I, day: 30 }, 5785))).toEqual([[SHVAT, 30, 'plain']]);
  });
  it('30 Cheshvan, Magen Avraham 568:20', () => {
    // Find a death year with 30 Cheshvan whose next year has a short Cheshvan, and one whose next year is full.
    const withShortNext = [...Array(200).keys()].map((i) => 5600 + i).find((y) => daysInMonth(y, CHESHVAN) === 30 && daysInMonth(y + 1, CHESHVAN) === 29)!;
    const withFullNext = [...Array(200).keys()].map((i) => 5600 + i).find((y) => daysInMonth(y, CHESHVAN) === 30 && daysInMonth(y + 1, CHESHVAN) === 30)!;
    const shortLater = [...Array(30).keys()].map((i) => withShortNext + 2 + i).find((y) => daysInMonth(y, CHESHVAN) === 29)!;
    const fullLater = [...Array(30).keys()].map((i) => withShortNext + 2 + i).find((y) => daysInMonth(y, CHESHVAN) === 30)!;
    // First year short → 29 Cheshvan for ever, even in full years.
    expect(dates(yahrzeit({ year: withShortNext, month: CHESHVAN, day: 30 }, fullLater))).toEqual([[CHESHVAN, 30, 'plain']]);
    expect(dates(yahrzeit({ year: withShortNext, month: CHESHVAN, day: 30 }, shortLater))).toEqual([[CHESHVAN, 29, 'magen-avraham']]);
    // First year full → Rosh Chodesh: 1 Kislev in short years.
    const shortAfterFull = [...Array(30).keys()].map((i) => withFullNext + 2 + i).find((y) => daysInMonth(y, CHESHVAN) === 29)!;
    expect(dates(yahrzeit({ year: withFullNext, month: CHESHVAN, day: 30 }, shortAfterFull))).toEqual([[KISLEV, 1, 'magen-avraham']]);
    expect(dates(yahrzeit({ year: withFullNext, month: CHESHVAN, day: 30 }, shortAfterFull, { day30: 'last-day' }))).toEqual([[CHESHVAN, 29, 'last-day']]);
  });
  it('30 Kislev → 1 Teves with next-day custom', () => {
    const y = [...Array(50).keys()].map((i) => 5780 + i).find((x) => daysInMonth(x, KISLEV) === 29)!;
    expect(dates(yahrzeit({ year: 5760, month: KISLEV, day: 30 }, y, { day30: 'next-day' }))).toEqual([[TEVES, 1, 'next-day']]);
  });
});

describe('birthday / bar mitzvah', () => {
  it('born in Adar of a common year → Adar II in a leap year (Rema OC 55:10)', () => {
    expect(dates(hebrewBirthday({ year: 5775, month: ADAR, day: 10 }, 5787))).toEqual([[ADAR_II, 10, 'plain']]);
  });
  it('born in Adar I, leap 13th year: Levush and Magen Avraham both returned', () => {
    // 5774 and 5787 are both leap years.
    expect(isLeapYear(5774) && isLeapYear(5787)).toBe(true);
    expect(dates(hebrewBirthday({ year: 5774, month: ADAR_I, day: 29 }, 5787))).toEqual([
      [ADAR_I, 29, 'levush'],
      [ADAR_II, 29, 'magen-avraham'],
    ]);
  });
  it('born on 29 Adar I, common 13th year → 29 Adar (SA OC 55:10)', () => {
    expect(isLeapYear(5771)).toBe(true);
    expect(isLeapYear(5784)).toBe(true);
    expect(isLeapYear(5785)).toBe(false);
    expect(dates(hebrewBirthday({ year: 5771, month: ADAR_I, day: 29 }, 5785))).toEqual([[ADAR, 29, 'plain']]);
  });
  it('born 30 Cheshvan, short year → 1 Kislev (MA 55:10; MB 55:45)', () => {
    const y = [...Array(50).keys()].map((i) => 5790 + i).find((x) => daysInMonth(x, CHESHVAN) === 29)!;
    const by = [...Array(50).keys()].map((i) => 5740 + i).find((x) => daysInMonth(x, CHESHVAN) === 30)!;
    expect(dates(hebrewBirthday({ year: by, month: CHESHVAN, day: 30 }, y))).toEqual([[KISLEV, 1, 'plain']]);
  });
});
