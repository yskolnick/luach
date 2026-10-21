/**
 * Convenience conversions between Gregorian dates, `Date` instants and Hebrew dates.
 *
 * @packageDocumentation
 */

import { type DayNumber, type GregorianDate, dayNumberToGregorian, gregorianToDayNumber, isValidGregorian } from './gregorian.js';
import { type HebrewDate, dayNumberToHebrew, hebrewToDayNumber } from './hebrew.js';
import { type TimeZoneProvider, dayNumberInZone } from '../time/zone.js';

/** Hebrew date of a Gregorian date (the Hebrew date of that day's daytime; see `afterSunset`). */
export function gregorianToHebrew(date: GregorianDate, options: { afterSunset?: boolean } = {}): HebrewDate {
  if (!isValidGregorian(date.year, date.month, date.day)) {
    throw new RangeError(`Invalid Gregorian date: ${date.year}-${date.month}-${date.day}`);
  }
  return dayNumberToHebrew(gregorianToDayNumber(date.year, date.month, date.day) + (options.afterSunset ? 1 : 0));
}

/** Gregorian date whose daytime is the given Hebrew date. The Hebrew date began at sunset the evening before. */
export function hebrewToGregorian(date: HebrewDate): GregorianDate {
  return dayNumberToGregorian(hebrewToDayNumber(date.year, date.month, date.day));
}

/** Add (or subtract) days to a Hebrew date. */
export function addDays(date: HebrewDate, days: number): HebrewDate {
  return dayNumberToHebrew(hebrewToDayNumber(date.year, date.month, date.day) + days);
}

/** Days from `a` to `b` (positive if `b` is later). */
export function daysBetween(a: HebrewDate, b: HebrewDate): number {
  return hebrewToDayNumber(b.year, b.month, b.day) - hebrewToDayNumber(a.year, a.month, a.day);
}

/**
 * The civil date at an instant, in an IANA time zone.
 * Without `timeZone`, uses the runtime's local zone (the `Date`'s own getters).
 */
export function civilDayNumber(instant: Date, timeZone?: string, provider?: TimeZoneProvider): DayNumber {
  if (timeZone === undefined) {
    return gregorianToDayNumber(instant.getFullYear(), instant.getMonth() + 1, instant.getDate());
  }
  return dayNumberInZone(instant.getTime(), timeZone, provider);
}

/**
 * Hebrew date (of the daytime) for the civil date at `instant` in `timeZone`.
 * For the date after sunset use the zmanim-aware `hebrewDateAt()` (M4).
 */
export function hebrewDateOf(instant: Date, timeZone?: string, provider?: TimeZoneProvider): HebrewDate {
  return dayNumberToHebrew(civilDayNumber(instant, timeZone, provider));
}
