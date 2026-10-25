/**
 * Holidays, fasts and special days for a Hebrew year.
 *
 * Dates follow the Torah and the Shulchan Aruch, as cited per event. Where a day is moved
 * (a fast that falls on Shabbos, Taanis Esther, Taanis Bechoros, the modern Israeli
 * days), the rule is stated next to the code. Israel vs the diaspora is always the
 * caller's explicit choice (`israel` option).
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { isLeapYear, monthLength, monthsOfYear } from '../calendar/year.js';
import { daysToCivil } from '../time/civil.js';
import { readingCycle } from '../parsha/parsha.js';
import type { HolidayEvent, HolidayFlags, HolidayOptions } from './types.js';

const NONE: HolidayFlags = {
  yomTov: false,
  melachaForbidden: false,
  cholHamoed: false,
  fast: null,
  roshChodesh: false,
  modernIsraeli: false,
  minor: false,
  specialShabbos: false,
  erev: false,
  isruChag: false,
  optional: false,
};

const YOM_TOV: Partial<HolidayFlags> = { yomTov: true, melachaForbidden: true };
const SHABBAT = 6;
const FRIDAY = 5;
const THURSDAY = 4;
const SUNDAY = 0;
const MONDAY = 1;

type Extra = Omit<HolidayEvent, 'id' | 'date' | 'flags'>;

class Builder {
  readonly events: HolidayEvent[] = [];
  constructor(readonly year: number) {}
  add(id: string, date: HebrewDate, flags: Partial<HolidayFlags>, extra?: Extra): void {
    this.events.push({ id, date, flags: { ...NONE, ...flags }, ...extra });
  }
  d(month: number, day: number): HebrewDate {
    return new HebrewDate(this.year, month, day);
  }
}

/**
 * The Yom Tov or Chol Hamoed event id for `date`, or null, computed directly from the date
 * (without building the year's event list). Used where a full holiday list would be circular.
 */
export function festivalOn(date: HebrewDate, israel: boolean): string | null {
  const { month: m, day: d } = date;
  if (m === Month.TISHREI) {
    if (d === 1 || d === 2) return 'rosh-hashana';
    if (d === 10) return 'yom-kippur';
    if (d === 15 || (d === 16 && !israel)) return 'sukkos';
    if (d >= 16 && d <= 20) return 'sukkos-chol-hamoed';
    if (d === 21) return 'hoshana-rabba';
    if (d === 22) return israel ? 'shemini-atzeres-simchas-torah' : 'shemini-atzeres';
    if (d === 23 && !israel) return 'simchas-torah';
  } else if (m === Month.NISAN) {
    if (d === 15 || d === 21 || (!israel && (d === 16 || d === 22))) return 'pesach';
    if (d >= 16 && d <= 20) return 'pesach-chol-hamoed';
  } else if (m === Month.SIVAN) {
    if (d === 6 || (d === 7 && !israel)) return 'shavuos';
  }
  return null;
}

/** Adar in a common year, Adar II in a leap year: the month of Purim. */
export function purimMonth(year: number): number {
  return isLeapYear(year) ? Month.ADAR_II : Month.ADAR;
}

/**
 * All events of Hebrew year `year` (1 Tishrei to 29 Elul), sorted by date.
 * Erev Rosh Hashana (29 Elul) belongs to the year in which it falls.
 */
