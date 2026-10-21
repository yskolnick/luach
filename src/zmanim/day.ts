/**
 * Zmanim-aware calendar questions: what Hebrew date it is at an instant and place, when a
 * fast begins and ends, and whether melacha is forbidden at an instant.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { civilDateAt } from '../time/zone.js';
import { civilToDays, daysToCivil } from '../time/civil.js';
import { holidaysOn } from '../holidays/holidays.js';
import type { HolidayEvent, HolidayOptions } from '../holidays/types.js';
import { ZmanimCalendar, type GeoLocation, type ZmanimOptions } from './calendar.js';
import { ZMANIM } from './opinions.js';
import { roundToLocalMinute, Zman } from './zman.js';

/** Which zman ends the Hebrew day, for {@link hebrewDateAt}. */
export type DayBoundary = 'sunset' | 'tzeis-8.5' | 'tzeis-7.083' | 'tzeis-72';

function boundaryTime(z: ZmanimCalendar, b: DayBoundary): Zman {
  switch (b) {
    case 'sunset': return z.sunset();
    case 'tzeis-8.5': return z.tzeis8Point5();
    case 'tzeis-7.083': return z.tzeis7Point083();
    case 'tzeis-72': return z.tzeis72();
  }
}

/**
 * The Hebrew date at `instant` in `location`: the civil date there, moved to the next
 * Hebrew date once the day's `boundary` (default sunset) has passed. Between sunset and
 * nightfall (bein hashmashos) the halachic date is in doubt; choose the boundary that
 * suits the question. If the boundary does not occur that day (polar regions), the civil
 * date is used.
 */
export function hebrewDateAt(instant: Date, location: GeoLocation, options?: { boundary?: DayBoundary } & ZmanimOptions): HebrewDate {
  const t = instant.getTime();
  const civil = civilDateAt(t, location.timeZone);
  const zOptions = { ...options, rounding: false as const };
  const boundary = options?.boundary ?? 'sunset';
  // At high latitudes the previous civil day's boundary can fall after midnight, on this
  // civil date. Until it passes, the Hebrew date is still the previous day's.
  const yesterday = daysToCivil(civilToDays(civil.year, civil.month, civil.day) - 1);
  const prevEnd = boundaryTime(new ZmanimCalendar(location, yesterday, zOptions), boundary).time;
  if (prevEnd !== null && t < prevEnd.getTime()) return HebrewDate.fromCivil(yesterday);
  const end = boundaryTime(new ZmanimCalendar(location, civil, zOptions), boundary).time;
  return HebrewDate.fromCivil(civil, { afterSunset: end !== null && t >= end.getTime() });
}

/** Opinions for {@link fastTimes}. */
export interface FastTimesOptions extends HolidayOptions, ZmanimOptions {
  /** When a minor fast begins. Default `'alos-72'`. */
  begins?: 'alos-72' | 'alos-90' | 'alos-16.1' | 'alos-18' | 'alos-19.8' | 'alos-72-zmaniyos';
  /** When a fast ends. Default `'tzeis-7.083'`. Options include `'tzeis-6.45'` (Israel custom) and `'tzeis-8.5'`. */
  ends?: 'tzeis-6.45' | 'tzeis-7.083' | 'tzeis-8.5' | 'tzeis-42' | 'tzeis-50' | 'tzeis-72';
}

