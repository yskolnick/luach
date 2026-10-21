/**
 * Daily learning cycles other than Daf Yomi Bavli (see ./bavli.ts).
 *
 * Every cycle is computed from its start date and the structure of its text; no day-by-day
 * tables. Start dates and rules: docs/research/2026-10-21-learning-cycles.md. Learning
 * days are civil days, as the cycles' calendars print them.
 *
 * Not included (they need published day-by-day tables; ROADMAP LRN-06–LRN-08): Chofetz
 * Chaim and Shemiras HaLashon yomi, Tanya yomi, the mitzvos of each Sefer HaMitzvos day,
 * the Schottenstein Yerushalmi cycle and Dirshu's Daf HaYomi B'Halacha.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date';
import { Month } from '../calendar/months';
import { civilToDays } from '../time/civil';
import { BAVLI_TRACTATES, locate } from './bavli';
import { gematriya } from '../text/gematriya';

const g = (n: number) => gematriya(n);
const gp = (n: number) => gematriya(n, { punctuate: false });
import { BAVLI_AMUDIM, MISHNAH, NACH, RAMBAM, YERUSHALMI_VILNA } from './data';

/** One day's portion in a learning cycle. */
export interface LearningPortion {
  /** Cycle id, e.g. `"mishna-yomis"`. */
  readonly cycle: string;
  /** Cycle number, counted from the first cycle (or from a documented anchor). */
  readonly cycleNumber: number;
  /** 1-based day (or week) within the cycle. */
  readonly day: number;
  /** Days (or weeks) in the cycle. */
  readonly length: number;
  /** English description, e.g. "Berakhot 2:3–2:4". */
  readonly text: string;
  /** Hebrew description, e.g. "ברכות ב:ג–ב:ד". */
  readonly textHe: string;
}

const days = (y: number, m: number, d: number) => civilToDays(y, m, d);
const toDays = (date: HebrewDate | number) => (typeof date === 'number' ? date : date.epochDays);

function position(start: number, length: number, day: number, firstCycle = 1): { cycleNumber: number; index: number } | null {
  if (day < start) return null;
  const k = Math.floor((day - start) / length);
  return { cycleNumber: firstCycle + k, index: day - start - k * length };
}

// ------------------------------------------------------------ Yerushalmi (Vilna)

const YERUSHALMI_EPOCH = days(1980, 2, 2);
const YERUSHALMI_LENGTH = YERUSHALMI_VILNA.reduce((n, t) => n + t[3] - t[2] + 1, 0); // 1554

function isYerushalmiPause(d: number): boolean {
  const h = HebrewDate.fromEpochDays(d);
  if (h.month === Month.TISHREI && h.day === 10) return true;
  const av9 = new HebrewDate(h.year, Month.AV, 9);
  const fast = av9.isShabbos ? av9.next() : av9;
  return d === fast.epochDays;
}

function pausesBetween(from: number, to: number): number {
  // Yom Kippur and Tisha B'Av (as observed) in [from, to).
  let n = 0;
  const y0 = HebrewDate.fromEpochDays(from).year;
  const y1 = HebrewDate.fromEpochDays(to).year;
  for (let y = y0; y <= y1; y++) {
    const yk = new HebrewDate(y, Month.TISHREI, 10).epochDays;
    const av9 = new HebrewDate(y, Month.AV, 9);
    const tb = (av9.isShabbos ? av9.next() : av9).epochDays;
    if (yk >= from && yk < to) n++;
    if (tb >= from && tb < to) n++;
  }
  return n;
}

/**
 * Daf Yomi Yerushalmi, Vilna pagination (one daf a day from 15 Shevat 5740, 2 February
 * 1980; the cycle pauses on Yom Kippur and on Tisha B'Av as observed). Returns null on
 * those days and before the start.
 */
