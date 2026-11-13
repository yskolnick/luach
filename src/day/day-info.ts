/**
 * Everything about one day, as plain JSON: an app can render a whole day from one call.
 * The shape is described by `schema/day.schema.json` (also exported as
 * {@link DAY_INFO_SCHEMA_ID}).
 *
 * @packageDocumentation
 */

import { deepFreeze } from '../util/freeze.js';
import { israelFor } from '../places/israel.js';
import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { formatIsoDate, type CivilDate } from '../time/civil.js';
import { weekdayName } from '../text/format.js';
import { he } from '../locales/he.js';
import { wordName } from '../locales/terms.js';
import type { Locale } from '../locales/types.js';
import { holidaysOn } from '../holidays/holidays.js';
import type { HolidayOptions } from '../holidays/types.js';
import { omerDay, omerSefirah, omerText, omerTextEnglish } from '../holidays/omer.js';
import { tefillahOn, type TefillahDay, type TefillahOptions } from '../holidays/tefillah.js';
import { parshaFor, parshaName, type ParshaId } from '../parsha/parsha.js';
import { haftaraFor, type HaftaraMinhag } from '../parsha/haftara.js';
import type { DayLocation } from '../zmanim/day-location.js';
import { eveningOf } from './evening.js';
import { holidayName } from '../holidays/names.js';
import { eventJson, hebrewDateJson, locationJson, type EventJson, type HebrewDateJson, type LocationJson } from './json.js';
import { fastTimes, zmanimFor } from '../zmanim/day.js';
import { type ZmanId } from '../zmanim/opinions.js';
import type { Zman } from '../zmanim/zman.js';
import type { DaySlot, Opinions, ZmanimSettings } from '../zmanim/zmanim.js';
import { hebrewOfDayArg } from '../calendar/date-input.js';

/** `$id` of the JSON Schema for {@link DayInfo}. */
export const DAY_INFO_SCHEMA_ID = 'https://raw.githubusercontent.com/yskolnick/luach/v0.4.0/schema/day.schema.json';

export type { DayLocation };

/** Options for {@link dayInfo}. */
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
  /** Holiday options (optional days). */
  holidays?: Omit<HolidayOptions, 'israel'>;
  /** Tefillah customs. */
  tefillah?: Omit<TefillahOptions, 'israel'>;
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
export type DayLearningDetail = Readonly<Record<string, LearningDetail | null>>;

/** A day's learning, cycle by cycle: the name of the portion, or null when the cycle is not running that day. */
export type DayLearning = Readonly<Record<string, string | null>>;

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
  readonly tefillah: TefillahDay;
  /** The learning of the day when `learning: dayLearning` was passed; otherwise null. */
  readonly learning: DayLearning | null;
  /** The same learning as data (cycle, day, tractate and daf) when the plug-in gives it; otherwise null. */
  readonly learningDetail: DayLearningDetail | null;
  readonly location: LocationJson | null;
  readonly zmanim: readonly ReturnType<Zman['toJSON']>[];
  readonly candleLighting: ReturnType<Zman['toJSON']> | null;
  /**
   * Havdala tonight. Null on the Shabbos before Tisha B'Av postponed to Sunday (see
   * `shabbosEnds`); on that Sunday it is havdala over a cup when the fast ends (SA OC 556:1).
   */
  readonly havdala: ReturnType<Zman['toJSON']> | null;
  /**
   * When Shabbos ends on a Shabbos whose havdala is deferred (Tisha B'Av postponed to Sunday):
   * melacha is permitted from then after saying "Baruch HaMavdil bein kodesh lechol"; it is
   * not havdala. Otherwise null.
   */
  readonly shabbosEnds: ReturnType<Zman['toJSON']> | null;
  readonly fast: { readonly id: string; readonly begins: ReturnType<Zman['toJSON']>; readonly ends: ReturnType<Zman['toJSON']> } | null;
  /** A fast that begins this evening at sunset (Yom Kippur, Tisha B'Av), or null. */
  readonly fastBeginsTonight: { readonly id: string; readonly begins: ReturnType<Zman['toJSON']> } | null;
}

const DAY_SLOTS: readonly string[] = ['alos', 'misheyakir', 'sunrise', 'shema', 'tefilla', 'chatzos', 'minchaGedola', 'minchaKetana', 'plag', 'sunset', 'tzeis'];

const HOLIDAY_KEYS = ['modernIsraeli', 'israeliCommemorations', 'behab', 'yomKippurKatan', 'yomKippurKatanOnFriday', 'yomKippurKatanCheshvan', 'shovavim', 'shabbosMevorchim'] as const;

