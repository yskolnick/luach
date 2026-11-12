/**
 * Everything true at an instant at a place, as one plain JSON document: the clock there, the
 * Hebrew date and when it changes, whether melacha is forbidden and until when, the fast, the night,
 * what comes next, Kiddush Levana, and the whole day view of the Hebrew date. The shape is
 * described by `schema/now.schema.json` (also exported as {@link NOW_INFO_SCHEMA_ID}).
 *
 * @packageDocumentation
 */

import { civilToDays, daysToCivil, formatIsoDate } from '../time/civil.js';
import { zoneName } from '../time/zone.js';
import { zonedInstant, zonedParts } from '../time/zoned.js';
import { israelFor } from '../places/israel.js';
import { he } from '../locales/he.js';
import type { Locale } from '../locales/types.js';
import type { DayLocation } from '../zmanim/day-location.js';
import { zmanimFor, type ZmanimOptions } from '../zmanim/day.js';
import type { KiddushLevanaTime } from '../holidays/seasonal.js';
import { dayInfo, type DayInfo, type DayLearningSource } from './day-info.js';
import { fastAt, hebrewDateSpanAt, kiddushLevanaAt, lastDaySunset, melachaRunAt, nightOf, timesBetween, type ChanukahLighting, type Night } from './at.js';
import { Zmanim } from '../zmanim/zmanim.js';
import { eventJson, hebrewDateJson, locationJson, type EventJson, type HebrewDateJson, type LocationJson } from './json.js';
import type { Zman } from '../zmanim/zman.js';

/** `$id` of the JSON Schema for {@link NowInfo}. */
export const NOW_INFO_SCHEMA_ID = 'https://raw.githubusercontent.com/yskolnick/luach/main/schema/now.schema.json';

/** Options for {@link nowInfo}: the opinions and settings of the zmanim and the holiday options, and the names' language. */
export interface NowInfoOptions extends ZmanimOptions {
  /** Names (holidays, months). Default Hebrew, as {@link dayInfo}. */
  readonly locale?: Locale;
  /** The learning of the day: pass `dayLearning` from `luach/learning`, as for {@link dayInfo}. Default none (`day.learning` is null). */
  readonly learning?: DayLearningSource;
}

type ZmanJson = ReturnType<Zman['toJSON']>;
/** A night: the evening that begins a Hebrew date, with its times and what is counted and lit on it. */
export interface NightJson {
  readonly hebrewDate: HebrewDateJson;
  readonly sunset: ZmanJson;
  readonly tzeis: ZmanJson;
  readonly alos: ZmanJson;
  readonly sunrise: ZmanJson;
  readonly omer: number | null;
  readonly chanukahLights: number | null;
  /** When to light the Chanukah lights this evening, by custom; null outside Chanukah. */
  readonly chanukahLighting: ChanukahLightingJson | null;
}

/** {@link ChanukahLighting} as JSON. */
export interface ChanukahLightingJson {
  readonly lights: number;
  readonly evening: ChanukahLighting['evening'];
  /** The custom in force: the caller's choice, or nightfall (`'tzeis'`) when none is chosen. */
  readonly custom: 'sunset' | 'tzeis';
  /** True when the caller chose no custom, so `custom` is Luach's default. */
  readonly isDefault: boolean;
  readonly customs: readonly { readonly id: 'sunset' | 'tzeis'; readonly earliest: ZmanJson; readonly opinion: string; readonly source: string }[];
  readonly earliest: ZmanJson | null;
  readonly before: ZmanJson | null;
  readonly until: ZmanJson;
}

type TimeJson = { readonly time: string; readonly opinion: string; readonly source: string };

