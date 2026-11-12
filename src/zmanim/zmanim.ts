/**
 * Zmanim for a place, by the opinions its user follows.
 *
 * ```ts
 * const z = new Zmanim(getPlace('lakewood')!, { shema: 'sof-zman-shema-mga-72' });
 * const today = z.at(new Date());          // the civil day at the place, not on this machine
 * today.slot('shema').localTime();         // "09:13": the user's opinion, rounded down (a deadline)
 * today.get('sof-zman-shema-gra');         // any opinion by id
 * z.next(new Date());                      // the next of the day's times, across midnight
 * today.slot('shema').explain().text;      // how it was calculated today, step by step
 * ```
 *
 * Every time is exact (`Zman.time`); `localTime()` rounds it for display on the safe side.
 * Every default is documented as a default, not a ruling. Ask your rav.
 *
 * @packageDocumentation
 */

import type { DayLocation } from './day-location.js';
import { HebrewDate } from '../calendar/hebrew-date.js';
import { assertCivil, civilToDays, daysToCivil, type CivilDate } from '../time/civil.js';
import { civilDateAt, localParts, type TimeZone } from '../time/zone.js';
import { he } from '../locales/he.js';
import type { Locale } from '../locales/types.js';
import { DayCalculator, type GeoLocation, type ShaahZmanis, type TraceStep } from './calendar.js';
import { isInIsrael } from '../places/israel.js';
import { LEGACY_METHOD_IDS } from './legacy.js';
import { DAYS, ZMANIM, zmanDefinition, zmanLabel, type Moment, type Slot, type ZmanId, type ZmanIdIn } from './opinions.js';
import { roundToLocalMinute, Zman, type ExplainStep, type Explanation, type ZmanKind, type ZmanUnavailableReason } from './zman.js';

/**
 * A user's opinions: for each choice, the id of a zman of the right kind. Anything left out
 * uses {@link Zmanim.defaults}. Plain JSON, so an app can store and sync it; read stored values
 * back with {@link Zmanim.parseOpinions}.
 */
export interface Opinions {
  readonly alos?: ZmanIdIn<'alos'>;
  readonly misheyakir?: ZmanIdIn<'misheyakir'>;
  readonly sunrise?: ZmanIdIn<'sunrise'>;
  readonly shema?: ZmanIdIn<'shema'>;
  readonly tefilla?: ZmanIdIn<'tefilla'>;
  readonly chatzos?: ZmanIdIn<'chatzos'>;
  readonly minchaGedola?: ZmanIdIn<'minchaGedola'>;
  readonly minchaKetana?: ZmanIdIn<'minchaKetana'>;
  readonly plag?: ZmanIdIn<'plag'>;
  readonly sunset?: ZmanIdIn<'sunset'>;
  readonly tzeis?: ZmanIdIn<'tzeis'>;
  readonly chatzosHalayla?: ZmanIdIn<'chatzosHalayla'>;
  /** When Shabbos and Yom Tov end (and second-night candles may be lit): a tzeis. */
  readonly havdala?: ZmanIdIn<'tzeis'>;
  /** When a minor fast begins: an alos. */
  readonly fastBegins?: ZmanIdIn<'alos'>;
  /** When a fast ends: a tzeis. */
  readonly fastEnds?: ZmanIdIn<'tzeis'>;
  /** When the Hebrew date changes in the evening: sunset or a tzeis. */
  readonly dayBoundary?: ZmanIdIn<'sunset' | 'tzeis'>;
}

/** A choice a user makes: which opinion to follow for one time of the day or one boundary. */
export type Role = keyof Opinions;

/** The times of a day, in order, that {@link ZmanimDay.slots} lists. */
export type DaySlot = 'alos' | 'misheyakir' | 'sunrise' | 'shema' | 'tefilla' | 'chatzos' | 'minchaGedola' | 'minchaKetana' | 'plag' | 'sunset' | 'tzeis';

