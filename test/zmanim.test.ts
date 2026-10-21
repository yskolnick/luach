import { describe, expect, it } from 'vitest';
import * as Z from '../src/zmanim/zmanim.js';
import { gregorianToDayNumber, dayNumberToGregorian } from '../src/calendar/gregorian.js';
import { toZoned } from '../src/time/zone.js';
import { TEST_CITIES } from './fixtures/cities.js';

describe('regression: zmanim on the right civil day near the date line (kosher-zmanim issue #37)', () => {
  // kosher-zmanim #37: a sign-inverted raw offset put Sydney and Auckland zmanim on the following day.
  for (const city of ['Sydney', 'Auckland', 'Chatham', 'Anchorage', 'Brooklyn', 'Jerusalem']) {
    it(`${city}: sunrise, chatzos and sunset fall on the requested local date, every day 2025–2028`, () => {
      const loc = TEST_CITIES[city];
      for (let n = gregorianToDayNumber(2025, 1, 1); n <= gregorianToDayNumber(2028, 12, 31); n += 1) {
        for (const f of [Z.sunriseSeaLevel, Z.chatzos, Z.sunsetSeaLevel]) {
          const t = f(n, loc, { rounding: 'none' }).time;
          if (!t) continue;
          expect(toZoned(t.getTime(), loc.timeZone).dayNumber).toBe(n);
        }
        const noon = toZoned(Z.chatzos(n, loc).time!.getTime(), loc.timeZone);
        expect(noon.hour).toBeGreaterThanOrEqual(11);
        expect(noon.hour).toBeLessThanOrEqual(14);
      }
    });
  }
});

describe('no made-up times', () => {
  it('London in June: 16.1° is never reached; null with a reason', () => {
    const z = Z.alos16_1({ year: 2026, month: 6, day: 21 }, TEST_CITIES.London);
    expect(z.time).toBeNull();
    expect(z.reason).toBe('sun-always-above');
    expect(JSON.parse(JSON.stringify(z))).toMatchObject({ time: null, reason: 'sun-always-above', opinion: 'Alos at 16.1°' });
  });
  it('Tromsø in midwinter: no sunrise; in midsummer: no sunset', () => {
    expect(Z.netz({ year: 2026, month: 12, day: 21 }, TEST_CITIES['Tromsø']).reason).toBe('sun-always-below');
    expect(Z.shkiah({ year: 2026, month: 6, day: 21 }, TEST_CITIES['Tromsø']).reason).toBe('sun-always-above');
  });
  it('a time built on a missing time is missing too', () => {
    const z = Z.sofZmanShemaMA16_1({ year: 2026, month: 6, day: 21 }, TEST_CITIES.London);
    expect(z.time).toBeNull();
  });
  it('the solar-midnight fallback is opt-in and marked', () => {
    const z = Z.alos16_1({ year: 2026, month: 6, day: 21 }, TEST_CITIES.London, { highLatitude: 'solar-midnight' });
    expect(z.time).not.toBeNull();
    expect(z.fallback).toBe('solar-midnight');
  });
});

describe('rounding is part of the API', () => {
  const d = { year: 2026, month: 10, day: 21 };
  const loc = TEST_CITIES.Jerusalem;
  it('earliest times round up, deadlines round down, none is exact', () => {
    const exactAlos = Z.alos72(d, loc, { rounding: 'none' }).time!.getTime();
    const alos = Z.alos72(d, loc);
    expect(alos.rounded).toBe('up');
    expect(alos.time!.getTime()).toBe(Math.ceil(exactAlos / 60000) * 60000);
    const exactShema = Z.sofZmanShemaGra(d, loc, { rounding: 'none' }).time!.getTime();
    const shema = Z.sofZmanShemaGra(d, loc);
    expect(shema.rounded).toBe('down');
    expect(shema.time!.getTime()).toBe(Math.floor(exactShema / 60000) * 60000);
    expect(Z.sofZmanShemaGra(d, loc, { rounding: 'none' }).rounded).toBe('none');
  });
  it('fast start rounds down (deadline to eat)', () => {
    expect(Z.fastStarts(d, loc).rounded).toBe('down');
  });
});

describe('every zman names its opinion and source', () => {
  it('opinion and source are non-empty for all exported zman functions', () => {
    const d = { year: 2026, month: 3, day: 20 };
    const loc = TEST_CITIES.Brooklyn;
    let count = 0;
    for (const [name, f] of Object.entries(Z)) {
      if (typeof f !== 'function' || f.length < 2 || /^(sofZman(Shema|Tefilla|AchilasChametz|BiurChametz)|mincha(Gedola|Ketana)|plagHamincha|alosAtDegrees|misheyakirAtDegrees|tzeisAtDegrees|tzeisAfterMinutes|shaahZmanis|dayOpinion|candleLighting|havdala|fastStarts|fastEnds)$/.test(name)) continue;
      const z = (f as Z.ZmanFunction)(d, loc);
      expect(z.opinion.length, name).toBeGreaterThan(3);
      expect(z.source.length, name).toBeGreaterThan(3);
      count += 1;
    }
    expect(count).toBeGreaterThan(40);
  });
});

