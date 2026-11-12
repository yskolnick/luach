/**
 * The HebrewDate class: an immutable Hebrew calendar date.
 *
 * @packageDocumentation
 */

import { civilToDays, daysToCivil, dayOfWeekOfDays, assertCivil, assertNotHebrewDate, type CivilDate } from '../time/civil.js';
import { civilDateOf, type TimeZone } from '../time/zone.js';
import type { MonthNumber } from './months.js';
import {
  daysToHebrew,
  hebrewToDays,
  isLeapYear,
  monthLength,
  yearLength,
  yearType,
  type YearType,
  monthsInYear,
  roshHashanaDays,
} from './year.js';

function wholeDays(n: unknown, fn: string): void {
  if (typeof n !== 'number') throw new TypeError(`${fn} takes a whole number of days, not ${typeof n === 'string' ? JSON.stringify(n) : String(n)}`);
  if (!Number.isInteger(n)) throw new RangeError(`${fn} takes a whole number of days, not ${n}`);
}

function otherHebrew(x: unknown, fn: string): void {
  if (!HebrewDate[Symbol.hasInstance](x)) throw new TypeError(`${fn} takes a HebrewDate; for a civil date pass HebrewDate.fromCivil(date)`);
}

/** Plain-data form of a Hebrew date. */
export interface HebrewDateParts {
  readonly year: number;
  /** 1 = Nisan … 12 = Adar / Adar I, 13 = Adar II. See {@link Month}. */
  readonly month: number;
  readonly day: number;
}

/**
 * An immutable Hebrew date. A Hebrew date is a whole day; this class does not know what
 * time it is. Converting from a JavaScript `Date` uses the civil (Gregorian) date, so
 * after nightfall pass `{ afterSunset: true }` to get the next Hebrew date: the library
 * cannot know when the day ends where you are without a location (see the zmanim module).
 *
 * Supported range: Hebrew years 1–9999 (7 Oct 3761 BCE to 6239 CE). Gregorian dates
 * are proleptic, including before the Gregorian reform of 1582.
 */
export class HebrewDate implements HebrewDateParts {
  readonly year: number;
  readonly month: MonthNumber;
  readonly day: number;
  /** Days since 1970-01-01 of the civil day that this Hebrew date mostly overlaps (sunset to sunset). */
  readonly epochDays: number;

  /**
   * True for a `HebrewDate` from any copy of this library. An app can load it twice (through
   * `import` and through `require`, or two installed versions); a date made by one copy is
   * still a `HebrewDate` to the other. Recognised by shape: whole-number `year`, `month`,
   * `day` and `epochDays`, and a `toCivil` method.
   */
  static [Symbol.hasInstance](x: unknown): boolean {
    if (Function.prototype[Symbol.hasInstance].call(HebrewDate, x)) return true;
    if (typeof x !== 'object' || x === null) return false;
    const o = x as Record<string, unknown>;
    return Number.isInteger(o.epochDays) && Number.isInteger(o.year) && Number.isInteger(o.month) && Number.isInteger(o.day) && typeof o.toCivil === 'function';
  }

  /** Creates a Hebrew date. Throws a RangeError if it does not exist (e.g. 30 Teves, or Adar II in a common year). */
  constructor(year: number, month: number, day: number) {
    this.epochDays = hebrewToDays(year, month, day);
    this.year = year;
    this.month = month as MonthNumber;
    this.day = day;
  }

  /** The Hebrew date for a count of days since 1970-01-01. */
  static fromEpochDays(days: number): HebrewDate {
    wholeDays(days, 'HebrewDate.fromEpochDays');
    const h = daysToHebrew(days);
    return new HebrewDate(h.year, h.month, h.day);
  }

  /**
   * The Hebrew date for a Gregorian date (proleptic). With `afterSunset`, the next
   * Hebrew date, since the Hebrew day starts at nightfall.
   */
  static fromGregorian(year: number, month: number, day: number, options?: { afterSunset?: boolean }): HebrewDate {
    assertCivil(year, month, day);
    return HebrewDate.fromEpochDays(civilToDays(year, month, day) + (options?.afterSunset ? 1 : 0));
  }

  /** As {@link HebrewDate.fromGregorian}, from a {@link CivilDate}. */
  static fromCivil(date: CivilDate, options?: { afterSunset?: boolean }): HebrewDate {
    assertNotHebrewDate(date, 'HebrewDate.fromCivil');
    if (typeof date !== 'object' || date === null) throw new TypeError(`HebrewDate.fromCivil takes a civil date { year, month, day }, not ${String(date)}`);
    return HebrewDate.fromGregorian(date.year, date.month, date.day, options);
  }