/** A part of the day, for {@link ZmanimDay.slots}. */
export type DayPart = 'morning' | 'afternoon' | 'evening';

/** A named halachic day whose seasonal hour {@link ZmanimDay.shaahZmanis} gives. */
export type DayName = 'gra' | 'mga-72' | 'mga-90' | 'mga-96' | 'mga-120' | 'mga-72-zmaniyos' | 'mga-90-zmaniyos' | 'mga-96-zmaniyos' | 'mga-16.1' | 'baal-hatanya' | 'ateret-torah';

/** Facts about the place and the user that are not opinions. */
export interface ZmanimSettings {
  /**
   * Minutes before sunset for candle lighting: a custom of the place or the shul, not an opinion
   * (0–180). Default: the place's documented custom when it has one (`candleLighting` on a
   * built-in `Place`, such as Jerusalem's 40 minutes), otherwise 18.
   */
  readonly candleLightingMinutes?: number;
  /** Elevation-adjusted sunrise and sunset, and the Gra day built on them. Default false (sea level). Degree-based zmanim are always at sea level. */
  readonly useElevation?: boolean;
  /** Minutes after sunset for Ateret Torah's tzeis. Default 40. */
  readonly ateretTorahMinutes?: number;
  /** When the sun does not reach an angle: `'none'` (default; the time is null), `'nearestDay'` or `'halfNight'`, marked in `Zman.fallback`. */
  readonly highLatitudeFallback?: 'none' | 'nearestDay' | 'halfNight';
  /** Solar algorithm. Default `'noaa'`; `'usno'` for cross-checking. */
  readonly algorithm?: 'noaa' | 'usno';
}

/** One problem found in stored opinions. */
export interface OpinionProblem {
  readonly key: string;
  readonly value: unknown;
  readonly problem: string;
}

/** What {@link Zmanim.parseOpinions} found. `value` always holds the valid choices, so an app can carry on with them. */
export type ParsedOpinions =
  | { readonly ok: true; readonly value: Opinions; readonly upgraded: readonly { key: string; from: string; to: ZmanId }[] }
  | { readonly ok: false; readonly value: Opinions; readonly upgraded: readonly { key: string; from: string; to: ZmanId }[]; readonly problems: readonly OpinionProblem[] };

const ROLE_SLOTS: Readonly<Record<Role, readonly Slot[]>> = Object.freeze({
  alos: ['alos'], misheyakir: ['misheyakir'], sunrise: ['sunrise'], shema: ['shema'], tefilla: ['tefilla'], chatzos: ['chatzos'],
  minchaGedola: ['minchaGedola'], minchaKetana: ['minchaKetana'], plag: ['plag'], sunset: ['sunset'], tzeis: ['tzeis'],
  chatzosHalayla: ['chatzosHalayla'], havdala: ['tzeis'], fastBegins: ['alos'], fastEnds: ['tzeis'], dayBoundary: ['sunset', 'tzeis'],
});

/** Times that depend on the calendar (which days need them), not on the sun alone. */
const CALENDAR_ROLES: readonly Role[] = ['havdala', 'fastBegins', 'fastEnds', 'dayBoundary'];
const CALENDAR_SLOTS: readonly Slot[] = ['candleLighting', 'havdala', 'fast'];

const DEFAULTS: Readonly<Required<Opinions>> = Object.freeze({
  alos: 'alos-72',
  misheyakir: 'misheyakir-11',
  sunrise: 'sunrise',
  shema: 'sof-zman-shema-gra',
  tefilla: 'sof-zman-tefilla-gra',
  chatzos: 'chatzos',
  minchaGedola: 'mincha-gedola-greater',
  minchaKetana: 'mincha-ketana-gra',
  plag: 'plag-hamincha-gra',
  sunset: 'sunset',
  tzeis: 'tzeis-8.5',
  chatzosHalayla: 'chatzos-halayla',
  havdala: 'tzeis-8.5',
  fastBegins: 'alos-72',
  fastEnds: 'tzeis-7.083',
  dayBoundary: 'sunset',
} as const);

