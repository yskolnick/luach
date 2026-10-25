/**
 * Parsing Hebrew dates written as text: "י״ד אדר תשפ״ז", "14 Adar 5787", "14 Adar II 5787",
 * "Rosh Chodesh"-free, day-month-year order. Month names are matched in every built-in
 * locale, ignoring case, punctuation and nikud.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { isLeapYear } from '../calendar/year.js';
import { parseGematriya } from './gematriya.js';
import { he } from '../locales/he.js';
import { ashkenazi } from '../locales/ashkenazi.js';
import { sephardi } from '../locales/sephardi.js';
import { en } from '../locales/en.js';
import type { Locale } from '../locales/types.js';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-֑ͯ-ׇ]/g, '').toLowerCase().replace(/[‘’'`"״׳.\s-]/g, '');

const EXTRA: Record<string, number> = {
  // Common variants not in the locale tables.
  marcheshvan: 8, mar: 8, מרחשון: 8, חשוון: 8, nisan: 1, iyyar: 2, tamuz: 4, teves: 10, tevet: 10, tebeth: 10, shvat: 11, sh: 11,
  adarrishon: 12, adara: 12, adaralef: 12, adar1: 12, adari: 12, adarsheni: 13, adarb: 13, adarbet: 13, adar2: 13, adarii: 13,
  'אדרא': 12, 'אדרב': 13, 'אדר1': 12, 'אדר2': 13,
};

function monthTable(extra: readonly Locale[]): Map<string, { month: number; leapOnly?: 12 | 13 }> {
  const m = new Map<string, { month: number; leapOnly?: 12 | 13 }>();
  for (const l of [he, ashkenazi, sephardi, en, ...extra]) {
    for (let n = 1; n <= 13; n++) {
      const v = l.names[`month.${n}`];
      if (v) m.set(fold(v), { month: n });
    }
    const a1 = l.names['month.12.leap'];
    const a2 = l.names['month.13.leap'];
    if (a1) m.set(fold(a1), { month: 12, leapOnly: 12 });
    if (a2) m.set(fold(a2), { month: 13, leapOnly: 13 });
  }
  for (const [k, v] of Object.entries(EXTRA)) m.set(fold(k), { month: v });
  return m;
}

/**
 * Parses a Hebrew date written as day, month, year. Accepts Hebrew numerals or digits,
 * and a year with or without thousands (תשפ״ז is taken as 5787). "Adar" in a leap year is
 * read as Adar I unless written "Adar II"/"Adar Sheni"/"אדר ב׳". Throws a RangeError if the
 * text is not a date.
 */
export function parseHebrewDate(text: string, options?: { locales?: readonly Locale[] }): HebrewDate {
  const months = monthTable(options?.locales ?? []);
  const tokens = text.trim().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  if (tokens.length < 3) throw new RangeError(`Not a Hebrew date: "${text}"`);
  const num = (t: string): number => (/^\d+$/.test(t) ? Number(t) : parseGematriya(t));
  const day = num(tokens[0]!);
  const yearToken = tokens[tokens.length - 1]!;
  let year = num(yearToken);
  if (year < 1000 && !/^\d+$/.test(yearToken)) year += 5000;
  const monthText = tokens.slice(1, -1).join(' ');
  // "ט״ו בשבט": a prefixed ב ("in") before the month name.
  const found = months.get(fold(monthText)) ?? (monthText.startsWith('ב') ? months.get(fold(monthText.slice(1))) : undefined);
  if (!found) throw new RangeError(`Unknown Hebrew month "${monthText}" in "${text}"`);
  let month = found.month;
  if (month === 13 && !isLeapYear(year)) throw new RangeError(`${year} is not a leap year (no Adar II)`);
  if (month === 12 && found.leapOnly === 12 && !isLeapYear(year)) month = 12;
  return new HebrewDate(year, month, day);
}
