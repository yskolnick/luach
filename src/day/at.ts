/**
 * The questions asked at an instant, answered from what Luach already computes: the
 * Hebrew date and its boundaries, the fast of the day, the night of a date, Kiddush Levana for
 * a month, the run of days on which melacha is forbidden, and the times in a range.
 *
 * Every function takes `(instant, location, options)`. Each state compares the instant with a
 * boundary's exact time (`Zman.exact`), as {@link hebrewDateAt} does. The displayed time
 * (`Zman.time`) is rounded to the minute on the safe side, so in the seconds between the two a
 * state can change before the time it shows; `Zman.remaining` counts
 * to the displayed time. Luach's dates end at 29 Elul 9999: a function whose answer would need a
 * later date throws a `RangeError`, as `HebrewDate` does for any date out of range.
 *
 * @packageDocumentation
 */

import { zonedInstant, zonedParts } from '../time/zoned.js';
import { civilToDays, daysToCivil, type CivilDate } from '../time/civil.js';
import { civilDateAt } from '../time/zone.js';
import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS, monthLength } from '../calendar/year.js';
import { holidaysOn } from '../holidays/holidays.js';
import { omerDay } from '../holidays/omer.js';
import { kiddushLevana, moladInstant, type KiddushLevanaTime } from '../holidays/seasonal.js';
import type { HolidayEvent } from '../holidays/types.js';
import { israelFor } from '../places/israel.js';
import { eveningOf } from './evening.js';
import { fastTimes, zmanimFor, type ChanukahCustom, type ZmanimOptions } from '../zmanim/day.js';
import type { ZmanId } from '../zmanim/opinions.js';
import type { DaySlot, Role, Zmanim, ZmanimDay } from '../zmanim/zmanim.js';
import type { DayLocation } from '../zmanim/day-location.js';
import type { Zman } from '../zmanim/zman.js';
import { hebrewDateArg, instantArg } from '../calendar/date-input.js';

/** A civil date as a day number, for comparing and counting days. */
const dayNumber = (c: CivilDate): number => civilToDays(c.year, c.month, c.day);

/** The Hebrew date at an instant at a place, with the civil date there and the boundaries that began and end it. */
export interface HebrewDateSpan {
  /** The Hebrew date by the `dayBoundary` opinion: always {@link hebrewDateAt} with the same arguments. */
  readonly date: HebrewDate;
  /** The civil date on the place's clock at the instant. */
  readonly civil: CivilDate;
  /** The `dayBoundary` time on the evening this Hebrew date began. `time` is null where it did not occur; the date then began at civil midnight, which Luach does not give as a time. */
  readonly begins: Zman;
  /** The `dayBoundary` time on the evening this Hebrew date ends. `time` is null where it does not occur; the date then ends at civil midnight. */
  readonly ends: Zman;
}

/**
 * The Hebrew date at `instant` at the place, and the boundaries on either side. The boundary is the
 * `dayBoundary` opinion (default sunset: a default, not a ruling); the date changes at its exact
 * time, as {@link hebrewDateAt}, while `ends.time` and `ends.remaining()` give the displayed minute.
 * Between sunset and nightfall the halachic date is in doubt; choose the boundary that suits the
 * question. Ask your rav.
 */
export function hebrewDateSpanAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): HebrewDateSpan {
  instant = instantArg(instant, 'hebrewDateSpanAt');
  const z = zmanimFor(location, options);
  const date = z.hebrewDateAt(instant);
  const p = zonedParts(instant, location.timeZone);
  // The date began on the evening before its daytime, and ends on the evening of its daytime.
  // Both are looked up by the date, so a boundary that falls after local midnight (far north in
  // summer) is the one that the date itself changed at.
  return Object.freeze({
    date,
    civil: Object.freeze({ year: p.year, month: p.month, day: p.day }),
    begins: z.on(date.prev()).slot('dayBoundary'),
    ends: z.on(date).slot('dayBoundary'),
  });
}

/** A fast and where an instant stands in it (see {@link fastAt}). */
export interface FastAt {
  readonly fast: HolidayEvent;
  /** The Hebrew date of the fast. */
  readonly date: HebrewDate;
  /** As {@link fastTimes}: the `fastBegins` opinion for a minor fast, sunset the evening before for Yom Kippur and Tisha B'Av. */
  readonly begins: Zman;
  /** As {@link fastTimes}: the `fastEnds` opinion. */
  readonly ends: Zman;
  /**
   * From `begins` until `ends` (exact times): true; before or after: false; null where the answer
   * needs a time that does not occur. Where `ends` does not occur (no nightfall far north), true
   * from `begins` until the fast day's sunset, then null until the end of the civil day after the
   * fast day, as {@link melachaRunAt} keeps a run; Luach gives no time at which such a fast ends.
   */
  readonly inProgress: boolean | null;
}

