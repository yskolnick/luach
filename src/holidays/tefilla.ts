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
import { holidaysOnUnchecked as holidaysOn, purimMonth } from './holidays.js';
import type { HolidayOptions } from './types.js';
import { hebrewDateArg } from '../calendar/date-input.js';
import { checkOptions, DAY_ENUMS, tefillaKeys } from '../util/options.js';

/** Options for {@link tefillaOn}. */
export interface TefillaOptions extends HolidayOptions {
  /**
   * End of the no-Tachanun period after Sukkos. `'isruChag'`: through Isru Chag (SA OC 131:7,
   * "between Yom Kippur and Sukkos"; Kitzur SA 22:8 adds Isru Chag). Sha'arei Teshuvah 131:19
   * says of the longer custom "במדינות אלו אין המנהג כן", and Aruch HaShulchan OC 131:12
   * "ואינו עיקר". `'endOfTishrei'`: through Rosh Chodesh Cheshvan (Knesses HaGedolah,
   * cited in Sha'arei Teshuvah 131:19 and Kaf HaChaim OC 131:98, the Sephardi custom and the
   * custom in Israel there). Default, matching the customs: `'endOfTishrei'` in
   * Israel, `'isruChag'` outside it. Sephardim outside Israel pass `'endOfTishrei'`.
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
  /**
   * A community's custom for Tachanun. `'chabad'` (Chabad-Lubavitch) follows only what Luach has read
   * in a sefer: Sefer HaMinhagim (its section on Tachanun, and the months) and Hayom Yom, as in
   * docs/halacha/choices.md:
   * - no Tachanun on 10, 19 and 20 Kislev, 12 and 13 Tammuz and 7 Adar, nor at the Mincha before
   *   them (see {@link tachanunOmittedAtMincha}). In a leap year the text says "Adar" and Luach
   *   reads Adar II: an open question;
   * - from erev Yom Kippur to the end of Tishrei, outside Israel too (Hayom Yom, 9 Tishrei, "עד סוף
   *   תשרי"; Sefer HaMinhagim), so Tachanun is said again on 2 Cheshvan. An explicit `tishreiTachanun` wins;
   * - the rest (the whole of Nisan, Pesach Sheni, Lag BaOmer, 1–12 Sivan) is the general default.
   * Not part of this custom, as no sefer was read for them: Yom HaAtzmaut and Chai Elul stay as the
   * general custom has them. Default: none.
   */
  minhag?: 'chabad';
  /**
   * Mizmor L'Sodah on Erev Pesach, Chol Hamoed Pesach and Erev Yom Kippur. `'rema'` (default):
   * not said (Rema OC 51:9). `'sephardi'`: said (Kaf HaChaim OC 51:51–52, citing the Knesses
   * HaGedolah and the Pri Chadash: "מנהגינו לאומרו"). Never on Shabbos or Yom Tov (Rema there;
   * Kaf HaChaim OC 51:50).
   */
  mizmorLesodah?: 'rema' | 'sephardi';
  /**
   * More days without Tachanun, by month and day (`Month` numbering), for a community's own
   * days; for Chassidim, the yahrzeit of the tzaddik
   * they follow (Peninei Halakha, Tefillah 21:8). Default none.
   */
  noTachanunDays?: readonly { readonly month: number; readonly day: number }[];
}

/**
 * The days on which the Chabad custom omits Tachanun, for the day itself and from the Mincha before:
 * Sefer HaMinhagim, "Tachanun is likewise omitted on ... the Tenth of Kislev and the preceding
 * Minchah; the 19th and 20th of Kislev and the preceding Minchah; and the 12th and 13th of Tammuz
 * and the preceding Minchah", and, in the month of Adar, 7 Adar and the preceding Minchah. Adar is
 * `Month.ADAR` here, resolved to Adar II in a leap year.
 */
