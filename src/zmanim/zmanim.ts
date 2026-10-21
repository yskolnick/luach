/**
 * Zmanim: halachic times of day, one named function per opinion.
 *
 * Every function returns a {@link Zman}: the time (or `null` with a reason), the opinion it follows, its source,
 * and how it was rounded. Nothing here is "the" correct time. Ask your rav. This library calculates; it does
 * not rule.
 *
 * Conventions (documented defaults; each can be changed through {@link ZmanOptions}):
 * - **Sea level.** Sunrise and sunset are computed at sea level unless `elevation: true`. Times based on the
 *   sun's depression angle (16.1°, 8.5°…) are always geometric and at sea level: the angle was chosen to match
 *   a darkness level, and luchos that use angles compute them this way.
 * - **Rounding.** An earliest time ("not before") rounds up to the next minute; a deadline ("not after") rounds
 *   down. Pass `rounding: 'none'` for exact times.
 * - **No made-up times.** If the sun doesn't reach the angle that day (polar summer, or 16.1° in London in June),
 *   the time is `null` and `reason` says why. A fallback is available but off by default.
 * - **Sources.** Citations were checked against the text where marked; others say "(unverified)".
 *
 * @packageDocumentation
 */

import { type DayNumber, type GregorianDate, gregorianToDayNumber } from '../calendar/gregorian.js';
import { type TimeZoneProvider, fromZoned } from '../time/zone.js';
import { SUNRISE_ZENITH, horizonDip, solarTransit, timeAtZenith } from './solar.js';

/** A place on earth. Longitude is east-positive; elevation in metres above sea level. */
export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation?: number;
  /** IANA time-zone id, e.g. `"America/New_York"`. Used only to find the civil day. */
  readonly timeZone: string;
  readonly name?: string;
}

/** A civil date: a day number or `{ year, month, day }`. */
export type DateInput = DayNumber | GregorianDate;

export interface ZmanOptions {
  /** `'default'` (earliest times up, deadlines down), `'none'`, `'up'`, or `'down'`. Default `'default'`. */
  readonly rounding?: 'default' | 'none' | 'up' | 'down';
  /** Use `location.elevation` for sunrise and sunset (and times based on them). Default false (sea level). */
  readonly elevation?: boolean;
  /**
   * Dip of the visible horizon in degrees, for callers with terrain data (e.g. from a "visible sunrise" table).
   * Overrides `elevation` for netz, shkiah and the Gra's day. Luach does not compute terrain (DECISIONS.md Q-08).
   */
  readonly horizonDip?: number;
  /**
   * When the sun doesn't reach an angle: `'none'` (default; time is null) or `'solar-midnight'` (use the moment
   * the sun is lowest, marked `fallback`). The fallback is not a halachic opinion.
   */
  readonly highLatitude?: 'none' | 'solar-midnight';
  readonly timeZoneProvider?: TimeZoneProvider;
}

/** Why a time is missing. */
export type ZmanReason = 'sun-always-above' | 'sun-always-below';

/** The JSON form of a {@link Zman}, for logging. */
export interface ZmanJSON {
  time: string | null;
  opinion: string;
  source: string;
  rounded: 'up' | 'down' | 'none';
  reason?: ZmanReason;
  fallback?: string;
}

/** A computed zman. */
export interface Zman {
  readonly time: Date | null;
  /** The opinion this time follows, e.g. `"Magen Avraham, from alos 72 minutes to tzeis 72 minutes"`. */
  readonly opinion: string;
  /** Where the opinion comes from. */
  readonly source: string;
  /** How `time` was rounded. */
  readonly rounded: 'up' | 'down' | 'none';
  /** Present when `time` is null. */
  readonly reason?: ZmanReason;
  /** Present when a high-latitude fallback produced the time. */
  readonly fallback?: string;
  toJSON(): ZmanJSON;
}

/** Internal: a computed instant or a reason. */
type Calc = { t: number; fallback?: string } | { t: null; reason: ZmanReason };

interface Ctx {
  readonly transit: number;
  readonly loc: GeoLocation;
  readonly opts: ZmanOptions;
  readonly cache: Map<string, Calc>;
}

const MINUTE = 60_000;

function toDayNumber(date: DateInput): DayNumber {
  return typeof date === 'number' ? date : gregorianToDayNumber(date.year, date.month, date.day);
}

