/**
 * Solar position and the times the sun reaches a given angle, from the equations of the NOAA Solar Calculator
 * (NOAA Global Monitoring Laboratory; US government work, public domain), which follow Jean Meeus,
 * *Astronomical Algorithms*, chapter 25 (low-accuracy solar coordinates).
 *
 * Accuracy: about one minute for latitudes within ±72°; less near the poles, where the sun moves almost
 * horizontally and small errors in altitude become large errors in time.
 *
 * @packageDocumentation
 */

const DEG = Math.PI / 180;
const MS_PER_DAY = 86_400_000;
/** Julian Day of the Unix epoch (1970-01-01T00:00Z). */
const JD_UNIX_EPOCH = 2440587.5;
const J2000 = 2451545.0;

/** Julian centuries since J2000.0 for an instant (ms since the Unix epoch). */
export function julianCentury(epochMs: number): number {
  return (epochMs / MS_PER_DAY + JD_UNIX_EPOCH - J2000) / 36525;
}

const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);

/** The sun's declination (degrees) and the equation of time (minutes) at Julian century `t`. */
export function solarCoordinates(t: number): { declination: number; equationOfTime: number } {
  const meanLongitude = (((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360) + 360) % 360;
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const center =
    sin(meanAnomaly) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    sin(2 * meanAnomaly) * (0.019993 - 0.000101 * t) +
    sin(3 * meanAnomaly) * 0.000289;
  const trueLongitude = meanLongitude + center;
  const omega = 125.04 - 1934.136 * t;
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * sin(omega);
  const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = meanObliquity + 0.00256 * cos(omega);
  const declination = Math.asin(sin(obliquity) * sin(apparentLongitude)) / DEG;
  const y = tan(obliquity / 2) ** 2;
  const eqRad =
    y * sin(2 * meanLongitude) -
    2 * eccentricity * sin(meanAnomaly) +
    4 * eccentricity * y * sin(meanAnomaly) * cos(2 * meanLongitude) -
    0.5 * y * y * sin(4 * meanLongitude) -
    1.25 * eccentricity * eccentricity * sin(2 * meanAnomaly);
  return { declination, equationOfTime: (4 * eqRad) / DEG };
}

/** The sun's altitude above the horizon (degrees, geometric, no refraction) at an instant and place. */
export function solarAltitude(epochMs: number, latitude: number, longitude: number): number {
  const { declination, equationOfTime } = solarCoordinates(julianCentury(epochMs));
  const minutesUtc = (((epochMs % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY) / 60_000;
  const trueSolarTime = minutesUtc + equationOfTime + 4 * longitude;
  const hourAngle = trueSolarTime / 4 - 180;
  const cosZenith = sin(latitude) * sin(declination) + cos(latitude) * cos(declination) * cos(hourAngle);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZenith))) / DEG;
}

/** The instant of solar transit (true noon) nearest to `nearMs`, at `longitude` (east positive). */
export function solarTransit(nearMs: number, longitude: number): number {
  let t = nearMs;
  for (let i = 0; i < 3; i += 1) {
    const { equationOfTime } = solarCoordinates(julianCentury(t));
    const utcDayStart = Math.floor(t / MS_PER_DAY) * MS_PER_DAY;
    let transit = utcDayStart + (720 - 4 * longitude - equationOfTime) * 60_000;
    // Choose the transit nearest to `nearMs` (the UTC day may be off by one near the date line).
    while (transit - nearMs > MS_PER_DAY / 2) transit -= MS_PER_DAY;
    while (nearMs - transit > MS_PER_DAY / 2) transit += MS_PER_DAY;
    t = transit;
  }
  return t;
}

/** Result of solving for the time the sun reaches a zenith angle. */
export type SolarEvent =
  | { readonly time: number; readonly reason?: undefined }
  | { readonly time: null; readonly reason: 'sun-always-above' | 'sun-always-below' };

/**
 * When the sun's centre reaches `zenith` degrees (90 = geometric horizon) before (`'morning'`) or after
 * (`'evening'`) the transit at `transitMs`. Iterates so that declination and the equation of time are taken
 * at the event itself.
 */
export function timeAtZenith(
  transitMs: number,
  latitude: number,
  longitude: number,
  zenith: number,
  direction: 'morning' | 'evening',
): SolarEvent {
  void longitude;
  const eotAtTransit = solarCoordinates(julianCentury(transitMs)).equationOfTime;
  let t = transitMs;
  for (let i = 0; i < 4; i += 1) {
    const { declination, equationOfTime } = solarCoordinates(julianCentury(t));
    const cosH = (cos(zenith) - sin(latitude) * sin(declination)) / (cos(latitude) * cos(declination));
    if (cosH > 1) return { time: null, reason: 'sun-always-below' };
    if (cosH < -1) return { time: null, reason: 'sun-always-above' };
    const hourAngle = Math.acos(cosH) / DEG; // degrees; 1° = 4 minutes
    // The transit as it would be computed with the equation of time at the event itself.
    const transit = transitMs + (eotAtTransit - equationOfTime) * 60_000;
    t = direction === 'morning' ? transit - hourAngle * 240_000 : transit + hourAngle * 240_000;
  }
  return { time: t };
}

/** Earth's mean radius in metres, for the dip of the horizon. */
const EARTH_RADIUS_M = 6_371_000;

/**
 * Dip of the horizon for an observer `elevation` metres above the surrounding terrain (degrees),
 * geometric: acos(R / (R + h)).
 */
export function horizonDip(elevation: number): number {
  if (!(elevation > 0)) return 0;
  return Math.acos(EARTH_RADIUS_M / (EARTH_RADIUS_M + elevation)) / DEG;
}

/** Standard refraction at the horizon (34′) plus the sun's semi-diameter (16′): sunrise/sunset zenith 90°50′. */
export const SUNRISE_ZENITH = 90 + 50 / 60;
