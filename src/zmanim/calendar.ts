/**
 * Zmanim for one civil day at one place.
 *
 * ```ts
 * const z = new ZmanimCalendar(
 *   { latitude: 40.0821, longitude: -74.2097, elevation: 20, timeZone: 'America/New_York' },
 *   { year: 2027, month: 3, day: 14 },
 * );
 * z.sofZmanShemaGra().localTime(); // "09:51"
 * ```
 *
 * Every method returns a {@link Zman}: the time (or `null` with a reason), the opinion,
 * the source, and the rounding applied. Defaults (sea-level sunrise, rounding on,
 * 18-minute candle lighting) are conveniences, not rulings. Ask your rav.
 *
 * The day is the civil date in the location's IANA time zone. The sun is followed from
 * that day's local noon, so places near the date line (Chatham, Auckland, Sydney) get
 * their own day's times.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date';
import { Month } from '../calendar/months';
import { civilToDays, daysToCivil, MS_PER_DAY, type CivilDate } from '../time/civil';
import { assertTimeZone, zonedToInstant, type TimeZone } from '../time/zone';
import { horizonDip, solarTransit, SUNRISE_ZENITH, timeAtZenith, type NoEventReason } from './solar';
import { usnoTimeAtZenith } from './usno';
import { ZMANIM } from './opinions';
import { roundToMinute, Zman, type ZmanUnavailableReason } from './zman';

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

/** Options for {@link ZmanimCalendar}. */
export interface ZmanimOptions {
  /** Round to the minute (earliest times up, deadlines down). Default `true`. */
  rounding?: boolean;
  /**
   * Use elevation-adjusted sunrise and sunset for `sunrise()`, `sunset()` and the Gra day.
   * Default `false` (sea level), as most luchos do; zmanim defined by degrees are always
   * computed at sea level. See the docs, "Elevation".
   */
  useElevation?: boolean;
  /** Minutes before sunset for `candleLighting()`. Default 18. */
  candleLightingMinutes?: number;
  /** Minutes after sunset for Ateret Torah's tzeis. Default 40. */
  ateretTorahMinutes?: number;
  /**
   * What to do when the sun does not reach an angle (high latitudes):
   * - `'none'` (default): return `null` with the reason;
   * - `'nearestDay'`: use the same offset from solar noon as on the nearest day when the
   *   angle is reached;
   * - `'halfNight'`: use solar midnight (the sun's lowest point).
   * Fallback times are marked in `Zman.fallback`.
   */
  highLatitudeFallback?: 'none' | 'nearestDay' | 'halfNight';
  /** Solar algorithm. Default `'noaa'`; `'usno'` is offered for cross-checking. */
  algorithm?: 'noaa' | 'usno';
}

type Raw = { time: number } | { reason: ZmanUnavailableReason; fallback?: never };

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

/** Zmanim for one day at one place. */
export class ZmanimCalendar {
  readonly location: GeoLocation;
  readonly date: CivilDate;
  readonly options: Required<ZmanimOptions>;
  private readonly transitMs: number;
  private readonly cache = new Map<string, Raw>();