function context(date: DateInput, loc: GeoLocation, opts: ZmanOptions): Ctx {
  if (!(Math.abs(loc.latitude) <= 90) || !(Math.abs(loc.longitude) <= 180)) {
    throw new RangeError(`Invalid coordinates ${loc.latitude}, ${loc.longitude}`);
  }
  const localNoon = fromZoned(toDayNumber(date), 12 * 3_600_000, loc.timeZone, opts.timeZoneProvider);
  return { transit: solarTransit(localNoon, loc.longitude), loc, opts, cache: new Map() };
}

function memo(ctx: Ctx, key: string, f: () => Calc): Calc {
  let v = ctx.cache.get(key);
  if (!v) {
    v = f();
    ctx.cache.set(key, v);
  }
  return v;
}

// ------------------------------------------------------------------ primitives

/** Sun at `zenith` in the morning or evening; with the optional solar-midnight fallback. */
function atZenith(ctx: Ctx, zenith: number, dir: 'morning' | 'evening'): Calc {
  return memo(ctx, `${zenith}:${dir}`, () => {
    const e = timeAtZenith(ctx.transit, ctx.loc.latitude, ctx.loc.longitude, zenith, dir);
    if (e.time !== null) return { t: e.time };
    if (e.reason === 'sun-always-above' && ctx.opts.highLatitude === 'solar-midnight') {
      const midnight = solarTransit(ctx.transit + (dir === 'morning' ? -12 : 12) * 3_600_000, ctx.loc.longitude + 180);
      return { t: midnight, fallback: 'solar-midnight' };
    }
    return { t: null, reason: e.reason };
  });
}

/** Dip below the astronomical horizon: explicit `elevation` true/false, or the options (horizonDip, elevation). */
function dipFor(ctx: Ctx, elevation: boolean | undefined): number {
  if (elevation === false) return 0;
  if (elevation === undefined && ctx.opts.horizonDip !== undefined) return ctx.opts.horizonDip;
  return (elevation ?? ctx.opts.elevation) ? horizonDip(ctx.loc.elevation ?? 0) : 0;
}
function sunriseCalc(ctx: Ctx, elevation?: boolean): Calc {
  return atZenith(ctx, SUNRISE_ZENITH + dipFor(ctx, elevation), 'morning');
}
function sunsetCalc(ctx: Ctx, elevation?: boolean): Calc {
  return atZenith(ctx, SUNRISE_ZENITH + dipFor(ctx, elevation), 'evening');
}
/** Sun `degrees` below the geometric horizon (sea level, no refraction). */
const dawn = (ctx: Ctx, degrees: number): Calc => atZenith(ctx, 90 + degrees, 'morning');
const dusk = (ctx: Ctx, degrees: number): Calc => atZenith(ctx, 90 + degrees, 'evening');

function plus(c: Calc, minutes: number): Calc {
  return c.t === null ? c : { ...c, t: c.t + minutes * MINUTE };
}

/** `hours` proportional hours (1/12 of the day) after `start`, the day running from `start` to `end`. */
function hoursInto(start: Calc, end: Calc, hours: number): Calc {
  if (start.t === null) return start;
  if (end.t === null) return end;
  const fb = start.fallback ?? end.fallback;
  return { t: start.t + ((end.t - start.t) * hours) / 12, ...(fb ? { fallback: fb } : {}) };
}

/** Length of one proportional hour (ms) for a day from `start` to `end`, or null. */
function hourLength(start: Calc, end: Calc): number | null {
  return start.t === null || end.t === null ? null : (end.t - start.t) / 12;
}

// ------------------------------------------------------------------ the Zman object

type Kind = 'earliest' | 'latest';

function round(t: number, kind: Kind, mode: ZmanOptions['rounding']): { t: number; rounded: 'up' | 'down' | 'none' } {
  const m = mode ?? 'default';
  if (m === 'none') return { t, rounded: 'none' };
  const up = m === 'up' || (m === 'default' && kind === 'earliest');
  return up ? { t: Math.ceil(t / MINUTE) * MINUTE, rounded: 'up' } : { t: Math.floor(t / MINUTE) * MINUTE, rounded: 'down' };
}