describe('Shabbos and Yom Tov helpers', () => {
  const d = { year: 2026, month: 10, day: 23 }; // Friday
  const loc = TEST_CITIES.Jerusalem;
  it('candle lighting is N minutes before sea-level sunset', () => {
    const sunset = Z.sunsetSeaLevel(d, loc, { rounding: 'none' }).time!.getTime();
    expect(Z.candleLighting(d, loc, 40, { rounding: 'none' }).time!.getTime()).toBe(sunset - 40 * 60000);
    expect(Z.candleLighting(d, loc).opinion).toContain('18 minutes');
  });
  it('havdala by degrees or minutes', () => {
    expect(Z.havdala(d, loc, { minutes: 50 }).opinion).toContain('50 minutes');
    expect(Z.havdala(d, loc).opinion).toContain('8.5°');
    expect(Z.havdala(d, loc).toJSON().opinion).toContain('End of Shabbos');
  });
  it('shaah zmanis', () => {
    const gra = Z.shaahZmanis(d, loc, 'gra')!;
    const ma = Z.shaahZmanis(d, loc, 'ma72')!;
    expect(ma - gra).toBeCloseTo(12, 6); // 144 minutes more spread over 12 hours
  });
  void dayNumberToGregorian;
});

import { usnoSunEvent } from '../src/zmanim/usno.js';
import { SUNRISE_ZENITH } from '../src/zmanim/solar.js';

describe('cross-check: NOAA vs the USNO Almanac algorithm', () => {
  it('sunrise and sunset agree within 2 minutes in every test city below 60°, daily 2025–2028', () => {
    let worst = 0;
    for (const [city, loc] of Object.entries(TEST_CITIES)) {
      if (Math.abs(loc.latitude) > 60) continue;
      for (let n = gregorianToDayNumber(2025, 1, 1); n <= gregorianToDayNumber(2028, 12, 31); n += 1) {
        const transit = Z.chatzos(n, loc, { rounding: 'none' }).time!.getTime();
        const rise = Z.sunriseSeaLevel(n, loc, { rounding: 'none' }).time!.getTime();
        const set = Z.sunsetSeaLevel(n, loc, { rounding: 'none' }).time!.getTime();
        const r2 = usnoSunEvent(transit, loc.latitude, loc.longitude, SUNRISE_ZENITH, 'morning')!;
        const s2 = usnoSunEvent(transit, loc.latitude, loc.longitude, SUNRISE_ZENITH, 'evening')!;
        worst = Math.max(worst, Math.abs(rise - r2), Math.abs(set - s2));
        expect(Math.abs(rise - r2), `${city} ${n}`).toBeLessThan(120_000);
        expect(Math.abs(set - s2), `${city} ${n}`).toBeLessThan(120_000);
      }
    }
    expect(worst).toBeGreaterThan(0);
  });
});

import { fastTimes, hebrewDateAt } from '../src/zmanim/fasts.js';
import { holidaysInYear } from '../src/holidays/holidays.js';

describe('fast times and the Hebrew date at an instant', () => {
  const loc = TEST_CITIES.Brooklyn;
  const year = holidaysInYear(5787, { location: 'diaspora' });
  it('minor fast: alos to tzeis on the day', () => {
    const gedalia = year.find((h) => h.id === 'tzom-gedalia')!;
    const t = fastTimes(gedalia, loc);
    expect(t.begins.opinion).toContain('Fast begins: Alos 72');
    expect(t.begins.rounded).toBe('down');
    expect(t.ends.time!.getTime()).toBeGreaterThan(t.begins.time!.getTime() + 10 * 3_600_000);
  });
  it('major fast begins at sunset the evening before', () => {
    const yk = year.find((h) => h.id === 'yom-kippur')!;
    const t = fastTimes(yk, loc);
    expect(toZoned(t.begins.time!.getTime(), loc.timeZone).dayNumber).toBe(yk.dayNumber - 1);
    expect(t.ends.time!.getTime() - t.begins.time!.getTime()).toBeGreaterThan(24 * 3_600_000);
  });
  it('rejects non-fasts', () => {
    expect(() => fastTimes(year.find((h) => h.id === 'purim')!, loc)).toThrow(RangeError);
  });
  it('the Hebrew date changes at sunset', () => {
    // 21 Oct 2026 = 10 Cheshvan 5787. Brooklyn sunset ~18:05 EDT (22:05Z).
    expect(hebrewDateAt(new Date('2026-10-21T16:00:00Z'), loc)).toEqual({ year: 5787, month: 8, day: 10 });
    expect(hebrewDateAt(new Date('2026-10-21T23:30:00Z'), loc)).toEqual({ year: 5787, month: 8, day: 11 });
  });
});
