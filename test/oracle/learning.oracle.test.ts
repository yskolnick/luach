// Oracle: @hebcal/learning (BSD-2-Clause) with @hebcal/core, used only as an independent check.
import { describe, expect, it } from 'vitest';
import { HDate, DailyLearning } from '@hebcal/core';
import '@hebcal/learning';
import { dafYomi, dafHaShavua, yerushalmiYomi, mishnaYomis, rambam1, rambam3, nachYomi } from '../../src/learning/learning.js';
import { dayNumberToGregorian, gregorianToDayNumber } from '../../src/calendar/gregorian.js';
import { writeReport } from './report.js';

const hd = (n: number) => {
  const g = dayNumberToGregorian(n);
  return new HDate(new Date(g.year, g.month - 1, g.day));
};

// Spelling variants of the same tractate, book or section, reviewed by hand. Both sides are mapped to the
// first spelling in each group before comparing.
const VARIANTS: string[][] = [
  ['Berachos', 'Berachot', 'Berakhot'], ['Shabbos', 'Shabbat'], ['Rosh Hashanah', 'Rosh Hashana'], ['Taanis', 'Taanit', "Ta'anit"],
  ['Yevamos', 'Yevamot'], ['Kesubos', 'Ketubot'], ['Gittin', 'Gitin'], ['Bava Kamma', 'Baba Kamma'], ['Bava Metzia', 'Baba Metzia'],
  ['Bava Basra', 'Baba Batra', 'Bava Batra'], ['Makkos', 'Makkot'], ['Shevuos', 'Shevuot'], ['Horayos', 'Horayot'],
  ['Menachos', 'Menachot'], ['Bechoros', 'Bechorot'], ['Kerisos', 'Keritot'], ['Middos', 'Midot'], ['Nahum', 'Nachum'],
  ['Sheviis', 'Sheviit'], ['Terumos', 'Terumot'], ['Maasros', 'Maasrot'], ['Pirkei Avot', 'Avot'],
  // Rambam introductory sections, named by their content in the oracle.
  ['Introduction', 'Transmission of the Oral Law'], ['Positive commandments', 'Positive Mitzvot'],
  ['Negative commandments', 'Negative Mitzvot'], ['Table of contents', 'Overview of Mishneh Torah Contents'],
];
const escape = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Each group becomes one token; longer spellings first, and only whole words, so "Avot" inside "Pirkei Avot" or
// "Rosh Hashana" inside "Rosh Hashanah" is never replaced twice.
const PATTERNS = VARIANTS.flatMap((group, i) =>
  [...group].sort((x, y) => y.length - x.length).map((v) => [new RegExp(`(?<![A-Za-z'])${escape(v)}(?![A-Za-z])`, 'g'), `#${i}#`] as const),
).sort((x, y) => y[0].source.length - x[0].source.length);
const canon = (s: string) => {
  let t = s;
  for (const [re, token] of PATTERNS) t = t.replace(re, token);
  return t.toLowerCase().replace(/[^a-z0-9#]/g, '');
};

interface Row { name: string; from: [number, number, number]; to: [number, number, number]; ours: (n: number) => { tractate?: string; daf?: number } | null; key: string; theirs: (ev: unknown) => { tractate: string; daf: number } | null }

describe('learning cycles vs @hebcal/learning, every day', () => {
  const pageOf = (ev: any) => (ev ? { tractate: String(ev.daf?.name ?? ev.daf?.getName?.() ?? ''), daf: Number(ev.daf?.blatt ?? ev.daf?.getBlatt?.()) } : null);
  const rows: Row[] = [
    { name: 'Daf Yomi', from: [1923, 9, 11], to: [2100, 12, 31], ours: dafYomi, key: 'dafyomi', theirs: pageOf },
    { name: 'Daf HaShavua', from: [2005, 3, 6], to: [2060, 12, 31], ours: dafHaShavua, key: 'dafweekly', theirs: pageOf },
    { name: 'Yerushalmi (Vilna)', from: [1980, 2, 2], to: [2060, 12, 31], ours: yerushalmiYomi, key: 'yerushalmi-vilna', theirs: (ev: any) => (ev ? { tractate: String(ev.daf?.name), daf: Number(ev.daf?.blatt) } : null) },
  ];
  for (const r of rows) {
    it(`${r.name}`, () => {
      const diffs: string[] = [];
      let days = 0;
      for (let n = gregorianToDayNumber(...r.from); n <= gregorianToDayNumber(...r.to); n += 1) {
        const ours = r.ours(n);
        const theirs = r.theirs(DailyLearning.lookup(r.key, hd(n), false));
        days += 1;
        if (!ours || !theirs) {
          if (!!ours !== !!theirs) diffs.push(`${dayNumberToGregorian(n).year}-${dayNumberToGregorian(n).month}-${dayNumberToGregorian(n).day} ours=${JSON.stringify(ours && [ours.tractate, ours.daf])} theirs=${JSON.stringify(theirs)}`);
          continue;
        }
        if (canon(ours.tractate!) !== canon(theirs.tractate) || ours.daf !== theirs.daf) {
          diffs.push(`${dayNumberToGregorian(n).year}-${dayNumberToGregorian(n).month}-${dayNumberToGregorian(n).day} ours=${ours.tractate} ${ours.daf} theirs=${theirs.tractate} ${theirs.daf}`);
        }
      }
      writeReport(`learning-${r.key}`, { oracle: '@hebcal/learning', cycle: r.name, days, differences: diffs.length, first: diffs.slice(0, 10) });
      expect(diffs.slice(0, 15)).toEqual([]);
    }, 120_000);
  }

  const text = (ev: any) => (ev ? ev.render('en') : null);
  it('Mishna Yomis, Rambam 1 and 3, Nach Yomi (rendered text, normalised)', () => {
    const report: Record<string, { days: number; differences: number; first: string[] }> = {};
    const cases: [string, string, (n: number) => { text: string } | null, [number, number, number]][] = [
      ['mishnayomi', 'Mishna Yomis', mishnaYomis, [2010, 7, 4]],
      ['rambam1', 'Rambam 1', rambam1, [1984, 4, 29]],
      ['rambam3', 'Rambam 3', rambam3, [1984, 4, 29]],
      ['nachyomi', 'Nach Yomi', nachYomi, [2007, 11, 1]],
    ];
    for (const [key, name, f, from] of cases) {
      const diffs: string[] = [];
      let days = 0;
      for (let n = gregorianToDayNumber(...from); n <= gregorianToDayNumber(2040, 12, 31); n += 1) {
        const ours = f(n)?.text ?? null;
        const theirs = text(DailyLearning.lookup(key, hd(n), false));
        days += 1;
        if (ours === null || theirs === null) {
          if ((ours === null) !== (theirs === null)) diffs.push(`${n}: ours=${ours} theirs=${theirs}`);
          continue;
        }
        if (canon(ours) !== canon(theirs)) diffs.push(`${dayNumberToGregorian(n).year}-${dayNumberToGregorian(n).month}-${dayNumberToGregorian(n).day}: ours="${ours}" theirs="${theirs}"`);
      }
      report[name] = { days, differences: diffs.length, first: diffs.slice(0, 10) };
    }
    writeReport('learning-text', { oracle: '@hebcal/learning', ...report });
    for (const [name, r] of Object.entries(report)) expect(r.first, name).toEqual([]);
  }, 300_000);
});