export function holidaysForYear(year: number, options: HolidayOptions = {}): HolidayEvent[] {
  const israel = options.israel ?? false;
  const b = new Builder(year);
  const d = (m: number, day: number) => b.d(m, day);

  // ---- Tishrei ----
  b.add('rosh-hashana', d(Month.TISHREI, 1), YOM_TOV, { day: 1 });
  b.add('rosh-hashana', d(Month.TISHREI, 2), YOM_TOV, { day: 2 });
  // Tzom Gedalia, 3 Tishrei; on Shabbos it is pushed to Sunday (SA OC 549:1, 550:3).
  {
    const g = d(Month.TISHREI, 3);
    if (g.isShabbos) b.add('tzom-gedalia', g.next(), { fast: 'minor' }, { moved: true });
    else b.add('tzom-gedalia', g, { fast: 'minor' });
  }
  b.add('shabbos-shuva', d(Month.TISHREI, 3).onOrAfter(SHABBAT), { specialShabbos: true });
  b.add('erev-yom-kippur', d(Month.TISHREI, 9), { erev: true });
  b.add('yom-kippur', d(Month.TISHREI, 10), { ...YOM_TOV, fast: 'major' });
  b.add('erev-sukkos', d(Month.TISHREI, 14), { erev: true });
  b.add('sukkos', d(Month.TISHREI, 15), YOM_TOV, { day: 1 });
  if (israel) {
    for (let i = 16; i <= 20; i++) b.add('sukkos-chol-hamoed', d(Month.TISHREI, i), { cholHamoed: true }, { day: i - 14 });
  } else {
    b.add('sukkos', d(Month.TISHREI, 16), YOM_TOV, { day: 2 });
    for (let i = 17; i <= 20; i++) b.add('sukkos-chol-hamoed', d(Month.TISHREI, i), { cholHamoed: true }, { day: i - 14 });
  }
  b.add('hoshana-rabba', d(Month.TISHREI, 21), { cholHamoed: true, erev: true }, { day: 7 });
  if (israel) {
    b.add('shemini-atzeres-simchas-torah', d(Month.TISHREI, 22), YOM_TOV);
    b.add('isru-chag', d(Month.TISHREI, 23), { isruChag: true });
  } else {
    b.add('shemini-atzeres', d(Month.TISHREI, 22), YOM_TOV);
    b.add('simchas-torah', d(Month.TISHREI, 23), YOM_TOV);
    b.add('isru-chag', d(Month.TISHREI, 24), { isruChag: true });
  }
  addShabbosCholHamoed(b, Month.TISHREI, israel ? 16 : 17, 21);

  // ---- Kislev / Teves: Chanukah, 25 Kislev for eight days ----
  {
    const first = d(Month.KISLEV, 25);
    b.add('erev-chanukah', first.prev(), { minor: true, erev: true }, { candlesTonight: 1 });
    for (let i = 0; i < 8; i++) {
      b.add('chanukah', first.addDays(i), { minor: true }, { day: i + 1, candlesTonight: i < 7 ? i + 2 : 0 });
    }
  }
  // Asarah B'Teves: it can fall on Friday and is kept then (implied by the Rema, OC 550:3); that it
  // is never pushed off is the Abudraham, cited by the Beis Yosef on OC 550. It never falls on Shabbos.
  b.add('asarah-bteves', d(Month.TEVES, 10), { fast: 'minor' });

  // ---- Shevat ----
  b.add('tu-bshvat', d(Month.SHEVAT, 15), { minor: true });
  // Shabbos Shira: the Shabbos of Parshas Beshalach (the Song of the Sea, Shemos 15).
  {
    const cycle = readingCycle(year, { israel });
    const shira = cycle.find((r) => r.parsha?.includes('beshalach'));
    if (shira) b.add('shabbos-shira', shira.date, { specialShabbos: true });
    // Shovavim (optional): the weeks of Shemos through Mishpatim, and in a leap year also
    // Terumah and Tetzaveh ("Shovavim Tat"), a custom of fasting and teshuvah (see docs).
    if (options.shovavim) {
      const ids = ['shemos', 'vaera', 'bo', 'beshalach', 'yisro', 'mishpatim', ...(isLeapYear(year) ? ['terumah', 'tetzaveh'] : [])];
      let n = 0;
      for (const r of cycle) {
        if (r.parsha?.some((p) => ids.includes(p))) b.add('shovavim', r.date, { optional: true }, { day: ++n });
      }
    }
  }

  // ---- Adar ----
  const am = purimMonth(year);
  if (isLeapYear(year)) {
    b.add('purim-katan', d(Month.ADAR_I, 14), { minor: true });
    b.add('shushan-purim-katan', d(Month.ADAR_I, 15), { minor: true });
  }
  // Shabbos Shekalim: the Shabbos on or before Rosh Chodesh Adar (Adar II in a leap year). SA OC 685:1, 5.
  b.add('shabbos-shekalim', d(am, 1).onOrBefore(SHABBAT), { specialShabbos: true });
  // Shabbos Zachor: the Shabbos before Purim. SA OC 685:2, 5.
  b.add('shabbos-zachor', d(am, 14).prev().onOrBefore(SHABBAT), { specialShabbos: true });
  // Taanis Esther, 13 Adar; on Shabbos it moves back to Thursday (SA OC 686:2).
  {
    const te = d(am, 13);
    if (te.isShabbos) b.add('taanis-esther', te.addDays(-2), { fast: 'minor' }, { moved: true });
    else b.add('taanis-esther', te, { fast: 'minor' });
  }
  b.add('erev-purim', d(am, 13), { minor: true, erev: true });
  b.add('purim', d(am, 14), { minor: true });
  b.add('shushan-purim', d(am, 15), { minor: true });
  // Purim Meshulash: when 15 Adar is Shabbos, Jerusalem spreads Shushan Purim over
  // Friday–Sunday (SA OC 688:6). The event marks the Sunday, 16 Adar, the third day.
  if (d(am, 15).isShabbos) b.add('purim-meshulash', d(am, 16), { minor: true });
  // Shabbos Parah: the Shabbos before Shabbos HaChodesh. Shabbos HaChodesh: on or before 1 Nisan. SA OC 685:3–4, 6.
  const hachodesh = d(Month.NISAN, 1).onOrBefore(SHABBAT);
  b.add('shabbos-parah', hachodesh.addDays(-7), { specialShabbos: true });
  b.add('shabbos-hachodesh', hachodesh, { specialShabbos: true });

  // ---- Nisan ----
  // Shabbos HaGadol: the Shabbos before Pesach (on 14 Nisan if Erev Pesach is Shabbos). SA OC 430:1.
  b.add('shabbos-hagadol', d(Month.NISAN, 14).onOrBefore(SHABBAT), { specialShabbos: true });
  // Taanis Bechoros, 14 Nisan; when Erev Pesach is Shabbos it moves to Thursday (Rema OC 470:2;
  // the Shulchan Aruch there records a dispute).
  {
    const tb = d(Month.NISAN, 14);
    if (tb.isShabbos) b.add('taanis-bechoros', tb.addDays(-2), { fast: 'minor' }, { moved: true });
    else b.add('taanis-bechoros', tb, { fast: 'minor' });
  }
  b.add('erev-pesach', d(Month.NISAN, 14), { erev: true });
  b.add('pesach', d(Month.NISAN, 15), YOM_TOV, { day: 1 });
  if (israel) {
    for (let i = 16; i <= 20; i++) b.add('pesach-chol-hamoed', d(Month.NISAN, i), { cholHamoed: true, erev: i === 20 }, { day: i - 14 });
    b.add('pesach', d(Month.NISAN, 21), YOM_TOV, { day: 7 });
    b.add('isru-chag', d(Month.NISAN, 22), { isruChag: true });
  } else {
    b.add('pesach', d(Month.NISAN, 16), YOM_TOV, { day: 2 });
    for (let i = 17; i <= 20; i++) b.add('pesach-chol-hamoed', d(Month.NISAN, i), { cholHamoed: true, erev: i === 20 }, { day: i - 14 });
    b.add('pesach', d(Month.NISAN, 21), YOM_TOV, { day: 7 });
    b.add('pesach', d(Month.NISAN, 22), YOM_TOV, { day: 8 });
    b.add('isru-chag', d(Month.NISAN, 23), { isruChag: true });
  }
  addShabbosCholHamoed(b, Month.NISAN, israel ? 16 : 17, 20);

  // ---- Iyar ----
  b.add('pesach-sheni', d(Month.IYAR, 14), { minor: true });
  b.add('lag-baomer', d(Month.IYAR, 18), { minor: true });

  // ---- Sivan ----
  for (let i = 3; i <= 5; i++) b.add('shloshes-yemei-hagbala', d(Month.SIVAN, i), { minor: true }, { day: i - 2 });
  b.add('erev-shavuos', d(Month.SIVAN, 5), { erev: true });
  b.add('shavuos', d(Month.SIVAN, 6), YOM_TOV, { day: 1 });
  if (israel) {
    b.add('isru-chag', d(Month.SIVAN, 7), { isruChag: true });
  } else {
    b.add('shavuos', d(Month.SIVAN, 7), YOM_TOV, { day: 2 });
    b.add('isru-chag', d(Month.SIVAN, 8), { isruChag: true });
  }

  // ---- Tammuz / Av ----
  // 17 Tammuz and 9 Av: on Shabbos the fast is pushed to Sunday (SA OC 550:3; 552:10).
  {
    const t = d(Month.TAMMUZ, 17);
    if (t.isShabbos) b.add('shiva-asar-btammuz', t.next(), { fast: 'minor' }, { moved: true });
    else b.add('shiva-asar-btammuz', t, { fast: 'minor' });
    const a = d(Month.AV, 9);
    const fastDay = a.isShabbos ? a.next() : a;
    b.add('erev-tisha-bav', fastDay.prev(), { erev: true });
    b.add('tisha-bav', fastDay, { fast: 'major' }, a.isShabbos ? { moved: true } : undefined);
    // Shabbos Chazon: the Shabbos before Tisha B'Av (9 Av itself when it is Shabbos).
    b.add('shabbos-chazon', a.onOrBefore(SHABBAT), { specialShabbos: true });
    b.add('shabbos-nachamu', a.next().onOrAfter(SHABBAT), { specialShabbos: true });
  }
  b.add('tu-bav', d(Month.AV, 15), { minor: true });

  // ---- Elul ----
  b.add('rosh-hashana-labehemos', d(Month.ELUL, 1), { minor: true });
  // Leil Selichos (Ashkenaz): the Motzaei Shabbos before Rosh Hashana, or a week earlier if
  // fewer than four days of selichos would remain (Rema OC 581:1; the four-day reason is MB 581:6). Dated on the Shabbos.
  // Counted from Erev Rosh Hashana (29 Elul), so year 9999 needs no date in year 10000.
  {
    const erevRh = d(Month.ELUL, 29);
    let s = erevRh.addDays(-3).onOrBefore(SHABBAT);
    if (erevRh.daysSince(s) < 4) s = s.addDays(-7);
    b.add('leil-selichos', s, { minor: true });
  }
  b.add('erev-rosh-hashana', d(Month.ELUL, 29), { erev: true });

  // ---- Rosh Chodesh, Shabbos Mevorchim, Yom Kippur Katan ----
  for (const m of monthsOfYear(year)) {
    if (m === Month.TISHREI) continue;
    const first = d(m, 1);
    const prevLen = first.prev().monthLength;
    const start = prevLen === 30 ? first.prev() : first;
    if (prevLen === 30) b.add('rosh-chodesh', first.prev(), { roshChodesh: true }, { day: 1, month: m, monthYear: year });
    b.add('rosh-chodesh', first, { roshChodesh: true }, { day: prevLen === 30 ? 2 : 1, month: m, monthYear: year });
    if (options.shabbosMevorchim ?? true) {
      b.add('shabbos-mevorchim', start.prev().onOrBefore(SHABBAT), { specialShabbos: true }, { month: m, monthYear: year });
    }
    // Yom Kippur Katan: the day before Rosh Chodesh. On Shabbos it moves to Thursday (Magen
    // Avraham 417:3; MB 417:4). On Friday: Magen Avraham 417:3 keeps it on Friday; MB 417:4 says
    // those who say Selichos fast on Thursday and those who don't on Friday. Default Thursday
    // (`yomKippurKatanOnFriday`; MB 550:11 and Aruch HaShulchan OC 417:11 for Thursday).
    // Not before Tishrei: Erev Rosh Hashana is its own fast (SA OC 581:2), and Tishrei is
    // skipped in this loop. Not before Iyar: Erev Rosh Chodesh is in Nisan, when one does not
    // fast (MB 429:10). Not before Teves: it is in Chanukah (SA OC 670:1; some fast before
    // Chanukah instead, MA and MB 686:1, not modelled). Before Cheshvan: Luach found no source
    // for leaving it out, and Kaf HaChaim OC 417:16 says to fast; `yomKippurKatanCheshvan`.
    if (
      options.yomKippurKatan &&
      m !== Month.TEVES &&
      m !== Month.IYAR &&
      (m !== Month.CHESHVAN || options.yomKippurKatanCheshvan)
    ) {
      const erev = start.prev();
      const toThursday =
        erev.dayOfWeek === SHABBAT || (erev.dayOfWeek === FRIDAY && (options.yomKippurKatanOnFriday ?? 'thursday') === 'thursday');
      const ykk = toThursday ? erev.onOrBefore(THURSDAY) : erev;
      b.add('yom-kippur-katan', ykk, { fast: 'minor', optional: true }, toThursday ? { month: m, monthYear: year, moved: true } : { month: m, monthYear: year });
    }
  }
  // No Shabbos Mevorchim before Tishrei (MA 417:1; MB 417:1, "בכסה ליום חגנו"); Tishrei is
  // skipped above.

  // ---- BeHaB: Monday, Thursday, Monday after the first Shabbos after Rosh Chodesh Cheshvan and
  // Iyar (SA OC 492:1 with Rema; MB 492:3, "שבת הראשון שאחר ר"ח"). When the 1st is Shabbos it
  // is Rosh Chodesh itself, so the count starts from the next Shabbos. ----
  if (options.behab) {
    for (const m of [Month.CHESHVAN, Month.IYAR]) {
      const shabbos = d(m, 2).onOrAfter(SHABBAT);
      const mon1 = shabbos.onOrAfter(MONDAY);
      b.add('behab', mon1, { fast: 'minor', optional: true }, { day: 1, month: m });
      b.add('behab', mon1.onOrAfter(THURSDAY), { fast: 'minor', optional: true }, { day: 2, month: m });
      b.add('behab', mon1.addDays(7), { fast: 'minor', optional: true }, { day: 3, month: m });
    }
  }

  // ---- Modern Israeli days (Knesset laws) ----
  if (options.modernIsraeli) addModernIsraeli(b);
  if (options.israeliCommemorations) addCommemorations(b);

  return b.events.sort((x, y) => x.date.epochDays - y.date.epochDays);
}

