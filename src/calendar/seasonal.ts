/**
 * The Omer, the rain prayers, Birkas HaChama, Kiddush Levana and the molad announcement.
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @packageDocumentation
 */

import { type DayNumber, julianToDayNumber } from './gregorian.js';
import { NISAN, TISHREI, CHESHVAN, type HebrewDate, dayNumberToHebrew, hebrewToDayNumber, PARTS_PER_MONTH } from './hebrew.js';
import { type Location } from '../parsha/parsha.js';
import { molad } from './molad.js';
import { type NameStyle, type NameTable, monthName, weekdayName } from '../format/names.js';

// ---------------------------------------------------------------- Omer

/**
 * Day of the Omer (1–49) for a civil date, or null. The count for day N is said on the evening that begins
 * day N, i.e. the evening before this civil date. Day 1 is 16 Nisan (Vayikra 23:15; SA OC 489:1).
 */
export function omerDay(dayNumber: DayNumber): number | null {
  const { year } = dayNumberToHebrew(dayNumber);
  const n = dayNumber - hebrewToDayNumber(year, NISAN, 16) + 1;
  return n >= 1 && n <= 49 ? n : null;
}

const SEFIROS_EN = ['Chesed', 'Gevurah', 'Tiferes', 'Netzach', 'Hod', 'Yesod', 'Malchus'];
const SEFIROS_SEPHARDI = ['Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malchut'];
const SEFIROS_HE = ['חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'];

/** The sefirah of an Omer day, e.g. day 9 → `"Gevurah sheb'Gevurah"`, Hebrew `"גבורה שבגבורה"`. */
export function omerSefirah(day: number, style: NameStyle = 'ashkenazi'): string {
  if (!Number.isInteger(day) || day < 1 || day > 49) throw new RangeError(`Omer day must be 1–49, got ${day}`);
  const inner = (day - 1) % 7;
  const outer = Math.floor((day - 1) / 7);
  if (style === 'he') return `${SEFIROS_HE[inner]} שב${SEFIROS_HE[outer]}`;
  const t = style === 'sephardi' ? SEFIROS_SEPHARDI : SEFIROS_EN;
  return `${t[inner]} sheb'${t[outer]}`;
}

