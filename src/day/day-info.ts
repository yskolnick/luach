/**
 * Everything about one day, as plain JSON: an app can render a whole day from one call.
 * The shape is described by `docs/schema/day.schema.json` (also exported as
 * {@link DAY_INFO_SCHEMA_ID}).
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { formatIsoDate, type CivilDate } from '../time/civil.js';
import { formatHebrewDate, monthName, weekdayName } from '../text/format.js';
import { he } from '../locales/he.js';
import { gematriya } from '../text/gematriya.js';
import type { Locale } from '../locales/types.js';
import { holidaysOn } from '../holidays/holidays.js';
import { holidayName } from '../holidays/names.js';
import type { HolidayFlags, HolidayOptions } from '../holidays/types.js';
import { omerDay, omerSefirah, omerText, omerTextEnglish } from '../holidays/omer.js';
import { tefillahOn, type TefillahDay, type TefillahOptions } from '../holidays/tefillah.js';
import { parshaFor, parshaName, type ParshaId } from '../parsha/parsha.js';
import { haftaraFor, type HaftaraMinhag } from '../parsha/haftara.js';
import { dafYomi } from '../learning/bavli.js';
import { amudYomi, mishnaYomis, nachYomi, rambamOneChapter, rambamThreeChapters, yerushalmiYomi } from '../learning/cycles.js';
import { ZmanimCalendar, type GeoLocation, type ZmanimOptions } from '../zmanim/calendar.js';
import { fastTimes } from '../zmanim/day.js';
import type { Zman } from '../zmanim/zman.js';

/** `$id` of the JSON Schema for {@link DayInfo}. */
export const DAY_INFO_SCHEMA_ID = 'https://github.com/yskolnick/luach/blob/main/docs/schema/day.schema.json';

/**
 * A place for {@link dayInfo}: a GeoLocation, optionally with a name, an Israel flag and a
 * documented local candle-lighting custom (as on a built-in `Place`).
 */
export type DayLocation = GeoLocation & {
  readonly israel?: boolean;
  readonly candleLighting?: { readonly minutes: number; readonly custom: string; readonly source: string };
};

/** Options for {@link dayInfo}. */
export interface DayInfoOptions extends ZmanimOptions {
  /** Where. Without it there are no zmanim. */
  location?: DayLocation;
  /** Israel or the diaspora. Explicit wins; otherwise `location.israel`; otherwise diaspora. */
  israel?: boolean;
  /** Names. Default Hebrew. */
  locale?: Locale;
  /** Haftara minhag. Default Ashkenaz. */
  minhag?: HaftaraMinhag;
  /** Holiday options (optional days). */
  holidays?: Omit<HolidayOptions, 'israel'>;
  /** Tefillah customs. */
  tefillah?: Omit<TefillahOptions, 'israel'>;
  /**
   * Which zmanim to include, by method name of {@link ZmanimCalendar} (e.g. "sofZmanShemaGra").
   * Default: a common set (see {@link DEFAULT_DAY_ZMANIM}); every one is labelled with its opinion.
   */
  zmanim?: readonly string[];
}

/** The default zmanim in a day view: a widely used set, not a ruling. */
export const DEFAULT_DAY_ZMANIM = [
  'alos72', 'alos16Point1', 'misheyakir11', 'sunrise', 'sofZmanShemaMga72', 'sofZmanShemaGra', 'sofZmanTefillaGra',
  'chatzos', 'minchaGedolaGreater', 'minchaKetanaGra', 'plagHaminchaGra', 'sunset', 'tzeis8Point5', 'tzeisRabbeinuTam',
] as const;

/** The JSON for one day. */
export interface DayInfo {
  readonly $schema: string;
  readonly gregorian: string;
  readonly weekday: number;
  readonly weekdayName: string;
  readonly hebrew: { readonly year: number; readonly month: number; readonly day: number; readonly monthName: string; readonly formatted: string };
  readonly israel: boolean;
  readonly events: readonly { id: string; name: string; flags: HolidayFlags; day?: number; candlesTonight?: number; moved?: boolean }[];
  /** This week's reading (the Shabbos on or after this day). */
  /** The coming Shabbos's reading; null only in the last days of year 9999 (that Shabbos is in year 10000). */
  readonly parsha: { readonly date: string; readonly ids: readonly ParshaId[] | null; readonly name: string | null; readonly holiday?: string } | null;
  readonly haftara: { readonly key: string; readonly reference: string | null } | null;
  readonly omer: { readonly day: number; readonly text: string; readonly textEnglish: string; readonly sefirah: string } | null;
  readonly tefillah: TefillahDay;
  readonly learning: Readonly<Record<string, string | null>>;
  readonly location: { readonly name?: string; readonly latitude: number; readonly longitude: number; readonly elevation: number; readonly timeZone: string } | null;
  readonly zmanim: readonly ReturnType<Zman['toJSON']>[];
  readonly candleLighting: ReturnType<Zman['toJSON']> | null;
  readonly havdala: ReturnType<Zman['toJSON']> | null;
  readonly fast: { readonly id: string; readonly begins: ReturnType<Zman['toJSON']>; readonly ends: ReturnType<Zman['toJSON']> } | null;
}

function holy(d: HebrewDate, opts: HolidayOptions): boolean {
  return d.isShabbos || holidaysOn(d, opts).some((e) => e.flags.melachaForbidden);
}