/**
 * The fast of the place's today or tomorrow, by its clock: the one in progress at `instant` (or
 * whose state is unknown), else the next to begin, else today's that has ended. `null` when
 * neither day is a fast day. A fast of the day before whose end falls after local midnight
 * (far north in summer), or whose end does not occur, is also found while it may still be on. Compare `instant` with
 * `begins` and `ends` to tell "ahead" from "over".
 */
export function fastAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): FastAt | null {
  instant = instantArg(instant, 'fastAt');
  const t = instant.getTime();
  // The Hebrew dates whose daytimes are the place's civil today and civil tomorrow. The day
  // after 29 Elul 9999 is Rosh Hashana, never a fast, so it is left out rather than needed.
  const p = zonedParts(instant, location.timeZone);
  const today = HebrewDate.fromCivil(p);
  const dates = [today, ...(today.epochDays < MAX_DAYS ? [today.next()] : [])];
  const z = zmanimFor(location, options);
  // Where the fast's end does not occur (no nightfall far north), the fast is still certainly on
  // from its start until the fast day's sunset; after that Luach has no time, so the state is
  // unknown until the end of the civil day after the fast day, as melachaRunAt keeps a run.
  const state = (date: HebrewDate, begins: Zman, ends: Zman): boolean | null => {
    // Exact times, as the other states compare: the displayed minute is rounded on the safe side.
    if (begins.exact !== null && t < begins.exact.getTime()) return false;
    if (ends.exact !== null) {
      if (t >= ends.exact.getTime()) return false;
      return begins.exact !== null ? true : null;
    }
    if (zonedInstant(daysToCivil(dayNumber(date.toCivil()) + 2), location.timeZone).getTime() <= t) return false;
    if (begins.exact === null) return null;
    const sunset = lastDaySunset(z, date);
    return sunset !== null && t < sunset.getTime() ? true : null;
  };
  const found: FastAt[] = [];
  for (const date of dates) {
    const f = fastTimes(date, location, options);
    if (f) found.push(Object.freeze({ fast: f.fast, date, begins: f.begins, ends: f.ends, inProgress: state(date, f.begins, f.ends) }));
  }
  // Yesterday's fast, where it may still be on: its end falls after local midnight here (far north
  // in summer), or its end does not occur, or its start is unknown.
  const yesterday = fastTimes(today.prev(), location, options);
  if (yesterday && state(today.prev(), yesterday.begins, yesterday.ends) !== false) {
    found.unshift(Object.freeze({ fast: yesterday.fast, date: today.prev(), begins: yesterday.begins, ends: yesterday.ends, inProgress: state(today.prev(), yesterday.begins, yesterday.ends) }));
  }
  const notBegun = found.filter((f) => f.begins.exact !== null && f.begins.exact.getTime() > t);
  return (
    found.find((f) => f.inProgress === true) ??
    found.find((f) => f.inProgress === null) ??
    notBegun.sort((a, b) => a.begins.exact!.getTime() - b.begins.exact!.getTime())[0] ??
    found.find((f) => f.date.equals(today)) ??
    null
  );
}

/** One night: the evening that begins `date`, to the morning of `date`. */
export interface Night {
  /** The Hebrew date the night begins. Its daytime is `date.toCivil()`; its evening is the civil day before. */
  readonly date: HebrewDate;
  /** The evening's sunset (the `sunset` opinion). */
  readonly sunset: Zman;
  /** The evening's nightfall (the `tzeis` opinion). */
  readonly tzeis: Zman;
  /** The morning's dawn (the `alos` opinion). */
  readonly alos: Zman;
  /** The morning's sunrise (the `sunrise` opinion). */
  readonly sunrise: Zman;
  /** `date` is Shabbos. */
  readonly shabbos: boolean;
  /** The events of `date`, by the options (Israel or the diaspora). */
  readonly events: readonly HolidayEvent[];
  /** The Omer day counted on this night (`omerDay(date)`), or null. */
  readonly omer: number | null;
  /**
   * The Chanukah lights lit on this evening (1-8), or null. Note: the events of `date` give the
   * lights of the *next* evening (`candlesTonight`); on the night of 25 Kislev this is 1 and the
   * event of 25 Kislev says 2.
   */
  readonly chanukahLights: number | null;
  /** Shabbos or Yom Tov candles lit on this evening, as the day view gives them, or null. */
  readonly candles: Zman | null;
  /** The end of Shabbos or Yom Tov on this evening (`havdala`, or `shabbos-ends-no-havdala` before Tisha B'Av postponed), or null. */
  readonly ends: Zman | null;
  /** Havdala said on this evening (`havdala`, or `havdala-after-fast` when Tisha B'Av postponed ends), or null. */
  readonly havdala: Zman | null;
  /** When to light the Chanukah lights this evening, by custom (see {@link ChanukahLighting}); null when `chanukahLights` is null. */
  readonly chanukahLighting: ChanukahLighting | null;
}

