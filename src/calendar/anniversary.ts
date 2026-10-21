/**
 * Yahrzeits, birthdays and bar/bas mitzvah dates: carrying a Hebrew date into another year.
 *
 * Where the poskim differ (Adar in a leap year, the 30th of Cheshvan or Kislev), Luach does not choose.
 * Each function returns every candidate date with the custom and source it follows, unless the caller
 * names a custom in the options. Sources were checked against the text of the Shulchan Aruch,
 * Magen Avraham and Mishna Berura.
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @packageDocumentation
 */

import { type DayNumber } from './gregorian.js';
import {
  ADAR,
  ADAR_I,
  ADAR_II,
  CHESHVAN,
  KISLEV,
  SHVAT,
  type HebrewDate,
  daysInMonth,
  hebrewToDayNumber,
  isLeapYear,
  isValidHebrew,
  monthsInOrder,
} from './hebrew.js';

/** One candidate date for an anniversary, with the custom it follows. */
export interface AnniversaryDate {
  readonly date: HebrewDate;
  readonly dayNumber: DayNumber;
  /** Short id of the custom, e.g. `"rema"`. `"plain"` when there is no dispute. */
  readonly custom: string;
  /** Where the rule comes from. */
  readonly source: string;
}

/** Yahrzeit for a death in Adar of a common year, observed in a leap year. */
export type YahrzeitAdarCustom =
  /** Adar I. Rema OC 568:7 ("and so is the custom"), Rema YD 402:12. */
  | 'rema'
  /** Adar II. Shulchan Aruch (Mechaber) OC 568:7. */
  | 'mechaber'
  /** Both, which the Rema OC 568:7 mentions as a stringency; Mishna Berura 568:42 advises it the first time. */
  | 'both';

/** Death on the 30th of Cheshvan or Kislev, in a year whose month has only 29 days. */
export type Yahrzeit30Custom =
  /**
   * Magen Avraham 568:20 (conclusion): if the first anniversary year's month has 29 days, the yahrzeit is fixed
   * on the 29th for ever; otherwise it is fixed on Rosh Chodesh, i.e. the 1st of the next month in short years.
   * The Magen Avraham discusses Cheshvan; Luach applies the same rule to Kislev (As built).
   */
  | 'magen-avraham'
  /** Always the 1st of the next month when the 30th is missing. */
  | 'next-day'
  /** Always the 29th when the 30th is missing. */
  | 'last-day';

export interface YahrzeitOptions {
  /** Default: return both Adar I and Adar II, labelled. */
  readonly adar?: YahrzeitAdarCustom;
  /** Default: `'magen-avraham'`. */
  readonly day30?: Yahrzeit30Custom;
}

function date(year: number, month: number, day: number, custom: string, source: string): AnniversaryDate {
  return { date: { year, month, day }, dayNumber: hebrewToDayNumber(year, month, day), custom, source };
}

/** The date `day` of `month`, or the 1st of the next month if it doesn't exist (only a 30th can be missing). */
function dayOrNext(year: number, month: number, day: number, custom: string, source: string): AnniversaryDate {
  if (day <= daysInMonth(year, month)) return date(year, month, day, custom, source);
  const order = monthsInOrder(year);
  const next = order[order.indexOf(month) + 1];
  /* c8 ignore next */
  if (next === undefined) throw new Error('unreachable: Elul always has 29 days');
  return date(year, next, 1, custom, source);
}

function assertDate(d: HebrewDate): void {
  if (!isValidHebrew(d.year, d.month, d.day)) {
    throw new RangeError(`Invalid Hebrew date: ${d.year}-${d.month}-${d.day}`);
  }
}

/**
 * The yahrzeit (anniversary of a death) in Hebrew year `year`.
 *
 * Returns one date, or two when the caller hasn't chosen an Adar custom and the opinions differ.
 * The first anniversary year matters for the 30th of Cheshvan/Kislev (Magen Avraham 568:20).
 */
