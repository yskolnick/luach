/**
 * The fixed Hebrew calendar, computed from the rules in the Rambam,
 * Hilchos Kiddush HaChodesh, chapters 6–8.
 *
 * Time is counted in chalakim (parts): 1080 to the hour (6:2). A lunar month is
 * 29 days, 12 hours and 793 parts (6:3). The first molad, of Tishrei in year 1, was
 * on day 2 (Monday) at 5 hours and 204 parts of the night: "BaHaRaD" (6:8).
 * Hours are counted from 6 pm, when the Hebrew day begins.
 *
 * @packageDocumentation
 */

import { Month, type MonthNumber } from './months';

/** Chalakim (parts) in an hour. Rambam, KH 6:2. */
export const PARTS_PER_HOUR = 1080;
/** Chalakim in a day. */
export const PARTS_PER_DAY = 24 * PARTS_PER_HOUR;
/** Length of a mean lunar month in chalakim: 29 d 12 h 793 p. Rambam, KH 6:3. */
export const MONTH_PARTS = 29 * PARTS_PER_DAY + 12 * PARTS_PER_HOUR + 793;
/**
 * The molad of Tishrei of year 1 ("BaHaRaD": day 2, 5 hours, 204 parts), counted in
 * chalakim from the start of the first day (Sunday, 6 pm Saturday night) of that week.
 * Rambam, KH 6:8.
 */
export const MOLAD_BAHARAD = 1 * PARTS_PER_DAY + 5 * PARTS_PER_HOUR + 204;

/** The years of the 19-year cycle that have 13 months. Rambam, KH 6:11. */
const LEAP_POSITIONS = [3, 6, 8, 11, 14, 17, 19];

/** Smallest and largest supported Hebrew years. */
export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;

/**
 * Epoch day (days since 1970-01-01) of the day counted as day 0 by {@link moladParts}:
 * the Sunday of the week of the first molad. 1 Tishrei of year 1 fell on the next day,
 * Monday 7 October 3761 BCE in the Julian calendar.
 */
const DAY0_EPOCH_DAYS = -2_092_591;

/** Throws a RangeError unless `year` is a supported Hebrew year. */
export function assertYear(year: number): void {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`Hebrew year ${year} is outside the supported range ${MIN_YEAR}–${MAX_YEAR}`);
  }
}

/** Position of the year in its 19-year cycle, 1–19. */
export function cyclePosition(year: number): number {
  return ((year - 1) % 19) + 1;
}

/** True if the Hebrew year has 13 months. */
export function isLeapYear(year: number): boolean {
  return LEAP_POSITIONS.includes(cyclePosition(year));
}

/** Number of months in the year: 12 or 13. */
export function monthsInYear(year: number): 12 | 13 {
  return isLeapYear(year) ? 13 : 12;
}

/** Months from the first molad to the molad of Tishrei of `year`. */
export function monthsBeforeYear(year: number): number {
  const cycles = Math.floor((year - 1) / 19);
  const pos = (year - 1) % 19; // completed years in this cycle
  let leaps = 0;
  for (const p of LEAP_POSITIONS) if (p <= pos) leaps++;
  return cycles * 235 + pos * 12 + leaps;
}

/** The molad of Tishrei of `year`, in chalakim since the start of day 0. */
export function moladTishreiParts(year: number): number {
  return MOLAD_BAHARAD + monthsBeforeYear(year) * MONTH_PARTS;
}

const roshHashanaCache = new Map<number, number>();

/**
 * The day (counted from day 0 of {@link moladTishreiParts}) of Rosh Hashana of `year`,
 * after the four dechiyos of Rambam, KH 7:1–7:
 *
 * 1. Lo ADU Rosh: Rosh Hashana is never on Sunday, Wednesday or Friday (7:1).
 * 2. Molad zaken: a molad at or after noon (18 hours) moves Rosh Hashana to the next day (7:2).
 * 3. GaTaRaD: in a common year, a molad on Tuesday at or after 9 h 204 p moves it to Thursday (7:4).
 * 4. BeTU'TaKPaT: in the year after a leap year, a molad on Monday at or after 15 h 589 p
 *    moves it to Tuesday (7:5).
 */
function roshHashanaDay(year: number): number {
  const cached = roshHashanaCache.get(year);
  if (cached !== undefined) return cached;
  const parts = moladTishreiParts(year);
  let day = Math.floor(parts / PARTS_PER_DAY);
  const time = parts % PARTS_PER_DAY;
  const dow = day % 7; // 0 = Sunday
  if (
    time >= 18 * PARTS_PER_HOUR ||
    (dow === 2 && time >= 9 * PARTS_PER_HOUR + 204 && !isLeapYear(year)) ||
    (dow === 1 && time >= 15 * PARTS_PER_HOUR + 589 && isLeapYear(year - 1))
  ) {
    day++;
  }
  const d = day % 7;
  if (d === 0 || d === 3 || d === 5) day++;
  roshHashanaCache.set(year, day);
  return day;
}

