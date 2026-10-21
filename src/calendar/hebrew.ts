/**
 * The fixed Hebrew calendar, from the Rambam, Hilchos Kiddush HaChodesh (KH), chapters 6–8.
 *
 * Time is counted in chalakim (parts): 1080 to the hour, 25 920 to the day.
 * The mean month is 29 days, 12 hours and 793 chalakim (KH 6:3).
 * The first molad, of Tishrei of year 1 ("BaHaRaD"), was on day 2 (Monday), 5 hours and 204 chalakim
 * into the day, the day starting at 6 pm (KH 6:8).
 *
 * @packageDocumentation
 */

import { type DayNumber, dayOfWeek, gregorianToDayNumber } from './gregorian.js';

/** Months are numbered from Nisan, following Shemos 12:2. In a leap year Adar (12) is Adar I. */
export const NISAN = 1;
export const IYAR = 2;
export const SIVAN = 3;
export const TAMMUZ = 4;
export const AV = 5;
export const ELUL = 6;
export const TISHREI = 7;
export const CHESHVAN = 8;
export const KISLEV = 9;
export const TEVES = 10;
export const SHVAT = 11;
/** Adar in a common year; Adar I (Adar Rishon) in a leap year. */
export const ADAR = 12;
/** Adar I in a leap year (same number as {@link ADAR}). */
export const ADAR_I = 12;
/** Adar II (Adar Sheni); exists only in leap years. */
export const ADAR_II = 13;

/** A date in the Hebrew calendar. `month` counts from Nisan (see {@link NISAN}). */
export interface HebrewDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export const PARTS_PER_HOUR = 1080;
export const PARTS_PER_DAY = 24 * PARTS_PER_HOUR; // 25 920
/** Mean lunar month: 29 days, 12 hours, 793 chalakim (KH 6:3). */
export const PARTS_PER_MONTH = 29 * PARTS_PER_DAY + 12 * PARTS_PER_HOUR + 793; // 765 433
/**
 * Molad BaHaRaD, in chalakim from the start of "day 0", a Sunday (day 1 of the week).
 * BaHaRaD = Monday (day 2 of the week), 5 hours, 204 chalakim.
 */
const MOLAD_BAHARAD = 1 * PARTS_PER_DAY + 5 * PARTS_PER_HOUR + 204;
/**
 * Day number (days since 1970-01-01) of "day 0" of the count above.
 * Derived once from Rosh Hashana 5786 = Tuesday 23 September 2025, and checked in tests
 * against every year 1–9999 for weekday consistency and against independent oracles.
 */
const DAY_ZERO = gregorianToDayNumber(2025, 9, 23) - 2_112_945;

/** Earliest and latest supported Hebrew years. */
export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;

/** True if `year` is a leap year: years 3, 6, 8, 11, 14, 17 and 19 of the 19-year cycle (KH 6:11). */
export function isLeapYear(year: number): boolean {
  return (7 * year + 1) % 19 < 7;
}

/** Number of months in the Hebrew year: 12 or 13. */
export function monthsInYear(year: number): number {
  return isLeapYear(year) ? 13 : 12;
}

/** Months from the molad of Tishrei of year 1 to the molad of Tishrei of `year`. */
export function monthsBeforeYear(year: number): number {
  // 235 months per 19-year cycle; the leap-year pattern above is spread evenly by this formula.
  return Math.floor((235 * year - 234) / 19);
}

/** Chalakim from "day 0" to the molad of Tishrei of `year`. */
export function moladTishreiParts(year: number): number {
  return MOLAD_BAHARAD + monthsBeforeYear(year) * PARTS_PER_MONTH;
}

/**
 * The day of Rosh Hashana, counted from "day 0", after the four dechiyos (KH 7:1–8).
 */
function roshHashanaDayIndex(year: number): number {
  const molad = moladTishreiParts(year);
  let day = Math.floor(molad / PARTS_PER_DAY);
  const parts = molad - day * PARTS_PER_DAY; // chalakim since 6 pm
  const weekday = day % 7; // 0 = Sunday

  if (parts >= 18 * PARTS_PER_HOUR) {
    // Molad zaken: the molad is at or after noon, so Rosh Hashana is the next day (KH 7:2).
    day += 1;
  } else if (weekday === 2 && parts >= 9 * PARTS_PER_HOUR + 204 && !isLeapYear(year)) {
    // GaTaRaD: in a common year, a molad on Tuesday at or after 9h 204p would make a year of 356 days (KH 7:4).
    day += 1;
  } else if (weekday === 1 && parts >= 15 * PARTS_PER_HOUR + 589 && isLeapYear(year - 1)) {
    // BeTU'TaKPaT: after a leap year, a molad on Monday at or after 15h 589p would make the past year 382 days (KH 7:5).
    day += 1;
  }
  // Lo ADU Rosh: Rosh Hashana is never on Sunday, Wednesday or Friday (KH 7:1).
  const w = day % 7;
  if (w === 0 || w === 3 || w === 5) day += 1;
  return day;
}

