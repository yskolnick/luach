/**
 * The wall clock in a time zone: the date and time at an instant, and the instant at which a
 * wall clock shows a date and time.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { assertCivil, civilToDays, dayOfWeekOfDays, type CivilDate } from './civil.js';
import { assertTimeZone, localParts, zonedMsToInstant, type TimeZone } from './zone.js';

/** The wall clock in a zone at an instant. */
export interface ZonedParts extends CivilDate {
  /** 0-23. */
  readonly hour: number;
  /** 0-59. */
  readonly minute: number;
  /** 0-59. */
  readonly second: number;
  /** 0 = Sunday ... 6 = Shabbos, as `HebrewDate.dayOfWeek`. */
  readonly dayOfWeek: number;
  /** The zone's offset from UTC at that instant, in minutes east (a fraction for historical local mean time). */
  readonly offsetMinutes: number;
}

/** The wall clock in `timeZone` at `instant`: date, time to the second, day of the week and offset. From the zone, never this machine's. */
export function zonedParts(instant: Date, timeZone: TimeZone): ZonedParts {
  const ms = instant.getTime();
  if (!Number.isFinite(ms)) throw new RangeError('Invalid Date');
  assertTimeZone(timeZone);
  const p = localParts(ms, timeZone);
  return Object.freeze({
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    second: p.second,
    dayOfWeek: dayOfWeekOfDays(civilToDays(p.year, p.month, p.day)),
    offsetMinutes: p.offsetMinutes,
  });
}

function part(name: string, v: number | undefined, max: number): number {
  const n = v ?? 0;
  if (!Number.isInteger(n) || n < 0 || n > max) throw new RangeError(`Invalid ${name} ${String(v)}: expected a whole number from 0 to ${max}`);
  return n;
}

/**
 * The instant at which the wall clock in `timeZone` shows `parts` (hour, minute and second
 * default to 0). A time skipped by a DST change becomes the instant one gap later (02:30 on a
 * spring-forward night is 03:30); a time shown twice is the earlier instant. Throws a
 * RangeError for an invalid date or time, and a TypeError for a `HebrewDate` (pass
 * `date.toCivil()`).
 */
export function zonedInstant(parts: CivilDate & { readonly hour?: number; readonly minute?: number; readonly second?: number }, timeZone: TimeZone): Date {
  if (parts instanceof HebrewDate) throw new TypeError('A HebrewDate is not a civil date: pass date.toCivil()');
  assertCivil(parts.year, parts.month, parts.day);
  const hour = part('hour', parts.hour, 23);
  const minute = part('minute', parts.minute, 59);
  const second = part('second', parts.second, 59);
  assertTimeZone(timeZone);
  return new Date(zonedMsToInstant(parts, ((hour * 60 + minute) * 60 + second) * 1000, timeZone));
}