const ORDER: readonly DaySlot[] = ['alos', 'misheyakir', 'sunrise', 'shema', 'tefilla', 'chatzos', 'minchaGedola', 'minchaKetana', 'plag', 'sunset', 'tzeis'];
const PART: Readonly<Record<DaySlot, DayPart>> = {
  alos: 'morning', misheyakir: 'morning', sunrise: 'morning', shema: 'morning', tefilla: 'morning',
  chatzos: 'afternoon', minchaGedola: 'afternoon', minchaKetana: 'afternoon', plag: 'afternoon',
  sunset: 'evening', tzeis: 'evening',
};
const ALIASES: Readonly<Record<string, Role>> = { tefillah: 'tefilla', shabbosEnds: 'havdala', shkiah: 'sunset', netz: 'sunrise' };

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const isRole = (k: string): k is Role => has(ROLE_SLOTS, k);

/** The problem with `id` for `role`, or null if it fits. */
function problemWith(role: Role, id: unknown): string | null {
  if (typeof id !== 'string') return 'is not a zman id';
  const def = zmanDefinition(id);
  if (!def) return `"${id}" is not a zman id`;
  if (!ROLE_SLOTS[role].includes(def.slot)) return `"${id}" is a ${def.slot} time, not a ${ROLE_SLOTS[role].join(' or ')} time`;
  return null;
}

function kindOf(id: string): ZmanKind {
  return zmanDefinition(id)!.round === 'up' ? 'earliest' : 'deadline';
}

/** The note on the 18-minute default in Israel. @internal */
export const CANDLE_ISRAEL_NOTE = '(Luach has no documented custom for this place)';

/** Zmanim at one place, by one set of opinions. Immutable. */
export class Zmanim {
  /** The place. */
  readonly place: GeoLocation;
  /** The opinions in force: the ones given, and the defaults for the rest. */
  readonly opinions: Readonly<Required<Opinions>>;
  /** Settings that are not opinions: the ones given, and the place's candle-lighting custom when the minutes were not given. */
  readonly settings: Readonly<ZmanimSettings>;
  /** The place's documented candle-lighting custom, when it sets the minutes. @internal */
  readonly candleCustom: DayLocation['candleLighting'] | undefined;
  /**
   * A note on the candle-lighting time, when the location is in Israel and neither a documented
   * custom of the place nor `candleLightingMinutes` sets it: some cities there have their own
   * custom. Never a guess at which city; null otherwise. @internal
   */
  readonly candleNote: string | null;
  private readonly days = new Map<number, ZmanimDay>();

  /**
   * Throws a RangeError for an opinion of the wrong kind or an unknown id (a mistake in code;
   * for settings read from storage use {@link Zmanim.parseOpinions}), invalid coordinates or an
   * unknown time zone.
   */
  constructor(place: GeoLocation, opinions: Opinions = {}, settings: ZmanimSettings = {}) {
    for (const [k, v] of Object.entries(opinions)) {
      if (!isRole(k)) throw new RangeError(`Unknown opinion "${k}"`);
      const p = problemWith(k, v);
      if (p) throw new RangeError(`opinions.${k}: ${p}`);
    }
    // The place's documented custom sets the candle-lighting minutes unless the caller did.
    const custom = settings.candleLightingMinutes === undefined ? (place as DayLocation).candleLighting : undefined;
    const effective: ZmanimSettings = custom ? { ...settings, candleLightingMinutes: custom.minutes } : settings;
    // Checks the place and the settings once, so that queries never throw.
    new DayCalculator(place, { year: 2000, month: 1, day: 1 }, effective);
    this.place = place;
    this.opinions = Object.freeze({ ...DEFAULTS, ...opinions });
    this.settings = Object.freeze({ ...effective });
    this.candleCustom = custom;
    // Every location in Israel with no custom of its own and no minutes given: a built-in place without a documented custom, a city of the full table, a record of the caller's, or bare coordinates.
    this.candleNote = !custom && settings.candleLightingMinutes === undefined && isInIsrael(place.latitude, place.longitude) ? CANDLE_ISRAEL_NOTE : null;
  }

