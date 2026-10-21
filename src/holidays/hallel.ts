/**
 * Hallel at Shacharis.
 *
 * - Whole Hallel: all days of Sukkos and Shemini Atzeres/Simchas Torah (SA OC 644:1), all eight days of Chanukah
 *   (683:1), the first day(s) of Pesach (488:1) and Shavuos (494:1).
 * - Half Hallel ("בדילוג"): Rosh Chodesh (422:2), Chol Hamoed Pesach and the last days of Pesach (490:4).
 * - None: Rosh Hashana, Yom Kippur, Purim, and every other day.
 * Hallel on Yom HaAtzmaut and Yom Yerushalayim is a matter of custom and is not covered here.
 *
 * @packageDocumentation
 */

import { type DayNumber } from '../calendar/gregorian.js';
import { KISLEV, NISAN, SIVAN, TISHREI, dayNumberToHebrew, hebrewToDayNumber } from '../calendar/hebrew.js';
import type { Location } from '../parsha/parsha.js';
import { roshChodeshDays } from './holidays.js';

/** Hallel said at Shacharis on a civil date: `'whole'`, `'half'`, or null. */
export function hallel(dayNumber: DayNumber, location: Location): 'whole' | 'half' | null {
  const { year, month, day } = dayNumberToHebrew(dayNumber);
  const israel = location === 'israel';
  if (month === TISHREI && day >= 15 && day <= (israel ? 22 : 23)) return 'whole';
  const chanukah = hebrewToDayNumber(year, KISLEV, 25);
  if (dayNumber >= chanukah && dayNumber < chanukah + 8) return 'whole';
  if (month === NISAN && (day === 15 || (day === 16 && !israel))) return 'whole';
  if (month === NISAN && day >= 16 && day <= (israel ? 21 : 22)) return 'half';
  if (month === SIVAN && (day === 6 || (day === 7 && !israel))) return 'whole';
  for (const m of [month, month === 13 ? 1 : month + 1]) {
    // Rosh Chodesh of this month, or the 30th that begins next month (Tishrei has none: Rosh Hashana).
    try {
      if (roshChodeshDays(year, m).includes(dayNumber)) return 'half';
    } catch {
      // month doesn't exist this year
    }
  }
  return null;
}
