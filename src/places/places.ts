/**
 * Places: a small built-in city table, search by name (English spellings and Hebrew), and
 * an Israel check. The full dataset (every city of 15,000+ people) is a separate import,
 * `luach/places-full`, so it does not weigh on bundles that do not use it.
 *
 * City data: GeoNames (https://www.geonames.org/), licensed CC-BY 4.0. Country codes are
 * GeoNames' (ISO 3166) and are not used to decide anything; the `israel` flag comes from
 * {@link isInIsrael}.
 *
 * No geocoding service is built in, and nothing here makes a network call. To find the
 * user's location, use the platform (the browser Geolocation API, expo-location, …) and
 * pass the coordinates and the device's IANA zone; see the docs, "Places".
 *
 * @packageDocumentation
 */

import type { GeoLocation } from '../zmanim/calendar.js';
import { CITY_ROWS, type CityRow } from './cities-data.js';

/** A place: a {@link GeoLocation} with names and an Israel flag. */
export interface Place extends GeoLocation {
  /** Stable id, e.g. "bnei-brak" (built-in table) or "geonames:295514" (full dataset). */
  readonly id: string;
  /** English name. */
  readonly name: string;
  /** Hebrew name, or "" if unknown. */
  readonly nameHe: string;
  readonly latitude: number;
  readonly longitude: number;
  /** Metres above sea level (0 where unknown or below sea level). */
  readonly elevation: number;
  /** IANA zone. */
  readonly timeZone: string;
  /** ISO 3166 country code, as given by GeoNames. */
  readonly country: string;
  /** True if inside the boundary of {@link isInIsrael}. Pass `israel` explicitly to override in calendar calls. */
  readonly israel: boolean;
  /** Other spellings. */
  readonly aliases: readonly string[];
  /** Population, where known (full dataset). */
  readonly population?: number;
  /**
   * The local candle-lighting custom, where Luach has a published source for it (see
   * {@link LOCAL_CANDLE_LIGHTING}). Absent elsewhere: the caller's choice, or 18 minutes.
   */
  readonly candleLighting?: CandleLightingCustom;
}

/** A place's documented candle-lighting custom. */
export interface CandleLightingCustom {
  /** Minutes before sunset. */
  readonly minutes: number;
  /** Whose custom, e.g. "the custom of Jerusalem". */
  readonly custom: string;
  /** Where it is documented. */
  readonly source: string;
}

const PENINEI_SHABBAT_3_2 = 'Peninei Halakha, Shabbat 3:2 (R. Eliezer Melamed; ph.yhb.org.il/en/01-03-02)';

/**
 * Candle-lighting customs that differ from the common 18 minutes, by GeoNames id, set only
 * where a published source was read. They apply to the city itself, not its surroundings.
 * Peninei Halakha, Shabbat 3:2: "In Jerusalem the custom is to light candles forty minutes
 * before shki'a, in Haifa thirty minutes before, and in Tel Aviv and most other Israeli
 * cities twenty minutes before."
 */
export const LOCAL_CANDLE_LIGHTING: Readonly<Record<number, CandleLightingCustom>> = {
  281184: { minutes: 40, custom: 'the custom of Jerusalem', source: `${PENINEI_SHABBAT_3_2}; Peninei Halakha, Zemanim 13:5 n. 11` },
  294801: { minutes: 30, custom: 'the custom of Haifa', source: PENINEI_SHABBAT_3_2 },
};

// ------------------------------------------------------------ Israel boundary

/**
 * The boundary used by {@link isInIsrael}, as [longitude, latitude] points. It is a
 * simplified outline, drawn for Luach, of the area where communities keep one day of Yom
 * Tov: the State of Israel together with Judea and Samaria, the Golan Heights and Gaza.
 * It is accurate to a few kilometres; near a border, or for any halachic question about
 * where one day or two are kept, ask your rav and pass `israel` explicitly. It makes no
 * political statement.
 */
export const ISRAEL_BOUNDARY: ReadonlyArray<readonly [number, number]> = [
  [35.104, 33.093], [35.33, 33.07], [35.5, 33.09], [35.53, 33.25], [35.58, 33.28], [35.65, 33.25],
  [35.75, 33.34], [35.82, 33.31], [35.8, 33.17], [35.79, 33.05], [35.8, 32.85], [35.66, 32.7],
  [35.57, 32.65], [35.55, 32.4], [35.52, 32.1], [35.55, 31.85], [35.55, 31.5], [35.45, 31.05],
  [35.33, 30.7], [35.2, 30.3], [35.1, 30.0], [35.0, 29.75], [34.982, 29.54], [34.9, 29.49],
  [34.75, 29.9], [34.6, 30.3], [34.52, 30.6], [34.4, 30.9], [34.27, 31.22], [34.2, 31.3],
  [34.5, 31.7], [34.72, 32.1], [34.85, 32.5], [34.95, 32.85], [35.07, 33.1],
];

