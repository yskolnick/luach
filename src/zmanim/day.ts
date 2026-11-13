/**
 * Zmanim-aware calendar questions: what Hebrew date it is at an instant and place, when a
 * fast begins and ends, and whether melacha is forbidden at an instant. Each follows the
 * user's {@link Opinions}: `dayBoundary`, `fastBegins`, `fastEnds` and `havdala`.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { holidaysOn } from '../holidays/holidays.js';
import { israelFor } from '../places/israel.js';
import type { HolidayEvent, HolidayOptions } from '../holidays/types.js';
import type { GeoLocation } from './calendar.js';
import type { DayLocation } from './day-location.js';
import { zmanDefinition, type ZmanId } from './opinions.js';
import type { Zman } from './zman.js';
import { Zmanim, type Opinions, type ZmanimSettings } from './zmanim.js';
import { hebrewDateArg, instantArg } from '../calendar/date-input.js';

/**
 * Options for the functions that need both the calendar and the sun: the user's opinions,
 * settings that are not opinions (candle-lighting minutes, elevation), and the holiday options
 * (Israel or the diaspora, optional days).
 */
export interface ZmanimOptions extends HolidayOptions, ZmanimSettings {
  /** The user's opinions; anything left out uses `Zmanim.defaults`. */
  readonly opinions?: Opinions;
  /**
   * Which custom the Chanukah lighting's `earliest` follows on a weekday evening (`nightOf`,
   * `nowInfo`): `'sunset'` or `'tzeis'`. A custom, not an opinion about a time of day, so it is
   * not among the {@link Opinions}. Left out, the custom is nightfall (`'tzeis'`) as Luach's
   * default, not a ruling: the result says `isDefault` and `customs` lists both.
   */
  readonly chanukahLighting?: ChanukahCustom;
  /**
   * When the candles are lit from an existing flame on a second night of Yom Tov, or for Yom Tov
   * after Shabbos (`candle-lighting-second-night`): a nightfall zman (`'tzeis-8.5'`, ...). Left out,
   * it is the `havdala` opinion, as before (a default, not a ruling). The rule is only that they are
   * not lit before the first day has ended (Shulchan Aruch OC 503:1, no preparing from one day for
   * the next); which nightfall is the person's question for their rav. Havdala itself still
   * follows `havdala`.
   */
  readonly secondNightCandles?: ZmanId;
  /**
   * The earliest time to count the Omer (`Night.omerFrom`): `'holy-day-ends'` (default: the later of
   * nightfall and the end of Shabbos or Yom Tov) or `'tzeis'` (nightfall alone). A default, not a ruling.
   */
  readonly omerFrom?: 'tzeis' | 'holy-day-ends';
}

/** Throws a RangeError for a `secondNightCandles` that is not a nightfall zman. */
function checkSecondNightCandles(v: unknown): void {
  if (v === undefined) return;
  const def = typeof v === 'string' ? zmanDefinition(v) : undefined;
  if (!def || def.slot !== 'tzeis') throw new RangeError(`secondNightCandles must be a nightfall (tzeis) zman id, not ${JSON.stringify(v) ?? String(v)}`);
}

/** A custom for the earliest time to light the Chanukah lights on a weekday evening. */
export type ChanukahCustom = 'sunset' | 'tzeis';

/** Throws a RangeError for a `chanukahLighting` that is neither `'sunset'` nor `'tzeis'`. */
function checkChanukahLighting(v: unknown): void {
  if (v !== undefined && v !== 'sunset' && v !== 'tzeis') throw new RangeError(`chanukahLighting must be "sunset" or "tzeis", not ${JSON.stringify(v) ?? String(v)}`);
}

/**
 * The {@link Zmanim} these options describe. Internal: shared with the day view and iCal.
 * @internal
 */
export function zmanimFor(location: GeoLocation, o: ZmanimOptions): Zmanim {
  checkChanukahLighting(o.chanukahLighting);
  checkSecondNightCandles(o.secondNightCandles);
  if (o.omerFrom !== undefined && o.omerFrom !== 'tzeis' && o.omerFrom !== 'holy-day-ends') throw new RangeError(`omerFrom must be "tzeis" or "holy-day-ends", not ${JSON.stringify(o.omerFrom) ?? String(o.omerFrom)}`);
  const settings: { -readonly [K in keyof ZmanimSettings]: ZmanimSettings[K] } = {};
  if (o.useElevation !== undefined) settings.useElevation = o.useElevation;
  if (o.candleLightingMinutes !== undefined) settings.candleLightingMinutes = o.candleLightingMinutes;
  if (o.ateretTorahMinutes !== undefined) settings.ateretTorahMinutes = o.ateretTorahMinutes;
  if (o.highLatitudeFallback !== undefined) settings.highLatitudeFallback = o.highLatitudeFallback;
  if (o.algorithm !== undefined) settings.algorithm = o.algorithm;
  if (o.round !== undefined) settings.round = o.round;
  return new Zmanim(location, o.opinions ?? {}, settings);
}

/**
 * The Hebrew date at `instant` in `location`: the civil date there, moved to the next Hebrew
 * date once the `dayBoundary` opinion (default sunset) has passed. Between sunset and
 * nightfall (bein hashmashos) the halachic date is in doubt; choose the boundary that suits
 * the question. If the boundary does not occur that day (polar regions), the civil date is used.
 */
