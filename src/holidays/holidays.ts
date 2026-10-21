/**
 * Holidays, fasts, Rosh Chodesh and special Shabbosos for Israel and the diaspora.
 *
 * Every event carries flags for filtering. Customs that not everyone keeps (BeHaB, Yom Kippur Katan,
 * Shovavim) and the modern Israeli days are off by default and must be asked for.
 *
 * Sources: Shulchan Aruch OC 417 (Rosh Chodesh), 428–430, 470:2 (Taanis Bechoros), 492:1 and Mishna Berura 492:3
 * (BeHaB), 549–550 (the four fasts; 550:3 postponement), 670 (Chanukah), 685 (the four parshiyos),
 * 686:2 (Taanis Esther), 688 (Purim in walled cities); Magen Avraham 417 (Yom Kippur Katan).
 *
 * @packageDocumentation
 */

import { type DayNumber, dayOfWeek } from '../calendar/gregorian.js';
import {
  ADAR, ADAR_I, ADAR_II, AV, CHESHVAN, ELUL, IYAR, KISLEV, NISAN, SHVAT, SIVAN, TAMMUZ, TEVES, TISHREI,
  type HebrewDate, dayNumberToHebrew, daysInMonth, hebrewToDayNumber, isLeapYear, monthsInOrder, roshHashana,
} from '../calendar/hebrew.js';
import { type Location, parshaOn } from '../parsha/parsha.js';
import { type NameStyle, type NameTable, monthName, nameOf } from '../format/names.js';
import { gematriya } from '../format/gematriya.js';

/** What kind of day this is. Each event has exactly one category; use the flags for finer filtering. */
export type HolidayCategory =
  | 'yom-tov'
  | 'chol-hamoed'
  | 'fast'
  | 'rosh-chodesh'
  | 'rabbinic'
  | 'minor'
  | 'special-shabbos'
  | 'shabbos-mevorchim'
  | 'erev'
  | 'isru-chag'
  | 'modern-israeli'
  | 'custom';

/** A holiday or special day. */
export interface Holiday {
  /** Stable id, e.g. `"pesach-1"`, `"tzom-gedalia"`, `"rosh-chodesh"`. */
  readonly id: string;
  readonly dayNumber: DayNumber;
  readonly date: HebrewDate;
  readonly category: HolidayCategory;
  /** Melacha (creative work) is forbidden: Yom Tov or Yom Kippur. */
  readonly yomTov: boolean;
  readonly cholHamoed: boolean;
  /** `'major'` (sunset to nightfall: Yom Kippur, Tisha B'Av), `'minor'` (dawn to nightfall), or null. */
  readonly fast: 'major' | 'minor' | null;
  readonly roshChodesh: boolean;
  readonly modernIsraeli: boolean;
  /** A minor holiday (no special prohibitions): Tu B'Shvat, Lag BaOmer, Pesach Sheni, Tu B'Av, Purim Katan… */
  readonly minor: boolean;
  readonly specialShabbos: boolean;
  readonly erev: boolean;
  readonly isruChag: boolean;
  /** A custom not universally kept; only returned when asked for. */
  readonly optional: boolean;
  /** True if the fast or day was moved from its calendar date (e.g. nidcheh). */
  readonly postponed: boolean;
  /** For days of a multi-day festival or count: 1-based day number (Chanukah day 3, Chol Hamoed day 2…). */
  readonly day?: number;
  /** Chanukah: candles lit on the evening of this civil date (the evening that begins the next Hebrew day). */
  readonly candlesTonight?: number;
  /** For Rosh Chodesh and Shabbos Mevorchim: the month being started or blessed. */
  readonly month?: number;
  /** For Rosh Chodesh and Shabbos Mevorchim: the Hebrew year of that month. */
  readonly monthYear?: number;
}

