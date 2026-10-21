/**
 * Zmanim against kosher-zmanim (LGPL, test-only oracle), 19 cities, 2025–2028.
 * By default every 5th day; set FULL_ORACLE=1 to compare every day (CI does).
 * Differences over 1 minute are collected and must be explained in docs/accuracy.md.
 */
import { appendFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as KZ from 'kosher-zmanim';
import { ZmanimCalendar, civilToDays, daysToCivil, localParts, solarAltitude, type Zman } from '../src/index';
import { TEST_CITIES } from './fixtures/cities';

/** Calls a kosher-zmanim method whose typings demand optional arguments. */
const call = (c: KZ.ComplexZmanimCalendar, m: string): unknown => (c as unknown as Record<string, () => unknown>)[m]!();

const STEP = process.env.FULL_ORACLE ? 1 : 5;

type Pair = [string, (z: ZmanimCalendar) => Zman, (c: KZ.ComplexZmanimCalendar) => unknown];
const PAIRS: Pair[] = [
  ['sunrise', (z) => z.sunriseSeaLevel(), (c) => c.getSeaLevelSunrise()],
  ['sunset', (z) => z.sunsetSeaLevel(), (c) => c.getSeaLevelSunset()],
  ['alos-72', (z) => z.alos72(), (c) => c.getAlos72()],
  ['alos-90', (z) => z.alos90(), (c) => c.getAlos90()],
  ['alos-72-zmaniyos', (z) => z.alos72Zmaniyos(), (c) => c.getAlos72Zmanis()],
  ['alos-16.1', (z) => z.alos16Point1(), (c) => c.getAlos16Point1Degrees()],
  ['alos-18', (z) => z.alos18(), (c) => c.getAlos18Degrees()],
  ['alos-19.8', (z) => z.alos19Point8(), (c) => c.getAlos19Point8Degrees()],
  ['alos-26', (z) => z.alos26(), (c) => c.getAlos26Degrees()],
  ['misheyakir-10.2', (z) => z.misheyakir10Point2(), (c) => c.getMisheyakir10Point2Degrees()],
  ['misheyakir-11', (z) => z.misheyakir11(), (c) => c.getMisheyakir11Degrees()],
  ['misheyakir-11.5', (z) => z.misheyakir11Point5(), (c) => c.getMisheyakir11Point5Degrees()],
  ['sof-zman-shema-gra', (z) => z.sofZmanShemaGra(), (c) => c.getSofZmanShmaGRA()],
  ['sof-zman-shema-mga-72', (z) => z.sofZmanShemaMga72(), (c) => c.getSofZmanShmaMGA()],
  ['sof-zman-shema-mga-90', (z) => z.sofZmanShemaMga90(), (c) => c.getSofZmanShmaMGA90Minutes()],
  ['sof-zman-shema-mga-16.1', (z) => z.sofZmanShemaMga16Point1(), (c) => c.getSofZmanShmaMGA16Point1Degrees()],
  ['sof-zman-shema-baal-hatanya', (z) => z.sofZmanShemaBaalHaTanya(), (c) => c.getSofZmanShmaBaalHatanya()],
  ['sof-zman-shema-ateret-torah', (z) => z.sofZmanShemaAteretTorah(), (c) => c.getSofZmanShmaAteretTorah()],
  ['sof-zman-tefilla-gra', (z) => z.sofZmanTefillaGra(), (c) => c.getSofZmanTfilaGRA()],
  ['sof-zman-tefilla-mga-72', (z) => z.sofZmanTefillaMga72(), (c) => c.getSofZmanTfilaMGA()],
  ['chatzos', (z) => z.chatzos(), (c) => c.getChatzos()],
  ['mincha-gedola-30', (z) => z.minchaGedola30(), (c) => c.getMinchaGedola30Minutes()],
  ['mincha-gedola-gra', (z) => z.minchaGedolaGra(), (c) => c.getMinchaGedola()],
  ['mincha-gedola-greater', (z) => z.minchaGedolaGreater(), (c) => c.getMinchaGedolaGreaterThan30()],
  ['mincha-ketana-gra', (z) => z.minchaKetanaGra(), (c) => call(c, 'getMinchaKetana')],
  ['plag-hamincha-gra', (z) => z.plagHaminchaGra(), (c) => call(c, 'getPlagHamincha')],
  ['plag-hamincha-mga-72', (z) => z.plagHaminchaMga72(), (c) => c.getPlagHamincha72Minutes()],
  ['plag-hamincha-baal-hatanya', (z) => z.plagHaminchaBaalHaTanya(), (c) => c.getPlagHaminchaBaalHatanya()],
  ['alos-baal-hatanya', (z) => z.alosBaalHaTanya(), (c) => c.getAlosBaalHatanya()],
  ['tzeis-baal-hatanya', (z) => z.tzeisBaalHaTanya(), (c) => c.getTzaisBaalHatanya()],
  ['tzeis-8.5', (z) => z.tzeis8Point5(), (c) => c.getTzaisGeonim8Point5Degrees()],
  ['tzeis-7.083', (z) => z.tzeis7Point083(), (c) => c.getTzaisGeonim7Point083Degrees()],
  ['tzeis-6.45', (z) => z.tzeis6Point45(), (c) => c.getTzaisGeonim6Point45Degrees()],
  ['tzeis-50', (z) => z.tzeis50(), (c) => c.getTzais50()],
  ['tzeis-72', (z) => z.tzeis72(), (c) => c.getTzais72()],
  ['tzeis-ateret-torah', (z) => z.tzeisAteretTorah(), (c) => c.getTzaisAteretTorah()],
  ['candle-lighting', (z) => z.candleLighting(18), (c) => c.getCandleLighting()],
  ['alos-96', (z) => z.alos96(), (c) => c.getAlos96()],
  ['alos-120', (z) => z.alos120(), (c) => c.getAlos120()],
  ['alos-90-zmaniyos', (z) => z.alos90Zmaniyos(), (c) => c.getAlos90Zmanis()],
  ['tzeis-60', (z) => z.tzeis60(), (c) => c.getTzais60()],
  ['sof-zman-shema-mga-72-zmaniyos', (z) => z.sofZmanShemaMga72Zmaniyos(), (c) => c.getSofZmanShmaMGA72MinutesZmanis()],
  ['sof-zman-shema-mga-90-zmaniyos', (z) => z.sofZmanShemaMga90Zmaniyos(), (c) => c.getSofZmanShmaMGA90MinutesZmanis()],
  ['mincha-gedola-baal-hatanya', (z) => z.minchaGedolaBaalHaTanya(), (c) => c.getMinchaGedolaBaalHatanya()],
  ['mincha-ketana-baal-hatanya', (z) => z.minchaKetanaBaalHaTanya(), (c) => c.getMinchaKetanaBaalHatanya()],
  ['mincha-ketana-mga-72', (z) => z.minchaKetanaMga72(), (c) => c.getMinchaKetana72Minutes()],
  ['plag-hamincha-mga-16.1', (z) => z.plagHaminchaMga16Point1(), (c) => c.getPlagHamincha16Point1Degrees()],
  ['bein-hashmashos-rabbeinu-tam', (z) => z.beinHashmashosRabbeinuTam(), (c) => c.getBainHashmashosRT58Point5Minutes()],
  ['bein-hashmashos-yereim-18', (z) => z.beinHashmashosYereim(18), (c) => c.getBainHashmashosYereim18Minutes()],
  ['bein-hashmashos-yereim-16.875', (z) => z.beinHashmashosYereim(16.875), (c) => c.getBainHashmashosYereim16Point875Minutes()],
  ['bein-hashmashos-yereim-13.5', (z) => z.beinHashmashosYereim(13.5), (c) => c.getBainHashmashosYereim13Point5Minutes()],
];

/** Degrees below the horizon for angle-based zmanim (for the grazing check). */
const ANGLE: Record<string, number> = {
  'alos-16.1': 16.1, 'alos-18': 18, 'alos-19.8': 19.8, 'alos-26': 26, 'alos-baal-hatanya': 16.9,
  'misheyakir-10.2': 10.2, 'misheyakir-11': 11, 'misheyakir-11.5': 11.5, 'tzeis-8.5': 8.5,
  'tzeis-7.083': 7.083, 'tzeis-6.45': 6.45, 'tzeis-baal-hatanya': 6, 'sof-zman-shema-mga-16.1': 16.1,
};

export interface OracleStats {
  city: string;
  zman: string;
  compared: number;
  maxSeconds: number;
  over60: number;
  nullMismatch: number;
  dayShifted: number;
  unreachable: number;
  /** Over-60s differences on days the sun only grazes the angle (within 0.5° at its lowest). */
  grazing: string[];
}

function kzMillis(v: unknown): number | null {
  return v && typeof (v as { toMillis?: () => number }).toMillis === 'function' ? (v as { toMillis: () => number }).toMillis() : null;
}

export function compareCity(city: (typeof TEST_CITIES)[number], step = STEP): OracleStats[] {
  const geo = new KZ.GeoLocation(city.name, city.latitude, city.longitude, 0, city.timeZone);
  const kz = new KZ.ComplexZmanimCalendar(geo);
  const stats = new Map<string, OracleStats>();
  for (const [id] of PAIRS) stats.set(id, { city: city.name, zman: id, compared: 0, maxSeconds: 0, over60: 0, nullMismatch: 0, dayShifted: 0, unreachable: 0, grazing: [] });
  for (let d = civilToDays(2025, 1, 1); d < civilToDays(2029, 1, 1); d += step) {
    const date = daysToCivil(d);
    const ours = new ZmanimCalendar(city, date, { rounding: false });
    // kosher-zmanim issue #37 moves some date-line cities a day ahead; ask it for the
    // day that lands on ours (checked via its chatzos).
    const probe = (s: number) => {
      const c = daysToCivil(d + s);
      kz.setDate(KZ.DateTime.fromObject({ year: c.year, month: c.month, day: c.day }, { zone: city.timeZone }));
      for (const t of [kzMillis(kz.getChatzos()), kzMillis(kz.getSeaLevelSunrise())]) {
        if (t === null) continue;
        const p = localParts(t, city.timeZone);
        if (p.day !== date.day || p.month !== date.month) return false;
      }
      return true;
    };
    let shift: number | null = null;
    for (const s of [0, -1, 1]) if (probe(s)) { shift = s; break; }
    if (shift === null) {
      // kosher-zmanim cannot produce this day at all; counted, not compared.
      for (const st of stats.values()) st.unreachable++;
      continue;
    }
    if (shift !== 0) probe(shift);
    for (const [id, f, g] of PAIRS) {
      const st = stats.get(id)!;
      const a = f(ours).time?.getTime() ?? null;
      const b = kzMillis(g(kz));
      if (shift) st.dayShifted++;
      if ((a === null) !== (b === null)) {
        st.nullMismatch++;
        continue;
      }
      if (a === null || b === null) continue;
      const diff = Math.abs(a - b) / 1000;
      st.compared++;
      if (diff > 60) {
        const deg = ANGLE[id];
        if (deg !== undefined) {
          const low = Math.min(
            solarAltitude(ours.chatzosHalayla().time!.getTime(), city.latitude, city.longitude),
            solarAltitude(ours.prevDay().chatzosHalayla().time!.getTime(), city.latitude, city.longitude),
          );
          if (Math.abs(low + deg) < 0.5) {
            st.grazing.push(`${date.year}-${date.month}-${date.day} ${diff.toFixed(0)}s`);
            continue;
          }
        }
        st.over60++;
      }
      st.maxSeconds = Math.max(st.maxSeconds, diff);
    }
  }
  return [...stats.values()];
}

describe(`zmanim vs kosher-zmanim, 19 cities, 2025–2028, every ${STEP} day(s)`, () => {
  for (const city of TEST_CITIES) {
    it(city.name, () => {
      const stats = compareCity(city);
      // Null mismatches are allowed only on the boundary days when the sun first or last
      // reaches an angle (at most 2 per year per zman); they are listed in docs/accuracy.md.
      const bad = stats.filter((s) => s.over60 > 0 || s.nullMismatch > 8 / STEP + 2);
      if (process.env.ACCURACY_OUT) for (const s of stats) appendFileSync(process.env.ACCURACY_OUT, JSON.stringify(s) + '\n');
      // Printed so the accuracy report can be regenerated from CI logs.
      for (const s of stats) if (s.maxSeconds > 30 || s.nullMismatch || s.grazing.length) console.log(JSON.stringify(s));
      expect(bad.map((s) => `${s.zman}: max ${s.maxSeconds.toFixed(0)}s, over 60s ${s.over60}, null mismatch ${s.nullMismatch}`)).toEqual([]);
    });
  }
});
