import { extendLocale, type Locale } from './types.js';
import { sephardi } from './sephardi.js';

/**
 * Modern Israeli spellings. Today it names everything as {@link sephardi} does; a name is added
 * here only from a written source.
 */
export const israeli: Locale = /* @__PURE__ */ extendLocale(sephardi, {}, 'israeli');