export function hebrewDateAt(instant: Date, location: GeoLocation, options: ZmanimOptions = {}): HebrewDate {
  instant = instantArg(instant, 'hebrewDateAt');
  return zmanimFor(location, options).hebrewDateAt(instant);
}

/**
 * Start and end of the fast on `date`, or null if `date` is not a fast day: the minor fasts
 * begin at the `fastBegins` opinion (default alos 72), Yom Kippur and Tisha B'Av at the
 * previous sunset; every fast ends at the `fastEnds` opinion (default 7.083°). Israel or the
 * diaspora: `options.israel` if given, otherwise from the location.
 */
export function fastTimes(date: HebrewDate, location: GeoLocation, options: ZmanimOptions = {}): { fast: HolidayEvent; begins: Zman; ends: Zman } | null {
  date = hebrewDateArg(date, 'fastTimes');
  const fast = holidaysOn(date, { ...options, israel: israelFor(options.israel, location) }).find((e) => e.flags.fast !== null);
  if (!fast) return null;
  const z = zmanimFor(location, options);
  const day = z.on(date);
  let begins: Zman;
  if (fast.flags.fast === 'major') {
    const def = zmanDefinition('fast-begins-sunset')!;
    begins = z.on(date.prev()).labelled('fast-begins-sunset', 'sunset', def.opinion, def.source);
  } else {
    // The fast's start is a deadline for eating, so it is rounded down.
    const a = day.get(z.opinions.fastBegins);
    const def = zmanDefinition('fast-begins')!;
    begins = day.labelled('fast-begins', z.opinions.fastBegins, `${def.opinion} (${a.opinion})`, `${def.source}; ${a.source}`);
  }
  const e = day.get(z.opinions.fastEnds);
  const def = zmanDefinition('fast-ends')!;
  const ends = day.labelled('fast-ends', z.opinions.fastEnds, `${def.opinion} (${e.opinion})`, `${def.source}; ${e.source}`);
  return { fast, begins, ends };
}

/**
 * True if melacha is forbidden at `instant` because of Shabbos or Yom Tov: from candle
 * lighting to the `havdala` opinion (default 8.5°). Motzaei Shabbos after havdala time is not
 * forbidden. Yom Kippur counts as Yom Tov. Israel or the diaspora (the second day of Yom Tov):
 * `options.israel` if given, otherwise from the location.
 *
 * Where the havdala time does not occur (far north in summer, with the default
 * `highLatitudeFallback: 'none'`), Luach has no time at which Shabbos or Yom Tov ends. The
 * function then answers by the civil day, which is not a time from any source: from candle
 * lighting (where that occurs) the evening before a holy day is forbidden, and the end of a
 * holy day is taken as the end of the civil day. Where candle lighting or sunset does not
 * occur either, the whole answer is by the civil day. Setting `highLatitudeFallback` gives that
 * rule's time instead.
 *
 * Candle lighting is `options.candleLightingMinutes` before sunset if given; otherwise the
 * place's documented custom (`location.candleLighting`, as on a built-in `Place`), exactly as
 * the day view chooses; otherwise 18 minutes. The custom is the place's, the 18 minutes is a
 * default, not a ruling. Ask your rav.
 */
export function isMelachaForbiddenAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): boolean {
  instant = instantArg(instant, 'isMelachaForbiddenAt');
  // Zmanim takes the place's documented custom when the caller has not chosen the minutes.
  const z = zmanimFor(location, options);
  const todayZ = z.at(instant);
  const civil = todayZ.date;
  const today = HebrewDate.fromCivil(civil);
  const hopts = { ...options, israel: israelFor(options.israel, location) };
  const holy = (d: HebrewDate) => d.isShabbos || holidaysOn(d, hopts).some((e) => e.flags.melachaForbidden);
  // After 29 Elul 9999 (the last supported day) comes Rosh Hashana 10000, always Yom Tov.
  const holyTomorrow = () => today.epochDays === MAX_DAYS || holy(today.next());
  const t = instant.getTime();
  const bounds = (d: HebrewDate) => {
    const day = z.on(d);
    return { start: day.get('candle-lighting').exact ?? null, end: day.get(z.opinions.havdala).exact ?? null, sunset: day.get('sunset').exact ?? null };
  };
  // At high latitudes the previous evening's candle lighting, sunset or havdala time can fall
  // after midnight, on this civil date: until then the previous day is still in effect.
  const y = bounds(today.prev());
  if (y.start !== null && t < y.start.getTime()) return holy(today.prev());
  if (y.end !== null && t < y.end.getTime()) return holy(today.prev()) || holy(today);
  // No havdala time, but the sun has not yet set on the previous day.
  if (y.end === null && y.sunset !== null && t < y.sunset.getTime()) return holy(today.prev()) || holy(today);
  const b = bounds(today);
  if (b.sunset === null || b.start === null) {
    // Polar day or night: fall back to the civil day.
    return holy(today);
  }
  if (t < b.start.getTime()) return holy(today);
  // Candle lighting occurs but the havdala time does not: there is no time at which the day
  // ends, so it ends with the civil day (see above).
  if (b.end !== null && t >= b.end.getTime()) return holyTomorrow();
  // From candle lighting to havdala time: forbidden if today is holy (still ending) or tomorrow is (beginning).
  return holy(today) || holyTomorrow();
}
