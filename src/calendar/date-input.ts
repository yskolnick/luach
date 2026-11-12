/**
 * Checks for the dates the public functions take. A function given the wrong kind of date
 * throws a `TypeError` that says what to pass instead, and never answers for a different day.
 *
 * A `HebrewDate` from another copy of this library (the CommonJS build next to the ESM
 * one, or a second install) is read as the same Hebrew date.
 *
 * @packageDocumentation
 * @internal
 */

import { assertCivil, type CivilDate } from '../time/civil.js';
import { HebrewDate } from './hebrew-date.js';

function describe(x: unknown): string {
  if (x === null) return 'null';
  if (Array.isArray(x)) return 'an array';
  if (isJsDate(x)) return 'a JavaScript Date';
  if (typeof x === 'string') return `the string ${JSON.stringify(x.length > 40 ? `${x.slice(0, 40)}…` : x)}`;
  if (typeof x === 'object') return 'an object without year, month and day';
  return String(x);
}

function isJsDate(x: unknown): x is Date {
  return Object.prototype.toString.call(x) === '[object Date]';
}

/** True for a `HebrewDate` from any copy of this library (see `HebrewDate[Symbol.hasInstance]`). */
export function isHebrewDate(x: unknown): x is HebrewDate {
  // eslint-disable-next-line no-restricted-syntax -- the one place that may (see the lint rule)
  return x instanceof HebrewDate;
}

/** This copy's `HebrewDate` for a Hebrew date from any copy; throws if its parts and its day count disagree. */
function own(x: HebrewDate, fn: string): HebrewDate {
  if (Function.prototype[Symbol.hasInstance].call(HebrewDate, x)) return x;
  const h = new HebrewDate(x.year, x.month, x.day);
  if (h.epochDays !== x.epochDays) throw new TypeError(`${fn}: this HebrewDate's day count does not match ${x.year}-${x.month}-${x.day}`);
  return h;
}

function wrongDate(x: unknown, fn: string, wants: string): TypeError {
  let hint = '';
  if (isJsDate(x)) hint = ': a Date is an instant, not a calendar day; pass hebrewDateAt(date, location), or zonedParts(date, timeZone) where a civil date is taken';
  else if (typeof x === 'string') hint = ': parse it first with parseIsoDate("YYYY-MM-DD") or parseHebrewDate("14 Adar 5787")';
  return new TypeError(`${fn} takes ${wants}, not ${describe(x)}${hint}`);
}

/**
 * The Hebrew date in `x`, for a function that takes only a `HebrewDate`. A civil date
 * (`{ year, month, day }` without a day count) throws, since its numbers would be read
 * as a Hebrew year, month and day.
 */
export function hebrewDateArg(x: unknown, fn: string): HebrewDate {
  if (isHebrewDate(x)) return own(x, fn);
  if (typeof x === 'object' && x !== null && !isJsDate(x) && 'year' in x && 'month' in x && 'day' in x) {
    throw new TypeError(`${fn} takes a HebrewDate, not a civil date: pass HebrewDate.fromCivil(date)`);
  }
  throw wrongDate(x, fn, 'a HebrewDate');
}

/** As {@link hebrewDateArg}, or a whole number of days since 1970-01-01. */
export function hebrewDateOrDaysArg(x: unknown, fn: string): HebrewDate | number {
  if (typeof x === 'number') {
    if (!Number.isInteger(x)) throw new RangeError(`${fn} takes a whole number of days since 1970-01-01, not ${x}`);
    return x;
  }
  return hebrewDateArg(x, fn);
}

/**
 * The day in `x`, for a function that takes a civil date or a Hebrew date: a `HebrewDate`
 * (from any copy of this library), or a valid civil `{ year, month, day }`.
 */
export function dayArg(x: unknown, fn: string): HebrewDate | CivilDate {
  if (isHebrewDate(x)) return own(x, fn);
  if (typeof x === 'object' && x !== null && !isJsDate(x) && !Array.isArray(x)) {
    const o = x as Partial<CivilDate>;
    if (o.year !== undefined || o.month !== undefined || o.day !== undefined) {
      assertCivil(o.year as number, o.month as number, o.day as number);
      return x as CivilDate;
    }
  }
  throw wrongDate(x, fn, 'a civil date { year, month, day } or a HebrewDate');
}

/** The Hebrew date of `x` (see {@link dayArg}); a civil date is converted. */
export function hebrewOfDayArg(x: unknown, fn: string): HebrewDate {
  const d = dayArg(x, fn);
  return isHebrewDate(d) ? d : HebrewDate.fromCivil(d);
}

/** A valid instant, for a function that takes a JavaScript `Date`. */
export function instantArg(x: unknown, fn: string): Date {
  if (!isJsDate(x)) {
    const hint = typeof x === 'number' ? ': pass new Date(ms)' : typeof x === 'string' ? ': pass new Date(string) with an explicit offset, e.g. 2026-10-23T15:00:00Z' : '';
    throw new TypeError(`${fn} takes a Date, not ${describe(x)}${hint}`);
  }
  if (Number.isNaN(x.getTime())) throw new RangeError(`${fn}: invalid Date`);
  return x;
}
