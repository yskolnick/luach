import { ashkenazi } from './ashkenazi.js';
import { extendLocale, type Locale } from './types.js';

/**
 * Chabad spellings. Today it names everything as {@link ashkenazi} does; a name is added here only
 * from a written source.
 */
export const chabad: Locale = /* @__PURE__ */ extendLocale(ashkenazi, {}, 'chabad');
