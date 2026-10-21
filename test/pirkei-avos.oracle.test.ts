import { describe, expect, it } from 'vitest';
import { HDate } from '@hebcal/core';
import { pirkeiAvot } from '@hebcal/learning';
import { HebrewDate, Month, pirkeiAvos } from '../src/index';

/** Every Shabbos from Nisan of `from` to Rosh Hashana of `to`, compared with hebcal (doubled ending). */
function diffs(israel: boolean, from: number, to: number): string[] {
  const out: string[] = [];
  for (let d = new HebrewDate(from, Month.NISAN, 1).onOrAfter(6); d.year < to; d = d.addDays(7)) {
    const ours = pirkeiAvos(d, { israel, cycle: 'doubled' });
    const theirs = pirkeiAvot(new HDate(d.day, d.month, d.year), israel);
    if (JSON.stringify(ours) !== JSON.stringify(theirs)) out.push(`${d}: ours ${JSON.stringify(ours)} | hebcal ${JSON.stringify(theirs)}`);
  }
  return out;
}

describe('Pirkei Avos vs @hebcal/learning (test-only)', () => {
  for (const israel of [false, true]) {
    it(`${israel ? 'Israel' : 'diaspora'} 5700–5900`, () => {
      expect(diffs(israel, 5700, 5900).slice(0, 20)).toEqual([]);
    });
  }
});
