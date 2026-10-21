import { describe, expect, it } from 'vitest';
import { ZmanimCalendar, HebrewDate, Month, ZMANIM, fixedOffsetZone, offsetMinutes } from '../src/index';
import { roundToMinute } from '../src/zmanim/zman';
import { zonedToInstant, localParts } from '../src/time/zone';

const LAKEWOOD = { latitude: 40.0821, longitude: -74.2097, elevation: 20, timeZone: 'America/New_York' };
const LONDON = { latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London' };
const TROMSO = { latitude: 69.6492, longitude: 18.9553, timeZone: 'Europe/Oslo' };
const JERUSALEM = { latitude: 31.778, longitude: 35.2354, elevation: 754, timeZone: 'Asia/Jerusalem' };

describe('rounding', () => {
  it('earliest up, deadlines down, off on request', () => {
    expect(roundToMinute(Date.UTC(2027, 0, 1, 10, 0, 1), 'up')).toBe(Date.UTC(2027, 0, 1, 10, 1));
    expect(roundToMinute(Date.UTC(2027, 0, 1, 10, 0, 59), 'down')).toBe(Date.UTC(2027, 0, 1, 10, 0));
    const z = new ZmanimCalendar(LAKEWOOD, { year: 2027, month: 3, day: 14 });
    const exact = new ZmanimCalendar(LAKEWOOD, { year: 2027, month: 3, day: 14 }, { rounding: false });
    const shema = z.sofZmanShemaGra();
    expect(shema.rounded).toBe('down');
    expect(shema.time!.getTime()).toBeLessThanOrEqual(exact.sofZmanShemaGra().time!.getTime());
    expect(shema.time!.getUTCSeconds()).toBe(0);
    const tzeis = z.tzeis8Point5();
    expect(tzeis.rounded).toBe('up');
    expect(tzeis.time!.getTime()).toBeGreaterThanOrEqual(exact.tzeis8Point5().time!.getTime());
    expect(exact.tzeis8Point5().rounded).toBeNull();
  });
});

describe('every zman carries an opinion and a source', () => {
  it('ZMANIM table complete', () => {
    for (const [id, d] of Object.entries(ZMANIM)) {
      expect(d.opinion.length, id).toBeGreaterThan(10);
      expect(d.source.length, id).toBeGreaterThan(5);
    }
  });
  it('every method returns a Zman whose id is in the table', () => {
    const z = new ZmanimCalendar(LAKEWOOD, { year: 2027, month: 3, day: 14 });
    const proto = Object.getOwnPropertyNames(ZmanimCalendar.prototype).filter((n) => !n.startsWith('shaah') && !['constructor', 'nextDay', 'prevDay', 'hebrewDate'].includes(n) && !n.startsWith('_'));
    let count = 0;
    for (const n of proto) {
      const f = (z as unknown as Record<string, unknown>)[n];
      if (typeof f !== 'function') continue;
      let r: unknown;
      try { r = (f as () => unknown).call(z); } catch { continue; }
      if (r && typeof r === 'object' && 'id' in r) {
        expect(ZMANIM[(r as { id: string }).id], n).toBeDefined();
        count++;
      }
    }
    expect(count).toBeGreaterThan(60);
  });
});

describe('high latitude', () => {
  it('16.1° in London in June is null with a reason, never a made-up time', () => {
    const z = new ZmanimCalendar(LONDON, { year: 2027, month: 6, day: 21 });
    const a = z.alos16Point1();
    expect(a.time).toBeNull();
    expect(a.reason).toBe('sun-always-above');
    expect(z.sofZmanShemaMga16Point1().reason).toBe('depends-on-missing-zman');
    expect(z.sunrise().time).not.toBeNull();
  });
  it('Tromsø midsummer: no sunrise, so Gra zmanim are null', () => {
    const z = new ZmanimCalendar(TROMSO, { year: 2027, month: 6, day: 21 });
    expect(z.sunrise().reason).toBe('no-sunrise');
    expect(z.sofZmanShemaGra().time).toBeNull();
    expect(z.chatzos().time).not.toBeNull();
  });
  it('fallbacks are off by default and marked when on', () => {
    const half = new ZmanimCalendar(LONDON, { year: 2027, month: 6, day: 21 }, { highLatitudeFallback: 'halfNight' }).alos16Point1();
    expect(half.time).not.toBeNull();
    expect(half.fallback).toMatch(/Solar midnight/);
    const near = new ZmanimCalendar(LONDON, { year: 2027, month: 6, day: 21 }, { highLatitudeFallback: 'nearestDay' }).alos16Point1();
    expect(near.time).not.toBeNull();
    expect(near.fallback).toMatch(/nearest day/);
  });
  it('fallbacks never replace a time when the sun stays too low (polar night)', () => {
    // Svalbard at the winter solstice: the sun stays below about 11.7° under the horizon, so it
    // never rises to 11° or 8.5°. Solar midnight or another day's offset would be an invented
    // misheyakir or tzeis. (It does pass 16.1°, so alos 16.1° is a real time.)
    const svalbard = { latitude: 78.22, longitude: 15.65, timeZone: 'Arctic/Longyearbyen' };
    for (const mode of ['halfNight', 'nearestDay'] as const) {
      const z = new ZmanimCalendar(svalbard, { year: 2026, month: 12, day: 21 }, { highLatitudeFallback: mode });
      for (const m of [z.misheyakir11(), z.misheyakir10Point2(), z.tzeis8Point5(), z.tzeis7Point083()]) {
        expect(m.time, `${mode} ${m.id}`).toBeNull();
        expect(m.fallback, `${mode} ${m.id}`).toBeUndefined();
      }
      expect(z.misheyakir11().reason).toBe('sun-always-below');
      expect(z.tzeis8Point5().reason).toBe('sun-always-below');
      expect(z.alos16Point1().time).not.toBeNull();
      expect(z.alos16Point1().fallback).toBeUndefined();
    }
    // The same place at midsummer: the sun stays too high, so the fallback applies.
    const summer = new ZmanimCalendar(svalbard, { year: 2027, month: 6, day: 21 }, { highLatitudeFallback: 'halfNight' }).misheyakir11();
    expect(summer.time).not.toBeNull();
    expect(summer.fallback).toMatch(/Solar midnight/);
  });
});

describe('elevation', () => {
  it('elevation sunrise is earlier and sunset later; degree zmanim ignore it', () => {
    const z = new ZmanimCalendar(JERUSALEM, { year: 2027, month: 3, day: 14 }, { rounding: false });
    expect(z.sunriseElevation().time!.getTime()).toBeLessThan(z.sunriseSeaLevel().time!.getTime());
    expect(z.sunsetElevation().time!.getTime()).toBeGreaterThan(z.sunsetSeaLevel().time!.getTime());
    const e = new ZmanimCalendar(JERUSALEM, { year: 2027, month: 3, day: 14 }, { rounding: false, useElevation: true });
    expect(e.sunrise().time!.getTime()).toBe(z.sunriseElevation().time!.getTime());
    expect(e.alos16Point1().time!.getTime()).toBe(z.alos16Point1().time!.getTime());
  });
});

describe('special days', () => {
  it('chametz times only on Erev Pesach', () => {
    const erev = new ZmanimCalendar(LAKEWOOD, new HebrewDate(5787, Month.NISAN, 14));
    expect(erev.sofZmanAchilasChametzGra().time).not.toBeNull();
    expect(erev.sofZmanBiurChametzMga72().time!.getTime()).toBeGreaterThan(erev.sofZmanAchilasChametzMga72().time!.getTime());
    const other = new ZmanimCalendar(LAKEWOOD, new HebrewDate(5787, Month.NISAN, 13));
    expect(other.sofZmanAchilasChametzGra().reason).toBe('not-applicable-today');
  });
  it('candle lighting minutes are configurable', () => {
    const z = new ZmanimCalendar(JERUSALEM, { year: 2027, month: 3, day: 12 }, { candleLightingMinutes: 40, rounding: false });
    expect((z.sunset().time!.getTime() - z.candleLighting().time!.getTime()) / 60000).toBeCloseTo(40);
    expect((z.sunset().time!.getTime() - z.candleLighting(18).time!.getTime()) / 60000).toBeCloseTo(18);
  });
});

describe('time zones', () => {
  it('a fixed-offset provider works where Intl zones are missing (Hermes)', () => {
    const a = new ZmanimCalendar({ ...LAKEWOOD, timeZone: fixedOffsetZone(-4 * 60) }, { year: 2027, month: 6, day: 1 }, { rounding: false });
    const b = new ZmanimCalendar(LAKEWOOD, { year: 2027, month: 6, day: 1 }, { rounding: false });
    expect(Math.abs(a.sunrise().time!.getTime() - b.sunrise().time!.getTime())).toBeLessThan(1000);
  });
  it('rejects unknown zones', () => {
    expect(() => new ZmanimCalendar({ ...LAKEWOOD, timeZone: 'Mars/Olympus' }, { year: 2027, month: 6, day: 1 })).toThrow(RangeError);
  });
  it('historical offsets keep their seconds (Jerusalem local mean time in 1900)', () => {
    const at = Date.UTC(1900, 0, 1, 12);
    // The runtime's own offset, to the second (ICU data; tzdata's LMT for Jerusalem).
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', timeZoneName: 'longOffset' }).formatToParts(new Date(at));
    const m = /GMT([+-])(\d\d):(\d\d)(?::(\d\d))?/.exec(parts.find((p) => p.type === 'timeZoneName')!.value)!;
    const intlMinutes = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]) + Number(m[4] ?? 0) / 60);
    expect(offsetMinutes('Asia/Jerusalem', at)).toBeCloseTo(intlMinutes, 9);
    expect(Number.isInteger(intlMinutes)).toBe(false);
    // Local noon maps back to 12:00:00 on the local clock (not 12:00:20).
    const noon = zonedToInstant({ year: 1900, month: 1, day: 1 }, 12 * 60, 'Asia/Jerusalem');
    expect(localParts(noon, 'Asia/Jerusalem')).toMatchObject({ hour: 12, minute: 0, second: 0 });
    expect(noon).toBe(Date.UTC(1900, 0, 1, 12) - Math.round(intlMinutes * 60) * 1000);
    // Rounding is to the local minute, so a rounded time still shows whole local minutes and
    // never displays earlier than the exact time.
    const loc = { ...JERUSALEM, timeZone: 'Asia/Jerusalem' };
    const r = new ZmanimCalendar(loc, { year: 1900, month: 3, day: 14 }).tzeis8Point5();
    const x = new ZmanimCalendar(loc, { year: 1900, month: 3, day: 14 }, { rounding: false }).tzeis8Point5();
    expect(localParts(r.time!.getTime(), 'Asia/Jerusalem').second).toBe(0);
    expect(r.time!.getTime()).toBeGreaterThanOrEqual(x.time!.getTime());
    expect(r.time!.getTime() - x.time!.getTime()).toBeLessThan(60_000);
    const s = new ZmanimCalendar(loc, { year: 1900, month: 3, day: 14 }).sofZmanShemaGra();
    const sx = new ZmanimCalendar(loc, { year: 1900, month: 3, day: 14 }, { rounding: false }).sofZmanShemaGra();
    expect(localParts(s.time!.getTime(), 'Asia/Jerusalem').second).toBe(0);
    expect(s.time!.getTime()).toBeLessThanOrEqual(sx.time!.getTime());
  });
  it('toJSON gives local time in the location zone', () => {
    const j = new ZmanimCalendar(JERUSALEM, { year: 2027, month: 3, day: 14 }).chatzos().toJSON();
    expect(j.timeZone).toBe('Asia/Jerusalem');
    expect(j.local).toMatch(/^11:4\d$/);
    expect(j.source.length).toBeGreaterThan(0);
  });
});

