/**
 * Sefiras HaOmer: the day, the count text, and the sefirah of the day.
 *
 * The count begins on the night of 16 Nisan, the second night of Pesach (Vayikra 23:15–16,
 * "the day after the sabbath", read as after the first day of Pesach; Shulchan Aruch OC 489:1:
 * "בליל שני ... מתחילין לספור העומר") and runs 49 days to the
 * eve of Shavuos. A Hebrew date's Omer day is the count said on the evening that
 * *begins* that date: 16 Nisan is day 1.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';

/** The Omer day (1–49) of a Hebrew date, or `null` outside the Omer. */
export function omerDay(date: HebrewDate): number | null {
  const n = date.daysSince(new HebrewDate(date.year, Month.NISAN, 15));
  return n >= 1 && n <= 49 ? n : null;
}

const ONES_M = ['', 'אחד', 'שני', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה'];
const TEENS = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלשה עשר', 'ארבעה עשר', 'חמשה עשר', 'ששה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
const TENS = ['', '', 'עשרים', 'שלשים', 'ארבעים'];
const UNITS_IN_COMPOUND = ['', 'אחד', 'שנים', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה'];

/** Customs of wording the count. */
export type OmerNusach = 'ashkenaz' | 'sefard' | 'edot-hamizrach';

function daysPhrase(n: number, unitsFirst: boolean): string {
  if (n === 1) return 'יום אחד';
  if (n === 2) return 'שני ימים';
  if (n <= 9) return `${ONES_M[n]} ימים`;
  if (n === 10) return 'עשרה ימים';
  if (n < 20) return `${TEENS[n - 10]} יום`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return `${TENS[t]} יום`;
  return unitsFirst ? `${UNITS_IN_COMPOUND[u]} ו${TENS[t]} יום` : `${TENS[t]} ו${UNITS_IN_COMPOUND[u]} יום`;
}

const WEEKS = ['', 'שבוע אחד', 'שני שבועות', 'שלשה שבועות', 'ארבעה שבועות', 'חמשה שבועות', 'ששה שבועות', 'שבעה שבועות'];
const AND_DAYS = ['', 'ויום אחד', 'ושני ימים', 'ושלשה ימים', 'וארבעה ימים', 'וחמשה ימים', 'וששה ימים'];

/**
 * The Hebrew count for Omer day `n` (1–49), without nikud.
 *
 * - `ashkenaz`: "היום שמונה ימים שהם שבוע אחד ויום אחד לעומר" (units before tens: "אחד ועשרים");
 * - `sefard`: the same with "בעומר";
 * - `edot-hamizrach`: tens before units ("עשרים ואחד"), and "לעומר" before "שהם".
 *
 * Wordings differ between siddurim; check the user's siddur. Default `ashkenaz`.
 */
export function omerText(n: number, nusach: OmerNusach = 'ashkenaz'): string {
  if (!Number.isInteger(n) || n < 1 || n > 49) throw new RangeError(`Omer day must be 1–49, got ${n}`);
  const unitsFirst = nusach !== 'edot-hamizrach';
  const suffix = nusach === 'sefard' ? 'בעומר' : 'לעומר';
  const days = daysPhrase(n, unitsFirst);
  if (n < 7) return `היום ${days} ${suffix}`;
  const w = Math.floor(n / 7);
  const r = n % 7;
  const weeks = `שהם ${WEEKS[w]}${r ? ' ' + AND_DAYS[r] : ''}`;
  return nusach === 'edot-hamizrach' ? `היום ${days} ${suffix}, ${weeks}` : `היום ${days} ${weeks} ${suffix}`;
}

const EN_NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty'];
function enNumber(n: number): string {
  if (n < 20) return EN_NUM[n] ?? '';
  const t = EN_TENS[Math.floor(n / 10)] ?? '';
  return n % 10 ? `${t}-${EN_NUM[n % 10]}` : t;
}

/** The count in English: "Today is eight days, which are one week and one day, of the Omer." */
export function omerTextEnglish(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 49) throw new RangeError(`Omer day must be 1–49, got ${n}`);
  const days = n === 1 ? 'one day' : `${enNumber(n)} days`;
  if (n < 7) return `Today is ${days} of the Omer.`;
  const w = Math.floor(n / 7);
  const r = n % 7;
  const weeks = w === 1 ? 'one week' : `${enNumber(w)} weeks`;
  const rest = r === 0 ? '' : r === 1 ? ' and one day' : ` and ${enNumber(r)} days`;
  return `Today is ${days}, which ${w === 1 && r === 0 ? 'is' : 'are'} ${weeks}${rest}, of the Omer.`;
}

const SEFIROS_HE = ['חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'];
const SEFIROS_ASHK = ['Chesed', 'Gevurah', 'Tiferes', 'Netzach', 'Hod', 'Yesod', 'Malchus'];
const SEFIROS_SEPH = ['Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malchut'];

/**
 * The sefirah of Omer day `n`: the day's attribute within the week's attribute, e.g.
 * day 8 is "חסד שבגבורה" / "Chesed sheb'Gevurah".
 */
export function omerSefirah(n: number, style: 'he' | 'ashkenazi' | 'sephardi' = 'he'): string {
  if (!Number.isInteger(n) || n < 1 || n > 49) throw new RangeError(`Omer day must be 1–49, got ${n}`);
  const week = Math.floor((n - 1) / 7);
  const day = (n - 1) % 7;
  const t = style === 'he' ? SEFIROS_HE : style === 'ashkenazi' ? SEFIROS_ASHK : SEFIROS_SEPH;
  return style === 'he' ? `${t[day]} שב${t[week]}` : `${t[day]} sheb'${t[week]}`;
}
