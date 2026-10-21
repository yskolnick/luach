/**
 * Seasonal dates: v'sein tal umatar, mashiv haruach, Birkas HaChama, Kiddush Levana.
 *
 * Diaspora dates follow the tekufah of Shmuel (Eruvin 56a): a solar year of exactly
 * 365¼ days, the same length as the Julian year, so each tekufah falls on a fixed Julian
 * date and drifts against the Gregorian calendar by three days every four centuries.
 *
 * @packageDocumentation
 */

import type { OmerNusach } from './omer.js';
import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { molad } from '../calendar/molad.js';
import { PARTS_PER_HOUR } from '../calendar/year.js';
import { daysToCivil, julianToDays, MS_PER_DAY, type CivilDate } from '../time/civil.js';

/** When v'sein tal umatar starts in a given Hebrew year's winter. */
export interface TalUmatarStart {
  /** The civil date at whose Maariv (evening) the request begins. */
  readonly eveningOf: CivilDate;
  /** The Hebrew date that begins at that Maariv (its first full day of the request). */
  readonly hebrewDate: HebrewDate;
}

/**
 * The start of "v'sein tal umatar" in the winter of Hebrew year `year`.
 *
 * - **Israel:** from Maariv of 7 Cheshvan (Taanis 10a; SA OC 117:1), i.e. the evening of
 *   6 Cheshvan in civil terms.
 * - **Diaspora:** from Maariv of the 60th day after tekufas Tishrei, counting the day of
 *   the tekufah as the first (SA OC 117:1). By Shmuel's tekufah that Maariv is on the
 *   evening of 21 November in the Julian calendar, or 22 November when the following
 *   Julian year is a leap year. In Gregorian terms this is the evening of 4 December, or
 *   5 December before a Gregorian leap year, for 1900–2099; from 2100 it is a day later
 *   (5/6 December), from 2200 later again, and so on. Computed, not tabulated.
 */
export function talUmatarStart(year: number, options?: { israel?: boolean }): TalUmatarStart {
  if (options?.israel) {
    const h = new HebrewDate(year, Month.CHESHVAN, 7);
    return { eveningOf: daysToCivil(h.epochDays - 1), hebrewDate: h };
  }
  // The winter of Hebrew year `year` falls in Gregorian year (year - 3761).
  const g = year - 3761;
  const nextJulianLeap = (g + 1) % 4 === 0;
  const days = julianToDays(g, 11, nextJulianLeap ? 22 : 21);
  return { eveningOf: daysToCivil(days), hebrewDate: HebrewDate.fromEpochDays(days + 1) };
}

/**
 * Which phrase the Amidah uses on `date`, by the day (Shacharis):
 *
 * - `mashivHaruach`: "mashiv haruach umorid hageshem" is said from Musaf of Shemini
 *   Atzeres to Musaf of the first day of Pesach (Taanis 2a, 4b; SA OC 114:1). On those two days
 *   the value describes Shacharis, and `changesAtMusaf` is true.
 * - `talUmatar`: "v'sein tal umatar" is asked from the start date (see
 *   {@link talUmatarStart}) until Mincha of Erev Pesach (SA OC 117:1).
 *   Values describe the daytime Shacharis of `date`.
 *
 * "Morid hatal" in summer (`moridHatal`) is a custom, chosen by `nusach` (default
 * `'ashkenaz'`):
 * - Edot HaMizrach say it: MB 114:13 ("למנהג ספרד שנוהגין לכתחילה לומר מוריד הטל בימות
 *   החמה"; also MB 114:3; SA OC 114:3).
 * - Ashkenazim outside Israel do not: Rema OC 114:3 ("ואנו בני אשכנז לא מזכירין טל לא בימות
 *   החמה ולא בימות הגשמים").
 * - In Israel it is said in every nusach (Tashbetz Katan 101).
 * - Nusach Sefard siddurim print it for the summer (not verified in a halachic code).
 */
export function amidahSeason(date: HebrewDate, options?: { israel?: boolean; nusach?: OmerNusach }): {
  mashivHaruach: boolean;
  moridHatal: boolean;
  talUmatar: boolean;
  changesAtMusaf: boolean;
} {
  const y = date.year;
  const sheminiAtzeres = new HebrewDate(y, Month.TISHREI, 22);
  const pesach = new HebrewDate(y, Month.NISAN, 15);
  // Shacharis: from the day after Shemini Atzeres through the first day of Pesach.
  const winter = date.epochDays > sheminiAtzeres.epochDays && date.epochDays <= pesach.epochDays;
  const changesAtMusaf = date.equals(sheminiAtzeres) || date.equals(pesach);
  const start = talUmatarStart(y, options).hebrewDate;
  const talUmatar = date.epochDays >= start.epochDays && date.epochDays < pesach.epochDays;
  const saysTal = Boolean(options?.israel) || (options?.nusach ?? 'ashkenaz') !== 'ashkenaz';
  return { mashivHaruach: winter, moridHatal: !winter && saysTal, talUmatar, changesAtMusaf };
}