/** Start and end of the fast on `date`, or null if `date` is not a fast day. */
export function fastTimes(date: HebrewDate, location: GeoLocation, options: FastTimesOptions = {}): { fast: HolidayEvent; begins: Zman; ends: Zman } | null {
  const fast = holidaysOn(date, options).find((e) => e.flags.fast !== null);
  if (!fast) return null;
  const z = new ZmanimCalendar(location, date, options);
  let begins: Zman;
  if (fast.flags.fast === 'major') {
    const eve = z.prevDay().sunset();
    const def = ZMANIM['fast-begins-sunset']!;
    begins = new Zman({ id: 'fast-begins-sunset', time: eve.time, opinion: def.opinion, source: def.source, rounded: eve.rounded, timeZone: location.timeZone, ...(eve.reason ? { reason: eve.reason } : {}) });
  } else {
    const a = { 'alos-72': z.alos72(), 'alos-90': z.alos90(), 'alos-16.1': z.alos16Point1(), 'alos-18': z.alos18(), 'alos-19.8': z.alos19Point8(), 'alos-72-zmaniyos': z.alos72Zmaniyos() }[options.begins ?? 'alos-72'];
    const def = ZMANIM['fast-begins']!;
    // The fast's start is a deadline for eating, so it is rounded down.
    const exact = new ZmanimCalendar(location, date, { ...options, rounding: false });
    const ex = { 'alos-72': exact.alos72(), 'alos-90': exact.alos90(), 'alos-16.1': exact.alos16Point1(), 'alos-18': exact.alos18(), 'alos-19.8': exact.alos19Point8(), 'alos-72-zmaniyos': exact.alos72Zmaniyos() }[options.begins ?? 'alos-72'];
    const t = ex.time ? (z.options.rounding ? roundToLocalMinute(ex.time.getTime(), 'down', location.timeZone) : ex.time.getTime()) : null;
    begins = new Zman({ id: 'fast-begins', time: t === null ? null : new Date(t), opinion: `${def.opinion} (${a.opinion})`, source: `${def.source}; ${a.source}`, rounded: t !== null && z.options.rounding ? 'down' : null, timeZone: location.timeZone, ...(a.reason ? { reason: a.reason } : {}) });
  }
  const e = { 'tzeis-6.45': z.tzeis6Point45(), 'tzeis-7.083': z.tzeis7Point083(), 'tzeis-8.5': z.tzeis8Point5(), 'tzeis-42': z.tzeis42(), 'tzeis-50': z.tzeis50(), 'tzeis-72': z.tzeis72() }[options.ends ?? 'tzeis-7.083'];
  const def = ZMANIM['fast-ends']!;
  const ends = new Zman({ id: 'fast-ends', time: e.time, opinion: `${def.opinion} (${e.opinion})`, source: `${def.source}; ${e.source}`, rounded: e.rounded, timeZone: location.timeZone, ...(e.reason ? { reason: e.reason } : {}) });
  return { fast, begins, ends };
}

/** Options for {@link isMelachaForbiddenAt}. */
export interface MelachaOptions extends HolidayOptions, ZmanimOptions {
  /** Minutes before sunset that Shabbos/Yom Tov is taken on (candle lighting). Default: the calculator's `candleLightingMinutes` (18). */
  beginsMinutesBeforeSunset?: number;
  /** When Shabbos/Yom Tov ends. Default 8.5°. */
  ends?: { degrees: number } | { minutes: number };
}

/**
 * True if melacha is forbidden at `instant` because of Shabbos or Yom Tov, by the chosen
 * start (candle lighting) and end (havdala) times. Motzaei Shabbos after havdala time is
 * not forbidden. Yom Kippur counts as Yom Tov.
 */
export function isMelachaForbiddenAt(instant: Date, location: GeoLocation, options: MelachaOptions = {}): boolean {
  const civil = civilDateAt(instant.getTime(), location.timeZone);
  const z = new ZmanimCalendar(location, civil, { ...options, rounding: false });
  const today = HebrewDate.fromCivil(civil);
  const holy = (d: HebrewDate) => d.isShabbos || holidaysOn(d, options).some((e) => e.flags.melachaForbidden);
  // After 29 Elul 9999 (the last supported day) comes Rosh Hashana 10000, always Yom Tov.
  const holyTomorrow = () => today.epochDays === MAX_DAYS || holy(today.next());
  const t = instant.getTime();
  // At high latitudes the previous evening's candle lighting or havdala time can fall after
  // midnight, on this civil date.
  const yesterday = daysToCivil(civilToDays(civil.year, civil.month, civil.day) - 1);
  const y = new ZmanimCalendar(location, yesterday, { ...options, rounding: false });
  const yStart = y.candleLighting(options.beginsMinutesBeforeSunset ?? y.options.candleLightingMinutes).time;
  const yEnd = y.havdala(options.ends ?? { degrees: 8.5 }).time;
  if (yStart !== null && yEnd !== null) {
    if (t < yStart.getTime()) return holy(today.prev());
    if (t < yEnd.getTime()) return holy(today.prev()) || holy(today);
  }
  const sunset = z.sunset().time;
  const start = z.candleLighting(options.beginsMinutesBeforeSunset ?? z.options.candleLightingMinutes).time;
  const end = z.havdala(options.ends ?? { degrees: 8.5 }).time;
  if (sunset === null || start === null || end === null) {
    // Polar day or night: fall back to the civil day.
    return holy(today);
  }
  if (t < start.getTime()) return holy(today);
  if (t >= end.getTime()) return holyTomorrow();
  // Between candle lighting and havdala time: forbidden if today is holy (still ending) or tomorrow is (beginning).
  return holy(today) || holyTomorrow();
}
