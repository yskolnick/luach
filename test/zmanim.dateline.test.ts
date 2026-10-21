/**
 * Regression for kosher-zmanim issue #37: zmanim for Sydney, Auckland and Chatham must fall
 * on the requested civil day, every day of 2025–2028, and agree with astronomy-engine (MIT).
 */
import { describe, expect, it } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { ZmanimCalendar, civilToDays, daysToCivil, localParts } from '../src/index';

const CITIES = [
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
  { name: 'Auckland', latitude: -36.8485, longitude: 174.7633, timeZone: 'Pacific/Auckland' },
  { name: 'Chatham', latitude: -43.9535, longitude: -176.5597, timeZone: 'Pacific/Chatham' },
  { name: 'Apia', latitude: -13.8333, longitude: -171.75, timeZone: 'Pacific/Apia' },
  { name: 'Kiritimati', latitude: 1.87, longitude: -157.43, timeZone: 'Pacific/Kiritimati' },
];

describe('date line: zmanim on the right day (kosher-zmanim #37 regression)', () => {
  for (const c of CITIES) {
    it(c.name, () => {
      const obs = new Astronomy.Observer(c.latitude, c.longitude, 0);
      let worst = 0;
      for (let d = civilToDays(2025, 1, 1); d < civilToDays(2029, 1, 1); d++) {
        const date = daysToCivil(d);
        const z = new ZmanimCalendar(c, date, { rounding: false });
        for (const zm of [z.sunrise(), z.chatzos(), z.sunset(), z.sofZmanShemaGra()]) {
          const p = localParts(zm.time!.getTime(), c.timeZone);
          expect([p.year, p.month, p.day], `${c.name} ${zm.id} ${date.year}-${date.month}-${date.day}`).toEqual([date.year, date.month, date.day]);
        }
        const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, Astronomy.MakeTime(new Date(z.chatzos().time!.getTime() - 12 * 36e5)), 1)!;
        worst = Math.max(worst, Math.abs(rise.date.getTime() - z.sunrise().time!.getTime()));
      }
      expect(worst / 60000).toBeLessThan(1);
    });
  }
});
