/**
 * Holiday and special-day events.
 *
 * @packageDocumentation
 */

import type { HebrewDate } from '../calendar/hebrew-date.js';

/** Flags for filtering events. Every flag is always present. */
export interface HolidayFlags {
  /** A Yom Tov (Biblical festival day) where it is kept (Israel or the diaspora). */
  readonly yomTov: boolean;
  /** Melacha is forbidden as on Yom Tov or Yom Kippur. (Every Shabbos is too; Shabbos is not an event.) */
  readonly melachaForbidden: boolean;
  /** A day of Chol Hamoed. */
  readonly cholHamoed: boolean;
  /** `'major'` (Yom Kippur, Tisha B'Av: from sunset), `'minor'` (from dawn), or `null`. */
  readonly fast: 'major' | 'minor' | null;
  /** A day of Rosh Chodesh. */
  readonly roshChodesh: boolean;
  /** A day set by the State of Israel (Yom HaShoah, Yom HaZikaron, Yom HaAtzmaut, Yom Yerushalayim). */
  readonly modernIsraeli: boolean;
  /** A minor holiday or commemoration (Chanukah, Purim, Tu B'Shvat, Lag BaOmer…). */
  readonly minor: boolean;
  /** A Shabbos with a special name or reading (Shuva, Shekalim, HaGadol, Mevorchim…). */
  readonly specialShabbos: boolean;
  /** The day before (erev) a Yom Tov, fast or festival. */
  readonly erev: boolean;
  /** Isru Chag, the day after a festival. */
  readonly isruChag: boolean;
  /** Off by default; included only when asked for (BeHaB, Yom Kippur Katan, modern Israeli days). */
  readonly optional: boolean;
}

/** One event on one day. Plain data: safe to serialise. */
export interface HolidayEvent {
  /** Stable id, e.g. `"pesach-1"`, `"rosh-chodesh"`, `"chanukah"`. Names come from the locale key `holiday.<id>`. */
  readonly id: string;
  /** The day. */
  readonly date: HebrewDate;
  readonly flags: HolidayFlags;
  /** For multi-day events: which day (Chanukah day 1–8, Chol Hamoed day, Rosh Chodesh day 1–2, Omer day…). */
  readonly day?: number;
  /** Chanukah: candles lit on the evening that ends this day (0 after the last night). */
  readonly candlesTonight?: number;
  /** Rosh Chodesh, Shabbos Mevorchim, Yom Kippur Katan: the month concerned (Month number). */
  readonly month?: number;
  /** The Hebrew year of `month` (it can differ from the event's year for Tishrei). */
  readonly monthYear?: number;
  /** True if the date was moved from its usual day (a fast pushed off Shabbos, a modern day moved by law). */
  readonly moved?: boolean;
}

/** Options for holiday queries. */
export interface HolidayOptions {
  /**
   * Israel (`true`) or the diaspora (`false`, the default). Decides Yom Tov Sheni, Chol
   * Hamoed length and Isru Chag. This is the caller's choice; it is not inferred.
   */
  israel?: boolean;
  /** Include the modern Israeli days. Default `false`. */
  modernIsraeli?: boolean;
  /**
   * Include the other Israeli commemorations set by Hebrew date (Sigd, Yom HaAliyah, Herzl,
   * Ben-Gurion, Jabotinsky, Rabin, the 7 October memorial day, …) and Chag HaBanot. Default `false`.
   */
  israeliCommemorations?: boolean;
  /** Include BeHaB fasts. Default `false`. */
  behab?: boolean;
  /** Include Yom Kippur Katan. Default `false`. */
  yomKippurKatan?: boolean;
  /**
   * Yom Kippur Katan when Erev Rosh Chodesh is Friday. `'thursday'` (the default): Mishna
   * Berura 417:4, for those who say Selichos. `'friday'`: Magen Avraham 417:3, and Mishna
   * Berura 417:4 for those who do not say Selichos. (On Shabbos it is always Thursday.)
   */
  yomKippurKatanOnFriday?: 'thursday' | 'friday';
  /**
   * Keep Yom Kippur Katan before Rosh Chodesh Cheshvan (Kaf HaChaim OC 417:16: "צריך
   * להתענות"). Default `false` (Luach found no source for leaving it out).
   */
  yomKippurKatanCheshvan?: boolean;
  /** Include the Shabbosos of Shovavim. Default `false`. */
  shovavim?: boolean;
  /** Include Shabbos Mevorchim. Default `true`. */
  shabbosMevorchim?: boolean;
}