/** Birkas HaChama: the Wednesday dates (Gregorian) of the 28-year cycle in a range of years. */
export function birkasHachamaDates(fromYear: number, toYear: number): CivilDate[] {
  // Shmuel's tekufas Nisan returns to the start of Wednesday (Tuesday 6 pm) every 28 years
  // (Berachos 59b; SA OC 229:2). That happens on 26 March (Julian) in years ≡ 1981 mod 28;
  // the blessing is said that Wednesday morning, e.g. 8 April 1981, 2009, 2037.
  const out: CivilDate[] = [];
  let y = fromYear + ((((1981 - fromYear) % 28) + 28) % 28);
  for (; y <= toYear; y += 28) out.push(daysToCivil(julianToDays(y, 3, 26)));
  return out;
}

/** True if `date` is a Birkas HaChama day. */
export function isBirkasHachama(date: HebrewDate): boolean {
  const c = date.toCivil();
  return birkasHachamaDates(c.year, c.year).some((x) => x.month === c.month && x.day === c.day);
}

/**
 * Longitude used to turn the calendar's molad (Jerusalem mean time) into a UTC instant:
 * 35.2354° E (*as built*; see DECISIONS.md). Mean time = UTC + longitude / 15 hours.
 */
export const JERUSALEM_LONGITUDE = 35.2354;

/** The molad of `month` in `year` as an instant (UTC), reading the calendar's molad as Jerusalem mean time. */
export function moladInstant(year: number, month: number): Date {
  const m = molad(year, month);
  // totalParts counts from 6 pm on the evening before day 0 of the calendar's epoch.
  const day0 = new HebrewDate(1, Month.TISHREI, 1).epochDays - 1;
  const msPerPart = 3_600_000 / PARTS_PER_HOUR;
  const jmt = day0 * MS_PER_DAY - 6 * 3_600_000 + m.totalParts * msPerPart;
  return new Date(Math.round(jmt - (JERUSALEM_LONGITUDE / 15) * 3_600_000));
}

/** An opinion on the earliest or latest time for Kiddush Levana. */
export interface KiddushLevanaTime {
  readonly time: Date;
  readonly opinion: string;
  readonly source: string;
}

const HALF_MONTH_MS = (29 * MS_PER_DAY + 12 * 3_600_000 + (793 * 3_600_000) / PARTS_PER_HOUR) / 2;

/**
 * Earliest and latest times for Kiddush Levana for the month `month` of `year`, counted
 * from the molad (as a Jerusalem-mean-time instant; see {@link moladInstant}).
 * Whether Kiddush Levana may be said at night only, on Motzaei Shabbos, and so on, is not
 * modelled here. Ask your rav.
 */
export function kiddushLevana(year: number, month: number): {
  earliest: { threeDays: KiddushLevanaTime; sevenDays: KiddushLevanaTime };
  latest: { halfMonth: KiddushLevanaTime; fifteenDays: KiddushLevanaTime };
} {
  const t = moladInstant(year, month).getTime();
  const at = (ms: number, opinion: string, source: string): KiddushLevanaTime => ({ time: new Date(t + ms), opinion, source });
  return {
    earliest: {
      threeDays: at(3 * MS_PER_DAY, 'Three days after the molad', 'Talmidei Rabbeinu Yonah (on the Rif, Berachos), cited in Beis Yosef OC 426; MB 426:20'),
      sevenDays: at(7 * MS_PER_DAY, 'Seven days after the molad', 'Shulchan Aruch OC 426:4 (Beis Yosef: kabbalistic source, R. Yosef Gikatilla)'),
    },
    latest: {
      halfMonth: at(HALF_MONTH_MS, 'Half the month from the molad (14 d 18 h 22 m 1⅔ s)', 'Rema OC 426:3 (citing Teshuvos Maharil)'),
      fifteenDays: at(15 * MS_PER_DAY, 'Fifteen full days from the molad', 'Shulchan Aruch OC 426:3 (until the 16th day from the molad, not inclusive; MB 426:17)'),
    },
  };
}