/**
 * The earliest time to light the Chanukah lights on one evening, by custom: a composition of
 * times Luach already computes, with no new number. Luach rules on none: when the caller chooses
 * no custom, a weekday evening follows nightfall as a default (`isDefault` is then true), which
 * the caller changes with the `chanukahLighting` option; whether to light at sunset or at
 * nightfall, and whether on Motzaei Shabbos the lights or havdala come first, are for the
 * household's rav. The lights are lit for about half an hour
 * from the earliest time (Shulchan Aruch OC 672:2: "about half an hour"), which is not turned
 * into a clock time here.
 */
export interface ChanukahLighting {
  /** How many lights this evening (1-8): `Night.chanukahLights`. */
  readonly lights: number;
  /** Friday (`'erev-shabbos'`), Saturday night (`'motzaei-shabbos'`) or any other evening. */
  readonly evening: 'weekday' | 'erev-shabbos' | 'motzaei-shabbos';
  /** The custom in force: the caller's `chanukahLighting`, or nightfall (`'tzeis'`) when none is chosen. */
  readonly custom: ChanukahCustom;
  /** True when the caller chose no custom, so `custom` is Luach's default; false when the caller chose it. */
  readonly isDefault: boolean;
  /** Every custom Luach offers for the earliest time this evening, each with its opinion and source. */
  readonly customs: readonly { readonly id: ChanukahCustom; readonly earliest: Zman; readonly opinion: string; readonly source: string }[];
  /**
   * The earliest time by the custom in force (`custom`): on a weekday evening the time of that
   * custom; on Erev Shabbos and Motzaei Shabbos every custom gives the same one.
   */
  readonly earliest: Zman | null;
  /**
   * Erev Shabbos: the Shabbos candle lighting, which the Chanukah lights come before. Where the
   * caller's plag falls after it (a long candle-lighting custom with a late plag opinion) both
   * times are given as they are, and Luach decides nothing. Otherwise null.
   */
  readonly before: Zman | null;
  /** Dawn of the morning after (the `alos` opinion): the lights may be lit all night, until dawn (Rema OC 672:2; Mishna Berura 672:11, with the berachah while the household is awake). */
  readonly until: Zman;
}

/** The custom a weekday evening follows when the caller chooses none. */
const CHANUKAH_DEFAULT: ChanukahCustom = 'tzeis';
const SUNSET_CUSTOM = { opinion: 'From sunset', source: 'Rambam, Hilchos Megillah vChanukah 4:5; Beur HaGra OC 672:1' } as const;
const TZEIS_CUSTOM = { opinion: "From nightfall: 'the end of sunset', explained as when the stars come out", source: 'Shulchan Aruch OC 672:1; Mishna Berura 672:1' } as const;
const EREV_SHABBOS_CUSTOM = { opinion: 'On Erev Shabbos before the Shabbos candles, from plag hamincha by the caller\'s plag opinion, with enough oil to burn until half an hour after the stars come out', source: 'Shulchan Aruch OC 679:1; Mishna Berura 679:2, which reckons plag hamincha as an hour and a quarter before nightfall (672:3)' } as const;
const MOTZAEI_SHABBOS_CUSTOM = { opinion: 'On Motzaei Shabbos after Shabbos ends; whether havdala or the Chanukah lights come first is a custom Luach does not choose', source: 'Shulchan Aruch and Rema OC 681:2 (the lights first); Taz, cited in Mishna Berura 681:3 (havdala first)' } as const;

/**
 * The night that begins `date` at the place: its sunset, nightfall, dawn and sunrise by the user's
 * opinions, and what belongs to it. It does not say when the night begins or ends for any mitzvah:
 * whether a count is said before nightfall, whether a night ends at dawn or at sunrise, and how
 * Motzaei Shabbos affects the count are the caller's choice. Ask your rav.
 */
export function nightOf(date: HebrewDate, location: DayLocation, options: ZmanimOptions = {}): Night {
  date = hebrewDateArg(date, 'nightOf');
  const z = zmanimFor(location, options);
  const eve = date.prev();
  const evening = z.on(eve);
  const morning = z.on(date);
  // The events of `date` itself; the lights of this evening are those the eve's event announces.
  const events = holidaysOn(date, { ...options, israel: israelFor(options.israel, location) });
  const lights = holidaysOn(eve, { ...options, israel: israelFor(options.israel, location) }).find((e) => e.id === 'erev-chanukah' || e.id === 'chanukah')?.candlesTonight;
  const e = eveningOf(eve, location, options);
  const ends = e.shabbosEnds ?? (e.havdala?.id === 'havdala' ? e.havdala : null);
  return Object.freeze({
    date,
    sunset: evening.slot('sunset'),
    tzeis: evening.slot('tzeis'),
    alos: morning.slot('alos'),
    sunrise: morning.slot('sunrise'),
    shabbos: date.isShabbos,
    events: Object.freeze(events),
    omer: omerDay(date),
    // After the eighth day the event says 0: no more lights, which is no lights here.
    chanukahLights: lights ? lights : null,
    candles: e.candles,
    // The end of Shabbos or Yom Tov on this evening: the havdala, or, before a postponed Tisha B'Av, the end of Shabbos without havdala.
    ends,
    havdala: e.havdala,
    chanukahLighting: lights ? chanukahLightingOf(lights, eve, evening, e.candles, ends, morning.slot('alos'), options.chanukahLighting) : null,
  });
}

