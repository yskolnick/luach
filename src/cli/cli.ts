#!/usr/bin/env node
/**
 * The `luach` command line.
 *
 *   luach today --city lakewood
 *   luach now --city jerusalem
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
import { formatHebrewDate, weekdayName } from '../text/format.js';
import { parseHebrewDate } from '../text/parse.js';
import { he } from '../locales/he.js';
import { ashkenazi } from '../locales/ashkenazi.js';
import { sephardi } from '../locales/sephardi.js';
import { en } from '../locales/en.js';
import { chabad } from '../locales/chabad.js';
import { israeli } from '../locales/israeli.js';
import { yi } from '../locales/yi.js';
import { extendLocale, type Locale } from '../locales/types.js';
import { parseNames } from '../locales/entries.js';
import { holidaysForYear } from '../holidays/holidays.js';
import { holidayName } from '../holidays/names.js';
import { dayInfo, type DayLocation } from '../day/day-info.js';
import { nowInfo, type NowInfo } from '../day/now.js';
import { zonedParts } from '../time/zoned.js';
import { toICalendar } from '../output/ical.js';
import type { IcalLearningName } from '../learning/index.js';
// The learning cycles are loaded (by mainAsync) only for the commands that show them.
let learningModule: typeof import('../learning/index.js') | undefined;
import { getPlace, searchPlaces, isInIsrael, foldName, distanceKm, type Place } from '../places/places.js';
import { Zmanim, type Opinions, type ZmanimSettings } from '../zmanim/zmanim.js';
import type { ZmanId } from '../zmanim/opinions.js';
import { ZMANIM, zmanLabel } from '../zmanim/opinions.js';
import { termName } from '../locales/terms.js';
import type { Zman } from '../zmanim/zman.js';

declare const process: {
  argv: string[];
  stdout: { write(s: string): void; on?(event: 'error', cb: (e: { code?: string }) => void): void };
  stderr: { write(s: string): void };
  exitCode?: number;
};

/** Kept equal to package.json's version by scripts/release.mjs. */
export const VERSION = '0.3.0';
const LOCALES: Record<string, Locale> = { he, ashkenazi, sephardi, en, chabad, israeli, yi };

const HELP = `luach ${VERSION}: Hebrew calendar, holidays, parsha, learning and zmanim

Usage:
  luach today [place] [options]           everything about today
  luach date <YYYY-MM-DD> [place]         everything about a date
  luach now [place] [--at <instant>]      what is true at this moment: the Hebrew date, whether
                                          melacha is forbidden and until when, fast, tonight, what is next
  luach zmanim [YYYY-MM-DD] <place> [--all]
  luach holidays [<Hebrew year>] [--israel]
  luach convert <YYYY-MM-DD | "14 Adar 5787">
  luach ics <from YYYY-MM-DD> <to YYYY-MM-DD> [place] [--learning dafYomi,mishnaYomis]
  luach cities <name>

Place:   --city <name or id>  |  --lat <deg> --lon <deg> --tz <IANA zone>
         --city searches the built-in places, then every city of 15,000+ people.
         --city with --lat and --lon: that city (with its own candle-lighting custom, if it has one)
         at that position; the time zone is the city's unless --tz is given.
         --elevation <m> (or --elevation=<m>): elevation-adjusted sunrise and sunset at
         that height (today, date, now, zmanim); bare --elevation with --city uses the
         place's elevation. Default: sea level, as most luchos.
Options: --locale he|ashkenazi|sephardi|en|chabad|israeli|yi   --israel | --diaspora   --json   --help   --version
         --names '<json>'               change names within the --locale, e.g. '{"term.shabbos":"Shabbes","month.10":"Tevet"}'
                                        (keys: month.N, weekday.N, holiday.<id>, zman.<id>, parsha.<id>, term.<word>)
         --at <ISO 8601 instant, e.g. 2026-10-23T15:00:00Z> (now only; default: this moment)
Choices (today, date, now, zmanim, ics):
         --opinions '<json>'            e.g. '{"tzeis":"tzeis-rabbeinu-tam","havdala":"tzeis-72"}'
         --candle-minutes <0-180>       minutes before sunset (default 18, or a city's own custom)
         --high-latitude none|nearestDay|halfNight
                                        what to do where the sun does not reach an angle (default none: no time)
         --chanukah-lighting sunset|tzeis
                                        (now only) the custom for the earliest time to light the Chanukah
                                        lights on a weekday evening (default tzeis; both are shown)
         Any option may also be written --name=value.

Ask your rav. This library calculates; it does not rule.
`;

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, string | true> } {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 2) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
        continue;
      }
      const key = a.slice(2);
      const next = argv[i + 1];
      // --elevation takes a value only when one follows (bare --elevation uses the place's).
      const takes = key === 'elevation' ? next !== undefined && NUMBER.test(next) : !['israel', 'diaspora', 'json', 'all', 'help', 'version'].includes(key);
      if (next !== undefined && !next.startsWith('--') && takes) {
        flags[key] = next;
        i++;
      } else flags[key] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

