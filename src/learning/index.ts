/**
 * `luach/learning`: the daily learning cycles (daf yomi, Yerushalmi, amud yomi, daf hashavua,
 * mishna yomis, Rambam, Sefer HaMitzvos, Nach yomi) and the plug-ins that put them in the day
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
import { amudYomi, mishnaYomis, nachYomi, rambamOneChapter, rambamThreeChapters, yerushalmiYomi } from './cycles.js';
import { hebrewDateArg } from '../calendar/date-input.js';
import type { DayLearningDetail, LearningDetail } from '../day/day-info.js';
import type { LearningPortion } from './cycles.js';

export { locate, dafYomi, BAVLI_TRACTATES, type TractateSpan, type DafPortion } from './bavli.js';
export { yerushalmiYomi, amudYomi, dafHaShavua, mishnaYomis, rambamOneChapter, rambamThreeChapters, seferHaMitzvosDay, nachYomi, type LearningPortion } from './cycles.js';

const text = (locale: Locale, p: { text: string; textHe: string } | null): string | null => (p ? (locale.dir === 'rtl' ? p.textHe : p.text) : null);

/**
 * The learning of a day, for `dayInfo(date, { learning: dayLearning })` and
 * `nowInfo(..., { learning: dayLearning })`: daf yomi, Yerushalmi yomi, amud yomi, mishna yomis,
 * Rambam (one and three chapters) and Nach yomi, named in the locale; null for a cycle that is
 * not running that day. The locale defaults to {@link he}, as in `dayInfo`.
 */
export function dayLearning(date: HebrewDate, locale: Locale = he): Readonly<Record<string, string | null>> {
  return learningText(date, locale);
}
// dayInfo fills `learningDetail` from this.
dayLearning.detail = (date: HebrewDate, locale: Locale = he): DayLearningDetail => dayLearningDetail(date, locale);

function learningText(date: HebrewDate, locale: Locale): Readonly<Record<string, string | null>> {
  date = hebrewDateArg(date, 'dayLearning');
  const d = dafYomi(date);
  return {
    dafYomi: d ? (locale.dir === 'rtl' ? `${d.tractateHe} ${gematriya(d.daf)}` : `${d.tractate} ${d.daf}`) : null,
    yerushalmiYomi: text(locale, yerushalmiYomi(date)),
    amudYomi: text(locale, amudYomi(date)),
    mishnaYomis: text(locale, mishnaYomis(date)),
    rambamOneChapter: text(locale, rambamOneChapter(date)),
    rambamThreeChapters: text(locale, rambamThreeChapters(date)),
    nachYomi: text(locale, nachYomi(date)),
  };
}

/** The learning cycles that can go in an iCalendar file. */
export type IcalLearningName = 'dafYomi' | 'yerushalmiYomi' | 'mishnaYomis' | 'rambamOneChapter' | 'rambamThreeChapters' | 'nachYomi';

const ICAL_NAMES: readonly string[] = ['dafYomi', 'yerushalmiYomi', 'mishnaYomis', 'rambamOneChapter', 'rambamThreeChapters', 'nachYomi'];

/**
 * The learning cycles to include in `toICalendar`, by name:
 * `toICalendar(from, to, { learning: icalLearning(['dafYomi', 'mishnaYomis']) })`.
 * Throws a RangeError for an unknown name.
 */
export function icalLearning(names: readonly IcalLearningName[]): IcalLearning {
  for (const n of names) if (!ICAL_NAMES.includes(n)) throw new RangeError(`Unknown learning cycle "${String(n)}"; use ${ICAL_NAMES.join(', ')}`);
  const list = [...names];
  return (date: HebrewDate, locale: Locale): IcalLearningItem[] => {
    const rtl = locale.dir === 'rtl';
    const out: IcalLearningItem[] = [];
    for (const name of list) {
      let t: string | null;
      if (name === 'dafYomi') {
        const p = dafYomi(date);
        t = p ? (rtl ? `דף יומי: ${p.tractateHe} ${gematriya(p.daf)}` : `Daf Yomi: ${p.tractate} ${p.daf}`) : null;
      } else {
        t = text(locale, { yerushalmiYomi, mishnaYomis, rambamOneChapter, rambamThreeChapters, nachYomi }[name](date));
      }
      if (t) out.push({ name, text: t });
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
  const d = dafYomi(date);
  const text = learningText(date, locale);
  return {
    dafYomi: d ? { text: text.dafYomi!, cycle: 'daf-yomi', cycleNumber: d.cycle, day: d.dayInCycle, length: d.cycleLength, tractate: d.tractate, tractateHe: d.tractateHe, daf: d.daf } : null,
    yerushalmiYomi: detail(locale, yerushalmiYomi(date)),
    amudYomi: detail(locale, amudYomi(date)),
    mishnaYomis: detail(locale, mishnaYomis(date)),
    rambamOneChapter: detail(locale, rambamOneChapter(date)),
    rambamThreeChapters: detail(locale, rambamThreeChapters(date)),
    nachYomi: detail(locale, nachYomi(date)),
  };
}