  /** The documented defaults: conveniences, not rulings. */
  static readonly defaults: Readonly<Required<Opinions>> = DEFAULTS;

  /** The times of the day, in order, as {@link ZmanimDay.slots} lists them. */
  static readonly order: readonly DaySlot[] = ORDER;

  /** Every zman a user may choose for `role`, in catalogue order: for a settings picker. */
  static choices(role: Role): readonly ZmanId[] {
    const slots = ROLE_SLOTS[role];
    if (!slots) throw new RangeError(`Unknown opinion "${role}"`);
    return (Object.keys(ZMANIM) as ZmanId[]).filter((id) => {
      const d = zmanDefinition(id)!;
      return slots.includes(d.slot) && d.at !== undefined;
    });
  }

  /**
   * Reads opinions from storage or a request: plain JSON in, valid {@link Opinions} out. It reads
   * Luach 0.1's method names (`"sofZmanShemaMga72"`), the keys `tefillah` and `shabbosEnds`, and
   * havdala as `"degrees-8.5"` or `"minutes-72"`, and reports what it changed and what it could
   * not use. Never throws.
   */
  static parseOpinions(json: unknown): ParsedOpinions {
    const value: Record<string, string> = {};
    const problems: OpinionProblem[] = [];
    const upgraded: { key: string; from: string; to: ZmanId }[] = [];
    if (json === null || json === undefined) return { ok: true, value, upgraded };
    if (typeof json !== 'object' || Array.isArray(json)) {
      return { ok: false, value, upgraded, problems: [{ key: '', value: json, problem: 'opinions must be an object' }] };
    }
    for (const [rawKey, v] of Object.entries(json as Record<string, unknown>)) {
      const key = isRole(rawKey) ? rawKey : ALIASES[rawKey];
      if (!key) { problems.push({ key: rawKey, value: v, problem: 'is not an opinion Luach knows' }); continue; }
      let id = v;
      if (typeof v === 'string' && !zmanDefinition(v)) {
        const legacy = LEGACY_METHOD_IDS[v];
        const m = /^(degrees|minutes)-(\d+(?:\.\d+)?)$/.exec(v);
        const fromAfterSunset = m ? `tzeis-${m[2]}` : undefined;
        id = legacy ?? (fromAfterSunset && zmanDefinition(fromAfterSunset) ? fromAfterSunset : v);
      }
      const p = problemWith(key, id);
      if (p) { problems.push({ key: rawKey, value: v, problem: p }); continue; }
      if (id !== v || key !== rawKey) upgraded.push({ key: rawKey, from: String(v), to: id as ZmanId });
      value[key] = id as string;
    }
    return problems.length ? { ok: false, value: value as Opinions, upgraded, problems } : { ok: true, value: value as Opinions, upgraded };
  }

  /** The civil day `date` at the place. A Hebrew date means its daytime. */
  on(date: CivilDate | HebrewDate): ZmanimDay {
    const c = date instanceof HebrewDate ? date.toCivil() : date;
    if (!(date instanceof HebrewDate)) assertCivil(c.year, c.month, c.day);
    return this.day(civilToDays(c.year, c.month, c.day));
  }

  /** The civil day at the place that contains `instant` (by the place's clock, never this machine's). */
  at(instant: Date): ZmanimDay {
    const c = civilDateAt(instant.getTime(), this.place.timeZone);
    return this.day(civilToDays(c.year, c.month, c.day));
  }