/**
 * Everything about `date`: a civil date, or a Hebrew date's daytime. A plain
 * `{ year, month, day }` is always read as a civil (Gregorian) date; for a Hebrew date pass a
 * `HebrewDate` (`new HebrewDate(5787, 9, 25)`). A `HebrewDate` from another copy of this
 * library is read as the same Hebrew date.
 */
export function dayInfo(date: CivilDate | HebrewDate, options: DayInfoOptions = {}): DayInfo {
  const h = hebrewOfDayArg(date, 'dayInfo');
  const civil = h.toCivil();
  const locale = options.locale ?? he;
  const israel = israelFor(options.israel, options.location);
  // The holiday options are `options.holidays`; the same keys given at the top level (as the
  // functions that take ZmanimOptions take them) are read too, so the day's events and its fast
  // can never follow different options.
  const flat: Record<string, unknown> = {};
  for (const k of HOLIDAY_KEYS) if ((options as Record<string, unknown>)[k] !== undefined) flat[k] = (options as Record<string, unknown>)[k];
  const hopts: HolidayOptions = { ...flat, ...options.holidays, israel };
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
    else if (nev.some((e) => e.flags.melachaForbidden)) followedBy.push('yom-tov');
  }
  const erev: { id: 'erev-shabbos' | 'erev-yom-tov' | 'erev-yom-kippur'; name: string }[] = [];
  if (!h.isShabbos && !events.some((e) => e.flags.melachaForbidden)) {
    // After 29 Elul 9999 (the last supported day) comes Rosh Hashana 10000, always Yom Tov.
    const last = h.epochDays >= MAX_DAYS;
    const next = last ? null : h.next();
    if (next?.isShabbos) erev.push({ id: 'erev-shabbos', name: wordName('erev-shabbos', locale) });
    // The eve of Yom Kippur is named as itself, with the name of the day's own event, and is not
    // also the eve of a Yom Tov.
    const yk = events.find((e) => e.id === 'erev-yom-kippur');
    if (yk) erev.push({ id: 'erev-yom-kippur', name: holidayName(yk, locale) });
    else if (last || holidaysOn(next!, hopts).some((e) => e.flags.melachaForbidden)) erev.push({ id: 'erev-yom-tov', name: wordName('erev-yom-tov', locale) });
  }
  const style = locale.base === 'he' ? 'he' : locale.base === 'sephardi' ? 'sephardi' : 'ashkenazi';

  let zmanim: ReturnType<Zman['toJSON']>[] = [];
  let candleLighting: ReturnType<Zman['toJSON']> | null = null;
  let havdala: ReturnType<Zman['toJSON']> | null = null;
  let shabbosEnds: ReturnType<Zman['toJSON']> | null = null;
  let fast: DayInfo['fast'] = null;
  let fastBeginsTonight: DayInfo['fastBeginsTonight'] = null;
  if (options.location) {
    const zopts = { ...options, ...hopts };
    const z = zmanimFor(options.location, zopts);
    const day = z.on(h);
    const names = options.zmanim ?? DEFAULT_DAY_ZMANIM;
    zmanim = names.map((n) => (DAY_SLOTS.includes(n) ? day.slot(n as DaySlot) : day.get(n as ZmanId)).toJSON());
    const ft = fastTimes(h, options.location, zopts);
    if (ft) fast = { id: ft.fast.id, begins: ft.begins.toJSON(), ends: ft.ends.toJSON() };
    const next = h.epochDays < MAX_DAYS ? fastTimes(h.next(), options.location, zopts) : null;
    if (next && next.fast.flags.fast === 'major') fastBeginsTonight = { id: next.fast.id, begins: next.begins.toJSON() };
    const evening = eveningOf(h, options.location, zopts);
    candleLighting = evening.candles?.toJSON() ?? null;
    havdala = evening.havdala?.toJSON() ?? null;
    shabbosEnds = evening.shabbosEnds?.toJSON() ?? null;
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
    melachaForbidden: h.isShabbos || events.some((e) => e.flags.melachaForbidden),
    fastKind: events.find((e) => e.flags.fast !== null)?.flags.fast ?? null,
    followedBy,
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
    omer: om ? { day: om, text: omerText(om), textEnglish: omerTextEnglish(om), sefirah: omerSefirah(om, style) } : null,
    tefillah: tefillahOn(h, { ...options.tefillah, israel }),
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
  const h = hebrewOfDayArg(start, 'dayInfoRange');
  if (typeof count !== 'number') throw new TypeError(`dayInfoRange takes a number of days, not ${String(count)}: for the days from start to end, pass end.epochDays - start.epochDays + 1`);
  if (!Number.isInteger(count) || count < 0) throw new RangeError(`dayInfoRange takes a whole number of days, 0 or more, not ${count}`);
  const out: DayInfo[] = [];
  for (let i = 0; i < count; i++) out.push(dayInfo(h.addDays(i), options));
  return out;
}