function makeZman(c: Calc, opinion: string, source: string, kind: Kind, opts: ZmanOptions): Zman {
  let time: Date | null = null;
  let rounded: 'up' | 'down' | 'none' = 'none';
  if (c.t !== null) {
    const r = round(c.t, kind, opts.rounding);
    time = new Date(r.t);
    rounded = r.rounded;
  }
  const reason = c.t === null ? c.reason : undefined;
  const fallback = c.t !== null ? c.fallback : undefined;
  return {
    time,
    opinion,
    source,
    rounded,
    ...(reason ? { reason } : {}),
    ...(fallback ? { fallback } : {}),
    toJSON(): ZmanJSON {
      return {
        time: time ? time.toISOString() : null,
        opinion,
        source,
        rounded,
        ...(reason ? { reason } : {}),
        ...(fallback ? { fallback } : {}),
      };
    },
  };
}

/** The same zman with a prefix on its opinion. */
function relabel(z: Zman, prefix: string): Zman {
  const opinion = prefix + z.opinion;
  return { ...z, opinion, toJSON: () => ({ ...z.toJSON(), opinion }) };
}

/** Signature of every zman function. */
export type ZmanFunction = (date: DateInput, location: GeoLocation, options?: ZmanOptions) => Zman;

function define(opinion: string, source: string, kind: Kind, f: (ctx: Ctx) => Calc): ZmanFunction {
  return (date, location, options = {}) => makeZman(f(context(date, location, options)), opinion, source, kind, options);
}

// ------------------------------------------------------------------ day definitions

const MIL = 18; // minutes (SA OC 459:2)
const SRC_MIL = 'SA OC 459:2 (a mil is 18 minutes)';

/** Days used for proportional hours. */
const gra = (c: Ctx): [Calc, Calc] => [sunriseCalc(c), sunsetCalc(c)];
const ma72 = (c: Ctx): [Calc, Calc] => [plus(sunriseCalc(c, false), -72), plus(sunsetCalc(c, false), 72)];
const ma90 = (c: Ctx): [Calc, Calc] => [plus(sunriseCalc(c, false), -90), plus(sunsetCalc(c, false), 90)];
const ma96 = (c: Ctx): [Calc, Calc] => [plus(sunriseCalc(c, false), -96), plus(sunsetCalc(c, false), 96)];
const ma120 = (c: Ctx): [Calc, Calc] => [plus(sunriseCalc(c, false), -120), plus(sunsetCalc(c, false), 120)];
const ma72z = (c: Ctx): [Calc, Calc] => {
  const [r, s] = [sunriseCalc(c, false), sunsetCalc(c, false)];
  const h = hourLength(r, s);
  return h === null ? [r, s] : [plus(r, (-1.2 * h) / MINUTE), plus(s, (1.2 * h) / MINUTE)];
};
const ma90z = (c: Ctx): [Calc, Calc] => {
  const [r, s] = [sunriseCalc(c, false), sunsetCalc(c, false)];
  const h = hourLength(r, s);
  return h === null ? [r, s] : [plus(r, (-1.5 * h) / MINUTE), plus(s, (1.5 * h) / MINUTE)];
};
const ma16 = (c: Ctx): [Calc, Calc] => [dawn(c, 16.1), dusk(c, 16.1)];
/** Baal HaTanya: "netz amiti" to "shkiah amitis", the sun's upper edge 1.583° below the horizon (unverified). */
const tanya = (c: Ctx): [Calc, Calc] => [dawn(c, 1.583), dusk(c, 1.583)];
/** Ateret Torah: alos 1/10 of the day before sunrise; tzeis 40 minutes after sunset (unverified). */
const ateret = (c: Ctx): [Calc, Calc] => {
  const [r, s] = [sunriseCalc(c, false), sunsetCalc(c, false)];
  const h = hourLength(r, s);
  return h === null ? [r, s] : [plus(r, (-1.2 * h) / MINUTE), plus(s, 40)];
};