/** The JSON for one instant at one place. */
export interface NowInfo {
  readonly $schema: string;
  /** The instant asked about, ISO 8601 UTC. */
  readonly instant: string;
  readonly location: LocationJson;
  readonly israel: boolean;
  /** The wall clock at the place. */
  readonly clock: { readonly date: string; readonly time: string; readonly dayOfWeek: number; readonly timeZone: string; readonly offsetMinutes: number };
  /** The Hebrew date now (by the `dayBoundary` opinion), with the boundary times that began it and end it. */
  readonly hebrewDate: HebrewDateJson & { readonly begins: ZmanJson; readonly ends: ZmanJson };
  /**
   * The day view of the place's civil day (`clock.date`): today's zmanim, tonight's candles and
   * havdala, today's fast. For the Hebrew date now, which changes at sunset, see `hebrewDate`.
   */
  readonly day: DayInfo;
  /** What the answers follow: the opinions in force (every role), the candle-lighting minutes and the other settings. */
  readonly settings: {
    readonly opinions: Readonly<Record<string, string>>;
    readonly candleLightingMinutes: number;
    readonly candleLightingNote: string | null;
    readonly candleLightingCustom: { readonly minutes: number; readonly custom: string; readonly source: string } | null;
    readonly highLatitudeFallback: 'none' | 'nearestDay' | 'halfNight';
    readonly useElevation: boolean;
    /** The custom in force for the Chanukah lighting on a weekday: the caller's choice (`'sunset'` or `'tzeis'`), or nightfall (`'tzeis'`) when none is chosen. */
    readonly chanukahLighting: 'sunset' | 'tzeis';
    /** True when the caller chose no Chanukah lighting custom, so `chanukahLighting` is Luach's default (nightfall). */
    readonly chanukahLightingIsDefault: boolean;
  };
  /** The earliest instant after `instant` at which anything in this document changes, ISO 8601 UTC. Ask again then. */
  readonly validUntil: string;
  /** The run of days on which melacha is forbidden that is in progress, or else the next. */
  readonly melacha: {
    /** `true`, `false`, or `null` where Luach has no time to decide by. Never `false` for "no time". */
    readonly inProgress: boolean | null;
    readonly begins: ZmanJson;
    readonly ends: ZmanJson;
    readonly eve: { readonly date: string; readonly hebrewDate: HebrewDateJson; readonly events: readonly EventJson[] };
    readonly days: readonly { readonly date: string; readonly hebrewDate: HebrewDateJson; readonly shabbos: boolean; readonly events: readonly EventJson[]; readonly candles: ZmanJson }[];
  };
  /** The fast of today or tomorrow at the place, or `null`. */
  readonly fast: { readonly event: EventJson; readonly hebrewDate: HebrewDateJson; readonly inProgress: boolean | null; readonly begins: ZmanJson; readonly ends: ZmanJson } | null;
  /**
   * The night of the Hebrew date now: in progress once the date has begun (after its boundary),
   * last night during its day. When a night ends (dawn or sunrise) is the reader's choice: the times are here to compare.
   */
  readonly night: NightJson;
  /** The night after `night`: the coming night, once the date has rolled over; the one beginning this evening, during the day. */
  readonly nextNight: NightJson;
  /** Every calendar time after the instant, to the end of the seventh civil day after it, in order. */
  readonly upcoming: readonly { readonly zman: ZmanJson; readonly hebrewDate: HebrewDateJson }[];
  /** The next of the day's zmanim by the user's opinions (by the exact time), today's or the next civil day's, or `null` if none occurs. */
  readonly nextZman: ZmanJson | null;
  readonly kiddushLevana: {
    readonly year: number;
    readonly month: number;
    readonly molad: string;
    readonly earliest: { readonly threeDays: TimeJson; readonly sevenDays: TimeJson };
    readonly latest: { readonly halfMonth: TimeJson; readonly fifteenDays: TimeJson };
  };
}

const two = (n: number): string => String(n).padStart(2, '0');
const lightingJson = (c: ChanukahLighting | null): ChanukahLightingJson | null =>
  c && {
    lights: c.lights,
    evening: c.evening,
    custom: c.custom,
    isDefault: c.isDefault,
    customs: c.customs.map((x) => ({ id: x.id, earliest: x.earliest.toJSON(), opinion: x.opinion, source: x.source })),
    earliest: c.earliest?.toJSON() ?? null,
    before: c.before?.toJSON() ?? null,
    until: c.until.toJSON(),
  };
