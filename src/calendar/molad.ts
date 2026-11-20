/**
 * The molad (mean conjunction) of any month, as announced in shul.
 *
 * Rambam, Hilchos Kiddush HaChodesh 6:2–8. Times are in the calendar's hours, which are
 * counted from 6 pm of the evening before; the announced clock time is the same instant
 * read on a 24-hour clock starting at midnight. Both are given. These are mean
 * Jerusalem times (the calendar's reckoning), not local clock time.
 *
 * @packageDocumentation
 */

import { daysBeforeMonth, hebrewToDays, monthsBeforeYear, monthsOfYear, MOLAD_BAHARAD, MONTH_PARTS, PARTS_PER_DAY, PARTS_PER_HOUR, assertYear } from './year.js';
import { daysToCivil, type CivilDate } from '../time/civil.js';
import { weekdayName } from '../text/format.js';
import { wordName } from '../locales/terms.js';
import { he } from '../locales/he.js';
import type { Locale } from '../locales/types.js';

/** A molad, broken into its parts. */
export interface Molad {
  /** Hebrew year and month of the molad. */
  readonly year: number;
  readonly month: number;
  /** Chalakim since the start of the calendar's first day (for arithmetic). */
  readonly totalParts: number;
  /**
   * Day of the week of the Hebrew day on which the molad falls (0 = Sunday … 6 = Shabbos).
   * A molad at 8 pm on Thursday evening is on Friday's Hebrew day (5).
   */
  readonly dayOfWeek: number;
  /** Hours since 6 pm the evening before (0–23). */
  readonly hours: number;
  /** Chalakim past the hour (0–1079). */
  readonly parts: number;
  /**
   * The same instant on a midnight-based clock, as announced: weekday of the civil day, hour
   * (0–23), minutes, remaining chalakim (0–17), and the part of the civil day, `'early-morning'`
   * (before 6 am), `'day'` or `'night'` (from 6 pm, the night of the next Hebrew day; on a
   * Saturday, Motzaei Shabbos), and the civil `date` of that clock time (Jerusalem mean time).
   * Build your own wording from these, or use {@link moladAnnouncement}.
   */
  readonly clock: { readonly date: CivilDate; readonly dayOfWeek: number; readonly hour: number; readonly minute: number; readonly chalakim: number; readonly period: 'early-morning' | 'day' | 'night' };
}

/** Index of `month` within `year`, counting Tishrei as 0. */
function monthIndex(year: number, month: number): number {
  const i = monthsOfYear(year).indexOf(month as never);
  if (i < 0) throw new RangeError(`Year ${year} has no month ${month}`);
  return i;
}

/** The molad of `month` in `year`. */
export function molad(year: number, month: number): Molad {
  assertYear(year);
  // daysBeforeMonth validates that the month exists in this year.
  daysBeforeMonth(year, month);
  const totalParts = MOLAD_BAHARAD + (monthsBeforeYear(year) + monthIndex(year, month)) * MONTH_PARTS;
  const day = Math.floor(totalParts / PARTS_PER_DAY);
  const inDay = totalParts % PARTS_PER_DAY;
  const hours = Math.floor(inDay / PARTS_PER_HOUR);
  const parts = inDay % PARTS_PER_HOUR;
  const dayOfWeek = day % 7;
  // Calendar hour 0 is 6 pm of the previous civil day.
  const clockHour = (hours + 18) % 24;
  const clockDow = hours < 6 ? (dayOfWeek + 6) % 7 : dayOfWeek;
  return {
    year,
    month,
    totalParts,
    dayOfWeek,
    hours,
    parts,
    // Day 0 of the count is the day before 1 Tishrei of year 1 (as in moladInstant); an evening
    // clock time (calendar hours 0–5) is on the civil day before the Hebrew day.
    clock: { date: daysToCivil(hebrewToDays(1, 7, 1) - 1 + day - (hours < 6 ? 1 : 0)), dayOfWeek: clockDow, hour: clockHour, minute: Math.floor(parts / 18), chalakim: parts % 18, period: clockHour >= 18 ? 'night' : clockHour < 6 ? 'early-morning' : 'day' },
  };
}

/** Formats for {@link moladAnnouncement}, for an app's own clock and date style. */
export interface MoladAnnouncementOptions {
  /** The civil date of the molad's clock time, put after the day ("Tuesday night, Dec 12, …"). Left out, no date. */
  readonly date?: (date: CivilDate) => string;
  /** The clock time (hour 0–23, minute). Left out: 20:01 in Hebrew, 8:01 pm in English. */
  readonly time?: (hour: number, minute: number) => string;
}

/**
 * The molad as announced on Shabbos Mevorchim, in the words of `locale` (default `he`), e.g.
 * "ליל רביעי, 20:01 ו־3 חלקים" (`he`) or "Tuesday night, 8:01 pm and 3 chalakim" (`ashkenazi`),
 * molad Teves 5784: the night after Tuesday is the night of Wednesday, ליל רביעי. A Hebrew set
 * (`he`, `yi`) gives Hebrew with a 24-hour clock; the others English with am and pm. The weekdays
 * and Motzaei Shabbos are the locale's own names (`weekday.N`, `term.motzaei-shabbos`), so an app
 * changes a word through its names. One chelek is "חלק אחד"; with none, the chalakim are left out.
 * Times are the calendar's (Jerusalem mean time), not local clock time. Announcement customs vary
 * (some say "after" the hour, some use a 24-hour clock); for another wording, build it from
 * `molad(year, month).clock`. `options.date` and `options.time` put the app's own formats in:
 * "Tuesday night, Dec 12, 20:01 and 3 chalakim".
 */
export function moladAnnouncement(year: number, month: number, locale: Locale = he, options: MoladAnnouncementOptions = {}): string {
  const { date, dayOfWeek, hour, minute, chalakim, period } = molad(year, month).clock;
  const hh = String(minute).padStart(2, '0');
  const on = options.date ? `, ${options.date(date)}` : '';
  const day = (d: number) => weekdayName(d, locale);
  if ((locale.base ?? (locale.numerals === 'hebrew' ? 'he' : 'en')) === 'he') {
    // The evening belongs to the next Hebrew day: ליל + that day's name without "יום".
    const when = period === 'night' ? `ליל ${day((dayOfWeek + 1) % 7).replace(/^יום /, '')}` : day(dayOfWeek);
    const parts = chalakim === 0 ? '' : chalakim === 1 ? ' וחלק אחד' : ` ו־${chalakim} חלקים`;
    return `${when}${on}, ${options.time ? options.time(hour, minute) : `${hour}:${hh}`}${parts}`;
  }
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  // "Shabbos night" means Friday night in English, so Saturday evening is the set's Motzaei Shabbos.
  const when = period === 'day' ? day(dayOfWeek) : period === 'early-morning' ? `${day(dayOfWeek)} early morning` : dayOfWeek === 6 ? wordName('motzaei-shabbos', locale) : `${day(dayOfWeek)} night`;
  const parts = chalakim === 0 ? '' : ` and ${chalakim} ${chalakim === 1 ? 'chelek' : 'chalakim'}`;
  return `${when}${on}, ${options.time ? options.time(hour, minute) : `${h12}:${hh} ${hour < 12 ? 'am' : 'pm'}`}${parts}`;
}
