/**
 * iCalendar (RFC 5545) export of holidays, the parsha, learning cycles, candle lighting,
 * havdala and zmanim over a date range.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { daysToCivil, type CivilDate } from '../time/civil.js';
import { he } from '../locales/he.js';
import type { Locale } from '../locales/types.js';
import { holidaysBetween } from '../holidays/holidays.js';
import { holidayName } from '../holidays/names.js';
import type { HolidayOptions } from '../holidays/types.js';
import { parshaFor, parshaName } from '../parsha/parsha.js';
import { dafYomi } from '../learning/bavli.js';
import { mishnaYomis, nachYomi, rambamOneChapter, rambamThreeChapters, yerushalmiYomi } from '../learning/cycles.js';
import type { DayLocation } from '../day/day-info.js';
import { dayInfo } from '../day/day-info.js';
import { ZmanimCalendar } from '../zmanim/calendar.js';
import type { Zman } from '../zmanim/zman.js';
import { gematriya } from '../text/gematriya.js';

/** Learning cycles that can be included. */
export type IcalLearning = 'dafYomi' | 'yerushalmiYomi' | 'mishnaYomis' | 'rambamOneChapter' | 'rambamThreeChapters' | 'nachYomi';

/** Options for {@link toICalendar}. */
export interface ICalOptions {
  /** Calendar name (X-WR-CALNAME). Default "Luach". */
  name?: string;
  /** Names. Default Hebrew. */
  locale?: Locale;
  /** Israel or the diaspora (explicit wins over `location.israel`). */
  israel?: boolean;
  /** Include holidays (with these options). Default true. */
  holidays?: boolean | Omit<HolidayOptions, 'israel'>;
  /** Include the parsha on each Shabbos. Default true. */
  parsha?: boolean;
  /** Learning cycles to include. Default none. */
  learning?: readonly IcalLearning[];
  /** For candle lighting, havdala and zmanim. Without it, only all-day events. */
  location?: DayLocation;
  /** Candle lighting and havdala (needs `location`). Default true when a location is given. */
  candleLighting?: boolean;
  /** Zmanim to add as timed events, by {@link ZmanimCalendar} method name. Default none. */
  zmanim?: readonly string[];
  /** Timestamp for DTSTAMP. Default now. Pass a fixed value for reproducible files. */
  now?: Date;
}

