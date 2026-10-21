import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  ADAR,
  ADAR_II,
  AV,
  CHESHVAN,
  KISLEV,
  NISAN,
  TISHREI,
  daysInMonth,
  daysInYear,
  dayNumberToHebrew,
  hebrewToDayNumber,
  isLeapYear,
  isValidHebrew,
  monthsInOrder,
  roshHashana,
  yearType,
} from '../src/calendar/hebrew.js';
import {
  dayNumberToGregorian,
  dayOfWeek,
  gregorianToDayNumber,
  isValidGregorian,
} from '../src/calendar/gregorian.js';

const FIRST = gregorianToDayNumber(1900, 1, 1);
const LAST = gregorianToDayNumber(2240, 12, 31);
const years = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('Gregorian day numbers', () => {
  it('fixed points', () => {
    expect(gregorianToDayNumber(1970, 1, 1)).toBe(0);
    expect(gregorianToDayNumber(2000, 3, 1)).toBe(11017);
    expect(dayOfWeek(gregorianToDayNumber(2026, 10, 21))).toBe(3); // Wednesday
    expect(dayOfWeek(gregorianToDayNumber(1582, 10, 15))).toBe(5); // Friday, first Gregorian day
  });
  it('agrees with Date.UTC over 1900–2240', () => {
    for (let n = FIRST; n <= LAST; n += 1) {
      const g = dayNumberToGregorian(n);
      expect(Date.UTC(g.year, g.month - 1, g.day) / 86_400_000).toBe(n);
    }
  });
  it('round-trips (property, wide range)', () => {
    fc.assert(
      fc.property(fc.integer({ min: -3_000_000, max: 3_000_000 }), (n) => {
        const g = dayNumberToGregorian(n);
        return isValidGregorian(g.year, g.month, g.day) && gregorianToDayNumber(g.year, g.month, g.day) === n;
      }),
    );
  });
});

describe('Hebrew calendar invariants, 5660–6000', () => {
  const ys = years(5660, 6000);

  it('conversion round-trips for every day 1900–2240', () => {
    for (let n = FIRST; n <= LAST; n += 1) {
      const h = dayNumberToHebrew(n);
      expect(hebrewToDayNumber(h.year, h.month, h.day)).toBe(n);
    }
  });

  it('round-trips over the whole supported range (property)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9999 }), fc.nat(400), (y, k) => {
        const n = roshHashana(y) + (k % daysInYear(y));
        const h = dayNumberToHebrew(n);
        return h.year === y && hebrewToDayNumber(h.year, h.month, h.day) === n;
      }),
    );
  });

  it('year lengths are 353–355 or 383–385', () => {
    for (const y of ys) {
      const len = daysInYear(y);
      expect(isLeapYear(y) ? [383, 384, 385] : [353, 354, 355]).toContain(len);
      expect(monthsInOrder(y).reduce((s, m) => s + daysInMonth(y, m), 0)).toBe(len);
    }
  });

  it('Rosh Hashana is never on Sunday, Wednesday or Friday', () => {
    for (const y of ys) expect([1, 2, 4, 6]).toContain(dayOfWeek(roshHashana(y)));
  });

  it("at-bash: first day of Pesach falls on Tisha B'Av's weekday", () => {
    for (const y of ys) {
      expect(dayOfWeek(hebrewToDayNumber(y, NISAN, 15))).toBe(dayOfWeek(hebrewToDayNumber(y, AV, 9)));
    }
  });

  it('Yom Kippur is never Friday or Sunday', () => {
    for (const y of ys) expect([0, 5]).not.toContain(dayOfWeek(hebrewToDayNumber(y, TISHREI, 10)));
  });

  it('Purim is never Shabbos, Monday or Wednesday; Hoshana Rabba never Shabbos', () => {
    for (const y of ys) {
      const purimMonth = isLeapYear(y) ? ADAR_II : ADAR;
      expect([1, 3, 6]).not.toContain(dayOfWeek(hebrewToDayNumber(y, purimMonth, 14)));
      expect(dayOfWeek(hebrewToDayNumber(y, TISHREI, 21))).not.toBe(6);
    }
  });

  it('leap years: 7 per 19-year cycle at 3, 6, 8, 11, 14, 17, 19', () => {
    for (let c = 0; c < 400; c += 1) {
      const leaps = years(c * 19 + 1, c * 19 + 19).filter(isLeapYear).map((y) => ((y - 1) % 19) + 1);
      expect(leaps).toEqual([3, 6, 8, 11, 14, 17, 19]);
    }
  });

  it('only the 14 keviyos occur', () => {
    const seen = new Set<string>();
    for (const y of years(1, 9999)) {
      seen.add(`${dayOfWeek(roshHashana(y))}-${yearType(y)}-${isLeapYear(y)}`);
    }
    expect(seen.size).toBe(14);
  });

  it('Cheshvan and Kislev lengths follow the year type', () => {
    for (const y of ys) {
      const t = yearType(y);
      expect(daysInMonth(y, CHESHVAN)).toBe(t === 'sheleima' ? 30 : 29);
      expect(daysInMonth(y, KISLEV)).toBe(t === 'chaseira' ? 29 : 30);
    }
  });
});

describe('known dates (published calendars)', () => {
  const cases: [string, number, number, number][] = [
    ['2025-09-23', 5786, TISHREI, 1], // Rosh Hashana 5786
    ['2024-10-03', 5785, TISHREI, 1],
    ['2026-09-12', 5787, TISHREI, 1],
    ['2027-04-22', 5787, NISAN, 15], // Pesach 5787
    ['2026-10-21', 5787, CHESHVAN, 10],
    ['2024-03-24', 5784, ADAR_II, 14], // Purim 5784 (leap year)
    ['1948-05-14', 5708, 2, 5], // 5 Iyar 5708
    ['2000-01-01', 5760, 10, 23], // 23 Teves 5760
  ];
  it.each(cases)('%s', (iso, y, m, d) => {
    const [gy, gm, gd] = iso.split('-').map(Number);
    expect(dayNumberToHebrew(gregorianToDayNumber(gy, gm, gd))).toEqual({ year: y, month: m, day: d });
  });

  it('rejects dates that do not exist', () => {
    expect(isValidHebrew(5785, ADAR_II, 1)).toBe(false); // 5785 is common
    expect(isValidHebrew(5784, ADAR_II, 29)).toBe(true);
    expect(() => hebrewToDayNumber(5785, ADAR_II, 1)).toThrow(RangeError);
    expect(() => hebrewToDayNumber(5786, TISHREI, 31)).toThrow(RangeError);
  });
});

describe('the calendar epoch constant', () => {
  it('DAY_ZERO literal equals its derivation from Rosh Hashana 5786', () => {
    expect(roshHashana(5786)).toBe(gregorianToDayNumber(2025, 9, 23));
    expect(roshHashana(1)).toBe(gregorianToDayNumber(-3760, 9, 7));
  });
});
