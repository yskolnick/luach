/**
 * iCalendar (RFC 5545) export of holidays, zmanim and other dated items.
 *
 * Output uses CRLF line endings, folds lines at 75 octets (never inside a UTF-8 character), escapes text,
 * writes all-day items as DATE values and times as UTC instants, and gives every item a stable UID, so
 * re-importing a file updates events instead of duplicating them.
 *
 * @packageDocumentation
 */

import { type DayNumber, dayNumberToGregorian } from '../calendar/gregorian.js';
import type { NameStyle } from '../format/names.js';
import { type HolidayOptions, holidayName, holidaysBetween } from '../holidays/holidays.js';
import type { GeoLocation, ZmanFunction, ZmanOptions } from '../zmanim/zmanim.js';

/** One calendar item. Either all-day (`date`) or at an instant (`start`). */
export type ICalItem =
  | { readonly uid: string; readonly title: string; readonly date: DayNumber; readonly description?: string; readonly categories?: readonly string[] }
  | { readonly uid: string; readonly title: string; readonly start: Date; readonly durationMinutes?: number; readonly description?: string; readonly categories?: readonly string[] };

export interface ICalOptions {
  /** Calendar name (X-WR-CALNAME). */
  readonly name?: string;
  /** DTSTAMP for every item. Default: the current time. Pass a fixed value for reproducible files. */
  readonly timestamp?: Date;
}

/** Escape TEXT values (RFC 5545 §3.3.11). */
export function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold a content line at 75 octets (RFC 5545 §3.1), never splitting a UTF-8 sequence. */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = '';
  let octets = 0;
  for (const ch of line) {
    const size = utf8Length(ch);
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (octets + size > limit) {
      parts.push(current);
      current = '';
      octets = 0;
    }
    current += ch;
    octets += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function utf8Length(ch: string): number {
  const c = ch.codePointAt(0) ?? 0;
  return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
function dateValue(n: DayNumber): string {
  const g = dayNumberToGregorian(n);
  return `${pad(g.year, 4)}${pad(g.month)}${pad(g.day)}`;
}
function utcValue(d: Date): string {
  return `${pad(d.getUTCFullYear(), 4)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Build a complete VCALENDAR. */
export function toICalendar(items: readonly ICalItem[], options: ICalOptions = {}): string {
  const stamp = utcValue(options.timestamp ?? new Date());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Luach//Luach Hebrew calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  if (options.name) lines.push(`X-WR-CALNAME:${escapeText(options.name)}`);
  for (const item of items) {
    lines.push('BEGIN:VEVENT', `UID:${escapeText(item.uid)}`, `DTSTAMP:${stamp}`, `SUMMARY:${escapeText(item.title)}`);
    if ('date' in item) {
      lines.push(`DTSTART;VALUE=DATE:${dateValue(item.date)}`, `DTEND;VALUE=DATE:${dateValue(item.date + 1)}`, 'TRANSP:TRANSPARENT');
    } else {
      lines.push(`DTSTART:${utcValue(item.start)}`, `DURATION:PT${Math.max(0, Math.round(item.durationMinutes ?? 0))}M`, 'TRANSP:TRANSPARENT');
    }
    if (item.description) lines.push(`DESCRIPTION:${escapeText(item.description)}`);
    if (item.categories?.length) lines.push(`CATEGORIES:${item.categories.map(escapeText).join(',')}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Holidays between two day numbers as all-day iCal items. */
export function holidayICalItems(start: DayNumber, end: DayNumber, options: HolidayOptions & { names?: NameStyle }): ICalItem[] {
  return holidaysBetween(start, end, options).map((h) => ({
    uid: `${h.id}${h.day !== undefined ? `-${h.day}` : ''}-${dateValue(h.dayNumber)}-${options.location}@luach`,
    title: holidayName(h, options.names ?? 'en'),
    date: h.dayNumber,
    categories: [h.category],
  }));
}

/**
 * Chosen zmanim for each day in a range as timed iCal items. Each item's description carries the opinion and
 * its source. Days on which a zman doesn't exist are skipped.
 */
export function zmanimICalItems(
  start: DayNumber,
  end: DayNumber,
  location: GeoLocation,
  zmanim: Readonly<Record<string, ZmanFunction>>,
  options: ZmanOptions = {},
): ICalItem[] {
  const out: ICalItem[] = [];
  for (let n = start; n <= end; n += 1) {
    for (const [key, f] of Object.entries(zmanim)) {
      const z = f(n, location, options);
      if (!z.time) continue;
      out.push({
        uid: `${key}-${dateValue(n)}-${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}@luach`,
        title: z.opinion,
        start: z.time,
        description: `${z.opinion}. Source: ${z.source}. Rounded ${z.rounded}. Ask your rav; this calculates, it does not rule.`,
        categories: ['zmanim'],
      });
    }
  }
  return out;
}
