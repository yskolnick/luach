/**
 * The mourning periods of the year (the Sefirah, the Three Weeks) and, for a custom the
 * caller names, what each custom restricts on a given day.
 *
 * Customs here differ more than almost anywhere in the calendar, so Luach has no default (D-15):
 * without a custom, {@link MourningPeriods.restrictions} is `null`. Each restriction names
 * its source. Shabbos and Yom Tov laws, a seudas mitzvah, a bris and the other exceptions in
 * the sources are not modelled. Ask your rav.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { omerDay } from './omer.js';

const SUNDAY = 0;
const FRIDAY = 5;
const SHABBAT = 6;

/**
 * Which days of the Sefirah are kept as days of mourning (haircuts and weddings).
 *
 * - `'sa-until-34'`: through Lag BaOmer, and the night of the 34th until sunrise; a haircut
 *   is allowed on Lag BaOmer when it is Friday (SA OC 493:1–2; MB 493:5–7).
 * - `'rema-until-lag'`: until Lag BaOmer, which is allowed from sunrise; when Lag BaOmer is
 *   Sunday, a haircut is allowed on the Friday before (Rema OC 493:2; MB 493:5, 10–11).
 * - `'rema-from-rosh-chodesh-iyar'`: from 2 Iyar until Shavuos, Lag BaOmer allowed from
 *   sunrise (Rema OC 493:3; MB 493:14–15).
 * - `'iyar-to-hagbalah'`: from the first day of Rosh Chodesh Iyar until the morning of
 *   3 Sivan, Lag BaOmer allowed (Magen Avraham and Chayei Adam, cited in MB 493:15).
 * - `'except-rosh-chodesh-lag-sivan'`: the whole Sefirah except Rosh Chodesh Iyar, Lag
 *   BaOmer, and Rosh Chodesh Sivan until Shavuos (MB 493:15).
 * - `'arizal'`: no haircut until Erev Shavuos, Lag BaOmer and Rosh Chodesh included
 *   (Kaf HaChaim OC 493:13). Weddings are not addressed there, so they are `null`.
 */
export type SefirahCustom =
  | 'sa-until-34'
  | 'rema-until-lag'
  | 'rema-from-rosh-chodesh-iyar'
  | 'iyar-to-hagbalah'
  | 'except-rosh-chodesh-lag-sivan'
  | 'arizal';

/**
 * Haircuts, laundry and weddings in the Three Weeks.
 *
 * - `'ashkenaz'`: weddings and haircuts from 17 Tammuz, laundry from Rosh Chodesh Av
 *   (Rema OC 551:2–4); haircuts and laundry until midday on 10 Av (MB 558:3).
 * - `'sephard'`: weddings from Rosh Chodesh Av (SA OC 551:2); haircuts and laundry in the
 *   week of Tisha B'Av only, allowed right after the fast (SA OC 551:3–4).
 */
export type BeinHametzarimCustom = 'ashkenaz' | 'sephard';

/**
 * When meat and wine are given up before Tisha B'Av (SA OC 551:9). Never on Shabbos
 * (MB 551:59).
 *
 * - `'week-only'`: the week of Tisha B'Av.
 * - `'from-rosh-chodesh'`: from Rosh Chodesh Av, Rosh Chodesh included (MB 551:58).
 * - `'from-2-av'`: from the day after Rosh Chodesh Av (Kaf HaChaim OC 551:125).
 * - `'from-17-tammuz'`: from 17 Tammuz, weekdays only (MB 551:59).
 *
 * The end on 10 Av follows {@link MourningOptions.beinHametzarim}: until midday for
 * `'ashkenaz'` (Rema OC 558:1), the whole of 10 Av for `'sephard'` (SA OC 558:1).
 */
export type MeatWineCustom = 'week-only' | 'from-rosh-chodesh' | 'from-2-av' | 'from-17-tammuz';

/** The customs to apply in {@link mourningPeriods}. There are no defaults. */
export interface MourningOptions {
  sefirah?: SefirahCustom;
  beinHametzarim?: BeinHametzarimCustom;
  meatWine?: MeatWineCustom;
}

/**
 * The part of the day a restriction covers, when not the whole day. The Hebrew day starts at
 * nightfall: `'until-sunrise'` is the night only, until sunrise; `'night-only'` the night,
 * until morning; `'until-chatzos'` until midday.
 */