function addShabbosCholHamoed(b: Builder, month: number, from: number, to: number): void {
  for (let i = from; i <= to; i++) {
    const day = b.d(month, i);
    if (day.isShabbos) b.add('shabbos-chol-hamoed', day, { specialShabbos: true, cholHamoed: true });
  }
}

function gregorianYearOf(date: HebrewDate): number {
  return daysToCivil(date.epochDays).year;
}

function addModernIsraeli(b: Builder): void {
  const flags: Partial<HolidayFlags> = { modernIsraeli: true, optional: true };
  // Rules are applied from the year each was adopted.
  // Yom HaShoah: 27 Nisan (Knesset resolution, 1951). From the 1959 law, if it falls on Friday
  // it is moved to Thursday; from 1997 (Amendment No. 3), if on Sunday it is moved to Monday.
  // 1954 (a Friday) fell under the resolution alone, which had no weekday rule.
  {
    const base = b.d(Month.NISAN, 27);
    const greg = gregorianYearOf(base);
    if (greg >= 1951) {
      let day = base;
      if (greg >= 1959 && base.dayOfWeek === FRIDAY) day = base.prev();
      else if (greg >= 1997 && base.dayOfWeek === SUNDAY) day = base.next();
      b.add('yom-hashoah', day, flags, day.equals(base) ? undefined : { moved: true });
    }
  }
  // Yom HaAtzmaut, 5 Iyar (from 1949); Yom HaZikaron the day before (from 1951). If 5 Iyar
  // is Friday or Shabbos, both move back to Wednesday/Thursday; from 2004, if 5 Iyar is Monday
  // they move forward to Monday/Tuesday so Yom HaZikaron does not start on Motzaei Shabbos.
  {
    const base = b.d(Month.IYAR, 5);
    const greg = gregorianYearOf(base);
    if (greg >= 1949) {
      let atz = base;
      if (base.dayOfWeek === FRIDAY || base.dayOfWeek === SHABBAT) atz = base.onOrBefore(THURSDAY);
      else if (greg >= 2004 && base.dayOfWeek === MONDAY) atz = base.next();
      const moved = atz.equals(base) ? undefined : { moved: true };
      if (greg >= 1951) b.add('yom-hazikaron', atz.prev(), flags, moved);
      b.add('yom-haatzmaut', atz, flags, moved);
    }
  }
  // Yom Yerushalayim, 28 Iyar (from 1968).
  {
    const day = b.d(Month.IYAR, 28);
    if (gregorianYearOf(day) >= 1968) b.add('yom-yerushalayim', day, flags);
  }
}

