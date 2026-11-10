/**
 * The calculator under {@link Zmanim}: the sun for one civil day at one place, and the
 * interpreter that turns a catalogue entry's {@link Moment} into an instant. Internal; apps use
 * `Zmanim`.
 *
 * The day is the civil date in the location's IANA time zone. The sun is followed from that
 * day's local noon, so places near the date line (Chatham, Auckland, Sydney) get their own
 * day's times.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { assertCivil, daysToCivil, MS_PER_DAY, type CivilDate } from '../time/civil.js';
import { assertTimeZone, zonedToInstant, type TimeZone } from '../time/zone.js';
import { horizonDip, solarTransit, SUNRISE_ZENITH, timeAtZenith, type NoEventReason } from './solar.js';
import { usnoTimeAtZenith } from './usno.js';
import { DAYS, zmanDefinition, type Moment } from './opinions.js';
import type { ZmanUnavailableReason } from './zman.js';

/** A place on earth. */
export interface GeoLocation {
  /** Degrees north (negative south). */
  readonly latitude: number;
  /** Degrees east (negative west). */
  readonly longitude: number;
  /** Metres above sea level. Used only for elevation-adjusted sunrise/sunset. Default 0. */
  readonly elevation?: number;
  /** IANA zone name (e.g. "Asia/Jerusalem") or a provider. */
  readonly timeZone: TimeZone;
  /** Optional display name. */
  readonly name?: string;
}

/** Options for the calculator. Internal. */
export interface CalculatorOptions {
  /** Round to the minute (earliest times up, deadlines down). Default `true`. */
  rounding?: boolean;
  /**
   * Use elevation-adjusted sunrise and sunset for `sunrise()`, `sunset()` and the Gra day.
   * Default `false` (sea level), as most luchos do; zmanim defined by degrees are always
   * computed at sea level. See the docs, "Elevation".
   */
  useElevation?: boolean;
  /** Minutes before sunset for `candleLighting()`. Default 18. Must be finite, 0–180. */
  candleLightingMinutes?: number;
  /** Minutes after sunset for Ateret Torah's tzeis. Default 40. Must be finite, more than 0 and at most 180. */
  ateretTorahMinutes?: number;
  /**
   * What to do when the sun does not get low enough to reach an angle (high-latitude summer
   * nights, reason `'sun-always-above'`):
   * - `'none'` (default): return `null` with the reason;
   * - `'nearestDay'`: use the same offset from solar noon as on the nearest day when the
   *   angle is reached;
   * - `'halfNight'`: use solar midnight (the sun's lowest point).
   * Fallback times are marked in `Zman.fallback`. When the sun never rises high enough
   * (polar night, `'sun-always-below'`) no fallback applies and the time stays `null`.
   */
  highLatitudeFallback?: 'none' | 'nearestDay' | 'halfNight';
  /** Solar algorithm. Default `'noaa'`; `'usno'` is offered for cross-checking. */
  algorithm?: 'noaa' | 'usno';
}

type Raw = { time: number } | { reason: ZmanUnavailableReason; fallback?: never };

/** Accepted range, in minutes, for candle lighting and Ateret Torah's tzeis. */
const MINUTES_RANGE = { min: 0, max: 180 } as const;

function checkMinutes(what: string, m: number, allowZero: boolean): number {
  if (!Number.isFinite(m) || m < MINUTES_RANGE.min || m > MINUTES_RANGE.max || (!allowZero && m === 0)) {
    throw new RangeError(`${what}: minutes must be a finite number ${allowZero ? 'from' : 'greater than'} ${MINUTES_RANGE.min} ${allowZero ? 'to' : 'and at most'} ${MINUTES_RANGE.max}, got ${m}`);
  }
  return m;
}

/**
 * One step of a calculation, as the calculator took it: the {@link Moment} it evaluated and the
 * instant it reached (or why not). Offsets carry the minutes used; seasonal hours carry the
 * length of the hour and, for an hour of a named day, the day's start and end.
 */
export interface TraceStep {
  readonly moment: Moment;
  readonly time: number | null;
  readonly reason?: ZmanUnavailableReason;
  readonly fallback?: string;
  readonly minutes?: number;
  readonly hourMs?: number | null;
  readonly start?: number | null;
  readonly end?: number | null;
  readonly elevation?: boolean;
}

/** A seasonal hour (shaah zmanis) by some opinion. */
export interface ShaahZmanis {
  readonly id: string;
  /** Milliseconds in one seasonal hour, or null if the day's bounds do not occur. */
  readonly ms: number | null;
  /** Minutes (fractional), or null. */
  readonly minutes: number | null;
  readonly opinion: string;
  readonly source: string;
}

/** The sun and the catalogue's interpreter for one civil day at one place. Internal. */
export class DayCalculator {
  readonly location: GeoLocation;
  readonly date: CivilDate;
  readonly options: Required<CalculatorOptions>;
  private readonly transitMs: number;
  private readonly cache = new Map<string, Raw>();

