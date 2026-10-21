/**
 * Cities: a small built-in table (about 180 cities with Jewish communities, from GeoNames, CC-BY 4.0), and search
 * by name in English, Hebrew and common alternate spellings. The full GeoNames table (34,000 cities) is a
 * separate import, `luach/cities-full`, so it never lands in a bundle unless asked for.
 *
 * Luach has no geocoding service and makes no network calls. To find the user's place, use the platform's own
 * location API and pass the coordinates (see the docs recipe "Location").
 *
 * @packageDocumentation
 */

import type { CityRow } from './types.js';

export type { CityRow } from './types.js';
import { ROWS, ZONES } from './cities-small.js';
import type { GeoLocation } from '../zmanim/zmanim.js';

/** A city. */
export interface City extends GeoLocation {
  /** GeoNames id. */
  readonly id: number;
  readonly name: string;
  /** Hebrew name, if GeoNames has one. */
  readonly hebrewName?: string;
  readonly latitude: number;
  readonly longitude: number;
  /** Metres above sea level (GeoNames; SRTM where GeoNames has no value). */
  readonly elevation: number;
  readonly timeZone: string;
  /** ISO 3166 country code (GeoNames; Judea and Samaria may be "PS"). */
  readonly country: string;
  /** Inside the {@link isInIsrael} boundary. A convenience: pass `location` explicitly to calendar functions. */
  readonly israel: boolean;
  /** Candle-lighting minutes before sunset where a local custom is documented (Jerusalem 40, Haifa 30…). */
  readonly candleLightingMinutes?: number;
}

/** A table of cities (the built-in one, or `FULL_CITY_TABLE` from `luach/cities-full`). */
export interface CityTable {
  readonly zones: readonly string[];
  readonly rows: readonly CityRow[];
}

/** The built-in table. */
export const CITY_TABLE: CityTable = { zones: ZONES, rows: ROWS };

function toCity(row: CityRow, zones: readonly string[]): City {
  const [id, name, hebrew, latitude, longitude, elevation, zone, country, israel, , candle] = row;
  return {
    id,
    name,
    ...(hebrew[0] ? { hebrewName: hebrew[0] } : {}),
    latitude,
    longitude,
    elevation,
    timeZone: zones[zone] as string,
    country,
    israel: israel === 1,
    ...(candle ? { candleLightingMinutes: candle } : {}),
  };
}

/** Every city in a table. */
export function allCities(table: CityTable = CITY_TABLE): City[] {
  return table.rows.map((r) => toCity(r, table.zones));
}

/** City by GeoNames id. */
export function cityById(id: number, table: CityTable = CITY_TABLE): City | undefined {
  const row = table.rows.find((r) => r[0] === id);
  return row ? toCity(row, table.zones) : undefined;
}

/**
 * Normalise for matching: lower case, no accents or niqqud, no punctuation or spaces, and a few common
 * transliteration variants folded together ("ei"/"e"/"ai", "q"/"k", "tz"/"ts", doubled letters).
 */
export function normalizeName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-֑ͯ-ׇ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/q/g, 'k')
    .replace(/ts/g, 'tz')
    .replace(/ei|ai|ay/g, 'e')
    .replace(/(.)\1+/g, '$1');
}

export interface SearchOptions {
  readonly table?: CityTable;
  /** Maximum results. Default 10. */
  readonly limit?: number;
  /** Only cities in this ISO country code. */
  readonly country?: string;
}

/**
 * Search cities by name (English, Hebrew or a common alternate spelling). Exact matches come first, then
 * prefixes, then substrings; ties keep table order (the full table is sorted by population).
 */
export function searchCities(query: string, options: SearchOptions = {}): City[] {
  const table = options.table ?? CITY_TABLE;
  const q = normalizeName(query);
  if (!q) return [];
  const scored: { score: number; i: number }[] = [];
  table.rows.forEach((row, i) => {
    if (options.country && row[7] !== options.country) return;
    let best = 0;
    for (const n of [row[1], ...row[2], ...row[9]]) {
      const v = normalizeName(n);
      const s = v === q ? 3 : v.startsWith(q) ? 2 : v.includes(q) ? 1 : 0;
      if (s > best) best = s;
      if (best === 3) break;
    }
    if (best > 0) scored.push({ score: best, i });
  });
  scored.sort((a, b) => b.score - a.score || a.i - b.i);
  return scored.slice(0, options.limit ?? 10).map((s) => toCity(table.rows[s.i] as CityRow, table.zones));
}

/** The best match for a name, or undefined. */
export function findCity(query: string, options: Omit<SearchOptions, 'limit'> = {}): City | undefined {
  return searchCities(query, { ...options, limit: 1 })[0];
}

/** The nearest city in a table to a point (great-circle distance), with the distance in km. */
export function nearestCity(latitude: number, longitude: number, table: CityTable = CITY_TABLE): { city: City; km: number } | undefined {
  const rad = Math.PI / 180;
  let best: { i: number; km: number } | undefined;
  table.rows.forEach((r, i) => {
    const dLat = (r[3] - latitude) * rad;
    const dLon = (r[4] - longitude) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(latitude * rad) * Math.cos(r[3] * rad) * Math.sin(dLon / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    if (!best || km < best.km) best = { i, km };
  });
  return best ? { city: toCity(table.rows[best.i] as CityRow, table.zones), km: best.km } : undefined;
}