/** The Chanukah lighting of one evening, from the times `nightOf` already has. Never throws: a time that does not occur is the slot's own null Zman, with its reason. */
function chanukahLightingOf(lights: number, eve: HebrewDate, evening: ZmanimDay, candles: Zman | null, ends: Zman | null, until: Zman, chosen: ChanukahCustom | undefined): ChanukahLighting {
  // Luach's default is nightfall, the reading of "the end of sunset" in Shulchan Aruch OC 672:1 as Mishna Berura 672:1 explains it; a default, not a ruling.
  const custom: ChanukahCustom = chosen ?? CHANUKAH_DEFAULT;
  const isDefault = chosen === undefined;
  const both = (earliest: Zman, c: { readonly opinion: string; readonly source: string }): ChanukahLighting['customs'] =>
    Object.freeze((['sunset', 'tzeis'] as const).map((id) => Object.freeze({ id, earliest, opinion: c.opinion, source: c.source })));
  // Chanukah never falls on Yom Tov, so the only special evenings are Friday and Saturday night.
  if (eve.isShabbos) {
    // Where the end of Shabbos has no time, the havdala slot says why.
    const earliest = ends ?? evening.slot('havdala');
    return Object.freeze({ lights, evening: 'motzaei-shabbos', custom, isDefault, customs: both(earliest, MOTZAEI_SHABBOS_CUSTOM), earliest, before: null, until });
  }
  if (eve.next().isShabbos) {
    const earliest = evening.slot('plag');
    return Object.freeze({ lights, evening: 'erev-shabbos', custom, isDefault, customs: both(earliest, EREV_SHABBOS_CUSTOM), earliest, before: candles ?? evening.get('candle-lighting'), until });
  }
  const sunset = evening.slot('sunset');
  const tzeis = evening.slot('tzeis');
  const customs = Object.freeze([
    Object.freeze({ id: 'sunset' as const, earliest: sunset, ...SUNSET_CUSTOM }),
    Object.freeze({ id: 'tzeis' as const, earliest: tzeis, ...TZEIS_CUSTOM }),
  ]);
  return Object.freeze({ lights, evening: 'weekday', custom, isDefault, customs, earliest: custom === 'sunset' ? sunset : tzeis, before: null, until });
}

/** Kiddush Levana for one month at a place (see {@link kiddushLevanaAt}). */
export interface KiddushLevanaAt {
  readonly year: number;
  readonly month: number;
  /** The molad, as {@link moladInstant}. */
  readonly molad: Date;
  /** As {@link kiddushLevana}: every opinion it has, none chosen. */
  readonly earliest: { readonly threeDays: KiddushLevanaTime; readonly sevenDays: KiddushLevanaTime };
  readonly latest: { readonly halfMonth: KiddushLevanaTime; readonly fifteenDays: KiddushLevanaTime };
  /**
   * Every night, as {@link nightOf} gives it, whose span from sunset to sunrise overlaps the span
   * from the earliest of the earliest times to the latest of the latest. Where a night's sunset or
   * sunrise does not occur, its span is its two civil dates.
   */
  readonly nights: readonly Night[];
}

/**
 * Kiddush Levana for the month whose latest time (by the latest opinion) has not passed at
 * `instant`: this month's, or the next once it has. Which opinion to follow, and whether it is
 * said on a night that is Shabbos or Yom Tov, at night only, or on Motzaei Shabbos, is not
 * modelled here; each night says whether it is Shabbos and what its events are. Ask your rav.
 * Throws a RangeError if the month would be Tishrei of year 10000, past the last supported date.
 */
