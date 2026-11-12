/**
 * `luach/places`: the built-in city table (about 200 cities with Jewish communities, plus
 * places at high latitudes and near the date line), search by name (English spellings and Hebrew),
 * the nearest place to a point, and the documented local candle-lighting customs. A separate
 * entry point so that the main bundle stays small. For every city of 15,000+ people use
 * `luach/places-full`.
 *
 * City data: GeoNames (https://www.geonames.org/), licensed CC-BY 4.0. `isInIsrael` and
 * `ISRAEL_BOUNDARY` stay in `luach`.
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @module luach/places
 */

export { builtInPlaces, getPlace, searchPlaces, nearestPlace, distanceKm, LOCAL_CANDLE_LIGHTING, type Place, type CandleLightingCustom, type SearchOptions } from './places.js';