/**
 * Israeli commemorations set by Hebrew date, with each law's moving rule. Days whose date is left to a
 * minister's discretion (Hebrew Language Day, Liberation Day) are not listed.
 */
const COMMEMORATIONS: {
  id: string;
  month: number | 'adar';
  day: number;
  from: number;
  /** Moving rule by weekday: returns the shift in days. */
  move: (dow: number) => number;
  official: boolean;
}[] = [
  // Shabbos → the Thursday before (Sigd law, 2008).
  { id: 'sigd', month: Month.CHESHVAN, day: 29, from: 5769, move: (w) => (w === SHABBAT ? -2 : 0), official: true },
  // Friday → the Wednesday before (Aliyah Day law, 2016).
  { id: 'yom-haaliyah', month: Month.CHESHVAN, day: 7, from: 5777, move: (w) => (w === FRIDAY ? -2 : 0), official: true },
  // Shabbos → Sunday (Herzl law, 2004). 10 Iyar is Shabbos when Pesach begins on Tuesday (5784).
  { id: 'yom-herzl', month: Month.IYAR, day: 10, from: 5765, move: (w) => (w === SHABBAT ? 1 : 0), official: true },
  // Friday or Shabbos → the next Sunday (Ben-Gurion law, 1976).
  { id: 'yom-ben-gurion', month: Month.KISLEV, day: 6, from: 5737, move: (w) => (w === FRIDAY ? 2 : w === SHABBAT ? 1 : 0), official: true },
  // Shabbos → Sunday (Jabotinsky law, 2005).
  { id: 'yom-jabotinsky', month: Month.TAMMUZ, day: 29, from: 5765, move: (w) => (w === SHABBAT ? 1 : 0), official: true },
  // Friday or Shabbos → the Thursday before (Rabin Memorial Day law, 1997).
  { id: 'yom-rabin', month: Month.CHESHVAN, day: 12, from: 5758, move: (w) => (w === FRIDAY ? -1 : w === SHABBAT ? -2 : 0), official: true },
  // Friday → Thursday (Zeevi law, 2005).
  { id: 'yom-zeevi', month: Month.TISHREI, day: 30, from: 5766, move: (w) => (w === FRIDAY ? -1 : 0), official: true },
  // Friday or Shabbos (a rest day, or the day before one) → the first weekday after (Begin law, 1998, as amended).
  { id: 'yom-begin', month: 'adar', day: 4, from: 5758, move: (w) => (w === FRIDAY ? 2 : w === SHABBAT ? 1 : 0), official: true },
  // Shabbos → Sunday (Rav Ovadia Yosef law, 2025).
  { id: 'yom-ovadia-yosef', month: Month.CHESHVAN, day: 3, from: 5786, move: (w) => (w === SHABBAT ? 1 : 0), official: true },
  // Shabbos → the first weekday after (Golda Meir law, 2026).
  { id: 'yom-golda-meir', month: Month.KISLEV, day: 8, from: 5787, move: (w) => (w === SHABBAT ? 1 : 0), official: true },
  // Friday or Shabbos (or the day before a rest day) → Sunday of the following week (law, 2025).
  { id: 'yom-aliyat-yehudei-teiman', month: Month.KISLEV, day: 15, from: 5786, move: (w) => (w === FRIDAY ? 2 : w === SHABBAT ? 1 : 0), official: true },
  // Shabbos (or the day before a rest day) → the first weekday after (7 October law, 2026; observed from 2024).
  { id: 'yom-zikaron-7-oktober', month: Month.TISHREI, day: 24, from: 5785, move: (w) => (w === SHABBAT ? 1 : w === FRIDAY ? 2 : 0), official: true },
  // Ethiopian Jews who died on the way to Israel: with Yom Yerushalayim, 28 Iyar.
  { id: 'yom-zikaron-yehudei-etiopia', month: Month.IYAR, day: 28, from: 5763, move: () => 0, official: true },
  // The fallen whose burial place is unknown: 7 Adar (Adar II in a leap year); set by the Military Rabbinate.
  { id: 'yom-zikaron-nifalim-lo-noda-kvuram', month: 'adar', day: 7, from: 5710, move: () => 0, official: true },
  // Family Day, 30 Shevat (Ministry of Education).
  { id: 'yom-hamishpacha', month: Month.SHEVAT, day: 30, from: 5734, move: () => 0, official: true },
  // Chag HaBanot: a North African custom on 1 Teves, not an official day.
  { id: 'chag-habanot', month: Month.TEVES, day: 1, from: 1, move: () => 0, official: false },
];