const timeJson = (t: KiddushLevanaTime): TimeJson => ({ time: t.time.toISOString(), opinion: t.opinion, source: t.source });

/**
 * Everything true at `instant` at `location`, as plain JSON that validates against
 * `schema/now.schema.json`: for a display, a home-automation platform or a server in any language.
 *
 * It decides nothing. Every time names its opinion and source; the defaults are defaults, not
 * rulings. It gives instants and leaves the comparing to the reader: there is no "erev" or
 * "motzei" flag, because when those begin and end is a choice.
 *
 * `melacha.inProgress` and `fast.inProgress` are `null` where Luach has no time to decide by (far
 * north in summer, for instance). That is not "no": compare with `=== null` first, and show
 * "unknown", never "off". `day` is the place's civil day (`clock.date`); the Hebrew date now,
 * which changes at sunset, is `hebrewDate`. `validUntil` is the earliest instant at which
 * anything in the document changes. A zman's `local` is its wall-clock time only: compare `time`.
 *
 * Throws a `RangeError` for an invalid instant, and in the last two weeks of year 9999 (the last
 * supported date is 29 Elul 9999): there the next night, the next run of Shabbos or Yom Tov or the next
 * month's Kiddush Levana falls in year 10000.
 *
 * Ask your rav. This library calculates; it does not rule.
 */