/** @internal Day number of a day index in the chalakim count ("day 0" is a Sunday). */
export function dayIndexToDayNumber(dayIndex: number): DayNumber {
  return dayIndex + DAY_ZERO;
}

/** Day number (days since 1970-01-01) of 1 Tishrei of `year`. */
export function roshHashana(year: number): DayNumber {
  return roshHashanaDayIndex(year) + DAY_ZERO;
}

/** Days in the Hebrew year: 353–355 or 383–385. */
export function daysInYear(year: number): number {
  return roshHashanaDayIndex(year + 1) - roshHashanaDayIndex(year);
}

/** Year type by the lengths of Cheshvan and Kislev (KH 8:5–7). */
export type YearType = 'chaseira' | 'kesidra' | 'sheleima';

/**
 * Chaseira (deficient: Cheshvan and Kislev 29), kesidra (regular: Cheshvan 29, Kislev 30)
 * or sheleima (complete: both 30).
 */
export function yearType(year: number): YearType {
  const r = daysInYear(year) % 10;
  return r === 3 ? 'chaseira' : r === 5 ? 'sheleima' : 'kesidra';
}

/** Days in a Hebrew month. Returns 0 for a month that does not exist that year (Adar II in a common year). */
export function daysInMonth(year: number, month: number): number {
  switch (month) {
    case TISHREI:
    case SHVAT:
    case NISAN:
    case SIVAN:
    case AV:
      return 30;
    case TEVES:
    case IYAR:
    case TAMMUZ:
    case ELUL:
      return 29;
    case ADAR:
      return isLeapYear(year) ? 30 : 29;
    case ADAR_II:
      return isLeapYear(year) ? 29 : 0;
    case CHESHVAN:
      return yearType(year) === 'sheleima' ? 30 : 29;
    case KISLEV:
      return yearType(year) === 'chaseira' ? 29 : 30;
    default:
      return 0;
  }
}

/** Months of `year` in calendar order, starting from Tishrei. */
export function monthsInOrder(year: number): number[] {
  return isLeapYear(year)
    ? [TISHREI, CHESHVAN, KISLEV, TEVES, SHVAT, ADAR, ADAR_II, NISAN, IYAR, SIVAN, TAMMUZ, AV, ELUL]
    : [TISHREI, CHESHVAN, KISLEV, TEVES, SHVAT, ADAR, NISAN, IYAR, SIVAN, TAMMUZ, AV, ELUL];
}

/** Position of `month` within its year, Tishrei = 0. Throws for Adar II in a common year. */
export function monthIndex(year: number, month: number): number {
  const i = monthsInOrder(year).indexOf(month);
  if (i < 0) throw new RangeError(`Month ${month} does not exist in Hebrew year ${year}`);
  return i;
}

/** True if the Hebrew date exists and is in the supported range. */
export function isValidHebrew(year: number, month: number, day: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= MIN_YEAR &&
    year <= MAX_YEAR &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

function assertValidHebrew(year: number, month: number, day: number): void {
  if (!isValidHebrew(year, month, day)) {
    throw new RangeError(`Invalid Hebrew date: year ${year}, month ${month}, day ${day}`);
  }
}

/** Day number of a Hebrew date. Throws `RangeError` for a date that doesn't exist. */
export function hebrewToDayNumber(year: number, month: number, day: number): DayNumber {
  assertValidHebrew(year, month, day);
  let n = roshHashana(year);
  for (const m of monthsInOrder(year)) {
    if (m === month) break;
    n += daysInMonth(year, m);
  }
  return n + day - 1;
}

const FIRST_DAY = roshHashana(MIN_YEAR);
const LAST_DAY = roshHashana(MAX_YEAR + 1) - 1;

/** Hebrew date of a day number. Throws `RangeError` outside Hebrew years 1–9999. */
export function dayNumberToHebrew(dayNumber: DayNumber): HebrewDate {
  if (!Number.isInteger(dayNumber) || dayNumber < FIRST_DAY || dayNumber > LAST_DAY) {
    throw new RangeError(`Day number ${dayNumber} is outside Hebrew years ${MIN_YEAR}–${MAX_YEAR}`);
  }
  // Mean year is 235/19 months; start a little low and step forward.
  let year = Math.floor((dayNumber - FIRST_DAY) / 365.2468) + 1;
  if (year > MIN_YEAR) year -= 1;
  while (year < MAX_YEAR && roshHashana(year + 1) <= dayNumber) year += 1;
  let n = dayNumber - roshHashana(year);
  for (const m of monthsInOrder(year)) {
    const len = daysInMonth(year, m);
    if (n < len) return { year, month: m, day: n + 1 };
    n -= len;
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

/** Day of the week of Rosh Hashana: 1 (Monday), 2 (Tuesday), 4 (Thursday) or 6 (Shabbos). */
export function roshHashanaWeekday(year: number): number {
  return dayOfWeek(roshHashana(year));
}