const NUMBER = /^-?\d+(\.\d+)?$/;

/** The names' language from --locale; an unknown one is a usage error. */
function localeFlag(flags: Record<string, string | true>): Locale {
  const name = str(flags, 'locale') ?? 'ashkenazi';
  const found = Object.prototype.hasOwnProperty.call(LOCALES, name) ? LOCALES[name] : undefined;
  if (!found) throw new CliProblem(`--locale takes he, ashkenazi, sephardi, en, chabad, israeli or yi, not "${name}"`);
  const text = flags.names;
  if (text === undefined) return found;
  const example = '\'{"term.shabbos":"Shabbes"}\'';
  if (typeof text !== 'string') throw new CliProblem(`--names takes a JSON object, e.g. ${example}`);
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new CliProblem(`--names is not valid JSON; give an object, e.g. ${example}`);
  }
  const parsed = parseNames(json);
  if (!parsed.ok) throw new CliProblem(`--names: ${parsed.problems.map((p) => (p.key ? `${p.key}: ` : '') + p.problem).join('\nluach: --names: ')}`);
  return extendLocale(found, { ...parsed.value });
}

/** An instant with an explicit offset: `Z` or `±hh:mm`. Without one it would be read in this computer's zone. */
function instantFlag(text: string | undefined): Date {
  if (text === undefined) return new Date();
  const ok = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(text);
  const instant = ok ? new Date(text) : null;
  if (!instant || Number.isNaN(instant.getTime())) throw new CliProblem(`--at takes an ISO 8601 instant with an explicit offset (Z or +hh:mm), e.g. 2026-10-23T15:00:00Z; "${text}" is not one`);
  return instant;
}

/** Whether the person gave opinions: then a day lists their own time for each part of the day. */
const hasOpinions = (o: Opinions | undefined): o is Opinions => o !== undefined && Object.keys(o).length > 0;

function str(flags: Record<string, string | true>, k: string): string | undefined {
  const v = flags[k];
  return typeof v === 'string' ? v : undefined;
}

// The full city table is large; it is loaded (by mainAsync) only when the built-in table
// has no exact or prefix match.
let fullTable: readonly Place[] | undefined;

/** True if one of the place's names is the query, or starts with it. */
function strongMatch(p: Place, query: string): boolean {
  const q = foldName(query);
  return [p.name, p.nameHe, ...p.aliases, p.id].some((n) => n && foldName(n).startsWith(q));
}

function builtInCity(city: string): Place | undefined {
  const p = getPlace(city) ?? searchPlaces(city)[0];
  return p && (p.id === city || strongMatch(p, city)) ? p : undefined;
}

/**
 * A built-in name or prefix match; then a full-table name or prefix match; then any built-in
 * match; then any full-table match. A loose (transliteration or substring) match in the full
 * table never beats a built-in place.
 */
