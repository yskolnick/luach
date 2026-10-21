/**
 * What changes in the day's tefillos: Tachanun, Hallel, Yaaleh V'Yavo, Al HaNissim,
 * Mizmor L'Sodah.
 *
 * Customs differ widely, above all for Tachanun. The defaults follow common Ashkenazi
 * practice (SA OC 131:6–7 with Rema; Mishna Berura there) and are *defaults*, not rulings;
 * each custom that commonly differs is an option. Ask your rav.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { holidaysOn, purimMonth } from './holidays.js';
import type { HolidayOptions } from './types.js';

/** Options for {@link tefillahOn}. */
export interface TefillahOptions extends HolidayOptions {
  /** Walled city (Jerusalem): Purim on 15 Adar. Default `false`. */
  walledCity?: boolean;
  /**
   * End of the no-Tachanun period after Sukkos. `'isruChag'`: through Isru Chag (SA OC 131:7,
   * "between Yom Kippur and Sukkos"; Kitzur SA 22:8 adds Isru Chag). Sha'arei Teshuvah 131:19
   * says of the longer custom "במדינות אלו אין המנהג כן", and Aruch HaShulchan OC 131:12
   * "ואינו עיקר". `'endOfTishrei'`: through Rosh Chodesh Cheshvan (Knesses HaGedolah,
   * cited in Sha'arei Teshuvah 131:19 and Kaf HaChaim OC 131:98, the Sephardi custom and the
   * custom in Israel there). Default `'endOfTishrei'` (as built; see DECISIONS.md).
   */
  tishreiTachanun?: 'isruChag' | 'endOfTishrei';
  /**
   * End of the no-Tachanun period after Shavuos: `'12Sivan'` (through 12 Sivan, the days of
   * tashlumin; common Ashkenazi custom) or `'isruChag'`. Default `'12Sivan'`.
   */
  sivanTachanun?: '12Sivan' | 'isruChag';
  /**
   * Pesach Sheni (14 Iyar). `'omit'`: no Tachanun (Knesses HaGedolah, cited in Kaf HaChaim
   * OC 131:98; Sha'arei Teshuvah 131:19; Aruch HaShulchan OC 131:12, "the custom of the
   * Sephardim", noting that the Shulchan Aruch does not list it). `'say'`: as the Shulchan
   * Aruch's list (SA OC 131:6–7). Default `'omit'`.
   */
  pesachSheniTachanun?: 'omit' | 'say';
  /**
   * Omit Tachanun on Yom HaAtzmaut and Yom Yerushalayim (Peninei Halakha, Tefillah 21:7; a
   * modern custom with no classic source). Default `false`.
   */
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

  // ---- Hallel (Arachin 10a; SA OC 422:2, 488:1, 490:4, 494:1, 644:1, 683:1) ----
  let hallel: 'full' | 'half' | null = null;
  const sukkosOrSheminiAtzeres = m === Month.TISHREI && d >= 15 && d <= (israel ? 22 : 23);
  const pesachFull = m === Month.NISAN && (d === 15 || (!israel && d === 16));
  const shavuos = m === Month.SIVAN && (d === 6 || (!israel && d === 7));
  if (sukkosOrSheminiAtzeres || pesachFull || shavuos || chanukah) hallel = 'full';
  else if (m === Month.NISAN && d >= 16 && d <= (israel ? 21 : 22)) hallel = 'half';
  else if (roshChodesh) hallel = 'half';

  // ---- Tachanun (SA OC 131:6–7 with Rema; Rema 494:3 and MB 131:36 for Sivan; SA OC 697:1 for Purim Katan) ----
  let tachanun = !date.isShabbos && !yomTov && !cholHamoed && !roshChodesh && !chanukah;
  if (m === Month.NISAN) tachanun = false; // the whole of Nisan (SA OC 429:2)
  if (m === Month.TISHREI && d >= 9) {
    // Erev Yom Kippur onwards; through Isru Chag or the end of the month.
    const lastNoTachanun = (options.tishreiTachanun ?? 'endOfTishrei') === 'endOfTishrei' ? 30 : israel ? 23 : 24;
    if (d <= lastNoTachanun) tachanun = false;
  }
  if (m === Month.TISHREI && d === 1) tachanun = false;
  if (m === Month.ELUL && d === 29) tachanun = false; // Erev Rosh Hashana (SA OC 581:3; Rema 131:6)
  if (m === Month.SIVAN) {
    const last = (options.sivanTachanun ?? '12Sivan') === '12Sivan' ? 12 : israel ? 7 : 8;
    if (d >= 1 && d <= last) tachanun = false;
  }
  if (m === Month.IYAR && d === 14 && (options.pesachSheniTachanun ?? 'omit') === 'omit') tachanun = false; // Pesach Sheni
  if (m === Month.IYAR && d === 18) tachanun = false; // Lag BaOmer (Rema OC 131:6, 493:2)
  if (m === Month.AV && (d === 9 || d === 15) ) tachanun = false; // Tisha B'Av (moed), Tu B'Av
  if (has('tisha-bav')) tachanun = false;
  if (m === Month.SHEVAT && d === 15) tachanun = false; // Tu B'Shvat
  if ((m === am && (d === 14 || d === 15)) || has('purim-katan') || has('shushan-purim-katan')) tachanun = false;
  if (options.modernDaysNoTachanun && (has('yom-haatzmaut') || has('yom-yerushalayim'))) tachanun = false;

  // ---- Mizmor L'Sodah: not on Shabbos/Yom Tov, Erev Pesach, Chol Hamoed Pesach, Erev Yom Kippur (Rema OC 51:9). ----
  let mizmorLesodah = !date.isShabbos && !yomTov;
  // Erev Pesach through the last day of Pesach; 22 Nisan in the diaspora is Yom Tov (above), in Israel Isru Chag.
  if (m === Month.NISAN && d >= 14 && d <= 21) mizmorLesodah = false;
  if (m === Month.TISHREI && d === 9) mizmorLesodah = false;

  return {
    tachanun,
    hallel,
    // Every Yom Tov including Yom Kippur ("ביום הכפרים הזה" in its Amidah), Rosh Chodesh, Chol Hamoed.
    yaalehVyavo: roshChodesh || yomTov || cholHamoed,
    alHanissim: chanukah || purim,
    mizmorLesodah,
  };
}