export interface HolidayOptions {
  /** Required: Israel and the diaspora keep different days. */
  readonly location: Location;
  /** Modern Israeli days (Yom HaShoah, Yom HaZikaron, Yom HaAtzmaut, Yom Yerushalayim, Yom HaAliyah, Sigd). Default false. */
  readonly modernIsraeli?: boolean;
  /** BeHaB fasts after Sukkos and Pesach (Ashkenazi custom). Default false. */
  readonly behab?: boolean;
  /** Yom Kippur Katan on Erev Rosh Chodesh. Default false. */
  readonly yomKippurKatan?: boolean;
  /**
   * When Erev Rosh Chodesh is Friday: `'friday'` (Magen Avraham 417; those who don't say Selichos) or `'thursday'`
   * (those who say Selichos, per the yeshiva.org.il encyclopedia entry "יום כיפור קטן" (secondary source)). Default `'friday'`.
   */
  readonly yomKippurKatanOnFriday?: 'friday' | 'thursday';
  /** Shovavim (and Shovavim Tat in leap years) weeks, marked on their Shabbosos. Default false. */
  readonly shovavim?: boolean;
  /** Leil Selichos (Ashkenazi custom). Default false. */
  readonly leilSelichos?: boolean;
}

type Flags = Partial<Omit<Holiday, 'id' | 'dayNumber' | 'date' | 'category'>>;

function make(id: string, dayNumber: DayNumber, category: HolidayCategory, flags: Flags = {}): Holiday {
  return {
    id,
    dayNumber,
    date: dayNumberToHebrew(dayNumber),
    category,
    yomTov: false,
    cholHamoed: false,
    fast: null,
    roshChodesh: false,
    modernIsraeli: false,
    minor: false,
    specialShabbos: false,
    erev: false,
    isruChag: false,
    optional: false,
    postponed: false,
    ...flags,
  };
}

const SHABBOS = 6;

/** Last Shabbos on or before `n`. */
function shabbosOnOrBefore(n: DayNumber): DayNumber {
  return n - ((dayOfWeek(n) - SHABBOS + 7) % 7);
}

/** First Shabbos on or after `n`. */
function shabbosOnOrAfter(n: DayNumber): DayNumber {
  return n + ((SHABBOS - dayOfWeek(n) + 7) % 7);
}

/** The month of Purim: Adar, or Adar II in a leap year. */
export function purimMonth(year: number): number {
  return isLeapYear(year) ? ADAR_II : ADAR;
}

/** First day(s) of Rosh Chodesh for `month` of `year`: one or two day numbers. Tishrei has none (it is Rosh Hashana). */
export function roshChodeshDays(year: number, month: number): DayNumber[] {
  if (month === TISHREI) return [];
  const first = hebrewToDayNumber(year, month, 1);
  const order = monthsInOrder(year);
  const prev = order[order.indexOf(month) - 1];
  /* c8 ignore next */
  if (prev === undefined) return [first];
  return daysInMonth(year, prev) === 30 ? [first - 1, first] : [first];
}

/**
 * Everything in Hebrew year `year` (1 Tishrei to 29 Elul), sorted by date.
 */
