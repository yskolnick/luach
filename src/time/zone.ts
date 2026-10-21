/**
 * Time zones, by IANA identifier only.
 *
 * Luach never derives a "standard offset" for a zone. It asks for the UTC offset in force at a specific
 * instant, through `Intl.DateTimeFormat` by default. Engines without time-zone support in `Intl`
 * (e.g. the Hermes command-line build) can supply their own {@link TimeZoneProvider}.
 *
 * @packageDocumentation
 */

import { type DayNumber, type GregorianDate, dayNumberToGregorian, gregorianToDayNumber } from '../calendar/gregorian.js';

/**
 * Returns the offset of local time from UTC, in minutes (e.g. +120 for Jerusalem in winter), in force at
 * the instant `epochMs` in the IANA zone `timeZone`. Must throw for an unknown zone.
 */
export type TimeZoneProvider = (timeZone: string, epochMs: number) => number;

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      era: 'short',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The default provider: `Intl.DateTimeFormat` with the `timeZone` option. */
export const intlTimeZoneProvider: TimeZoneProvider = (timeZone, epochMs) => {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    throw new Error(
      'luach: this JavaScript engine has no Intl.DateTimeFormat; pass a timeZoneProvider (see docs: "Time zones without Intl")',
    );
  }
  // Whole seconds only: offsets are whole minutes and formatToParts drops milliseconds.
  const t = Math.floor(epochMs / 1000) * 1000;
  const parts = formatterFor(timeZone).formatToParts(new Date(t));
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let bc = false;
  for (const p of parts) {
    switch (p.type) {
      case 'year': year = Number(p.value); break;
      case 'month': month = Number(p.value); break;
      case 'day': day = Number(p.value); break;
      case 'hour': hour = Number(p.value) % 24; break; // some engines print 24 for midnight
      case 'minute': minute = Number(p.value); break;
      case 'second': second = Number(p.value); break;
      case 'era': bc = /^b/i.test(p.value); break;
    }
  }
  if (bc) year = 1 - year;
  const localAsUtc = gregorianToDayNumber(year, month, day) * MS_PER_DAY + ((hour * 60 + minute) * 60 + second) * 1000;
  return Math.round((localAsUtc - t) / MS_PER_MINUTE);
};

let defaultProvider: TimeZoneProvider = intlTimeZoneProvider;

/**
 * Replace the provider used when a call doesn't pass one. Use this once at app start-up on engines whose
 * `Intl` lacks time-zone support. The library itself never calls this.
 */
export function setDefaultTimeZoneProvider(provider: TimeZoneProvider): void {
  defaultProvider = provider;
}

/** The provider used when none is passed. */
export function getDefaultTimeZoneProvider(): TimeZoneProvider {
  return defaultProvider;
}

/** UTC offset in minutes in force in `timeZone` at `epochMs`. */
export function offsetMinutes(timeZone: string, epochMs: number, provider: TimeZoneProvider = defaultProvider): number {
  return provider(timeZone, epochMs);
}

/** A wall-clock reading in a zone. */
export interface ZonedDateTime extends GregorianDate {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  /** Offset from UTC in minutes. */
  readonly offset: number;
  readonly dayNumber: DayNumber;
}

/** The wall-clock reading in `timeZone` at the instant `epochMs`. */
export function toZoned(epochMs: number, timeZone: string, provider: TimeZoneProvider = defaultProvider): ZonedDateTime {
  const offset = provider(timeZone, epochMs);
  const local = epochMs + offset * MS_PER_MINUTE;
  const dayNumber = Math.floor(local / MS_PER_DAY);
  const msOfDay = local - dayNumber * MS_PER_DAY;
  const totalSeconds = Math.floor(msOfDay / 1000);
  return {
    ...dayNumberToGregorian(dayNumber),
    hour: Math.floor(totalSeconds / 3600),
    minute: Math.floor((totalSeconds % 3600) / 60),
    second: totalSeconds % 60,
    offset,
    dayNumber,
  };
}

/** The civil date in `timeZone` at the instant `epochMs`, as a day number. */
export function dayNumberInZone(epochMs: number, timeZone: string, provider: TimeZoneProvider = defaultProvider): DayNumber {
  return toZoned(epochMs, timeZone, provider).dayNumber;
}

/**
 * The instant at which the wall clock in `timeZone` reads `msOfDay` milliseconds after midnight on `dayNumber`.
 *
 * In a spring-forward gap (the reading never happens) the result is the same distance after the gap starts,
 * i.e. the clock reading shifted forward by the size of the gap. In a fall-back overlap (the reading happens
 * twice) the earlier instant is returned.
 */
export function fromZoned(
  dayNumber: DayNumber,
  msOfDay: number,
  timeZone: string,
  provider: TimeZoneProvider = defaultProvider,
): number {
  const localAsUtc = dayNumber * MS_PER_DAY + msOfDay;
  // Try the offsets in force a day either side; at most two distinct offsets are relevant.
  const before = provider(timeZone, localAsUtc - MS_PER_DAY);
  const after = provider(timeZone, localAsUtc + MS_PER_DAY);
  const candidates: number[] = [];
  for (const off of before === after ? [before] : [before, after]) {
    const t = localAsUtc - off * MS_PER_MINUTE;
    if (provider(timeZone, t) === off) candidates.push(t);
  }
  if (candidates.length > 0) return Math.min(...candidates);
  // Gap: no offset reproduces the reading. Use the offset from before the gap.
  return localAsUtc - before * MS_PER_MINUTE;
}
