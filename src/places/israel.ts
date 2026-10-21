/**
 * Is a point in Israel, for the purpose of the Israel calendar (one day of Yom Tov, the Israel parsha)?
 *
 * The boundary is a coarse polygon (see `israel-boundary.json`) around the area whose residents keep the
 * Eretz Yisrael calendar, including the Golan Heights and Judea and Samaria. It is accurate to a few
 * kilometres, is not a political statement, and is only a helper: every Luach function that depends on it
 * takes an explicit `location: 'israel' | 'diaspora'`, so the caller (or the user) decides.
 *
 * @packageDocumentation
 */

import boundary from './israel-boundary.json';

const points = (): ReadonlyArray<readonly [number, number]> => boundary.points as unknown as ReadonlyArray<readonly [number, number]>;

/** True if (latitude, longitude) is inside the boundary. `override` wins when given. */
export function isInIsrael(latitude: number, longitude: number, override?: boolean): boolean {
  if (override !== undefined) return override;
  const POINTS = points();
  let inside = false;
  for (let i = 0, j = POINTS.length - 1; i < POINTS.length; j = i, i += 1) {
    const [yi, xi] = POINTS[i] as readonly [number, number];
    const [yj, xj] = POINTS[j] as readonly [number, number];
    if (yi > latitude !== yj > latitude && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