export function yahrzeit(death: HebrewDate, year: number, options: YahrzeitOptions = {}): AnniversaryDate[] {
  assertDate(death);
  if (year <= death.year) throw new RangeError('The yahrzeit year must be after the year of death');
  const { day } = death;
  const leapDeath = isLeapYear(death.year);
  const leapNow = isLeapYear(year);

  // Adar.
  if (death.month === ADAR || death.month === ADAR_II) {
    if (leapDeath && death.month === ADAR_II) {
      // Death in Adar II: Adar II in a leap year (Rema OC 568:7), Adar in a common year.
      return [date(year, leapNow ? ADAR_II : ADAR, day, 'plain', 'Rema OC 568:7')];
    }
    if (leapDeath) {
      // Death in Adar I.
      if (leapNow) return [date(year, ADAR_I, day, 'plain', 'Rema OC 568:7')];
      if (day === 30) {
        // 30 Adar I is the first day of Rosh Chodesh Adar II; in a common year it is kept on 30 Shvat.
        return [date(year, SHVAT, 30, 'plain', 'Mishna Berura 568:42')];
      }
      return [date(year, ADAR, day, 'plain', 'Rema OC 568:7')];
    }
    // Death in Adar of a common year.
    if (!leapNow) return [date(year, ADAR, day, 'plain', 'Shulchan Aruch OC 568:7')];
    const custom = options.adar ?? 'both';
    const out: AnniversaryDate[] = [];
    if (custom === 'rema' || custom === 'both') out.push(date(year, ADAR_I, day, 'rema', 'Rema OC 568:7'));
    if (custom === 'mechaber' || custom === 'both') {
      out.push(date(year, ADAR_II, day, 'mechaber', 'Shulchan Aruch OC 568:7'));
    }
    return out;
  }

  // 30 Cheshvan / 30 Kislev.
  if (day === 30 && (death.month === CHESHVAN || death.month === KISLEV)) {
    const month = death.month;
    if (daysInMonth(year, month) === 30) return [date(year, month, 30, 'plain', 'Magen Avraham 568:20')];
    const custom = options.day30 ?? 'magen-avraham';
    if (custom === 'last-day') return [date(year, month, 29, 'last-day', 'Magen Avraham 568:20 (one side of the question)')];
    if (custom === 'next-day') return [dayOrNext(year, month, 30, 'next-day', 'Magen Avraham 568:20 (one side of the question)')];
    const firstYearShort = daysInMonth(death.year + 1, month) === 29;
    return firstYearShort
      ? [date(year, month, 29, 'magen-avraham', 'Magen Avraham 568:20')]
      : [dayOrNext(year, month, 30, 'magen-avraham', 'Magen Avraham 568:20')];
  }

  return [date(year, death.month, day, 'plain', 'Shulchan Aruch YD 402:12')];
}

/** Bar/bas mitzvah or birthday: born in Adar I of a leap year, anniversary year also a leap year. */
export type BirthdayAdarICustom =
  /** Adar I. Levush OC 685, cited in Magen Avraham 55:10. */
  | 'levush'
  /** Adar II, because 13 full years are needed and the previous year was common. Magen Avraham 55:10. */
  | 'magen-avraham';

export interface BirthdayOptions {
  /**
   * Only matters for someone born in Adar I whose anniversary year is a leap year.
   * Default: return both, labelled. For an ordinary birthday most people simply use Adar I.
   */
  readonly adarI?: BirthdayAdarICustom;
}

/**
 * The Hebrew birthday in `year`; for the bar mitzvah pass `birth.year + 13` (bas mitzvah: `+ 12`).
 *
 * - Born in Adar of a common year, leap anniversary year: Adar II (Rema OC 55:10).
 * - Born in Adar I or II of a leap year, common anniversary year: Adar (Shulchan Aruch OC 55:10).
 * - Born on the 30th of a month that has 29 days this year: the 1st of the next month
 *   (Magen Avraham 55:10, Mishna Berura 55:45: the full year is not complete until then).
 */
export function hebrewBirthday(birth: HebrewDate, year: number, options: BirthdayOptions = {}): AnniversaryDate[] {
  assertDate(birth);
  if (year < birth.year) throw new RangeError('The anniversary year must not be before the year of birth');
  const leapBirth = isLeapYear(birth.year);
  const leapNow = isLeapYear(year);
  const { day } = birth;

  if (birth.month === ADAR || birth.month === ADAR_II) {
    if (!leapBirth) {
      return [dayOrNext(year, leapNow ? ADAR_II : ADAR, day, 'plain', 'Rema OC 55:10')];
    }
    if (birth.month === ADAR_II) {
      return [dayOrNext(year, leapNow ? ADAR_II : ADAR, day, 'plain', 'Shulchan Aruch OC 55:10')];
    }
    // Born in Adar I.
    if (!leapNow) return [dayOrNext(year, ADAR, day, 'plain', 'Shulchan Aruch OC 55:10')];
    const custom = options.adarI;
    const out: AnniversaryDate[] = [];
    if (custom === undefined || custom === 'levush') {
      out.push(date(year, ADAR_I, day, 'levush', 'Levush OC 685, cited in Magen Avraham 55:10'));
    }
    if (custom === undefined || custom === 'magen-avraham') {
      out.push(dayOrNext(year, ADAR_II, day, 'magen-avraham', 'Magen Avraham 55:10'));
    }
    return out;
  }

  return [dayOrNext(year, birth.month, day, 'plain', 'Magen Avraham 55:10; Mishna Berura 55:45')];
}
