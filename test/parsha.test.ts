import { describe, expect, it } from 'vitest';
import { HebrewDate, Month, parshaFor, parshaName, pirkeiAvos, ashkenazi, he, sephardi, en, holidaysForYear, readingCycle } from '../src/index';

describe('parsha', () => {
  it('this week (published): Shabbos 24 Oct 2026 is Lech Lecha', () => {
    const r = parshaFor(HebrewDate.fromGregorian(2026, 10, 21));
    expect(r.parsha).toEqual(['lech-lecha']);
    expect(parshaName(r.parsha, ashkenazi)).toBe('Lech Lecha');
    expect(parshaName(r.parsha, he)).toBe('לך לך');
  });
  it('joined parshiyos', () => {
    const r = parshaFor(HebrewDate.fromGregorian(2026, 3, 14)); // 25 Adar 5786: Vayakhel-Pekudei
    expect(parshaName(r.parsha, sephardi)).toBe('Vayakhel-Pekudei');
  });
  it('a Shabbos that is Yom Tov has no parsha', () => {
    const r = parshaFor(new HebrewDate(5787, Month.TISHREI, 1)); // Shabbos Rosh Hashana 5787
    expect(r.parsha).toBeNull();
    expect(r.holiday).toBe('rosh-hashana');
  });
  it('every parsha has a name in every locale', () => {
    for (const r of readingCycle(5786)) {
      if (!r.parsha) continue;
      for (const l of [he, ashkenazi, sephardi, en]) expect(parshaName(r.parsha, l)).not.toMatch(/parsha\./);
    }
  });
  it('Shabbos Shira is Beshalach', () => {
    const shira = holidaysForYear(5787).find((e) => e.id === 'shabbos-shira')!;
    expect(parshaFor(shira.date).parsha).toContain('beshalach');
  });
  it('Shovavim weeks (optional)', () => {
    const common = holidaysForYear(5786, { shovavim: true }).filter((e) => e.id === 'shovavim');
    const leap = holidaysForYear(5787, { shovavim: true }).filter((e) => e.id === 'shovavim');
    expect(common.length).toBe(6);
    expect(leap.length).toBe(8);
  });
});

describe('Pirkei Avos', () => {
  it('starts with chapter 1 on the first Shabbos after Pesach and cycles', () => {
    const first = new HebrewDate(5786, Month.NISAN, 23).onOrAfter(6);
    expect(pirkeiAvos(first)).toEqual([1]);
    expect(pirkeiAvos(first.addDays(7))).toEqual([2]);
    expect(pirkeiAvos(new HebrewDate(5786, Month.TEVES, 1).onOrAfter(6))).toBeNull();
  });
  it('is not said on a Shabbos that is Erev Tisha B\'Av (Rema OC 553:2)', () => {
    // 8 Av 5710 is Shabbos: no chapter, and the next Shabbos continues where the last left off.
    const erev = new HebrewDate(5710, Month.AV, 8);
    expect(erev.isShabbos).toBe(true);
    expect(pirkeiAvos(erev)).toBeNull();
    expect(pirkeiAvos(erev.addDays(-7))).toEqual([2]);
    expect(pirkeiAvos(erev.addDays(7))).toEqual([3]);
  });
  it('until Shavuos: one round of six chapters before Shavuos (Kaf HaChaim 292:23)', () => {
    const first = new HebrewDate(5786, Month.NISAN, 23).onOrAfter(6);
    const opts = { until: 'shavuos' } as const;
    const got = [0, 1, 2, 3, 4, 5].map((w) => pirkeiAvos(first.addDays(7 * w), opts));
    expect(got).toEqual([[1], [2], [3], [4], [5], [6]]);
    // After Shavuos nothing is read under this custom.
    expect(pirkeiAvos(new HebrewDate(5786, Month.SIVAN, 8).onOrAfter(6), opts)).toBeNull();
    expect(pirkeiAvos(new HebrewDate(5786, Month.SIVAN, 8).onOrAfter(6))).not.toBeNull();
  });
  it('doubled custom ends the summer with chapter 6', () => {
    const lastShabbos = new HebrewDate(5787, Month.TISHREI, 1).prev().onOrBefore(6);
    const ch = pirkeiAvos(lastShabbos, { cycle: 'doubled' })!;
    expect(ch[ch.length - 1]).toBe(6);
  });
});