export type PartOfDay = 'until-sunrise' | 'night-only' | 'until-chatzos';

/** A restriction that applies, and where it comes from. */
export interface Restricted {
  readonly partial?: PartOfDay;
  readonly source: string;
}

/**
 * `false`: the chosen custom does not restrict this on this day. An object: it does (for the
 * part of the day given). `null`: no custom was given for this period, or the sources Luach
 * read do not settle this day.
 */
export type Restriction = false | Restricted | null;

/** What the chosen customs restrict on a day. */
export interface MourningRestrictions {
  readonly haircut: Restriction;
  readonly weddings: Restriction;
  readonly meatWine: Restriction;
  readonly laundry: Restriction;
}

/** The mourning periods `date` falls in, and the restrictions of the chosen customs. */
export interface MourningPeriods {
  /** 17 Tammuz through the fast of Tisha B'Av (10 Av when 9 Av is Shabbos). A calendar span. */
  readonly threeWeeks: boolean;
  /** Rosh Chodesh Av through the fast of Tisha B'Av. A calendar span. */
  readonly nineDays: boolean;
  /**
   * The week in which Tisha B'Av falls, from Sunday through 9 Av. There is none when 9 Av is
   * Sunday or Shabbos (SA OC 551:4).
   */
  readonly weekOfTishaBav: boolean;
  /** The 49 days of the Omer (16 Nisan to 5 Sivan). A calendar span. */
  readonly omer: boolean;
  /** `null` unless a custom is given in the options. */
  readonly restrictions: MourningRestrictions | null;
}

const at = (source: string, partial?: PartOfDay): Restricted => (partial ? { partial, source } : { source });

/** Haircuts and weddings on day `n` of the Omer under `custom`. */
function sefirah(custom: SefirahCustom, n: number, date: HebrewDate): { haircut: Restriction; weddings: Restriction } {
  const both = (r: Restriction) => ({ haircut: r, weddings: r });
  switch (custom) {
    case 'sa-until-34': {
      const src = 'SA OC 493:1–2; MB 493:5–6';
      if (n === 33 && date.dayOfWeek === FRIDAY) return { haircut: false, weddings: at(src) }; // SA OC 493:2
      if (n <= 33) return both(at(src));
      return both(n === 34 ? at('SA OC 493:2; MB 493:6–7', 'until-sunrise') : false);
    }
    case 'rema-until-lag': {
      const src = 'Rema OC 493:2; MB 493:5';
      // Lag BaOmer on Sunday: a haircut on the Friday before, for Shabbos (Rema OC 493:2).
      if (n === 31 && date.dayOfWeek === FRIDAY) return { haircut: false, weddings: at(src) };
      if (n <= 32) return both(at(src));
      return both(n === 33 ? at('Rema OC 493:2; MB 493:10–11', 'until-sunrise') : false);
    }
    case 'rema-from-rosh-chodesh-iyar': {
      // 2 Iyar (day 17) through Erev Shavuos; Lag BaOmer allowed in part (MB 493:14).
      if (n < 17) return both(false);
      return both(n === 33 ? at('Rema OC 493:3; MB 493:14', 'until-sunrise') : at('Rema OC 493:3; MB 493:5, 14–15'));
    }
    case 'iyar-to-hagbalah': {
      // From 30 Nisan, the first day of Rosh Chodesh Iyar (day 15), to the morning of 3 Sivan (day 47).
      const src = 'MB 493:15 (Magen Avraham; Chayei Adam)';
      if (n < 15 || n > 47 || n === 33) return both(false);
      return both(n === 47 ? at(src, 'until-sunrise') : at(src));
    }
    case 'except-rosh-chodesh-lag-sivan': {
      // Rosh Chodesh Iyar is days 15–16; Rosh Chodesh Sivan, day 45.
      if (n === 15 || n === 16 || n === 33 || n >= 45) return both(false);
      return both(at('MB 493:15'));
    }
    case 'arizal':
      return { haircut: n <= 48 ? at('Kaf HaChaim OC 493:13') : false, weddings: null };
  }
}

/**
 * Whether `date` is in the Three Weeks, the Nine Days, the week of Tisha B'Av or the Omer,
 * and, for the customs given in `options`, what is restricted that day. See
 * {@link MourningOptions}; without any custom, `restrictions` is `null`.
 */