export function yerushalmiYomi(date: HebrewDate | number): LearningPortion | null {
  const d = toDays(date);
  if (d < YERUSHALMI_EPOCH || isYerushalmiPause(d)) return null;
  const learned = d - YERUSHALMI_EPOCH - pausesBetween(YERUSHALMI_EPOCH, d);
  const cycleNumber = Math.floor(learned / YERUSHALMI_LENGTH) + 1;
  let rem = learned % YERUSHALMI_LENGTH;
  for (const [name, he, first, last] of YERUSHALMI_VILNA) {
    const n = last - first + 1;
    if (rem < n) {
      const daf = first + rem;
      return { cycle: 'yerushalmi-yomi-vilna', cycleNumber, day: (learned % YERUSHALMI_LENGTH) + 1, length: YERUSHALMI_LENGTH, text: `${name} ${daf}`, textHe: `${he} ${g(daf)}` };
    }
    rem -= n;
  }
  return null;
}

// ------------------------------------------------------------ Amud HaYomi (Dirshu)

const AMUD_EPOCH = days(2023, 10, 16);
const AMUDIM: { name: string; he: string; count: number }[] = BAVLI_AMUDIM.map(([name, he, last]) => {
  const daf = parseInt(last, 10);
  return { name, he, count: (daf - 2) * 2 + (last.endsWith('b') ? 2 : 1) };
});
const AMUD_LENGTH = AMUDIM.reduce((n, t) => n + t.count, 0);

/**
 * Amud HaYomi (Dirshu): one amud a day, from Berachos 2a on 1 Cheshvan 5784 (16 October
 * 2023), every day. How the cycle will handle Kinnim, Tamid and Middos after Me'ilah 22a
 * (February 2038) is not yet published; until it is, this returns null from that point.
 */
export function amudYomi(date: HebrewDate | number): LearningPortion | null {
  const d = toDays(date);
  const p = position(AMUD_EPOCH, AMUD_LENGTH, d);
  if (!p || p.cycleNumber > 1) return null;
  let rem = p.index;
  for (const t of AMUDIM) {
    if (rem < t.count) {
      const daf = 2 + Math.floor(rem / 2);
      const side = rem % 2 === 0 ? 'a' : 'b';
      const sideHe = side === 'a' ? '.' : ':'; // the customary marks for amud aleph and beis
      if (t.name === 'Meilah' && (daf > 22 || (daf === 22 && side === 'b'))) return null;
      return { cycle: 'amud-yomi', cycleNumber: 1, day: p.index + 1, length: AMUD_LENGTH, text: `${t.name} ${daf}${side}`, textHe: `${t.he} ${gp(daf)}${sideHe}` };
    }
    rem -= t.count;
  }
  return null;
}

// ------------------------------------------------------------ Daf HaShavua

const DAF_SHAVUA_EPOCH = days(2005, 3, 6); // a Sunday
const DAF_SHAVUA_LENGTH = BAVLI_TRACTATES.reduce((n, t) => n + t.last - t.first + 1, 0);

/**
 * Daf HaShavua: one daf a week, in Daf Yomi order, weeks starting Sunday, from 6 March
 * 2005. The start date and week boundary are back-computed (*as built*, low confidence;
 * see DECISIONS.md).
 */
export function dafHaShavua(date: HebrewDate | number): LearningPortion | null {
  const d = toDays(date);
  if (d < DAF_SHAVUA_EPOCH) return null;
  const week = Math.floor((d - DAF_SHAVUA_EPOCH) / 7);
  const cycleNumber = Math.floor(week / DAF_SHAVUA_LENGTH) + 1;
  const idx = week % DAF_SHAVUA_LENGTH;
  const { tractate, page } = locate(BAVLI_TRACTATES, idx);
  return { cycle: 'daf-hashavua', cycleNumber, day: idx + 1, length: DAF_SHAVUA_LENGTH, text: `${tractate.name} ${page}`, textHe: `${tractate.he} ${g(page)}` };
}

// ------------------------------------------------------------ Mishna Yomis

const MISHNA_ANCHOR = days(2021, 12, 25); // cycle 14
const MISHNAYOS: { name: string; he: string; chapter: number; mishna: number }[] = [];
for (const [name, he, chapters] of MISHNAH) {
  chapters.forEach((count, c) => {
    for (let m = 1; m <= count; m++) MISHNAYOS.push({ name, he, chapter: c + 1, mishna: m });
  });
}
const MISHNA_DAYS = MISHNAYOS.length / 2; // 2096

