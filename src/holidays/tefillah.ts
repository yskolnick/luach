/**
 * What changes in the day's tefillos: Tachanun, Hallel, Yaaleh V'Yavo, Al HaNissim,
 * Mizmor L'Sodah.
 *
 * Customs differ widely, above all for Tachanun. The defaults follow common Ashkenazi
 * practice as summarised in the Mishna Berura (OC 131) and are *defaults*, not rulings;
 * each custom that commonly differs is an option. Ask your rav.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date';
import { Month } from '../calendar/months';
import { holidaysOn, purimMonth } from './holidays';
import type { HolidayOptions } from './types';

/** Options for {@link tefillahOn}. */
export interface TefillahOptions extends HolidayOptions {
  /** Walled city (Jerusalem): Purim on 15 Adar. Default `false`. */
  walledCity?: boolean;
  /**
   * End of the no-Tachanun period after Sukkos: `'isruChag'` (Isru Chag, the day after
   * the festival) or `'endOfTishrei'` (through Rosh Chodesh Cheshvan, a widespread
   * Ashkenazi custom). Default `'endOfTishrei'`.
   */
  tishreiTachanun?: 'isruChag' | 'endOfTishrei';
  /**
   * End of the no-Tachanun period after Shavuos: `'12Sivan'` (through 12 Sivan, the days of
   * tashlumin; common Ashkenazi custom) or `'isruChag'`. Default `'12Sivan'`.
   */
  sivanTachanun?: '12Sivan' | 'isruChag';
  /** Omit Tachanun on Yom HaAtzmaut and Yom Yerushalayim (a custom in Israel and elsewhere). Default `false`. */
  modernDaysNoTachanun?: boolean;
}

/** The changes to the day's Shacharis. */
export interface TefillahDay {
  /** Tachanun is said at Shacharis. */
  readonly tachanun: boolean;
  /** Hallel: `'full'`, `'half'` (with skipped passages) or `null`. */
  readonly hallel: 'full' | 'half' | null;
  /** Yaaleh V'Yavo is added (Rosh Chodesh, Yom Tov, Chol Hamoed). */
  readonly yaalehVyavo: boolean;
  /** Al HaNissim is added (Chanukah, Purim). */
  readonly alHanissim: boolean;
  /** Mizmor L'Sodah (Tehillim 100) is said. */
  readonly mizmorLesodah: boolean;
}

/** The changes to Shacharis on `date`. Defaults are documented on {@link TefillahOptions}. */
export function tefillahOn(date: HebrewDate, options: TefillahOptions = {}): TefillahDay {
  const israel = options.israel ?? false;
  const events = holidaysOn(date, { ...options, modernIsraeli: true });
  const has = (id: string) => events.some((e) => e.id === id);
  const any = (pred: (e: (typeof events)[number]) => boolean) => events.some(pred);
  const m = date.month;
  const d = date.day;
  const am = purimMonth(date.year);

  const yomTov = any((e) => e.flags.yomTov);
  const cholHamoed = any((e) => e.flags.cholHamoed);
  const roshChodesh = any((e) => e.flags.roshChodesh);
  const chanukah = has('chanukah');
  const purimDay = options.walledCity ? 15 : 14;
  const purim = m === am && d === purimDay;

  // ---- Hallel (Arachin 10a; SA OC 422:2, 488:1, 490:4, 683:1) ----
  let hallel: 'full' | 'half' | null = null;
  const sukkosOrSheminiAtzeres = m === Month.TISHREI && d >= 15 && d <= (israel ? 22 : 23);
  const pesachFull = m === Month.NISAN && (d === 15 || (!israel && d === 16));
  const shavuos = m === Month.SIVAN && (d === 6 || (!israel && d === 7));
  if (sukkosOrSheminiAtzeres || pesachFull || shavuos || chanukah) hallel = 'full';
  else if (m === Month.NISAN && d >= 16 && d <= (israel ? 21 : 22)) hallel = 'half';
  else if (roshChodesh) hallel = 'half';

  // ---- Tachanun (MB 131; SA OC 131:4–7) ----
  let tachanun = !date.isShabbos && !yomTov && !cholHamoed && !roshChodesh && !chanukah;
  if (m === Month.NISAN) tachanun = false; // the whole of Nisan (SA OC 429:2)
  if (m === Month.TISHREI && d >= 9) {
    // Erev Yom Kippur onwards; through Isru Chag or the end of the month.
    const lastNoTachanun = (options.tishreiTachanun ?? 'endOfTishrei') === 'endOfTishrei' ? 30 : israel ? 23 : 24;
    if (d <= lastNoTachanun) tachanun = false;
  }
  if (m === Month.TISHREI && d === 1) tachanun = false;
  if (m === Month.ELUL && d === 29) tachanun = false; // Erev Rosh Hashana (Rema OC 581:3)
  if (m === Month.SIVAN) {
    const last = (options.sivanTachanun ?? '12Sivan') === '12Sivan' ? 12 : israel ? 7 : 8;
    if (d >= 1 && d <= last) tachanun = false;
  }
  if (m === Month.IYAR && (d === 14 || d === 18)) tachanun = false; // Pesach Sheni, Lag BaOmer
  if (m === Month.AV && (d === 9 || d === 15) ) tachanun = false; // Tisha B'Av (moed), Tu B'Av
  if (has('tisha-bav')) tachanun = false;
  if (m === Month.SHEVAT && d === 15) tachanun = false; // Tu B'Shvat
  if ((m === am && (d === 14 || d === 15)) || has('purim-katan') || has('shushan-purim-katan')) tachanun = false;
  if (options.modernDaysNoTachanun && (has('yom-haatzmaut') || has('yom-yerushalayim'))) tachanun = false;

  // ---- Mizmor L'Sodah: not on Shabbos/Yom Tov, Erev Pesach, Chol Hamoed Pesach, Erev Yom Kippur (Rema OC 51:9). ----
  let mizmorLesodah = !date.isShabbos && !yomTov;
  if (m === Month.NISAN && d >= 14 && d <= 22) mizmorLesodah = false;
  if (m === Month.TISHREI && d === 9) mizmorLesodah = false;

  return {
    tachanun,
    hallel,
    yaalehVyavo: roshChodesh || (yomTov && !(m === Month.TISHREI && d === 10)) || cholHamoed,
    alHanissim: chanukah || purim,
    mizmorLesodah,
  };
}

/** Whether `date` is in the Three Weeks, the Nine Days, or the Sefirah mourning period. */
export function mourningPeriods(date: HebrewDate): { threeWeeks: boolean; nineDays: boolean; omer: boolean } {
  const y = date.year;
  const e = date.epochDays;
  const t17 = new HebrewDate(y, Month.TAMMUZ, 17).epochDays;
  const av9 = new HebrewDate(y, Month.AV, 9);
  const av10 = (av9.isShabbos ? av9.next() : av9).epochDays;
  const rcAv = new HebrewDate(y, Month.AV, 1).epochDays;
  const omerStart = new HebrewDate(y, Month.NISAN, 16).epochDays;
  const omerEnd = new HebrewDate(y, Month.SIVAN, 5).epochDays;
  return {
    threeWeeks: e >= t17 && e <= av10,
    nineDays: e >= rcAv && e <= av10,
    omer: e >= omerStart && e <= omerEnd,
  };
}
