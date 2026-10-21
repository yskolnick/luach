/**
 * Everything about one day, as plain JSON: enough for an app to render a whole day from one call.
 * The shape is described by `schema/day.schema.json` (JSON Schema 2020-12).
 *
 * Ask your rav. This library calculates; it does not rule. Every zman carries its opinion and source; the
 * default set is documented below and is a default, not a recommendation.
 *
 * @packageDocumentation
 */

import { type DayNumber, dayNumberToGregorian, dayOfWeek, gregorianToDayNumber } from '../calendar/gregorian.js';
import { dayNumberToHebrew } from '../calendar/hebrew.js';
import { moladAnnouncement, omerDay, omerSefirah, omerTextEnglish, omerTextHebrew, rainPrayers } from '../calendar/seasonal.js';
import { formatHebrewDate } from '../format/format.js';
import type { NameStyle } from '../format/names.js';
import { hallel } from '../holidays/hallel.js';
import { type Holiday, holidayName, holidaysOn, type HolidayOptions } from '../holidays/holidays.js';
import { type Location, parshaOn, readingName } from '../parsha/parsha.js';
import { toZoned } from '../time/zone.js';
import { fastTimes } from '../zmanim/fasts.js';
import { dafHaShavua, dafYomi, mishnaYomis, nachYomi, rambam1, rambam3, yerushalmiYomi } from '../learning/learning.js';
import * as Z from '../zmanim/zmanim.js';

/** The zmanim included by default, keyed by name. A default list, not a ruling: pass `zmanim` to choose. */
export const DEFAULT_DAY_ZMANIM: Readonly<Record<string, Z.ZmanFunction>> = {
  alos16_1: Z.alos16_1,
  alos72: Z.alos72,
  misheyakir11_5: Z.misheyakir11_5,
  netz: Z.netz,
  sofZmanShemaMA72: Z.sofZmanShemaMA72,
  sofZmanShemaGra: Z.sofZmanShemaGra,
  sofZmanTefillaMA72: Z.sofZmanTefillaMA72,
  sofZmanTefillaGra: Z.sofZmanTefillaGra,
  chatzos: Z.chatzos,
  minchaGedolaGra: Z.minchaGedolaGra,
  minchaKetanaGra: Z.minchaKetanaGra,
  plagHaminchaGra: Z.plagHaminchaGra,
  shkiah: Z.shkiah,
  tzeis8_5: Z.tzeis8_5,
  tzeis72: Z.tzeis72,
};

export interface DayOptions extends Omit<HolidayOptions, 'location'> {
  /** Where the user is. With a `name`, it is echoed in the output. */
  readonly location: Z.GeoLocation;
  /** Israel or diaspora calendar. Required: Luach never guesses. */
  readonly calendar: Location;
  /** Zmanim to include. Default {@link DEFAULT_DAY_ZMANIM}. */
  readonly zmanim?: Readonly<Record<string, Z.ZmanFunction>>;
  /** Zman options (rounding, elevation…). */
  readonly zmanOptions?: Z.ZmanOptions;
  /** Minutes before sunset for candle lighting. Default 18 (a custom; see docs). */
  readonly candleLightingMinutes?: number;
  /** Havdala opinion. Default 8.5°. */
  readonly havdala?: { degrees: number } | { minutes: number };
  /** Name style for display strings. Default `'en'`. */
  readonly names?: NameStyle;
}

/** A zman in the day JSON. */
export interface DayZman {
  /** ISO 8601 instant, or null. */
  time: string | null;
  /** Local wall-clock time "HH:MM" in the location's zone, or null. */
  local: string | null;
  opinion: string;
  source: string;
  rounded: 'up' | 'down' | 'none';
  reason?: string;
  fallback?: string;
}

/** The day JSON. */
export interface DayInfo {
  gregorian: string;
  dayOfWeek: number;
  hebrew: { year: number; month: number; day: number; text: string; textHebrew: string };
  calendar: Location;
  location: { name?: string; latitude: number; longitude: number; elevation: number; timeZone: string };
  holidays: { id: string; name: string; category: string; yomTov: boolean; fast: 'major' | 'minor' | null; candlesTonight?: number }[];
  parsha: { shabbos: string; name: string; parsha: string[] | null; special: string | null };
  omer: { day: number; textHebrew: string; textEnglish: string; sefirah: string } | null;
  hallel: 'whole' | 'half' | null;
  rainPrayers: { mashivHaruach: boolean; talUmatar: boolean; changeAtMusaf: string | null };
  molad: string | null;
  zmanim: Record<string, DayZman>;
  candleLighting: DayZman | null;
  havdala: DayZman | null;
  fast: { begins: DayZman; ends: DayZman } | null;
  /** Today's portion in each learning cycle (null before a cycle began, or on a day it skips). */
  learning: Record<'dafYomi' | 'yerushalmi' | 'mishnaYomis' | 'rambam3' | 'rambam1' | 'nachYomi' | 'dafHaShavua', { text: string; textHebrew: string } | null>;
}

