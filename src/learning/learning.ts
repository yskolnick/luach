/**
 * Daily learning cycles: Daf Yomi (Bavli and Yerushalmi), Mishna Yomis, Rambam (3 and 1 chapters a day),
 * Nach Yomi and Daf HaShavua. Each function returns the portion for a civil date, the cycle's first and last
 * day (the siyum), or null before the cycle began.
 *
 * Definitions (start dates, units, skipped days) are in docs/research/2026-10-21-learning-cycles.md, and every cycle
 * is checked day by day against an independent implementation (see the accuracy report).
 *
 * @packageDocumentation
 */

import { type DayNumber, dayOfWeek, gregorianToDayNumber } from '../calendar/gregorian.js';
import { AV, TISHREI, dayNumberToHebrew, hebrewToDayNumber } from '../calendar/hebrew.js';
import { gematriya } from '../format/gematriya.js';
import { BAVLI, MISHNA, NACH, RAMBAM, YERUSHALMI_VILNA } from './data.js';

/** Common fields of a day's portion. */
export interface LearningPortion {
  /** English text, e.g. "Berachos 12" or "Mishna Berakhot 3:4-5". */
  readonly text: string;
  /** Hebrew text, e.g. "ברכות יב". */
  readonly textHebrew: string;
  /** Day number of the first day of this cycle. */
  readonly cycleStart: DayNumber;
  /** Day number of the last day of this cycle (the siyum). */
  readonly cycleEnd: DayNumber;
  /** Cycle number, where the cycle's numbering is established. */
  readonly cycle?: number;
}

const g = gregorianToDayNumber;

// ------------------------------------------------------------------ Daf Yomi (Bavli)

export interface DafYomi extends LearningPortion {
  readonly tractate: string;
  readonly tractateHebrew: string;
  readonly daf: number;
}

const DAF_YOMI_START = g(1923, 9, 11);
const DAF_YOMI_CYCLE8 = g(1975, 6, 24);
/** Cycles 1–7 learned Shekalim 2–13 (12 dafim); from cycle 8 the Vilna Shekalim (2–22). */
const bavliDays = (old: boolean) => BAVLI.map(([name, he, first, last]) => [name, he, first, name === 'Shekalim' && old ? 13 : last] as const);
const BAVLI_OLD = bavliDays(true);
const BAVLI_NEW = bavliDays(false);
const total = (list: ReadonlyArray<readonly [string, string, number, number]>) => list.reduce((s, t) => s + t[3] - t[2] + 1, 0);
const OLD_LEN = total(BAVLI_OLD); // 2702
const NEW_LEN = total(BAVLI_NEW); // 2711