/** Epoch day (days since 1970-01-01) of 1 Tishrei of `year`. */
export function roshHashanaDays(year: number): number {
  return roshHashanaDay(year) + DAY0_EPOCH_DAYS;
}

/** Days in the Hebrew year: 353, 354, 355, 383, 384 or 385. */
export function yearLength(year: number): number {
  return roshHashanaDay(year + 1) - roshHashanaDay(year);
}

/**
 * The year's type by the lengths of Cheshvan and Kislev:
 * - `chaserim` ("deficient"): both 29 days (353 or 383 days);
 * - `kesidran` ("regular"): Cheshvan 29, Kislev 30 (354 or 384);
 * - `shleimim` ("complete"): both 30 (355 or 385).
 *
 * Rambam, KH 8:5–6.
 */
export type YearType = 'chaserim' | 'kesidran' | 'shleimim';

/** See {@link YearType}. */
export function yearType(year: number): YearType {
  const r = yearLength(year) % 10;
  return r === 3 ? 'chaserim' : r === 4 ? 'kesidran' : 'shleimim';
}

/** Days in a Hebrew month (29 or 30). Throws for Adar II in a common year. */
export function monthLength(year: number, month: number): 29 | 30 {
  switch (month) {
    case Month.NISAN:
    case Month.SIVAN:
    case Month.AV:
    case Month.TISHREI:
    case Month.SHEVAT:
      return 30;
    case Month.IYAR:
    case Month.TAMMUZ:
    case Month.ELUL:
    case Month.TEVES:
    case Month.ADAR_II:
      if (month === Month.ADAR_II && !isLeapYear(year)) {
        throw new RangeError(`Year ${year} is not a leap year and has no Adar II`);
      }
      return 29;
    case Month.CHESHVAN:
      return yearType(year) === 'shleimim' ? 30 : 29;
    case Month.KISLEV:
      return yearType(year) === 'chaserim' ? 29 : 30;
    case Month.ADAR:
      return isLeapYear(year) ? 30 : 29;
    default:
      throw new RangeError(`Invalid Hebrew month ${month}`);
  }
}

/** The months of `year` in calendar order, starting from Tishrei. */
export function monthsOfYear(year: number): MonthNumber[] {
  const m: MonthNumber[] = [7, 8, 9, 10, 11, 12];
  if (isLeapYear(year)) m.push(13);
  m.push(1, 2, 3, 4, 5, 6);
  return m;
}

/** Days from 1 Tishrei to the first of `month` in `year`. */
export function daysBeforeMonth(year: number, month: number): number {
  let n = 0;
  for (const m of monthsOfYear(year)) {
    if (m === month) return n;
    n += monthLength(year, m);
  }
  throw new RangeError(`Year ${year} has no month ${month}`);
}

/** Throws a RangeError unless the Hebrew date exists. */
export function assertHebrewDate(year: number, month: number, day: number): void {
  assertYear(year);
  if (!Number.isInteger(month) || month < 1 || month > monthsInYear(year)) {
    throw new RangeError(`Year ${year} has no month ${month}`);
  }
  if (!Number.isInteger(day) || day < 1 || day > monthLength(year, month)) {
    throw new RangeError(`Month ${month} of year ${year} has no day ${day}`);
  }
}

/** Epoch day of a Hebrew date. Validates the date. */
export function hebrewToDays(year: number, month: number, day: number): number {
  assertHebrewDate(year, month, day);
  return roshHashanaDays(year) + daysBeforeMonth(year, month) + day - 1;
}

/** Epoch days of the first and last supported dates. */
export const MIN_DAYS = roshHashanaDays(MIN_YEAR);
export const MAX_DAYS = roshHashanaDays(MAX_YEAR + 1) - 1;

/** The Hebrew date for an epoch day. */
export function daysToHebrew(days: number): { year: number; month: MonthNumber; day: number } {
  if (!Number.isInteger(days) || days < MIN_DAYS || days > MAX_DAYS) {
    throw new RangeError(`Day ${days} is outside the supported Hebrew range (years ${MIN_YEAR}–${MAX_YEAR})`);
  }
  // A Hebrew year averages about 365.2468 days; start from an estimate and adjust.
  let year = Math.floor((days - DAY0_EPOCH_DAYS) / 365.2468) + 1;
  if (year < MIN_YEAR) year = MIN_YEAR;
  if (year > MAX_YEAR) year = MAX_YEAR;
  while (year > MIN_YEAR && roshHashanaDays(year) > days) year--;
  while (year < MAX_YEAR && roshHashanaDays(year + 1) <= days) year++;
  let rem = days - roshHashanaDays(year);
  for (const m of monthsOfYear(year)) {
    const len = monthLength(year, m);
    if (rem < len) return { year, month: m, day: rem + 1 };
    rem -= len;
  }
  throw new Error('unreachable');
}
