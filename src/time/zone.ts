/**
 * Time zones.
 *
 * Offsets always come from the IANA time-zone database through `Intl.DateTimeFormat`.
 * Luach never derives a "standard offset" from a zone or from longitude: doing that puts
 * zmanim on the wrong civil day near the date line (Sydney, Auckland, Chatham) and
 * across DST changes.
 *
 * Where `Intl` time-zone support is missing (some embedded engines), pass a
 * {@link TimeZoneProvider} instead of a zone name.
 *
 * @packageDocumentation
 */

import { civilToDays, MS_PER_DAY, type CivilDate, daysToCivil } from './civil.js';

/** Anything that can say what the UTC offset is at a given instant. */
export interface TimeZoneProvider {
  /** A label for output, e.g. "Asia/Jerusalem" or "UTC+02:00". */
  readonly name: string;
  /** Offset from UTC in minutes (east positive) in effect at the instant `epochMs`. */
  offsetMinutes(epochMs: number): number;
}

/** An IANA zone name such as `"America/New_York"`, or a custom provider. */
export type TimeZone = string | TimeZoneProvider;

/** A provider with a constant offset. Useful for tests and for engines without `Intl`. */
export function fixedOffsetZone(minutes: number, name?: string): TimeZoneProvider {
  const sign = minutes < 0 ? '-' : '+';
  const a = Math.abs(minutes);
  const label = name ?? `UTC${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
  return { name: label, offsetMinutes: () => minutes };
}

/** The UTC zone. */
export const UTC: TimeZoneProvider = fixedOffsetZone(0, 'UTC');

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(zone: string): Intl.DateTimeFormat {
  let f = formatters.get(zone);
  if (!f) {
    if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
      throw new Error('Intl.DateTimeFormat is not available; pass a TimeZoneProvider instead of a zone name');
    }
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour12: false,
      era: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(zone, f);
  }
  return f;
}

/**
 * Throws a RangeError if `zone` is not an IANA zone name this runtime knows, and a TypeError
 * if it is missing or is neither a name nor a {@link TimeZoneProvider}.
 */
export function assertTimeZone(zone: TimeZone): void {
  if (typeof zone !== 'string') {
    if (zone === null || typeof zone !== 'object' || typeof (zone as Partial<TimeZoneProvider>).offsetMinutes !== 'function') {
      throw new TypeError('A time zone is required: an IANA zone name such as "America/New_York", or a TimeZoneProvider');
    }
    return;
  }
  try {
    formatterFor(zone);
  } catch (e) {
    if (e instanceof RangeError) throw new RangeError(`Unknown time zone: ${zone}`);
    throw e;
  }
}

function intlOffsetMinutes(zone: string, epochMs: number): number {
  const ms = Math.floor(epochMs / 1000) * 1000;
  const parts = formatterFor(zone).formatToParts(new Date(ms));
  let year = 0, month = 1, day = 1, hour = 0, minute = 0, second = 0, bc = false;
  for (const p of parts) {
    switch (p.type) {
      case 'year': year = Number(p.value); break;
      case 'month': month = Number(p.value); break;
      case 'day': day = Number(p.value); break;
      case 'hour': hour = Number(p.value) % 24; break;
      case 'minute': minute = Number(p.value); break;
      case 'second': second = Number(p.value); break;
      case 'era': bc = /^B/i.test(p.value); break;
    }
  }
  if (bc) year = 1 - year;
  const localMs = civilToDays(year, month, day) * MS_PER_DAY + ((hour * 60 + minute) * 60 + second) * 1000;
  // Not rounded: historical local mean time has seconds (Jerusalem before 1918 is +2:20:40
  // in the runtime's data), so the offset can be a fraction of a minute.
  return (localMs - ms) / 60000;
}

/**
 * UTC offset in minutes (east positive) in `zone` at the instant `epochMs`. Usually whole
 * minutes; historical local mean time can have seconds, given as a fraction (140.6667).
 */
export function offsetMinutes(zone: TimeZone, epochMs: number): number {
  return typeof zone === 'string' ? intlOffsetMinutes(zone, epochMs) : zone.offsetMinutes(epochMs);
}

/** The zone's name, for output. */
export function zoneName(zone: TimeZone): string {
  return typeof zone === 'string' ? zone : zone.name;
}

/**
 * The instant at which the wall clock in `zone` shows the given local date and time.
 * In a DST gap the time does not exist; the result is the instant one gap-length later
 * (so 02:30 on a spring-forward night becomes 03:30). In a DST overlap the earlier
 * instant is returned.
 */
export function zonedToInstant(date: CivilDate, minutesOfDay: number, zone: TimeZone): number {
  const local = civilToDays(date.year, date.month, date.day) * MS_PER_DAY + minutesOfDay * 60000;
  const o1 = offsetMinutes(zone, local);
  let t = local - Math.round(o1 * 60000);
  const o2 = offsetMinutes(zone, t);
  if (o2 !== o1) {
    const t2 = local - Math.round(o2 * 60000);
    // Overlap: both readings valid; prefer the earlier instant. Gap: neither maps back.
    if (offsetMinutes(zone, t2) === o2) t = Math.min(t, t2);
    else t = local - Math.round(Math.min(o1, o2) * 60000);
  }
  return t;
}

/** The civil date shown on a wall clock in `zone` at `epochMs`. */
export function civilDateAt(epochMs: number, zone: TimeZone): CivilDate {
  const local = epochMs + Math.round(offsetMinutes(zone, epochMs) * 60000);
  return daysToCivil(Math.floor(local / MS_PER_DAY));
}

/** Local wall-clock parts in `zone` at `epochMs`. */
export function localParts(epochMs: number, zone: TimeZone): CivilDate & { hour: number; minute: number; second: number; offsetMinutes: number } {
  const off = offsetMinutes(zone, epochMs);
  const local = epochMs + Math.round(off * 60000);
  const days = Math.floor(local / MS_PER_DAY);
  const rem = local - days * MS_PER_DAY;
  const c = daysToCivil(days);
  return {
    ...c,
    hour: Math.floor(rem / 3_600_000),
    minute: Math.floor((rem % 3_600_000) / 60000),
    second: Math.floor((rem % 60000) / 1000),
    offsetMinutes: off,
  };
}

/** The civil date of a JavaScript Date: in `zone` if given, otherwise in the runtime's local zone. */
export function civilDateOf(date: Date, zone?: TimeZone): CivilDate {
  if (zone !== undefined) return civilDateAt(date.getTime(), zone);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}
