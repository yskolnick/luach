/**
 * Hebrew numerals (gematriya).
 *
 * Values are the standard letter values: א–ט 1–9, י–צ 10–90, ק–ת 100–400; 500–900 are
 * written with ת plus the rest (תק = 500, תת = 800). 15 and 16 are written ט״ו and ט״ז
 * rather than spelling a Divine Name, also inside larger numbers (קט״ו = 115).
 * A single letter takes a geresh (׳); otherwise gershayim (״) goes before the last letter.
 * Thousands are written as a letter with a geresh (ה׳ = 5000): ה׳תשפ״ז = 5787.
 * An exact multiple of 1000 is therefore written like its units digit (א׳ is 1 or 1000);
 * {@link parseGematriya} reads it as the units.
 *
 * @packageDocumentation
 */

/** U+05F3 HEBREW PUNCTUATION GERESH. */
export const GERESH = '׳';
/** U+05F4 HEBREW PUNCTUATION GERSHAYIM. */
export const GERSHAYIM = '״';

const UNITS = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת'];

/** Options for {@link gematriya}. */
export interface GematriyaOptions {
  /**
   * Whether to write the thousands. Default `true`. With `false`, 5787 is written תשפ״ז,
   * as years usually are; the thousands are simply dropped.
   */
  thousands?: boolean;
  /** Add geresh/gershayim. Default `true`. */
  punctuate?: boolean;
}

function lettersBelow1000(n: number): string {
  let s = '';
  let h = Math.floor(n / 100);
  while (h >= 4) {
    s += 'ת';
    h -= 4;
  }
  s += HUNDREDS[h];
  const tu = n % 100;
  if (tu === 15) return s + 'טו';
  if (tu === 16) return s + 'טז';
  return s + TENS[Math.floor(tu / 10)] + UNITS[tu % 10];
}

function punctuate(letters: string): string {
  if (letters.length === 0) return '';
  if (letters.length === 1) return letters + GERESH;
  return letters.slice(0, -1) + GERSHAYIM + letters.slice(-1);
}

/**
 * Writes a positive integer (1–999,999) in Hebrew letters.
 *
 * @example gematriya(5787) // "ה׳תשפ״ז"
 * @example gematriya(5787, { thousands: false }) // "תשפ״ז"
 * @example gematriya(15) // "ט״ו"
 */
export function gematriya(n: number, options?: GematriyaOptions): string {
  if (!Number.isInteger(n) || n < 1 || n > 999_999) {
    throw new RangeError(`gematriya() takes an integer from 1 to 999999, got ${n}`);
  }
  const withThousands = options?.thousands ?? true;
  const punct = options?.punctuate ?? true;
  const k = Math.floor(n / 1000);
  const rest = n % 1000;
  let out = '';
  if (k > 0 && (withThousands || rest === 0)) {
    const kl = lettersBelow1000(k);
    out += punct ? kl + GERESH : kl;
  }
  if (rest > 0) {
    const rl = lettersBelow1000(rest);
    out += punct ? punctuate(rl) : rl;
  }
  return out;
}

const VALUES: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
};

/** Final letters read as their ordinary forms. */
const FINALS: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };

/**
 * One group (below 1000) in the standard order: up to two ת, one of ק/ר/ש, then a tens
 * letter and a units letter, or ט־ו / ט־ז for 15 and 16 (never י־ה or י־ו).
 */
const GROUP = /^(ת{0,2})([קרש]?)(טו|טז|(?!י[הו]$)[יכלמנסעפצ]?[אבגדהוזחט]?)$/;

/**
 * Reads a number written in Hebrew letters, as {@link gematriya} writes it. A geresh after
 * the first group, followed by more letters, marks thousands ("ה׳תשפ״ז" = 5787); thousands
 * need it. ASCII ' and " are accepted too. Final letters count as their ordinary forms.
 *
 * Throws a RangeError on anything else: other characters, letters out of descending order,
 * a repeated unit, ten or hundred (other than ת, ת־ת), 15 or 16 written י־ה or י־ו, and
 * doubled or misplaced geresh or gershayim marks.
 */
export function parseGematriya(s: string): number {
  const text = s.trim().replace(/'/g, GERESH).replace(/"/g, GERSHAYIM);
  if (!text) throw new RangeError('Empty gematriya');
  const bad = (why: string): RangeError => new RangeError(`Not a standard Hebrew numeral (${why}): "${s}"`);
  const parts = text.split(GERESH);
  // A trailing geresh marks a single letter (א׳) or the thousands (ה׳, ה׳א׳).
  if (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
  if (parts.length > 2) throw bad('more than one thousands mark');
  const group = (g: string, thousands: boolean): number => {
    const marks = g.split(GERSHAYIM).length - 1;
    const trimmed = g.trim();
    const letters = trimmed.replace(new RegExp(GERSHAYIM, 'g'), '').replace(/\s+/g, '');
    if (!letters) throw bad('a mark with no letters');
    if (marks > 1) throw bad('more than one gershayim');
    if (marks === 1 && (thousands || trimmed.startsWith(GERSHAYIM) || trimmed.endsWith(GERSHAYIM) || text.endsWith(GERESH))) {
      throw bad('misplaced gershayim');
    }
    let plain = '';
    for (const ch of letters) {
      if (VALUES[ch] === undefined) throw new RangeError(`Not a Hebrew numeral letter: "${ch}" in "${s}"`);
      plain += FINALS[ch] ?? ch;
    }
    if (!GROUP.test(plain)) throw bad('letters out of order or repeated');
    let v = 0;
    for (const ch of plain) v += VALUES[ch]!;
    return v;
  };
  if (parts.length === 2) return group(parts[0]!, true) * 1000 + group(parts[1]!, false);
  return group(parts[0]!, false);
}
