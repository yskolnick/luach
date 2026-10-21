#!/usr/bin/env node
/**
 * The `luach` command line.
 *
 *   luach today --city lakewood
 *   luach zmanim 2027-03-14 --lat 40.08 --lon -74.21 --tz America/New_York
 *   luach holidays 5787 --israel
 *   luach convert 2026-10-21        luach convert "14 Adar II 5787"
 *   luach ics 2026-09-01 2027-08-31 --city london > luach.ics
 *   luach cities bnei
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { parseIsoDate, formatIsoDate, type CivilDate } from '../time/civil.js';
import { civilDateAt } from '../time/zone.js';
import { formatHebrewDate } from '../text/format.js';
import { parseHebrewDate } from '../text/parse.js';
import { he } from '../locales/he.js';
import { ashkenazi } from '../locales/ashkenazi.js';
import { sephardi } from '../locales/sephardi.js';
import { en } from '../locales/en.js';
import type { Locale } from '../locales/types.js';
import { holidaysForYear } from '../holidays/holidays.js';
import { holidayName } from '../holidays/names.js';
import { dayInfo, type DayLocation } from '../day/day-info.js';
import { toICalendar, type IcalLearning } from '../output/ical.js';
import { getPlace, searchPlaces, isInIsrael } from '../places/places.js';
import { ZmanimCalendar } from '../zmanim/calendar.js';
import { ZMANIM, zmanLabel } from '../zmanim/opinions.js';
import type { Zman } from '../zmanim/zman.js';

declare const process: {
  argv: string[];
  stdout: { write(s: string): void; on?(event: 'error', cb: (e: { code?: string }) => void): void };
  stderr: { write(s: string): void };
  exitCode?: number;
};

/** Kept equal to package.json's version by scripts/release.mjs. */
export const VERSION = '0.1.0';
const LOCALES: Record<string, Locale> = { he, ashkenazi, sephardi, en };

const HELP = `luach ${VERSION}: Hebrew calendar, holidays, parsha, learning and zmanim

Usage:
  luach today [place] [options]           everything about today
  luach date <YYYY-MM-DD> [place]         everything about a date
  luach zmanim [YYYY-MM-DD] <place> [--all]
  luach holidays [<Hebrew year>] [--israel]
  luach convert <YYYY-MM-DD | "14 Adar 5787">
  luach ics <from YYYY-MM-DD> <to YYYY-MM-DD> [place] [--learning dafYomi,mishnaYomis]
  luach cities <name>

Place:   --city <name or id>  |  --lat <deg> --lon <deg> [--elevation <m>] [--tz <IANA zone>]
Options: --locale he|ashkenazi|sephardi|en   --israel | --diaspora   --json   --help   --version

Ask your rav. This library calculates; it does not rule.
`;

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, string | true> } {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--') && !['israel', 'diaspora', 'json', 'all', 'help', 'version'].includes(key)) {
        flags[key] = next;
        i++;
      } else flags[key] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

function str(flags: Record<string, string | true>, k: string): string | undefined {
  const v = flags[k];
  return typeof v === 'string' ? v : undefined;
}

function place(flags: Record<string, string | true>): DayLocation | undefined {
  const city = str(flags, 'city');
  if (city) {
    const p = getPlace(city) ?? searchPlaces(city)[0];
    if (!p) throw new Error(`No built-in place matches "${city}". Try: luach cities ${city}`);
    return p;
  }
  const lat = str(flags, 'lat');
  const lon = str(flags, 'lon');
  if (lat === undefined && lon === undefined) return undefined;
  if (lat === undefined || lon === undefined) throw new Error('Give both --lat and --lon');
  const latitude = Number(lat);
  const longitude = Number(lon);
  return {
    latitude,
    longitude,
    elevation: Number(str(flags, 'elevation') ?? 0),
    timeZone: str(flags, 'tz') ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    israel: isInIsrael(latitude, longitude),
  };
}

function israelFlag(flags: Record<string, string | true>): boolean | undefined {
  return flags.israel ? true : flags.diaspora ? false : undefined;
}

function line(s = ''): void {
  process.stdout.write(s + '\n');
}