  /**
   * The Hebrew date for the civil date of a JavaScript `Date`: in `timeZone` if given,
   * otherwise in the runtime's local zone.
   */
  static fromDate(date: Date, options?: { timeZone?: TimeZone; afterSunset?: boolean }): HebrewDate {
    if (Object.prototype.toString.call(date) !== '[object Date]') throw new TypeError(`HebrewDate.fromDate takes a Date, not ${typeof date === 'string' ? JSON.stringify(date) : String(date)}`);
    if (Number.isNaN(date.getTime())) throw new RangeError('HebrewDate.fromDate: invalid Date');
    return HebrewDate.fromCivil(civilDateOf(date, options?.timeZone), options);
  }

  /**
   * Today's Hebrew date by the civil date in `timeZone` (default: the runtime's zone). Ignores
   * sunset: after dark it is a day behind. For the Hebrew date at a place now, use
   * `hebrewDateAt(new Date(), location)`.
   */
  static today(options?: { timeZone?: TimeZone }): HebrewDate {
    return HebrewDate.fromDate(new Date(), options);
  }

  /** The Gregorian date (proleptic) of the daytime of this Hebrew date. */
  toCivil(): CivilDate {
    return daysToCivil(this.epochDays);
  }

  /** The Gregorian date as a `Date` at 00:00 UTC. Use {@link HebrewDate.toCivil} to avoid time-zone surprises. */
  toUTCDate(): Date {
    return new Date(this.epochDays * 86_400_000);
  }

  /** 0 = Sunday … 6 = Shabbos. */
  get dayOfWeek(): number {
    return dayOfWeekOfDays(this.epochDays);
  }

  /** True on Shabbos. */
  get isShabbos(): boolean {
    return this.dayOfWeek === 6;
  }

  /** True if this date's year has 13 months. */
  get isLeapYear(): boolean {
    return isLeapYear(this.year);
  }

  /** Days in this date's month. */
  get monthLength(): 29 | 30 {
    return monthLength(this.year, this.month);
  }

  /** Days in this date's year. */
  get yearLength(): number {
    return yearLength(this.year);
  }

  /** Kesidran, chaserim or shleimim. */
  get yearType(): YearType {
    return yearType(this.year);
  }

  /** Months in this date's year. */
  get monthsInYear(): 12 | 13 {
    return monthsInYear(this.year);
  }

  /** Day of the year, 1 = 1 Tishrei. */
  get dayOfYear(): number {
    return this.epochDays - roshHashanaDays(this.year) + 1;
  }

  /** A date `n` days later (or earlier, for negative `n`). */
  addDays(n: number): HebrewDate {
    wholeDays(n, 'addDays');
    return HebrewDate.fromEpochDays(this.epochDays + n);
  }

  /** The next day. */
  next(): HebrewDate {
    return this.addDays(1);
  }

  /** The previous day. */
  prev(): HebrewDate {
    return this.addDays(-1);
  }

  /** Days from `other` to this date (positive if this is later). */
  daysSince(other: HebrewDate): number {
    otherHebrew(other, 'daysSince');
    return this.epochDays - other.epochDays;
  }

  /** The first day on or after this date that falls on `dayOfWeek` (0 = Sunday … 6 = Shabbos). */
  onOrAfter(dayOfWeek: number): HebrewDate {
    return this.addDays((dayOfWeek - this.dayOfWeek + 7) % 7);
  }

  /** The last day on or before this date that falls on `dayOfWeek`. */
  onOrBefore(dayOfWeek: number): HebrewDate {
    return this.addDays(-((this.dayOfWeek - dayOfWeek + 7) % 7));
  }

  /** True if both are the same day. */
  equals(other: HebrewDateParts): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day;
  }

  /** Negative, zero or positive, for sorting. */
  compare(other: HebrewDate): number {
    otherHebrew(other, 'compare');
    return this.epochDays - other.epochDays;
  }

  /** Plain data, for JSON. */
  toJSON(): HebrewDateParts & { gregorian: string } {
    const c = this.toCivil();
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      gregorian: `${String(c.year).padStart(4, '0')}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`,
    };
  }

  /** `year-month-day` with numbers, e.g. "5787-7-1". Use the formatting helpers for display. */
  toString(): string {
    return `${this.year}-${this.month}-${this.day}`;
  }
}