const DAYS = {
  gra: { f: gra, label: 'Gra: the day from sunrise to sunset', source: 'Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours)' },
  ma72: { f: ma72, label: 'Magen Avraham: the day from alos to tzeis, 72 fixed minutes', source: `Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); ${SRC_MIL}` },
  ma90: { f: ma90, label: 'Magen Avraham: the day from alos to tzeis, 90 fixed minutes', source: 'Magen Avraham 58:1; 4 mil of 22½ minutes (unverified)' },
  ma96: { f: ma96, label: 'Magen Avraham: the day from alos to tzeis, 96 fixed minutes', source: 'Magen Avraham 58:1; 4 mil of 24 minutes (unverified)' },
  ma120: { f: ma120, label: 'Magen Avraham: the day from alos to tzeis, 120 fixed minutes', source: 'Magen Avraham 58:1; 5 mil of 24 minutes (unverified)' },
  ma72z: { f: ma72z, label: 'Magen Avraham: the day from alos to tzeis, 72 proportional minutes (1.2 hours zmaniyos)', source: 'Magen Avraham 58:1; Pesachim 94a' },
  ma90z: { f: ma90z, label: 'Magen Avraham: the day from alos to tzeis, 90 proportional minutes', source: 'Magen Avraham 58:1 (unverified for 90)' },
  ma16: { f: ma16, label: 'Magen Avraham: the day from alos to tzeis at 16.1° (72 minutes in Jerusalem at the equinox)', source: 'Magen Avraham 58:1; 16.1° as the equinox equivalent of 72 minutes in Jerusalem' },
  tanya: { f: tanya, label: 'Baal HaTanya: the day from netz amiti to shkiah amitis (1.583°)', source: 'Shulchan Aruch HaRav, Seder Hachnasas Shabbos (unverified)' },
  ateret: { f: ateret, label: 'Ateret Torah: the day from alos (1/10 of the day) to tzeis 40 minutes', source: 'Chacham Yosef Harari-Raful, Yeshivat Ateret Torah (unverified)' },
} as const;

export type DayOpinion = keyof typeof DAYS;

function inDay(opinion: DayOpinion, hours: number) {
  const d = DAYS[opinion];
  return (c: Ctx): Calc => {
    const [s, e] = d.f(c);
    return hoursInto(s, e, hours);
  };
}

// ------------------------------------------------------------------ sunrise, sunset

/** Sunrise at sea level (upper limb, standard refraction). */
export const sunriseSeaLevel = /* @__PURE__ */ define('Sunrise at sea level', 'NOAA Solar Calculator; zenith 90°50′', 'earliest', (c) => sunriseCalc(c, false));
/** Sunrise seen from the location's elevation (adds the dip of the horizon). */
export const sunriseElevation = /* @__PURE__ */ define('Sunrise from elevation', 'NOAA Solar Calculator; zenith 90°50′ plus dip of the horizon', 'earliest', (c) => sunriseCalc(c, true));
/** Sunset at sea level. */
export const sunsetSeaLevel = /* @__PURE__ */ define('Sunset at sea level', 'NOAA Solar Calculator; zenith 90°50′', 'latest', (c) => sunsetCalc(c, false));
/** Sunset seen from the location's elevation. */
export const sunsetElevation = /* @__PURE__ */ define('Sunset from elevation', 'NOAA Solar Calculator; zenith 90°50′ plus dip of the horizon', 'latest', (c) => sunsetCalc(c, true));
/** Netz (sunrise): sea level unless `elevation: true`. Shacharis ideally begins at netz (SA OC 89:1). */
export const netz = /* @__PURE__ */ define('Netz HaChama', 'SA OC 58:1, 89:1', 'earliest', (c) => sunriseCalc(c));
/** Shkiah (sunset): sea level unless `elevation: true`. */
export const shkiah = /* @__PURE__ */ define('Shkiah', 'SA OC 261:2; Mishna Berura 261:23', 'latest', (c) => sunsetCalc(c));

// ------------------------------------------------------------------ alos

