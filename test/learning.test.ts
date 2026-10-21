import { describe, expect, it } from 'vitest';
import { dafYomi, dafHaShavua, mishnaYomis, nachYomi, rambam1, rambam3, yerushalmiYomi } from '../src/learning/learning.js';
import { dayNumberToGregorian, gregorianToDayNumber as g } from '../src/calendar/gregorian.js';
import { AV, TISHREI, hebrewToDayNumber } from '../src/calendar/hebrew.js';

const iso = (n: number) => {
  const x = dayNumberToGregorian(n);
  return `${x.year}-${String(x.month).padStart(2, '0')}-${String(x.day).padStart(2, '0')}`;
};

describe('learning cycles: published dates (docs/research/2026-10-21-learning-cycles.md)', () => {
  it('Daf Yomi: cycle 8 began 24 June 1975, cycle 14 on 5 Jan 2020, cycle 15 on 8 June 2027', () => {
    expect(dafYomi(g(1975, 6, 24))).toMatchObject({ cycle: 8, tractate: 'Berachos', daf: 2 });
    expect(dafYomi(g(2020, 1, 5))).toMatchObject({ cycle: 14, tractate: 'Berachos', daf: 2 });
    expect(iso(dafYomi(g(2026, 10, 21))!.cycleEnd)).toBe('2027-06-07');
    expect(dafYomi(g(2027, 6, 8))).toMatchObject({ cycle: 15, daf: 2 });
    expect(dafYomi(g(1923, 9, 10))).toBeNull();
  });
  it('Daf Yomi: Kinnim, Tamid and Middos follow Meilah', () => {
    const start = g(2020, 1, 5);
    const names = new Set<string>();
    for (let n = start; n < start + 2711; n += 1) names.add(dafYomi(n)!.tractate);
    expect([...names].slice(-5)).toEqual(['Meilah', 'Kinnim', 'Tamid', 'Middos', 'Niddah']);
  });
  it('Yerushalmi: cycle 11 began 14 Nov 2022 and ends 22 Feb 2027; no daf on Yom Kippur or Tisha B\'Av', () => {
    expect(yerushalmiYomi(g(2022, 11, 14))).toMatchObject({ cycle: 11, tractate: 'Berachos', daf: 1 });
    expect(iso(yerushalmiYomi(g(2026, 10, 21))!.cycleEnd)).toBe('2027-02-22');
    expect(yerushalmiYomi(hebrewToDayNumber(5787, TISHREI, 10))).toBeNull();
    expect(yerushalmiYomi(hebrewToDayNumber(5786, AV, 9))).toBeNull();
  });
  it('Mishna Yomis: cycles start 2016-03-30, 2021-12-25, 2027-09-21', () => {
    expect(iso(mishnaYomis(g(2017, 1, 1))!.cycleStart)).toBe('2016-03-30');
    expect(iso(mishnaYomis(g(2026, 10, 21))!.cycleStart)).toBe('2021-12-25');
    expect(iso(mishnaYomis(g(2026, 10, 21))!.cycleEnd + 1)).toBe('2027-09-21');
    expect(mishnaYomis(g(2021, 12, 25))!.text).toBe('Berakhot 1:1-2');
  });
  it('Rambam: cycles of 339 and 1,017 days from 29 April 1984', () => {
    expect(rambam3(g(2026, 2, 3))).toMatchObject({ cycle: 46, text: 'Introduction 1-45' });
    expect(rambam1(g(2026, 2, 3))).toMatchObject({ cycle: 16, text: 'Introduction 1-21' });
    expect(rambam3(g(1984, 4, 28))).toBeNull();
  });
  it('Nach Yomi and Daf HaShavua', () => {
    expect(nachYomi(g(2026, 2, 12))).toMatchObject({ cycle: 10, book: 'Joshua', chapter: 1 });
    expect(dafHaShavua(g(2016, 10, 16))).toMatchObject({ tractate: 'Beitzah', daf: 2 });
  });
});

import { BAVLI, MISHNA, NACH, YERUSHALMI_VILNA } from '../src/learning/data.js';

describe('literal cycle lengths match the data', () => {
  it('2711 / 2702 / 1554 / 2096 / 742', () => {
    const bavli = BAVLI.reduce((s, t) => s + t[3] - t[2] + 1, 0);
    expect(bavli).toBe(2711);
    expect(bavli - (22 - 13)).toBe(2702); // cycles 1–7 learned Shekalim 2–13
    expect(YERUSHALMI_VILNA.reduce((s, t) => s + t[2], 0)).toBe(1554);
    expect(MISHNA.reduce((s, t) => s + t[2].reduce((a, b) => a + b, 0), 0) / 2).toBe(2096);
    expect(NACH.reduce((s, b) => s + b[2], 0)).toBe(742);
  });
});
