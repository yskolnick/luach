/**
 * The `Zman` result type and rounding.
 *
 * @packageDocumentation
 */

import { localParts, offsetMinutes, zoneName, type TimeZone } from '../time/zone.js';

/**
 * How a zman is rounded to the minute for display: an *earliest* time (e.g. the end of a
 * fast, netz for Shacharis) rounds **up**; a *deadline* (e.g. sof zman Krias Shema,
 * candle lighting) rounds **down**. Rounding never makes a time less stringent.
 */
export type RoundingDirection = 'up' | 'down';

/** Why a zman has no time. */
export type ZmanUnavailableReason =
  | 'sun-always-above'
  | 'sun-always-below'
  | 'no-sunrise'
  | 'no-sunset'
  | 'depends-on-missing-zman'
  | 'not-applicable-today'
  | 'requires-terrain-data';

/**
 * What kind of time a zman is. An *earliest* time (alos, netz, tzeis, the end of a fast) is
 * displayed rounded **up**; a *deadline* (sof zman Shema, candle lighting) rounded **down**, so a
 * displayed time is never less strict than the exact one.
 */
export type ZmanKind = 'earliest' | 'deadline';

/** One step of how a zman was reached, for {@link Zman.explain}. */
export interface ExplainStep {
  /** What the step did: the sun at the horizon, an angle, minutes, seasonal hours, a later-of, or nothing. */
  readonly op: 'sun' | 'angle' | 'offset' | 'hours' | 'hour' | 'later' | 'none';
  /** The instant this step reached, exact, or `null`. */
  readonly time: Date | null;
  /** The step in plain English, with the place's local time to the second. */
  readonly text: string;
  /** The numbers the step used (degrees, minutes, hours, the length of a seasonal hour in minutes, …). */
  readonly values: Readonly<Record<string, number | string | boolean | null>>;
}

/** How a zman was calculated on its day: every step, its opinion and its source. */
export interface Explanation {
  /** All the steps in one paragraph of plain English. */
  readonly text: string;
  /** The steps in the order they were taken (innermost first). */
  readonly steps: readonly ExplainStep[];
  readonly opinion: string;
  readonly source: string;
}

// Kept outside the class so that `Zman` stays plain data (no private fields: some runtimes,
// such as older Hermes and Google Apps Script, do not support them).
const EXPLAIN = new WeakMap<object, () => Explanation>();

/** One calculated time with the opinion it follows. */
export class Zman {
  /** Stable id, e.g. `"sof-zman-shema-gra"`. */
  readonly id: string;
  /**
   * The instant, rounded to the minute on the safe side (see {@link ZmanKind}), or `null` when
   * it does not occur (see `reason`). Never a made-up time. Safe to display by truncating.
   */
  readonly time: Date | null;
  /** The exact instant, to the millisecond on the safe side, or `null`. For calculation, not display. */
  readonly exact: Date | null;
  /** Whose opinion this is, in words. */
  readonly opinion: string;
  /** Where the opinion is found. */
  readonly source: string;
  /** How `time` was rounded from `exact`: up for an earliest time, down for a deadline. */
  readonly rounded: RoundingDirection | null;
  /** Why `time` is null. */
  readonly reason?: ZmanUnavailableReason;
  /** Set when a high-latitude fallback produced the time (off by default). Describes the fallback. */
  readonly fallback?: string;
  /**
   * Where `time` is null because the sun does not get low enough (`reason: 'sun-always-above'`,
   * far north in summer, or `'depends-on-missing-zman'` for a time made from such a one), what
   * each high-latitude rule gives, exactly as setting `highLatitudeFallback` would: `halfNight` (solar midnight, the
   * sun's lowest point) and `nearestDay` (the same offset from solar noon as on the nearest day
   * the sun reaches the angle), each marked in its own `fallback`. Neither is used unless the
   * caller chooses it; which applies is a question for a rav (see the halachic choices page).
   * Absent otherwise, and where no rule gives a time (polar night).
   */
  readonly fallbacks?: { readonly halfNight: Zman; readonly nearestDay: Zman };
  /** The zone used for `toJSON`'s local time. */
  readonly timeZone: TimeZone;
  /** An earliest time or a deadline (see {@link ZmanKind}); its rounding follows from it. */
  readonly kind: ZmanKind;
  /** The kind of time this is, e.g. `"shema"` or `"tzeis"`. */
  readonly slot: string;