function addCommemorations(b: Builder): void {
  for (const c of COMMEMORATIONS) {
    if (b.year < c.from) continue;
    const month = c.month === 'adar' ? purimMonth(b.year) : c.month;
    if (c.day > monthLength(b.year, month)) continue;
    const base = b.d(month, c.day);
    const shift = c.move(base.dayOfWeek);
    const day = base.addDays(shift);
    b.add(c.id, day, c.official ? { modernIsraeli: true, optional: true } : { minor: true, optional: true }, shift ? { moved: true } : undefined);
  }
}

const cache = new Map<string, HolidayEvent[]>();

function cachedYear(year: number, options: HolidayOptions): HolidayEvent[] {
  const key = `${year}|${options.israel ? 1 : 0}${options.modernIsraeli ? 1 : 0}${options.behab ? 1 : 0}${options.yomKippurKatan ? 1 : 0}${options.yomKippurKatanOnFriday === 'friday' ? 1 : 0}${options.yomKippurKatanCheshvan ? 1 : 0}${options.shabbosMevorchim === false ? 0 : 1}${options.shovavim ? 1 : 0}${options.israeliCommemorations ? 1 : 0}`;
  let v = cache.get(key);
  if (!v) {
    v = holidaysForYear(year, options);
    if (cache.size > 64) cache.clear();
    cache.set(key, v);
  }
  return v;
}

