/**
 * Gregorian calendar arithmetic on "day numbers".
 *
 * A day number is the count of days since 1970-01-01 in the proleptic Gregorian calendar
 * (negative before it). It names a calendar date, not an instant: there is no time zone in it.
 *
 * Dates before 15 October 1582 are proleptic Gregorian (the Gregorian rules extended backwards).
 * See DECISIONS.md AB-02.
 *
 * @packageDocumentation
 */

/** A Gregorian calendar date. `month` is 1–12. */
export interface GregorianDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Days since 1970-01-01 (proleptic Gregorian). */
export type DayNumber = number;

const DAYS_PER_400_YEARS = 146097;
// Day number of 0000-03-01 (March-based year 0), from which the computation below counts.
const MARCH_1_YEAR_0 = -719468;

/** True if `year` is a Gregorian leap year. */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Days in a Gregorian month (`month` 1–12). */
export function daysInGregorianMonth(year: number, month: number): number {
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/**
 * Day number of a Gregorian date.
 *
 * Counts years from March so that the leap day falls at the end of the counted year;
 * each 400-year cycle has 146 097 days.
 */
export function gregorianToDayNumber(year: number, month: number, day: number): DayNumber {
  const y = month <= 2 ? year - 1 : year;
  const cycle = Math.floor(y / 400);
  const yearOfCycle = y - cycle * 400; // 0..399
  const marchMonth = month > 2 ? month - 3 : month + 9; // Mar=0 .. Feb=11
  const dayOfYear = Math.floor((153 * marchMonth + 2) / 5) + day - 1;
  const dayOfCycle =
    yearOfCycle * 365 + Math.floor(yearOfCycle / 4) - Math.floor(yearOfCycle / 100) + dayOfYear;
  return cycle * DAYS_PER_400_YEARS + dayOfCycle + MARCH_1_YEAR_0;
}

/** Gregorian date of a day number. */
export function dayNumberToGregorian(dayNumber: DayNumber): GregorianDate {
  const z = dayNumber - MARCH_1_YEAR_0;
  const cycle = Math.floor(z / DAYS_PER_400_YEARS);
  const dayOfCycle = z - cycle * DAYS_PER_400_YEARS; // 0..146096
  const yearOfCycle = Math.floor(
    (dayOfCycle - Math.floor(dayOfCycle / 1460) + Math.floor(dayOfCycle / 36524) - Math.floor(dayOfCycle / 146096)) /
      365,
  );
  const dayOfYear =
    dayOfCycle - (365 * yearOfCycle + Math.floor(yearOfCycle / 4) - Math.floor(yearOfCycle / 100));
  const marchMonth = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * marchMonth + 2) / 5) + 1;
  const month = marchMonth < 10 ? marchMonth + 3 : marchMonth - 9;
  const year = yearOfCycle + cycle * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

/** Day of the week: 0 = Sunday … 6 = Shabbos. */
export function dayOfWeek(dayNumber: DayNumber): number {
  // 1970-01-01 was a Thursday (4).
  return (((dayNumber + 4) % 7) + 7) % 7;
}

/** True if the Gregorian date exists (e.g. rejects 2023-02-29). */
export function isValidGregorian(year: number, month: number, day: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInGregorianMonth(year, month)
  );
}
