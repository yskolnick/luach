/**
 * The everyday words: Shabbos, Havdala, candle lighting, the services, the Omer, and the words
 * of the day (today, tonight, tomorrow …).
 *
 * @packageDocumentation
 */

import { he } from './he.js';
import { lookupIn, type Locale } from './types.js';
import { TERMS, TERM_FALLBACK } from './terms-data.js';
import { NAMES as ZMAN_NAMES } from '../zmanim/labels-data.js';

/** The everyday words Luach has names for; the name is `term.<key>` in a locale's `names`. */
export type TermKey =
  | 'shabbos'
  | 'motzaei-shabbos'
  | 'yom-tov'
  | 'havdala'
  | 'candle-lighting'
  | 'shacharis'
  | 'mincha'
  | 'maariv'
  | 'musaf'
  | 'sefiras-haomer'
  | 'menorah'
  | 'parshas'
  | 'parsha'
  | 'omer'
  | 'erev-shabbos'
  | 'erev-yom-tov'
  | 'motzaei-yom-tov'
  | 'today'
  | 'tonight'
  | 'tomorrow'
  | 'tomorrow-night'
  | 'night'
  | 'evening'
  | 'afternoon';

/**
 * The everyday word `key` in `locale` (default `he`).
 *
 * Looked up like the holiday names: the locale's own `names` (`term.<key>`), then its fallback
 * locales, then the table of its `base` style, then the next style in a fixed order (the Hebrew,
 * Sephardi and English styles fall back to the Ashkenazi spelling, English by way of the Sephardi
 * one). A word in no table comes back as its key, `term.<key>`, as other names do.
 *
 * `havdala` and `candle-lighting` have one name each, the zmanim's: they give the name of
 * `zman.havdala` and `zman.candle-lighting`, so a change to that key shows here too.
 */
export function termName(key: TermKey, locale: Locale = he): string {
  if (key === 'havdala' || key === 'candle-lighting') return lookupIn(locale, `zman.${key}`, ZMAN_NAMES);
  return wordName(key, locale);
}

/**
 * `termName` for the words that are not also zmanim. On its own it does not need the table of
 * zman names, so code that names only these words does not load that table.
 *
 * @internal
 */
export function wordName(key: Exclude<TermKey, 'havdala' | 'candle-lighting'>, locale: Locale): string {
  const k = `term.${key}`;
  for (let l: Locale | undefined = locale; l; l = l.fallback) {
    const v = l.names[k];
    if (v !== undefined) return v;
  }
  for (let l: Locale | undefined = locale; l; l = l.fallback) {
    for (let b: string | undefined = l.base; b; b = TERM_FALLBACK[b]) {
      const v = TERMS[b]?.[key];
      if (v !== undefined) return v;
    }
  }
  return k;
}
