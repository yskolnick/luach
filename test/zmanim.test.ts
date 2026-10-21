import { describe, expect, it } from 'vitest';
import { ZmanimCalendar, HebrewDate, Month, ZMANIM, fixedOffsetZone, roundToMinute } from '../src/index';

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
});
