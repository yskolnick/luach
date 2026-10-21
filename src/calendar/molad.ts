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

import { daysBeforeMonth, monthsBeforeYear, monthsOfYear, MOLAD_BAHARAD, MONTH_PARTS, PARTS_PER_DAY, PARTS_PER_HOUR, assertYear } from './year.js';

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
  /** The same instant on a midnight-based clock, as announced: weekday of the civil day, hour (0–23), minutes, and remaining chalakim (0–17). */
  readonly clock: { readonly dayOfWeek: number; readonly hour: number; readonly minute: number; readonly chalakim: number };
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
    clock: { dayOfWeek: clockDow, hour: clockHour, minute: Math.floor(parts / 18), chalakim: parts % 18 },
  };
}