export function holidaysInYear(year: number, options: HolidayOptions): Holiday[] {
  const israel = options.location === 'israel';
  const d = (month: number, day: number): DayNumber => hebrewToDayNumber(year, month, day);
  const out: Holiday[] = [];
  const add = (h: Holiday): void => {
    out.push(h);
  };
  const yt = (id: string, n: DayNumber, flags: Flags = {}): void => add(make(id, n, 'yom-tov', { yomTov: true, ...flags }));
  const erev = (id: string, n: DayNumber): void => add(make(id, n, 'erev', { erev: true }));

  // ---- Tishrei
  yt('rosh-hashana-1', d(TISHREI, 1));
  yt('rosh-hashana-2', d(TISHREI, 2));
  const gedalia = d(TISHREI, 3);
  const gedaliaPostponed = dayOfWeek(gedalia) === SHABBOS;
  add(make('tzom-gedalia', gedaliaPostponed ? gedalia + 1 : gedalia, 'fast', { fast: 'minor', postponed: gedaliaPostponed }));
  add(make('shabbos-shuva', shabbosOnOrAfter(d(TISHREI, 3)), 'special-shabbos', { specialShabbos: true }));
  erev('erev-yom-kippur', d(TISHREI, 9));
  yt('yom-kippur', d(TISHREI, 10), { fast: 'major' });
  erev('erev-sukkos', d(TISHREI, 14));
  yt('sukkos-1', d(TISHREI, 15));
  if (!israel) yt('sukkos-2', d(TISHREI, 16));
  for (let day = israel ? 16 : 17; day <= 20; day += 1) {
    add(make('chol-hamoed-sukkos', d(TISHREI, day), 'chol-hamoed', { cholHamoed: true, day: day - 15 }));
  }
  add(make('hoshana-rabba', d(TISHREI, 21), 'chol-hamoed', { cholHamoed: true, day: 6 }));
  for (let n = d(TISHREI, israel ? 16 : 17); n <= d(TISHREI, 21); n += 1) {
    if (dayOfWeek(n) === SHABBOS) {
      add(make('shabbos-chol-hamoed-sukkos', n, 'special-shabbos', { specialShabbos: true, cholHamoed: true }));
    }
  }
  if (israel) {
    yt('shemini-atzeres-simchas-torah', d(TISHREI, 22));
    add(make('isru-chag-sukkos', d(TISHREI, 23), 'isru-chag', { isruChag: true }));
  } else {
    yt('shemini-atzeres', d(TISHREI, 22));
    yt('simchas-torah', d(TISHREI, 23));
    add(make('isru-chag-sukkos', d(TISHREI, 24), 'isru-chag', { isruChag: true }));
  }

  // ---- Rosh Chodesh and Shabbos Mevorchim for every month that starts in this year (not Tishrei).
  for (const month of monthsInOrder(year)) {
    if (month === TISHREI) continue;
    const days = roshChodeshDays(year, month);
    days.forEach((n, i) => {
      add(make('rosh-chodesh', n, 'rosh-chodesh', { roshChodesh: true, month, monthYear: year, day: i + 1 }));
      if (dayOfWeek(n) === SHABBOS) {
        add(make('shabbos-rosh-chodesh', n, 'special-shabbos', { specialShabbos: true, roshChodesh: true, month, monthYear: year }));
      }
    });
    const firstRc = days[0] as DayNumber;
    if (dayOfWeek(firstRc - 1) === SHABBOS) {
      add(make('shabbos-machar-chodesh', firstRc - 1, 'special-shabbos', { specialShabbos: true, month, monthYear: year }));
    }
    add(make('shabbos-mevorchim', shabbosOnOrBefore(firstRc - 1), 'shabbos-mevorchim', { month, monthYear: year }));
  }
  // Shabbos Mevorchim for next Cheshvan isn't in this year; Tishrei is never blessed (Magen Avraham 417).

  // ---- Chanukah: 25 Kislev for eight days.
  const chanukah1 = d(KISLEV, 25);
  add(make('erev-chanukah', chanukah1 - 1, 'erev', { erev: true, candlesTonight: 1 }));
  for (let i = 0; i < 8; i += 1) {
    const n = chanukah1 + i;
    add(make('chanukah', n, 'rabbinic', { day: i + 1, ...(i < 7 ? { candlesTonight: i + 2 } : {}) }));
    if (dayOfWeek(n) === SHABBOS) add(make('shabbos-chanukah', n, 'special-shabbos', { specialShabbos: true, day: i + 1 }));
  }

  // ---- Teves, Shvat
  add(make('asara-beteves', d(TEVES, 10), 'fast', { fast: 'minor' })); // never Shabbos; may be Friday
  add(make('tu-bishvat', d(SHVAT, 15), 'minor', { minor: true }));
  {
    const pesachOfYear = d(NISAN, 15);
    for (let s = shabbosOnOrAfter(d(TEVES, 1)); s < pesachOfYear; s += 7) {
      const r = parshaOn(s, options.location).parsha;
      if (r?.includes('beshalach')) {
        add(make('shabbos-shira', s, 'special-shabbos', { specialShabbos: true }));
        break;
      }
    }
  }

  // ---- Adar
  const pm = purimMonth(year);
  if (isLeapYear(year)) {
    add(make('purim-katan', d(ADAR_I, 14), 'minor', { minor: true }));
    add(make('shushan-purim-katan', d(ADAR_I, 15), 'minor', { minor: true }));
  }
  const shekalim = shabbosOnOrBefore(d(pm, 1));
  add(make('shabbos-shekalim', shekalim, 'special-shabbos', { specialShabbos: true }));
  const purim = d(pm, 14);
  add(make('shabbos-zachor', shabbosOnOrBefore(purim - 1), 'special-shabbos', { specialShabbos: true }));
  const esther = purim - 1;
  const estherMoved = dayOfWeek(esther) === SHABBOS;
  add(make('taanis-esther', estherMoved ? esther - 2 : esther, 'fast', { fast: 'minor', postponed: estherMoved }));
  add(make('purim', purim, 'rabbinic'));
  add(make('shushan-purim', purim + 1, 'rabbinic'));
  if (dayOfWeek(purim + 1) === SHABBOS) {
    // Purim Meshulash (walled cities, e.g. Jerusalem): Megillah Friday, Al HaNissim Shabbos, seudah Sunday.
    for (let i = 0; i < 3; i += 1) add(make('purim-meshulash', purim + i, 'rabbinic', { day: i + 1 }));
  }
  const hachodesh = shabbosOnOrBefore(d(NISAN, 1));
  add(make('shabbos-parah', hachodesh - 7, 'special-shabbos', { specialShabbos: true }));
  add(make('shabbos-hachodesh', hachodesh, 'special-shabbos', { specialShabbos: true }));

  // ---- Nisan
  const pesach = d(NISAN, 15);
  add(make('shabbos-hagadol', shabbosOnOrBefore(pesach - 1), 'special-shabbos', { specialShabbos: true }));
  const bechoros = pesach - 1;
  const bechorosMoved = dayOfWeek(bechoros) === SHABBOS;
  add(make('taanis-bechoros', bechorosMoved ? bechoros - 2 : bechoros, 'fast', { fast: 'minor', postponed: bechorosMoved }));
  erev('erev-pesach', pesach - 1);
  yt('pesach-1', pesach);
  if (!israel) yt('pesach-2', pesach + 1);
  for (let day = israel ? 16 : 17; day <= 20; day += 1) {
    const n = d(NISAN, day);
    add(make('chol-hamoed-pesach', n, 'chol-hamoed', { cholHamoed: true, day: day - 15 }));
    if (dayOfWeek(n) === SHABBOS) add(make('shabbos-chol-hamoed-pesach', n, 'special-shabbos', { specialShabbos: true, cholHamoed: true }));
  }
  yt('pesach-7', d(NISAN, 21));
  if (!israel) yt('pesach-8', d(NISAN, 22));
  add(make('isru-chag-pesach', d(NISAN, israel ? 22 : 23), 'isru-chag', { isruChag: true }));

  // ---- Iyar, Sivan
  add(make('pesach-sheni', d(IYAR, 14), 'minor', { minor: true }));
  add(make('lag-baomer', d(IYAR, 18), 'minor', { minor: true }));
  for (let day = 3; day <= 5; day += 1) {
    add(make('shloshes-yemei-hagbala', d(SIVAN, day), 'minor', { minor: true, day: day - 2 }));
  }
  erev('erev-shavuos', d(SIVAN, 5));
  yt('shavuos-1', d(SIVAN, 6));
  if (!israel) yt('shavuos-2', d(SIVAN, 7));
  add(make('isru-chag-shavuos', d(SIVAN, israel ? 7 : 8), 'isru-chag', { isruChag: true }));

  // ---- Tammuz, Av
  const tammuz17 = d(TAMMUZ, 17);
  const tammuzMoved = dayOfWeek(tammuz17) === SHABBOS;
  add(make('shiva-asar-betammuz', tammuzMoved ? tammuz17 + 1 : tammuz17, 'fast', { fast: 'minor', postponed: tammuzMoved }));
  const av9 = d(AV, 9);
  const avMoved = dayOfWeek(av9) === SHABBOS;
  const tishaBav = avMoved ? av9 + 1 : av9;
  add(make('shabbos-chazon', shabbosOnOrBefore(av9), 'special-shabbos', { specialShabbos: true }));
  erev('erev-tisha-beav', tishaBav - 1);
  add(make('tisha-beav', tishaBav, 'fast', { fast: 'major', postponed: avMoved }));
  add(make('shabbos-nachamu', shabbosOnOrAfter(av9 + 1), 'special-shabbos', { specialShabbos: true }));
  add(make('tu-beav', d(AV, 15), 'minor', { minor: true }));

  // ---- Elul
  erev('erev-rosh-hashana', d(ELUL, 29));

  // ---- Optional customs
  if (options.leilSelichos) {
    // Motzaei Shabbos before Rosh Hashana, with at least four days of Selichos (Rema OC 581:1).
    const rh = roshHashana(year + 1);
    let s = shabbosOnOrBefore(rh - 1);
    if (rh - s < 5) s -= 7;
    add(make('leil-selichos', s, 'custom', { optional: true }));
  }
  if (options.behab) {
    for (const month of [CHESHVAN, IYAR]) {
      // The fasts begin after the first Shabbos after Rosh Chodesh (Mishna Berura 492:3).
      const rcEnd = d(month, 1);
      const shabbos = shabbosOnOrAfter(rcEnd + 1);
      const monday = shabbos + 2;
      [monday, monday + 3, monday + 7].forEach((n, i) => add(make('behab', n, 'custom', { fast: 'minor', optional: true, day: i + 1 })));
    }
  }
  if (options.yomKippurKatan) {
    for (const month of monthsInOrder(year)) {
      // Not before Tishrei (Rosh Hashana), Cheshvan (end of Tishrei), Teves (Chanukah), Iyar (Nisan).
      if (month === TISHREI || month === CHESHVAN || month === TEVES || month === IYAR) continue;
      const firstRc = (roshChodeshDays(year, month)[0] as DayNumber);
      let n = firstRc - 1;
      const w = dayOfWeek(n);
      const moved = w === SHABBOS || (w === 5 && options.yomKippurKatanOnFriday === 'thursday');
      if (w === SHABBOS) n -= 2; // Rosh Chodesh on Sunday: fast on Thursday (Magen Avraham 417)
      else if (moved) n -= 1;
      add(make('yom-kippur-katan', n, 'custom', { fast: 'minor', optional: true, postponed: moved, month, monthYear: year }));
    }
  }
  if (options.shovavim) {
    const weeks = ['shemos', 'vaeira', 'bo', 'beshalach', 'yisro', 'mishpatim', ...(isLeapYear(year) ? ['terumah', 'tetzaveh'] : [])];
    for (let s = shabbosOnOrAfter(d(TEVES, 1)); s < d(pm, 15); s += 7) {
      const r = parshaOn(s, options.location).parsha;
      const i = r ? weeks.findIndex((w) => r.includes(w as never)) : -1;
      if (i >= 0) add(make('shovavim', s, 'custom', { optional: true, day: i + 1 }));
    }
  }
  if (options.modernIsraeli) out.push(...modernIsraeliDays(year));

  return out.sort((a, b) => a.dayNumber - b.dayNumber || order(a) - order(b));
}