/**
 * Mishna Yomis: two mishnayos a day straight through the Mishnah (4,192 mishnayos, 2,096
 * days). Anchored on the 14th cycle, which began 21 Teves 5782 (25 December 2021); earlier
 * cycles are counted back from it.
 */
export function mishnaYomis(date: HebrewDate | number): LearningPortion | null {
  const d = toDays(date);
  const start = MISHNA_ANCHOR - 13 * MISHNA_DAYS;
  const p = position(start, MISHNA_DAYS, d);
  if (!p) return null;
  const a = MISHNAYOS[p.index * 2]!;
  const b = MISHNAYOS[p.index * 2 + 1]!;
  const fmt = (x: typeof a, withName: boolean) => `${withName ? x.name + ' ' : ''}${x.chapter}:${x.mishna}`;
  const text = a.name === b.name ? `${fmt(a, true)}–${fmt(b, false)}` : `${fmt(a, true)} – ${fmt(b, true)}`;
  const heNum = (x: typeof a) => `${gp(x.chapter)}:${gp(x.mishna)}`;
  const textHe = a.name === b.name ? `${a.he} ${heNum(a)}–${heNum(b)}` : `${a.he} ${heNum(a)} – ${b.he} ${heNum(b)}`;
  return { cycle: 'mishna-yomis', cycleNumber: p.cycleNumber, day: p.index + 1, length: MISHNA_DAYS, text, textHe };
}

// ------------------------------------------------------------ Rambam

const RAMBAM_EPOCH = days(1984, 4, 29);

type RambamUnit = { name: string; he: string; label: string; labelHe: string };

function rambamUnits(track: 1 | 3): RambamUnit[] {
  const units: RambamUnit[] = [];
  for (const [name, he, chapters] of RAMBAM) {
    if (name === 'The Order of Prayer') {
      // Seder Tefillos: five sections in the 3-chapter track; four days in the 1-chapter track,
      // the fourth running to the end of Sefer Ahavah.
      const n = track === 3 ? 5 : 4;
      for (let i = 1; i <= n; i++) {
        const last = track === 1 && i === 4;
        units.push({ name, he, label: last ? 'parts 4–5' : `part ${i}`, labelHe: last ? 'ד–ה' : gp(i) });
      }
      continue;
    }
    for (let c = 1; c <= chapters; c++) {
      // Nusach HaHaggadah (chapter 9 of Chametz uMatzah): its own day in the 1-chapter
      // track; in the 3-chapter track it is learned with chapter 8 and not counted.
      if (track === 3 && name === 'Leavened and Unleavened Bread' && c === 9) continue;
      const withHaggadah = track === 3 && name === 'Leavened and Unleavened Bread' && c === 8;
      units.push({ name, he, label: withHaggadah ? 'chapter 8 and the Haggadah' : c === 9 && name === 'Leavened and Unleavened Bread' ? 'Haggadah' : `chapter ${c}`, labelHe: withHaggadah ? 'פרק ח והגדה' : c === 9 && name === 'Leavened and Unleavened Bread' ? 'נוסח ההגדה' : `פרק ${gp(c)}` });
    }
  }
  return units;
}

const ONE_INTRO = [
  ['Introduction, part 1', 'הקדמה א'], ['Introduction, part 2', 'הקדמה ב'], ['Introduction, part 3', 'הקדמה ג'],
  ['Positive commandments 1–83', 'מצוות עשה א–פג'], ['Positive commandments 84–166', 'מצוות עשה פד–קסו'], ['Positive commandments 167–248', 'מצוות עשה קסז–רמח'],
  ['Negative commandments 1–122', 'מצוות לא תעשה א–קכב'], ['Negative commandments 123–244', 'מצוות לא תעשה קכג–רמד'], ['Negative commandments 245–365', 'מצוות לא תעשה רמה–שסה'],
  ['Listing of mitzvos by hilchos, part 1', 'מניין המצוות על סדר ההלכות א'], ['Listing of mitzvos by hilchos, part 2', 'מניין המצוות על סדר ההלכות ב'], ['Listing of mitzvos by hilchos, part 3', 'מניין המצוות על סדר ההלכות ג'],
] as const;
const THREE_INTRO = [
  ['Introduction', 'הקדמה'], ['Positive commandments 1–248', 'מצוות עשה'], ['Negative commandments 1–365', 'מצוות לא תעשה'], ['Listing of mitzvos by hilchos', 'מניין המצוות על סדר ההלכות'],
] as const;