import { zmanLabel, en, he as heLocale } from '../src/index';
describe('labels', () => {
  it('every zman has a Hebrew and English label', () => {
    for (const id of Object.keys(ZMANIM)) {
      expect(zmanLabel(id, heLocale)).not.toMatch(/^zman\./);
      expect(zmanLabel(id, en)).not.toMatch(/^zman\./);
    }
    expect(zmanLabel('sof-zman-shema-gra', heLocale)).toBe('סוף זמן קריאת שמע (גר״א)');
  });
});

describe('Hebrew labels keep degree signs with their numbers', () => {
  it('a left-to-right mark follows each degree sign', () => {
    expect(zmanLabel('misheyakir-11', heLocale)).toBe('משיכיר (11°‎)');
  });

  it('a zman defined by degrees is labelled in degrees, never minutes', () => {
    for (const id of Object.keys(ZMANIM).filter((id) => /-(16\.1|19\.8|8\.5|7\.083|6\.45)$/.test(id))) {
      for (const locale of [en, heLocale]) {
        expect(zmanLabel(id, locale), id).not.toMatch(/\d (min|דקות)\)/);
        expect(zmanLabel(id, locale), id).toMatch(/°/);
      }
    }
  });
});

import { isMelachaForbiddenAt } from '../src/index';
describe('input validation', () => {
  const day = { year: 2027, month: 3, day: 14 };
  const z = new ZmanimCalendar(LAKEWOOD, day);
  it('non-finite numbers throw a RangeError instead of giving an Invalid Date', () => {
    expect(() => z.havdala({ degrees: NaN })).toThrow(RangeError);
    expect(() => z.havdala({ minutes: NaN })).toThrow(RangeError);
    expect(() => z.havdala({ minutes: Infinity })).toThrow(RangeError);
    expect(() => z.candleLighting(NaN)).toThrow(RangeError);
    expect(() => z.candleLightingSecondNight({ degrees: NaN })).toThrow(RangeError);
    expect(() => new ZmanimCalendar(LAKEWOOD, day, { candleLightingMinutes: NaN })).toThrow(RangeError);
    expect(() => new ZmanimCalendar(LAKEWOOD, day, { ateretTorahMinutes: NaN })).toThrow(RangeError);
    expect(() => new ZmanimCalendar({ ...LAKEWOOD, elevation: NaN }, day)).toThrow(RangeError);
  });
  it('angles must be below the horizon after sunset (0.833° < degrees ≤ 30°); minutes 0–180', () => {
    expect(() => z.havdala({ degrees: -5 })).toThrow(/degrees/);
    expect(() => z.havdala({ degrees: 0.5 })).toThrow(RangeError);
    expect(() => z.havdala({ degrees: 200 })).toThrow(RangeError);
    expect(() => z.havdala({ minutes: -10 })).toThrow(RangeError);
    expect(() => z.havdala({ minutes: 0 })).toThrow(RangeError);
    expect(() => z.havdala({ minutes: 181 })).toThrow(RangeError);
    expect(() => z.candleLighting(-1)).toThrow(RangeError);
    expect(() => z.candleLighting(181)).toThrow(RangeError);
    expect(z.havdala({ degrees: 30 }).time).not.toBeNull();
    expect(z.havdala({ minutes: 72 }).time).not.toBeNull();
    expect(z.candleLighting(0).time).not.toBeNull();
    expect(z.candleLighting(40).time).not.toBeNull();
  });
  it('isMelachaForbiddenAt rejects a bad end instead of answering true', () => {
    expect(() => isMelachaForbiddenAt(new Date(Date.UTC(2027, 2, 13, 23)), LAKEWOOD, { ends: { degrees: NaN } })).toThrow(RangeError);
    expect(() => isMelachaForbiddenAt(new Date(Date.UTC(2027, 2, 13, 23)), LAKEWOOD, { beginsMinutesBeforeSunset: NaN })).toThrow(RangeError);
  });
  it('invalid civil dates are rejected, not rolled over', () => {
    expect(() => new ZmanimCalendar(LAKEWOOD, { year: 2026, month: 2, day: 30 })).toThrow(/Invalid civil date/);
    expect(() => new ZmanimCalendar(LAKEWOOD, { year: 2026, month: 13, day: 1 })).toThrow(RangeError);
    expect(() => new ZmanimCalendar(LAKEWOOD, { year: 2026.5, month: 1, day: 1 })).toThrow(RangeError);
  });
  it('a missing time zone gives a clear error', () => {
    const noZone = { latitude: 40, longitude: -74 } as unknown as typeof LAKEWOOD;
    expect(() => new ZmanimCalendar(noZone, day)).toThrow(/time zone/i);
    expect(() => new ZmanimCalendar({ ...LAKEWOOD, timeZone: {} as unknown as string }, day)).toThrow(/time zone/i);
  });
});