/** Alos 72 fixed minutes before sunrise (4 mil of 18 minutes). */
export const alos72 = /* @__PURE__ */ define('Alos 72 minutes before sunrise', `Pesachim 94a (4 mil); ${SRC_MIL}`, 'earliest', (c) => plus(sunriseCalc(c, false), -72));
/** Alos 90 fixed minutes before sunrise (4 mil of 22½ minutes). */
export const alos90 = /* @__PURE__ */ define('Alos 90 minutes before sunrise', '4 mil of 22½ minutes (unverified)', 'earliest', (c) => plus(sunriseCalc(c, false), -90));
/** Alos 96 fixed minutes before sunrise (4 mil of 24 minutes). */
export const alos96 = /* @__PURE__ */ define('Alos 96 minutes before sunrise', '4 mil of 24 minutes (unverified)', 'earliest', (c) => plus(sunriseCalc(c, false), -96));
/** Alos 120 fixed minutes before sunrise (5 mil of 24 minutes). */
export const alos120 = /* @__PURE__ */ define('Alos 120 minutes before sunrise', '5 mil of 24 minutes (unverified)', 'earliest', (c) => plus(sunriseCalc(c, false), -120));
/** Alos 72 proportional minutes (1.2 shaos zmaniyos of the Gra's day) before sunrise. */
export const alos72Zmaniyos = /* @__PURE__ */ define('Alos 72 proportional minutes before sunrise', 'Pesachim 94a; proportional minutes (unverified)', 'earliest', (c) => ma72z(c)[0]);
/** Alos with the sun 16.1° below the horizon (72 minutes in Jerusalem at the equinox). */
export const alos16_1 = /* @__PURE__ */ define('Alos at 16.1°', 'Equinox equivalent of 72 minutes in Jerusalem', 'earliest', (c) => dawn(c, 16.1));
/** Alos with the sun 18° below the horizon (astronomical twilight). */
export const alos18 = /* @__PURE__ */ define('Alos at 18°', 'Astronomical twilight (unverified as a halachic source)', 'earliest', (c) => dawn(c, 18));
/** Alos with the sun 19.8° below the horizon (90 minutes in Jerusalem at the equinox). */
export const alos19_8 = /* @__PURE__ */ define('Alos at 19.8°', 'Equinox equivalent of 90 minutes in Jerusalem', 'earliest', (c) => dawn(c, 19.8));
/** Alos with the sun 26° below the horizon (120 minutes in Jerusalem at the equinox). */
export const alos26 = /* @__PURE__ */ define('Alos at 26°', 'Equinox equivalent of 120 minutes in Jerusalem', 'earliest', (c) => dawn(c, 26));

/** Alos at any depression angle, for opinions Luach doesn't name. */
export function alosAtDegrees(degrees: number): ZmanFunction {
  return define(`Alos at ${degrees}°`, 'Caller-supplied angle', 'earliest', (c) => dawn(c, degrees));
}

// ------------------------------------------------------------------ misheyakir

/** Misheyakir with the sun 11.5° below the horizon. */
export const misheyakir11_5 = /* @__PURE__ */ define('Misheyakir at 11.5°', 'SA OC 58:1 ("recognise a friend"); angle (unverified)', 'earliest', (c) => dawn(c, 11.5));
/** Misheyakir with the sun 11° below the horizon. */
export const misheyakir11 = /* @__PURE__ */ define('Misheyakir at 11°', 'SA OC 58:1; angle (unverified)', 'earliest', (c) => dawn(c, 11));
/** Misheyakir with the sun 10.2° below the horizon. */
export const misheyakir10_2 = /* @__PURE__ */ define('Misheyakir at 10.2°', 'SA OC 58:1; angle (unverified)', 'earliest', (c) => dawn(c, 10.2));
/** Misheyakir at any angle (e.g. 7.65°, 9.5° or 12.85°; see DECISIONS.md Q-09). */
export function misheyakirAtDegrees(degrees: number): ZmanFunction {
  return define(`Misheyakir at ${degrees}°`, 'Caller-supplied angle', 'earliest', (c) => dawn(c, degrees));
}

// ------------------------------------------------------------------ shema and tefilla

const shemaSource = 'SA OC 58:1 (end of 3 hours, a quarter of the day)';
const tefillaSource = 'SA OC 89:1 (end of 4 hours, a third of the day)';

/** Latest Shema: 3 proportional hours into the day of the given opinion. */
export function sofZmanShema(opinion: DayOpinion): ZmanFunction {
  return define(`Sof zman Shema, ${DAYS[opinion].label}`, `${shemaSource}; ${DAYS[opinion].source}`, 'latest', inDay(opinion, 3));
}
/** Latest Shacharis: 4 proportional hours into the day of the given opinion. */
export function sofZmanTefilla(opinion: DayOpinion): ZmanFunction {
  return define(`Sof zman Tefilla, ${DAYS[opinion].label}`, `${tefillaSource}; ${DAYS[opinion].source}`, 'latest', inDay(opinion, 4));
}

