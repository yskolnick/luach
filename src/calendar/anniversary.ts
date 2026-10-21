/**
 * Yahrzeits and Hebrew birthdays (including bar and bas mitzvah) in later years.
 *
 * Most dates simply recur on the same Hebrew day. Four cases need a rule, and customs
 * differ; the caller chooses. Defaults are documented below and are not rulings.
 * Ask your rav. This library calculates; it does not rule.
 *
 * 1. **Adar of a common year, observed in a leap year.** For a birthday or bar mitzvah
 *    the Rema (Orach Chaim 55:10, citing Mahari Mintz) gives Adar II; that is the default for
 *    `kind: 'birthday'`. For a yahrzeit the Mechaber (OC 568:7) gives Adar II and the
 *    Rema there gives Adar I, adding that some observe both; the default for
 *    `kind: 'yahrzeit'` is Adar I. Set `adarInLeapYear` to choose.
 * 2. **Adar I or Adar II of a leap year, observed in a common year:** Adar.
 *    For a yahrzeit, 30 Adar I (the first day of Rosh Chodesh Adar II) becomes 30 Shevat,
 *    the first day of Rosh Chodesh Adar in a common year (MB 568:42; Magen Avraham 568:20
 *    gives the mirror case; *as built*; see DECISIONS.md).
 *    For a birthday it becomes 1 Nisan: when the 30th does not exist, the year is not
 *    complete until the 1st of the next month (Magen Avraham OC 55:10; Mishna Berura 55:45,
 *    and 55:44: one born in Adar I counts from Adar, not Shevat). This applies to every
 *    birthday whose day is missing in the target month.
 * 3. **Born in Adar I, birthday in a leap year** (`kind: 'birthday'` only). `adarI: 'levush'`
 *    keeps Adar I: the Levush (OC 685, as cited by the Magen Avraham), and Mishna Berura 55:43,
 *    "the consensus of the later authorities, against the Magen Avraham". `adarI:
 *    'magen-avraham'` gives Adar II: Magen Avraham 55:10 argues that the twelfth year was a
 *    common year, so thirteen full years end only in Adar II ("נעשה ב"מ באדר שני").
 *    Default: `'levush'` (*as built*; see DECISIONS.md Q-04). A yahrzeit in Adar I stays in Adar I.
 * 4. **The 30th of Cheshvan or Kislev, in a year when that month has 29 days.**
 *    `'nextMonth'` moves it to the 1st of the following month (the second day of
 *    the same Rosh Chodesh); `'firstAnniversary'` keeps the 30th whenever it exists, and
 *    otherwise follows the first anniversary: if the month had only 29 days in the year
 *    after the event, the 29th; if it had 30, the 1st of the next month (Magen Avraham
 *    568:20, brought in MB 568:42). Defaults: `'nextMonth'` for birthdays,
 *    `'firstAnniversary'` for yahrzeits (*as built*; see DECISIONS.md).
 *
 * @packageDocumentation
 */

import { HebrewDate, type HebrewDateParts } from './hebrew-date.js';
import { Month } from './months.js';
import { isLeapYear, monthLength, assertHebrewDate, assertYear } from './year.js';

/** Options for {@link anniversary}. */
export interface AnniversaryOptions {
  /** `'yahrzeit'` or `'birthday'` (also bar/bas mitzvah). Chooses the defaults below. */
  kind: 'yahrzeit' | 'birthday';
  /** For an event in Adar of a common year, observed in a leap year. */
  adarInLeapYear?: 'adar1' | 'adar2';
  /** For the 30th of Cheshvan or Kislev in a year when the month has only 29 days. */
  missingThirtieth?: 'nextMonth' | 'firstAnniversary';
  /**
   * Birthdays only: born in Adar I, observed in a leap year. `'levush'` (default): Adar I
   * (Levush OC 685; Mishna Berura 55:43). `'magen-avraham'`: Adar II (Magen Avraham OC 55:10).
   */
  adarI?: 'levush' | 'magen-avraham';
}

/** The Hebrew date in `year` on which an event of `original` is observed. */
export function anniversary(original: HebrewDateParts, year: number, options: AnniversaryOptions): HebrewDate {
  assertHebrewDate(original.year, original.month, original.day);
  assertYear(year);
  const birthday = options.kind === 'birthday';
  const adarChoice = options.adarInLeapYear ?? (birthday ? 'adar2' : 'adar1');
  const thirtieth = options.missingThirtieth ?? (birthday ? 'nextMonth' : 'firstAnniversary');
  const fromLeap = isLeapYear(original.year);
  const toLeap = isLeapYear(year);
  let month: number = original.month;
  let day = original.day;

  if (month === Month.ADAR || month === Month.ADAR_II) {
    if (!fromLeap && toLeap) {
      month = adarChoice === 'adar2' ? Month.ADAR_II : Month.ADAR_I;
    } else if (fromLeap && !toLeap) {
      if (month === Month.ADAR_I && day === 30 && !birthday) {
        month = Month.SHEVAT;
      } else {
        month = Month.ADAR;
      }
    } else if (fromLeap && toLeap && birthday && month === Month.ADAR_I && options.adarI === 'magen-avraham') {
      month = Month.ADAR_II;
    }
  }

  if ((month === Month.CHESHVAN || month === Month.KISLEV) && day === 30 && monthLength(year, month) === 29) {
    const firstYearShort = original.year < 9999 && monthLength(original.year + 1, month) === 29;
    if (thirtieth === 'firstAnniversary' && firstYearShort) {
      day = 29;
    } else {
      month = month === Month.CHESHVAN ? Month.KISLEV : Month.TEVES;
      day = 1;
    }
  }

  const length = monthLength(year, month);
  if (day > length) {
    // A birthday whose 30th is missing (30 Adar I in Adar or Adar II): the age is not
    // complete until the 1st of the next month (Magen Avraham OC 55:10; Mishna Berura 55:45).
    // Adar is never the last month of the year, so the next day stays in `year`.
    if (birthday) return new HebrewDate(year, month, length).next();
    day = length;
  }
  return new HebrewDate(year, month, day);
}

/**
 * The date a boy becomes bar mitzvah (13) or a girl bas mitzvah (12): the birthday rules of
 * {@link anniversary} (`kind: 'birthday'`), with `adarI` for one born in Adar I.
 */
export function barMitzvahDate(
  birth: HebrewDateParts,
  age: 12 | 13 = 13,
  options: Pick<AnniversaryOptions, 'adarI'> = {},
): HebrewDate {
  return anniversary(birth, birth.year + age, { kind: 'birthday', ...options });
}
