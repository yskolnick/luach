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

import { deepFreeze } from '../util/freeze.js';
import type { GeoLocation } from '../zmanim/calendar.js';
import { CITY_ROWS, type CityRow } from './cities-data.js';
import { isInIsrael } from './israel.js';

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
export const LOCAL_CANDLE_LIGHTING: Readonly<Record<number, CandleLightingCustom>> = /*#__PURE__*/ deepFreeze({
  281184: { minutes: 40, custom: 'the custom of Jerusalem', source: `${PENINEI_SHABBAT_3_2}; Peninei Halakha, Zemanim 13:5 n. 11` },
  294801: { minutes: 30, custom: 'the custom of Haifa', source: PENINEI_SHABBAT_3_2 },
});

// The Israel outline lives in israel.ts so that the zmanim and calendar code can use it
// without the city table.
export { ISRAEL_BOUNDARY, isInIsrael } from './israel.js';

// ------------------------------------------------------------ the built-in table

function fromRow(r: CityRow): Place {
  const [id, name, nameHe, latitude, longitude, elevation, timeZone, country, aliases, geonameId] = r;
  const candles = LOCAL_CANDLE_LIGHTING[geonameId];
  return { id, name, nameHe, latitude, longitude, elevation, timeZone, country, aliases, israel: isInIsrael(latitude, longitude), ...(candles ? { candleLighting: candles } : {}) };
}

let cities: Place[] | null = null;

/** The built-in cities (about 200 with Jewish communities worldwide, plus high-latitude and date-line test places). */
export function builtInPlaces(): readonly Place[] {
  return (cities ??= deepFreeze(CITY_ROWS.map(fromRow)));
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
 * both become "bnbrk"; "Petach Tikvah" and "Petah Tiqwa" become "pthtkv". Doubled letters
 * are merged before the vowels go, so "Kiryat Ata" (krtt) stays apart from "Qurayyat" (krt).
 */
export function nameSkeleton(s: string): string {
  return foldName(s)
    .replace(/kh|ch/g, 'h')
    .replace(/q/g, 'k')
    .replace(/w/g, 'v')
    .replace(/ph/g, 'f')
    .replace(/tz|ts/g, 'z')
    .replace(/h$/, '')
    .replace(/(.)\1+/g, '$1')
    .replace(/[aeiouy]/g, '');
}

/** Shortest skeleton that may match on its own: three consonants match too much ("Emmanuel" and "Manila" are both "mnl"). */
const MIN_SKELETON = 4;

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
 * Ties go to larger places. A transliteration match needs a skeleton of at least four
 * consonants, and a skeleton-prefix match must cover most of the name, so a short or loose
 * resemblance finds nothing rather than the wrong city.
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
      else if (qs.length >= MIN_SKELETON && nameSkeleton(n) === qs) score = Math.max(score, 70);
      else if (q.length >= 3 && f.includes(q)) score = Math.max(score, 50);
      else if (qs.length >= MIN_SKELETON + 1) {
        const ns = nameSkeleton(n);
        if (ns.startsWith(qs) && qs.length >= 0.75 * ns.length) score = Math.max(score, 40);
      }
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