function findCity(city: string): Place | undefined {
  const strong = builtInCity(city);
  if (strong) return strong;
  const full = fullTable ? searchPlaces(city, { places: fullTable })[0] : undefined;
  if (full && strongMatch(full, city)) return full;
  return searchPlaces(city)[0] ?? full;
}

/** Metres from --elevation, `true` for bare --elevation, or undefined. */
function elevationFlag(flags: Record<string, string | true>): number | true | undefined {
  const v = flags.elevation;
  if (v === undefined || v === true) return v;
  if (!NUMBER.test(v)) throw new Error(`--elevation takes metres, got "${v}"`);
  return Number(v);
}

function place(flags: Record<string, string | true>): DayLocation | undefined {
  const elev = elevationFlag(flags);
  const city = str(flags, 'city');
  if (city) {
    const p = findCity(city);
    if (!p) throw new Error(`No place matches "${city}". Try: luach cities ${city}`);
    const lat = str(flags, 'lat');
    const lon = str(flags, 'lon');
    // A city with a position (a GPS fix in a chosen city): the city, with its custom, at the given
    // position; the zone is the city's unless --tz is given.
    if (lat !== undefined || lon !== undefined) {
      if (lat === undefined || lon === undefined) throw new Error('Give both --lat and --lon');
      const latitude = Number(lat);
      const longitude = Number(lon);
      if (!NUMBER.test(lat) || !NUMBER.test(lon) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('--lat and --lon must be numbers');
      const tz = str(flags, 'tz');
      return { ...p, latitude, longitude, ...(tz ? { timeZone: tz } : {}), ...(typeof elev === 'number' ? { elevation: elev } : {}) };
    }
    return typeof elev === 'number' ? { ...p, elevation: elev } : p;
  }
  const lat = str(flags, 'lat');
  const lon = str(flags, 'lon');
  if (lat === undefined && lon === undefined) return undefined;
  if (lat === undefined || lon === undefined) throw new Error('Give both --lat and --lon');
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('--lat and --lon must be numbers');
  // Never guess the zone from the computer running the command: zmanim would be printed
  // in the wrong zone for the place.
  const timeZone = str(flags, 'tz');
  if (!timeZone) throw new Error('Give --tz <IANA zone> with --lat/--lon (e.g. --tz America/New_York)');
  if (elev === true) throw new Error('With --lat/--lon, give the height: --elevation <metres>');
  return { latitude, longitude, elevation: elev ?? 0, timeZone, israel: isInIsrael(latitude, longitude) };
}

function icalLearningOrProblem(names: IcalLearningName[]): ReturnType<typeof import('../learning/index.js').icalLearning> {
  try {
    if (!learningModule) throw new Error('the learning cycles are not loaded: run through mainAsync');
    return learningModule.icalLearning(names);
  } catch (e) {
    throw new CliProblem(`--learning: ${(e as Error).message}`);
  }
}

/** A problem with what the user typed: printed to stderr by `main`, exit code 1. */
class CliProblem extends Error {}

/** The user's choices from the flags: elevation, opinions, candle-lighting minutes and the high-latitude rule. */
function zmanimOptions(flags: Record<string, string | true>): ZmanimSettings & { opinions?: Opinions } {
  const out: { -readonly [K in keyof ZmanimSettings]: ZmanimSettings[K] } & { opinions?: Opinions } = {};
  if (elevationFlag(flags) !== undefined) out.useElevation = true;
  const minutes = flags['candle-minutes'];
  if (minutes !== undefined) {
    if (typeof minutes !== 'string' || !NUMBER.test(minutes) || Number(minutes) < 0 || Number(minutes) > 180) throw new CliProblem('--candle-minutes takes a number of minutes from 0 to 180');
    out.candleLightingMinutes = Number(minutes);
  }
  const fallback = flags['high-latitude'];
  if (fallback !== undefined) {
    if (fallback !== 'none' && fallback !== 'nearestDay' && fallback !== 'halfNight') throw new CliProblem('--high-latitude takes none, nearestDay or halfNight');
    out.highLatitudeFallback = fallback;
  }
  const text = flags.opinions;
  if (text !== undefined) {
    if (typeof text !== 'string') throw new CliProblem('--opinions takes a JSON object, e.g. \'{"tzeis":"tzeis-rabbeinu-tam"}\'');
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new CliProblem('--opinions is not valid JSON; give an object, e.g. \'{"tzeis":"tzeis-rabbeinu-tam"}\'');
    }
    const parsed = Zmanim.parseOpinions(json);
    if (!parsed.ok) throw new CliProblem(`--opinions: ${parsed.problems.map((p) => (p.key ? `${p.key}: ` : '') + p.problem).join('\nluach: --opinions: ')}`);
    out.opinions = parsed.value;
  }
  return out;
}