export function mourningPeriods(date: HebrewDate, options: MourningOptions = {}): MourningPeriods {
  const y = date.year;
  const e = date.epochDays;
  const t17 = new HebrewDate(y, Month.TAMMUZ, 17).epochDays;
  const rcAv = new HebrewDate(y, Month.AV, 1).epochDays;
  const av9 = new HebrewDate(y, Month.AV, 9);
  const fastDay = av9.isShabbos ? av9.next() : av9;
  const fast = fastDay.epochDays;
  const postponed = fastDay !== av9;
  const dayAfter = fast + 1;
  const hasWeek = av9.dayOfWeek !== SUNDAY && av9.dayOfWeek !== SHABBAT;
  const weekStart = av9.onOrBefore(SUNDAY).epochDays;
  const weekOfTishaBav = hasWeek && e >= weekStart && e <= av9.epochDays;
  const n = omerDay(date);

  const periods = {
    threeWeeks: e >= t17 && e <= fast,
    nineDays: e >= rcAv && e <= fast,
    weekOfTishaBav,
    omer: n !== null,
  };
  const { sefirah: sefirahCustom, beinHametzarim, meatWine } = options;
  if (!sefirahCustom && !beinHametzarim && !meatWine) return { ...periods, restrictions: null };

  const none: MourningRestrictions = { haircut: false, weddings: false, meatWine: false, laundry: false };
  if (n !== null) {
    const r = sefirahCustom ? sefirah(sefirahCustom, n, date) : { haircut: null, weddings: null };
    return { ...periods, restrictions: { ...none, ...r } };
  }
  if (e < t17 || e > dayAfter) return { ...periods, restrictions: none };

  // ---- haircuts, laundry, weddings ----
  let haircut: Restriction = null;
  let laundry: Restriction = null;
  let weddings: Restriction = null;
  if (beinHametzarim === 'ashkenaz') {
    if (e === dayAfter) {
      // Until midday on 10 Av (MB 558:3), but not on a Friday (ibid.); after a fast on
      // Sunday 10 Av, allowed that night (MB 558:4). Weddings: "until after Tisha B'Av"
      // (Rema OC 551:2) does not settle 10 Av, so null.
      const part = postponed || fastDay.next().dayOfWeek === FRIDAY ? false : at('MB 558:3', 'until-chatzos');
      haircut = part;
      laundry = part;
      weddings = null;
    } else {
      haircut = at('Rema OC 551:4');
      laundry = e >= rcAv ? at('Rema OC 551:3–4') : false;
      weddings = at('Rema OC 551:2');
    }
  } else if (beinHametzarim === 'sephard') {
    weddings = e >= rcAv && e <= fast ? at('SA OC 551:2') : false;
    if (weekOfTishaBav) {
      haircut = at('SA OC 551:3');
      laundry = at('SA OC 551:3');
    } else if (e === fast) {
      // A fast postponed to Sunday: no week of Tisha B'Av (SA OC 551:4); the fast day's own
      // laws are not modelled here.
      haircut = null;
      laundry = null;
    } else {
      haircut = false; // after the fast, at once (SA OC 551:4); before the week, allowed
      laundry = false;
    }
  }

  // ---- meat and wine ----
  let meat: Restriction = null;
  if (meatWine) {
    const start = {
      'week-only': hasWeek ? weekStart : fast,
      'from-rosh-chodesh': rcAv,
      'from-2-av': rcAv + 1,
      'from-17-tammuz': t17,
    }[meatWine];
    const source = {
      'week-only': 'SA OC 551:9',
      'from-rosh-chodesh': 'SA OC 551:9; MB 551:58',
      'from-2-av': 'SA OC 551:9; Kaf HaChaim OC 551:125',
      'from-17-tammuz': 'SA OC 551:9; MB 551:59',
    }[meatWine];
    if (e === dayAfter) {
      if (beinHametzarim === 'ashkenaz') meat = at('Rema OC 558:1', postponed ? 'night-only' : 'until-chatzos');
      else if (beinHametzarim === 'sephard' && !postponed) meat = at('SA OC 558:1');
      else meat = null;
    } else if (date.isShabbos) meat = false; // MB 551:59
    else meat = e >= start ? at(source) : false;
  }

  return { ...periods, restrictions: { haircut, weddings, meatWine: meat, laundry } };
}
