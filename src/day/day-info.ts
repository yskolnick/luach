/**
 * Everything about one day, as plain JSON: an app can render a whole day from one call.
 * The shape is described by `schema/day.schema.json` (also exported as
 * {@link DAY_INFO_SCHEMA_ID}).
 *
 * @packageDocumentation
 */

import { checkOptions, DAY_ENUMS, dayInfoKeys, HOLIDAY_KEYS as HOLIDAY_OPTION_KEYS, tefillaKeys } from '../util/options.js';
import { deepFreeze } from '../util/freeze.js';
import { israelFor } from '../places/israel.js';
import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { formatIsoDate, type CivilDate } from '../time/civil.js';
import { weekdayName } from '../text/format.js';
import { he } from '../locales/he.js';
import { wordName } from '../locales/terms.js';
import type { Locale } from '../locales/types.js';
import { forbidsMelacha, holidaysOnUnchecked as holidaysOn, isHolyDay, isYomTovNotKippur } from '../holidays/holidays.js';
import type { HolidayOptions } from '../holidays/types.js';
import { omerDay, omerSefirah, omerText, omerTextEnglish, type OmerNusach } from '../holidays/omer.js';
import { tefillaOn, type TefillaDay, type TefillaOptions } from '../holidays/tefilla.js';
import { parshaFor, parshaName, type ParshaId } from '../parsha/parsha.js';
import { haftaraFor, type HaftaraMinhag } from '../parsha/haftara.js';
import type { LearningCycleName } from '../learning/index.js';
import type { DayLocation } from '../zmanim/day-location.js';
import { eveningOf } from './evening.js';
import { holidayName } from '../holidays/names.js';
import { eventJson, hebrewDateJson, locationJson, type EventJson, type HebrewDateJson, type LocationJson } from './json.js';
import { fastTimesWith, zmanimFor } from '../zmanim/day.js';
import type { Zmanim } from '../zmanim/zmanim.js';
import { type ZmanId } from '../zmanim/opinions.js';
import type { Zman } from '../zmanim/zman.js';
import { zmanName } from '../zmanim/zmanim.js';
import type { DaySlot, Opinions, ZmanimSettings } from '../zmanim/zmanim.js';
import { hebrewOfDayArg } from '../calendar/date-input.js';

/** `$id` of the JSON Schema for {@link DayInfo}. */
export const DAY_INFO_SCHEMA_ID = 'https://raw.githubusercontent.com/yskolnick/luach/v0.5.5/schema/day.schema.json';

export type { DayLocation };

/** Options for {@link dayInfo}. */
/** A zman's JSON, with `name`: its name in the caller's locale. */
export type ZmanJson = ReturnType<Zman['toJSON']> & { readonly name: string };

export interface DayInfoOptions extends ZmanimSettings {
  /** The user's opinions: the zmanim, havdala, the fast's start and end. Anything left out uses `Zmanim.defaults`. */
  opinions?: Opinions;
  /** Where. Without it there are no zmanim. */
  location?: DayLocation;
  /**
   * Israel or the diaspora. Explicit wins; otherwise `location.israel`; otherwise the
   * location's coordinates decide (`isInIsrael`); with no location, the diaspora.
   */
  israel?: boolean;
  /** Names. Default Hebrew. */
  locale?: Locale;
  /** Haftara minhag. Default Ashkenaz. */
  minhag?: HaftaraMinhag;
  /** When candles are lit on a second night of Yom Tov (a nightfall zman); default the `havdala` opinion. As in `ZmanimOptions`. */
  secondNightCandles?: ZmanId;
  /** The wording of `omer.text`, as `omerText`: `'ashkenaz'` (default, "…לעומר"), `'sefard'` ("…בעומר") or `'edot-hamizrach'`. */
  omerNusach?: OmerNusach;
  /** A place that keeps Purim on 15 Adar; see `HolidayOptions.walledCity`. Default: `true` for a place with `walledCity`, else `false`. */
  walledCity?: boolean;
  /** Holiday options (optional days). */
  holidays?: Omit<HolidayOptions, 'israel'>;
  /** Tefillah customs. */
  tefilla?: Omit<TefillaOptions, 'israel'>;
  /**
   * Which zmanim to include: slots of the day, each by the user's opinion (`'shema'`), or
   * zman ids (`'sof-zman-shema-mga-72'`). Default: a common set (see {@link DEFAULT_DAY_ZMANIM});
   * every one is labelled with its opinion.
   */
  zmanim?: readonly (DaySlot | ZmanId)[];
  /**
   * The learning of the day (daf yomi and the other cycles): pass `dayLearning` from
   * `luach/learning`. Without it the day's `learning` is null, and the learning tables are not
   * part of your bundle.
   */
  learning?: DayLearningSource;
}

