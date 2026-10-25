/**
 * A second, independent sunrise/sunset algorithm for cross-checking: the method of the
 * US Naval Observatory's *Almanac for Computers* (1990; a US Government work in the public
 * domain). It is less precise than {@link timeAtZenith} (a minute or two) and is offered
 * so results can be checked against two methods.
 *
 * @packageDocumentation
 */

import { MS_PER_DAY, daysToCivil, civilToDays } from '../time/civil.js';
import type { NoEventReason } from './solar.js';

const RAD = Math.PI / 180;

/**
 * Sun at `zenith` on the solar day nearest `transit` (an approximate local noon instant),
 * rising or setting, by the USNO method.
 */
export function usnoTimeAtZenith(
  transit: number,
  latitude: number,
  longitude: number,
  zenith: number,
  rising: boolean,
): { time: number } | { reason: NoEventReason } {
  // Day of year of the UTC date of the local noon.
  const days = Math.floor(transit / MS_PER_DAY);
  const c = daysToCivil(days);
  const n = days - civilToDays(c.year, 1, 1) + 1;
  const lngHour = longitude / 15;
  const t = n + ((rising ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * RAD)) / RAD;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * RAD);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(zenith * RAD) - sinDec * Math.sin(latitude * RAD)) / (cosDec * Math.cos(latitude * RAD));
  if (cosH > 1) return { reason: 'sun-always-below' };
  if (cosH < -1) return { reason: 'sun-always-above' };
  const H = (rising ? 360 - Math.acos(cosH) / RAD : Math.acos(cosH) / RAD) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const ut = (((T - lngHour) % 24) + 24) % 24;
  let ms = days * MS_PER_DAY + ut * 3_600_000;
  const expected = transit + (rising ? -6 : 6) * 3_600_000;
  while (ms - expected > MS_PER_DAY / 2) ms -= MS_PER_DAY;
  while (expected - ms > MS_PER_DAY / 2) ms += MS_PER_DAY;
  return { time: ms };
}