/** True if the point is inside {@link ISRAEL_BOUNDARY} (even–odd ray casting). */
export function isInIsrael(latitude: number, longitude: number): boolean {
  let inside = false;
  const b = ISRAEL_BOUNDARY;
  for (let i = 0, j = b.length - 1; i < b.length; j = i++) {
    const [xi, yi] = b[i]!;
    const [xj, yj] = b[j]!;
    if (yi > latitude !== yj > latitude && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ------------------------------------------------------------ the built-in table

function fromRow(r: CityRow): Place {
  const [id, name, nameHe, latitude, longitude, elevation, timeZone, country, aliases, geonameId] = r;
  const candles = LOCAL_CANDLE_LIGHTING[geonameId];
  return { id, name, nameHe, latitude, longitude, elevation, timeZone, country, aliases, israel: isInIsrael(latitude, longitude), ...(candles ? { candleLighting: candles } : {}) };
}

let cities: Place[] | null = null;

/** The built-in cities (about 150 with Jewish communities worldwide, plus high-latitude and date-line test places). */
export function builtInPlaces(): readonly Place[] {
  return (cities ??= CITY_ROWS.map(fromRow));
}

/** A built-in city by id (e.g. "lakewood"), or undefined. */
export function getPlace(id: string): Place | undefined {
  return builtInPlaces().find((p) => p.id === id);
}

// ------------------------------------------------------------ search

/** Lower case, no diacritics, no nikud, no punctuation or spaces. */
export function foldName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-֑ͯ-ׇ]/g, '')
    .toLowerCase()
    .replace(/[‘’'`"״׳\-–.,()\s]/g, '');
}

/**
 * A rough consonant skeleton for matching transliterations: "Bnei Brak" and "Bene Beraq"
 * both become "bnbrk"; "Petach Tikvah" and "Petah Tiqwa" become "pthtkv".
 */
export function nameSkeleton(s: string): string {
  return foldName(s)
    .replace(/kh|ch/g, 'h')
    .replace(/q/g, 'k')
    .replace(/w/g, 'v')
    .replace(/ph/g, 'f')
    .replace(/tz|ts/g, 'z')
    .replace(/h$/, '')
    .replace(/[aeiouy]/g, '')
    .replace(/(.)\1+/g, '$1');
}

/** Options for {@link searchPlaces}. */
export interface SearchOptions {
  /** Places to search. Default: the built-in table. Pass `fullPlaces()` from `luach/places-full` for more. */
  places?: readonly Place[];
  /** Maximum results. Default 10. */
  limit?: number;
}

/**
 * Finds places by name: exact matches first, then prefix matches, then transliteration
 * matches (see {@link nameSkeleton}), then substrings. Hebrew queries match Hebrew names.
 * Ties go to larger places.
 */
export function searchPlaces(query: string, options: SearchOptions = {}): Place[] {
  const q = foldName(query);
  if (!q) return [];
  const qs = nameSkeleton(query);
  const scored: { p: Place; score: number }[] = [];
  for (const p of options.places ?? builtInPlaces()) {
    const names = [p.name, p.nameHe, ...p.aliases, p.id];
    let score = 0;
    for (const n of names) {
      if (!n) continue;
      const f = foldName(n);
      if (f === q) score = Math.max(score, 100);
      else if (f.startsWith(q)) score = Math.max(score, 80);
      else if (qs.length >= 3 && nameSkeleton(n) === qs) score = Math.max(score, 70);
      else if (q.length >= 3 && f.includes(q)) score = Math.max(score, 50);
      else if (qs.length >= 4 && nameSkeleton(n).startsWith(qs)) score = Math.max(score, 40);
    }
    if (score) scored.push({ p, score: score + Math.min(9, Math.log10((p.population ?? 0) + 1)) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, options.limit ?? 10).map((x) => x.p);
}

/** The nearest built-in (or given) place to a point, and its distance in kilometres. */
export function nearestPlace(latitude: number, longitude: number, places: readonly Place[] = builtInPlaces()): { place: Place; km: number } | null {
  let best: { place: Place; km: number } | null = null;
  for (const p of places) {
    const km = distanceKm(latitude, longitude, p.latitude, p.longitude);
    if (!best || km < best.km) best = { place: p, km };
  }
  return best;
}

/** Great-circle distance in kilometres (haversine, mean earth radius). */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
