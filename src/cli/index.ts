/**
 * The `luach` command-line tool.
 *
 *   luach today --city Lakewood
 *   luach zmanim 2027-03-14 --lat 40.08 --lon -74.21 --tz America/New_York
 *   luach holidays 5787 --israel
 *   luach parsha 2026-10-24 --diaspora
 *   luach convert 2026-10-21          luach convert 5787-8-10 --hebrew
 *   luach ical holidays --from 2026-09-01 --to 2027-09-30 --diaspora > holidays.ics
 *   luach cities "bnei brak"
 *
 * Ask your rav. This tool calculates; it does not rule.
 *
 * @packageDocumentation
 */

import process from 'node:process';
import * as L from '../index.js';

declare const __LUACH_VERSION__: string;
const VERSION = typeof __LUACH_VERSION__ === 'string' ? __LUACH_VERSION__ : 'dev';

interface Args {
  command: string;
  positional: string[];
  flags: Record<string, string | true>;
}

function parse(argv: string[]): Args {
  const [command = 'help', ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i] as string;
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=', 2) as [string, string | undefined];
      if (v !== undefined) flags[k] = v;
      else if (rest[i + 1] !== undefined && !(rest[i + 1] as string).startsWith('--') && !['israel', 'diaspora', 'json', 'hebrew', 'modern', 'elevation'].includes(k)) {
        flags[k] = rest[i + 1] as string;
        i += 1;
      } else flags[k] = true;
    } else positional.push(a);
  }
  return { command, positional, flags };
}

// Exit quietly when the reader goes away (e.g. `luach holidays | head`).
process.stdout.on('error', (e: NodeJS.ErrnoException) => {
  if (e.code === 'EPIPE') process.exit(0);
  throw e;
});

const out = (s = ''): void => {
  process.stdout.write(s + '\n');
};
const fail = (msg: string): never => {
  process.stderr.write(`luach: ${msg}\n`);
  process.exit(1);
};

function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// The full city table is large; load it only when the built-in table has no match.
let fullTable: L.CityTable | undefined;
async function loadFullTable(): Promise<L.CityTable> {
  fullTable ??= (await import('../cities-full.js')).FULL_CITY_TABLE;
  return fullTable;
}

/** Resolve --city before anything else, so the rest can stay synchronous. */
async function preloadCity(flags: Args['flags']): Promise<void> {
  if (typeof flags.city === 'string' && !L.findCity(flags.city)) await loadFullTable();
}