/** The note on the 18-minute default for a location in Israel without its own custom, or null. */
function israelNote(loc: DayLocation | undefined, flags: Record<string, string | true>): string | null {
  if (!loc) return null;
  const { opinions, ...settings } = zmanimOptions(flags);
  return new Zmanim(loc, opinions ?? {}, settings).candleNote;
}

function elevationNote(loc: DayLocation, flags: Record<string, string | true>): string {
  return zmanimOptions(flags).useElevation ? `Elevation-adjusted sunrise and sunset at ${loc.elevation ?? 0} m; degree-based zmanim stay at sea level.` : '';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A time's wall clock, with its date beside it when it falls on another civil day in the place's zone than `shown` (YYYY-MM-DD). */
function dated(z: { time: string | null; local: string | null; timeZone: string }, shown: string): string {
  if (z.time === null || z.local === null) return '—';
  const p = zonedParts(new Date(z.time), z.timeZone);
  const date = formatIsoDate(p);
  return date === shown ? z.local : `${z.local} (${p.day} ${MONTHS[p.month - 1]})`;
}

function printDay(date: CivilDate, flags: Record<string, string | true>): void {
  const loc = place(flags);
  const locale = localeFlag(flags);
  const israel = israelFlag(flags);
  const chosen = zmanimOptions(flags);
  // With --opinions, the day's times each by the user's opinion; otherwise the usual set.
  const info = dayInfo(date, { ...(learningModule ? { learning: learningModule.dayLearning } : {}), ...chosen, ...(hasOpinions(chosen.opinions) ? { zmanim: Zmanim.order } : {}), ...(loc ? { location: loc } : {}), ...(israel !== undefined ? { israel } : {}), locale });
  if (flags.json) return line(JSON.stringify(info, null, 2));
  line(`${info.gregorian}  ${info.weekdayName}, ${info.hebrew.formatted}${loc && 'name' in loc && loc.name ? `  (${loc.name})` : ''}`);
  // An eve that is also one of the day's events (the eve of Yom Kippur) is printed with the events.
  const eves = info.erev.filter((e) => !info.events.some((ev) => ev.id === e.id));
  if (eves.length) line(`  ${eves.map((e) => e.name).join(', ')}`);
  for (const e of info.events) line(`  • ${e.name}`);
  if (info.parsha?.name) line(`  ${termName('parsha', locale)} (${info.parsha.date}): ${info.parsha.name}`);
  if (info.omer) line(`  ${termName('omer', locale)}: ${info.omer.textEnglish}`);
  for (const [k, v] of Object.entries(info.learning ?? {})) if (v) line(`  ${k}: ${v}`);
  if (info.zmanim.length) {
    line('  Zmanim:');
    const note = loc ? elevationNote(loc, flags) : '';
    if (note) line(`    (${note})`);
    for (const z of info.zmanim) line(`    ${dated(z, info.gregorian).padEnd(6)} ${zmanLabel(z.id, locale)}`);
  }
  if (info.candleLighting) {
    const c = info.candleLighting;
    const chosen = zmanimOptions(flags).candleLightingMinutes;
    const custom = c.id === 'candle-lighting' && chosen === undefined && loc?.candleLighting;
    const note = custom
      ? `  (${c.opinion}; ${custom.source})`
      : c.id !== 'candle-lighting'
        ? ''
        : chosen !== undefined
          ? `  (${chosen} minutes before sunset, as you chose)`
          : israelNote(loc, flags)
            ? `  (18 minutes before sunset: Luach's default; ${israelNote(loc, flags)!.slice(1)}`
            : "  (18 minutes before sunset: Luach's default)";
    line(`  ${termName('candle-lighting', locale)}: ${dated(c, info.gregorian)}${note}`);
  }
  if (info.havdala) line(`  ${termName('havdala', locale)}${info.havdala.id === 'havdala-after-fast' ? ' (after the fast)' : ''}: ${dated(info.havdala, info.gregorian)}`);
  if (info.shabbosEnds) line(`  ${termName('shabbos', locale)} ends (no havdala; say Baruch HaMavdil before melacha): ${dated(info.shabbosEnds, info.gregorian)}`);
  if (info.fast) line(`  Fast: ${dated(info.fast.begins, info.gregorian)} – ${dated(info.fast.ends, info.gregorian)}`);
  if (info.fastBeginsTonight) line(`  Fast begins: ${dated(info.fastBeginsTonight.begins, info.gregorian)}`);
  line('  Ask your rav. Each time follows a named opinion; see --json for sources.');
}

/** A zman's time for a person: the place's date and the displayed minute, or why there is none. */
function when(z: NowInfo['melacha']['begins'], now: NowInfo): string {
  if (z.time === null || z.local === null) return 'no time at this place';
  // The date of the displayed minute (`time`), as the wall clock `local` shows it.
  const p = zonedParts(new Date(z.time), now.clock.timeZone);
  const date = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  return date === now.clock.date ? `${z.local} today` : `${date} ${z.local}`;
}

function printNow(flags: Record<string, string | true>): void {
  const loc = place(flags);
  if (!loc) throw new Error('now needs a place: --city or --lat/--lon');
  const locale = localeFlag(flags);
  const israel = israelFlag(flags);
  const instant = instantFlag(str(flags, 'at'));
  const lighting = flags['chanukah-lighting'];
  if (lighting !== undefined && lighting !== 'sunset' && lighting !== 'tzeis') throw new CliProblem('--chanukah-lighting takes sunset or tzeis');
  const info = nowInfo(instant, loc, { ...(learningModule ? { learning: learningModule.dayLearning } : {}), ...zmanimOptions(flags), ...(lighting ? { chanukahLighting: lighting } : {}), ...(israel !== undefined ? { israel } : {}), locale });
  if (flags.json) return line(JSON.stringify(info, null, 2));
  const c = info.clock;
  line(`${c.date} ${c.time}  ${weekdayName(c.dayOfWeek, locale)}${loc.name ? `  (${loc.name}, ${c.timeZone})` : `  (${c.timeZone})`}`);
  const note = elevationNote(loc, flags);
  if (note) line(`  ${note}`);
  const h = info.hebrewDate;
  line(`Hebrew date: ${h.formatted}`);
  line(`  began ${when(h.begins, info)}; changes ${when(h.ends, info)}`);
  const m = info.melacha;
  const names = m.days.map((d) => [d.shabbos ? termName('shabbos', locale) : '', ...d.events.filter((e) => e.flags.melachaForbidden).map((e) => e.name)].filter(Boolean).join(' / ')).join(', ');
  line(`Melacha (${names}): ${m.inProgress === null ? 'not known: Luach has no time at this place to decide by' : m.inProgress ? 'forbidden now' : 'not forbidden now'}`);
  const candleNote = m.begins.id === 'candle-lighting' && info.settings.candleLightingNote ? `  (18 minutes before sunset: Luach's default; ${info.settings.candleLightingNote.slice(1)}` : '';
  line(`  ${m.inProgress ? 'began with' : 'begins with'} ${zmanLabel(m.begins.id, locale)}: ${when(m.begins, info)}${candleNote}`);
  line(`  ends with ${zmanLabel(m.ends.id, locale)}: ${when(m.ends, info)}`);
  if (info.fast) {
    const f = info.fast;
    line(`Fast (${f.event.name}): ${f.inProgress === null ? 'not known: Luach has no time at this place to decide by' : f.inProgress ? 'on now' : 'not on now'}`);
    line(`  begins: ${when(f.begins, info)}; ends: ${when(f.ends, info)}`);
  }
  // Both nights, with their times: when a night ends (dawn or sunrise) is the reader's choice, not Luach's.
  for (const [label, n] of [['The night of the Hebrew date now', info.night], ['The next night', info.nextNight]] as const) {
    if (!n.omer && !n.chanukahLights) continue;
    line(`${label} (${n.hebrewDate.formatted}): sunset ${when(n.sunset, info)}, nightfall ${when(n.tzeis, info)}, dawn ${when(n.alos, info)}, sunrise ${when(n.sunrise, info)}`);
    if (n.omer) line(`  ${termName('omer', locale)}: day ${n.omer}`);
    if (n.chanukahLights) line(`  Chanukah: ${n.chanukahLights} ${n.chanukahLights === 1 ? 'light' : 'lights'}`);
    const l = n.chanukahLighting;
    if (l) {
      // Each custom is listed, and the one in force is marked: your choice, or Luach's default.
      if (l.evening === 'weekday') for (const c of l.customs) line(`    earliest ${when(c.earliest, info)}: ${c.opinion.split(':')[0]}${l.custom === c.id ? (l.isDefault ? " (Luach's default)" : ' (your choice)') : ''}`);
      else if (l.evening === 'erev-shabbos') line(`    earliest ${when(l.earliest!, info)}: from plag hamincha by your plag opinion (the Mishna Berura counts plag from nightfall), before the Shabbos candles (${when(l.before!, info)})`);
      else line(`    earliest ${when(l.earliest!, info)}: after Shabbos ends (the lights or havdala first: a custom Luach does not choose)`);
      line(`    may be lit until dawn (${when(l.until, info)}); the proper time is about half an hour from the earliest`);
    }
  }
  if (info.upcoming.length) {
    line('Next:');
    for (const u of info.upcoming.slice(0, 6)) line(`  ${when(u.zman, info).padEnd(18)} ${zmanLabel(u.zman.id, locale)}`);
  }
  line('  Ask your rav. Each time follows a named opinion; see --json for sources.');
}

function printZmanim(date: CivilDate, flags: Record<string, string | true>): void {
  const loc = place(flags);
  if (!loc) throw new Error('zmanim needs a place: --city or --lat/--lon');
  const locale = localeFlag(flags);
  const { opinions, ...settings } = zmanimOptions(flags);
  // A city's own candle-lighting custom applies unless --candle-minutes is given.
  const day = new Zmanim(loc, opinions ?? {}, settings).on(date);
  const all = (Object.keys(ZMANIM) as ZmanId[]).filter((id) => 'at' in ZMANIM[id]);
  const shown: readonly ZmanId[] = flags.all ? all : ['alos-72', 'alos-16.1', 'misheyakir-11', 'sunrise', 'sof-zman-shema-mga-72', 'sof-zman-shema-gra', 'sof-zman-tefilla-gra', 'chatzos', 'mincha-gedola-greater', 'mincha-ketana-gra', 'plag-hamincha-gra', 'sunset', 'tzeis-8.5', 'tzeis-72'];
  // With --opinions, the day's times each by the user's opinion; otherwise the usual set.
  const out: ReturnType<Zman['toJSON']>[] = hasOpinions(opinions) && !flags.all ? day.slots().map((z) => z.toJSON()) : shown.map((id) => day.get(id).toJSON());
  if (flags.json) return line(JSON.stringify(out, null, 2));
  line(`Zmanim for ${formatIsoDate(date)} (${typeof loc.timeZone === 'string' ? loc.timeZone : loc.timeZone.name})`);
  const note = elevationNote(loc, flags);
  if (note) line(`  ${note}`);
  for (const r of out) {
    const custom = r.id === 'candle-lighting' && loc.candleLighting && zmanimOptions(flags).candleLightingMinutes === undefined ? `  (${loc.candleLighting.minutes} minutes, ${loc.candleLighting.custom}: ${loc.candleLighting.source})` : '';
    line(`  ${dated(r, formatIsoDate(date)).padEnd(6)} ${zmanLabel(r.id, locale)}${r.reason ? `  [${r.reason}]` : ''}${custom}`);
  }
  line('Ask your rav. Sources: luach zmanim --json, or the ZMANIM table in the docs.');
  void ZMANIM;
}

export function main(argv: string[]): number {
  try {
    return run(argv);
  } catch (e) {
    if (!(e instanceof CliProblem)) throw e;
    process.stderr.write(`luach: ${e.message}\n`);
    return 1;
  }
}

function run(argv: string[]): number {
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
    case 'now':
      printNow(flags);
      return 0;
    case 'zmanim':
      printZmanim(rest[0] ? parseIsoDate(rest[0]) : todayIn(place(flags)), flags);
      return 0;
    case 'holidays': {
      const year = rest[0] ? Number(rest[0]) : HebrewDate.today().year;
      const locale = localeFlag(flags);
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
      if (flags.elevation !== undefined) throw new Error('--elevation is not supported by ics yet');
      const loc = place(flags);
      const learning = (str(flags, 'learning') ?? '').split(',').filter(Boolean) as IcalLearningName[];
      const locale = localeFlag(flags);
      const israel = israelFlag(flags);
      process.stdout.write(toICalendar(parseIsoDate(rest[0] ?? ''), parseIsoDate(rest[1] ?? ''), { ...zmanimOptions(flags), ...(loc ? { location: loc } : {}), ...(israel !== undefined ? { israel } : {}), ...(learning.length ? { learning: icalLearningOrProblem(learning) } : {}), locale }));
      return 0;
    }
    case 'cities': {
      const q = rest.join(' ');
      const found = searchPlaces(q, { limit: 20 });
      // With the full table loaded, add its cities that are not built-in places already.
      if (fullTable) for (const f of searchPlaces(q, { places: fullTable, limit: 20 })) if (found.length < 20 && !found.some((p) => distanceKm(p.latitude, p.longitude, f.latitude, f.longitude) < 10)) found.push(f);
      for (const p of found) line(`${p.id.padEnd(18)} ${p.name}  ${p.nameHe}  (${p.timeZone}${p.israel ? ', Israel' : ''})`);
      return 0;
    }
    default:
      process.stderr.write(`Unknown command "${cmd}".\n\n${HELP}`);
      return 1;
  }
}