export function kiddushLevanaAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): KiddushLevanaAt {
  instant = instantArg(instant, 'kiddushLevanaAt');
  const t = instant.getTime();
  const here = zmanimFor(location, options).hebrewDateAt(instant);
  let year = here.year;
  let month: number = here.month;
  let k = kiddushLevana(year, month);
  const latestOf = (x: typeof k) => Math.max(x.latest.halfMonth.time.getTime(), x.latest.fifteenDays.time.getTime());
  // The current month's window has closed at its latest time (the later of the opinions, which
  // are all that Luach has): the next month's is the one to prepare. The first of the next month
  // is a month's length on from the first of this one; past 29 Elul 9999 that is out of range.
  if (latestOf(k) <= t) {
    const next = new HebrewDate(year, here.month, 1).addDays(monthLength(year, here.month));
    year = next.year;
    month = next.month;
    k = kiddushLevana(year, month);
  }
  const lo = Math.min(k.earliest.threeDays.time.getTime(), k.earliest.sevenDays.time.getTime());
  const hi = latestOf(k);
  // A night begins on the evening before its date's daytime and ends on that morning, so a
  // night that overlaps [lo, hi) belongs to a date whose civil day is no earlier than the civil
  // day of lo and no later than the one after hi's. One more day either side is looked at, and
  // each night is kept only if its own span overlaps the window.
  const tz = location.timeZone;
  const first = dayNumber(civilDateAt(lo, tz)) - 1;
  const last = dayNumber(civilDateAt(hi, tz)) + 2;
  const nights: Night[] = [];
  for (let n = first; n <= last; n++) {
    const night = nightOf(HebrewDate.fromCivil(daysToCivil(n)), location, options);
    // The span is sunset to sunrise (exact); where either does not occur, the civil dates of the
    // evening and of the morning.
    const eve = night.date.prev().toCivil();
    const day = night.date.toCivil();
    const start = night.sunset.exact?.getTime() ?? zonedInstant(eve, tz).getTime();
    const end = night.sunrise.exact?.getTime() ?? zonedInstant(daysToCivil(dayNumber(day) + 1), tz).getTime();
    if (start < hi && end > lo) nights.push(night);
  }
  return Object.freeze({
    year,
    month,
    molad: moladInstant(year, month),
    earliest: Object.freeze({ threeDays: Object.freeze(k.earliest.threeDays), sevenDays: Object.freeze(k.earliest.sevenDays) }),
    latest: Object.freeze({ halfMonth: Object.freeze(k.latest.halfMonth), fifteenDays: Object.freeze(k.latest.fifteenDays) }),
    nights: Object.freeze(nights),
  });
}

/** One time from {@link timesBetween}: the zman, and the Hebrew date whose day view gives it. */
export interface DatedZman {
  readonly zman: Zman;
  readonly date: HebrewDate;
}

/**
 * Every time in `[from, to)` in time order: the zmanim in `which` (slots, roles or ids, as
 * {@link Zmanim.between} takes them; default every slot of {@link Zmanim.order}; `[]` for none),
 * and the calendar's own times as the day view gives them: candle lighting, havdala or the end of
 * Shabbos, a fast's start and end. Times that do not occur are left out. Each `Zman`'s id says
 * what it is; `date` says which day's (which fast, which Shabbos). The range is compared with the
 * exact times (`Zman.exact`). The calendar's times are always included, so `which` takes only
 * the day's zmanim: a calendar choice or id in it (`'havdala'`, `'candle-lighting'`) throws a
 * RangeError, as in {@link Zmanim.between}. Throws a RangeError for a range that needs a date past
 * 29 Elul 9999.
 */
