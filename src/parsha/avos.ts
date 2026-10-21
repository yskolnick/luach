/**
 * Pirkei Avos on summer Shabbos afternoons (Rema OC 292:2).
 *
 * One chapter a week from the first Shabbos after Pesach, chapters 1–6 in order. Not on a Shabbos that is Shavuos,
 * nor on Erev Tisha B'Av (Rema OC 553:2). Customs for the end:
 * - `'until-rosh-hashana'` (default; most Ashkenazim): the cycle continues through the summer, and on the last weeks
 *   before Rosh Hashana two chapters are read each week so that the last Shabbos ends with chapters 5–6.
 * - `'until-shavuos'` (Sephardi custom per Kaf HaChaim 292:23 (unverified)): one round, ending before Shavuos.
 *
 * @packageDocumentation
 */

import { type DayNumber, dayOfWeek } from '../calendar/gregorian.js';
import { AV, NISAN, SIVAN, dayNumberToHebrew, hebrewToDayNumber, roshHashana } from '../calendar/hebrew.js';
import type { Location } from './parsha.js';

export type AvosCustom = 'until-rosh-hashana' | 'until-shavuos';

/** Chapters of Pirkei Avos read on a Shabbos, or null. */
export function pirkeiAvos(shabbos: DayNumber, location: Location, custom: AvosCustom = 'until-rosh-hashana'): readonly number[] | null {
  if (dayOfWeek(shabbos) !== 6) return null;
  const { year } = dayNumberToHebrew(shabbos);
  const firstAfterPesach = hebrewToDayNumber(year, NISAN, location === 'israel' ? 22 : 23);
  const end = custom === 'until-shavuos' ? hebrewToDayNumber(year, SIVAN, 6) : roshHashana(year + 1);
  const shavuos = [hebrewToDayNumber(year, SIVAN, 6), ...(location === 'israel' ? [] : [hebrewToDayNumber(year, SIVAN, 7)])];
  const erevTishaBav = [hebrewToDayNumber(year, AV, 8), hebrewToDayNumber(year, AV, 9)]; // 9 Av on Shabbos: the fast is Sunday

  const weeks: DayNumber[] = [];
  for (let s = firstAfterPesach + ((6 - dayOfWeek(firstAfterPesach) + 7) % 7); s < end; s += 7) {
    if (shavuos.includes(s) || erevTishaBav.includes(s)) continue;
    weeks.push(s);
  }
  const i = weeks.indexOf(shabbos);
  if (i < 0) return null;
  if (custom === 'until-shavuos') return i < 6 ? [i + 1] : null;
  // Whole rounds of six, then the last weeks share the chapters of the final round between them, two at a time.
  const n = weeks.length;
  const full = Math.floor(n / 6);
  const rest = n - full * 6;
  if (rest === 0 || i < (full - (rest < 3 ? 1 : 0)) * 6) return [(i % 6) + 1];
  // The final round: spread six chapters over the remaining weeks, doubling from the end.
  const startOfLast = (full - (rest < 3 ? 1 : 0)) * 6;
  const weeksLeft = n - startOfLast;
  const doubled = 6 - weeksLeft; // weeks that read two chapters
  const k = i - startOfLast;
  const singles = weeksLeft - doubled;
  if (k < singles) return [k + 1];
  const c = singles + (k - singles) * 2 + 1;
  return [c, c + 1];
}
