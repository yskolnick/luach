/**
 * Formatting Hebrew dates for display.
 *
 * @packageDocumentation
 */

import type { HebrewDateParts } from '../calendar/hebrew-date.js';
import { isLeapYear } from '../calendar/year.js';
import { dayOfWeekOfDays } from '../time/civil.js';
import { hebrewToDays } from '../calendar/year.js';
import { gematriya } from './gematriya.js';
import { isolate } from './rtl.js';
import { lookup, type Locale } from '../locales/types.js';
import { he } from '../locales/he.js';
import { localParts, type TimeZone } from '../time/zone.js';

/** The name of a Hebrew month in `locale` (Adar I / Adar II in leap years). */
export function monthName(month: number, year: number, locale: Locale = he): string {
  const leap = isLeapYear(year);
  if (leap && (month === 12 || month === 13)) return lookup(locale, `month.${month}.leap`);
  return lookup(locale, `month.${month}`);
}

/** The name of a weekday (0 = Sunday … 6 = Shabbos) in `locale`. */
export function weekdayName(dayOfWeek: number, locale: Locale = he): string {
  return lookup(locale, `weekday.${dayOfWeek}`);
}

/** Options for {@link formatHebrewDate}. */
export interface FormatOptions {
  /** Names to use. Default {@link he}. */
  locale?: Locale;
  /**
   * - `'long'`: day, month and year ("י״ד אדר תשפ״ז", "14 Adar 5787");
   * - `'short'`: day and month ("י״ד אדר", "14 Adar");
   * - `'full'`: weekday, then the long form.
   */
  form?: 'long' | 'short' | 'full';
  /** For Hebrew numerals: write the year's thousands (ה׳תשפ״ז). Default `false`. */
  thousands?: boolean;
  /** Wrap right-to-left output in a Unicode isolate. Default `false`. See {@link isolate}. */
  isolate?: boolean;
}

/**
 * Formats a Hebrew date.
 *
 * @example formatHebrewDate({ year: 5787, month: 12, day: 14 }) // "י״ד אדר תשפ״ז"
 * @example formatHebrewDate({ year: 5787, month: 12, day: 14 }, { locale: ashkenazi }) // "14 Adar 5787"
 */
export function formatHebrewDate(date: HebrewDateParts, options?: FormatOptions): string {
  const locale = options?.locale ?? he;
  const form = options?.form ?? 'long';
  const hebrew = locale.numerals === 'hebrew';
  const day = hebrew ? gematriya(date.day) : String(date.day);
  const month = monthName(date.month, date.year, locale);
  let s = `${day} ${month}`;
  if (form !== 'short') {
    const year = hebrew ? gematriya(date.year, { thousands: options?.thousands ?? false }) : String(date.year);
    s += ` ${year}`;
  }
  if (form === 'full') {
    const dow = dayOfWeekOfDays(hebrewToDays(date.year, date.month, date.day));
    s = `${weekdayName(dow, locale)}, ${s}`;
  }
  return options?.isolate && locale.dir === 'rtl' ? isolate(s, 'rtl') : s;
}

/**
 * Formats an instant as wall-clock time in `timeZone`: "21:05" (default) or "9:05 pm".
 * Uses the zone module (Intl, or a provider), not the device's zone.
 */
export function formatTime(instant: Date, timeZone: TimeZone, options?: { hour12?: boolean; seconds?: boolean }): string {
  const p = localParts(instant.getTime(), timeZone);
  const mm = String(p.minute).padStart(2, '0');
  const ss = options?.seconds ? `:${String(p.second).padStart(2, '0')}` : '';
  if (options?.hour12) return `${p.hour % 12 === 0 ? 12 : p.hour % 12}:${mm}${ss} ${p.hour < 12 ? 'am' : 'pm'}`;
  return `${String(p.hour).padStart(2, '0')}:${mm}${ss}`;
}
