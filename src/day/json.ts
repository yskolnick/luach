/**
 * The JSON shapes that the day view and the instant view share: an event, a Hebrew date and a
 * place. Internal; the shapes are described by the JSON Schemas.
 *
 * @packageDocumentation
 */

import type { HebrewDate } from '../calendar/hebrew-date.js';
import { formatHebrewDate, monthName } from '../text/format.js';
import type { Locale } from '../locales/types.js';
import { holidayName } from '../holidays/names.js';
import type { HolidayEvent, HolidayFlags } from '../holidays/types.js';
import { zoneName } from '../time/zone.js';
import type { DayLocation } from '../zmanim/day-location.js';

/** An event as JSON: language-free `id`, its `name` in a locale and its flags. */
export interface EventJson {
  readonly id: string;
  readonly name: string;
  readonly flags: HolidayFlags;
  readonly day?: number;
  readonly candlesTonight?: number;
  readonly moved?: boolean;
}

/** A Hebrew date as JSON. */
export interface HebrewDateJson {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly monthName: string;
  readonly formatted: string;
}

/** A place as JSON. */
export interface LocationJson {
  readonly name?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation: number;
  readonly timeZone: string;
}

/** @internal */
export function eventJson(e: HolidayEvent, locale: Locale): EventJson {
  return {
    id: e.id,
    name: holidayName(e, locale),
    flags: e.flags,
    ...(e.day !== undefined ? { day: e.day } : {}),
    ...(e.candlesTonight !== undefined ? { candlesTonight: e.candlesTonight } : {}),
    ...(e.moved ? { moved: true } : {}),
  };
}

/** @internal */
export function hebrewDateJson(h: HebrewDate, locale: Locale): HebrewDateJson {
  return { year: h.year, month: h.month, day: h.day, monthName: monthName(h.month, h.year, locale), formatted: formatHebrewDate(h, { locale }) };
}

/** @internal */
export function locationJson(l: DayLocation): LocationJson {
  return { ...(l.name ? { name: l.name } : {}), latitude: l.latitude, longitude: l.longitude, elevation: l.elevation ?? 0, timeZone: zoneName(l.timeZone) };
}
