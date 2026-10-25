import { describe, expect, it } from 'vitest';
import { HebrewDate, Month, amidahSeason } from '../src/index';

const y = 5787;
const d = (m: number, day: number) => new HebrewDate(y, m, day);

describe('amidahSeason: the changeover days describe Shacharis (SA OC 114:1)', () => {
  it('Shacharis of the first day of Pesach still says mashiv haruach; it stops at Musaf', () => {
    const p = amidahSeason(d(Month.NISAN, 15));
    expect(p.mashivHaruach).toBe(true);
    expect(p.changesAtMusaf).toBe(true);
    expect(amidahSeason(d(Month.NISAN, 16)).mashivHaruach).toBe(false);
  });
  it('Shacharis of Shemini Atzeres does not say it yet; it starts at Musaf', () => {
    const s = amidahSeason(d(Month.TISHREI, 22));
    expect(s.mashivHaruach).toBe(false);
    expect(s.changesAtMusaf).toBe(true);
    expect(amidahSeason(d(Month.TISHREI, 23)).mashivHaruach).toBe(true);
  });
});

describe('amidahSeason: morid hatal in summer by custom (SA and Rema OC 114:3; MB 114:3, 13)', () => {
  const summer = d(Month.SIVAN, 1);
  it('Ashkenaz outside Israel does not say it (the default)', () => {
    expect(amidahSeason(summer).moridHatal).toBe(false);
    expect(amidahSeason(summer, { nusach: 'ashkenaz' }).moridHatal).toBe(false);
  });
  it('Nusach Sefard and Edot HaMizrach say it', () => {
    expect(amidahSeason(summer, { nusach: 'sefard' }).moridHatal).toBe(true);
    expect(amidahSeason(summer, { nusach: 'edot-hamizrach' }).moridHatal).toBe(true);
  });
  it('in Israel everyone says it', () => {
    expect(amidahSeason(summer, { israel: true }).moridHatal).toBe(true);
    expect(amidahSeason(summer, { israel: true, nusach: 'ashkenaz' }).moridHatal).toBe(true);
  });
  it('never in winter', () => {
    for (const nusach of ['ashkenaz', 'sefard', 'edot-hamizrach'] as const) {
      expect(amidahSeason(d(Month.SHEVAT, 1), { nusach, israel: true }).moridHatal).toBe(false);
    }
  });
});