const CHABAD_NO_TACHANUN: ReadonlyArray<readonly [number, number]> = [
  [Month.KISLEV, 10], [Month.KISLEV, 19], [Month.KISLEV, 20], [Month.TAMMUZ, 12], [Month.TAMMUZ, 13], [Month.ADAR, 7],
];

function chabadNoTachanun(date: HebrewDate): boolean {
  const adar = purimMonth(date.year);
  return CHABAD_NO_TACHANUN.some(([cm, cd]) => (cm === Month.ADAR ? adar : cm) === date.month && cd === date.day);
}

/** The changes to the day's Shacharis. */
export interface TefillaDay {
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

/** The changes to Shacharis on `date`. Defaults are documented on {@link TefillaOptions}. */
export function tefillaOn(date: HebrewDate, options: TefillaOptions = {}): TefillaDay {
  checkOptions('tefillaOn', options, tefillaKeys(), DAY_ENUMS);
  date = hebrewDateArg(date, 'tefillaOn');
  const israel = options.israel ?? false;
  const events = holidaysOn(date, { ...options, modernIsraeli: true });
  const has = (id: string) => events.some((e) => e.id === id);
  const any = (pred: (e: (typeof events)[number]) => boolean) => events.some(pred);
  const m = date.month;
  const d = date.day;
  const am = purimMonth(date.year);
  const chabad = options.minhag === 'chabad';

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
    const lastNoTachanun = (options.tishreiTachanun ?? (chabad || israel ? 'endOfTishrei' : 'isruChag')) === 'endOfTishrei' ? 30 : israel ? 23 : 24;
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
  if (options.noTachanunDays?.some((x) => x.month === m && x.day === d)) tachanun = false;
  if (options.modernDaysNoTachanun && (has('yom-haatzmaut') || has('yom-yerushalayim'))) tachanun = false;
  if (chabad && chabadNoTachanun(date)) tachanun = false;

  // ---- Mizmor L'Sodah: not on Shabbos/Yom Tov, Erev Pesach, Chol Hamoed Pesach, Erev Yom Kippur (Rema OC 51:9). ----
  let mizmorLesodah = !date.isShabbos && !yomTov;
  // Erev Pesach through the last day of Pesach; 22 Nisan in the diaspora is Yom Tov (above), in Israel Isru Chag.
  if ((options.mizmorLesodah ?? 'rema') === 'rema') {
    if (m === Month.NISAN && d >= 14 && d <= 21) mizmorLesodah = false;
    if (m === Month.TISHREI && d === 9) mizmorLesodah = false;
  }

  return {
    tachanun,
    hallel,
    // Every Yom Tov including Yom Kippur ("ביום הכפרים הזה" in its Amidah), Rosh Chodesh, Chol Hamoed.
    yaalehVyavo: roshChodesh || yomTov || cholHamoed,
    alHanissim: chanukah || purim,
    mizmorLesodah,
  };
}

/**
 * Tachanun is omitted at Mincha of `date` only because the next day is one that the custom in
 * `options.minhag` omits "from the Mincha before": with `minhag: 'chabad'`, Mincha of 9, 18 and 19
 * Kislev, of 11 and 12 Tammuz and of 6 Adar (and of 10, 19 and 20 Kislev, 12 and 13 Tammuz and 7 Adar
 * themselves, where {@link tefillaOn} already omits it). Without a `minhag` it is always `false`.
 * `false` does not mean Tachanun is said at that Mincha: the other reasons for omitting it at Mincha
 * (Erev Yom Tov, Shabbos…) are not modelled here; read `tefillaOn(date).tachanun` for those.
 */
export function tachanunOmittedAtMincha(date: HebrewDate, options: TefillaOptions = {}): boolean {
  checkOptions('tachanunOmittedAtMincha', options, tefillaKeys(), DAY_ENUMS);
  date = hebrewDateArg(date, 'tachanunOmittedAtMincha');
  if (options.minhag !== 'chabad') return false;
  return chabadNoTachanun(date) || chabadNoTachanun(date.next());
}
