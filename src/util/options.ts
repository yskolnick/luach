/**
 * Checks of the options objects that public functions take: an unknown key or a value that is
 * not one of the choices throws, instead of being ignored (an ignored option gives the answer
 * for the defaults). Internal; not exported from the package.
 */

// Plain literals, and functions for the lists built from them, so that a list nobody imports is dropped from a bundle.
export const HOLIDAY_KEYS: readonly string[] = ['israel', 'modernIsraeli', 'israeliCommemorations', 'behab', 'yomKippurKatan', 'yomKippurKatanOnFriday', 'yomKippurKatanCheshvan', 'shovavim', 'yizkor', 'chabad', 'shabbosMevorchim', 'walledCity'];
export const SETTINGS_KEYS: readonly string[] = ['candleLightingMinutes', 'useElevation', 'beginningsSunset', 'ateretTorahMinutes', 'highLatitudeFallback', 'algorithm', 'round'];
export const ZMANIM_OPTION_KEYS: readonly string[] = ['israel', 'modernIsraeli', 'israeliCommemorations', 'behab', 'yomKippurKatan', 'yomKippurKatanOnFriday', 'yomKippurKatanCheshvan', 'shovavim', 'yizkor', 'chabad', 'shabbosMevorchim', 'walledCity', 'candleLightingMinutes', 'useElevation', 'beginningsSunset', 'ateretTorahMinutes', 'highLatitudeFallback', 'algorithm', 'round', 'opinions', 'chanukahLighting', 'secondNightCandles', 'omerFrom'];
export const tefillaKeys = (): readonly string[] => [...HOLIDAY_KEYS, 'tishreiTachanun', 'sivanTachanun', 'pesachSheniTachanun', 'modernDaysNoTachanun', 'minhag', 'mizmorLesodah', 'noTachanunDays'];
export const dayInfoKeys = (): readonly string[] => [...ZMANIM_OPTION_KEYS, 'location', 'locale', 'minhag', 'omerNusach', 'holidays', 'tefilla', 'zmanim', 'learning'];
export const nowInfoKeys = (): readonly string[] => [...ZMANIM_OPTION_KEYS, 'locale', 'learning', 'omerNusach'];

const ZMANIM_ENUMS: Readonly<Record<string, readonly string[]>> = {
  highLatitudeFallback: ['none', 'nearestDay', 'halfNight'],
  beginningsSunset: ['sea-level', 'elevation'],
  round: ['safe', 'none'],
  algorithm: ['noaa', 'usno'],
  chanukahLighting: ['sunset', 'tzeis'],
  omerFrom: ['tzeis', 'holy-day-ends'],
  yomKippurKatanOnFriday: ['thursday', 'friday'],
};

/** The enum options of the day views and `tefillaOn`, besides the zmanim ones. */
export const DAY_ENUMS: Readonly<Record<string, readonly string[]>> = {
  tishreiTachanun: ['isruChag', 'endOfTishrei'],
  sivanTachanun: ['12Sivan', 'isruChag'],
  pesachSheniTachanun: ['omit', 'say'],
  mizmorLesodah: ['rema', 'sephardi'],
  omerNusach: ['ashkenaz', 'sefard', 'edot-hamizrach', 'chabad'],
};

/** Edit distance between two short words. */
function distance(a: string, b: string): number {
  const row = [...Array(b.length + 1).keys()];
  for (let i = 0; i < a.length; i++) {
    let diag = row[0]!;
    row[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const up = row[j + 1]!;
      row[j + 1] = Math.min(up + 1, row[j]! + 1, diag + +(a[i] !== b[j]));
      diag = up;
    }
  }
  return row[b.length]!;
}

/** `israel` must be a boolean, or undefined or null. */
export function checkIsrael(v: unknown): void {
  if (v !== undefined && v !== null && typeof v !== 'boolean') throw new TypeError(`israel must be a boolean, not ${JSON.stringify(v)}`);
}

/**
 * Throws a TypeError for a key of `options` that is not in `known`, naming it and the nearest
 * known one; a RangeError for an enum option with a value it does not know; a TypeError for a
 * non-boolean `israel`. Anything that is not an object is left to the function's own checks.
 */
export function checkOptions(fn: string, options: unknown, known: readonly string[], more: Readonly<Record<string, readonly string[]>> = {}): void {
  if (options === undefined || options === null || typeof options !== 'object') return;
  const o = options as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    if (!known.includes(k)) {
      const d = (x: string) => distance(k, x);
      throw new TypeError(`${fn}: unknown option "${k}"; did you mean "${known.reduce((best, x) => (d(x) < d(best) ? x : best))}"?`);
    }
  }
  checkIsrael(o['israel']);
  for (const [k, allowed] of Object.entries({ ...ZMANIM_ENUMS, ...more })) {
    const v = o[k];
    if (v !== undefined && !(typeof v === 'string' && allowed.includes(v))) throw new RangeError(`${k} must be "${allowed.join('" or "')}", not ${JSON.stringify(v)}`);
  }
}
