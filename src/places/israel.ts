/**
 * Whether a place keeps the rules of Israel or of the diaspora: the outline, and how a
 * calendar call decides when the caller does not say.
 */

import { deepFreeze } from '../util/freeze.js';

/**
 * The boundary used by {@link isInIsrael}, as [longitude, latitude] points. It is a
 * simplified outline, drawn for Luach, of the area where communities keep one day of Yom
 * Tov: the State of Israel together with Judea and Samaria, the Golan Heights and Gaza.
 * It is accurate to a few kilometres; near a border, or for any halachic question about
 * where one day or two are kept, ask your rav and pass `israel` explicitly. It makes no
 * political statement. Checked against GeoNames coordinates of places on both sides of
 * each border (`test/places.test.ts`).
 */
export const ISRAEL_BOUNDARY: ReadonlyArray<readonly [number, number]> = /*#__PURE__*/ deepFreeze([
  // Lebanon, west to east, round the Galilee panhandle (Metula) and north of Ghajar
  [35.104, 33.093], [35.18, 33.095], [35.25, 33.1], [35.32, 33.095], [35.4, 33.09], [35.48, 33.09],
  [35.51, 33.1], [35.535, 33.13], [35.54, 33.2], [35.545, 33.25], [35.565, 33.285], [35.578, 33.295],
  [35.6, 33.285], [35.63, 33.29], [35.67, 33.3], [35.71, 33.32], [35.77, 33.335], [35.81, 33.33],
  // The Golan's eastern line, south to the Yarmouk (Hamat Gader inside, Umm Qais outside)
  [35.84, 33.27], [35.82, 33.2], [35.805, 33.14], [35.815, 33.1], [35.86, 33.03], [35.88, 32.95],
  [35.87, 32.84], [35.84, 32.78], [35.82, 32.73], [35.79, 32.715], [35.75, 32.7], [35.7, 32.69],
  [35.665, 32.679], [35.62, 32.665], [35.585, 32.64],
  // The Jordan, the Dead Sea and the Arava (Neot HaKikar and Yotvata inside)
  [35.575, 32.55], [35.565, 32.4], [35.55, 32.2], [35.54, 32.0], [35.55, 31.78], [35.55, 31.5],
  [35.45, 31.05], [35.4, 30.93], [35.33, 30.75], [35.27, 30.6], [35.21, 30.4], [35.18, 30.25],
  [35.13, 30.05], [35.09, 29.9], [35.04, 29.7], [34.982, 29.54],
  // Egypt, from Taba to Kerem Shalom and Rafah; then the coast
  [34.9, 29.49], [34.75, 29.9], [34.6, 30.3], [34.52, 30.6], [34.4, 30.9], [34.284, 31.219], [34.218, 31.321],
  [34.5, 31.7], [34.72, 32.1], [34.85, 32.5], [34.95, 32.85], [35.07, 33.1],
] as [number, number][]);

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

/** A location that may say for itself whether it is in Israel (as a built-in `Place` does). */
export interface IsraelLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly israel?: boolean;
}

/**
 * Israel or the diaspora for a calendar call: an explicit choice wins; otherwise the
 * location's own `israel` flag; otherwise {@link isInIsrael} on its coordinates; with no
 * location, the diaspora. Internal; not exported from the package.
 */
export function israelFor(explicit: boolean | undefined, location: IsraelLocation | undefined): boolean {
  if (explicit !== undefined) return explicit;
  if (!location) return false;
  return location.israel ?? isInIsrael(location.latitude, location.longitude);
}