  /**
   * The next time after `now`, across midnight and into later days, of the day's times (by
   * default all of {@link Zmanim.order}), or of the choices and ids in `which`. `null` if none
   * occurs within a year (polar regions). Times that depend on the calendar (candle lighting,
   * havdala, fasts) come from the day view, not from here.
   */
  next(now: Date, which?: DaySlot | Role | ZmanId | readonly (DaySlot | Role | ZmanId)[]): Zman | null {
    const ids = this.resolve(which);
    const t = now.getTime();
    const d0 = this.dayNumber(now);
    let best: Zman | null = null;
    let foundAt: number | null = null;
    for (let k = -1; k <= 366; k++) {
      const day = this.day(d0 + k);
      for (const id of ids) {
        const z = day.get(id);
        if (z.time && z.time.getTime() > t && (!best || z.time.getTime() < best.time!.getTime())) best = z;
      }
      if (best && foundAt === null) foundAt = k;
      if (foundAt !== null && k > foundAt) break;
    }
    return best;
  }

  /** Every time in `[from, to)`, in time order; times that do not occur are left out. Same `which` as {@link Zmanim.next}. */
  between(from: Date, to: Date, which?: DaySlot | Role | ZmanId | readonly (DaySlot | Role | ZmanId)[]): Zman[] {
    const ids = this.resolve(which);
    const a = from.getTime();
    const b = to.getTime();
    const out: Zman[] = [];
    for (let d = this.dayNumber(from) - 1; d <= this.dayNumber(to) + 1; d++) {
      const day = this.day(d);
      for (const id of ids) {
        const z = day.get(id);
        if (z.time && z.time.getTime() >= a && z.time.getTime() < b) out.push(z);
      }
    }
    return out.sort((x, y) => x.time!.getTime() - y.time!.getTime());
  }

  /**
   * The times of `which` (as {@link Zmanim.next} takes it; default all of {@link Zmanim.order}) on
   * the civil day `day`, in the order asked, including those that do not occur. For the calendar
   * functions that need each time with the day whose view gives it. Internal.
   * @internal
   */
  dayTimes(day: CivilDate, which?: DaySlot | Role | ZmanId | readonly (DaySlot | Role | ZmanId)[]): Zman[] {
    const d = this.on(day);
    return this.resolve(which).map((id) => d.get(id));
  }

  /**
   * The Hebrew date at `instant` at the place: the civil date there, moved on once the
   * `dayBoundary` opinion (default sunset) has passed. Where the boundary does not occur that
   * day (polar regions) the civil date is used.
   */
  hebrewDateAt(instant: Date): HebrewDate {
    const t = instant.getTime();
    const d = this.dayNumber(instant);
    const id = this.opinions.dayBoundary;
    // At high latitudes yesterday's boundary can fall after midnight; until it passes the
    // Hebrew date is still yesterday's.
    const prev = this.day(d - 1).get(id).exact ?? null;
    if (prev !== null && t < prev.getTime()) return HebrewDate.fromCivil(daysToCivil(d - 1));
    const end = this.day(d).get(id).exact ?? null;
    return HebrewDate.fromCivil(daysToCivil(d), { afterSunset: end !== null && t >= end.getTime() });
  }

  private dayNumber(instant: Date): number {
    const c = civilDateAt(instant.getTime(), this.place.timeZone);
    return civilToDays(c.year, c.month, c.day);
  }

  private day(n: number): ZmanimDay {
    let d = this.days.get(n);
    if (!d) {
      if (this.days.size >= 16) this.days.delete(this.days.keys().next().value as number);
      d = new ZmanimDay(this, daysToCivil(n));
      this.days.set(n, d);
    }
    return d;
  }