// Stable order within a day: main days first.
const CATEGORY_ORDER: HolidayCategory[] = [
  'yom-tov', 'fast', 'rabbinic', 'chol-hamoed', 'rosh-chodesh', 'modern-israeli', 'minor', 'erev', 'isru-chag',
  'special-shabbos', 'shabbos-mevorchim', 'custom',
];
function order(h: Holiday): number {
  return CATEGORY_ORDER.indexOf(h.category);
}

/**
 * Modern Israeli days, with the Knesset's postponement rules.
 * - Yom HaShoah (27 Nisan, from 5711/1951): Friday → Thursday; Sunday → Monday (from 5757/1997, per Hebrew Wikipedia,
 *   "יום הזיכרון לשואה ולגבורה").
 * - Yom HaZikaron and Yom HaAtzmaut (4–5 Iyar, from 5709/1949): if 5 Iyar is Friday or Shabbos, both move back to
 *   Wednesday–Thursday; if 5 Iyar is Monday, they move forward to Monday–Tuesday (from 5764/2004).
 * - Yom Yerushalayim (28 Iyar, from 5728/1968).
 * - Yom HaAliyah (10 Nisan, from 5777/2016) and Sigd (29 Cheshvan, from 5769/2008; Shabbos → Thursday 27 Cheshvan,
 *   Sigd Holiday Law 5768-2008).
 * These start years are As built and are compared with the oracle; see docs/accuracy.md.
 */