/** Escapes text for an iCalendar value (RFC 5545 §3.3.11). */
export function icalEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Folds a content line to 75 octets (UTF-8), continuation lines starting with a space (§3.1). */
export function icalFold(line: string): string {
  const out: string[] = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = utf8Length(ch);
    if (bytes + b > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

function utf8Length(ch: string): number {
  const c = ch.codePointAt(0)!;
  return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
const dateValue = (c: CivilDate) => `${pad(c.year, 4)}${pad(c.month)}${pad(c.day)}`;
const utcValue = (d: Date) =>
  `${pad(d.getUTCFullYear(), 4)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

interface Item {
  uid: string;
  summary: string;
  description?: string;
  categories?: string;
  allDay?: CivilDate;
  at?: Date;
}

/**
 * An iCalendar file (as a string with CRLF line endings) for `start` to `end`, inclusive.
 * Import it into any calendar app or serve it as `text/calendar`.
 */
export function toICalendar(start: CivilDate | HebrewDate, end: CivilDate | HebrewDate, options: ICalOptions = {}): string {
  const h0 = start instanceof HebrewDate ? start : HebrewDate.fromCivil(start);
  const h1 = end instanceof HebrewDate ? end : HebrewDate.fromCivil(end);
  if (h1.epochDays < h0.epochDays) throw new RangeError('end is before start');
  const locale = options.locale ?? he;
  const israel = options.israel ?? options.location?.israel ?? false;
  const items: Item[] = [];
  const rtl = locale.dir === 'rtl';

  if (options.holidays !== false) {
    const hopts = { ...(typeof options.holidays === 'object' ? options.holidays : {}), israel };
    for (const e of holidaysBetween(h0, h1, hopts)) {
      const cats = Object.entries(e.flags).filter(([, v]) => v).map(([k, v]) => (k === 'fast' ? `fast-${v}` : k));
      items.push({ uid: `${e.date.toString()}-${e.id}${e.day ?? ''}`, summary: holidayName(e, locale), categories: ['holiday', ...cats].join(','), allDay: e.date.toCivil() });
    }
  }
  for (let d = h0; d.epochDays <= h1.epochDays; d = d.next()) {
    const c = d.toCivil();
    if (options.parsha !== false && d.isShabbos) {
      const r = parshaFor(d, { israel });
      if (r.parsha) items.push({ uid: `${d.toString()}-parsha`, summary: `${rtl ? 'פרשת' : 'Parshas'} ${parshaName(r.parsha, locale)}`, categories: 'parsha', allDay: c });
    }
    for (const l of options.learning ?? []) {
      let text: string | null = null;
      if (l === 'dafYomi') {
        const p = dafYomi(d);
        text = p ? (rtl ? `דף יומי: ${p.tractateHe} ${gematriya(p.daf)}` : `Daf Yomi: ${p.tractate} ${p.daf}`) : null;
      } else {
        const p = { yerushalmiYomi, mishnaYomis, rambamOneChapter, rambamThreeChapters, nachYomi }[l](d);
        text = p ? (rtl ? p.textHe : p.text) : null;
      }
      if (text) items.push({ uid: `${d.toString()}-${l}`, summary: text, categories: 'learning', allDay: c });
    }
    if (options.location) {
      const z = new ZmanimCalendar(options.location, d);
      if (options.candleLighting !== false) {
        const info = dayInfo(d, { location: options.location, israel, locale });
        if (info.candleLighting?.time) items.push({ uid: `${d.toString()}-candles`, summary: rtl ? 'הדלקת נרות' : 'Candle lighting', description: `${info.candleLighting.opinion}. ${info.candleLighting.source}`, categories: 'candle-lighting', at: new Date(info.candleLighting.time) });
        if (info.havdala?.time) items.push({ uid: `${d.toString()}-havdala`, summary: rtl ? 'הבדלה' : 'Havdala', description: `${info.havdala.opinion}. ${info.havdala.source}`, categories: 'havdala', at: new Date(info.havdala.time) });
      }
      for (const m of options.zmanim ?? []) {
        const f = (z as unknown as Record<string, unknown>)[m];
        if (typeof f !== 'function') throw new RangeError(`Unknown zman method "${m}"`);
        const zm = (f as () => Zman).call(z);
        if (zm.time) items.push({ uid: `${d.toString()}-${zm.id}`, summary: zm.opinion, description: zm.source, categories: 'zman', at: zm.time });
      }
    }
  }

  const stamp = utcValue(options.now ?? new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luach//Hebrew calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icalEscape(options.name ?? 'Luach')}`,
  ];
  for (const it of items) {
    lines.push('BEGIN:VEVENT', `UID:${it.uid}@luach`, `DTSTAMP:${stamp}`);
    if (it.allDay) {
      const next = daysToCivil(HebrewDate.fromCivil(it.allDay).epochDays + 1);
      lines.push(`DTSTART;VALUE=DATE:${dateValue(it.allDay)}`, `DTEND;VALUE=DATE:${dateValue(next)}`, 'TRANSP:TRANSPARENT');
    } else if (it.at) {
      lines.push(`DTSTART:${utcValue(it.at)}`, `DTEND:${utcValue(it.at)}`, 'TRANSP:TRANSPARENT');
    }
    lines.push(`SUMMARY:${icalEscape(it.summary)}`);
    if (it.description) lines.push(`DESCRIPTION:${icalEscape(it.description)}`);
    if (it.categories) lines.push(`CATEGORIES:${it.categories}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(icalFold).join('\r\n') + '\r\n';
}
