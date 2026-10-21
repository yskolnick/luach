/**
 * The molad (mean conjunction) of any month, in the Rambam's units (KH 6).
 *
 * The molad is a mean, not the true astronomical new moon, and is expressed in
 * Jerusalem mean solar time, counting hours from 6 pm (KH 6:2). It is not a clock time
 * in any modern time zone; the civil fields below are the traditional announcement form.
 *
 * @packageDocumentation
 */

import { type DayNumber } from './gregorian.js';
import {
  PARTS_PER_DAY,
  PARTS_PER_HOUR,
  PARTS_PER_MONTH,
  monthIndex,
  dayIndexToDayNumber,
  moladTishreiParts,
} from './hebrew.js';

/** A molad, both in the traditional form and as a civil (Jerusalem mean time) clock reading. */
export interface Molad {
  readonly year: number;
  readonly month: number;
  /** Hebrew day of the week the molad falls in, 0 = Sunday (Yom Rishon) … 6 = Shabbos. The day starts at 6 pm. */
  readonly dayOfWeek: number;
  /** Hours since 6 pm at the start of that Hebrew day, 0–23. */
  readonly hours: number;
  /** Chalakim after the hour, 0–1079 (1080 to the hour; 18 to the minute). */
  readonly chalakim: number;
  /** Civil date (day number) of the clock reading below. */
  readonly civilDay: DayNumber;
  /** Civil weekday of the clock reading, 0 = Sunday. Differs from `dayOfWeek` when the molad is between 6 pm and midnight. */
  readonly civilDayOfWeek: number;
  /** Civil clock hour, 0–23, in Jerusalem mean time. */
  readonly civilHour: number;
  /** Minutes after `civilHour`, 0–59. */
  readonly minutes: number;
  /** Chalakim after the minute, 0–17. */
  readonly chalakimAfterMinute: number;
  /** Chalakim since the start of the count (useful for comparing moladot). */
  readonly totalChalakim: number;
}

/** Chalakim from "day 0" to the molad of `month` in `year`. */
export function moladParts(year: number, month: number): number {
  return moladTishreiParts(year) + monthIndex(year, month) * PARTS_PER_MONTH;
}

/** The molad of `month` in `year` (months numbered from Nisan). */
export function molad(year: number, month: number): Molad {
  const total = moladParts(year, month);
  const dayIndex = Math.floor(total / PARTS_PER_DAY);
  const inDay = total - dayIndex * PARTS_PER_DAY;
  const hours = Math.floor(inDay / PARTS_PER_HOUR);
  const chalakim = inDay - hours * PARTS_PER_HOUR;

  const hebrewDay = dayIndexToDayNumber(dayIndex); // civil date whose daytime this Hebrew day contains
  const beforeMidnight = hours < 6;
  const civilDay = beforeMidnight ? hebrewDay - 1 : hebrewDay;
  const civilHour = beforeMidnight ? hours + 18 : hours - 6;
  return {
    year,
    month,
    dayOfWeek: dayIndex % 7,
    hours,
    chalakim,
    civilDay,
    civilDayOfWeek: (((civilDay + 4) % 7) + 7) % 7,
    civilHour,
    minutes: Math.floor(chalakim / 18),
    chalakimAfterMinute: chalakim % 18,
    totalChalakim: total,
  };
}
