/**
 * Start and end of fasts, and the Hebrew date at an instant (which changes at sunset).
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @packageDocumentation
 */

import { type HebrewDate, dayNumberToHebrew } from '../calendar/hebrew.js';
import type { Holiday } from '../holidays/holidays.js';
import { dayNumberInZone } from '../time/zone.js';
import { type GeoLocation, type Zman, type ZmanFunction, type ZmanOptions, alos72, fastEnds, fastStarts, shkiah, tzeis8_5 } from './zmanim.js';

export interface FastTimesOptions extends ZmanOptions {
  /** Opinion for the start of a minor fast. Default {@link alos72}. */
  readonly alos?: ZmanFunction;
  /** Opinion for the end of a fast. Default {@link tzeis8_5}. */
  readonly tzeis?: ZmanFunction;
}

/** When a fast begins and ends. */
export interface FastTimes {
  readonly begins: Zman;
  readonly ends: Zman;
}

/**
 * Times for a fast day from the holiday list (any event with `fast` set).
 * Major fasts (Yom Kippur, Tisha B'Av) begin at sunset the evening before (SA OC 553:2, 608:1, with tosefes before it);
 * minor fasts begin at alos (SA OC 564:1). All end at tzeis.
 */
export function fastTimes(fast: Holiday, location: GeoLocation, options: FastTimesOptions = {}): FastTimes {
  if (!fast.fast) throw new RangeError(`${fast.id} is not a fast`);
  const ends = fastEnds(fast.dayNumber, location, options.tzeis ?? tzeis8_5, options);
  if (fast.fast === 'major') {
    const z = shkiah(fast.dayNumber - 1, location, options);
    const opinion = `Fast begins at sunset the evening before: ${z.opinion}`;
    return { begins: { ...z, opinion, toJSON: () => ({ ...z.toJSON(), opinion }) }, ends };
  }
  return { begins: fastStarts(fast.dayNumber, location, options.alos ?? alos72, options), ends };
}

/**
 * The Hebrew date at an instant at a place: after sunset (or the chosen boundary) it is the next day.
 * Default boundary: sea-level sunset ({@link shkiah}); pass e.g. {@link tzeis8_5} to switch at nightfall.
 */
export function hebrewDateAt(instant: Date, location: GeoLocation, boundary: ZmanFunction = shkiah, options: ZmanOptions = {}): HebrewDate {
  const civil = dayNumberInZone(instant.getTime(), location.timeZone, options.timeZoneProvider);
  const b = boundary(civil, location, { ...options, rounding: 'none' }).time;
  // If there is no sunset (polar day), the date doesn't change until midnight.
  const after = b !== null && instant.getTime() >= b.getTime();
  return dayNumberToHebrew(civil + (after ? 1 : 0));
}
