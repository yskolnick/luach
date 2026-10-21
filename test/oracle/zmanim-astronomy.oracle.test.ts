// Oracle: astronomy-engine (MIT), an independent high-precision solar model. Used only in tests.
import { describe, expect, it } from 'vitest';
import * as A from 'astronomy-engine';
import { writeFileSync, mkdirSync } from 'node:fs';
import * as Z from '../../src/zmanim/zmanim.js';
import { gregorianToDayNumber } from '../../src/calendar/gregorian.js';
import { TEST_CITIES } from '../fixtures/cities.js';

describe('sun times vs astronomy-engine, 19 cities, daily 2025–2028', () => {
  it('sunrise/sunset and depression angles agree within 1 minute below 60° latitude', () => {
    const rows: Record<string, { compared: number; maxDiffSec: number; sumDiffSec: number; over60: number; nullMismatch: number }> = {};
    const start = gregorianToDayNumber(2025, 1, 1);
    const end = gregorianToDayNumber(2028, 12, 31);
    for (const [city, loc] of Object.entries(TEST_CITIES)) {
      const obs = new A.Observer(loc.latitude, loc.longitude, 0);
      for (let n = start; n <= end; n += 1) {
        // Morning events in the 12 hours before solar noon, evening events in the 12 hours after.
        const noon = Z.chatzos(n, loc, { rounding: 'none' }).time!.getTime();
        const before = new Date(noon - 12 * 3_600_000);
        const after = new Date(noon);
        const checks: [string, Z.Zman, number | null][] = [];
        const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, before, 0.5);
        const set = A.SearchRiseSet(A.Body.Sun, obs, -1, after, 0.5);
        const dawn16 = A.SearchAltitude(A.Body.Sun, obs, +1, before, 0.5, -16.1);
        const dusk85 = A.SearchAltitude(A.Body.Sun, obs, -1, after, 0.5, -8.5);
        const transit = A.SearchHourAngle(A.Body.Sun, obs, 0, before, +1);
        checks.push(['chatzos (transit)', Z.chatzos(n, loc, { rounding: 'none' }), transit.time.date.getTime()]);
        checks.push(['sunrise', Z.sunriseSeaLevel(n, loc, { rounding: 'none' }), rise ? rise.date.getTime() : null]);
        checks.push(['sunset', Z.sunsetSeaLevel(n, loc, { rounding: 'none' }), set ? set.date.getTime() : null]);
        checks.push(['alos 16.1°', Z.alos16_1(n, loc, { rounding: 'none' }), dawn16 ? dawn16.date.getTime() : null]);
        checks.push(['tzeis 8.5°', Z.tzeis8_5(n, loc, { rounding: 'none' }), dusk85 ? dusk85.date.getTime() : null]);
        for (const [name, ours, theirs] of checks) {
          const key = `${city}|${name}`;
          const r = (rows[key] ??= { compared: 0, maxDiffSec: 0, sumDiffSec: 0, over60: 0, nullMismatch: 0 });
          const a = ours.time?.getTime() ?? null;
          const b = theirs;
          if (a === null || b === null) {
            if ((a === null) !== (b === null)) r.nullMismatch += 1;
            continue;
          }
          const diff = Math.abs(a - b) / 1000;
          r.compared += 1;
          r.sumDiffSec += diff;
          r.maxDiffSec = Math.max(r.maxDiffSec, diff);
          if (diff > 60) r.over60 += 1;
        }
      }
    }
    mkdirSync('reports', { recursive: true });
    writeFileSync('reports/zmanim-astronomy-engine.json', JSON.stringify(rows, null, 1));
    const lowLat = Object.entries(rows).filter(([k]) => !/Anchorage|Reykjavik|Tromsø/.test(k));
    console.log(Object.entries(rows).map(([k, r]) => `${k}: n=${r.compared} max=${r.maxDiffSec.toFixed(0)}s mean=${(r.sumDiffSec / Math.max(1, r.compared)).toFixed(1)}s >60s=${r.over60} nullΔ=${r.nullMismatch}`).join('\n'));
    for (const [k, r] of lowLat) expect(r.over60, k).toBe(0);
  }, 900_000);
});