  private resolve(which: DaySlot | Role | ZmanId | readonly (DaySlot | Role | ZmanId)[] | undefined): ZmanId[] {
    const list: readonly string[] = which === undefined ? ORDER : typeof which === 'string' ? [which] : which;
    return list.map((w) => {
      if (isRole(w)) {
        if (CALENDAR_ROLES.includes(w)) throw new RangeError(`"${w}" depends on the calendar: use dayInfo, fastTimes or hebrewDateAt (timesBetween lists the calendar's times itself)`);
        return this.opinions[w];
      }
      const def = zmanDefinition(w);
      if (!def?.at) throw new RangeError(`Unknown zman "${w}"`);
      if (CALENDAR_SLOTS.includes(def.slot)) throw new RangeError(`"${w}" depends on the calendar: use dayInfo (timesBetween lists the calendar's times itself)`);
      return w as ZmanId;
    });
  }
}

/** One civil day of a {@link Zmanim}. Immutable; computes each time once. */
export class ZmanimDay {
  /** The civil date. */
  readonly date: CivilDate;
  private readonly owner: Zmanim;
  private readonly engine: DayCalculator;
  private readonly cache = new Map<string, Zman>();

  /** @internal Use {@link Zmanim.on} or {@link Zmanim.at}. */
  constructor(owner: Zmanim, date: CivilDate) {
    this.owner = owner;
    this.date = date;
    this.engine = new DayCalculator(owner.place, date, { ...owner.settings, rounding: false });
  }

  /** The place. */
  get place(): GeoLocation {
    return this.owner.place;
  }

  /**
   * The time the user's opinion gives for one choice (`'shema'`, `'tzeis'`, …). `'chametzEat'`
   * and `'chametzBurn'` follow the Shema opinion's day where Luach has that day's chametz times,
   * and the Gra otherwise (the result's `opinion` says which).
   */
  slot(role: Role | 'chametzEat' | 'chametzBurn'): Zman {
    if (role === 'chametzEat' || role === 'chametzBurn') return this.get(chametzFor(this.owner.opinions.shema, role));
    if (!isRole(role)) throw new RangeError(`Unknown opinion "${String(role)}"`);
    return this.get(this.owner.opinions[role]);
  }

  /** The day's times in order, each by the user's opinion; `part` keeps morning, afternoon or evening only. */
  slots(part?: DayPart): Zman[] {
    return ORDER.filter((s) => !part || PART[s] === part).map((s) => this.slot(s));
  }

  /** A zman by id, whatever the user's opinions. Throws a RangeError for an unknown id. */
  get(id: ZmanId): Zman {
    let z = this.cache.get(id);
    if (z) return z;
    const def = zmanDefinition(id);
    if (!def) throw new RangeError(`Unknown zman "${String(id)}"`);
    if (!def.at) throw new RangeError(`"${id}" is not computed on its own: use dayInfo or fastTimes`);
    const custom = id === 'candle-lighting' ? this.owner.candleCustom : undefined;
    z = custom
      ? this.build(id, id, `Candle lighting ${custom.minutes} minutes before sunset, ${custom.custom}`, `${custom.source}; Shulchan Aruch OC 261:2 (tosefes Shabbos)`)
      : this.build(id, id, id === 'candle-lighting' && this.owner.candleNote ? `${def.opinion} ${this.owner.candleNote}` : def.opinion, def.source);
    this.cache.set(id, z);
    return z;
  }

  /**
   * The time of `from`, as the catalogue entry `id`: its slot and kind (so its rounding), with
   * the given opinion and source. For times the calendar defines by another zman (the fast
   * begins at the user's alos, havdala at the user's tzeis). Internal.
   * @internal
   */
  labelled(id: string, from: ZmanId, opinion: string, source: string): Zman {
    return this.build(id, from, opinion, source);
  }