  constructor(init: {
    id: string;
    time: Date | null;
    exact: Date | null;
    opinion: string;
    source: string;
    rounded: RoundingDirection | null;
    timeZone: TimeZone;
    reason?: ZmanUnavailableReason;
    fallback?: string;
    fallbacks?: { readonly halfNight: Zman; readonly nearestDay: Zman };
    kind: ZmanKind;
    slot: string;
    explain?: () => Explanation;
  }) {
    this.id = init.id;
    this.time = init.time;
    this.exact = init.exact;
    this.opinion = init.opinion;
    this.source = init.source;
    this.rounded = init.rounded;
    this.timeZone = init.timeZone;
    if (init.reason) this.reason = init.reason;
    if (init.fallback) this.fallback = init.fallback;
    if (init.fallbacks) this.fallbacks = Object.freeze({ ...init.fallbacks });
    this.kind = init.kind;
    this.slot = init.slot;
    if (init.explain) EXPLAIN.set(this, init.explain);
  }

  /**
   * How this time was calculated today: each step with its local time, then the opinion and
   * source. Luach calculates; it does not rule. This shows exactly what it calculated.
   */
  explain(): Explanation {
    const f = EXPLAIN.get(this);
    if (f) return f();
    const text = this.time ? `${this.localTime()}.` : `No time: ${this.reason ?? 'unknown'}.`;
    return { text, steps: [], opinion: this.opinion, source: this.source };
  }

  /**
   * Milliseconds from `now` until this time, in whole minutes rounded so that a countdown is
   * never generous: down to a deadline, up to an earliest time. Negative once it has passed;
   * `null` if there is no time.
   */
  remaining(now: Date): number | null {
    if (!this.time) return null;
    const ms = this.time.getTime() - now.getTime();
    const minute = 60_000;
    return (this.kind === 'deadline' ? Math.floor(ms / minute) : Math.ceil(ms / minute)) * minute;
  }

  /**
   * Local wall-clock time, or null: `HH:MM`, already rounded on the safe side. With
   * `{ exact: true }`, or when the time is not rounded (`round: 'none'`), the exact time as `HH:MM:SS`.
   */
  localTime(options?: { exact?: boolean }): string | null {
    // Not rounded (`round: 'none'`): the exact time, with its seconds.
    const exact = options?.exact ?? (this.rounded === null && this.time !== null);
    const at = exact ? this.exact : this.time;
    if (!at) return null;
    const p = localParts(at.getTime(), this.timeZone);
    const hm = `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
    return exact ? `${hm}:${String(p.second).padStart(2, '0')}` : hm;
  }

  /** Plain data for logging and APIs. */
  toJSON(): {
    id: string;
    time: string | null;
    exact: string | null;
    local: string | null;
    offset: string | null;
    timeZone: string;
    opinion: string;
    source: string;
    rounded: RoundingDirection | null;
    kind: ZmanKind;
    slot: string;
    reason?: ZmanUnavailableReason;
    fallback?: string;
    fallbacks?: { halfNight: ReturnType<Zman['toJSON']>; nearestDay: ReturnType<Zman['toJSON']> };
  } {
    return {
      id: this.id,
      time: this.time ? this.time.toISOString() : null,
      exact: this.exact ? this.exact.toISOString() : null,
      local: this.localTime(),
      offset: this.time ? offsetText(offsetMinutes(this.timeZone, this.time.getTime())) : null,
      timeZone: zoneName(this.timeZone),
      opinion: this.opinion,
      source: this.source,
      rounded: this.rounded,
      kind: this.kind,
      slot: this.slot,
      ...(this.reason ? { reason: this.reason } : {}),
      ...(this.fallback ? { fallback: this.fallback } : {}),
      ...(this.fallbacks ? { fallbacks: { halfNight: this.fallbacks.halfNight.toJSON(), nearestDay: this.fallbacks.nearestDay.toJSON() } } : {}),
    };
  }
}

/** An offset from UTC as ISO 8601 text: `-05:00`, `+02:00`. */
export function offsetText(minutes: number): string {
  const m = Math.abs(minutes);
  return `${minutes < 0 ? '-' : '+'}${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Rounds an instant to the minute in `direction`. Whole minutes are left as they are. */
export function roundToMinute(ms: number, direction: RoundingDirection): number {
  const m = 60_000;
  return direction === 'up' ? Math.ceil(ms / m) * m : Math.floor(ms / m) * m;
}

/**
 * Rounds an instant to a whole minute of the local clock in `zone`. The same as
 * {@link roundToMinute} for zones whose offset is whole minutes; for historical local mean
 * time (an offset with seconds) it keeps the displayed `HH:MM` on the safe side.
 */
export function roundToLocalMinute(ms: number, direction: RoundingDirection, zone: TimeZone): number {
  const off = Math.round(offsetMinutes(zone, ms) * 60_000);
  const frac = ((off % 60_000) + 60_000) % 60_000;
  return roundToMinute(ms + frac, direction) - frac;
}
