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
import { zmanDefinition } from './opinions.js';
import type { Zman } from './zman.js';
import { Zmanim, type Opinions, type ZmanimSettings } from './zmanim.js';

/**
 * Options for the functions that need both the calendar and the sun: the user's opinions,
 * settings that are not opinions (candle-lighting minutes, elevation), and the holiday options
 * (Israel or the diaspora, optional days).
 */
export interface ZmanimOptions extends HolidayOptions, ZmanimSettings {
  /** The user's opinions; anything left out uses `Zmanim.defaults`. */
  readonly opinions?: Opinions;
}

/**
 * The {@link Zmanim} these options describe. Internal: shared with the day view and iCal.
 * @internal
 */
export function zmanimFor(location: GeoLocation, o: ZmanimOptions): Zmanim {
  const settings: { -readonly [K in keyof ZmanimSettings]: ZmanimSettings[K] } = {};
  if (o.useElevation !== undefined) settings.useElevation = o.useElevation;
  if (o.candleLightingMinutes !== undefined) settings.candleLightingMinutes = o.candleLightingMinutes;
  if (o.ateretTorahMinutes !== undefined) settings.ateretTorahMinutes = o.ateretTorahMinutes;
  if (o.highLatitudeFallback !== undefined) settings.highLatitudeFallback = o.highLatitudeFallback;
  if (o.algorithm !== undefined) settings.algorithm = o.algorithm;
  return new Zmanim(location, o.opinions ?? {}, settings);
}

/**
 * The Hebrew date at `instant` in `location`: the civil date there, moved to the next Hebrew
 * date once the `dayBoundary` opinion (default sunset) has passed. Between sunset and
 * nightfall (bein hashmashos) the halachic date is in doubt; choose the boundary that suits
 * the question. If the boundary does not occur that day (polar regions), the civil date is used.
 */
export function hebrewDateAt(instant: Date, location: GeoLocation, options: ZmanimOptions = {}): HebrewDate {
  return zmanimFor(location, options).hebrewDateAt(instant);
}

/**
 * Start and end of the fast on `date`, or null if `date` is not a fast day: the minor fasts
 * begin at the `fastBegins` opinion (default alos 72), Yom Kippur and Tisha B'Av at the
 * previous sunset; every fast ends at the `fastEnds` opinion (default 7.083°). Israel or the
 * diaspora: `options.israel` if given, otherwise from the location.
 */
export function fastTimes(date: HebrewDate, location: GeoLocation, options: ZmanimOptions = {}): { fast: HolidayEvent; begins: Zman; ends: Zman } | null {
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
 * lighting (the `candleLightingMinutes` setting, default 18) to the `havdala` opinion (default
 * 8.5°). Motzaei Shabbos after havdala time is not forbidden. Yom Kippur counts as Yom Tov.
 * Israel or the diaspora (the second day of Yom Tov): `options.israel` if given, otherwise
 * from the location.
 */
export function isMelachaForbiddenAt(instant: Date, location: GeoLocation, options: ZmanimOptions = {}): boolean {
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
  // At high latitudes the previous evening's candle lighting or havdala time can fall after
  // midnight, on this civil date.
  const y = bounds(today.prev());
  if (y.start !== null && y.end !== null) {
    if (t < y.start.getTime()) return holy(today.prev());
    if (t < y.end.getTime()) return holy(today.prev()) || holy(today);
  }
  const b = bounds(today);
  if (b.sunset === null || b.start === null || b.end === null) {
    // Polar day or night: fall back to the civil day.
    return holy(today);
  }
  if (t < b.start.getTime()) return holy(today);
  if (t >= b.end.getTime()) return holyTomorrow();
  // Between candle lighting and havdala time: forbidden if today is holy (still ending) or tomorrow is (beginning).
  return holy(today) || holyTomorrow();
}
