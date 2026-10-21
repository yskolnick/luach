// Oracle: kosher-zmanim (LGPL), used only as an independent check. Never imported by src/.
// Daily comparison, 4 years (2025–2028), 19 cities, every opinion both libraries share. Unrounded.
import { describe, expect, it } from 'vitest';
import * as KZ from 'kosher-zmanim';
import { DateTime } from 'luxon';
import { writeFileSync, mkdirSync } from 'node:fs';
import * as Z from '../../src/zmanim/zmanim.js';
import { gregorianToDayNumber, dayNumberToGregorian } from '../../src/calendar/gregorian.js';
import { TEST_CITIES } from '../fixtures/cities.js';
import { solarAltitude } from '../../src/zmanim/solar.js';

type KZCal = InstanceType<typeof KZ.ComplexZmanimCalendar>;
type Pair = [name: string, ours: Z.ZmanFunction, theirs: (c: KZCal) => unknown];

const PAIRS: Pair[] = [
  ['sunrise (sea level)', Z.sunriseSeaLevel, (c) => c.getSeaLevelSunrise()],
  ['sunset (sea level)', Z.sunsetSeaLevel, (c) => c.getSeaLevelSunset()],
  ['sunrise (elevation)', Z.sunriseElevation, (c) => c.getSunrise()],
  ['sunset (elevation)', Z.sunsetElevation, (c) => c.getSunset()],
  ['alos 72', Z.alos72, (c) => c.getAlos72()],
  ['alos 90', Z.alos90, (c) => c.getAlos90()],
  ['alos 96', Z.alos96, (c) => c.getAlos96()],
  ['alos 120', Z.alos120, (c) => c.getAlos120()],
  ['alos 72 zmaniyos', Z.alos72Zmaniyos, (c) => c.getAlos72Zmanis()],
  ['alos 16.1°', Z.alos16_1, (c) => c.getAlos16Point1Degrees()],
  ['alos 18°', Z.alos18, (c) => c.getAlos18Degrees()],
  ['alos 19.8°', Z.alos19_8, (c) => c.getAlos19Point8Degrees()],
  ['alos 26°', Z.alos26, (c) => c.getAlos26Degrees()],
  ['misheyakir 11.5°', Z.misheyakir11_5, (c) => c.getMisheyakir11Point5Degrees()],
  ['misheyakir 11°', Z.misheyakir11, (c) => c.getMisheyakir11Degrees()],
  ['misheyakir 10.2°', Z.misheyakir10_2, (c) => c.getMisheyakir10Point2Degrees()],
  ['shema Gra', Z.sofZmanShemaGra, (c) => c.getSofZmanShmaGRA()],
  ['shema MA 72', Z.sofZmanShemaMA72, (c) => c.getSofZmanShmaMGA()],
  ['shema MA 90', Z.sofZmanShemaMA90, (c) => c.getSofZmanShmaMGA90Minutes()],
  ['shema MA 72 zmaniyos', Z.sofZmanShemaMA72Zmaniyos, (c) => c.getSofZmanShmaMGA72MinutesZmanis()],
  ['shema MA 90 zmaniyos', Z.sofZmanShemaMA90Zmaniyos, (c) => c.getSofZmanShmaMGA90MinutesZmanis()],
  ['shema MA 16.1°', Z.sofZmanShemaMA16_1, (c) => c.getSofZmanShmaMGA16Point1Degrees()],
  ['shema Baal HaTanya', Z.sofZmanShemaBaalHaTanya, (c) => c.getSofZmanShmaBaalHatanya()],
  ['shema Ateret Torah', Z.sofZmanShemaAteretTorah, (c) => c.getSofZmanShmaAteretTorah()],
  ['tefilla Gra', Z.sofZmanTefillaGra, (c) => c.getSofZmanTfilaGRA()],
  ['tefilla MA 72', Z.sofZmanTefillaMA72, (c) => c.getSofZmanTfilaMGA()],
  ['tefilla MA 16.1°', Z.sofZmanTefillaMA16_1, (c) => c.getSofZmanTfilaMGA16Point1Degrees()],
  ['tefilla Baal HaTanya', Z.sofZmanTefillaBaalHaTanya, (c) => c.getSofZmanTfilaBaalHatanya()],
  ['chatzos (transit)', Z.chatzos, (c) => c.getChatzos()],
  ['mincha gedola Gra', Z.minchaGedolaGra, (c) => c.getMinchaGedola()],
  ['mincha gedola MA 72', Z.minchaGedolaMA72, (c) => c.getMinchaGedola72Minutes()],
  ['mincha ketana Gra', Z.minchaKetanaGra, (c) => c.getMinchaKetana()],
  ['mincha ketana MA 72', Z.minchaKetanaMA72, (c) => c.getMinchaKetana72Minutes()],
  ['plag Gra', Z.plagHaminchaGra, (c) => c.getPlagHamincha()],
  ['plag MA 72', Z.plagHaminchaMA72, (c) => c.getPlagHamincha72Minutes()],
  ['tzeis 8.5°', Z.tzeis8_5, (c) => c.getTzaisGeonim8Point5Degrees()],
  ['tzeis 7.083°', Z.tzeis7_083, (c) => c.getTzaisGeonim7Point083Degrees()],
  ['tzeis 50', Z.tzeis50, (c) => c.getTzais50()],
  ['tzeis 60', Z.tzeis60, (c) => c.getTzais60()],
  ['tzeis 72', Z.tzeis72, (c) => c.getTzais72()],
  ['tzeis 72 zmaniyos', Z.tzeis72Zmaniyos, (c) => c.getTzais72Zmanis()],
  ['tzeis 16.1°', Z.tzeis16_1, (c) => c.getTzais16Point1Degrees()],
];