  constructor(location: GeoLocation, date: CivilDate | HebrewDate, options: CalculatorOptions = {}) {
    if (!(Math.abs(location.latitude) <= 90) || !(Math.abs(location.longitude) <= 180)) {
      throw new RangeError(`Invalid coordinates ${location.latitude}, ${location.longitude}`);
    }
    if (location.elevation !== undefined && !Number.isFinite(location.elevation)) {
      throw new RangeError(`Invalid elevation ${location.elevation}: metres above sea level must be a finite number`);
    }
    assertTimeZone(location.timeZone);
    if (!(date instanceof HebrewDate)) assertCivil(date.year, date.month, date.day);
    this.location = location;
    this.date = date instanceof HebrewDate ? date.toCivil() : date;
    this.options = {
      rounding: options.rounding ?? true,
      useElevation: options.useElevation ?? false,
      candleLightingMinutes: checkMinutes('candleLightingMinutes', options.candleLightingMinutes ?? 18, true),
      ateretTorahMinutes: checkMinutes('ateretTorahMinutes', options.ateretTorahMinutes ?? 40, false),
      highLatitudeFallback: options.highLatitudeFallback ?? 'none',
      algorithm: options.algorithm ?? 'noaa',
    };
    const localNoon = zonedToInstant(this.date, 12 * 60, location.timeZone);
    this.transitMs = solarTransit(localNoon, location.longitude);
  }

  /** The Hebrew date of this day's daytime. */
  get hebrewDate(): HebrewDate {
    return HebrewDate.fromCivil(this.date);
  }

  // ---------------------------------------------------------------- internals

  private event(zenith: number, rising: boolean, transit = this.transitMs): { time: number } | { reason: NoEventReason } {
    const { latitude, longitude } = this.location;
    return this.options.algorithm === 'usno'
      ? usnoTimeAtZenith(transit, latitude, longitude, zenith, rising)
      : timeAtZenith(transit, latitude, longitude, zenith, rising);
  }

  /** Sun at `degrees` below the geometric horizon (no refraction), with the fallback if enabled. */
  private angle(degrees: number, rising: boolean): Raw & { fallback?: string } {
    const key = `a${degrees}${rising}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    let r: Raw & { fallback?: string } = this.event(90 + degrees, rising);
    // A fallback only stands in for a twilight that never gets dark enough (summer nights).
    // When the sun never rises high enough (polar night) there is no dawn or nightfall to
    // approximate, and any time would be invented: the null and its reason stay.
    if ('reason' in r && r.reason === 'sun-always-above') {
      const mode = this.options.highLatitudeFallback;
      if (mode === 'halfNight') {
        r = { time: this.solarMidnight(rising), fallback: 'Solar midnight (the sun\'s lowest point), used because the sun does not reach this angle' } as Raw & { fallback: string };
      } else if (mode === 'nearestDay') {
        for (let k = 1; k <= 183; k++) {
          for (const sign of [-1, 1]) {
            const tr = solarTransit(this.transitMs + sign * k * MS_PER_DAY, this.location.longitude);
            const e = this.event(90 + degrees, rising, tr);
            if ('time' in e) {
              const day = daysToCivil(Math.floor((this.transitMs + sign * k * MS_PER_DAY) / MS_PER_DAY));
              r = {
                time: this.transitMs + (e.time - tr),
                fallback: `Same offset from solar noon as on ${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}, the nearest day the sun reaches this angle`,
              } as Raw & { fallback: string };
              k = 1000;
              break;
            }
          }
        }
      }
    }
    this.cache.set(key, r);
    return r;
  }

  private solarMidnight(beforeNoon: boolean): number {
    const other = solarTransit(this.transitMs + (beforeNoon ? -1 : 1) * MS_PER_DAY, this.location.longitude);
    return (this.transitMs + other) / 2;
  }

  private riseSet(rising: boolean, elevation: boolean): Raw {
    const key = `rs${rising}${elevation}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const zenith = SUNRISE_ZENITH + (elevation ? horizonDip(this.location.elevation ?? 0) : 0);
    const e = this.event(zenith, rising);
    const r: Raw = 'time' in e ? e : { reason: rising ? 'no-sunrise' : 'no-sunset' };
    this.cache.set(key, r);
    return r;
  }

  private offset(base: Raw, minutes: number): Raw {
    return 'time' in base ? { time: base.time + minutes * 60_000 } : { reason: 'depends-on-missing-zman' };
  }

  private within(start: Raw & { fallback?: string }, end: Raw & { fallback?: string }, hours: number): Raw & { fallback?: string } {
    if (!('time' in start) || !('time' in end)) return { reason: 'depends-on-missing-zman' };
    const fallback = start.fallback ?? end.fallback;
    return { time: start.time + ((end.time - start.time) / 12) * hours, ...(fallback ? { fallback } : {}) };
  }

