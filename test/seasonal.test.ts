import { describe, expect, it } from 'vitest';
import {
  birkasHachama, kiddushLevanaEarliest, kiddushLevanaLatest, moladAnnouncement, moladInstant, omerDay, omerSefirah,
  omerTextEnglish, omerTextHebrew, rainPrayers, talUmatarStart,
} from '../src/calendar/seasonal.js';
import { dayNumberToGregorian, dayOfWeek, gregorianToDayNumber, julianToDayNumber } from '../src/calendar/gregorian.js';
import { KISLEV, NISAN, TISHREI, hebrewToDayNumber } from '../src/calendar/hebrew.js';

const g = (y: number, m: number, d: number) => gregorianToDayNumber(y, m, d);

describe('Julian day numbers', () => {
  it('known equivalences', () => {
    expect(julianToDayNumber(1582, 10, 5)).toBe(g(1582, 10, 15)); // the Gregorian switch
    expect(julianToDayNumber(2009, 3, 26)).toBe(g(2009, 4, 8));
  });
});

describe('Omer', () => {
  it('day numbers', () => {
    expect(omerDay(hebrewToDayNumber(5787, NISAN, 16))).toBe(1);
    expect(omerDay(hebrewToDayNumber(5787, NISAN, 15))).toBeNull();
    expect(omerDay(hebrewToDayNumber(5787, 3, 5))).toBe(49);
    expect(omerDay(hebrewToDayNumber(5787, 3, 6))).toBeNull();
    expect(omerDay(hebrewToDayNumber(5787, 2, 18))).toBe(33); // Lag BaOmer
  });
  it('sefiros', () => {
    expect(omerSefirah(1)).toBe("Chesed sheb'Chesed");
    expect(omerSefirah(9)).toBe("Gevurah sheb'Gevurah");
    expect(omerSefirah(33, 'he')).toBe('הוד שבהוד');
    expect(omerSefirah(49)).toBe("Malchus sheb'Malchus");
  });
  it('texts', () => {
    expect(omerTextHebrew(1)).toBe('היום יום אחד לעומר');
    expect(omerTextHebrew(7)).toBe('היום שבעה ימים שהם שבוע אחד לעומר');
    expect(omerTextHebrew(10)).toBe('היום עשרה ימים שהם שבוע אחד ושלשה ימים לעומר');
    expect(omerTextHebrew(33)).toBe('היום שלשה ושלשים יום שהם ארבעה שבועות וחמשה ימים לעומר');
    expect(omerTextHebrew(49, { ending: 'baomer' })).toBe('היום תשעה וארבעים יום שהם שבעה שבועות בעומר');
    expect(omerTextEnglish(1)).toBe('Today is 1 day of the Omer.');
    expect(omerTextEnglish(10)).toBe('Today is 10 days, which is 1 week and 3 days of the Omer.');
  });
});

describe('rain prayers', () => {
  it('diaspora tal umatar: evening of 4 Dec, or 5 Dec before a Gregorian leap year (1900–2099)', () => {
    for (let gy = 1900; gy <= 2098; gy += 1) {
      const start = talUmatarStart(gy + 3761, 'diaspora');
      const leapNext = (gy + 1) % 4 === 0 && gy + 1 !== 2100;
      expect(dayNumberToGregorian(start.eveningOf)).toEqual({ year: gy, month: 12, day: leapNext ? 5 : 4 });
    }
  });
  it('diaspora tal umatar after 2100 moves a day later', () => {
    expect(dayNumberToGregorian(talUmatarStart(2100 + 3761, 'diaspora').eveningOf)).toEqual({ year: 2100, month: 12, day: 5 });
    expect(dayNumberToGregorian(talUmatarStart(2103 + 3761, 'diaspora').eveningOf)).toEqual({ year: 2103, month: 12, day: 6 });
  });
  it('Israel: evening that begins 7 Cheshvan', () => {
    expect(talUmatarStart(5787, 'israel').hebrewDate).toEqual({ year: 5787, month: 8, day: 7 });
  });
  it('seasons', () => {
    expect(rainPrayers(hebrewToDayNumber(5787, TISHREI, 5), 'diaspora').mashivHaruach).toBe(false);
    expect(rainPrayers(hebrewToDayNumber(5787, TISHREI, 22), 'diaspora').changeAtMusaf).toBe('start-geshem');
    expect(rainPrayers(hebrewToDayNumber(5787, KISLEV, 1), 'diaspora')).toMatchObject({ mashivHaruach: true, talUmatar: false });
    expect(rainPrayers(hebrewToDayNumber(5787, KISLEV, 1), 'israel')).toMatchObject({ mashivHaruach: true, talUmatar: true });
    expect(rainPrayers(g(2026, 12, 6), 'diaspora').talUmatar).toBe(true);
    expect(rainPrayers(hebrewToDayNumber(5787, NISAN, 14), 'diaspora').talUmatar).toBe(true);
    expect(rainPrayers(hebrewToDayNumber(5787, NISAN, 15), 'diaspora')).toMatchObject({ mashivHaruach: true, talUmatar: false, changeAtMusaf: 'stop-geshem' });
    expect(rainPrayers(hebrewToDayNumber(5787, NISAN, 16), 'diaspora').mashivHaruach).toBe(false);
  });
});

describe('Birkas HaChama', () => {
  it('1953, 1981, 2009, 2037 on Wednesday 8 April; 2121 on 9 April', () => {
    for (const gy of [1953, 1981, 2009, 2037]) {
      const n = birkasHachama(gy + 3760)!;
      expect(dayNumberToGregorian(n)).toEqual({ year: gy, month: 4, day: 8 });
      expect(dayOfWeek(n)).toBe(3);
    }
    expect(dayNumberToGregorian(birkasHachama(2121 + 3760)!)).toEqual({ year: 2121, month: 4, day: 9 });
    expect(birkasHachama(5787)).toBeNull();
  });
  it('always a Wednesday', () => {
    for (let y = 4000; y < 9000; y += 1) {
      const n = birkasHachama(y);
      if (n !== null) expect(dayOfWeek(n)).toBe(3);
    }
  });
});

describe('Kiddush Levana and the molad announcement', () => {
  it('windows are ordered', () => {
    const m = moladInstant(5787, KISLEV);
    expect(kiddushLevanaEarliest(5787, KISLEV, '3-days').time.getTime() - m).toBe(3 * 86_400_000);
    expect(kiddushLevanaEarliest(5787, KISLEV, '7-days').time.getTime() - m).toBe(7 * 86_400_000);
    const half = kiddushLevanaLatest(5787, KISLEV, 'half-month').time.getTime() - m;
    // Half of 29d 12h 793p = 14d 18h 396½p = 14d 18h 22m and ½ chelek.
    expect(half / 3_600_000).toBeCloseTo(14 * 24 + 18 + 396.5 / 1080, 5); // Date has whole milliseconds
    expect(kiddushLevanaLatest(5787, KISLEV, '15-days').time.getTime() - m).toBe(15 * 86_400_000);
  });
  it('announcement text', () => {
    // Molad Tishrei 5787: Friday 11 Sept 2026, 8:59 pm and 1 chelek (verified against the oracle in calendar tests).
    expect(moladAnnouncement(5787, TISHREI)).toBe('Molad Tishrei: Friday, 8:59 pm and 1 chelek');
    expect(moladAnnouncement(5787, TISHREI, 'he')).toBe('מולד תשרי: יום שישי, 20:59 ו-1 חלקים');
  });
});