/**
 * The plug-in that fills a day's `learning`: `dayLearning` from `luach/learning`. Its `detail`,
 * when present, fills `learningDetail`.
 */
export type DayLearningSource = ((date: HebrewDate, locale: Locale) => DayLearning) & {
  readonly detail?: (date: HebrewDate, locale: Locale) => DayLearningDetail;
};

/**
 * One cycle's portion as data: the text shown in `learning`, the cycle, its number, the day within
 * it and its length; for daf yomi also the tractate and the daf.
 */
export interface LearningDetail {
  readonly text: string;
  readonly cycle: string;
  readonly cycleNumber: number;
  readonly day: number;
  readonly length: number;
  readonly tractate?: string;
  readonly tractateHe?: string;
  readonly daf?: number;
}

/** A day's learning as data, cycle by cycle (the same keys as {@link DayLearning}). */
export type DayLearningDetail = Readonly<Record<LearningCycleName, LearningDetail | null>>;

/** A day's learning, cycle by cycle: the name of the portion, or null when the cycle is not running that day. */
export type DayLearning = Readonly<Record<LearningCycleName, string | null>>;

/** The default zmanim in a day view: a widely used set, not a ruling. */
export const DEFAULT_DAY_ZMANIM = /*#__PURE__*/ deepFreeze([
  'alos-72', 'alos-16.1', 'misheyakir-11', 'sunrise', 'sof-zman-shema-mga-72', 'sof-zman-shema-gra', 'sof-zman-tefilla-gra',
  'chatzos', 'mincha-gedola-greater', 'mincha-ketana-gra', 'plag-hamincha-gra', 'sunset', 'tzeis-8.5', 'tzeis-rabbeinu-tam',
] as const satisfies readonly ZmanId[]);