export function timesBetween(
  from: Date,
  to: Date,
  location: DayLocation,
  options: ZmanimOptions & { readonly which?: DaySlot | Role | ZmanId | readonly (DaySlot | Role | ZmanId)[] } = {},
): readonly DatedZman[] {
  from = instantArg(from, 'timesBetween');
  to = instantArg(to, 'timesBetween');
  const { which, ...zopts } = options;
  const a = from.getTime();
  const b = to.getTime();
  const tz = location.timeZone;
  const z = zmanimFor(location, zopts);
  const firstDay = dayNumber(civilDateAt(a, tz));
  const lastDay = dayNumber(civilDateAt(b, tz));
  const inRange = (zman: Zman | null): zman is Zman => zman !== null && zman.exact !== null && zman.exact.getTime() >= a && zman.exact.getTime() < b;
  const found: { zman: Zman; day: number }[] = [];
  // A time belongs to the day view of the civil day it is computed for, which can be a day
  // before or after the one it falls on: an after-midnight havdala or end of a fast at high
  // latitudes, a major fast's start at the sunset before its date. One day either side covers both.
  for (let k = firstDay - 1; k <= lastDay + 1; k++) {
    const civil = daysToCivil(k);
    for (const zman of z.dayTimes(civil, which)) if (inRange(zman)) found.push({ zman, day: k });
    // The extra days at either end may lie outside the supported dates, where no time can be wanted.
    const date = hebrewOn(k, k < firstDay || k > lastDay);
    if (date === null) continue;
    const evening = eveningOf(date, location, zopts);
    const fast = fastTimes(date, location, zopts);
    for (const zman of [evening.candles, evening.havdala, evening.shabbosEnds, fast?.begins ?? null, fast?.ends ?? null]) {
      if (inRange(zman)) found.push({ zman, day: k });
    }
  }
  // The same time found twice (the same id at the same instant) is one time.
  const seen = new Set<string>();
  const out: DatedZman[] = [];
  for (const { zman, day } of found.sort((x, y) => x.zman.exact!.getTime() - y.zman.exact!.getTime())) {
    const key = `${zman.id}@${zman.exact!.getTime()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(Object.freeze({ zman, date: hebrewOn(day, false)! }));
  }
  return Object.freeze(out);
}

/**
 * The sunset of a run's last day, by the exact time: the instant before which that day has not
 * ended (far north it can fall after local midnight), which {@link melachaRunAt} decides its
 * state by. Internal.
 * @internal
 */
export function lastDaySunset(z: Zmanim, lastDay: HebrewDate): Date | null {
  return z.on(lastDay).get('sunset').exact;
}

/** The Hebrew date whose daytime is the civil day number `k`; null, if `edge` and out of range. */
function hebrewOn(k: number, edge: boolean): HebrewDate | null {
  try {
    return HebrewDate.fromCivil(daysToCivil(k));
  } catch (e) {
    if (edge && e instanceof RangeError) return null;
    throw e;
  }
}

/** One day of a {@link MelachaRun}. */
export interface MelachaRunDay {
  readonly date: HebrewDate;
  readonly shabbos: boolean;
  /** Every event of the day (Yom Tov, Rosh Chodesh, Chanukah, ...), by the options. */
  readonly events: readonly HolidayEvent[];
  /**
   * The candles that begin this day, lit the evening before, as the day view gives them: before
   * sunset (`candle-lighting`, by the caller's minutes or the place's custom), or after nightfall
   * from an existing flame for a Yom Tov after Shabbos or after Yom Tov
   * (`candle-lighting-second-night`).
   */
  readonly candles: Zman;
}

/** Consecutive days on which melacha is forbidden (Shabbos, Yom Tov, Yom Kippur). */
export interface MelachaRun {
  /**
   * Melacha is forbidden at the instant asked about: from `begins` until `ends` (exact times).
   * Where `isMelachaForbiddenAt` gives an answer that rests only on times that occur, this is
   * that answer. `null` exactly when the answer depends on a time that does not occur:
   * on the eve's civil date when `begins` does not occur; after the last day's sunset when `ends`
   * does not occur, through the end of the civil day after the last day; and on the last day's
   * civil date when its sunset does not occur (whether or not `ends` occurs).
   */
  readonly inProgress: boolean | null;
  /** The day before the first day, and its events (Erev Pesach, ...). */
  readonly eve: { readonly date: HebrewDate; readonly events: readonly HolidayEvent[] };
  readonly days: readonly MelachaRunDay[];
  /**
   * What the run holds, in this order: `'shabbos'` if a day is Shabbos, `'yom-tov'` if a day is a
   * Yom Tov other than Yom Kippur, `'yom-kippur'` if a day is Yom Kippur. So an app can say
   * "Shabbos and Yom Tov end tomorrow night".
   */
  readonly kinds: readonly ('shabbos' | 'yom-tov' | 'yom-kippur')[];
  /** `days[0].candles`. */
  readonly begins: Zman;
  /** The end, on the evening of the last day: the `havdala` opinion (`havdala`, or `shabbos-ends-no-havdala` before Tisha B'Av postponed). `time` is null where it does not occur. */
  readonly ends: Zman;
}

/**
 * The run of consecutive days on which melacha is forbidden that is in progress at `instant`, or
 * else the next to begin. A run whose `ends` does not occur stays the current run until the end
 * of the civil day after its last day (where a havdala time at that latitude would fall), with
 * `inProgress` null after the last day's sunset; Luach gives no time at which it ends. A caller who
 * sets `highLatitudeFallback` gets that rule's time instead, marked in `Zman.fallback`. Israel or
 * the diaspora as in {@link isMelachaForbiddenAt}. Throws a RangeError if the run would begin
 * after 29 Elul 9999.
 */
export function melachaRunAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): MelachaRun {
  instant = instantArg(instant, 'melachaRunAt');
  const tz = location.timeZone;
  const t = instant.getTime();
  const n = dayNumber(civilDateAt(t, tz));
  const hopts = { ...options, israel: israelFor(options.israel, location) };
  const hebrew = (k: number): HebrewDate => HebrewDate.fromCivil(daysToCivil(k));
  // Shabbos, or a day on which the holidays forbid melacha: the same as isMelachaForbiddenAt.
  // A day past 29 Elul 9999 cannot be built and throws a RangeError, which is the answer.
  const holy = (k: number): boolean => {
    const d = hebrew(k);
    return d.isShabbos || holidaysOn(d, hopts).some((e) => e.flags.melachaForbidden);
  };
  // Where to look. A run that is current at `instant` began at most on the civil day after it
  // (its candles are lit the evening before, or after midnight at high latitudes) and ended no
  // earlier than two civil days before (a havdala time can fall after midnight): start two days
  // back, and back up while the day before is also holy so that the run is whole. Shabbos
  // comes every seven days, so a run begins within the next seven; one more is a margin.
  let k = n - 2;
  while (holy(k - 1)) k--;
  const limit = n + 8;
  const z = zmanimFor(location, options);
  for (; k <= limit; k++) {
    if (!holy(k)) continue;
    let last = k;
    while (holy(last + 1)) last++;
    // The window of a run ends before the start of the second civil day after its last day
    // (see below), so a run that ended before that is past without looking at its times.
    if (last + 2 <= n) { k = last; continue; }
    const first = hebrew(k);
    const eve = first.prev();
    const days: MelachaRunDay[] = [];
    for (let d = k; d <= last; d++) {
      const date = hebrew(d);
      const candles = eveningOf(date.prev(), location, options).candles;
      // Every holy day follows an evening with candles (the day view gives them), so a missing
      // one is a fault in Luach, never a state to answer with.
      if (candles === null) throw new Error(`No candles for the evening before ${date.toString()}: this is a bug in Luach`);
      days.push(Object.freeze({ date, shabbos: date.isShabbos, events: Object.freeze(holidaysOn(date, hopts)), candles }));
    }
    const lastDay = days[days.length - 1]!.date;
    const evening = eveningOf(lastDay, location, options);
    const ends = evening.shabbosEnds ?? evening.havdala;
    if (ends === null || (ends.id !== 'havdala' && ends.id !== 'shabbos-ends-no-havdala')) {
      throw new Error(`No end for the evening of ${lastDay.toString()}: this is a bug in Luach`);
    }
    // The exact times, as the other states compare (the displayed minute is rounded on the safe side).
    const begins = days[0]!.candles;
    const B = begins.exact?.getTime() ?? null;
    const E = ends.exact?.getTime() ?? null;
    const S = lastDaySunset(z, lastDay)?.getTime() ?? null;
    // The run is "current" from its candles, or from the start of the eve's civil day where they
    // do not occur, to its end, or to the end of the civil day after its last day where that
    // does not occur. The run asked for is the first whose window has not closed at `instant`.
    // Without a sunset on the last day the end of the day is in doubt: the run stays current until
    // that civil day has ended, when both the havdala time (where it occurs) and the civil day
    // have passed. Where the havdala time does not occur either, until the civil day after.
    const windowEnd = E !== null && S !== null ? E : zonedInstant(daysToCivil(last + (E === null ? 2 : 1)), tz).getTime();
    if (t >= windowEnd) { k = last; continue; }
    const eveDay = k - 1;
    const started = B !== null ? t >= B : n >= k ? true : n < eveDay ? false : null;
    // Before the last day's sunset (which far north can fall after midnight) the day has not ended.
    const notEnded = E !== null && S !== null ? t < E
      : S !== null && t < S ? true
      : E !== null ? (n < last ? true : n === last ? null : false)
      : n < last ? true : n > last + 1 ? false : null;
    const inProgress = started === false || notEnded === false ? false : started === true && notEnded === true ? true : null;
    const kinds: ('shabbos' | 'yom-tov' | 'yom-kippur')[] = [];
    if (days.some((d) => d.shabbos)) kinds.push('shabbos');
    if (days.some((d) => d.events.some((e) => e.flags.melachaForbidden && e.id !== 'yom-kippur'))) kinds.push('yom-tov');
    if (days.some((d) => d.events.some((e) => e.id === 'yom-kippur'))) kinds.push('yom-kippur');
    return Object.freeze({
      inProgress,
      eve: Object.freeze({ date: eve, events: Object.freeze(holidaysOn(eve, hopts)) }),
      days: Object.freeze(days),
      kinds: Object.freeze(kinds),
      begins,
      ends,
    });
  }
  // Shabbos comes every seven days, so a run always begins within the search.
  throw new Error('No Shabbos or Yom Tov found within nine days: this is a bug in Luach');
}

/** The part of the day at an instant (see {@link dayPartAt}). */
export interface DayPartAt {
  /**
   * `'before-sunrise'` (from midnight to sunrise), `'day'` (sunrise to sunset), `'bein-hashmashos'`
   * (sunset to nightfall) or `'night'` (nightfall to midnight); null where a time it needs does not
   * occur (no sunset or sunrise; no nightfall, after sunset and until the next sunrise).
   */
  readonly part: 'before-sunrise' | 'day' | 'bein-hashmashos' | 'night' | null;
  /** The `sunrise` opinion on `date`. */
  readonly sunrise: Zman;
  /** The `sunset` opinion on `date`. */
  readonly sunset: Zman;
  /** The `tzeis` opinion on the evening of `date`: where night begins, by the person's opinion. */
  readonly tzeis: Zman;
  /**
   * The civil date whose times these are: the place's civil date at the instant, or the day before
   * while that day's sunset or nightfall, falling after local midnight (far north), has not come.
   */
  readonly date: CivilDate;
}

/**
 * Whether `instant` is before sunrise, during the day, between sunset and nightfall, or at night,
 * at the place, by the person's `sunrise`, `sunset` and `tzeis` opinions (night begins at their
 * `tzeis`: a default, `tzeis-8.5`, not a ruling). States change at the exact times, as the other
 * at-instant functions do. Ask your rav.
 */
export function dayPartAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): DayPartAt {
  instant = instantArg(instant, 'dayPartAt');
  const t = instant.getTime();
  const z = zmanimFor(location, options);
  const civil = civilDateAt(t, location.timeZone);
  const today = HebrewDate.fromCivil(civil);
  const times = (h: HebrewDate) => {
    const d = z.on(h);
    return { sunrise: d.slot('sunrise'), sunset: d.slot('sunset'), tzeis: d.slot('tzeis') };
  };
  const result = (part: DayPartAt['part'], h: HebrewDate, x: ReturnType<typeof times>, c: CivilDate): DayPartAt =>
    Object.freeze({ part, ...x, date: Object.freeze({ year: c.year, month: c.month, day: c.day }) });
  const at = (z: Zman) => z.exact?.getTime() ?? null;
  // The evening before, where its sunset or nightfall falls after local midnight.
  const yesterday = today.prev();
  const y = times(yesterday);
  const yS = at(y.sunset);
  const yN = at(y.tzeis);
  const yCivil = yesterday.toCivil();
  if (yS !== null && t < yS) return result('day', yesterday, y, yCivil);
  if (yN !== null && t < yN) return result('bein-hashmashos', yesterday, y, yCivil);
  const x = times(today);
  const [r, s, n] = [at(x.sunrise), at(x.sunset), at(x.tzeis)];
  if (r !== null && t < r) return result(yS !== null && yN === null ? null : 'before-sunrise', today, x, civil);
  if (s !== null && t >= s) return result(n === null ? null : t < n ? 'bein-hashmashos' : 'night', today, x, civil);
  return result(r !== null && s !== null ? 'day' : null, today, x, civil);
}

/** One event and when it is in force (see {@link eventsAt}). */
export interface EventAt {
  readonly event: HolidayEvent;
  /** When it comes into force: for Yom Tov its candles; for a fast its start; for Isru Chag the end of the Yom Tov before; else the `dayBoundary` that begins its date. */
  readonly from: Zman;
  /** When it ends: for Yom Tov the end of the day's holiness (havdala), or the `dayBoundary` when another holy day follows; for a fast its end; else the `dayBoundary` that ends its date. */
  readonly until: Zman;
  /** From `from` until `until` (exact times): true; before or after: false; null where a time it needs does not occur. */
  readonly inProgress: boolean | null;
}

/** The events in force at an instant (see {@link eventsAt}). */
export interface EventsAt {
  /** The Hebrew date at the instant, by the `dayBoundary` opinion: {@link hebrewDateAt}. */
  readonly date: HebrewDate;
  /**
   * The events of `date`, always, each with its state; before them those of the date before that are
   * still in force (a Yom Tov until its havdala, a fast until its end), and after them those of the
   * next date already in force (a Yom Tov from its candles).
   */
  readonly events: readonly EventAt[];
}

/**
 * The events in force at `instant`: the events of the Hebrew date now, plus any whose observance is
 * still running past the date's boundary (Yom Kippur until its fast ends, a Yom Tov until its
 * havdala) or has already begun before it (a Yom Tov from its candles). Isru Chag comes into force
 * only when the Yom Tov before it ends. Each event says from when until when, by the person's
 * opinions, and whether it is in force at the instant (`inProgress`). Israel or the diaspora as in
 * {@link isMelachaForbiddenAt}.
 */
export function eventsAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): EventsAt {
  instant = instantArg(instant, 'eventsAt');
  const t = instant.getTime();
  const hopts = { ...options, israel: israelFor(options.israel, location) };
  const z = zmanimFor(location, options);
  const date = z.hebrewDateAt(instant);
  const boundary = (h: HebrewDate) => z.on(h).slot('dayBoundary');
  const state = (from: Zman, until: Zman): boolean | null => {
    if (from.exact !== null && t < from.exact.getTime()) return false;
    if (until.exact !== null && t >= until.exact.getTime()) return false;
    return from.exact !== null && until.exact !== null ? true : null;
  };
  const of = (h: HebrewDate): EventAt[] => {
    const out: EventAt[] = [];
    let fast: ReturnType<typeof fastTimes> | undefined;
    let evening: ReturnType<typeof eveningOf> | undefined;
    for (const event of holidaysOn(h, hopts)) {
      let from: Zman;
      let until: Zman;
      if (event.flags.fast !== null) {
        fast ??= fastTimes(h, location, options);
        from = fast!.begins;
        until = fast!.ends;
      } else if (event.flags.melachaForbidden) {
        from = eveningOf(h.prev(), location, options).candles ?? boundary(h.prev());
        evening ??= eveningOf(h, location, options);
        until = evening.havdala ?? evening.shabbosEnds ?? boundary(h);
      } else if (event.flags.isruChag) {
        from = eveningOf(h.prev(), location, options).havdala ?? boundary(h.prev());
        until = boundary(h);
      } else {
        from = boundary(h.prev());
        until = boundary(h);
      }
      out.push(Object.freeze({ event, from, until, inProgress: state(from, until) }));
    }
    return out;
  };
  const before = of(date.prev()).filter((e) => e.inProgress !== false);
  const after = date.epochDays < MAX_DAYS ? of(date.next()).filter((e) => e.inProgress === true) : [];
  return Object.freeze({ date, events: Object.freeze([...before, ...of(date), ...after]) });
}
