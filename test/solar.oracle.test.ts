import { describe, expect, it } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { solarTransit, timeAtZenith, SUNRISE_ZENITH, solarAltitude } from '../src/zmanim/solar';
import { civilToDays } from '../src/index';

const PLACES = [
  { name: 'Jerusalem', lat: 31.778, lon: 35.235 },
  { name: 'New York', lat: 40.71, lon: -74.0 },
  { name: 'London', lat: 51.5, lon: -0.12 },
  { name: 'Melbourne', lat: -37.81, lon: 144.96 },
  { name: 'Reykjavik', lat: 64.15, lon: -21.94 },
  { name: 'Chatham', lat: -43.95, lon: -176.56 },
];

describe('NOAA sunrise/sunset vs astronomy-engine (MIT, test-only)', () => {
  for (const p of PLACES) {
    it(`${p.name}: every 5th day 2025–2028 within 1 minute`, () => {
      const obs = new Astronomy.Observer(p.lat, p.lon, 0);
      let worst = 0;
      for (let d = civilToDays(2025, 1, 1); d < civilToDays(2029, 1, 1); d += 5) {
        // local mean noon as the search anchor
        const transit = solarTransit(d * 864e5 + 12 * 36e5 - (p.lon / 15) * 36e5, p.lon);
        const rise = timeAtZenith(transit, p.lat, p.lon, SUNRISE_ZENITH, true);
        const set = timeAtZenith(transit, p.lat, p.lon, SUNRISE_ZENITH, false);
        const searchFrom = Astronomy.MakeTime(new Date(transit - 12 * 36e5));
        const r = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, searchFrom, 1);
        const s = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, Astronomy.MakeTime(new Date(transit)), 1);
        if ('time' in rise && r) worst = Math.max(worst, Math.abs(rise.time - r.date.getTime()));
        if ('time' in set && s) worst = Math.max(worst, Math.abs(set.time - s.date.getTime()));
        if (!('time' in rise)) expect(r === null || Math.abs(r.date.getTime() - transit) > 12 * 36e5).toBe(true);
      }
      expect(worst / 60000).toBeLessThan(1);
    });
  }
  it('altitude at transit is 90 - |lat - decl| (sanity)', () => {
    const t = solarTransit(Date.UTC(2026, 5, 21, 10), 35.235);
    expect(solarAltitude(t, 31.778, 35.235)).toBeCloseTo(90 - (31.778 - 23.44), 0);
  });
});

import { usnoTimeAtZenith } from '../src/zmanim/usno';

describe('NOAA vs USNO (two methods agree)', () => {
  it('within 2 minutes, every 3rd day 2025–2028, latitudes ±60°', () => {
    let worst = 0;
    for (const p of PLACES.filter((x) => Math.abs(x.lat) < 60)) {
      for (let d = civilToDays(2025, 1, 1); d < civilToDays(2029, 1, 1); d += 3) {
        const transit = solarTransit(d * 864e5 + 12 * 36e5 - (p.lon / 15) * 36e5, p.lon);
        for (const rising of [true, false]) {
          const a = timeAtZenith(transit, p.lat, p.lon, SUNRISE_ZENITH, rising);
          const b = usnoTimeAtZenith(transit, p.lat, p.lon, SUNRISE_ZENITH, rising);
          if ('time' in a && 'time' in b) worst = Math.max(worst, Math.abs(a.time - b.time));
        }
      }
    }
    expect(worst / 60000).toBeLessThan(2);
  });
});