// The depression angle each comparison depends on, to recognise grazing-sun days.
const ANGLE: Record<string, number> = {
  'sunrise (sea level)': 0.833,
  'sunset (sea level)': 0.833,
  'sunrise (elevation)': 0.833,
  'sunset (elevation)': 0.833,
  'alos 72': 0.833,
  'alos 90': 0.833,
  'alos 96': 0.833,
  'alos 120': 0.833,
  'alos 72 zmaniyos': 0.833,
  'alos 16.1°': 16.1,
  'alos 18°': 18,
  'alos 19.8°': 19.8,
  'alos 26°': 26,
  'misheyakir 11.5°': 11.5,
  'misheyakir 11°': 11,
  'misheyakir 10.2°': 10.2,
  'shema Gra': 0.833,
  'shema MA 72': 0.833,
  'shema MA 90': 0.833,
  'shema MA 72 zmaniyos': 0.833,
  'shema MA 90 zmaniyos': 0.833,
  'shema MA 16.1°': 16.1,
  'shema Baal HaTanya': 1.583,
  'shema Ateret Torah': 0.833,
  'tefilla Gra': 0.833,
  'tefilla MA 72': 0.833,
  'tefilla MA 16.1°': 16.1,
  'tefilla Baal HaTanya': 1.583,
  'chatzos (transit)': 0,
  'mincha gedola Gra': 0.833,
  'mincha gedola MA 72': 0.833,
  'mincha ketana Gra': 0.833,
  'mincha ketana MA 72': 0.833,
  'plag Gra': 0.833,
  'plag MA 72': 0.833,
  'tzeis 8.5°': 8.5,
  'tzeis 7.083°': 7.083,
  'tzeis 50': 0.833,
  'tzeis 60': 0.833,
  'tzeis 72': 0.833,
  'tzeis 72 zmaniyos': 0.833,
  'tzeis 16.1°': 16.1,
};

/**
 * True if, on this day, the sun's highest or lowest altitude is within 1° of the angle: the sun only just
 * reaches (or just fails to reach) it, so the time is extremely sensitive to tiny model differences.
 */
