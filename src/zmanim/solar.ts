/**
 * The position of the sun and the times it crosses a given altitude, after the NOAA
 * Solar Calculator (NOAA Global Monitoring Laboratory; a US Government work in the public
 * domain), which implements the low-precision solar theory in Jean Meeus, *Astronomical
 * Algorithms*, chapters 25 and 28. Accuracy is about a minute for latitudes within ±72°.
 *
 * All angles are in degrees unless named `...Rad`. Instants are milliseconds since the
 * Unix epoch (UTC). Longitude is east-positive.
 *
 * @packageDocumentation
 */

import { MS_PER_DAY } from '../time/civil';

const RAD = Math.PI / 180;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);
const tan = (d: number) => Math.tan(d * RAD);

/** Julian centuries since J2000.0 for an instant. */
export function julianCentury(ms: number): number {
  return (ms / MS_PER_DAY + 2440587.5 - 2451545.0) / 36525;
}

/** The sun's declination (degrees) and the equation of time (minutes) at an instant. */
export function solarPosition(ms: number): { declination: number; equationOfTime: number } {
  const T = julianCentury(ms);
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) + sin(2 * M) * (0.019993 - 0.000101 * T) + sin(3 * M) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const appLong = trueLong - 0.00569 - 0.00478 * sin(omega);
  const meanObliq = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const obliq = meanObliq + 0.00256 * cos(omega);
  const declination = Math.asin(sin(obliq) * sin(appLong)) / RAD;
  const y = tan(obliq / 2) ** 2;
  const eqRad =
    y * Math.sin(2 * L0 * RAD) -
    2 * e * Math.sin(M * RAD) +
    4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
    0.5 * y * y * Math.sin(4 * L0 * RAD) -
    1.25 * e * e * Math.sin(2 * M * RAD);
  return { declination, equationOfTime: (4 * eqRad) / RAD };
}

/**
 * The instant of solar transit (the sun on the meridian; astronomical noon) nearest to
 * `near`, at `longitude`.
 */
export function solarTransit(near: number, longitude: number): number {
  let t = near;
  for (let i = 0; i < 3; i++) {
    const { equationOfTime } = solarPosition(t);
    const day0 = Math.floor(t / MS_PER_DAY) * MS_PER_DAY;
    let tr = day0 + (720 - 4 * longitude - equationOfTime) * 60_000;
    while (tr - near > MS_PER_DAY / 2) tr -= MS_PER_DAY;
    while (near - tr > MS_PER_DAY / 2) tr += MS_PER_DAY;
    t = tr;
  }
  return t;
}

/** Why an event did not happen. */
export type NoEventReason =
  /** The sun stays above this altitude all day (e.g. polar summer, or 16.1° below at high latitude in June). */
  | 'sun-always-above'
  /** The sun stays below this altitude all day (polar night). */
  | 'sun-always-below';

/**
 * The instant on the solar day of `transit` when the sun's centre is at `zenith` degrees
 * from the zenith, rising (morning) or setting (evening); or the reason it is not.
 *
 * Sunrise and sunset use zenith 90.833° (34′ refraction + 16′ semi-diameter); a zman of
 * *d* degrees below the horizon uses 90 + *d* (geometric, no refraction).
 */
export function timeAtZenith(
  transit: number,
  latitude: number,
  longitude: number,
  zenith: number,
  rising: boolean,
): { time: number } | { reason: NoEventReason } {
  let t = transit + (rising ? -6 : 6) * 3_600_000;
  for (let i = 0; i < 4; i++) {
    const { declination } = solarPosition(t);
    const x = cos(zenith) / (cos(latitude) * cos(declination)) - tan(latitude) * tan(declination);
    if (x > 1) return { reason: 'sun-always-below' };
    if (x < -1) return { reason: 'sun-always-above' };
    const ha = Math.acos(x) / RAD;
    const tr = solarTransit(t, longitude);
    // Keep the transit of the same solar day.
    const base = Math.abs(tr - transit) < MS_PER_DAY / 2 ? tr : transit;
    t = base + (rising ? -1 : 1) * ha * 4 * 60_000;
  }
  return { time: t };
}

/** The sun's altitude (degrees above the geometric horizon, no refraction) at an instant and place. */
export function solarAltitude(ms: number, latitude: number, longitude: number): number {
  const { declination, equationOfTime } = solarPosition(ms);
  const minutesUtc = ((ms % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY / 60_000;
  const trueSolarTime = minutesUtc + equationOfTime + 4 * longitude;
  const hourAngle = trueSolarTime / 4 - 180;
  const cosZ = sin(latitude) * sin(declination) + cos(latitude) * cos(declination) * cos(hourAngle);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / RAD;
}

/** Zenith angle of sunrise/sunset at sea level: 90° + 34′ refraction + 16′ solar semi-diameter. */
export const SUNRISE_ZENITH = 90 + 50 / 60;

/** Mean radius of the earth in metres, used for the horizon dip from elevation (*as built*). */
export const EARTH_RADIUS_M = 6_371_000;

/** How far the visible horizon dips below the geometric horizon for an observer `elevation` metres up (degrees). */
export function horizonDip(elevation: number): number {
  if (!(elevation > 0)) return 0;
  return Math.acos(EARTH_RADIUS_M / (EARTH_RADIUS_M + elevation)) / RAD;
}