/**
 * {@link main}, after loading the full city table when `--city` (or `cities`) has no exact
 * or prefix match among the built-in places. The table is a separate module, imported only
 * then, so ordinary runs do not parse it.
 */
export async function mainAsync(argv: string[]): Promise<number> {
  const { positional, flags } = parseArgs(argv);
  const city = str(flags, 'city') ?? (positional[0] === 'cities' ? positional.slice(1).join(' ') : undefined);
  if (city && !fullTable && !builtInCity(city)) fullTable = (await import('../places/full.js')).fullPlaces();
  if (!learningModule && ['today', 'date', 'now', 'ics'].includes(positional[0] ?? '')) learningModule = await import('../learning/index.js');
  return main(argv);
}

// Run when executed directly (not when imported by tests).
const self = typeof process !== 'undefined' && process.argv[1] ? process.argv[1] : '';
if (/luach(\.js)?$|cli(\.js|\.cjs)?$/.test(self)) {
  // Quietly stop when the reader goes away (e.g. `luach holidays | head`).
  process.stdout.on?.('error', (e) => {
    if (e.code === 'EPIPE') process.exitCode = 0;
  });
  mainAsync(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e: unknown) => {
      process.stderr.write(`luach: ${(e as Error).message}\n`);
      process.exitCode = 1;
    },
  );
}
