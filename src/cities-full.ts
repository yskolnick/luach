/**
 * The full GeoNames city table (about 34,000 cities with population ≥ 15,000; CC-BY 4.0), as a separate entry
 * point so it is only bundled when imported:
 *
 * ```ts
 * import { searchCities } from 'luach';
 * import { FULL_CITY_TABLE } from 'luach/cities-full';
 * searchCities('Kiryat Sefer', { table: FULL_CITY_TABLE });
 * ```
 *
 * @packageDocumentation
 */

import { ROWS, ZONES } from './places/cities-full-data.js';
import type { CityTable } from './places/places.js';

export const FULL_CITY_TABLE: CityTable = { zones: ZONES, rows: ROWS };
