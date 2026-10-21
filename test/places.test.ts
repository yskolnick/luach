import { describe, expect, it } from 'vitest';
import { allCities, cityById, findCity, nearestCity, normalizeName, searchCities } from '../src/places/places.js';
import { isInIsrael } from '../src/places/israel.js';
import { FULL_CITY_TABLE } from '../src/cities-full.js';
import { offsetMinutes } from '../src/time/zone.js';

describe('city table', () => {
  it('every built-in city has valid coordinates, a resolvable IANA zone, and a consistent Israel flag', () => {
    const cities = allCities();
    expect(cities.length).toBeGreaterThan(150);
    for (const c of cities) {
      expect(Math.abs(c.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(c.longitude)).toBeLessThanOrEqual(180);
      expect(() => offsetMinutes(c.timeZone, 0)).not.toThrow();
      expect(c.israel).toBe(isInIsrael(c.latitude, c.longitude));
    }
  });
  it('Israeli cities carry Hebrew names', () => {
    for (const c of allCities().filter((x) => x.israel)) expect(c.hebrewName, c.name).toBeTruthy();
  });
  it('documented candle-lighting customs', () => {
    expect(findCity('Jerusalem')!.candleLightingMinutes).toBe(40);
    expect(findCity('Haifa')!.candleLightingMinutes).toBe(30);
    expect(findCity('Lakewood')!.candleLightingMinutes).toBeUndefined();
  });
});

describe('search', () => {
  it('English, alternate spellings and Hebrew', () => {
    expect(findCity('Bnei Brak')!.name).toBe('Bnei Brak');
    expect(findCity('Bene Beraq')!.name).toBe('Bnei Brak');
    expect(findCity('bnei-brak')!.name).toBe('Bnei Brak');
    expect(findCity('בני ברק')!.name).toBe('Bnei Brak');
    expect(findCity('ירושלים')!.name).toBe('Jerusalem');
    expect(findCity('Petach Tikva')!.hebrewName).toBe('פתח תקווה');
    expect(findCity('Lakewood')!.timeZone).toBe('America/New_York');
  });
  it('prefix and country filter', () => {
    expect(searchCities('Man').map((c) => c.name)).toContain('Manchester');
    expect(searchCities('London', { country: 'GB' })[0].country).toBe('GB');
  });
  it('normalisation', () => {
    expect(normalizeName('Petaẖ Tiqva')).toBe(normalizeName('Petah Tikva'));
    expect(normalizeName('Rishon LeTsiyyon')).toBe(normalizeName('Rishon LeTziyon'));
  });
  it('full table is separate and larger', () => {
    expect(FULL_CITY_TABLE.rows.length).toBeGreaterThan(30_000);
    expect(searchCities('Kiryat Shmona', { table: FULL_CITY_TABLE })[0].israel).toBe(true);
    expect(cityById(281184)!.name).toBe('Jerusalem');
  });
  it('nearest city', () => {
    const n = nearestCity(40.08, -74.21)!;
    expect(n.city.name).toBe('Lakewood');
    expect(n.km).toBeLessThan(5);
  });
});