  constructor(location: GeoLocation, date: CivilDate | HebrewDate, options: ZmanimOptions = {}) {
    if (!(Math.abs(location.latitude) <= 90) || !(Math.abs(location.longitude) <= 180)) {
      throw new RangeError(`Invalid coordinates ${location.latitude}, ${location.longitude}`);
    }
    assertTimeZone(location.timeZone);
    this.location = location;
    this.date = date instanceof HebrewDate ? date.toCivil() : date;
    this.options = {
      rounding: options.rounding ?? true,
      useElevation: options.useElevation ?? false,
      candleLightingMinutes: options.candleLightingMinutes ?? 18,
      ateretTorahMinutes: options.ateretTorahMinutes ?? 40,
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
    if ('reason' in r) {
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

  private make(id: string, raw: Raw & { fallback?: string }): Zman {
    const def = ZMANIM[id];
    if (!def) throw new Error(`Unknown zman id ${id}`);
    const tz = this.location.timeZone;
    if ('reason' in raw) {
      return new Zman({ id, time: null, opinion: def.opinion, source: def.source, rounded: null, timeZone: tz, reason: raw.reason });
    }
    const rounding = this.options.rounding;
    const ms = rounding ? roundToMinute(raw.time, def.round) : raw.time;
    return new Zman({
      id,
      time: new Date(ms),
      opinion: def.opinion,
      source: def.source,
      rounded: rounding ? def.round : null,
      timeZone: tz,
      ...(raw.fallback ? { fallback: raw.fallback } : {}),
    });
  }

  private offset(base: Raw, minutes: number): Raw {
    return 'time' in base ? { time: base.time + minutes * 60_000 } : { reason: 'depends-on-missing-zman' };
  }

  private within(start: Raw & { fallback?: string }, end: Raw & { fallback?: string }, hours: number): Raw & { fallback?: string } {
    if (!('time' in start) || !('time' in end)) return { reason: 'depends-on-missing-zman' };
    const fallback = start.fallback ?? end.fallback;
    return { time: start.time + ((end.time - start.time) / 12) * hours, ...(fallback ? { fallback } : {}) };
  }

  private shaah(id: string, start: Raw, end: Raw, opinion: string, source: string): ShaahZmanis {
    const ms = 'time' in start && 'time' in end ? (end.time - start.time) / 12 : null;
    return { id, ms, minutes: ms === null ? null : ms / 60_000, opinion, source };
  }

  // Day boundaries for each opinion.
  private rise(): Raw { return this.riseSet(true, this.options.useElevation); }
  private set(): Raw { return this.riseSet(false, this.options.useElevation); }
  private graHour(): number | null {
    const a = this.rise();
    const b = this.set();
    return 'time' in a && 'time' in b ? (b.time - a.time) / 12 : null;
  }
  private zmaniyos(base: Raw, hours: number, sign: -1 | 1): Raw {
    const h = this.graHour();
    if (h === null || !('time' in base)) return { reason: 'depends-on-missing-zman' };
    return { time: base.time + sign * hours * h };
  }
  private mga72Start(): Raw { return this.offset(this.rise(), -72); }
  private mga72End(): Raw { return this.offset(this.set(), 72); }
  private bhtRise(): Raw & { fallback?: string } { return this.angle(1.583, true); }
  private bhtSet(): Raw & { fallback?: string } { return this.angle(1.583, false); }
  private atStart(): Raw { return this.zmaniyos(this.rise(), 1.2, -1); }
  private atEnd(): Raw { return this.offset(this.set(), this.options.ateretTorahMinutes); }

  // ---------------------------------------------------------------- the sun

  /** Sunrise: sea level by default, elevation-adjusted with `useElevation`. */
  sunrise(): Zman { return this.make('sunrise', this.rise()); }
  /** Sunrise at sea level. */
  sunriseSeaLevel(): Zman { return this.make('sunrise-sea-level', this.riseSet(true, false)); }
  /** Sunrise adjusted for elevation (the observer sees a lower horizon, so it is earlier). */
  sunriseElevation(): Zman { return this.make('sunrise-elevation', this.riseSet(true, true)); }
  /** Visible sunrise over terrain: not computed (needs terrain data); always `null`. */
  sunriseVisible(): Zman { return this.make('sunrise-visible', { reason: 'requires-terrain-data' }); }
  /** Sunset: sea level by default, elevation-adjusted with `useElevation`. */
  sunset(): Zman { return this.make('sunset', this.set()); }
  /** Sunset at sea level. */
  sunsetSeaLevel(): Zman { return this.make('sunset-sea-level', this.riseSet(false, false)); }
  /** Sunset adjusted for elevation (later). */
  sunsetElevation(): Zman { return this.make('sunset-elevation', this.riseSet(false, true)); }
  /** Chatzos: the sun on the meridian. */
  chatzos(): Zman { return this.make('chatzos', { time: this.transitMs }); }
  /** Chatzos HaLayla of the night after this day: halfway between this transit and the next. */
  chatzosHalayla(): Zman { return this.make('chatzos-halayla', { time: this.solarMidnight(false) }); }

  // ---------------------------------------------------------------- alos

  /** Alos 72 fixed minutes before sunrise. */
  alos72(): Zman { return this.make('alos-72', this.offset(this.rise(), -72)); }
  /** Alos 90 fixed minutes before sunrise. */
  alos90(): Zman { return this.make('alos-90', this.offset(this.rise(), -90)); }
  /** Alos 96 fixed minutes before sunrise. */
  alos96(): Zman { return this.make('alos-96', this.offset(this.rise(), -96)); }
  /** Alos 120 fixed minutes before sunrise. */
  alos120(): Zman { return this.make('alos-120', this.offset(this.rise(), -120)); }
  /** Alos 72 proportional minutes (1.2 seasonal hours) before sunrise. */
  alos72Zmaniyos(): Zman { return this.make('alos-72-zmaniyos', this.zmaniyos(this.rise(), 1.2, -1)); }
  /** Alos 90 proportional minutes before sunrise. */
  alos90Zmaniyos(): Zman { return this.make('alos-90-zmaniyos', this.zmaniyos(this.rise(), 1.5, -1)); }
  /** Alos 96 proportional minutes before sunrise. */
  alos96Zmaniyos(): Zman { return this.make('alos-96-zmaniyos', this.zmaniyos(this.rise(), 1.6, -1)); }
  /** Alos 120 proportional minutes before sunrise. */
  alos120Zmaniyos(): Zman { return this.make('alos-120-zmaniyos', this.zmaniyos(this.rise(), 2, -1)); }
  /** Alos at 16.1°. */
  alos16Point1(): Zman { return this.make('alos-16.1', this.angle(16.1, true)); }
  /** Alos at 18°. */
  alos18(): Zman { return this.make('alos-18', this.angle(18, true)); }
  /** Alos at 19.8°. */
  alos19Point8(): Zman { return this.make('alos-19.8', this.angle(19.8, true)); }
  /** Alos at 26°. */
  alos26(): Zman { return this.make('alos-26', this.angle(26, true)); }
  /** Alos of the Baal HaTanya, 16.9°. */
  alosBaalHaTanya(): Zman { return this.make('alos-baal-hatanya', this.angle(16.9, true)); }

  // ---------------------------------------------------------------- misheyakir

  /** Misheyakir at 10.2°. */
  misheyakir10Point2(): Zman { return this.make('misheyakir-10.2', this.angle(10.2, true)); }
  /** Misheyakir at 11°. */
  misheyakir11(): Zman { return this.make('misheyakir-11', this.angle(11, true)); }
  /** Misheyakir at 11.5°. */
  misheyakir11Point5(): Zman { return this.make('misheyakir-11.5', this.angle(11.5, true)); }
  /** Misheyakir at 12.85°. */
  misheyakir12Point85(): Zman { return this.make('misheyakir-12.85', this.angle(12.85, true)); }

  // ---------------------------------------------------------------- shaos zmaniyos

  /** Seasonal hour of the Gra (sunrise to sunset). */
  shaahZmanisGra(): ShaahZmanis { return this.shaah('shaah-zmanis-gra', this.rise(), this.set(), 'Gra: a twelfth of sunrise to sunset', 'Shulchan Aruch OC 58:1'); }
  /** Seasonal hour of the Magen Avraham, 72 fixed minutes. */
  shaahZmanisMga72(): ShaahZmanis { return this.shaah('shaah-zmanis-mga-72', this.mga72Start(), this.mga72End(), 'Magen Avraham: a twelfth of alos 72 to tzeis 72', 'Magen Avraham OC 58:1'); }
  /** Seasonal hour of the Magen Avraham, 90 fixed minutes. */
  shaahZmanisMga90(): ShaahZmanis { return this.shaah('shaah-zmanis-mga-90', this.offset(this.rise(), -90), this.offset(this.set(), 90), 'Magen Avraham: a twelfth of alos 90 to tzeis 90', 'Magen Avraham OC 58:1'); }
  /** Seasonal hour of the Magen Avraham, 72 proportional minutes. */
  shaahZmanisMga72Zmaniyos(): ShaahZmanis { return this.shaah('shaah-zmanis-mga-72-zmaniyos', this.zmaniyos(this.rise(), 1.2, -1), this.zmaniyos(this.set(), 1.2, 1), 'Magen Avraham: alos to tzeis at 72 proportional minutes', 'Magen Avraham OC 58:1'); }
  /** Seasonal hour of the Magen Avraham, 90 proportional minutes. */
  shaahZmanisMga90Zmaniyos(): ShaahZmanis { return this.shaah('shaah-zmanis-mga-90-zmaniyos', this.zmaniyos(this.rise(), 1.5, -1), this.zmaniyos(this.set(), 1.5, 1), 'Magen Avraham: alos to tzeis at 90 proportional minutes', 'Magen Avraham OC 58:1'); }
  /** Seasonal hour of the Magen Avraham, 16.1°. */
  shaahZmanisMga16Point1(): ShaahZmanis { return this.shaah('shaah-zmanis-mga-16.1', this.angle(16.1, true), this.angle(16.1, false), 'Magen Avraham: alos to tzeis at 16.1°', 'Magen Avraham OC 58:1'); }
  /** Seasonal hour of the Baal HaTanya (netz amiti to shkia amitis, 1.583°). */
  shaahZmanisBaalHaTanya(): ShaahZmanis { return this.shaah('shaah-zmanis-baal-hatanya', this.bhtRise(), this.bhtSet(), 'Baal HaTanya: netz amiti to shkia amitis', 'Shulchan Aruch HaRav OC 58:3'); }
  /** Seasonal hour of Ateret Torah. */
  shaahZmanisAteretTorah(): ShaahZmanis { return this.shaah('shaah-zmanis-ateret-torah', this.atStart(), this.atEnd(), 'Ateret Torah: alos 72 proportional minutes to tzeis 40 minutes', 'Ateret Torah luach'); }

  // ---------------------------------------------------------------- shema and tefilla

  /** Latest Shema, Gra. */
  sofZmanShemaGra(): Zman { return this.make('sof-zman-shema-gra', this.within(this.rise(), this.set(), 3)); }
  /** Latest Shema, Magen Avraham (72 fixed minutes). */
  sofZmanShemaMga72(): Zman { return this.make('sof-zman-shema-mga-72', this.within(this.mga72Start(), this.mga72End(), 3)); }
  /** Latest Shema, Magen Avraham (90 fixed minutes). */
  sofZmanShemaMga90(): Zman { return this.make('sof-zman-shema-mga-90', this.within(this.offset(this.rise(), -90), this.offset(this.set(), 90), 3)); }
  /** Latest Shema, Magen Avraham (72 proportional minutes). */
  sofZmanShemaMga72Zmaniyos(): Zman { return this.make('sof-zman-shema-mga-72-zmaniyos', this.within(this.zmaniyos(this.rise(), 1.2, -1), this.zmaniyos(this.set(), 1.2, 1), 3)); }
  /** Latest Shema, Magen Avraham (90 proportional minutes). */
  sofZmanShemaMga90Zmaniyos(): Zman { return this.make('sof-zman-shema-mga-90-zmaniyos', this.within(this.zmaniyos(this.rise(), 1.5, -1), this.zmaniyos(this.set(), 1.5, 1), 3)); }
  /** Latest Shema, Magen Avraham (16.1°). */
  sofZmanShemaMga16Point1(): Zman { return this.make('sof-zman-shema-mga-16.1', this.within(this.angle(16.1, true), this.angle(16.1, false), 3)); }
  /** Latest Shema, Baal HaTanya. */
  sofZmanShemaBaalHaTanya(): Zman { return this.make('sof-zman-shema-baal-hatanya', this.within(this.bhtRise(), this.bhtSet(), 3)); }
  /** Latest Shema, Ateret Torah. */
  sofZmanShemaAteretTorah(): Zman { return this.make('sof-zman-shema-ateret-torah', this.within(this.atStart(), this.atEnd(), 3)); }
  /** Latest Shacharis, Gra. */
  sofZmanTefillaGra(): Zman { return this.make('sof-zman-tefilla-gra', this.within(this.rise(), this.set(), 4)); }
  /** Latest Shacharis, Magen Avraham (72 fixed minutes). */
  sofZmanTefillaMga72(): Zman { return this.make('sof-zman-tefilla-mga-72', this.within(this.mga72Start(), this.mga72End(), 4)); }
  /** Latest Shacharis, Magen Avraham (90 fixed minutes). */
  sofZmanTefillaMga90(): Zman { return this.make('sof-zman-tefilla-mga-90', this.within(this.offset(this.rise(), -90), this.offset(this.set(), 90), 4)); }
  /** Latest Shacharis, Magen Avraham (72 proportional minutes). */
  sofZmanTefillaMga72Zmaniyos(): Zman { return this.make('sof-zman-tefilla-mga-72-zmaniyos', this.within(this.zmaniyos(this.rise(), 1.2, -1), this.zmaniyos(this.set(), 1.2, 1), 4)); }
  /** Latest Shacharis, Magen Avraham (90 proportional minutes). */
  sofZmanTefillaMga90Zmaniyos(): Zman { return this.make('sof-zman-tefilla-mga-90-zmaniyos', this.within(this.zmaniyos(this.rise(), 1.5, -1), this.zmaniyos(this.set(), 1.5, 1), 4)); }
  /** Latest Shacharis, Magen Avraham (16.1°). */
  sofZmanTefillaMga16Point1(): Zman { return this.make('sof-zman-tefilla-mga-16.1', this.within(this.angle(16.1, true), this.angle(16.1, false), 4)); }
  /** Latest Shacharis, Baal HaTanya. */
  sofZmanTefillaBaalHaTanya(): Zman { return this.make('sof-zman-tefilla-baal-hatanya', this.within(this.bhtRise(), this.bhtSet(), 4)); }
  /** Latest Shacharis, Ateret Torah. */
  sofZmanTefillaAteretTorah(): Zman { return this.make('sof-zman-tefilla-ateret-torah', this.within(this.atStart(), this.atEnd(), 4)); }

  // ---------------------------------------------------------------- mincha

  /** Mincha Gedola, 30 fixed minutes after chatzos. */
  minchaGedola30(): Zman { return this.make('mincha-gedola-30', { time: this.transitMs + 30 * 60_000 }); }
  /** Mincha Gedola, Gra: 6.5 seasonal hours after sunrise (half a seasonal hour after the day's midpoint). */
  minchaGedolaGra(): Zman { return this.make('mincha-gedola-gra', this.within(this.rise(), this.set(), 6.5)); }
  /** Mincha Gedola: the later of 30 minutes after chatzos and the Gra's 6.5 seasonal hours. */
  minchaGedolaGreater(): Zman {
    const g = this.within(this.rise(), this.set(), 6.5);
    const thirty = this.transitMs + 30 * 60_000;
    return this.make('mincha-gedola-greater', 'time' in g ? { time: Math.max(thirty, g.time) } : { reason: 'depends-on-missing-zman' });
  }
  /** Mincha Gedola, Magen Avraham (72 fixed minutes): 6.5 hours into the MGA day. */
  minchaGedolaMga72(): Zman { return this.make('mincha-gedola-mga-72', this.within(this.mga72Start(), this.mga72End(), 6.5)); }
  /** Mincha Gedola, Baal HaTanya. */
  minchaGedolaBaalHaTanya(): Zman { return this.make('mincha-gedola-baal-hatanya', this.within(this.bhtRise(), this.bhtSet(), 6.5)); }
  /** Mincha Ketana, Gra (9.5 seasonal hours). */
  minchaKetanaGra(): Zman { return this.make('mincha-ketana-gra', this.within(this.rise(), this.set(), 9.5)); }
  /** Mincha Ketana, Magen Avraham (72 fixed minutes). */
  minchaKetanaMga72(): Zman { return this.make('mincha-ketana-mga-72', this.within(this.mga72Start(), this.mga72End(), 9.5)); }
  /** Mincha Ketana, Baal HaTanya. */
  minchaKetanaBaalHaTanya(): Zman { return this.make('mincha-ketana-baal-hatanya', this.within(this.bhtRise(), this.bhtSet(), 9.5)); }
  /** Plag HaMincha, Gra (10.75 seasonal hours). */
  plagHaminchaGra(): Zman { return this.make('plag-hamincha-gra', this.within(this.rise(), this.set(), 10.75)); }
  /** Plag HaMincha, Magen Avraham (72 fixed minutes). */
  plagHaminchaMga72(): Zman { return this.make('plag-hamincha-mga-72', this.within(this.mga72Start(), this.mga72End(), 10.75)); }
  /** Plag HaMincha, Magen Avraham (16.1°). */
  plagHaminchaMga16Point1(): Zman { return this.make('plag-hamincha-mga-16.1', this.within(this.angle(16.1, true), this.angle(16.1, false), 10.75)); }
  /** Plag HaMincha, Baal HaTanya. */
  plagHaminchaBaalHaTanya(): Zman { return this.make('plag-hamincha-baal-hatanya', this.within(this.bhtRise(), this.bhtSet(), 10.75)); }

  /** Plag HaMincha, Levush: the same calculation as the Gra (see the source note). */
  plagHaminchaLevush(): Zman { return this.make('plag-hamincha-levush', this.within(this.rise(), this.set(), 10.75)); }

  // ---------------------------------------------------------------- bein hashmashos

  /** Start of bein hashmashos per Rabbeinu Tam: 58.5 minutes after sunset. */
  beinHashmashosRabbeinuTam(): Zman { return this.make('bein-hashmashos-rabbeinu-tam', this.offset(this.set(), 58.5)); }
  /** End of bein hashmashos per the Geonim: 13.5, 16.875 or 18 minutes after sunset (¾ mil). Default 13.5. */
  beinHashmashosGeonim(minutes: 13.5 | 16.875 | 18 = 13.5): Zman { return this.make(`bein-hashmashos-geonim-${minutes}`, this.offset(this.set(), minutes)); }
  /** Start of bein hashmashos per the Yereim: 18, 16.875 or 13.5 minutes before sunset. Default 18. */
  beinHashmashosYereim(minutes: 13.5 | 16.875 | 18 = 18): Zman { return this.make(`bein-hashmashos-yereim-${minutes}`, this.offset(this.set(), -minutes)); }

  // ---------------------------------------------------------------- tzeis

  /** Tzeis at 8.5°. */
  tzeis8Point5(): Zman { return this.make('tzeis-8.5', this.angle(8.5, false)); }
  /** Tzeis at 7.083°. */
  tzeis7Point083(): Zman { return this.make('tzeis-7.083', this.angle(7.083, false)); }
  /** Tzeis at 6.45°. */
  tzeis6Point45(): Zman { return this.make('tzeis-6.45', this.angle(6.45, false)); }
  /** Tzeis 42 fixed minutes after sunset. */
  tzeis42(): Zman { return this.make('tzeis-42', this.offset(this.set(), 42)); }
  /** Tzeis 50 fixed minutes after sunset. */
  tzeis50(): Zman { return this.make('tzeis-50', this.offset(this.set(), 50)); }
  /** Tzeis 60 fixed minutes after sunset. */
  tzeis60(): Zman { return this.make('tzeis-60', this.offset(this.set(), 60)); }
  /** Tzeis 72 fixed minutes after sunset. */
  tzeis72(): Zman { return this.make('tzeis-72', this.offset(this.set(), 72)); }
  /** Tzeis of Rabbeinu Tam: 72 fixed minutes after sunset. */
  tzeisRabbeinuTam(): Zman { return this.make('tzeis-rabbeinu-tam', this.offset(this.set(), 72)); }
  /** Tzeis of the Baal HaTanya, 6°. */
  tzeisBaalHaTanya(): Zman { return this.make('tzeis-baal-hatanya', this.angle(6, false)); }
  /** Tzeis of Ateret Torah (default 40 minutes; option `ateretTorahMinutes`). */
  tzeisAteretTorah(): Zman { return this.make('tzeis-ateret-torah', this.atEnd()); }

  // ---------------------------------------------------------------- Shabbos, Yom Tov, Pesach

  /**
   * Candle lighting `minutes` before sunset (default: the calculator's
   * `candleLightingMinutes`, 18). Customs: 18 is common; Jerusalem 40; Haifa 30;
   * Tzfas 20. Always returned; whether today needs it is the caller's (or the day
   * view's) business.
   */
  candleLighting(minutes = this.options.candleLightingMinutes): Zman {
    return this.make('candle-lighting', this.offset(this.set(), -minutes));
  }
  /** Havdala at `degrees` below the horizon (e.g. 8.5) or `minutes` after sunset (e.g. 42, 50, 72). Default 8.5°. */
  havdala(by: { degrees: number } | { minutes: number } = { degrees: 8.5 }): Zman {
    return this.make('havdala', 'degrees' in by ? this.angle(by.degrees, false) : this.offset(this.set(), by.minutes));
  }
  /** Candle lighting on the second night of Yom Tov (or Yom Tov after Shabbos): after nightfall, by default 8.5°. */
  candleLightingSecondNight(by: { degrees: number } | { minutes: number } = { degrees: 8.5 }): Zman {
    return this.make('candle-lighting-second-night', 'degrees' in by ? this.angle(by.degrees, false) : this.offset(this.set(), by.minutes));
  }
  private erevPesach(id: string, raw: Raw): Zman {
    const h = this.hebrewDate;
    return this.make(id, h.month === Month.NISAN && h.day === 14 ? raw : { reason: 'not-applicable-today' });
  }
  /** Latest time to eat chametz, Gra (only on 14 Nisan; otherwise null). */
  sofZmanAchilasChametzGra(): Zman { return this.erevPesach('sof-zman-achilas-chametz-gra', this.within(this.rise(), this.set(), 4)); }
  /** Latest time to eat chametz, Magen Avraham 72 (only on 14 Nisan). */
  sofZmanAchilasChametzMga72(): Zman { return this.erevPesach('sof-zman-achilas-chametz-mga-72', this.within(this.mga72Start(), this.mga72End(), 4)); }
  /** Latest time to burn chametz, Gra (only on 14 Nisan). */
  sofZmanBiurChametzGra(): Zman { return this.erevPesach('sof-zman-biur-chametz-gra', this.within(this.rise(), this.set(), 5)); }
  /** Latest time to burn chametz, Magen Avraham 72 (only on 14 Nisan). */
  sofZmanBiurChametzMga72(): Zman { return this.erevPesach('sof-zman-biur-chametz-mga-72', this.within(this.mga72Start(), this.mga72End(), 5)); }

  /** The calculator for the next civil day at the same place, with the same options. */
  nextDay(): ZmanimCalendar {
    return new ZmanimCalendar(this.location, daysToCivil(civilToDays(this.date.year, this.date.month, this.date.day) + 1), this.options);
  }
  /** The calculator for the previous civil day. */
  prevDay(): ZmanimCalendar {
    return new ZmanimCalendar(this.location, daysToCivil(civilToDays(this.date.year, this.date.month, this.date.day) - 1), this.options);
  }
}
