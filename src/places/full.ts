/**
 * `luach/places-full`: every city of 15,000+ people (about 34,000), from GeoNames
 * (https://www.geonames.org/), CC-BY 4.0. A separate entry point so that the main bundle
 * stays small. Use it with `searchPlaces(query, { places: fullPlaces() })`.
 *
 * @module luach/places-full
 */

import { FULL_CITY_DATA } from './full-data.js';
import { isInIsrael, LOCAL_CANDLE_LIGHTING, type Place } from './places.js';

let parsed: Place[] | null = null;

/** All cities of 15,000+ people. Parsed on first call. */
export function fullPlaces(): readonly Place[] {
  if (parsed) return parsed;
  parsed = FULL_CITY_DATA.split('\n').map((line) => {
    const [id, name, ascii, he, lat, lon, elev, tz, cc, , pop] = line.split('\t');
    const latitude = Number(lat);
    const longitude = Number(lon);
    const candles = LOCAL_CANDLE_LIGHTING[Number(id)];
    return {
      id: `geonames:${id}`,
      name: name!,
      nameHe: he ?? '',
      latitude,
      longitude,
      elevation: Number(elev) || 0,
      timeZone: tz!,
      country: cc!,
      aliases: ascii ? [ascii] : [],
      israel: isInIsrael(latitude, longitude),
      population: Number(pop) || 0,
      ...(candles ? { candleLighting: candles } : {}),
    };
  });
  return parsed;
}

export { searchPlaces, isInIsrael, foldName, nameSkeleton, nearestPlace, distanceKm, type Place } from './places.js';