function resolveLocation(flags: Args['flags']): (L.GeoLocation & { israel?: boolean }) | undefined {
  if (typeof flags.city === 'string') {
    const c = L.findCity(flags.city) ?? (fullTable ? L.findCity(flags.city, { table: fullTable }) : undefined);
    if (!c) return fail(`no city matches "${flags.city}" (try: luach cities "${flags.city}")`);
    return { ...c, name: c.name };
  }
  if (flags.lat !== undefined || flags.lon !== undefined) {
    const latitude = Number(flags.lat);
    const longitude = Number(flags.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return fail('--lat and --lon must be numbers');
    const elevation = typeof flags.elevation === 'string' ? Number(flags.elevation) : 0;
    const timeZone = typeof flags.tz === 'string' ? flags.tz : localZone();
    return { latitude, longitude, elevation, timeZone, israel: L.isInIsrael(latitude, longitude) };
  }
  return undefined;
}

function resolveCalendar(flags: Args['flags'], loc?: { israel?: boolean }): { calendar: L.Location; note: string } {
  if (flags.israel) return { calendar: 'israel', note: 'Israel calendar' };
  if (flags.diaspora) return { calendar: 'diaspora', note: 'diaspora calendar' };
  if (loc?.israel !== undefined) {
    return loc.israel
      ? { calendar: 'israel', note: 'Israel calendar (from the location; --diaspora to change)' }
      : { calendar: 'diaspora', note: 'diaspora calendar (from the location; --israel to change)' };
  }
  return { calendar: 'diaspora', note: 'diaspora calendar (default; pass --israel or --diaspora)' };
}

function parseDate(s: string | undefined, zone: string): L.DayNumber {
  if (s === undefined || s === 'today') return L.dayNumberInZone(Date.now(), zone);
  const m = /^(-?\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (!m) return fail(`dates are YYYY-MM-DD, got "${s}"`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (!L.isValidGregorian(y, mo, d)) return fail(`no such date ${s}`);
  return L.gregorianToDayNumber(y, mo, d);
}

function style(flags: Args['flags']): L.NameStyle {
  const s = flags.style;
  if (s === undefined) return 'ashkenazi';
  if (s === 'he' || s === 'ashkenazi' || s === 'sephardi' || s === 'en') return s;
  return fail('--style is one of he, ashkenazi, sephardi, en');
}

function header(n: L.DayNumber, names: L.NameStyle): string {
  const g = L.dayNumberToGregorian(n);
  const h = L.dayNumberToHebrew(n);
  const greg = new Date(Date.UTC(g.year, g.month - 1, g.day)).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${greg} · ${L.formatHebrewDate(h, { style: names === 'he' ? 'ashkenazi' : names })} · ${L.formatHebrewDate(h, { style: 'he' })}`;
}

function printDay(n: L.DayNumber, a: Args, zmanimOnly = false): void {
  const loc = resolveLocation(a.flags);
  const names = style(a.flags);
  const { calendar, note } = resolveCalendar(a.flags, loc);
  if (!loc) {
    if (zmanimOnly) fail('zmanim need a place: --city NAME, or --lat N --lon N [--tz ZONE]');
    if (a.flags.json) {
      out(JSON.stringify({ date: L.dayNumberToGregorian(n), hebrew: L.dayNumberToHebrew(n), holidays: L.holidaysOn(n, { location: calendar }) }, null, 2));
      return;
    }
    out(header(n, names));
    out(note);
    for (const h of L.holidaysOn(n, { location: calendar })) out(`  ${L.holidayName(h, names)}`);
    const r = L.parshaOn(n, calendar);
    out(`Parsha: ${L.readingName(r, names)}`);
    out('Add --city NAME or --lat/--lon for zmanim.');
    return;
  }
  const day = L.getDay(n, { location: loc, calendar, names, modernIsraeli: Boolean(a.flags.modern) });
  if (a.flags.json) {
    out(JSON.stringify(day, null, 2));
    return;
  }
  out(header(n, names));
  out(`${loc.name ?? `${loc.latitude}, ${loc.longitude}`} (${loc.timeZone}) · ${note}`);
  if (!zmanimOnly) {
    for (const h of day.holidays) out(`  ${h.name}`);
    out(`Parsha: ${day.parsha.name}${day.parsha.shabbos !== day.gregorian ? ` (Shabbos ${day.parsha.shabbos})` : ''}`);
    if (day.omer) out(`Omer: ${day.omer.textEnglish} ${day.omer.sefirah}`);
    if (day.molad) out(day.molad);
    const l = day.learning;
    out(`Daf Yomi: ${l.dafYomi?.text ?? '—'} · Yerushalmi: ${l.yerushalmi?.text.replace('Yerushalmi ', '') ?? '—'} · Mishna Yomis: ${l.mishnaYomis?.text ?? '—'}`);
    out(`Rambam: ${l.rambam3?.text ?? '—'} · Nach Yomi: ${l.nachYomi?.text ?? '—'}`);
  }
  out('');
  out('Zmanim — each line names its opinion. Ask your rav.');
  const row = (z: L.DayZman) => out(`  ${z.local ?? ' --- '}  ${z.opinion}${z.reason ? ` (${z.reason.replace(/-/g, ' ')})` : ''}`);
  for (const z of Object.values(day.zmanim)) row(z);
  if (day.candleLighting) row(day.candleLighting);
  if (day.havdala) row(day.havdala);
  if (day.fast) {
    row(day.fast.begins);
    row(day.fast.ends);
  }
}

function help(): void {
  out(`luach ${VERSION} — Hebrew calendar and zmanim. Ask your rav: this calculates; it does not rule.

Usage:
  luach today    [place] [calendar] [--style he|ashkenazi|sephardi|en] [--json]
  luach date     YYYY-MM-DD [place] [calendar] [--json]
  luach zmanim   [YYYY-MM-DD] place [--json]
  luach holidays [HEBREW_YEAR] [calendar] [--modern] [--json]
  luach parsha   [YYYY-MM-DD] [calendar]
  luach convert  YYYY-MM-DD            Gregorian → Hebrew
  luach convert  YYYY-M-D --hebrew     Hebrew (months from Nisan = 1) → Gregorian
  luach ical     holidays|zmanim --from YYYY-MM-DD --to YYYY-MM-DD [place] [calendar]
  luach cities   NAME

Place:    --city NAME   or   --lat N --lon N [--elevation M] [--tz IANA_ZONE]
Calendar: --israel or --diaspora (default: from the place, else diaspora)

Luach is free software by Yosef Skolnick (Apache-2.0). https://github.com/yskolnick/luach`);
}

export async function main(argv: string[]): Promise<void> {
  const a = parse(argv);
  await preloadCity(a.flags);
  const zone = resolveLocation(a.flags)?.timeZone ?? localZone();
  switch (a.command) {
    case 'today':
      return printDay(parseDate('today', zone), a);
    case 'date':
      return printDay(parseDate(a.positional[0], zone), a);
    case 'zmanim':
      return printDay(parseDate(a.positional[0], zone), a, true);
    case 'holidays': {
      const loc = resolveLocation(a.flags);
      const { calendar, note } = resolveCalendar(a.flags, loc);
      const year = a.positional[0] ? Number(a.positional[0]) : L.dayNumberToHebrew(parseDate('today', zone)).year;
      if (!Number.isInteger(year) || year < 2 || year > 9998) return fail('HEBREW_YEAR is a number such as 5787');
      const list = L.holidaysInYear(year, { location: calendar, modernIsraeli: Boolean(a.flags.modern) });
      if (a.flags.json) return out(JSON.stringify(list, null, 2));
      out(`Hebrew year ${year} (${L.gematriya(year)}) · ${note}`);
      for (const h of list) {
        if (h.category === 'shabbos-mevorchim' || h.category === 'erev') continue;
        const g = L.dayNumberToGregorian(h.dayNumber);
        out(`  ${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}  ${L.holidayName(h, style(a.flags))}`);
      }
      return;
    }
    case 'parsha': {
      const { calendar, note } = resolveCalendar(a.flags, resolveLocation(a.flags));
      const r = L.parshaOn(parseDate(a.positional[0], zone), calendar);
      const g = L.dayNumberToGregorian(r.dayNumber);
      return out(`Shabbos ${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}: ${L.readingName(r, style(a.flags))} / ${L.readingName(r, 'he')} · ${note}`);
    }
    case 'convert': {
      const s = a.positional[0];
      if (!s) return fail('convert needs a date');
      if (a.flags.hebrew) {
        const m = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(s);
        if (!m) return fail('Hebrew dates are YEAR-MONTH-DAY with months from Nisan = 1, e.g. 5787-8-10');
        const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
        if (!L.isValidHebrew(y, mo, d)) return fail(`no such Hebrew date ${s}`);
        const g = L.hebrewToGregorian({ year: y, month: mo, day: d });
        return out(`${L.formatHebrewDate({ year: y, month: mo, day: d }, { style: style(a.flags) })} = ${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')} (from sunset the evening before)`);
      }
      const n = parseDate(s, zone);
      const h = L.dayNumberToHebrew(n);
      const st = style(a.flags);
      const both = st === 'he' ? L.formatHebrewDate(h, { style: 'he' }) : `${L.formatHebrewDate(h, { style: st })} = ${L.formatHebrewDate(h, { style: 'he' })}`;
      return out(`${s} = ${both} (daytime; after sunset it is ${L.formatHebrewDate(L.dayNumberToHebrew(n + 1), { style: st })})`);
    }
    case 'ical': {
      const kind = a.positional[0];
      const loc = resolveLocation(a.flags);
      const { calendar } = resolveCalendar(a.flags, loc);
      const from = parseDate(typeof a.flags.from === 'string' ? a.flags.from : undefined, zone);
      const to = typeof a.flags.to === 'string' ? parseDate(a.flags.to, zone) : from + 365;
      if (to < from) return fail('--to is before --from');
      if (kind === 'holidays') {
        return void process.stdout.write(L.toICalendar(L.holidayICalItems(from, to, { location: calendar, names: style(a.flags) }), { name: 'Luach holidays' }));
      }
      if (kind === 'zmanim') {
        if (!loc) return fail('zmanim need a place: --city NAME or --lat/--lon');
        if (to - from > 400) return fail('at most 400 days of zmanim at a time');
        return void process.stdout.write(L.toICalendar(L.zmanimICalItems(from, to, loc, L.DEFAULT_DAY_ZMANIM), { name: `Luach zmanim ${loc.name ?? ''}`.trim() }));
      }
      return fail('ical needs "holidays" or "zmanim"');
    }
    case 'cities': {
      const q = a.positional.join(' ');
      if (!q) return fail('cities needs a name');
      const hits = L.searchCities(q, { limit: 10 });
      const table = hits.length < 10 ? await loadFullTable() : undefined;
      const more = table ? L.searchCities(q, { table, limit: 10 - hits.length }).filter((c) => !hits.some((h) => h.id === c.id)) : [];
      for (const c of [...hits, ...more]) out(`${c.name}${c.hebrewName ? ` (${c.hebrewName})` : ''}, ${c.country} · ${c.latitude}, ${c.longitude} · ${c.elevation} m · ${c.timeZone}${c.israel ? ' · Israel calendar' : ''}`);
      if (hits.length + more.length === 0) out('No match.');
      return;
    }
    case 'version':
    case '--version':
      return out(VERSION);
    case 'help':
    case '--help':
    case '-h':
      return help();
    default:
      help();
      process.exit(1);
  }
}

void main(process.argv.slice(2));