/** Everything about `date` (a civil date or a Hebrew date's daytime). */
export function dayInfo(date: CivilDate | HebrewDate, options: DayInfoOptions = {}): DayInfo {
  const h = date instanceof HebrewDate ? date : HebrewDate.fromCivil(date);
  const civil = h.toCivil();
  const locale = options.locale ?? he;
  const israel = options.israel ?? options.location?.israel ?? false;
  const hopts: HolidayOptions = { ...options.holidays, israel };
  const events = holidaysOn(h, hopts);
  const reading = parshaFor(h, { israel });
  const haft = haftaraFor(h, { israel, minhag: options.minhag ?? 'ashkenaz' });
  const om = omerDay(h);
  const str = (p: { text: string; textHe: string } | null) => (p ? (locale.dir === 'rtl' ? p.textHe : p.text) : null);
  const style = locale.base === 'he' ? 'he' : locale.base === 'sephardi' ? 'sephardi' : 'ashkenazi';

  let zmanim: ReturnType<Zman['toJSON']>[] = [];
  let candleLighting: ReturnType<Zman['toJSON']> | null = null;
  let havdala: ReturnType<Zman['toJSON']> | null = null;
  let fast: DayInfo['fast'] = null;
  if (options.location) {
    const z = new ZmanimCalendar(options.location, h, options);
    const names = options.zmanim ?? DEFAULT_DAY_ZMANIM;
    zmanim = names.map((n) => {
      const f = (z as unknown as Record<string, unknown>)[n];
      if (typeof f !== 'function') throw new RangeError(`Unknown zman method "${n}"`);
      return (f as () => Zman).call(z).toJSON();
    });
    const today = holy(h, hopts);
    // After 29 Elul 9999 (the last supported day) comes Rosh Hashana 10000, always Yom Tov.
    const tomorrow = h.epochDays === MAX_DAYS || holy(h.next(), hopts);
    // The place's documented custom applies when the caller has not chosen the minutes.
    const custom = options.candleLightingMinutes === undefined ? options.location.candleLighting : undefined;
    if (tomorrow && !today) {
      candleLighting = custom
        ? { ...z.candleLighting(custom.minutes).toJSON(), opinion: `Candle lighting ${custom.minutes} minutes before sunset, ${custom.custom}`, source: `${custom.source}; Shulchan Aruch OC 261:2 (tosefes Shabbos)` }
        : z.candleLighting().toJSON();
    }
    else if (tomorrow && today) candleLighting = z.candleLightingSecondNight().toJSON();
    if (today && !tomorrow) havdala = z.havdala().toJSON();
    const ft = fastTimes(h, options.location, { ...options, ...hopts });
    if (ft) fast = { id: ft.fast.id, begins: ft.begins.toJSON(), ends: ft.ends.toJSON() };
  }

  return {
    $schema: DAY_INFO_SCHEMA_ID,
    gregorian: formatIsoDate(civil),
    weekday: h.dayOfWeek,
    weekdayName: weekdayName(h.dayOfWeek, locale),
    hebrew: { year: h.year, month: h.month, day: h.day, monthName: monthName(h.month, h.year, locale), formatted: formatHebrewDate(h, { locale }) },
    israel,
    events: events.map((e) => ({
      id: e.id,
      name: holidayName(e, locale),
      flags: e.flags,
      ...(e.day !== undefined ? { day: e.day } : {}),
      ...(e.candlesTonight !== undefined ? { candlesTonight: e.candlesTonight } : {}),
      ...(e.moved ? { moved: true } : {}),
    })),
    parsha: reading
      ? {
          date: formatIsoDate(reading.date.toCivil()),
          ids: reading.parsha,
          name: parshaName(reading.parsha, locale),
          ...(reading.holiday ? { holiday: reading.holiday } : {}),
        }
      : null,
    haftara: haft ? { key: haft.key, reference: haft.reference } : null,
    omer: om ? { day: om, text: omerText(om), textEnglish: omerTextEnglish(om), sefirah: omerSefirah(om, style) } : null,
    tefillah: tefillahOn(h, { ...options.tefillah, israel }),
    learning: {
      dafYomi: (() => { const d = dafYomi(h); return d ? (locale.dir === 'rtl' ? `${d.tractateHe} ${gematriya(d.daf)}` : `${d.tractate} ${d.daf}`) : null; })(),
      yerushalmiYomi: str(yerushalmiYomi(h)),
      amudYomi: str(amudYomi(h)),
      mishnaYomis: str(mishnaYomis(h)),
      rambamOneChapter: str(rambamOneChapter(h)),
      rambamThreeChapters: str(rambamThreeChapters(h)),
      nachYomi: str(nachYomi(h)),
    },
    location: options.location
      ? { ...(options.location.name ? { name: options.location.name } : {}), latitude: options.location.latitude, longitude: options.location.longitude, elevation: options.location.elevation ?? 0, timeZone: typeof options.location.timeZone === 'string' ? options.location.timeZone : options.location.timeZone.name }
      : null,
    zmanim,
    candleLighting,
    havdala,
    fast,
  };
}

/** {@link dayInfo} for `count` consecutive days from `start`. */
export function dayInfoRange(start: CivilDate | HebrewDate, count: number, options: DayInfoOptions = {}): DayInfo[] {
  const h = start instanceof HebrewDate ? start : HebrewDate.fromCivil(start);
  const out: DayInfo[] = [];
  for (let i = 0; i < count; i++) out.push(dayInfo(h.addDays(i), options));
  return out;
}
