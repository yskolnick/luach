import { describe, expect, it } from 'vitest';
import { PARSHIYOS, parshaOn, parshiyosOfYear, readingsDiffer } from '../src/parsha/parsha.js';
import { dayOfWeek, gregorianToDayNumber } from '../src/calendar/gregorian.js';
import { AV, NISAN, hebrewToDayNumber } from '../src/calendar/hebrew.js';

describe('parsha structure, Hebrew years 2–9997', () => {
  for (const location of ['israel', 'diaspora'] as const) {
    it(`${location}: each annual cycle reads Bereshis…Haazinu once, in order`, () => {
      const all = PARSHIYOS.slice(0, 53).join(',');
      for (let y = 2; y <= 9997; y += 1) {
        const thisYear = parshiyosOfYear(y, location);
        const nextYear = parshiyosOfYear(y + 1, location);
        const fromBereshis = thisYear.flatMap((r) => r.parsha ?? []);
        const start = fromBereshis.indexOf('bereshis');
        const cycle = [...fromBereshis.slice(start)];
        // Vayelech (if not read with Nitzavim) and Haazinu come in the next year's Tishrei.
        const nextBereshis = nextYear.flatMap((r) => r.parsha ?? []);
        cycle.push(...nextBereshis.slice(0, nextBereshis.indexOf('bereshis')));
        if (cycle.join(',') !== all) throw new Error(`${location} ${y}: ${cycle.join(',')}`);
      }
    });
  }
});

describe('known readings (published calendars)', () => {
  const d = (y: number, m: number, day: number) => gregorianToDayNumber(y, m, day);
  it('Shabbos 24 Oct 2026 is Lech Lecha', () => {
    expect(parshaOn(d(2026, 10, 24), 'diaspora').parsha).toEqual(['lech-lecha']);
  });
  it('a Yom Tov Shabbos has no parsha and names the festival reading', () => {
    // 24 April 2027 = 17 Nisan 5787, Chol Hamoed.
    expect(parshaOn(d(2027, 4, 24), 'diaspora')).toMatchObject({ parsha: null, special: 'pesach-chol-hamoed' });
  });
  it('when the 8th day of Pesach is Shabbos, Israel and the diaspora diverge and rejoin by Devarim', () => {
    let years = 0;
    for (let y = 5660; y <= 6000; y += 1) {
      const eighth = hebrewToDayNumber(y, NISAN, 22);
      if (dayOfWeek(eighth) !== 6) continue;
      years += 1;
      expect(parshaOn(eighth, 'diaspora').special).toBe('pesach-8');
      expect(parshaOn(eighth, 'israel').parsha).not.toBeNull();
      const tishaBav = hebrewToDayNumber(y, AV, 9);
      const devarim = tishaBav - ((dayOfWeek(tishaBav) + 1) % 7);
      expect(readingsDiffer(devarim)).toBe(false);
      expect(parshaOn(devarim, 'israel').parsha).toEqual(['devarim']);
    }
    expect(years).toBeGreaterThan(30);
  });
});
