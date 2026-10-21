// Oracle: @hebcal/core Sedra (GPL-2.0-or-later), used only as an independent check.
import { describe, expect, it } from 'vitest';
import { HDate, Sedra } from '@hebcal/core';
import { PARSHIYOS, parshaOn } from '../../src/parsha/parsha.js';
import { dayNumberToGregorian, dayOfWeek, gregorianToDayNumber } from '../../src/calendar/gregorian.js';
import { roshHashana } from '../../src/calendar/hebrew.js';

for (const location of ['diaspora', 'israel'] as const) {
  describe(`parsha vs hebcal, ${location}, every Shabbos 5660–6000`, () => {
    it('agrees', () => {
      const il = location === 'israel';
      const mismatches: string[] = [];
      let count = 0;
      let start = roshHashana(5660);
      start += (6 - dayOfWeek(start) + 7) % 7;
      const end = roshHashana(6001);
      const sedras = new Map<number, Sedra>();
      for (let s = start; s < end; s += 7) {
        const g = dayNumberToGregorian(s);
        const hd = new HDate(new Date(g.year, g.month - 1, g.day));
        let sedra = sedras.get(hd.getFullYear());
        if (!sedra) sedras.set(hd.getFullYear(), (sedra = new Sedra(hd.getFullYear(), il)));
        const theirs = sedra.lookup(hd);
        const ours = parshaOn(s, location);
        count += 1;
        if (theirs.chag) {
          if (ours.parsha !== null) mismatches.push(`${g.year}-${g.month}-${g.day}: ours ${ours.parsha} theirs ${theirs.parsha}`);
          continue;
        }
        const nums = (Array.isArray(theirs.num) ? theirs.num : [theirs.num]) as number[];
        const want = nums.map((n) => PARSHIYOS[n - 1]);
        if (JSON.stringify(ours.parsha) !== JSON.stringify(want)) {
          mismatches.push(`${g.year}-${g.month}-${g.day}: ours ${ours.parsha ?? ours.special} theirs ${want}`);
        }
      }
      expect(count).toBeGreaterThan(17_000);
      expect(mismatches.slice(0, 20)).toEqual([]);
      void gregorianToDayNumber;
    });
  });
}
