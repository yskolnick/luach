// Published values: US Naval Observatory one-day tables (US government work, public domain), entered from
// test/fixtures/usno.json with source and retrieval date. Luach must agree to within a minute (USNO rounds to the minute).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import * as Z from '../src/zmanim/zmanim.js';
import { gregorianToDayNumber } from '../src/calendar/gregorian.js';
import { dayNumberInZone } from '../src/time/zone.js';

const data = JSON.parse(readFileSync('test/fixtures/usno.json', 'utf8')) as {
  rows: { city: string; latitude: number; longitude: number; timeZone: string; date: string; utc: Record<string, string | null> }[];
};

const FUNCS: Record<string, Z.ZmanFunction> = {
  Rise: Z.sunriseSeaLevel,
  Set: Z.sunsetSeaLevel,
  'Upper Transit': Z.chatzos,
  'Begin Civil Twilight': Z.alosAtDegrees(6),
  'End Civil Twilight': Z.tzeisAtDegrees(6),
};

describe('sun times vs published US Naval Observatory tables', () => {
  for (const row of data.rows) {
    it(`${row.city} ${row.date}`, () => {
      const loc = { latitude: row.latitude, longitude: row.longitude, timeZone: row.timeZone };
      const [y, m, d] = row.date.split('-').map(Number);
      let compared = 0;
      for (const [phen, hhmm] of Object.entries(row.utc)) {
        const f = FUNCS[phen];
        if (!f || !hhmm) continue;
        const [hh, mm] = hhmm.split(':').map(Number);
        const published = (gregorianToDayNumber(y, m, d) * 1440 + hh * 60 + mm) * 60_000;
        // Luach's "sunset of date D" follows that day's noon, so near the poles it can fall after midnight (on D + 1 by
        // the clock). Match the published event with the nearer of the two candidate days' events.
        const local = dayNumberInZone(published, row.timeZone);
        const candidates = [local, local - 1].map((n) => f(n, loc, { rounding: 'none' }).time).filter((t): t is Date => t !== null);
        expect(candidates.length, `${phen}`).toBeGreaterThan(0);
        const best = Math.min(...candidates.map((t) => Math.abs(t.getTime() - published)));
        expect(best, `${phen} published ${hhmm} UTC`).toBeLessThanOrEqual(90_000);
        compared += 1;
      }
      expect(compared).toBeGreaterThan(0);
    });
  }
});