function grazing(n: number, loc: (typeof TEST_CITIES)[string], depression: number): boolean {
  const transit = Z.chatzos(n, loc, { rounding: 'none' }).time!.getTime();
  const highest = solarAltitude(transit, loc.latitude, loc.longitude);
  const lowest = Math.min(
    solarAltitude(transit - 12 * 3_600_000, loc.latitude, loc.longitude),
    solarAltitude(transit + 12 * 3_600_000, loc.latitude, loc.longitude),
  );
  return Math.abs(lowest + depression) < 1 || Math.abs(highest + depression) < 1;
}

const toMs = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const x = v as { toMillis?: () => number };
  return typeof x.toMillis === 'function' ? x.toMillis() : (v as Date).getTime();
};

interface Stat { compared: number; maxDiffSec: number; sumDiffSec: number; over60: string[]; nullMismatch: string[]; grazing: string[] }

// kosher-zmanim 0.9.0 issue #37 ("TimeZone.getRawOffset() is sign-inverted in DST zones, causing false
// antimeridian adjustment"): for these cities it returns the zmanim of the following day. Luach's own date-line
// regression test (test/zmanim.test.ts) and astronomy-engine confirm Luach is on the requested day, so here
// we compare Luach's day D with kosher-zmanim's answer for D - 1.
const KZ_ISSUE_37 = new Set(['Sydney', 'Auckland', 'Chatham']);

// Grazing-sun days (see grazing()) are recorded in the report but not counted as failures.

const stats: Record<string, Stat> = {};
const start = gregorianToDayNumber(2025, 1, 1);
const end = gregorianToDayNumber(2028, 12, 31);

describe('zmanim vs kosher-zmanim, 19 cities, daily 2025–2028', () => {
  for (const [city, loc] of Object.entries(TEST_CITIES)) {
    it(`${city}: agrees within 1 minute`, () => {
      const geo = new KZ.GeoLocation(city, loc.latitude, loc.longitude, loc.elevation ?? 0, loc.timeZone);
      const cal = new KZ.ComplexZmanimCalendar(geo);
      const shift = KZ_ISSUE_37.has(city) ? -1 : 0;
      const problems: string[] = [];
      for (let n = start; n <= end; n += 1) {
        const g = dayNumberToGregorian(n);
        const k = dayNumberToGregorian(n + shift);
        cal.setDate(DateTime.fromObject({ year: k.year, month: k.month, day: k.day }, { zone: loc.timeZone }));
        for (const [name, ours, theirs] of PAIRS) {
          const key = `${city}|${name}`;
          const s = (stats[key] ??= { compared: 0, maxDiffSec: 0, sumDiffSec: 0, over60: [], nullMismatch: [], grazing: [] });
          const a = ours(n, loc, { rounding: 'none' }).time?.getTime() ?? null;
          const b = toMs(theirs(cal));
          const date = `${g.year}-${g.month}-${g.day}`;
          if (a === null || b === null) {
            if ((a === null) !== (b === null)) {
              if (grazing(n, loc, ANGLE[name])) s.grazing.push(`${date} null mismatch`);
              else {
                s.nullMismatch.push(date);
                problems.push(`${key} ${date}: ours=${a} theirs=${b}`);
              }
            }
            continue;
          }
          const diff = Math.abs(a - b) / 1000;
          if (diff > 60 && grazing(n, loc, ANGLE[name])) {
            s.grazing.push(`${date} Δ${diff.toFixed(0)}s`);
            continue;
          }
          s.compared += 1;
          s.sumDiffSec += diff;
          if (diff > s.maxDiffSec) s.maxDiffSec = diff;
          if (diff > 60) {
            s.over60.push(`${date} Δ${diff.toFixed(0)}s`);
            problems.push(`${key} ${date}: Δ${diff.toFixed(0)}s`);
          }
        }
      }
      expect(problems.slice(0, 20)).toEqual([]);
    }, 120_000);
  }

  it('writes the report', () => {
    mkdirSync('reports', { recursive: true });
    writeFileSync('reports/zmanim-kosher-zmanim.json', JSON.stringify(stats, null, 1));
    expect(Object.keys(stats).length).toBe(19 * PAIRS.length);
  });
});