function bavliAt(list: ReadonlyArray<readonly [string, string, number, number]>, index: number): { tractate: string; tractateHebrew: string; daf: number } {
  let i = index;
  for (const [tractate, tractateHebrew, first, last] of list) {
    const len = last - first + 1;
    if (i < len) return { tractate, tractateHebrew, daf: first + i };
    i -= len;
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

/** Daf Yomi (Bavli), from 11 September 1923. One daf a day, no days skipped. */
export function dafYomi(dayNumber: DayNumber): DafYomi | null {
  if (dayNumber < DAF_YOMI_START) return null;
  let cycle: number;
  let start: DayNumber;
  let len: number;
  if (dayNumber < DAF_YOMI_CYCLE8) {
    cycle = Math.floor((dayNumber - DAF_YOMI_START) / OLD_LEN) + 1;
    start = DAF_YOMI_START + (cycle - 1) * OLD_LEN;
    len = OLD_LEN;
  } else {
    cycle = Math.floor((dayNumber - DAF_YOMI_CYCLE8) / NEW_LEN) + 8;
    start = DAF_YOMI_CYCLE8 + (cycle - 8) * NEW_LEN;
    len = NEW_LEN;
  }
  const at = bavliAt(len === OLD_LEN ? BAVLI_OLD : BAVLI_NEW, dayNumber - start);
  return { ...at, text: `${at.tractate} ${at.daf}`, textHebrew: `${at.tractateHebrew} ${gematriya(at.daf, { punctuation: 'none' })}`, cycle, cycleStart: start, cycleEnd: start + len - 1 };
}

// ------------------------------------------------------------------ Daf HaShavua

const DAF_SHAVUA_START = g(2005, 3, 6); // a Sunday

/** Daf HaShavua: one daf a week (Sunday to Shabbos), from 6 March 2005, in Daf Yomi order. */
export function dafHaShavua(dayNumber: DayNumber): DafYomi | null {
  if (dayNumber < DAF_SHAVUA_START) return null;
  const week = Math.floor((dayNumber - DAF_SHAVUA_START) / 7);
  const cycle = Math.floor(week / NEW_LEN) + 1;
  const start = DAF_SHAVUA_START + (cycle - 1) * NEW_LEN * 7;
  const at = bavliAt(BAVLI_NEW, week % NEW_LEN);
  return { ...at, text: `${at.tractate} ${at.daf}`, textHebrew: `${at.tractateHebrew} ${gematriya(at.daf, { punctuation: 'none' })}`, cycle, cycleStart: start, cycleEnd: start + NEW_LEN * 7 - 1 };
}

// ------------------------------------------------------------------ Yerushalmi (Vilna)

const YERUSHALMI_START = g(1980, 2, 2);
const YERUSHALMI_LEN = YERUSHALMI_VILNA.reduce((s, t) => s + t[2], 0); // 1554

/** The days on which no Yerushalmi daf is learned in Hebrew year `year`: Yom Kippur and Tisha B'Av (as observed). */
function yerushalmiSkips(year: number): DayNumber[] {
  const av9 = hebrewToDayNumber(year, AV, 9);
  return [hebrewToDayNumber(year, TISHREI, 10), dayOfWeek(av9) === 6 ? av9 + 1 : av9];
}

/** Learning days in [from, to): calendar days minus skipped days. */
function learningDaysBetween(from: DayNumber, to: DayNumber): number {
  let skips = 0;
  for (let y = dayNumberToHebrew(from).year; y <= dayNumberToHebrew(Math.max(from, to - 1)).year; y += 1) {
    for (const s of yerushalmiSkips(y)) if (s >= from && s < to) skips += 1;
  }
  return to - from - skips;
}

export interface YerushalmiYomi extends LearningPortion {
  readonly tractate: string;
  readonly tractateHebrew: string;
  readonly daf: number;
}

/**
 * Daf Yomi Yerushalmi (Vilna edition), from 2 February 1980. One daf a day; none on Yom Kippur or Tisha B'Av, when
 * this returns null. The Schottenstein (Oz VeHadar) cycle is not included (see DECISIONS.md Q-12).
 */
export function yerushalmiYomi(dayNumber: DayNumber): YerushalmiYomi | null {
  if (dayNumber < YERUSHALMI_START) return null;
  if (yerushalmiSkips(dayNumberToHebrew(dayNumber).year).includes(dayNumber)) return null;
  const learned = learningDaysBetween(YERUSHALMI_START, dayNumber);
  const cycle = Math.floor(learned / YERUSHALMI_LEN) + 1;
  let i = learned % YERUSHALMI_LEN;
  const cycleStart = dayWithLearnedCount((cycle - 1) * YERUSHALMI_LEN, dayNumber - i);
  const cycleEnd = dayWithLearnedCount(cycle * YERUSHALMI_LEN - 1, dayNumber + (YERUSHALMI_LEN - 1 - i));
  for (const [tractate, tractateHebrew, dafim] of YERUSHALMI_VILNA) {
    if (i < dafim) {
      const daf = i + 1;
      return { tractate, tractateHebrew, daf, text: `Yerushalmi ${tractate} ${daf}`, textHebrew: `ירושלמי ${tractateHebrew} ${gematriya(daf, { punctuation: 'none' })}`, cycle, cycleStart, cycleEnd };
    }
    i -= dafim;
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

/** The learning day (not a skip day) on which exactly `target` days have been learned since the start. */
function dayWithLearnedCount(target: number, near: DayNumber): DayNumber {
  let d = near;
  for (let guard = 0; guard < 100; guard += 1) {
    const count = learningDaysBetween(YERUSHALMI_START, d);
    if (count > target) d -= count - target;
    else if (count < target) d += target - count;
    else if (yerushalmiSkips(dayNumberToHebrew(d).year).includes(d)) d += 1;
    else return d;
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

// ------------------------------------------------------------------ Mishna Yomis

const MISHNA_ANCHOR = g(2010, 7, 4); // earliest cycle start confirmed in public sources
const MISHNA_FLAT: { t: number; chapter: number; mishna: number }[] = [];
MISHNA.forEach(([, , chapters], t) => chapters.forEach((count, c) => {
  for (let m = 1; m <= count; m += 1) MISHNA_FLAT.push({ t, chapter: c + 1, mishna: m });
}));
const MISHNA_DAYS = MISHNA_FLAT.length / 2; // 2096

export interface MishnaYomis extends LearningPortion {
  /** The two mishnayos (they may be in different chapters or tractates). */
  readonly mishnayos: readonly { tractate: string; tractateHebrew: string; chapter: number; mishna: number }[];
}

/** Mishna Yomis: two mishnayos a day. Supported from the cycle that began on 4 July 2010. */
export function mishnaYomis(dayNumber: DayNumber): MishnaYomis | null {
  if (dayNumber < MISHNA_ANCHOR) return null;
  const k = (dayNumber - MISHNA_ANCHOR) % MISHNA_DAYS;
  const cycleStart = dayNumber - k;
  const pair = [MISHNA_FLAT[2 * k], MISHNA_FLAT[2 * k + 1]].map((x) => {
    const m = x as { t: number; chapter: number; mishna: number };
    const [tractate, tractateHebrew] = MISHNA[m.t] as readonly [string, string, readonly number[]];
    return { tractate, tractateHebrew, chapter: m.chapter, mishna: m.mishna };
  });
  const [a, b] = pair as [MishnaYomis['mishnayos'][number], MishnaYomis['mishnayos'][number]];
  const he = (x: typeof a) => `${gematriya(x.chapter, { punctuation: 'none' })}:${gematriya(x.mishna, { punctuation: 'none' })}`;
  const text =
    a.tractate === b.tractate && a.chapter === b.chapter
      ? `${a.tractate} ${a.chapter}:${a.mishna}-${b.mishna}`
      : a.tractate === b.tractate
        ? `${a.tractate} ${a.chapter}:${a.mishna}-${b.chapter}:${b.mishna}`
        : `${a.tractate} ${a.chapter}:${a.mishna} - ${b.tractate} ${b.chapter}:${b.mishna}`;
  const g2 = (x: number) => gematriya(x, { punctuation: 'none' });
  const textHebrew =
    a.tractate === b.tractate && a.chapter === b.chapter
      ? `${a.tractateHebrew} ${he(a)}-${g2(b.mishna)}`
      : a.tractate === b.tractate
        ? `${a.tractateHebrew} ${he(a)}-${he(b)}`
        : `${a.tractateHebrew} ${he(a)} - ${b.tractateHebrew} ${he(b)}`;
  return { mishnayos: pair, text, textHebrew, cycleStart, cycleEnd: cycleStart + MISHNA_DAYS - 1 };
}

// ------------------------------------------------------------------ Rambam

const RAMBAM_START = g(1984, 4, 29); // 27 Nisan 5744

/** One unit of Rambam learning: a chapter of a Hilchos, or a part of the introductory sections. */
export interface RambamUnit {
  readonly hilchos: string;
  readonly hilchosHebrew: string;
  /** Chapter number, or null for an introductory section. */
  readonly chapter: number | null;
  /** For introductory sections: which part (e.g. "Positive 1-83"). */
  readonly part?: string;
}

export interface RambamYomi extends LearningPortion {
  readonly units: readonly RambamUnit[];
}

const RAMBAM_CHAPTERS: RambamUnit[] = RAMBAM.flatMap(([, en, he, chapters]) =>
  Array.from({ length: chapters }, (_, i) => ({ hilchos: en, hilchosHebrew: he, chapter: i + 1 })),
);
const intro = (part: string, he: string): RambamUnit => ({ hilchos: 'Introduction', hilchosHebrew: he, chapter: null, part });

// 3 chapters a day: 4 introductory days, then the 1,006 chapters in threes, with the Haggadah text
// (Chametz uMatzah, last chapter) on the same day as chapter 8 (339 days).
const RAMBAM3_DAYS: RambamUnit[][] = (() => {
  const days: RambamUnit[][] = [
    [intro('Introduction 1-45', 'הקדמה')],
    [intro('Positive commandments 1-248', 'מצוות עשה')],
    [intro('Negative commandments 1-365', 'מצוות לא תעשה')],
    [intro('Table of contents 1:1-14:10', 'תוכן החיבור')],
  ];
  const units: RambamUnit[][] = [];
  for (const u of RAMBAM_CHAPTERS) {
    const prev = units[units.length - 1];
    if (u.hilchosHebrew === 'הלכות חמץ ומצה' && u.chapter === 9 && prev) prev.push(u);
    else units.push([u]);
  }
  for (let i = 0; i < units.length; i += 3) days.push(units.slice(i, i + 3).flat());
  return days;
})();

// 1 chapter a day: 12 introductory days, then one chapter a day, with Seder HaTefillah parts 4 and 5 on one day (1,017 days).
const RAMBAM1_DAYS: RambamUnit[][] = (() => {
  const parts = [
    ['Introduction 1-21', 'הקדמה'], ['Introduction 22-33', 'הקדמה'], ['Introduction 34-45', 'הקדמה'],
    ['Positive commandments 1-83', 'מצוות עשה'], ['Positive commandments 84-166', 'מצוות עשה'], ['Positive commandments 167-248', 'מצוות עשה'],
    ['Negative commandments 1-122', 'מצוות לא תעשה'], ['Negative commandments 123-245', 'מצוות לא תעשה'], ['Negative commandments 246-365', 'מצוות לא תעשה'],
    ['Table of contents 1:1-4:8', 'תוכן החיבור'], ['Table of contents 5:1-9:9', 'תוכן החיבור'], ['Table of contents 10:1-14:10', 'תוכן החיבור'],
  ];
  const days: RambamUnit[][] = parts.map(([p, he]) => [intro(p as string, he as string)]);
  for (const u of RAMBAM_CHAPTERS) {
    const prev = days[days.length - 1];
    if (u.hilchosHebrew === 'סדר התפילה' && u.chapter === 5 && prev) prev.push(u);
    else days.push([u]);
  }
  return days;
})();

function rambamPortion(dayNumber: DayNumber, days: RambamUnit[][]): RambamYomi | null {
  if (dayNumber < RAMBAM_START) return null;
  const len = days.length;
  const cycle = Math.floor((dayNumber - RAMBAM_START) / len) + 1;
  const cycleStart = RAMBAM_START + (cycle - 1) * len;
  const units = days[dayNumber - cycleStart] as RambamUnit[];
  const fmt = (he: boolean) => {
    // Group consecutive chapters of the same Hilchos: "Foundations of the Torah 1-3".
    const groups: { name: string; chapters: number[]; part?: string }[] = [];
    for (const u of units) {
      const name = he ? u.hilchosHebrew : u.hilchos;
      const last = groups[groups.length - 1];
      if (u.chapter !== null && last && last.name === name && last.chapters.length) last.chapters.push(u.chapter);
      else groups.push({ name, chapters: u.chapter === null ? [] : [u.chapter], ...(u.part ? { part: u.part } : {}) });
    }
    const num = (c: number) => (he ? gematriya(c, { punctuation: 'none' }) : String(c));
    return groups
      .map((x) => {
        if (!x.chapters.length) return he ? x.name : x.part ?? x.name;
        const first = x.chapters[0] as number;
        const last = x.chapters[x.chapters.length - 1] as number;
        return `${x.name} ${first === last ? num(first) : `${num(first)}-${num(last)}`}`;
      })
      .join('; ');
  };
  return { units, text: fmt(false), textHebrew: fmt(true), cycle, cycleStart, cycleEnd: cycleStart + len - 1 };
}

/** Rambam, three chapters a day (339-day cycle), from 27 Nisan 5744 (29 April 1984). */
export function rambam3(dayNumber: DayNumber): RambamYomi | null {
  return rambamPortion(dayNumber, RAMBAM3_DAYS);
}

/** Rambam, one chapter a day (1,017-day cycle), from 27 Nisan 5744 (29 April 1984). */
export function rambam1(dayNumber: DayNumber): RambamYomi | null {
  return rambamPortion(dayNumber, RAMBAM1_DAYS);
}

// ------------------------------------------------------------------ Nach Yomi

const NACH_START = g(2007, 11, 1);
const NACH_LEN = NACH.reduce((s, b) => s + b[2], 0); // 742

export interface NachYomi extends LearningPortion {
  readonly book: string;
  readonly bookHebrew: string;
  readonly chapter: number;
}

/** Nach Yomi: one chapter of Nevi'im and Kesuvim a day, from 1 November 2007 (742-day cycle). */
export function nachYomi(dayNumber: DayNumber): NachYomi | null {
  if (dayNumber < NACH_START) return null;
  const cycle = Math.floor((dayNumber - NACH_START) / NACH_LEN) + 1;
  const cycleStart = NACH_START + (cycle - 1) * NACH_LEN;
  let i = dayNumber - cycleStart;
  for (const [book, bookHebrew, chapters] of NACH) {
    if (i < chapters) {
      const chapter = i + 1;
      return { book, bookHebrew, chapter, text: `${book} ${chapter}`, textHebrew: `${bookHebrew} ${gematriya(chapter, { punctuation: 'none' })}`, cycle, cycleStart, cycleEnd: cycleStart + NACH_LEN - 1 };
    }
    i -= chapters;
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}