/** The JSON for one day. */
export interface DayInfo {
  readonly $schema: string;
  readonly date: string;
  readonly weekday: number;
  readonly weekdayName: string;
  readonly hebrewDate: HebrewDateJson;
  readonly israel: boolean;
  readonly events: readonly EventJson[];
  /** The day is Shabbos. */
  readonly shabbos: boolean;
  /** One of the day's events is a Yom Tov where it is kept (Israel or the diaspora, as `israel`); Yom Kippur counts. */
  readonly yomTov: boolean;
  /** Melacha is forbidden on this day: Shabbos, Yom Tov or Yom Kippur. */
  readonly melachaForbidden: boolean;
  /** The day's fast: `'major'` (Yom Kippur, Tisha B'Av: from sunset), `'minor'` (from dawn), or null. */
  readonly fastKind: 'major' | 'minor' | null;
  /**
   * What the next day is, on every day, including a day that is itself Shabbos or Yom Tov:
   * `'shabbos'`, then `'yom-kippur'` or `'yom-tov'` (a Yom Tov on which melacha is forbidden, for
   * the day's Israel or diaspora setting). Usually empty. On a day that is not itself holy it says
   * what `erev` says; unlike `erev`, a Yom Tov followed by Shabbos (Shavuos on Friday) says so.
   */
  readonly followedBy: readonly ('shabbos' | 'yom-tov' | 'yom-kippur')[];
  /**
   * An eruv tavshilin is made today: the day is not itself Shabbos or Yom Tov, and the Yom Tov that
   * begins tonight runs into a Friday (Shulchan Aruch OC 527:1: Yom Tov on Erev Shabbos), whether
   * the Friday is its first or second day (Mishna Berura 527:1: it is made on the eve of the first
   * day). So Shavuos on Friday and Shabbos in the diaspora has one, made on Thursday. By the day's
   * Israel or diaspora setting.
   */
  readonly eruvTavshilin: boolean;
  /**
   * The eve of Shabbos and/or of a Yom Tov, as a fact about this civil day: the day is not itself
   * Shabbos or a Yom Tov on which melacha is forbidden (Yom Kippur counts), and the next day is
   * Shabbos (`erev-shabbos`) and/or such a Yom Tov for the day's Israel or diaspora setting
   * (`erev-yom-tov`). Both can apply, `erev-shabbos` first (a Friday before a Yom Tov that falls
   * on Shabbos). Usually empty. A day that is itself Shabbos or Yom Tov is always empty, even when
   * another holy day follows. It is not a claim about an instant: it says nothing about candle
   * lighting, which `candleLighting` gives. `name` is the `termName` in the caller's locale.
   * The eve of Yom Kippur has `erev-yom-kippur` only, never `erev-yom-tov` (the sources name that
   * day "Erev Yom Kippur"), named as the day's own event is; `erev-shabbos` still comes first when
   * Yom Kippur falls on Shabbos.
   */
  readonly erev: readonly { readonly id: 'erev-shabbos' | 'erev-yom-tov' | 'erev-yom-kippur'; readonly name: string }[];
  /** This week's reading (the Shabbos on or after this day). */
  /** The coming Shabbos's reading; null only in the last days of year 9999 (that Shabbos is in year 10000). */
  readonly parsha: { readonly date: string; readonly ids: readonly ParshaId[] | null; readonly name: string | null; readonly holiday?: string } | null;
  readonly haftara: { readonly key: string; readonly reference: string | null } | null;
  readonly omer: { readonly day: number; readonly text: string; readonly textEnglish: string; readonly sefirah: string } | null;
  readonly tefilla: TefillaDay;
  /** The learning of the day when `learning: dayLearning` was passed; otherwise null. */
  readonly learning: DayLearning | null;
  /** The same learning as data (cycle, day, tractate and daf) when the plug-in gives it; otherwise null. */
  readonly learningDetail: DayLearningDetail | null;
  readonly location: LocationJson | null;
  readonly zmanim: readonly ZmanJson[];
  readonly candleLighting: ZmanJson | null;
  /**
   * Havdala tonight. Null on the Shabbos before Tisha B'Av postponed to Sunday (see
   * `shabbosEnds`); on that Sunday it is havdala over a cup when the fast ends (SA OC 556:1).
   */
  readonly havdala: ZmanJson | null;
  /**
   * When Shabbos ends on a Shabbos whose havdala is deferred (Tisha B'Av postponed to Sunday):
   * melacha is permitted from then after saying "Baruch HaMavdil bein kodesh lechol"; it is
   * not havdala. Otherwise null.
   */
  readonly shabbosEnds: ZmanJson | null;
  /**
   * The fast of this day, or `null`. `beginsEvening` is true for a fast that begins the evening
   * before (Yom Kippur, Tisha B'Av), false for a minor fast, which begins at dawn.
   */
  readonly fast: { readonly id: string; readonly beginsEvening: boolean; readonly begins: ZmanJson; readonly ends: ZmanJson } | null;
  /** A fast that begins this evening at sunset (Yom Kippur, Tisha B'Av), or null. */
  readonly fastBeginsTonight: { readonly id: string; readonly begins: ZmanJson } | null;
}

const DAY_SLOTS: readonly string[] = ['alos', 'misheyakir', 'sunrise', 'shema', 'tefilla', 'chatzos', 'minchaGedola', 'minchaKetana', 'plag', 'sunset', 'tzeis'];

const HOLIDAY_KEYS = ['modernIsraeli', 'israeliCommemorations', 'behab', 'yomKippurKatan', 'yomKippurKatanOnFriday', 'yomKippurKatanCheshvan', 'shovavim', 'shabbosMevorchim', 'yizkor', 'walledCity'] as const;

function checkDayOptions(fn: string, options: DayInfoOptions): void {
  checkOptions(fn, options, dayInfoKeys(), DAY_ENUMS);
  if (options && typeof options === 'object') {
    checkOptions(`${fn} (holidays)`, options.holidays, HOLIDAY_OPTION_KEYS, DAY_ENUMS);
    checkOptions(`${fn} (tefilla)`, options.tefilla, tefillaKeys(), DAY_ENUMS);
  }
}

