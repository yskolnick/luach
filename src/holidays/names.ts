/**
 * Display names for holiday events.
 *
 * @packageDocumentation
 */

import { lookup, type Locale } from '../locales/types';
import { he } from '../locales/he';
import { gematriya } from '../text/gematriya';
import { monthName } from '../text/format';
import type { HolidayEvent } from './types';

/**
 * The name of an event in `locale`. Uses the key `holiday.<id>.<day>` when the locale has
 * it (e.g. "Pesach VII"), otherwise `holiday.<id>`, filling `{n}` with the day number
 * (in Hebrew letters for Hebrew locales) and `{month}` with the month's name.
 */
export function holidayName(event: HolidayEvent, locale: Locale = he): string {
  let template: string | undefined;
  if (event.day !== undefined) {
    const k = `holiday.${event.id}.${event.day}`;
    const v = lookup(locale, k);
    if (v !== k) template = v;
  }
  template ??= lookup(locale, `holiday.${event.id}`);
  const n = event.day === undefined ? '' : locale.numerals === 'hebrew' ? gematriya(event.day) : String(event.day);
  const month = event.month === undefined ? '' : monthName(event.month, event.monthYear ?? event.date.year, locale);
  return template.replace('{n}', n).replace('{month}', month);
}