export const sofZmanShemaGra = /* @__PURE__ */ sofZmanShema('gra');
export const sofZmanShemaMA72 = /* @__PURE__ */ sofZmanShema('ma72');
export const sofZmanShemaMA90 = /* @__PURE__ */ sofZmanShema('ma90');
export const sofZmanShemaMA72Zmaniyos = /* @__PURE__ */ sofZmanShema('ma72z');
export const sofZmanShemaMA90Zmaniyos = /* @__PURE__ */ sofZmanShema('ma90z');
export const sofZmanShemaMA16_1 = /* @__PURE__ */ sofZmanShema('ma16');
export const sofZmanShemaBaalHaTanya = /* @__PURE__ */ sofZmanShema('tanya');
export const sofZmanShemaAteretTorah = /* @__PURE__ */ sofZmanShema('ateret');
export const sofZmanTefillaGra = /* @__PURE__ */ sofZmanTefilla('gra');
export const sofZmanTefillaMA72 = /* @__PURE__ */ sofZmanTefilla('ma72');
export const sofZmanTefillaMA90 = /* @__PURE__ */ sofZmanTefilla('ma90');
export const sofZmanTefillaMA72Zmaniyos = /* @__PURE__ */ sofZmanTefilla('ma72z');
export const sofZmanTefillaMA90Zmaniyos = /* @__PURE__ */ sofZmanTefilla('ma90z');
export const sofZmanTefillaMA16_1 = /* @__PURE__ */ sofZmanTefilla('ma16');
export const sofZmanTefillaBaalHaTanya = /* @__PURE__ */ sofZmanTefilla('tanya');
export const sofZmanTefillaAteretTorah = /* @__PURE__ */ sofZmanTefilla('ateret');

// ------------------------------------------------------------------ chatzos

/** Chatzos: solar transit (the sun at its highest). */
export const chatzos = /* @__PURE__ */ define('Chatzos: solar transit', 'Astronomical noon', 'latest', (c) => ({ t: c.transit }));
/** Chatzos as the midpoint of sunrise and sunset (6 proportional hours of the Gra's day). */
export const chatzosHalfDay = /* @__PURE__ */ define('Chatzos: midpoint of sunrise and sunset', 'SA OC 233:1 with proportional hours', 'latest', inDay('gra', 6));
/** Chatzos HaLaila: the solar transit 12 hours from midday (the sun at its lowest). */
export const chatzosHalaila = /* @__PURE__ */ define('Chatzos HaLaila: the sun at its lowest', 'Astronomical midnight', 'latest', (c) => ({
  t: solarTransit(c.transit + 12 * 3_600_000, c.loc.longitude + 180),
}));

// ------------------------------------------------------------------ mincha and plag

/** Mincha Gedola: 6½ proportional hours into the day of the given opinion. */
export function minchaGedola(opinion: DayOpinion): ZmanFunction {
  return define(`Mincha Gedola, ${DAYS[opinion].label}`, `SA OC 233:1 (6½ hours); ${DAYS[opinion].source}`, 'earliest', inDay(opinion, 6.5));
}
/** Mincha Ketana: 9½ proportional hours into the day of the given opinion. */
export function minchaKetana(opinion: DayOpinion): ZmanFunction {
  return define(`Mincha Ketana, ${DAYS[opinion].label}`, `SA OC 233:1 (9½ hours); ${DAYS[opinion].source}`, 'earliest', inDay(opinion, 9.5));
}
/** Plag HaMincha: 10¾ proportional hours into the day of the given opinion. */
export function plagHamincha(opinion: DayOpinion): ZmanFunction {
  return define(`Plag HaMincha, ${DAYS[opinion].label}`, `SA OC 233:1 (11 hours less a quarter); ${DAYS[opinion].source}`, 'earliest', inDay(opinion, 10.75));
}

export const minchaGedolaGra = /* @__PURE__ */ minchaGedola('gra');
export const minchaGedolaMA72 = /* @__PURE__ */ minchaGedola('ma72');
/** Mincha Gedola 30 fixed minutes after chatzos (solar transit). */
export const minchaGedola30 = /* @__PURE__ */ define('Mincha Gedola 30 minutes after chatzos', 'SA OC 233:1; fixed half hour (unverified)', 'earliest', (c) => ({ t: c.transit + 30 * MINUTE }));
/** Mincha Gedola: the later of 30 minutes after chatzos and half a proportional hour of the Gra's day. */
export const minchaGedolaGreaterOf = /* @__PURE__ */ define(
  'Mincha Gedola: the later of 30 minutes and half a proportional hour after chatzos',
  'SA OC 233:1; Mishna Berura 233:1 (unverified)',
  'earliest',
  (c) => {
    const a = inDay('gra', 6.5)(c);
    if (a.t === null) return a;
    return { t: Math.max(a.t, c.transit + 30 * MINUTE) };
  },
);
export const minchaKetanaGra = /* @__PURE__ */ minchaKetana('gra');
export const minchaKetanaMA72 = /* @__PURE__ */ minchaKetana('ma72');
export const plagHaminchaGra = /* @__PURE__ */ plagHamincha('gra');
export const plagHaminchaMA72 = /* @__PURE__ */ plagHamincha('ma72');

