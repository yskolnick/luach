/**
 * Name tables for months, weekdays and (from M2) holidays, in four styles. Tables are plain objects keyed by
 * a stable id (`month.nisan`, `weekday.6`, `holiday.pesach`…), so a caller can pass their own table, or
 * override a few names: `{ ...NAMES.ashkenazi, 'month.cheshvan': 'Marcheshvan' }`.
 *
 * @packageDocumentation
 */

import { ADAR, ADAR_II, isLeapYear } from '../calendar/hebrew.js';
import { HOLIDAY_NAMES_ASHKENAZI, HOLIDAY_NAMES_EN, HOLIDAY_NAMES_HE, HOLIDAY_NAMES_SEPHARDI } from '../holidays/names.js';
import { PARSHA_NAMES_ASHKENAZI, PARSHA_NAMES_EN, PARSHA_NAMES_HE, PARSHA_NAMES_SEPHARDI } from '../parsha/names.js';

/** A table of names keyed by id. Missing keys fall back to English, then to the id itself. */
export type NameTable = Readonly<Record<string, string>>;

/** Built-in styles: Hebrew; Ashkenazi transliteration (Teves, Shabbos); Sephardi/Israeli (Tevet, Shabbat); plain English. */
export type NameStyle = 'he' | 'ashkenazi' | 'sephardi' | 'en';

const MONTH_IDS = ['', 'nisan', 'iyar', 'sivan', 'tammuz', 'av', 'elul', 'tishrei', 'cheshvan', 'kislev', 'teves', 'shvat', 'adar', 'adar-ii'];

const he: Record<string, string> = {
  'month.nisan': 'ניסן', 'month.iyar': 'אייר', 'month.sivan': 'סיון', 'month.tammuz': 'תמוז', 'month.av': 'אב',
  'month.elul': 'אלול', 'month.tishrei': 'תשרי', 'month.cheshvan': 'חשון', 'month.kislev': 'כסלו', 'month.teves': 'טבת',
  'month.shvat': 'שבט', 'month.adar': 'אדר', 'month.adar-i': 'אדר א׳', 'month.adar-ii': 'אדר ב׳',
  'weekday.0': 'יום ראשון', 'weekday.1': 'יום שני', 'weekday.2': 'יום שלישי', 'weekday.3': 'יום רביעי',
  'weekday.4': 'יום חמישי', 'weekday.5': 'יום שישי', 'weekday.6': 'שבת',
};

const ashkenazi: Record<string, string> = {
  'month.nisan': 'Nissan', 'month.iyar': 'Iyar', 'month.sivan': 'Sivan', 'month.tammuz': 'Tammuz', 'month.av': 'Av',
  'month.elul': 'Elul', 'month.tishrei': 'Tishrei', 'month.cheshvan': 'Cheshvan', 'month.kislev': 'Kislev',
  'month.teves': 'Teves', 'month.shvat': 'Shvat', 'month.adar': 'Adar', 'month.adar-i': 'Adar I', 'month.adar-ii': 'Adar II',
  'weekday.0': 'Sunday', 'weekday.1': 'Monday', 'weekday.2': 'Tuesday', 'weekday.3': 'Wednesday', 'weekday.4': 'Thursday',
  'weekday.5': 'Friday', 'weekday.6': 'Shabbos',
};

const sephardi: Record<string, string> = {
  'month.nisan': 'Nisan', 'month.iyar': 'Iyar', 'month.sivan': 'Sivan', 'month.tammuz': 'Tamuz', 'month.av': 'Av',
  'month.elul': 'Elul', 'month.tishrei': 'Tishrei', 'month.cheshvan': 'Heshvan', 'month.kislev': 'Kislev',
  'month.teves': 'Tevet', 'month.shvat': 'Shevat', 'month.adar': 'Adar', 'month.adar-i': 'Adar Alef',
  'month.adar-ii': 'Adar Bet',
  'weekday.0': 'Sunday', 'weekday.1': 'Monday', 'weekday.2': 'Tuesday', 'weekday.3': 'Wednesday', 'weekday.4': 'Thursday',
  'weekday.5': 'Friday', 'weekday.6': 'Shabbat',
};

const en: Record<string, string> = {
  'month.nisan': 'Nisan', 'month.iyar': 'Iyyar', 'month.sivan': 'Sivan', 'month.tammuz': 'Tammuz', 'month.av': 'Av',
  'month.elul': 'Elul', 'month.tishrei': 'Tishri', 'month.cheshvan': 'Heshvan', 'month.kislev': 'Kislev',
  'month.teves': 'Tevet', 'month.shvat': 'Shevat', 'month.adar': 'Adar', 'month.adar-i': 'Adar I', 'month.adar-ii': 'Adar II',
  'weekday.0': 'Sunday', 'weekday.1': 'Monday', 'weekday.2': 'Tuesday', 'weekday.3': 'Wednesday', 'weekday.4': 'Thursday',
  'weekday.5': 'Friday', 'weekday.6': 'Saturday',
};

/** The built-in tables. */
export const NAMES: Readonly<Record<NameStyle, NameTable>> = {
  he: { ...he, ...PARSHA_NAMES_HE, ...HOLIDAY_NAMES_HE },
  ashkenazi: { ...ashkenazi, ...PARSHA_NAMES_ASHKENAZI, ...HOLIDAY_NAMES_ASHKENAZI },
  sephardi: { ...sephardi, ...PARSHA_NAMES_SEPHARDI, ...HOLIDAY_NAMES_SEPHARDI },
  en: { ...en, ...PARSHA_NAMES_EN, ...HOLIDAY_NAMES_EN },
};

/** Look up a name. `names` is a style or a custom table; missing keys fall back to English, then the id. */
export function nameOf(key: string, names: NameStyle | NameTable = 'en'): string {
  const table = typeof names === 'string' ? NAMES[names] : names;
  return table[key] ?? NAMES.en[key] ?? key;
}

/** The id of a month in a given year (`'adar'`, or `'adar-i'`/`'adar-ii'` in a leap year). */
export function monthId(year: number, month: number): string {
  if (month === ADAR && isLeapYear(year)) return 'adar-i';
  if (month === ADAR_II) return 'adar-ii';
  const id = MONTH_IDS[month];
  if (!id) throw new RangeError(`Invalid month ${month}`);
  return id;
}

/** Month name: `monthName(5787, NISAN, 'he')` → `"ניסן"`. Adar is "Adar I" in a leap year. */
export function monthName(year: number, month: number, names: NameStyle | NameTable = 'en'): string {
  return nameOf(`month.${monthId(year, month)}`, names);
}

/** Weekday name, 0 = Sunday … 6 = Shabbos. */
export function weekdayName(dayOfWeek: number, names: NameStyle | NameTable = 'en'): string {
  return nameOf(`weekday.${dayOfWeek}`, names);
}