function todayIn(loc: DayLocation | undefined): CivilDate {
  return civilDateAt(Date.now(), loc?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
}

function printDay(date: CivilDate, flags: Record<string, string | true>): void {
  const loc = place(flags);
  const locale = LOCALES[str(flags, 'locale') ?? 'ashkenazi'] ?? ashkenazi;
  const israel = israelFlag(flags);
  const info = dayInfo(date, { ...(loc ? { location: loc } : {}), ...(israel !== undefined ? { israel } : {}), locale });
  if (flags.json) return line(JSON.stringify(info, null, 2));
  line(`${info.gregorian}  ${info.weekdayName}, ${info.hebrew.formatted}${loc && 'name' in loc && loc.name ? `  (${loc.name})` : ''}`);
  for (const e of info.events) line(`  • ${e.name}`);
  if (info.parsha.name) line(`  Parsha (${info.parsha.date}): ${info.parsha.name}`);
  if (info.omer) line(`  Omer: ${info.omer.textEnglish}`);
  for (const [k, v] of Object.entries(info.learning)) if (v) line(`  ${k}: ${v}`);
  if (info.zmanim.length) {
    line('  Zmanim:');
    for (const z of info.zmanim) line(`    ${(z.local ?? '—').padEnd(6)} ${zmanLabel(z.id, locale)}`);
  }
  if (info.candleLighting) {
    const c = info.candleLighting;
    const custom = c.id === 'candle-lighting' && loc?.candleLighting;
    const note = custom ? `  (${c.opinion}; ${custom.source})` : c.id === 'candle-lighting' ? '  (18 minutes before sunset, the common default)' : '';
    line(`  Candle lighting: ${c.local}${note}`);
  }
  if (info.havdala) line(`  Havdala: ${info.havdala.local}`);
  if (info.fast) line(`  Fast: ${info.fast.begins.local} – ${info.fast.ends.local}`);
  line('  Ask your rav. Each time follows a named opinion; see --json for sources.');
}

function printZmanim(date: CivilDate, flags: Record<string, string | true>): void {
  const loc = place(flags);
  if (!loc) throw new Error('zmanim needs a place: --city or --lat/--lon');
  const locale = LOCALES[str(flags, 'locale') ?? 'ashkenazi'] ?? ashkenazi;
  const z = new ZmanimCalendar(loc, date);
  const methods = Object.getOwnPropertyNames(ZmanimCalendar.prototype).filter((n) => /^(alos|misheyakir|sunrise|sofZman|chatzos|mincha|plag|sunset|beinHashmashos|tzeis|candle|havdala)/.test(n));
  const shown = flags.all ? methods : ['alos72', 'alos16Point1', 'misheyakir11', 'sunrise', 'sofZmanShemaMga72', 'sofZmanShemaGra', 'sofZmanTefillaGra', 'chatzos', 'minchaGedolaGreater', 'minchaKetanaGra', 'plagHaminchaGra', 'sunset', 'tzeis8Point5', 'tzeis72'];
  const out: ReturnType<Zman['toJSON']>[] = [];
  for (const m of shown) {
    const f = (z as unknown as Record<string, () => Zman>)[m];
    if (typeof f === 'function') out.push(f.call(z).toJSON());
  }
  if (flags.json) return line(JSON.stringify(out, null, 2));
  line(`Zmanim for ${formatIsoDate(date)} (${typeof loc.timeZone === 'string' ? loc.timeZone : loc.timeZone.name})`);
  for (const r of out) line(`  ${(r.local ?? '—').padEnd(6)} ${zmanLabel(r.id, locale)}${r.reason ? `  [${r.reason}]` : ''}`);
  line('Ask your rav. Sources: luach zmanim --json, or the ZMANIM table in the docs.');
  void ZMANIM;
}

export function main(argv: string[]): number {
  const { positional, flags } = parseArgs(argv);
  const [cmd, ...rest] = positional;
  if (flags.version) return line(VERSION), 0;
  if (flags.help) return line(HELP), 0;
  if (!cmd) return line(HELP), 1;
  switch (cmd) {
    case 'today':
      printDay(todayIn(place(flags)), flags);
      return 0;
    case 'date':
      printDay(parseIsoDate(rest[0] ?? ''), flags);
      return 0;
    case 'zmanim':
      printZmanim(rest[0] ? parseIsoDate(rest[0]) : todayIn(place(flags)), flags);
      return 0;
    case 'holidays': {
      const year = rest[0] ? Number(rest[0]) : HebrewDate.today().year;
      const locale = LOCALES[str(flags, 'locale') ?? 'ashkenazi'] ?? ashkenazi;
      const events = holidaysForYear(year, { israel: israelFlag(flags) ?? false });
      if (flags.json) return line(JSON.stringify(events, null, 2)), 0;
      for (const e of events) line(`${formatIsoDate(e.date.toCivil())}  ${formatHebrewDate(e.date, { locale, form: 'short' }).padEnd(16)} ${holidayName(e, locale)}`);
      return 0;
    }
    case 'convert': {
      const text = rest.join(' ');
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        const h = HebrewDate.fromCivil(parseIsoDate(text));
        line(`${formatHebrewDate(h, { locale: ashkenazi })}  |  ${formatHebrewDate(h)}`);
      } else {
        const h = parseHebrewDate(text);
        line(formatIsoDate(h.toCivil()));
      }
      return 0;
    }
    case 'ics': {
      const loc = place(flags);
      const learning = (str(flags, 'learning') ?? '').split(',').filter(Boolean) as IcalLearning[];
      const locale = LOCALES[str(flags, 'locale') ?? 'ashkenazi'] ?? ashkenazi;
      const israel = israelFlag(flags);
      process.stdout.write(toICalendar(parseIsoDate(rest[0] ?? ''), parseIsoDate(rest[1] ?? ''), { ...(loc ? { location: loc } : {}), ...(israel !== undefined ? { israel } : {}), learning, locale }));
      return 0;
    }
    case 'cities':
      for (const p of searchPlaces(rest.join(' '), { limit: 20 })) line(`${p.id.padEnd(18)} ${p.name}  ${p.nameHe}  (${p.timeZone}${p.israel ? ', Israel' : ''})`);
      return 0;
    default:
      process.stderr.write(`Unknown command "${cmd}".\n\n${HELP}`);
      return 1;
  }
}

// Run when executed directly (not when imported by tests).
const self = typeof process !== 'undefined' && process.argv[1] ? process.argv[1] : '';
if (/luach(\.js)?$|cli(\.js|\.cjs)?$/.test(self)) {
  // Quietly stop when the reader goes away (e.g. `luach holidays | head`).
  process.stdout.on?.('error', (e) => {
    if (e.code === 'EPIPE') process.exitCode = 0;
  });
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`luach: ${(e as Error).message}\n`);
    process.exitCode = 1;
  }
}
