import { describe, expect, it } from 'vitest';
import { HebrewDate, Month, holidaysForYear, holidaysOn, holidaysBetween, nextHoliday, parshaFor, readingCycle, pirkeiAvos, haftaraFor, fastMinchaHaftara, tefillahOn, dayInfo, getPlace, isMelachaForbiddenAt } from '../src/index';
import { MAX_DAYS, roshHashanaDays } from '../src/calendar/year';

// 9999 is the last supported Hebrew year. Rules that look ahead to year 10000 must
// still work for every date in 9999, or omit what lies in 10000.
describe('the last supported year, 9999', () => {
  it('holidays for 9999 are listed, with Leil Selichos computed from the weekday of 1 Tishrei 10000', () => {
    for (const israel of [false, true]) {
      const all = { israel, behab: true, yomKippurKatan: true, modernIsraeli: true, israeliCommemorations: true, shovavim: true };
      const evs = holidaysForYear(9999, all);
      expect(evs.length).toBeGreaterThan(50);
      const s = evs.find((e) => e.id === 'leil-selichos')!;
      expect(s.date.isShabbos).toBe(true);
      // The Rosh Hashana it precedes is the day after MAX_DAYS; at least four days of Selichos remain.
      const rh = roshHashanaDays(10000);
      expect(rh).toBe(MAX_DAYS + 1);
      expect(rh - s.date.epochDays).toBeGreaterThanOrEqual(5);
      expect(rh - s.date.epochDays).toBeLessThan(12);
    }
  });
  it('Leil Selichos is unchanged in ordinary years', () => {
    for (let y = 5700; y < 5900; y++) {
      const s = holidaysForYear(y).find((e) => e.id === 'leil-selichos')!;
      const rh = new HebrewDate(y + 1, Month.TISHREI, 1);
      let expected = rh.addDays(-4).onOrBefore(6);
      if (rh.daysSince(expected) < 5) expected = expected.addDays(-7);
      expect(s.date.equals(expected), `${y}`).toBe(true);
    }
  });
  it('every day of 9999 works in every day-level function', () => {
    const where = getPlace('jerusalem')!;
    let days = 0;
    for (let d = new HebrewDate(9999, Month.TISHREI, 1); ; d = d.next()) {
      for (const israel of [false, true]) {
        holidaysOn(d, { israel, behab: true, yomKippurKatan: true });
        holidaysBetween(d, d, { israel });
        nextHoliday('purim', d, { israel });
        tefillahOn(d, { israel });
        haftaraFor(d, { israel });
        fastMinchaHaftara(d, { israel });
        pirkeiAvos(d, { israel });
        dayInfo(d, { israel });
        const r = parshaFor(d, { israel });
        if (r === null) {
          expect(d.epochDays + 6 - d.dayOfWeek).toBeGreaterThan(MAX_DAYS);
          continue;
        }
        expect(r.date.epochDays >= d.epochDays).toBe(true);
      }
      if (MAX_DAYS - d.epochDays < 30) dayInfo(d, { location: where });
      days++;
      if (d.epochDays === MAX_DAYS) break;
    }
    expect(days).toBe(MAX_DAYS - roshHashanaDays(9999) + 1);
  });
  it('the reading cycle of 9999 stops at the last Shabbos of the year', () => {
    for (const israel of [false, true]) {
      const c = readingCycle(9999, { israel });
      expect(c.length).toBeGreaterThan(40);
      expect(c.every((x) => x.date.year === 9999)).toBe(true);
      // Haazinu is read in Tishrei 10000, outside the range; it is omitted, not invented.
      expect(c.some((x) => x.parsha?.includes('haazinu'))).toBe(false);
      expect(c.some((x) => x.parsha?.includes('nitzavim'))).toBe(true);
    }
  });
  it('29 Elul 9999 is Erev Rosh Hashana: candle lighting, and melacha forbidden that night', () => {
    const where = getPlace('jerusalem')!;
    const last = HebrewDate.fromEpochDays(MAX_DAYS);
    expect([last.month, last.day]).toEqual([Month.ELUL, 29]);
    const info = dayInfo(last, { location: where });
    expect(info.candleLighting?.time).toBeTruthy();
    const night = new Date(Date.parse(info.candleLighting!.time!) + 3 * 3600_000);
    expect(isMelachaForbiddenAt(night, where)).toBe(true);
    const morning = new Date(Date.parse(info.candleLighting!.time!) - 8 * 3600_000);
    expect(isMelachaForbiddenAt(morning, where)).toBe(last.isShabbos);
  });
  it('the last Shabbos of 9999 has a parsha (not a stand-in)', () => {
    const last = HebrewDate.fromEpochDays(MAX_DAYS).onOrBefore(6);
    const r = parshaFor(last)!;
    expect(r.parsha).not.toBeNull();
  });
});