// ------------------------------------------------------------------ bein hashmashos and tzeis

/** Bein HaShmashos of Rabbeinu Tam begins 3¼ mil (58½ minutes) after sunset. */
export const beinHashmashosRabbeinuTam = /* @__PURE__ */ define("Bein HaShmashos of Rabbeinu Tam: 3¼ mil after sunset", 'SA OC 261:2', 'earliest', (c) => plus(sunsetCalc(c, false), 3.25 * MIL));
/** Bein HaShmashos of the Geonim ends ¾ mil (13½ minutes) after sunset. */
export const beinHashmashosGeonim = /* @__PURE__ */ define("Bein HaShmashos of the Geonim: ¾ mil after sunset", 'Mishna Berura 261:23', 'earliest', (c) => plus(sunsetCalc(c, false), 0.75 * MIL));
/** Bein HaShmashos of the Yereim begins ¾ mil (13½ minutes) before sunset. */
export const beinHashmashosYereim = /* @__PURE__ */ define("Bein HaShmashos of the Yereim: ¾ mil before sunset", 'Sefer Yereim 274 (unverified)', 'latest', (c) => plus(sunsetCalc(c, false), -0.75 * MIL));

/** Tzeis with the sun 8.5° below the horizon. */
export const tzeis8_5 = /* @__PURE__ */ define('Tzeis at 8.5°', 'Three small stars (unverified)', 'earliest', (c) => dusk(c, 8.5));
/** Tzeis with the sun 7.083° below the horizon (three medium stars). */
export const tzeis7_083 = /* @__PURE__ */ define('Tzeis at 7.083°', 'Three medium stars; Rav Y. M. Tukachinsky (unverified)', 'earliest', (c) => dusk(c, 7 + 5 / 60));
/** Tzeis 42 fixed minutes after sunset. */
export const tzeis42 = /* @__PURE__ */ define('Tzeis 42 minutes after sunset', '(unverified)', 'earliest', (c) => plus(sunsetCalc(c, false), 42));
/** Tzeis 50 fixed minutes after sunset. */
export const tzeis50 = /* @__PURE__ */ define('Tzeis 50 minutes after sunset', '(unverified)', 'earliest', (c) => plus(sunsetCalc(c, false), 50));
/** Tzeis 60 fixed minutes after sunset. */
export const tzeis60 = /* @__PURE__ */ define('Tzeis 60 minutes after sunset', '(unverified)', 'earliest', (c) => plus(sunsetCalc(c, false), 60));
/** Tzeis 72 fixed minutes after sunset: Rabbeinu Tam (4 mil). */
export const tzeis72 = /* @__PURE__ */ define('Tzeis 72 minutes after sunset (Rabbeinu Tam)', `SA OC 261:2 (3¼ + ¾ mil); ${SRC_MIL}`, 'earliest', (c) => plus(sunsetCalc(c, false), 72));
/** Tzeis of Rabbeinu Tam, 72 proportional minutes after sunset. */
export const tzeis72Zmaniyos = /* @__PURE__ */ define('Tzeis 72 proportional minutes after sunset (Rabbeinu Tam)', 'SA OC 261:2; proportional minutes (unverified)', 'earliest', (c) => ma72z(c)[1]);
/** Tzeis at 16.1° (Rabbeinu Tam as the equinox equivalent of 72 minutes). */
export const tzeis16_1 = /* @__PURE__ */ define('Tzeis at 16.1°', 'Equinox equivalent of 72 minutes in Jerusalem', 'earliest', (c) => dusk(c, 16.1));
/** Tzeis at any angle. */
export function tzeisAtDegrees(degrees: number): ZmanFunction {
  return define(`Tzeis at ${degrees}°`, 'Caller-supplied angle', 'earliest', (c) => dusk(c, degrees));
}
/** Tzeis any number of fixed minutes after sunset. */
export function tzeisAfterMinutes(minutes: number): ZmanFunction {
  return define(`Tzeis ${minutes} minutes after sunset`, 'Caller-supplied minutes', 'earliest', (c) => plus(sunsetCalc(c, false), minutes));
}

