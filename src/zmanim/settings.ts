/**
 * Reading and writing the settings that are not opinions, for storage, share links and servers:
 * the zmanim settings (`useElevation`, `candleLightingMinutes`, `ateretTorahMinutes`,
 * `highLatitudeFallback`, `algorithm`, `round`) and the customs the at-instant functions take
 * (`chanukahLighting`, `secondNightCandles`, `omerFrom`). Opinions have their own reader,
 * `Zmanim.parseOpinions`.
 *
 * @packageDocumentation
 */

import { zmanDefinition, type ZmanId } from './opinions.js';
import type { ZmanimSettings } from './zmanim.js';

/** The settings {@link parseSettings} reads and {@link settingsToJSON} writes. */
export interface Settings extends ZmanimSettings {
  readonly chanukahLighting?: 'sunset' | 'tzeis';
  readonly secondNightCandles?: ZmanId;
  readonly omerFrom?: 'tzeis' | 'holy-day-ends';
}

/** One problem {@link parseSettings} found. */
export interface SettingsProblem {
  readonly key: string;
  readonly value: unknown;
  readonly problem: string;
}

/** What {@link parseSettings} found. `value` always holds the valid settings, so an app can carry on with them. */
export type ParsedSettings =
  | { readonly ok: true; readonly value: Settings }
  | { readonly ok: false; readonly value: Settings; readonly problems: readonly SettingsProblem[] };

const oneOf = (...allowed: readonly string[]) => (v: unknown): string | null =>
  typeof v === 'string' && allowed.includes(v) ? null : `must be ${allowed.map((a) => `"${a}"`).join(' or ')}`;
const minutes = (min: number, inclusive: boolean) => (v: unknown): string | null =>
  typeof v === 'number' && Number.isFinite(v) && (inclusive ? v >= min : v > min) && v <= 180 ? null : `must be a number of minutes, ${inclusive ? 'from' : 'more than'} ${min} to 180`;

const CHECKS: Readonly<Record<keyof Settings, (v: unknown) => string | null>> = {
  useElevation: (v) => (typeof v === 'boolean' ? null : 'must be true or false'),
  candleLightingMinutes: minutes(0, true),
  ateretTorahMinutes: minutes(0, false),
  highLatitudeFallback: oneOf('none', 'nearestDay', 'halfNight'),
  algorithm: oneOf('noaa', 'usno'),
  round: oneOf('safe', 'none'),
  chanukahLighting: oneOf('sunset', 'tzeis'),
  secondNightCandles: (v) => (typeof v === 'string' && zmanDefinition(v)?.slot === 'tzeis' ? null : 'must be a nightfall (tzeis) zman id'),
  omerFrom: oneOf('tzeis', 'holy-day-ends'),
};

/**
 * Reads stored or received settings (parsed JSON, not a string): every key Luach knows with a valid
 * value goes into `value`; an unknown key or an invalid value is a problem, and is left out.
 * `null` or `undefined` is no settings. Never throws.
 */
export function parseSettings(json: unknown): ParsedSettings {
  const value: Record<string, unknown> = {};
  const problems: SettingsProblem[] = [];
  if (json === null || json === undefined) return { ok: true, value };
  if (typeof json !== 'object' || Array.isArray(json)) return { ok: false, value, problems: [{ key: '', value: json, problem: 'settings must be an object' }] };
  for (const [key, v] of Object.entries(json as Record<string, unknown>)) {
    const check = Object.prototype.hasOwnProperty.call(CHECKS, key) ? CHECKS[key as keyof Settings] : undefined;
    if (!check) { problems.push({ key, value: v, problem: 'is not a setting Luach knows' }); continue; }
    if (v === undefined) continue;
    const p = check(v);
    if (p) { problems.push({ key, value: v, problem: p }); continue; }
    value[key] = v;
  }
  return problems.length ? { ok: false, value: value as Settings, problems } : { ok: true, value: value as Settings };
}

/**
 * The settings as plain JSON: only the keys {@link parseSettings} reads, in a fixed order, without
 * the ones left out. `parseSettings(settingsToJSON(s)).value` is `s` for valid settings. Throws a
 * RangeError for an invalid value, so nothing invalid is written.
 */
export function settingsToJSON(settings: Settings): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(CHECKS) as (keyof Settings)[]) {
    const v = settings[key];
    if (v === undefined) continue;
    const p = CHECKS[key](v);
    if (p) throw new RangeError(`${key} ${p}, not ${JSON.stringify(v) ?? String(v)}`);
    out[key] = v;
  }
  return out;
}
