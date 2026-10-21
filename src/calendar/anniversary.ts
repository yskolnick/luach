/**
 * Yahrzeits and Hebrew birthdays (including bar and bas mitzvah) in later years.
 *
 * Most dates simply recur on the same Hebrew day. Three cases need a rule, and customs
 * differ; the caller chooses. Defaults are documented below and are not rulings.
 * Ask your rav. This library calculates; it does not rule.
 *
 * 1. **Adar of a common year, observed in a leap year.** For a birthday or bar mitzvah
 *    the Rema (Orach Chaim 55:10, citing Mahari Mintz) gives Adar II; that is the default for
 *    `kind: 'birthday'`. For a yahrzeit the Mechaber (OC 568:7) gives Adar II and the
 *    Rema there gives Adar I, adding that some observe both; the default for
 *    `kind: 'yahrzeit'` is Adar I. Set `adarInLeapYear` to choose.
 * 2. **Adar I or Adar II of a leap year, observed in a common year:** Adar.
 *    30 Adar I (the first day of Rosh Chodesh Adar II) becomes 30 Shevat, the first day
 *    of Rosh Chodesh Adar in a common year (*as built*; see DECISIONS.md).
 * 3. **The 30th of Cheshvan or Kislev, in a year when that month has 29 days.**
 *    `'nextMonth'` moves it to the 1st of the following month (the second day of
 *    the same Rosh Chodesh); `'firstAnniversary'` keeps the 30th whenever it exists, and
 *    otherwise follows the first anniversary: if the month had only 29 days in the year
 *    after the event, the 29th; if it had 30, the 1st of the next month. Defaults: `'nextMonth'` for birthdays,
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
}

/** The Hebrew date in `year` on which an event of `original` is observed. */
export function anniversary(original: HebrewDateParts, year: number, options: AnniversaryOptions): HebrewDate {
  assertHebrewDate(original.year, original.month, original.day);
  assertYear(year);
  const adarChoice = options.adarInLeapYear ?? (options.kind === 'birthday' ? 'adar2' : 'adar1');
  const thirtieth = options.missingThirtieth ?? (options.kind === 'birthday' ? 'nextMonth' : 'firstAnniversary');
  const fromLeap = isLeapYear(original.year);
  const toLeap = isLeapYear(year);
  let month: number = original.month;
  let day = original.day;

  if (month === Month.ADAR || month === Month.ADAR_II) {
    if (!fromLeap && toLeap) {
      month = adarChoice === 'adar2' ? Month.ADAR_II : Month.ADAR_I;
    } else if (fromLeap && !toLeap) {
      if (month === Month.ADAR_I && day === 30) {
        month = Month.SHEVAT;
      } else {
        month = Month.ADAR;
      }
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

  // A 30th that the target month lacks in any other month (e.g. 30 Adar I in a leap
  // year observed in a leap year is always fine; Adar (29) never has a 30th).
  if (day > monthLength(year, month)) day = monthLength(year, month);
  return new HebrewDate(year, month, day);
}

/** The year a boy becomes bar mitzvah (13) or a girl bas mitzvah (12), and the date. */
export function barMitzvahDate(birth: HebrewDateParts, age: 12 | 13 = 13): HebrewDate {
  return anniversary(birth, birth.year + age, { kind: 'birthday' });
}