export function modernIsraeliDays(year: number): Holiday[] {
  const out: Holiday[] = [];
  const d = (month: number, day: number): DayNumber => hebrewToDayNumber(year, month, day);
  const m = (id: string, n: DayNumber, postponed = false): Holiday =>
    make(id, n, 'modern-israeli', { modernIsraeli: true, optional: true, postponed });

  if (year >= 5769) {
    // Sigd Holiday Law 5768-2008: if 29 Cheshvan is Shabbos, Sigd is on Thursday 27 Cheshvan.
    const n = d(CHESHVAN, 29);
    out.push(dayOfWeek(n) === SHABBOS ? m('sigd', n - 2, true) : m('sigd', n));
  }
  if (year >= 5777) out.push(m('yom-haaliyah', d(NISAN, 10)));
  if (year >= 5711) {
    const n = d(NISAN, 27);
    const w = dayOfWeek(n);
    if (w === 5) out.push(m('yom-hashoah', n - 1, true));
    else if (w === 0 && year >= 5757) out.push(m('yom-hashoah', n + 1, true));
    else out.push(m('yom-hashoah', n));
  }
  if (year >= 5708) {
    const n = d(IYAR, 5);
    const w = dayOfWeek(n);
    let atzmaut = n;
    if (w === 5) atzmaut = n - 1;
    else if (w === SHABBOS) atzmaut = n - 2;
    else if (w === 1 && year >= 5764) atzmaut = n + 1;
    if (year >= 5711) out.push(m('yom-hazikaron', atzmaut - 1, atzmaut !== n));
    out.push(m('yom-haatzmaut', atzmaut, atzmaut !== n));
  }
  if (year >= 5728) out.push(m('yom-yerushalayim', d(IYAR, 28)));
  return out;
}

