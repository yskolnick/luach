import { he } from './he.js';
import { extendLocale, type Locale } from './types.js';

/**
 * Yiddish, in Hebrew letters, right to left. Months, holidays and parshiyos are the Hebrew
 * spellings, as in {@link he}, because words of Hebrew and Aramaic origin keep their traditional
 * spelling in Yiddish; the other names are those of {@link he} until one is added from a written
 * source.
 */
export const yi: Locale = /* @__PURE__ */ extendLocale(he, {}, 'yi');