  private build(id: string, from: ZmanId, opinion: string, source: string): Zman {
    const def = zmanDefinition(id);
    if (!def) throw new RangeError(`Unknown zman "${id}"`);
    const { raw, steps } = this.engine.traced(from);
    const tz = this.owner.place.timeZone;
    const kind = kindOf(id);
    const exact = 'time' in raw ? (kind === 'earliest' ? Math.ceil(raw.time) : Math.floor(raw.time)) : null;
    const direction = kind === 'earliest' ? 'up' : 'down';
    return new Zman({
      id,
      time: exact === null ? null : new Date(roundToLocalMinute(exact, direction, tz)),
      // To the millisecond on the safe side, so rounding it gives the same minute as rounding
      // the exact instant would (never less strict).
      exact: exact === null ? null : new Date(exact),
      opinion,
      source,
      rounded: direction,
      timeZone: tz,
      kind,
      slot: def.slot,
      ...('reason' in raw ? { reason: raw.reason } : {}),
      ...(raw.fallback ? { fallback: raw.fallback } : {}),
      explain: () => explanation(steps, tz, opinion, source, 'reason' in raw ? raw.reason : undefined, exact, kind),
    });
  }

  /** The length of a seasonal hour (shaah zmanis) on a named day. */
  shaahZmanis(day: DayName): ShaahZmanis {
    const s = this.engine.shaahOf(day);
    if (!s) throw new RangeError(`Unknown day "${String(day)}"`);
    return s;
  }
}

function chametzFor(shema: ZmanId, role: 'chametzEat' | 'chametzBurn'): ZmanId {
  const at = zmanDefinition(shema)?.at;
  const day = at && 'hour' in at ? at.of : 'gra';
  const match = (Object.keys(ZMANIM) as ZmanId[]).find((id) => {
    const d = zmanDefinition(id)!;
    return d.slot === role && d.at !== undefined && 'hour' in d.at && d.at.of === day;
  });
  return match ?? (role === 'chametzEat' ? 'sof-zman-achilas-chametz-gra' : 'sof-zman-biur-chametz-gra');
}

/**
 * The parts of a zman's name: `{ full: "Latest Shema (Gra)", slot: "Latest Shema", qualifier: "Gra" }`.
 * `slot` is the same for every opinion of one time, for a heading; `qualifier` names the opinion,
 * or is null when there is only one.
 */
export function zmanName(id: ZmanId, locale: Locale = he): { full: string; slot: string; qualifier: string | null } {
  const full = zmanLabel(id, locale);
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/u.exec(full);
  // The qualifier keeps the label's left-to-right marks, which hold a degree sign to its number in Hebrew.
  return m ? { full, slot: m[1]!, qualifier: m[2]! } : { full, slot: full, qualifier: null };
}

// ---------------------------------------------------------------- explain()

function clock(ms: number | null | undefined, tz: TimeZone): string {
  if (ms === null || ms === undefined) return '—';
  const p = localParts(ms, tz);
  return [p.hour, p.minute, p.second].map((n) => String(n).padStart(2, '0')).join(':');
}

const minutesText = (ms: number | null | undefined) => (ms === null || ms === undefined ? '—' : `${Math.round((ms / 60_000) * 10) / 10} min`);
const num = (n: number) => String(Math.round(n * 1000) / 1000);

const SUN_NAMES: Readonly<Record<string, string>> = {
  'rise-sea-level': 'Sunrise at sea level',
  'set-sea-level': 'Sunset at sea level',
  'rise-elevation': 'Sunrise adjusted for elevation',
  'set-elevation': 'Sunset adjusted for elevation',
  noon: 'Midday, the sun on the meridian',
  midnight: 'Midnight, halfway to the next midday',
};

function reasonText(reason: ZmanUnavailableReason | undefined, m: Moment): string {
  if ('angle' in m) {
    const where = m.angle >= 0 ? `${num(m.angle)}° below` : `${num(-m.angle)}° above`;
    if (reason === 'sun-always-above') return `The sun does not get ${where} the horizon on this day.`;
    if (reason === 'sun-always-below') return `The sun stays lower than ${where} the horizon all day.`;
  }
  switch (reason) {
    case 'no-sunrise': return 'The sun does not rise on this day.';
    case 'no-sunset': return 'The sun does not set on this day.';
    case 'requires-terrain-data': return 'Not computed: it needs terrain data.';
    case 'not-applicable-today': return 'Not today: this time exists on one day of the year only.';
    default: return 'No time: it depends on a time that does not occur on this day.';
  }
}

