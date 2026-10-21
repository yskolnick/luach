// Oracle: @hebcal/core (GPL), used only as an independent check.
// hebcal's hallel() differs from the Shulchan Aruch in five places; each is listed with its source below,
// and any other difference fails the test.
import { describe, expect, it } from 'vitest';
import { HDate, HebrewCalendar } from '@hebcal/core';
import { hallel } from '../../src/holidays/hallel.js';
import { dayNumberToGregorian } from '../../src/calendar/gregorian.js';
import { roshHashana, dayNumberToHebrew, hebrewToDayNumber, KISLEV, IYAR, TISHREI } from '../../src/calendar/hebrew.js';
import { modernIsraeliDays } from '../../src/holidays/holidays.js';
import { writeReport } from './report.js';

function explained(n: number, ours: string | null, theirs: string | null): string | null {
  const h = dayNumberToHebrew(n);
  const chanukah = hebrewToDayNumber(h.year, KISLEV, 25);
  if (h.month === TISHREI && (h.day === 22 || h.day === 23) && ours === 'whole' && theirs === null) {
    return 'Shemini Atzeres / Simchas Torah: whole Hallel (SA OC 644:1, all days of the festival); hebcal has none';
  }
  if (n > chanukah && n < chanukah + 8 && ours === 'whole' && theirs === 'half') {
    return 'Rosh Chodesh Teves during Chanukah: whole Hallel (SA OC 683:1); hebcal has half';
  }
  if (n === chanukah - 1 && ours === null && theirs === 'whole') {
    return '24 Kislev: no Hallel; hebcal counts it as Chanukah (the first candle is lit that evening)';
  }
  if (h.month === IYAR && h.day === 14 && ours === null && theirs === 'half') {
    return 'Pesach Sheni: no Hallel in the Shulchan Aruch; hebcal has half';
  }
  const yomYerushalayim5727 = h.year === 5727 && h.month === IYAR && h.day === 28; // hebcal lists the 1967 day itself
  if (ours === null && theirs === 'whole' && (yomYerushalayim5727 || modernIsraeliDays(h.year).some((d) => d.dayNumber === n && /atzmaut|yerushalayim/.test(d.id)))) {
    return 'Yom HaAtzmaut / Yom Yerushalayim: a custom, deliberately not covered by hallel()';
  }
  return null;
}

for (const location of ['diaspora', 'israel'] as const) {
  describe(`Hallel vs hebcal, ${location}, every day 5660–6000`, () => {
    it('agrees except for the documented, sourced differences', () => {
      const unexplained: string[] = [];
      const reasons = new Map<string, number>();
      let days = 0;
      for (let n = roshHashana(5660); n < roshHashana(6001); n += 1) {
        const g = dayNumberToGregorian(n);
        const t = HebrewCalendar.hallel(new HDate(new Date(g.year, g.month - 1, g.day)), location === 'israel');
        const theirs = t === 2 ? 'whole' : t === 1 ? 'half' : null;
        const ours = hallel(n, location);
        days += 1;
        if (ours === theirs) continue;
        const why = explained(n, ours, theirs);
        if (why) reasons.set(why, (reasons.get(why) ?? 0) + 1);
        else unexplained.push(`${g.year}-${g.month}-${g.day} ours=${ours} theirs=${theirs}`);
      }
      writeReport(`hallel-${location}`, { oracle: '@hebcal/core', days, unexplained: unexplained.length, explained: Object.fromEntries(reasons) });
      expect(unexplained.slice(0, 20)).toEqual([]);
    });
  });
}
