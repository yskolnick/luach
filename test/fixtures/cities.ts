// Test cities for the zmanim oracle comparisons (brief §1): hemispheres, DST, the date line, high latitude.
// Coordinates and elevations are approximate city-centre values; both libraries get the same inputs.
import type { GeoLocation } from '../../src/zmanim/zmanim.js';

export const TEST_CITIES: Record<string, GeoLocation> = {
  Jerusalem: { latitude: 31.7683, longitude: 35.2137, elevation: 754, timeZone: 'Asia/Jerusalem' },
  'Bnei Brak': { latitude: 32.0807, longitude: 34.8338, elevation: 30, timeZone: 'Asia/Jerusalem' },
  Brooklyn: { latitude: 40.6782, longitude: -73.9442, elevation: 10, timeZone: 'America/New_York' },
  Lakewood: { latitude: 40.0821, longitude: -74.2097, elevation: 20, timeZone: 'America/New_York' },
  'Los Angeles': { latitude: 34.0522, longitude: -118.2437, elevation: 89, timeZone: 'America/Los_Angeles' },
  Toronto: { latitude: 43.6532, longitude: -79.3832, elevation: 76, timeZone: 'America/Toronto' },
  'Mexico City': { latitude: 19.4326, longitude: -99.1332, elevation: 2240, timeZone: 'America/Mexico_City' },
  London: { latitude: 51.5074, longitude: -0.1278, elevation: 11, timeZone: 'Europe/London' },
  Manchester: { latitude: 53.4808, longitude: -2.2426, elevation: 38, timeZone: 'Europe/London' },
  Antwerp: { latitude: 51.2194, longitude: 4.4025, elevation: 10, timeZone: 'Europe/Brussels' },
  Paris: { latitude: 48.8566, longitude: 2.3522, elevation: 35, timeZone: 'Europe/Paris' },
  Johannesburg: { latitude: -26.2041, longitude: 28.0473, elevation: 1753, timeZone: 'Africa/Johannesburg' },
  Melbourne: { latitude: -37.8136, longitude: 144.9631, elevation: 31, timeZone: 'Australia/Melbourne' },
  Sydney: { latitude: -33.8688, longitude: 151.2093, elevation: 58, timeZone: 'Australia/Sydney' },
  Auckland: { latitude: -36.8485, longitude: 174.7633, elevation: 26, timeZone: 'Pacific/Auckland' },
  Chatham: { latitude: -43.9535, longitude: -176.5597, elevation: 30, timeZone: 'Pacific/Chatham' },
  Anchorage: { latitude: 61.2181, longitude: -149.9003, elevation: 31, timeZone: 'America/Anchorage' },
  Reykjavik: { latitude: 64.1466, longitude: -21.9426, elevation: 15, timeZone: 'Atlantic/Reykjavik' },
  Tromsø: { latitude: 69.6492, longitude: 18.9553, elevation: 10, timeZone: 'Europe/Oslo' },
};
