/**
 * `luach/learning`: the daily learning cycles (daf yomi, Yerushalmi, amud yomi, daf hashavua,
 * mishna yomis, Nach yomi) and the plug-ins that put them in the day
 * view and in iCalendar. A separate entry point so that the main bundle stays small:
 *
 * ```ts
 * import { dayInfo } from 'luach';
 * import { dayLearning } from 'luach/learning';
 * dayInfo(date, { location, learning: dayLearning }); // learning included
 * dayInfo(date, { location });                        // learning: null
 * ```
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @module luach/learning
 */

import type { HebrewDate } from '../calendar/hebrew-date.js';
import type { Locale } from '../locales/types.js';
import { he } from '../locales/he.js';
import type { IcalLearning, IcalLearningItem } from '../output/ical.js';
import { gematriya } from '../text/gematriya.js';
import { dafYomi } from './bavli.js';
import { amudYomi, dafHaShavua, mishnaYomis, nachYomi, yerushalmiYomi } from './cycles.js';
import { hebrewDateArg } from '../calendar/date-input.js';
import type { DayLearning, DayLearningDetail, LearningDetail } from '../day/day-info.js';
import type { LearningPortion } from './cycles.js';

export { locate, dafYomi, BAVLI_TRACTATES, type TractateSpan, type DafPortion } from './bavli.js';
export { yerushalmiYomi, amudYomi, dafHaShavua, mishnaYomis, nachYomi, type LearningPortion } from './cycles.js';

const text = (locale: Locale, p: { text: string; textHe: string } | null): string | null => (p ? (locale.dir === 'rtl' ? p.textHe : p.text) : null);

/**
 * The one table of learning cycles. `dayLearning`, `dayLearningDetail` and `icalLearning` are all
 * made from it, so a cycle added here is in all three, in this order. `ical` is the text of the
 * iCalendar event, or null for a cycle kept out of iCalendar: Daf HaShavua is one portion for a
 * whole week, and a daily event would repeat it seven times.
 */
type IcalText = (date: HebrewDate, locale: Locale) => string | null;
interface Cycle<N extends string = string, I extends IcalText | null = IcalText | null> {
  readonly name: N;
  readonly text: (date: HebrewDate, locale: Locale) => string | null;
  readonly detail: (date: HebrewDate, locale: Locale) => LearningDetail | null;
  readonly ical: I;
}

function portionCycle<N extends string>(name: N, portion: (date: HebrewDate) => LearningPortion | null): Cycle<N, IcalText>;
function portionCycle<N extends string>(name: N, portion: (date: HebrewDate) => LearningPortion | null, ical: false): Cycle<N, null>;
function portionCycle<N extends string>(name: N, portion: (date: HebrewDate) => LearningPortion | null, ical = true): Cycle<N> {
  return {
    name,
    text: (date, locale) => text(locale, portion(date)),
    detail: (date, locale) => detail(locale, portion(date)),
    ical: ical ? (date, locale) => text(locale, portion(date)) : null,
  };
}

const dafYomiText = (date: HebrewDate, locale: Locale): string | null => {
  const d = dafYomi(date);
  return d ? (locale.dir === 'rtl' ? `${d.tractateHe} ${gematriya(d.daf)}` : `${d.tractate} ${d.daf}`) : null;
};

const CYCLES = [
  {
    name: 'dafYomi' as const,
    text: dafYomiText,
    detail: (date: HebrewDate, locale: Locale): LearningDetail | null => {
      const d = dafYomi(date);
      const t = dafYomiText(date, locale);
      return d && t ? { text: t, cycle: 'daf-yomi', cycleNumber: d.cycle, day: d.dayInCycle, length: d.cycleLength, tractate: d.tractate, tractateHe: d.tractateHe, daf: d.daf } : null;
    },
    ical: (date: HebrewDate, locale: Locale): string | null => {
      const p = dafYomi(date);
      return p ? (locale.dir === 'rtl' ? `דף יומי: ${p.tractateHe} ${gematriya(p.daf)}` : `Daf Yomi: ${p.tractate} ${p.daf}`) : null;
    },
  },
  portionCycle('yerushalmiYomi', yerushalmiYomi),
  portionCycle('amudYomi', amudYomi),
  portionCycle('mishnaYomis', mishnaYomis),
  portionCycle('nachYomi', nachYomi),
  portionCycle('dafHaShavua', dafHaShavua, false),
];

