/**
 * A second, independent sunrise/sunset algorithm for cross-checking: the US Naval Observatory method from the
 * *Almanac for Computers* (1990; US government work, public domain). It is simpler and less precise than
 * NOAA (typically within 1–2 minutes below 60° latitude) and is not used for zmanim; use it to check them.
 *
 * @packageDocumentation
 */

const DEG = Math.PI / 180;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

/**
 * When the sun reaches `zenith` (degrees) on the morning or evening around the solar transit `transitMs`,
 * or null if it doesn't that day.
 */
export function usnoSunEvent(
  transitMs: number,
  latitude: number,
  longitude: number,
  zenith: number,
  direction: 'morning' | 'evening',
): number | null {
  const utcMidnight = Math.floor(transitMs / 86_400_000) * 86_400_000;
  const yearStart = Date.UTC(new Date(utcMidnight).getUTCFullYear(), 0, 1);
  const dayOfYear = Math.round((utcMidnight - yearStart) / 86_400_000) + 1;
  const lngHour = longitude / 15;
  const t = dayOfYear + ((direction === 'morning' ? 6 : 18) - lngHour) / 24;
  const meanAnomaly = 0.9856 * t - 3.289;
  const trueLongitude = norm360(meanAnomaly + 1.916 * Math.sin(meanAnomaly * DEG) + 0.02 * Math.sin(2 * meanAnomaly * DEG) + 282.634);
  let rightAscension = norm360(Math.atan(0.91764 * Math.tan(trueLongitude * DEG)) / DEG);
  rightAscension += Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
  rightAscension /= 15;
  const sinDec = 0.39782 * Math.sin(trueLongitude * DEG);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(zenith * DEG) - sinDec * Math.sin(latitude * DEG)) / (cosDec * Math.cos(latitude * DEG));
  if (cosH > 1 || cosH < -1) return null;
  const hourAngle = (direction === 'morning' ? 360 - Math.acos(cosH) / DEG : Math.acos(cosH) / DEG) / 15;
  const localMeanTime = hourAngle + rightAscension - 0.06571 * t - 6.622;
  const ut = ((localMeanTime - lngHour) % 24 + 24) % 24;
  let event = utcMidnight + ut * 3_600_000;
  // Put the event on the correct side of the transit.
  if (direction === 'morning') {
    while (event > transitMs) event -= 86_400_000;
    while (transitMs - event > 86_400_000) event += 86_400_000;
  } else {
    while (event < transitMs) event += 86_400_000;
    while (event - transitMs > 86_400_000) event -= 86_400_000;
  }
  return event;
}
