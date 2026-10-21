/**
 * Proleptic Gregorian civil dates and a plain day count.
 *
 * Days are counted as whole days since 1970-01-01 ("epoch days"), the same origin as
 * JavaScript's `Date`, so `epochDays * 86_400_000` is midnight UTC of that civil date.
 *
 * The arithmetic is the era-based method published by Howard Hinnant in
 * "chrono-Compatible Low-Level Date Algorithms" (placed in the public domain),
 * re-implemented here. It is exact for every year JavaScript numbers can hold.
 *
 * @packageDocumentation
 */

/** A calendar date with no time and no time zone. `month` is 1–12. */
export interface CivilDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Milliseconds in a day. */
export const MS_PER_DAY = 86_400_000;

/** Days from 1970-01-01 to the given proleptic Gregorian date. */
export function civilToDays(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400; // 0..399
  const mp = (month + 9) % 12; // March = 0
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1; // 0..365
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; // 0..146096
  return era * 146097 + doe - 719468;
}

/** The proleptic Gregorian date for a count of days since 1970-01-01. */
export function daysToCivil(days: number): CivilDate {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  return { year: era * 400 + yoe + (month <= 2 ? 1 : 0), month, day };
}

/** True if the proleptic Gregorian year has 366 days. */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Days in a Gregorian month (month 1–12). */
export function gregorianMonthLength(year: number, month: number): number {
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/** Day of the week for an epoch-day count: 0 = Sunday … 6 = Shabbos (Saturday). */
export function dayOfWeekOfDays(days: number): number {
  // 1970-01-01 was a Thursday (4).
  return (((days + 4) % 7) + 7) % 7;
}

/** Throws a RangeError unless the civil date is a real proleptic Gregorian date. */
export function assertCivil(year: number, month: number, day: number): void {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError(`Invalid civil date ${year}-${month}-${day}: parts must be integers`);
  }
  if (month < 1 || month > 12 || day < 1 || day > gregorianMonthLength(year, month)) {
    throw new RangeError(`Invalid civil date ${year}-${month}-${day}`);
  }
}

/** Formats a civil date as ISO 8601 (`YYYY-MM-DD`, with a sign for years outside 0–9999). */
export function formatIsoDate(d: CivilDate): string {
  const y = d.year >= 0 && d.year <= 9999 ? String(d.year).padStart(4, '0') : (d.year < 0 ? '-' : '+') + String(Math.abs(d.year)).padStart(6, '0');
  return `${y}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

/** Parses `YYYY-MM-DD` into a civil date. Throws on anything else. */
export function parseIsoDate(s: string): CivilDate {
  const m = /^([+-]?\d{4,6})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) throw new RangeError(`Not an ISO date (YYYY-MM-DD): ${s}`);
  const d = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  assertCivil(d.year, d.month, d.day);
  return d;
}
