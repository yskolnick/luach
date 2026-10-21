/**
 * Looking up a zman by its {@link ZmanimCalendar} method name, for options that take names
 * (the day view and the iCal export).
 *
 * @packageDocumentation
 */

import { ZmanimCalendar } from './calendar.js';
import { ZMANIM } from './opinions.js';
import { Zman } from './zman.js';

const hasOwn = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * The zman method `name` of `z`, or a RangeError. Only the calendar's own public zman methods
 * qualify: an own key of `ZmanimCalendar.prototype` (not `constructor`) whose call returns a
 * {@link Zman} with a known id.
 */
export function zmanMethod(z: ZmanimCalendar, name: string): () => Zman {
  const notZman = () => new RangeError(`${name} is not a zman`);
  if (name === 'constructor' || !hasOwn(ZmanimCalendar.prototype, name)) throw notZman();
  const f = Object.getOwnPropertyDescriptor(ZmanimCalendar.prototype, name)?.value as unknown;
  if (typeof f !== 'function') throw notZman();
  let r: unknown;
  try {
    r = (f as () => unknown).call(z);
  } catch {
    throw notZman();
  }
  if (!(r instanceof Zman) || !hasOwn(ZMANIM, r.id)) throw notZman();
  return f as () => Zman;
}