/** The events on one day. */
export function holidaysOn(date: HebrewDate, options: HolidayOptions = {}): HolidayEvent[] {
  return cachedYear(date.year, options).filter((e) => e.date.epochDays === date.epochDays);
}

/** The events from `start` to `end`, inclusive. */
export function holidaysBetween(start: HebrewDate, end: HebrewDate, options: HolidayOptions = {}): HolidayEvent[] {
  const out: HolidayEvent[] = [];
  for (let y = start.year; y <= end.year; y++) {
    for (const e of cachedYear(y, options)) {
      if (e.date.epochDays >= start.epochDays && e.date.epochDays <= end.epochDays) out.push(e);
    }
  }
  return out;
}

/** The next event with `id` on or after `from`, or `null` if none within 2 years. */
export function nextHoliday(id: string, from: HebrewDate, options: HolidayOptions = {}): HolidayEvent | null {
  for (let y = from.year; y <= Math.min(from.year + 2, 9999); y++) {
    for (const e of cachedYear(y, options)) if (e.id === id && e.date.epochDays >= from.epochDays) return e;
  }
  return null;
}

/** True if melacha is forbidden on `date` because of Shabbos or Yom Tov (whole-day view; see zmanim for times). */
export function isMelachaForbidden(date: HebrewDate, options: HolidayOptions = {}): boolean {
  return date.isShabbos || holidaysOn(date, options).some((e) => e.flags.melachaForbidden);
}

/** The fast on `date`, if any (respecting `options` for optional fasts). */
export function fastOn(date: HebrewDate, options: HolidayOptions = {}): HolidayEvent | null {
  return holidaysOn(date, options).find((e) => e.flags.fast !== null) ?? null;
}

/** Rosh Chodesh day 1 or 2 info for `date`, or null. */
export function roshChodeshOn(date: HebrewDate): { month: number; day: number } | null {
  const len = monthLength(date.year, date.month);
  if (date.day === 1 && date.month !== Month.TISHREI) {
    return { month: date.month, day: date.prev().monthLength === 30 ? 2 : 1 };
  }
  if (date.day === 30 && len === 30) {
    const next = date.next();
    return { month: next.month, day: 1 };
  }
  return null;
}