/** Holidays on a single day (civil date `dayNumber`). */
export function holidaysOn(dayNumber: DayNumber, options: HolidayOptions): Holiday[] {
  const { year } = dayNumberToHebrew(dayNumber);
  return holidaysInYear(year, options).filter((h) => h.dayNumber === dayNumber);
}

/** Holidays in the inclusive range of day numbers. */
export function holidaysBetween(start: DayNumber, end: DayNumber, options: HolidayOptions): Holiday[] {
  const first = dayNumberToHebrew(start).year;
  const last = dayNumberToHebrew(end).year;
  const out: Holiday[] = [];
  for (let y = first; y <= last; y += 1) {
    for (const h of holidaysInYear(y, options)) if (h.dayNumber >= start && h.dayNumber <= end) out.push(h);
  }
  return out;
}


/**
 * Display name: `"Rosh Chodesh Kislev"`, `"Chanukah: day 3"`, `"ראש חודש כסלו"`, `"חנוכה ג׳"`.
 */
export function holidayName(h: Holiday, names: NameStyle | NameTable = 'en'): string {
  const base = nameOf(`holiday.${h.id}`, names);
  const hebrew = names === 'he' || (typeof names === 'object' && /[\u0590-\u05FF]/.test(base));
  if (h.month !== undefined && h.monthYear !== undefined) return `${base} ${monthName(h.monthYear, h.month, names)}`;
  if (h.day !== undefined && (h.id === 'chanukah' || h.id.startsWith('chol-hamoed') || h.id === 'behab' || h.id === 'purim-meshulash' || h.id === 'shloshes-yemei-hagbala')) {
    return hebrew ? `${base} ${gematriya(h.day)}` : `${base}: day ${h.day}`;
  }
  return base;
}
