/**
 * The `Zman` result type and rounding.
 *
 * @packageDocumentation
 */

import { localParts, zoneName, type TimeZone } from '../time/zone.js';

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

/** One calculated time with the opinion it follows. */
export class Zman {
  /** Stable id, e.g. `"sof-zman-shema-gra"`. */
  readonly id: string;
  /** The instant, or `null` when it does not occur (see `reason`). Never a made-up time. */
  readonly time: Date | null;
  /** Whose opinion this is, in words. */
  readonly opinion: string;
  /** Where the opinion is found. */
  readonly source: string;
  /** How `time` was rounded, or `null` if it was not. */
  readonly rounded: RoundingDirection | null;
  /** Why `time` is null. */
  readonly reason?: ZmanUnavailableReason;
  /** Set when a high-latitude fallback produced the time (off by default). Describes the fallback. */
  readonly fallback?: string;
  /** The zone used for `toJSON`'s local time. */
  readonly timeZone: TimeZone;

  constructor(init: {
    id: string;
    time: Date | null;
    opinion: string;
    source: string;
    rounded: RoundingDirection | null;
    timeZone: TimeZone;
    reason?: ZmanUnavailableReason;
    fallback?: string;
  }) {
    this.id = init.id;
    this.time = init.time;
    this.opinion = init.opinion;
    this.source = init.source;
    this.rounded = init.rounded;
    this.timeZone = init.timeZone;
    if (init.reason) this.reason = init.reason;
    if (init.fallback) this.fallback = init.fallback;
  }

  /** Local wall-clock time `HH:MM` (or `HH:MM:SS` when not rounded), or null. */
  localTime(): string | null {
    if (!this.time) return null;
    const p = localParts(this.time.getTime(), this.timeZone);
    const hm = `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
    return this.rounded ? hm : `${hm}:${String(p.second).padStart(2, '0')}`;
  }

  /** Plain data for logging and APIs. */
  toJSON(): {
    id: string;
    time: string | null;
    local: string | null;
    timeZone: string;
    opinion: string;
    source: string;
    rounded: RoundingDirection | null;
    reason?: ZmanUnavailableReason;
    fallback?: string;
  } {
    return {
      id: this.id,
      time: this.time ? this.time.toISOString() : null,
      local: this.localTime(),
      timeZone: zoneName(this.timeZone),
      opinion: this.opinion,
      source: this.source,
      rounded: this.rounded,
      ...(this.reason ? { reason: this.reason } : {}),
      ...(this.fallback ? { fallback: this.fallback } : {}),
    };
  }
}

/** Rounds an instant to the minute in `direction`. Whole minutes are left as they are. */
export function roundToMinute(ms: number, direction: RoundingDirection): number {
  const m = 60_000;
  return direction === 'up' ? Math.ceil(ms / m) * m : Math.floor(ms / m) * m;
}