function iso(n: DayNumber): string {
  const g = dayNumberToGregorian(n);
  return `${String(g.year).padStart(4, '0')}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
}

function dayZman(z: Z.Zman, loc: Z.GeoLocation, opts: Z.ZmanOptions): DayZman {
  let local: string | null = null;
  if (z.time) {
    const t = toZoned(z.time.getTime(), loc.timeZone, opts.timeZoneProvider);
    local = `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
  }
  const j = z.toJSON();
  return { ...j, local };
}

const brief = (p: { text: string; textHebrew: string } | null) => (p ? { text: p.text, textHebrew: p.textHebrew } : null);

/** Everything about a civil date at a place. */
export function getDay(date: Z.DateInput, options: DayOptions): DayInfo {
  const n = typeof date === 'number' ? date : gregorianToDayNumber(date.year, date.month, date.day);
  const loc = options.location;
  const zo: Z.ZmanOptions = options.zmanOptions ?? {};
  const names = options.names ?? 'en';
  const h = dayNumberToHebrew(n);
  const holidayOpts: HolidayOptions = { ...options, location: options.calendar };
  const hol = holidaysOn(n, holidayOpts);
  const tomorrow = holidaysOn(n + 1, holidayOpts);

  const zmanim: Record<string, DayZman> = {};
  for (const [key, f] of Object.entries(options.zmanim ?? DEFAULT_DAY_ZMANIM)) zmanim[key] = dayZman(f(n, loc, zo), loc, zo);

  // Candle lighting and havdala:
  // - before sunset when tomorrow is Shabbos or Yom Tov and today is neither, and always before Shabbos (even on Yom Tov);
  // - after nightfall when today and tomorrow are both holy (second night of Yom Tov, Yom Tov after Shabbos);
  // - havdala when a holy day ends into a weekday.
  const holy = (n2: DayNumber, list: Holiday[]) => dayOfWeek(n2) === 6 || list.some((x) => x.yomTov);
  const todayHoly = holy(n, hol);
  const tomorrowHoly = holy(n + 1, tomorrow);
  const nightfall = () => Z.havdala(n, loc, options.havdala ?? { degrees: 8.5 }, zo);
  let candleLighting: DayZman | null = null;
  if (tomorrowHoly && (!todayHoly || dayOfWeek(n + 1) === 6)) {
    candleLighting = dayZman(Z.candleLighting(n, loc, options.candleLightingMinutes ?? 18, zo), loc, zo);
  } else if (todayHoly && tomorrowHoly) {
    const z = nightfall();
    candleLighting = { ...dayZman(z, loc, zo), opinion: `Candle lighting after nightfall: ${z.opinion.replace('End of Shabbos/Yom Tov: ', '')}` };
  }
  const havdala: DayZman | null = todayHoly && !tomorrowHoly ? dayZman(nightfall(), loc, zo) : null;

  const fastDay = hol.find((x) => x.fast);
  const ft = fastDay ? fastTimes(fastDay, loc, zo) : null;

  const reading = parshaOn(n, options.calendar);
  const omer = omerDay(n);
  const rp = rainPrayers(n, options.calendar);
  const mevorchim = hol.find((x) => x.id === 'shabbos-mevorchim');

  return {
    gregorian: iso(n),
    dayOfWeek: dayOfWeek(n),
    hebrew: { ...h, text: formatHebrewDate(h, { style: names === 'he' ? 'en' : names }), textHebrew: formatHebrewDate(h, { style: 'he' }) },
    calendar: options.calendar,
    location: {
      ...(loc.name ? { name: loc.name } : {}),
      latitude: loc.latitude,
      longitude: loc.longitude,
      elevation: loc.elevation ?? 0,
      timeZone: loc.timeZone,
    },
    holidays: hol.map((x) => ({
      id: x.id,
      name: holidayName(x, names),
      category: x.category,
      yomTov: x.yomTov,
      fast: x.fast,
      ...(x.candlesTonight !== undefined ? { candlesTonight: x.candlesTonight } : {}),
    })),
    parsha: { shabbos: iso(reading.dayNumber), name: readingName(reading, names), parsha: reading.parsha ? [...reading.parsha] : null, special: reading.special },
    omer: omer ? { day: omer, textHebrew: omerTextHebrew(omer), textEnglish: omerTextEnglish(omer), sefirah: omerSefirah(omer, names === 'he' ? 'he' : 'ashkenazi') } : null,
    hallel: hallel(n, options.calendar),
    rainPrayers: { mashivHaruach: rp.mashivHaruach, talUmatar: rp.talUmatar, changeAtMusaf: rp.changeAtMusaf },
    molad: mevorchim?.month !== undefined && mevorchim.monthYear !== undefined ? moladAnnouncement(mevorchim.monthYear, mevorchim.month, names) : null,
    zmanim,
    candleLighting,
    havdala,
    fast: ft ? { begins: dayZman(ft.begins, loc, zo), ends: dayZman(ft.ends, loc, zo) } : null,
    learning: {
      dafYomi: brief(dafYomi(n)),
      yerushalmi: brief(yerushalmiYomi(n)),
      mishnaYomis: brief(mishnaYomis(n)),
      rambam3: brief(rambam3(n)),
      rambam1: brief(rambam1(n)),
      nachYomi: brief(nachYomi(n)),
      dafHaShavua: brief(dafHaShavua(n)),
    },
  };
}