export function nowInfo(instant: Date, location: DayLocation, options: NowInfoOptions = {}): NowInfo {
  const { locale: given, learning, ...zopts } = options;
  const locale = given ?? he;
  const tz = location.timeZone;
  const israel = israelFor(options.israel, location);
  const hd = (h: Parameters<typeof hebrewDateJson>[0]): HebrewDateJson => hebrewDateJson(h, locale);

  const p = zonedParts(instant, tz);
  const today = civilToDays(p.year, p.month, p.day);
  const z = zmanimFor(location, zopts);
  const span = hebrewDateSpanAt(instant, location, zopts);
  const run = melachaRunAt(instant, location, zopts);
  const fast = fastAt(instant, location, zopts);
  const night = nightOf(span.date, location, zopts);
  const nextNight = nightOf(span.date.next(), location, zopts);
  const nightJson = (n: Night): NightJson => ({ hebrewDate: hd(n.date), sunset: n.sunset.toJSON(), tzeis: n.tzeis.toJSON(), alos: n.alos.toJSON(), sunrise: n.sunrise.toJSON(), omer: n.omer, chanukahLights: n.chanukahLights, chanukahLighting: lightingJson(n.chanukahLighting) });
  const end = zonedInstant(daysToCivil(today + 8), tz);
  // After the instant (a time at the instant itself has happened: the states already count it).
  const upcoming = timesBetween(new Date(instant.getTime() + 1), end, location, { ...zopts, which: [] });
  const levana = kiddushLevanaAt(instant, location, zopts);

  // The next of the day's zmanim by the user's opinions, compared by the exact time like every
  // state (not the displayed minute): the previous civil day's (a time can fall after local
  // midnight far north), today's and the next civil day's.
  const t = instant.getTime();
  let next: Zman | null = null;
  for (const day of [z.on(daysToCivil(today - 1)), z.on(p), z.on(daysToCivil(today + 1))]) {
    for (const zman of day.slots()) if (zman.exact !== null && zman.exact.getTime() > t && (next === null || zman.exact.getTime() < next.exact!.getTime())) next = zman;
  }

  const midnight = zonedInstant(daysToCivil(today + 1), tz).getTime();
  const changes: (number | null)[] = [
    run.begins.exact?.getTime() ?? null,
    run.ends.exact?.getTime() ?? null,
    fast?.begins.exact?.getTime() ?? null,
    fast?.ends.exact?.getTime() ?? null,
    span.ends.exact?.getTime() ?? null,
    next?.exact?.getTime() ?? null,
    // The first calendar time strictly after the instant (a time equal to the instant is not "after").
    upcoming.find((u) => u.zman.exact !== null && u.zman.exact.getTime() > t)?.zman.exact?.getTime() ?? null,
    // The sunset of the run's last day, which decides its state where the end does not occur.
    lastDaySunset(z, run.days[run.days.length - 1]!.date)?.getTime() ?? null,
    // The month of Kiddush Levana turns over when its latest time has passed.
    Math.max(levana.latest.halfMonth.time.getTime(), levana.latest.fifteenDays.time.getTime()),
    midnight,
  ];
  const validUntil = Math.min(...changes.filter((c): c is number => c !== null && c > t));
  const custom = z.candleCustom;

  return {
    $schema: NOW_INFO_SCHEMA_ID,
    instant: instant.toISOString(),
    location: locationJson(location),
    israel,
    clock: {
      date: formatIsoDate(p),
      time: `${two(p.hour)}:${two(p.minute)}:${two(p.second)}`,
      dayOfWeek: p.dayOfWeek,
      timeZone: zoneName(tz),
      offsetMinutes: p.offsetMinutes,
    },
    hebrewDate: { ...hd(span.date), begins: span.begins.toJSON(), ends: span.ends.toJSON() },
    // With opinions given the day lists the user's own times (each slot by their opinion),
    // as `luach date --opinions` and the example server's /day do; otherwise the usual set.
    day: dayInfo(p, { ...zopts, location, israel, locale, ...(learning ? { learning } : {}), ...(zopts.opinions && Object.keys(zopts.opinions).length ? { zmanim: Zmanim.order } : {}) }),
    settings: {
      opinions: { ...z.opinions } as Record<string, string>,
      candleLightingMinutes: z.settings.candleLightingMinutes ?? 18,
      candleLightingNote: z.candleNote,
      candleLightingCustom: custom ? { minutes: custom.minutes, custom: custom.custom, source: custom.source } : null,
      highLatitudeFallback: z.settings.highLatitudeFallback ?? 'none',
      useElevation: z.settings.useElevation ?? false,
      chanukahLighting: zopts.chanukahLighting ?? 'tzeis',
      chanukahLightingIsDefault: zopts.chanukahLighting === undefined,
    },
    validUntil: new Date(validUntil).toISOString(),
    melacha: {
      inProgress: run.inProgress,
      begins: run.begins.toJSON(),
      ends: run.ends.toJSON(),
      eve: { date: formatIsoDate(run.eve.date.toCivil()), hebrewDate: hd(run.eve.date), events: run.eve.events.map((e) => eventJson(e, locale)) },
      days: run.days.map((d) => ({
        date: formatIsoDate(d.date.toCivil()),
        hebrewDate: hd(d.date),
        shabbos: d.shabbos,
        events: d.events.map((e) => eventJson(e, locale)),
        candles: d.candles.toJSON(),
      })),
    },
    fast: fast
      ? { event: eventJson(fast.fast, locale), hebrewDate: hd(fast.date), inProgress: fast.inProgress, begins: fast.begins.toJSON(), ends: fast.ends.toJSON() }
      : null,
    night: nightJson(night),
    nextNight: nightJson(nextNight),
    upcoming: upcoming.map((u) => ({ zman: u.zman.toJSON(), hebrewDate: hd(u.date) })),
    nextZman: next?.toJSON() ?? null,
    kiddushLevana: {
      year: levana.year,
      month: levana.month,
      molad: levana.molad.toISOString(),
      earliest: { threeDays: timeJson(levana.earliest.threeDays), sevenDays: timeJson(levana.earliest.sevenDays) },
      latest: { halfMonth: timeJson(levana.latest.halfMonth), fifteenDays: timeJson(levana.latest.fifteenDays) },
    },
  };
}