// ------------------------------------------------------------------ shaah zmanis

/** Length of one proportional hour (minutes) for a day opinion, or null. */
export function shaahZmanis(date: DateInput, location: GeoLocation, opinion: DayOpinion, options: ZmanOptions = {}): number | null {
  const [s, e] = DAYS[opinion].f(context(date, location, options));
  const h = hourLength(s, e);
  return h === null ? null : h / MINUTE;
}

/** Description and source of a day opinion. */
export function dayOpinion(opinion: DayOpinion): { label: string; source: string } {
  return { label: DAYS[opinion].label, source: DAYS[opinion].source };
}

// ------------------------------------------------------------------ Shabbos and Yom Tov

/**
 * Candle lighting: `minutes` before sunset (sea level). The number is a local custom, not a rule: 18 is the
 * common default; Jerusalem 40; Haifa 30 (see docs). Rounded down (it is a deadline).
 */
export function candleLighting(date: DateInput, location: GeoLocation, minutes = 18, options: ZmanOptions = {}): Zman {
  return define(`Candle lighting ${minutes} minutes before sunset`, 'Local custom; SA OC 261:2 (tosefes Shabbos); Mishna Berura 261:23', 'latest', (c) =>
    plus(sunsetCalc(c, false), -minutes),
  )(date, location, options);
}

/**
 * Havdala / end of Shabbos or Yom Tov, and candle lighting on the second night of Yom Tov:
 * by depression angle (`{ degrees }`) or fixed minutes after sunset (`{ minutes }`). Default 8.5°.
 */
export function havdala(date: DateInput, location: GeoLocation, by: { degrees: number } | { minutes: number } = { degrees: 8.5 }, options: ZmanOptions = {}): Zman {
  const f = 'degrees' in by ? tzeisAtDegrees(by.degrees) : tzeisAfterMinutes(by.minutes);
  return relabel(f(date, location, options), 'End of Shabbos/Yom Tov: ');
}

/** Latest time to eat chametz on Erev Pesach: 4 proportional hours (SA OC 443:1 with the Rema). */
export function sofZmanAchilasChametz(opinion: DayOpinion): ZmanFunction {
  return define(`Latest time to eat chametz, ${DAYS[opinion].label}`, `SA OC 443:1 (end of 4 hours; Rema: proportional); ${DAYS[opinion].source}`, 'latest', inDay(opinion, 4));
}
/** Latest time to burn (and benefit from) chametz on Erev Pesach: 5 proportional hours (SA OC 443:1). */
export function sofZmanBiurChametz(opinion: DayOpinion): ZmanFunction {
  return define(`Latest time to burn chametz, ${DAYS[opinion].label}`, `SA OC 443:1 (end of 5 hours); ${DAYS[opinion].source}`, 'latest', inDay(opinion, 5));
}
export const sofZmanAchilasChametzGra = /* @__PURE__ */ sofZmanAchilasChametz('gra');
export const sofZmanAchilasChametzMA72 = /* @__PURE__ */ sofZmanAchilasChametz('ma72');
export const sofZmanBiurChametzGra = /* @__PURE__ */ sofZmanBiurChametz('gra');
export const sofZmanBiurChametzMA72 = /* @__PURE__ */ sofZmanBiurChametz('ma72');

// ------------------------------------------------------------------ fasts

/**
 * Start of a minor fast: alos by the chosen function (default {@link alos72}). It is the deadline for eating,
 * so it rounds down. Major fasts (Yom Kippur, Tisha B'Av) begin at sunset the evening before.
 */
export function fastStarts(date: DateInput, location: GeoLocation, alos: ZmanFunction = alos72, options: ZmanOptions = {}): Zman {
  return relabel(alos(date, location, { ...options, rounding: options.rounding ?? 'down' }), 'Fast begins: ');
}

/** End of a fast: tzeis by the chosen function (default {@link tzeis8_5}). */
export function fastEnds(date: DateInput, location: GeoLocation, tzeis: ZmanFunction = tzeis8_5, options: ZmanOptions = {}): Zman {
  return relabel(tzeis(date, location, options), 'Fast ends: ');
}
