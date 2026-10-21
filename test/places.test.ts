import { describe, expect, it } from 'vitest';
import { searchPlaces, getPlace, isInIsrael, builtInPlaces, nameSkeleton, nearestPlace, ZmanimCalendar } from '../src/index';
import { fullPlaces } from '../src/places/full';

describe('isInIsrael', () => {
  const inside: [string, number, number][] = [
    ['Jerusalem', 31.778, 35.235], ['Tel Aviv', 32.08, 34.78], ['Haifa', 32.81, 35.0], ['Eilat', 29.558, 34.948],
    ['Beer Sheva', 31.25, 34.79], ['Tzfas', 32.96, 35.5], ['Kiryat Shmona', 33.21, 35.57], ['Metula', 33.277, 35.578],
    ['Katzrin', 32.99, 35.69], ['Ma\'ale Adumim', 31.777, 35.299], ['Efrat', 31.653, 35.15], ['Ariel', 32.106, 35.185],
    ['Rosh HaNikra', 33.085, 35.11], ['Nahariya', 33.0, 35.1], ['Majdal Shams', 33.27, 35.77], ['Ein Gedi', 31.46, 35.39],
  ];
  const outside: [string, number, number][] = [
    ['Aqaba', 29.527, 35.007], ['Taba', 29.49, 34.89], ['Amman', 31.95, 35.93], ['Beirut', 33.89, 35.5],
    ['Damascus', 33.51, 36.29], ['Quneitra', 33.126, 35.824], ['Cairo', 30.04, 31.24], ['Tyre', 33.27, 35.2],
    ['Irbid', 32.55, 35.85], ['El Arish', 31.13, 33.8], ['Larnaca', 34.92, 33.63],
  ];
  for (const [n, la, lo] of inside) it(`${n} is inside`, () => expect(isInIsrael(la, lo)).toBe(true));
  for (const [n, la, lo] of outside) it(`${n} is outside`, () => expect(isInIsrael(la, lo)).toBe(false));
  it('built-in Israeli cities are flagged, and only they', () => {
    for (const p of builtInPlaces()) expect(p.israel, p.id).toBe(p.timeZone === 'Asia/Jerusalem');
  });
});

describe('search', () => {
  it('common English spellings and Hebrew', () => {
    expect(searchPlaces('Bnei Brak')[0]?.id).toBe('bnei-brak');
    expect(searchPlaces('Bene Beraq')[0]?.id).toBe('bnei-brak');
    expect(searchPlaces('בני ברק')[0]?.id).toBe('bnei-brak');
    expect(searchPlaces('Petach Tikvah')[0]?.id).toBe('petach-tikva');
    expect(searchPlaces('tzfat')[0]?.id).toBe('tzfas');
    expect(searchPlaces('Safed')[0]?.id).toBe('tzfas');
    expect(searchPlaces('lakewood')[0]?.id).toBe('lakewood');
    expect(searchPlaces('ירושלים')[0]?.id).toBe('jerusalem');
    expect(searchPlaces('Kiryat Sefer')[0]?.id).toBe('modiin-illit');
    expect(searchPlaces('')).toEqual([]);
    expect(nameSkeleton('Bnei Brak')).toBe(nameSkeleton('Bene Beraq'));
  });
  it('the full dataset is separate and searchable', () => {
    const all = fullPlaces();
    expect(all.length).toBeGreaterThan(30000);
    const r = searchPlaces('Manchester', { places: all, limit: 3 });
    expect(r[0]?.country).toBe('GB');
  });
  it('nearest place', () => {
    expect(nearestPlace(40.09, -74.21)?.place.id).toBe('lakewood');
  });
  it('a place plugs straight into the zmanim calculator', () => {
    const z = new ZmanimCalendar(getPlace('jerusalem')!, { year: 2027, month: 3, day: 14 });
    expect(z.sunrise().time).not.toBeNull();
  });
  it('every built-in place has a valid IANA zone and a Hebrew name', () => {
    for (const p of builtInPlaces()) {
      expect(() => new Intl.DateTimeFormat('en', { timeZone: p.timeZone })).not.toThrow();
      expect(p.nameHe.length, p.id).toBeGreaterThan(0);
    }
  });
});
