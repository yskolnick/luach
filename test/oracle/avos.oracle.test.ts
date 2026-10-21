// Oracle: @hebcal/learning (BSD-2-Clause), used only as an independent check.
import { describe, expect, it } from 'vitest';
import { HDate, DailyLearning } from '@hebcal/core';
import '@hebcal/learning';
import { pirkeiAvos } from '../../src/parsha/avos.js';
import { dayNumberToGregorian, dayOfWeek } from '../../src/calendar/gregorian.js';
import { roshHashana } from '../../src/calendar/hebrew.js';
import { writeReport } from './report.js';

for (const location of ['diaspora', 'israel'] as const) {
  describe(`Pirkei Avos vs @hebcal/learning, ${location}, every Shabbos 5660–6000`, () => {
    it('agrees', () => {
      const diffs: string[] = [];
      let n0 = roshHashana(5660);
      n0 += (6 - dayOfWeek(n0) + 7) % 7;
      let count = 0;
      for (let n = n0; n < roshHashana(6001); n += 7) {
        const g = dayNumberToGregorian(n);
        const e: any = DailyLearning.lookup('pirkeiAvotSummer', new HDate(new Date(g.year, g.month - 1, g.day)), location === 'israel');
        const theirs = e ? e.render('en').replace('Pirkei Avot ', '') : null;
        const ours = pirkeiAvos(n, location)?.join('-') ?? null;
        count += 1;
        if (ours !== theirs) diffs.push(`${g.year}-${g.month}-${g.day} ours=${ours} theirs=${theirs}`);
      }
      writeReport(`avos-${location}`, { oracle: '@hebcal/learning', shabbosos: count, differences: diffs.length });
      expect(diffs.slice(0, 20)).toEqual([]);
    });
  });
}