function stepOf(s: TraceStep, tz: TimeZone): ExplainStep {
  const m = s.moment;
  const time = s.time === null ? null : new Date(s.time);
  const at = clock(s.time, tz);
  const missing = s.time === null;
  const fb = s.fallback ? ` (${s.fallback})` : '';
  if ('sun' in m) {
    const name = m.sun === 'rise' || m.sun === 'set'
      ? `${m.sun === 'rise' ? 'Sunrise' : 'Sunset'} ${s.elevation ? 'adjusted for elevation' : 'at sea level'}`
      : SUN_NAMES[m.sun]!;
    return { op: 'sun', time, text: missing ? reasonText(s.reason, m) : `${name}: ${at}.`, values: { sun: m.sun, elevation: s.elevation ?? null } };
  }
  if ('angle' in m) {
    const where = m.angle >= 0 ? `${num(m.angle)}° below` : `${num(-m.angle)}° above`;
    const text = missing ? reasonText(s.reason, m) : `The sun ${where} the horizon, ${m.rising ? 'morning' : 'evening'}: ${at}${fb}.`;
    return { op: 'angle', time, text, values: { degrees: m.angle, rising: m.rising } };
  }
  if ('offset' in m) {
    const n = s.minutes ?? 0;
    const text = missing ? reasonText(s.reason, m) : `${num(Math.abs(n))} minutes ${n < 0 ? 'before' : 'after'} that: ${at}.`;
    return { op: 'offset', time, text, values: { minutes: n } };
  }
  if ('hours' in m) {
    const text = missing
      ? reasonText(s.reason, m)
      : `${num(Math.abs(m.hours))} seasonal hours of the Gra day (sunrise to sunset; an hour is ${minutesText(s.hourMs)} today) ${m.hours < 0 ? 'before' : 'after'} that: ${at}.`;
    return { op: 'hours', time, text, values: { hours: m.hours, hourMinutes: s.hourMs == null ? null : s.hourMs / 60_000 } };
  }
  if ('hour' in m) {
    const day = DAYS[m.of]!;
    const text = missing
      ? reasonText(s.reason, m)
      : `${num(m.hour)} seasonal hours into the day from ${clock(s.start, tz)} to ${clock(s.end, tz)} (${day.opinion}; an hour is ${minutesText(s.hourMs)} today): ${at}${fb}.`;
    return { op: 'hour', time, text, values: { hour: m.hour, day: m.of, hourMinutes: s.hourMs == null ? null : s.hourMs / 60_000 } };
  }
  if ('later' in m) {
    return { op: 'later', time, text: missing ? reasonText(s.reason, m) : `The later of those: ${at}.`, values: {} };
  }
  return { op: 'none', time, text: reasonText(s.reason, m), values: { reason: s.reason ?? null } };
}

function explanation(steps: readonly TraceStep[], tz: TimeZone, opinion: string, source: string, finalReason: ZmanUnavailableReason | undefined, exact: number | null, kind: ZmanKind): Explanation {
  const out = steps.map((s) => stepOf(s, tz));
  if (finalReason === 'not-applicable-today') {
    out.push({ op: 'none', time: null, text: reasonText(finalReason, { none: 'requires-terrain-data' }), values: { reason: finalReason } });
  }
  const text = out.map((s) => s.text).join(' ');
  if (exact === null) return { text, steps: out, opinion, source };
  const shown = clock(roundToLocalMinute(exact, kind === 'earliest' ? 'up' : 'down', tz), tz).slice(0, 5);
  const why = kind === 'earliest' ? 'rounded up, because it is the earliest time' : 'rounded down, because it is a deadline';
  return { text: `${text} Shown as ${shown}: ${why}.`, steps: out, opinion, source };
}