/**
 * Everything about `date`: a civil date, or a Hebrew date's daytime. A plain
 * `{ year, month, day }` is always read as a civil (Gregorian) date; for a Hebrew date pass a
 * `HebrewDate` (`new HebrewDate(5787, 9, 25)`). A `HebrewDate` from another copy of this
 * library is read as the same Hebrew date.
 */
export function dayInfo(date: CivilDate | HebrewDate, options: DayInfoOptions = {}): DayInfo {
  checkDayOptions('dayInfo', options);
  return dayInfoWith(hebrewOfDayArg(date, 'dayInfo'), options, {});
}

/** {@link dayInfo} for a Hebrew date, with the `Zmanim` of a range already built (internal). */
function dayInfoWith(h: HebrewDate, options: DayInfoOptions, shared: { z?: Zmanim }): DayInfo {
  if ('location' in options && (options.location === undefined || options.location === null)) throw new TypeError('location is undefined (getPlace returns undefined for an unknown id)');
  const civil = h.toCivil();
  const locale = options.locale ?? he;
  const israel = israelFor(options.israel, options.location);
  // The holiday options are `options.holidays`; the same keys given at the top level (as the
  // functions that take ZmanimOptions take them) are read too, so the day's events and its fast
  // can never follow different options.
  const flat: Record<string, unknown> = {};
  for (const k of HOLIDAY_KEYS) if ((options as Record<string, unknown>)[k] !== undefined) flat[k] = (options as Record<string, unknown>)[k];
  const hopts: HolidayOptions = { ...flat, ...options.holidays, israel };
  // Purim follows the place: an explicit choice wins, else a place that keeps 15 Adar does.
  hopts.walledCity ??= !!options.location?.walledCity;
  const events = holidaysOn(h, hopts);
  const reading = parshaFor(h, { israel });
  const haft = haftaraFor(h, { israel, minhag: options.minhag ?? 'ashkenaz' });
  const om = omerDay(h);
  // What the next day is. After 29 Elul 9999 (the last supported day) comes Rosh Hashana 10000,
  // always Yom Tov, on the weekday after this one.
  const followedBy: ('shabbos' | 'yom-tov' | 'yom-kippur')[] = [];
  if (h.epochDays >= MAX_DAYS) {
    if (h.dayOfWeek === 5) followedBy.push('shabbos');
    followedBy.push('yom-tov');
  } else {
    const n = h.next();
    const nev = holidaysOn(n, hopts);
    if (n.isShabbos) followedBy.push('shabbos');
    if (nev.some((e) => e.id === 'yom-kippur')) followedBy.push('yom-kippur');
    else if (forbidsMelacha(nev)) followedBy.push('yom-tov');
  }
  // The Yom Tov days (not Yom Kippur, on which nothing is cooked) that follow this day, and whether
  // one is a Friday. After 29 Elul 9999 comes Rosh Hashana 10000, two days, on the next weekdays.
  let eruvTavshilin = false;
  if (!isHolyDay(h, hopts, events)) {
    if (h.epochDays >= MAX_DAYS) eruvTavshilin = h.dayOfWeek === 3 || h.dayOfWeek === 4;
    else {
      const yomTov = (d: HebrewDate) => isYomTovNotKippur(holidaysOn(d, hopts));
      for (let d = h.next(); yomTov(d); d = d.next()) {
        if (d.dayOfWeek === 5) { eruvTavshilin = true; break; }
        if (d.epochDays >= MAX_DAYS) break;
      }
    }
  }
  // The eve of Shabbos or Yom Tov is what follows a day that is not itself holy. The eve of Yom
  // Kippur is named as itself, with the name of the day's own event, and is not also the eve of a
  // Yom Tov.
  const erev: { id: 'erev-shabbos' | 'erev-yom-tov' | 'erev-yom-kippur'; name: string }[] = [];
  if (!isHolyDay(h, hopts, events)) {
    // A day followed by Yom Kippur is 9 Tishrei, which always has its erev-yom-kippur event.
    for (const f of followedBy) {
      erev.push(f === 'yom-kippur'
        ? { id: 'erev-yom-kippur', name: holidayName(events.find((e) => e.id === 'erev-yom-kippur')!, locale) }
        : { id: `erev-${f}`, name: wordName(`erev-${f}`, locale) });
    }
  }
  const zj = (zm: Zman): ZmanJson => ({ ...zm.toJSON(), name: zmanName(zm.id as ZmanId, locale).full });
  const style = locale.base === 'he' ? 'he' : locale.base === 'sephardi' ? 'sephardi' : 'ashkenazi';

  let zmanim: ZmanJson[] = [];
  let candleLighting: ZmanJson | null = null;
  let havdala: ZmanJson | null = null;
  let shabbosEnds: ZmanJson | null = null;
  let fast: DayInfo['fast'] = null;
  let fastBeginsTonight: DayInfo['fastBeginsTonight'] = null;
  if (options.location) {
    const zopts = { ...options, ...hopts };
    const z = (shared.z ??= zmanimFor(options.location, zopts));
    const day = z.on(h);
    const names = options.zmanim ?? DEFAULT_DAY_ZMANIM;
    zmanim = names.map((n) => zj(DAY_SLOTS.includes(n) ? day.slot(n as DaySlot) : day.get(n as ZmanId)));
    const ft = fastTimesWith(h, options.location, zopts, z);
    if (ft) fast = { id: ft.fast.id, beginsEvening: ft.beginsEvening, begins: zj(ft.begins), ends: zj(ft.ends) };
    const next = h.epochDays < MAX_DAYS ? fastTimesWith(h.next(), options.location, zopts, z) : null;
    if (next && next.fast.flags.fast === 'major') fastBeginsTonight = { id: next.fast.id, begins: zj(next.begins) };
    const evening = eveningOf(h, options.location, zopts, { z, fast: ft, nextFast: next });
    candleLighting = evening.candles ? zj(evening.candles) : null;
    havdala = evening.havdala ? zj(evening.havdala) : null;
    shabbosEnds = evening.shabbosEnds ? zj(evening.shabbosEnds) : null;
  }

  return {
    $schema: DAY_INFO_SCHEMA_ID,
    date: formatIsoDate(civil),
    weekday: h.dayOfWeek,
    weekdayName: weekdayName(h.dayOfWeek, locale),
    hebrewDate: hebrewDateJson(h, locale),
    israel,
    events: events.map((e) => eventJson(e, locale)),
    shabbos: h.isShabbos,
    yomTov: events.some((e) => e.flags.yomTov),
    melachaForbidden: isHolyDay(h, hopts, events),
    fastKind: events.find((e) => e.flags.fast !== null)?.flags.fast ?? null,
    followedBy,
    eruvTavshilin,
    erev,
    parsha: reading
      ? {
          date: formatIsoDate(reading.date.toCivil()),
          ids: reading.parsha,
          name: parshaName(reading.parsha, locale),
          ...(reading.holiday ? { holiday: reading.holiday } : {}),
        }
      : null,
    haftara: haft ? { key: haft.key, reference: haft.reference } : null,
    omer: om ? { day: om, text: omerText(om, options.omerNusach ?? 'ashkenaz'), textEnglish: omerTextEnglish(om), sefirah: omerSefirah(om, style) } : null,
    tefilla: tefillaOn(h, { walledCity: hopts.walledCity, ...options.tefilla, israel }),
    learning: options.learning ? options.learning(h, locale) : null,
    learningDetail: options.learning?.detail ? options.learning.detail(h, locale) : null,
    location: options.location ? locationJson(options.location) : null,
    zmanim,
    candleLighting,
    havdala,
    shabbosEnds,
    fast,
    fastBeginsTonight,
  };
}

/** {@link dayInfo} for `count` consecutive days from `start`. */
export function dayInfoRange(start: CivilDate | HebrewDate, count: number, options: DayInfoOptions = {}): DayInfo[] {
  checkDayOptions('dayInfoRange', options);
  const h = hebrewOfDayArg(start, 'dayInfoRange');
  if (typeof count !== 'number') throw new TypeError(`dayInfoRange takes a number of days, not ${String(count)}: for the days from start to end, pass end.epochDays - start.epochDays + 1`);
  if (!Number.isInteger(count) || count < 0) throw new RangeError(`dayInfoRange takes a whole number of days, 0 or more, not ${count}`);
  const out: DayInfo[] = [];
  // One Zmanim for the whole range: the location and options are the same every day.
  const shared: { z?: Zmanim } = {};
  for (let i = 0; i < count; i++) out.push(dayInfoWith(h.addDays(i), options, shared));
  return out;
}