const ONE_UNITS = rambamUnits(1);
const THREE_UNITS = rambamUnits(3);
const ONE_LENGTH = ONE_INTRO.length + ONE_UNITS.length; // 1017
const THREE_LENGTH = THREE_INTRO.length + THREE_UNITS.length / 3; // 339

const describe = (us: RambamUnit[]): [string, string] => {
  const parts: string[] = [];
  const partsHe: string[] = [];
  for (const u of us) {
    const prev = parts.length ? us[us.indexOf(u) - 1] : undefined;
    if (prev && prev.name === u.name) {
      parts[parts.length - 1] += `, ${u.label.replace(/^chapter /, '')}`;
      partsHe[partsHe.length - 1] += `, ${u.labelHe}`;
    } else {
      parts.push(`${u.name} ${u.label}`);
      partsHe.push(`${u.he} ${u.labelHe}`);
    }
  }
  return [parts.join('; '), partsHe.join('; ')];
};

/** Rambam, one chapter a day (Chabad cycle from 27 Nisan 5744, 29 April 1984; 1,017 days). */
export function rambamOneChapter(date: HebrewDate | number): LearningPortion | null {
  const p = position(RAMBAM_EPOCH, ONE_LENGTH, toDays(date));
  if (!p) return null;
  const intro = ONE_INTRO[p.index];
  const [text, textHe] = intro ? [intro[0], intro[1]] : describe([ONE_UNITS[p.index - ONE_INTRO.length]!]);
  return { cycle: 'rambam-1', cycleNumber: p.cycleNumber, day: p.index + 1, length: ONE_LENGTH, text, textHe };
}

/** Rambam, three chapters a day (Chabad cycle from 27 Nisan 5744; 339 days). */
export function rambamThreeChapters(date: HebrewDate | number): LearningPortion | null {
  const p = position(RAMBAM_EPOCH, THREE_LENGTH, toDays(date));
  if (!p) return null;
  const intro = THREE_INTRO[p.index];
  const k = p.index - THREE_INTRO.length;
  const [text, textHe] = intro ? [intro[0], intro[1]] : describe(THREE_UNITS.slice(k * 3, k * 3 + 3));
  return { cycle: 'rambam-3', cycleNumber: p.cycleNumber, day: p.index + 1, length: THREE_LENGTH, text, textHe };
}

/**
 * The day number of Sefer HaMitzvos (Chabad), which runs in parallel with the
 * three-chapter Rambam cycle (Day 1 is that cycle's first day; chabad.org shows "Day 1" on
 * 1 March 2025, the start of a three-chapter cycle). The mitzvos for each day come from a
 * published table that Luach does not ship.
 */
export function seferHaMitzvosDay(date: HebrewDate | number): { cycleNumber: number; day: number } | null {
  const p = position(RAMBAM_EPOCH, THREE_LENGTH, toDays(date));
  return p ? { cycleNumber: p.cycleNumber, day: p.index + 1 } : null;
}

// ------------------------------------------------------------ Nach Yomi

const NACH_EPOCH = days(2007, 11, 1);
const NACH_CHAPTERS: { name: string; he: string; chapter: number }[] = [];
for (const [name, he, n] of NACH) for (let c = 1; c <= n; c++) NACH_CHAPTERS.push({ name, he, chapter: c });

/** Nach Yomi (OU): one chapter a day of Nevi'im and Kesuvim from 1 November 2007; 742 days. */
export function nachYomi(date: HebrewDate | number): LearningPortion | null {
  const p = position(NACH_EPOCH, NACH_CHAPTERS.length, toDays(date));
  if (!p) return null;
  const c = NACH_CHAPTERS[p.index]!;
  return { cycle: 'nach-yomi', cycleNumber: p.cycleNumber, day: p.index + 1, length: NACH_CHAPTERS.length, text: `${c.name} ${c.chapter}`, textHe: `${c.he} ${gp(c.chapter)}` };
}
