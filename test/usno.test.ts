// Published values: US Naval Observatory one-day tables (US government work, public domain),
// entered in test/fixtures/usno.json with their source and retrieval date (docs/data-sources.md).
// USNO rounds to the minute, so Luach must agree to within 60 seconds.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ZmanimCalendar, civilDateAt, civilToDays, daysToCivil } from '../src/index';
import { timeAtZenith } from '../src/zmanim/solar';

const data = JSON.parse(readFileSync('test/fixtures/usno.json', 'utf8')) as {
  source: string;
  rows: { city: string; latitude: number; longitude: number; timeZone: string; date: string; utc: Record<string, string | null> }[];
};

type Fn = (z: ZmanimCalendar) => Date | null;
const civilTwilight = (rising: boolean): Fn => (z) => {
  const transit = z.chatzos().time!.getTime();
  const e = timeAtZenith(transit, z.location.latitude, z.location.longitude, 96, rising);
  return 'time' in e ? new Date(e.time) : null;
};
const FUNCS: Record<string, Fn> = {
  Rise: (z) => z.sunriseSeaLevel().time,
  Set: (z) => z.sunsetSeaLevel().time,
  'Upper Transit': (z) => z.chatzos().time,
  'Begin Civil Twilight': civilTwilight(true),
  'End Civil Twilight': civilTwilight(false),
};

describe('sun times vs published US Naval Observatory tables', () => {
  it('fixture names its source', () => {
    expect(data.source).toMatch(/Naval Observatory/);
    expect(data.rows.length).toBe(32);
  });
  for (const row of data.rows) {
    it(`${row.city} ${row.date}`, () => {
      const loc = { latitude: row.latitude, longitude: row.longitude, timeZone: row.timeZone };
      const [y, m, d] = row.date.split('-').map(Number) as [number, number, number];
      let compared = 0;
      for (const [phen, hhmm] of Object.entries(row.utc)) {
        const f = FUNCS[phen];
        if (!f || !hhmm) continue;
        const [hh, mm] = hhmm.split(':').map(Number) as [number, number];
        const published = Date.UTC(y, m - 1, d, hh, mm);
        // A ZmanimCalendar day follows that civil day's local noon, so near the poles its
        // sunset can fall after local midnight. Compare with the nearer of the two days' events.
        const local = civilDateAt(published, row.timeZone);
        const n = civilToDays(local.year, local.month, local.day);
        const candidates = [n, n - 1]
          .map((k) => f(new ZmanimCalendar(loc, daysToCivil(k), { rounding: false })))
          .filter((t): t is Date => t !== null);
        expect(candidates.length, phen).toBeGreaterThan(0);
        const best = Math.min(...candidates.map((t) => Math.abs(t.getTime() - published)));
        expect(best, `${phen} published ${hhmm} UTC`).toBeLessThanOrEqual(60_000);
        compared += 1;
      }
      expect(compared).toBeGreaterThan(0);
    });
  }
});