/** The name of a learning cycle: the keys of {@link dayLearning} and {@link dayLearningDetail}, from the one table of cycles. */
export type LearningCycleName = (typeof CYCLES)[number]['name'];

/**
 * The learning of a day, for `dayInfo(date, { learning: dayLearning })` and
 * `nowInfo(..., { learning: dayLearning })`: daf yomi, Yerushalmi yomi, amud yomi, mishna yomis,
 * Nach yomi and Daf HaShavua, named in the locale; null for a cycle that is
 * not running that day. The locale defaults to {@link he}, as in `dayInfo`.
 */
export function dayLearning(date: HebrewDate, locale: Locale = he): DayLearning {
  date = hebrewDateArg(date, 'dayLearning');
  return Object.fromEntries(CYCLES.map((c) => [c.name, c.text(date, locale)])) as DayLearning;
}
// The hook `dayInfo` fills `learningDetail` from (`DayLearningSource.detail`). It is the same as
// `dayLearningDetail`, which is the one name to call; do not use this.
dayLearning.detail = (date: HebrewDate, locale: Locale = he): DayLearningDetail => dayLearningDetail(date, locale);

/** The learning cycles that can go in an iCalendar file: those of {@link LearningCycleName} the table gives an iCalendar text (not Daf HaShavua). */
export type IcalLearningName = Extract<(typeof CYCLES)[number], { readonly ical: IcalText }>['name'];

const ICAL_CYCLES: readonly Cycle[] = CYCLES.filter((c) => c.ical !== null);
const ICAL_NAMES: readonly string[] = ICAL_CYCLES.map((c) => c.name);

/**
 * The learning cycles to include in `toICalendar`, by name:
 * `toICalendar(from, to, { learning: icalLearning(['dafYomi', 'mishnaYomis']) })`.
 * A name given more than once counts once, in the order first given. Throws a RangeError for an unknown name.
 */
export function icalLearning(names: readonly IcalLearningName[]): IcalLearning {
  for (const n of names) if (!ICAL_NAMES.includes(n)) throw new RangeError(`Unknown learning cycle "${String(n)}"; use ${ICAL_NAMES.join(', ')}`);
  // A name given twice is one cycle: the list may come from a request, and repeats would only multiply events.
  const list = [...new Set(names)].map((n) => ICAL_CYCLES.find((c) => c.name === n)!);
  return (date: HebrewDate, locale: Locale): IcalLearningItem[] => {
    const out: IcalLearningItem[] = [];
    for (const c of list) {
      const t = c.ical!(date, locale);
      if (t) out.push({ name: c.name, text: t });
    }
    return out;
  };
}

const detail = (locale: Locale, p: LearningPortion | null): LearningDetail | null =>
  p ? { text: locale.dir === 'rtl' ? p.textHe : p.text, cycle: p.cycle, cycleNumber: p.cycleNumber, day: p.day, length: p.length } : null;

/**
 * The learning of a day as data: for each cycle of {@link dayLearning}, the text it shows, the
 * cycle, the cycle's number, the day within it and its length; for daf yomi also the tractate (in
 * English and Hebrew) and the daf. Null for a cycle that is not running that day.
 */
export function dayLearningDetail(date: HebrewDate, locale: Locale = he): DayLearningDetail {
  date = hebrewDateArg(date, 'dayLearningDetail');
  return Object.fromEntries(CYCLES.map((c) => [c.name, c.detail(date, locale)])) as DayLearningDetail;
}
