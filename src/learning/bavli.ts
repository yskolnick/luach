/**
 * Daf Yomi (Babylonian Talmud, Vilna pagination): one folio (daf) a day.
 *
 * The first cycle began on 1 Tishrei 5684 (11 September 1923), at Rabbi Meir Shapiro's
 * proposal. Each tractate is learned from daf 2 to its last daf. Me'ilah is followed by
 * Kinnim, Tamid and Middos, which Daf Yomi counts as dafim 22–37 of one sequence
 * (Kinnim 23–25, Tamid 26–33, Middos 34–37). Shekalim had 13 dafim in cycles 1–7 and,
 * from cycle 8 (1975), 22 dafim (the Vilna Yerushalmi pagination), giving 2,702 and then
 * 2,711 dafim a cycle. Sources: docs/research/2026-10-21-learning-cycles.md.
 *
 * @packageDocumentation
 */

import { civilToDays } from '../time/civil.js';
import type { HebrewDate } from '../calendar/hebrew-date.js';

/** A tractate with its first and last daf in a learning sequence. */
export interface TractateSpan {
  /** Transliterated name (Sefaria-style spelling). */
  readonly name: string;
  /** Hebrew name. */
  readonly he: string;
  readonly first: number;
  readonly last: number;
}

const T = (name: string, he: string, last: number, first = 2): TractateSpan => ({ name, he, first, last });

function bavliOrder(shekalimLast: number): TractateSpan[] {
  return [
    T('Berakhot', 'ברכות', 64), T('Shabbat', 'שבת', 157), T('Eruvin', 'עירובין', 105), T('Pesachim', 'פסחים', 121),
    T('Shekalim', 'שקלים', shekalimLast), T('Yoma', 'יומא', 88), T('Sukkah', 'סוכה', 56), T('Beitzah', 'ביצה', 40),
    T('Rosh Hashanah', 'ראש השנה', 35), T('Taanit', 'תענית', 31), T('Megillah', 'מגילה', 32), T('Moed Katan', 'מועד קטן', 29),
    T('Chagigah', 'חגיגה', 27), T('Yevamot', 'יבמות', 122), T('Ketubot', 'כתובות', 112), T('Nedarim', 'נדרים', 91),
    T('Nazir', 'נזיר', 66), T('Sotah', 'סוטה', 49), T('Gittin', 'גיטין', 90), T('Kiddushin', 'קידושין', 82),
    T('Bava Kamma', 'בבא קמא', 119), T('Bava Metzia', 'בבא מציעא', 119), T('Bava Batra', 'בבא בתרא', 176), T('Sanhedrin', 'סנהדרין', 113),
    T('Makkot', 'מכות', 24), T('Shevuot', 'שבועות', 49), T('Avodah Zarah', 'עבודה זרה', 76), T('Horayot', 'הוריות', 14),
    T('Zevachim', 'זבחים', 120), T('Menachot', 'מנחות', 110), T('Chullin', 'חולין', 142), T('Bekhorot', 'בכורות', 61),
    T('Arakhin', 'ערכין', 34), T('Temurah', 'תמורה', 34), T('Keritot', 'כריתות', 28), T('Meilah', 'מעילה', 22),
    T('Kinnim', 'קנים', 25, 23), T('Tamid', 'תמיד', 33, 26), T('Middot', 'מידות', 37, 34), T('Niddah', 'נדה', 73),
  ];
}

/** A day's portion in a page-a-day cycle. */
export interface DafPortion {
  /** Tractate (transliterated). */
  readonly tractate: string;
  /** Tractate in Hebrew. */
  readonly tractateHe: string;
  /** The daf (folio) number. */
  readonly daf: number;
  /** Cycle number (1 = the first cycle). */
  readonly cycle: number;
  /** 1-based day within the cycle. */
  readonly dayInCycle: number;
  /** Days in this cycle. */
  readonly cycleLength: number;
}

const FIRST_CYCLE_START = civilToDays(1923, 9, 11);
const SHEKALIM_CHANGE_CYCLE = 8;

function length(order: TractateSpan[]): number {
  return order.reduce((n, t) => n + t.last - t.first + 1, 0);
}

const OLD = bavliOrder(13);
const NEW = bavliOrder(22);
const OLD_LEN = length(OLD); // 2702
const NEW_LEN = length(NEW); // 2711

/** First day (epoch days) of Daf Yomi cycle `n`. */
export function dafYomiCycleStart(n: number): number {
  if (n < 1) throw new RangeError('Cycle numbers start at 1');
  const old = Math.min(n - 1, SHEKALIM_CHANGE_CYCLE - 1);
  return FIRST_CYCLE_START + old * OLD_LEN + Math.max(0, n - SHEKALIM_CHANGE_CYCLE) * NEW_LEN;
}

/** Locates day `offset` (0-based) in a list of tractate spans. */
export function locate(order: readonly TractateSpan[], offset: number): { tractate: TractateSpan; page: number } {
  let rem = offset;
  for (const t of order) {
    const n = t.last - t.first + 1;
    if (rem < n) return { tractate: t, page: t.first + rem };
    rem -= n;
  }
  throw new RangeError('Offset past the end of the cycle');
}

/** The Daf Yomi (Bavli) for a date, or null before 11 September 1923. */
export function dafYomi(date: HebrewDate | number): DafPortion | null {
  const days = typeof date === 'number' ? date : date.epochDays;
  if (days < FIRST_CYCLE_START) return null;
  let cycle: number;
  let start: number;
  const changeStart = dafYomiCycleStart(SHEKALIM_CHANGE_CYCLE);
  if (days < changeStart) {
    cycle = Math.floor((days - FIRST_CYCLE_START) / OLD_LEN) + 1;
    start = dafYomiCycleStart(cycle);
  } else {
    cycle = SHEKALIM_CHANGE_CYCLE + Math.floor((days - changeStart) / NEW_LEN);
    start = dafYomiCycleStart(cycle);
  }
  const order = cycle < SHEKALIM_CHANGE_CYCLE ? OLD : NEW;
  const len = cycle < SHEKALIM_CHANGE_CYCLE ? OLD_LEN : NEW_LEN;
  const { tractate, page } = locate(order, days - start);
  return { tractate: tractate.name, tractateHe: tractate.he, daf: page, cycle, dayInCycle: days - start + 1, cycleLength: len };
}

/** The tractate list (with last daf) used by Daf Yomi from cycle 8 on. */
export const BAVLI_TRACTATES: readonly TractateSpan[] = NEW;