  private rise(): Raw { return this.riseSet(true, this.options.useElevation); }
  private set(): Raw { return this.riseSet(false, this.options.useElevation); }

  /** `hours` seasonal hours of the Gra day (sunrise to sunset) after `base`; negative is before. */
  private graHours(base: Raw, hours: number): Raw {
    const a = this.rise();
    const b = this.set();
    if (!('time' in a) || !('time' in b) || !('time' in base)) return { reason: 'depends-on-missing-zman' };
    return { time: base.time + hours * ((b.time - a.time) / 12) };
  }

  /**
   * The time a {@link Moment} names on this day: the interpreter of the catalogue. With `trace`,
   * every step is recorded in evaluation order (innermost first), for {@link Zman.explain}.
   */
  private evaluate(m: Moment, trace?: TraceStep[]): Raw & { fallback?: string } {
    let r: Raw & { fallback?: string };
    let extra: Partial<TraceStep> = {};
    if ('sun' in m) {
      switch (m.sun) {
        case 'rise': r = this.rise(); extra = { elevation: this.options.useElevation }; break;
        case 'set': r = this.set(); extra = { elevation: this.options.useElevation }; break;
        case 'rise-sea-level': r = this.riseSet(true, false); break;
        case 'set-sea-level': r = this.riseSet(false, false); break;
        case 'rise-elevation': r = this.riseSet(true, true); break;
        case 'set-elevation': r = this.riseSet(false, true); break;
        case 'noon': r = { time: this.transitMs }; break;
        case 'midnight': r = { time: this.solarMidnight(false) }; break;
      }
    } else if ('angle' in m) {
      r = this.angle(m.angle, m.rising);
    } else if ('offset' in m) {
      const minutes = typeof m.offset === 'number' ? m.offset : m.offset.sign * this.options[m.offset.option];
      r = this.offset(this.evaluate(m.from, trace), minutes);
      extra = { minutes };
    } else if ('hours' in m) {
      r = this.graHours(this.evaluate(m.from, trace), m.hours);
      const a = this.rise();
      const b = this.set();
      extra = { hourMs: 'time' in a && 'time' in b ? (b.time - a.time) / 12 : null };
    } else if ('hour' in m) {
      const day = DAYS[m.of]!;
      const s = this.evaluate(day.start, trace);
      const e = this.evaluate(day.end, trace);
      r = this.within(s, e, m.hour);
      extra = {
        start: 'time' in s ? s.time : null,
        end: 'time' in e ? e.time : null,
        hourMs: 'time' in s && 'time' in e ? (e.time - s.time) / 12 : null,
      };
    } else if ('later' in m) {
      const all = m.later.map((x) => this.evaluate(x, trace));
      let latest = -Infinity;
      r = { time: 0 };
      for (const x of all) {
        if (!('time' in x)) { r = { reason: 'depends-on-missing-zman' }; break; }
        latest = Math.max(latest, x.time);
      }
      if ('time' in r) r = { time: latest };
    } else {
      r = { reason: m.none };
    }
    trace?.push({
      moment: m,
      time: 'time' in r ? r.time : null,
      ...('reason' in r ? { reason: r.reason } : {}),
      ...(r.fallback ? { fallback: r.fallback } : {}),
      ...extra,
    });
    return r;
  }

  /**
   * A catalogue zman's exact time (or reason), with the steps that produced it. For the
   * `Zmanim` interface; not public.
   * @internal
   */
  traced(id: string): { raw: Raw & { fallback?: string }; steps: TraceStep[] } {
    const def = zmanDefinition(id);
    if (!def?.at) throw new RangeError(`Unknown zman "${id}"`);
    const steps: TraceStep[] = [];
    let raw = this.evaluate(def.at, steps);
    if (def.onlyOn === 'erev-pesach') {
      const h = this.hebrewDate;
      if (!(h.month === Month.NISAN && h.day === 14)) raw = { reason: 'not-applicable-today' };
    }
    return { raw, steps };
  }

  /**
   * The seasonal hour of a named day. For the `Zmanim` interface; not public.
   * @internal
   */
  shaahOf(dayId: string): ShaahZmanis | undefined {
    return Object.prototype.hasOwnProperty.call(DAYS, dayId) ? this.shaah(dayId, `shaah-zmanis-${dayId}`) : undefined;
  }

  private shaah(dayId: string, id: string): ShaahZmanis {
    const day = DAYS[dayId]!;
    const start = this.evaluate(day.start);
    const end = this.evaluate(day.end);
    const ms = 'time' in start && 'time' in end ? (end.time - start.time) / 12 : null;
    return { id, ms, minutes: ms === null ? null : ms / 60_000, opinion: day.opinion, source: day.source };
  }
}
