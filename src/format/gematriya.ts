/**
 * Hebrew numerals (gematriya).
 *
 * Letters are written from the largest value down. 15 and 16 are written ט״ו and ט״ז (9+6, 9+7)
 * rather than spelling parts of the Divine Name; this applies to any number ending in 15 or 16 (e.g. קט״ו).
 * Values of 500 and over in the hundreds use repeated ת (תק = 500 … תתק = 900).
 * A single letter takes a geresh (׳); two or more take gershayim (״) before the last letter.
 *
 * @packageDocumentation
 */

const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת'];

export const GERESH = '׳'; // ׳
export const GERSHAYIM = '״'; // ״

export interface GematriyaOptions {
  /**
   * Punctuation: `'hebrew'` (׳ and ״, default), `'ascii'` (' and "), or `'none'`.
   * Use `'ascii'` for fonts or systems that lack the Hebrew punctuation marks.
   */
  readonly punctuation?: 'hebrew' | 'ascii' | 'none';
}

/** Letters for 1–999 without punctuation. */
function lettersUnder1000(n: number): string {
  let out = '';
  let h = Math.floor(n / 100);
  while (h > 4) {
    out += 'ת';
    h -= 4;
  }
  out += HUNDREDS[h];
  const rest = n % 100;
  if (rest === 15) return out + 'טו';
  if (rest === 16) return out + 'טז';
  return out + TENS[Math.floor(rest / 10)] + ONES[rest % 10];
}

function punctuate(letters: string, punctuation: 'hebrew' | 'ascii' | 'none'): string {
  if (punctuation === 'none' || letters.length === 0) return letters;
  const geresh = punctuation === 'ascii' ? "'" : GERESH;
  const gershayim = punctuation === 'ascii' ? '"' : GERSHAYIM;
  if (letters.length === 1) return letters + geresh;
  return letters.slice(0, -1) + gershayim + letters.slice(-1);
}

/**
 * A number from 1 to 9999 in Hebrew letters, e.g. `gematriya(15)` → `"ט״ו"`, `gematriya(5787)` → `"ה׳תשפ״ז"`.
 * Thousands are written as a letter with a geresh before the rest. An exact thousand (5000 → ה׳) looks the same
 * as a units digit, so it can't be parsed back unambiguously; years are normally written without thousands.
 */
export function gematriya(n: number, options: GematriyaOptions = {}): string {
  if (!Number.isInteger(n) || n < 1 || n > 9999) throw new RangeError(`gematriya: ${n} is not an integer in 1–9999`);
  const punctuation = options.punctuation ?? 'hebrew';
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const restText = rest === 0 ? '' : punctuate(lettersUnder1000(rest), punctuation);
  if (thousands === 0) return restText;
  const geresh = punctuation === 'hebrew' ? GERESH : punctuation === 'ascii' ? "'" : '';
  return (ONES[thousands] ?? '') + geresh + restText;
}

export interface HebrewYearOptions extends GematriyaOptions {
  /** Include the thousands (ה׳תשפ״ז) rather than the usual short form (תשפ״ז). Default false. */
  readonly thousands?: boolean;
}

/** A Hebrew year in letters: `hebrewYear(5787)` → `"תשפ״ז"`, with `{ thousands: true }` → `"ה׳תשפ״ז"`. */
export function hebrewYearNumeral(year: number, options: HebrewYearOptions = {}): string {
  if (options.thousands || year % 1000 === 0) return gematriya(year, options);
  return gematriya(year % 1000, options);
}

const VALUES: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
};

/**
 * Parse Hebrew letters to a number. Accepts ׳ ״ ' " and spaces; a letter followed by a geresh and then more
 * letters counts as thousands (ה׳תשפ״ז → 5787). Final letters count as their ordinary values.
 * Returns `NaN` if any other character is present.
 */
export function parseGematriya(text: string): number {
  const s = text.trim();
  const m = /^([א-ט])[׳'](?=[א-ת])/.exec(s);
  let total = 0;
  let body = s;
  if (m && m[1] !== undefined) {
    total = (VALUES[m[1]] ?? 0) * 1000;
    body = s.slice(2);
  }
  for (const ch of body) {
    if (ch === GERESH || ch === GERSHAYIM || ch === "'" || ch === '"' || ch === ' ') continue;
    const v = VALUES[ch];
    if (v === undefined) return NaN;
    total += v;
  }
  return total;
}

/**
 * Parse a Hebrew year. Short forms (no thousands) are taken as the sixth millennium: תשפ״ז → 5787.
 */
export function parseHebrewYear(text: string): number {
  const n = parseGematriya(text);
  return n > 0 && n < 1000 ? n + 5000 : n;
}
