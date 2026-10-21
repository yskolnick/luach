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

import { HebrewDate } from '../calendar/hebrew-date';
import { Month } from '../calendar/months';
import { isLeapYear, monthLength, monthsOfYear } from '../calendar/year';
import { daysToCivil } from '../time/civil';
import type { HolidayEvent, HolidayFlags, HolidayOptions } from './types';

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
  // Asarah B'Teves: never pushed off; it can fall on Friday (SA OC 550:3 and commentaries).
  b.add('asarah-bteves', d(Month.TEVES, 10), { fast: 'minor' });

  // ---- Shevat ----
  b.add('tu-bshvat', d(Month.SHEVAT, 15), { minor: true });

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
  // Taanis Bechoros, 14 Nisan; when Erev Pesach is Shabbos it moves to Thursday (SA OC 470:2).
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
  {
    const rh = new HebrewDate(year + 1, Month.TISHREI, 1);
    let s = rh.addDays(-4).onOrBefore(SHABBAT);
    if (rh.daysSince(s) < 5) s = s.addDays(-7);
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
    // Yom Kippur Katan: the day before Rosh Chodesh, moved to Thursday if it falls on
    // Friday or Shabbos; not kept before Tishrei, Cheshvan, Teves or Iyar (MB 417:4; Magen Avraham 417:3;
    // the exclusions are common practice, not stated there).
    if (options.yomKippurKatan && m !== Month.CHESHVAN && m !== Month.TEVES && m !== Month.IYAR) {
      let ykk = start.prev();
      if (ykk.dayOfWeek === FRIDAY || ykk.dayOfWeek === SHABBAT) ykk = ykk.onOrBefore(THURSDAY);
      b.add('yom-kippur-katan', ykk, { fast: 'minor', optional: true }, { month: m, monthYear: year });
    }
  }
  // Shabbos Mevorchim for Tishrei of next year is not said; nothing to add.

  // ---- BeHaB: Monday, Thursday, Monday after the first Shabbos of Cheshvan and of Iyar (SA OC 492:1 with Rema; MB 492:3). ----
  if (options.behab) {
    for (const m of [Month.CHESHVAN, Month.IYAR]) {
      const shabbos = d(m, 1).onOrAfter(SHABBAT);
      const mon1 = shabbos.onOrAfter(MONDAY);
      b.add('behab', mon1, { fast: 'minor', optional: true }, { day: 1, month: m });
      b.add('behab', mon1.onOrAfter(THURSDAY), { fast: 'minor', optional: true }, { day: 2, month: m });
      b.add('behab', mon1.addDays(7), { fast: 'minor', optional: true }, { day: 3, month: m });
    }
  }

  // ---- Modern Israeli days (Knesset laws; see docs/research/2026-10-21-modern-israeli-days.md) ----
  if (options.modernIsraeli) addModernIsraeli(b);

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
  // Rules are applied from the year each was adopted (docs/research/2026-10-21-modern-israeli-days.md).
  // Yom HaShoah: 27 Nisan (from 1951). If it falls on Friday it is moved to Thursday; from
  // 1997 (Amendment No. 3), if on Sunday it is moved to Monday.
  {
    const base = b.d(Month.NISAN, 27);
    const greg = gregorianYearOf(base);
    if (greg >= 1951) {
      let day = base;
      if (base.dayOfWeek === FRIDAY) day = base.prev();
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

const cache = new Map<string, HolidayEvent[]>();

function cachedYear(year: number, options: HolidayOptions): HolidayEvent[] {
  const key = `${year}|${options.israel ? 1 : 0}${options.modernIsraeli ? 1 : 0}${options.behab ? 1 : 0}${options.yomKippurKatan ? 1 : 0}${options.shabbosMevorchim === false ? 0 : 1}`;
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