const UNITS_M = ['', 'אחד', 'שני', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה'];
const TEENS = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלשה עשר', 'ארבעה עשר', 'חמשה עשר', 'ששה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
const TENS_H = ['', '', 'עשרים', 'שלשים', 'ארבעים'];
const UNITS_IN_COMPOUND = ['', 'אחד', 'שנים', 'שלשה', 'ארבעה', 'חמשה', 'ששה', 'שבעה', 'שמונה', 'תשעה'];
const WEEKS = ['', 'שבוע אחד', 'שני שבועות', 'שלשה שבועות', 'ארבעה שבועות', 'חמשה שבועות', 'ששה שבועות', 'שבעה שבועות'];
const DAYS_REST = ['', 'ויום אחד', 'ושני ימים', 'ושלשה ימים', 'וארבעה ימים', 'וחמשה ימים', 'וששה ימים'];

function hebrewDayCount(n: number): string {
  if (n === 1) return 'יום אחד';
  if (n < 10) return `${UNITS_M[n]} ימים`;
  if (n === 10) return 'עשרה ימים';
  if (n < 20) return `${TEENS[n - 10]} יום`;
  const tens = Math.floor(n / 10);
  const units = n % 10;
  return units === 0 ? `${TENS_H[tens]} יום` : `${UNITS_IN_COMPOUND[units]} ו${TENS_H[tens]} יום`;
}

export interface OmerTextOptions {
  /** `'laomer'` (לעומר, Nusach Ashkenaz, default) or `'baomer'` (בעומר, Nusach Sefard / Edot HaMizrach). */
  readonly ending?: 'laomer' | 'baomer';
}

/** The count in Hebrew: `"היום עשרה ימים שהם שבוע אחד ושלשה ימים לעומר"`. Number words follow Nusach Ashkenaz. */
export function omerTextHebrew(day: number, options: OmerTextOptions = {}): string {
  if (!Number.isInteger(day) || day < 1 || day > 49) throw new RangeError(`Omer day must be 1–49, got ${day}`);
  const ending = options.ending === 'baomer' ? 'בעומר' : 'לעומר';
  const weeks = Math.floor(day / 7);
  const rest = day % 7;
  let text = `היום ${hebrewDayCount(day)}`;
  if (weeks > 0) text += ` שהם ${WEEKS[weeks]}${rest > 0 ? ` ${DAYS_REST[rest]}` : ''}`;
  return `${text} ${ending}`;
}

/** The count in English: `"Today is 10 days, which is 1 week and 3 days of the Omer."` */
export function omerTextEnglish(day: number): string {
  if (!Number.isInteger(day) || day < 1 || day > 49) throw new RangeError(`Omer day must be 1–49, got ${day}`);
  const weeks = Math.floor(day / 7);
  const rest = day % 7;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  let text = `Today is ${plural(day, 'day')}`;
  if (weeks > 0) text += `, which is ${plural(weeks, 'week')}${rest > 0 ? ` and ${plural(rest, 'day')}` : ''}`;
  return `${text} of the Omer.`;
}

// ---------------------------------------------------------------- Rain prayers

/** When V'sein tal umatar starts in the autumn of Hebrew year `year`. */
export interface TalUmatarStart {
  /** Civil date of the evening (Maariv) at which it is first said. */
  readonly eveningOf: DayNumber;
  /** The Hebrew date that begins that evening. */
  readonly hebrewDate: HebrewDate;
  readonly source: string;
}

/**
 * Start of "V'sein tal umatar" (the request for rain in the weekday Amidah).
 *
 * - Israel: Maariv of 7 Cheshvan (Taanis 10a; SA OC 117:1).
 * - Diaspora: Maariv of the 60th day after Tekufas Tishrei by Shmuel's reckoning (Taanis 10a; SA OC 117:1).
 *   Shmuel's year is exactly 365¼ days, the Julian year, so the tekufa falls on a fixed Julian date. Counted
 *   from it, the request starts on the evening of Julian 21 November, or 22 November when the next Julian
 *   year is a leap year. In Gregorian dates that is 4 or 5 December in 1900–2099, 5 or 6 December in
 *   2100–2199, and later still afterwards: Luach computes it, it does not hard-code December 4.
 */
export function talUmatarStart(year: number, location: Location): TalUmatarStart {
  if (location === 'israel') {
    const seventh = hebrewToDayNumber(year, CHESHVAN, 7);
    return { eveningOf: seventh - 1, hebrewDate: dayNumberToHebrew(seventh), source: 'Taanis 10a; SA OC 117:1' };
  }
  const civilYear = year - 3761; // Tishrei of Hebrew year Y is in this Gregorian/Julian year
  const nextJulianLeap = (civilYear + 1) % 4 === 0;
  const evening = julianToDayNumber(civilYear, 11, nextJulianLeap ? 22 : 21);
  return { eveningOf: evening, hebrewDate: dayNumberToHebrew(evening + 1), source: 'Taanis 10a; SA OC 117:1 (60 days after Tekufas Tishrei of Shmuel)' };
}

/** What is said in the Amidah on a civil date. Weekday Amidah only for tal umatar; check the day yourself. */
export interface RainPrayers {
  /** "Mashiv haruach umorid hageshem" is said at Shacharis of this day (from Musaf of Shemini Atzeres to before Musaf of Pesach day 1). */
  readonly mashivHaruach: boolean;
  /** "V'sein tal umatar" is said at Shacharis of this day (weekdays; ends after Mincha of Erev Pesach). */
  readonly talUmatar: boolean;
  /** Today the switch happens at Musaf: `'start-geshem'` on Shemini Atzeres, `'stop-geshem'` on Pesach day 1. */
  readonly changeAtMusaf: 'start-geshem' | 'stop-geshem' | null;
}

/** Rain prayers for a civil date (SA OC 114:1, 117:1). */
export function rainPrayers(dayNumber: DayNumber, location: Location): RainPrayers {
  const h = dayNumberToHebrew(dayNumber);
  const y = h.year;
  const shminiAtzeres = hebrewToDayNumber(y, TISHREI, 22);
  const pesach = hebrewToDayNumber(y, NISAN, 15);
  // Both seasons fall within one Hebrew year: geshem from Shacharis of 23 Tishrei through Shacharis of 15 Nisan;
  // tal umatar from the morning after its first evening through Mincha of 14 Nisan.
  const mashivHaruach = dayNumber > shminiAtzeres && dayNumber <= pesach;
  const talUmatar = dayNumber > talUmatarStart(y, location).eveningOf && dayNumber < pesach;
  const changeAtMusaf = dayNumber === shminiAtzeres ? 'start-geshem' : dayNumber === pesach ? 'stop-geshem' : null;
  return { mashivHaruach, talUmatar, changeAtMusaf };
}

// ---------------------------------------------------------------- Birkas HaChama

/**
 * Birkas HaChama, said on the morning after Tekufas Nisan of Shmuel falls at the start of Wednesday, once
 * every 28 years (Berachos 59b; SA OC 229:2). That tekufa falls on Julian 26 March in Julian years
 * ≡ 21 (mod 28): 1981, 2009, 2037… Returns the civil date in Hebrew year `year`, or null.
 */
export function birkasHachama(year: number): DayNumber | null {
  const civilYear = year - 3760; // Nisan of Hebrew year Y is in this civil year
  if (((civilYear % 28) + 28) % 28 !== 21) return null;
  return julianToDayNumber(civilYear, 3, 26);
}

// ---------------------------------------------------------------- Molad instant, Kiddush Levana

/**
 * Longitude used for Jerusalem mean time: 35.2354° E (the Temple Mount). The molad is reckoned in Jerusalem mean
 * solar time (KH 6), which is UTC + 2h 20m 56.5s at this longitude. As built; see DECISIONS.md.
 */
export const JERUSALEM_MEAN_TIME_LONGITUDE = 35.2354;
const JMT_OFFSET_MS = (JERUSALEM_MEAN_TIME_LONGITUDE / 15) * 3_600_000;
const MS_PER_CHELEK = 3_600_000 / 1080;

/** The molad as an instant (milliseconds since 1970-01-01 UTC), converting from Jerusalem mean time. */
export function moladInstant(year: number, month: number): number {
  const m = molad(year, month);
  const local = m.civilDay * 86_400_000 + (m.civilHour * 60 + m.minutes) * 60_000 + m.chalakimAfterMinute * MS_PER_CHELEK;
  return local - JMT_OFFSET_MS;
}

/** A time window for Kiddush Levana by one opinion. */
export interface KiddushLevanaTime {
  readonly time: Date;
  readonly opinion: string;
  readonly source: string;
}

/** Earliest Kiddush Levana: 3 full days after the molad (most acharonim), or 7 days (Mechaber). */
export function kiddushLevanaEarliest(year: number, month: number, opinion: '3-days' | '7-days'): KiddushLevanaTime {
  const t = moladInstant(year, month);
  return opinion === '3-days'
    ? { time: new Date(t + 3 * 86_400_000), opinion: '3 days after the molad', source: 'Mishna Berura 426:20 (most acharonim)' }
    : { time: new Date(t + 7 * 86_400_000), opinion: '7 days after the molad', source: 'Shulchan Aruch OC 426:4' };
}

/**
 * Latest Kiddush Levana: half the mean month after the molad (14d 18h 22m and ½ chelek; Rema OC 426:3, Maharil),
 * or 15 full days after the molad (Shulchan Aruch OC 426:3, as explained in Mishna Berura 426:17).
 */
export function kiddushLevanaLatest(year: number, month: number, opinion: 'half-month' | '15-days'): KiddushLevanaTime {
  const t = moladInstant(year, month);
  return opinion === 'half-month'
    ? { time: new Date(t + (PARTS_PER_MONTH / 2) * MS_PER_CHELEK), opinion: 'half the month after the molad', source: 'Rema OC 426:3 (Maharil)' }
    : { time: new Date(t + 15 * 86_400_000), opinion: '15 days after the molad', source: 'Shulchan Aruch OC 426:3; Mishna Berura 426:17' };
}

// ---------------------------------------------------------------- Molad announcement

/**
 * The molad as announced on Shabbos Mevorchim, using the traditional clock reading (Jerusalem mean time):
 * - English: `"Molad Kislev: Tuesday, 3:43 pm and 2 chalakim"`
 * - Hebrew: `"מולד כסלו: יום שלישי, 15:43 ו-2 חלקים"`
 */
export function moladAnnouncement(year: number, month: number, names: NameStyle | NameTable = 'ashkenazi'): string {
  const m = molad(year, month);
  const mn = monthName(year, month, names);
  const wd = weekdayName(m.civilDayOfWeek, names);
  const mm = String(m.minutes).padStart(2, '0');
  if (names === 'he') {
    return `מולד ${mn}: ${wd}, ${m.civilHour}:${mm} ו-${m.chalakimAfterMinute} חלקים`;
  }
  const h12 = m.civilHour % 12 === 0 ? 12 : m.civilHour % 12;
  const ampm = m.civilHour < 12 ? 'am' : 'pm';
  const ch = m.chalakimAfterMinute === 1 ? 'chelek' : 'chalakim';
  return `Molad ${mn}: ${wd}, ${h12}:${mm} ${ampm} and ${m.chalakimAfterMinute} ${ch}`;
}

