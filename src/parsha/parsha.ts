/**
 * The weekly Torah reading (parsha), in Israel and the diaspora.
 *
 * Rules (Tur and Shulchan Aruch OC 428:4; Megillah 31b):
 * - Bereshis is read on the first Shabbos after Simchas Torah; Vezos Haberacha only on Simchas Torah.
 * - In a common year Tzav is read before Pesach; in a leap year, Metzora ("סגרו ופסחו"), except in leap years
 *   whose Rosh Hashana is on Thursday, chaseira (ה״ח) or, per the Rema, sheleima (ה״ש), when Acharei Mos is read
 *   before Pesach (SA OC 428:4; Mishna Berura 428:6: Noach falls on Rosh Chodesh Cheshvan, adding a Shabbos).
 * - Bamidbar is read before Shavuos ("מנו ועצרו").
 * - Devarim is read on the Shabbos before Tisha B'Av ("צומו וצלו"), Va'eschanan after it.
 * - Nitzavim is read before Rosh Hashana ("קומו ותקעו"); Vayelech is read with it unless there are two
 *   Shabbosos between Rosh Hashana and Sukkos, in which case Vayelech is read on Shabbos Shuva.
 * - A Shabbos that is Yom Tov or Chol Hamoed has the festival's reading instead.
 *
 * Between the anchors, the seven pairs (Vayakhel–Pekudei, Tazria–Metzora, Acharei–Kedoshim, Behar–Bechukosai,
 * Chukas–Balak, Matos–Masei, Nitzavim–Vayelech) are joined as needed to fit the Shabbosos available.
 * In Israel, when the eighth day of Pesach (diaspora) is a Shabbos, Israel is a week ahead until the two
 * readings line up again, so the Shavuos anchor does not bind in Israel.
 *
 * @packageDocumentation
 */

import { dayOfWeek, type DayNumber } from '../calendar/gregorian.js';
import { type NameStyle, type NameTable, nameOf } from '../format/names.js';
import { AV, NISAN, SIVAN, TISHREI, hebrewToDayNumber, isLeapYear, roshHashana, dayNumberToHebrew } from '../calendar/hebrew.js';

/** Parsha ids in Torah order (index + 1 = number). */
export const PARSHIYOS = [
  'bereshis', 'noach', 'lech-lecha', 'vayera', 'chayei-sarah', 'toldos', 'vayetzei', 'vayishlach', 'vayeshev', 'miketz',
  'vayigash', 'vayechi', 'shemos', 'vaeira', 'bo', 'beshalach', 'yisro', 'mishpatim', 'terumah', 'tetzaveh', 'ki-sisa',
  'vayakhel', 'pekudei', 'vayikra', 'tzav', 'shemini', 'tazria', 'metzora', 'acharei-mos', 'kedoshim', 'emor', 'behar',
  'bechukosai', 'bamidbar', 'naso', 'behaaloscha', 'shelach', 'korach', 'chukas', 'balak', 'pinchas', 'matos', 'masei',
  'devarim', 'vaeschanan', 'eikev', 'reeh', 'shoftim', 'ki-seitzei', 'ki-savo', 'nitzavim', 'vayelech', 'haazinu',
  'vezos-haberacha',
] as const;

export type ParshaId = (typeof PARSHIYOS)[number];

/** Where the reading is: Israel or the diaspora. There is no default (the readings differ). */
export type Location = 'israel' | 'diaspora';

const idx = (id: ParshaId): number => PARSHIYOS.indexOf(id);

/** The seven pairs that can be joined, by the index of the first of the pair. */
const PAIRS: Record<string, number> = {
  'vayakhel-pekudei': idx('vayakhel'),
  'tazria-metzora': idx('tazria'),
  'acharei-mos-kedoshim': idx('acharei-mos'),
  'behar-bechukosai': idx('behar'),
  'chukas-balak': idx('chukas'),
  'matos-masei': idx('matos'),
  'nitzavim-vayelech': idx('nitzavim'),
};

/** The festival reading on a Shabbos that has no parsha. */
export type SpecialReading =
  | 'rosh-hashana'
  | 'yom-kippur'
  | 'sukkos'
  | 'sukkos-chol-hamoed'
  | 'shemini-atzeres'
  | 'pesach'
  | 'pesach-chol-hamoed'
  | 'pesach-7'
  | 'pesach-8'
  | 'shavuos';

/** What is read on a given Shabbos. */
export interface ShabbosReading {
  readonly dayNumber: DayNumber;
  /** One or two parsha ids, or `null` on a Yom Tov / Chol Hamoed Shabbos. */
  readonly parsha: readonly ParshaId[] | null;
  /** The festival reading when `parsha` is null. */
  readonly special: SpecialReading | null;
}

/** The festival reading on Shabbos `dayNumber` in `location`, or null if a parsha is read. */
export function festivalReading(dayNumber: DayNumber, location: Location): SpecialReading | null {
  const { month, day } = dayNumberToHebrew(dayNumber);
  const israel = location === 'israel';
  if (month === TISHREI) {
    if (day === 1 || day === 2) return 'rosh-hashana';
    if (day === 10) return 'yom-kippur';
    if (day === 15 || (day === 16 && !israel)) return 'sukkos';
    if (day >= 16 && day <= 21) return 'sukkos-chol-hamoed';
    if (day === 22 || (day === 23 && !israel)) return 'shemini-atzeres';
  } else if (month === NISAN) {
    if (day === 15 || (day === 16 && !israel)) return 'pesach';
    if (day >= 16 && day <= 20) return 'pesach-chol-hamoed';
    if (day === 21) return 'pesach-7';
    if (day === 22 && !israel) return 'pesach-8';
  } else if (month === SIVAN) {
    if (day === 6 || (day === 7 && !israel)) return 'shavuos';
  }
  return null;
}

/** Shabbos on or after `n`. */
function shabbosOnOrAfter(n: DayNumber): DayNumber {
  return n + ((6 - dayOfWeek(n) + 7) % 7);
}

/** Shabbosos in [from, to) that have a parsha (not a festival) in `location`. */
function regularShabbosos(from: DayNumber, to: DayNumber, location: Location): DayNumber[] {
  const out: DayNumber[] = [];
  for (let s = shabbosOnOrAfter(from); s < to; s += 7) if (festivalReading(s, location) === null) out.push(s);
  return out;
}

/**
 * Assign parshiyos `[first, last]` (inclusive indices) to `shabbosos`, joining pairs as needed.
 * `forced` pairs are joined first (in order) up to `forcedCount`; the rest come from `priority`.
 */
function fill(
  shabbosos: DayNumber[],
  first: number,
  last: number,
  priority: readonly string[],
  out: Map<DayNumber, ParshaId[]>,
  what: string,
  forced: readonly string[] = [],
  forcedCount = 0,
): void {
  const count = last - first + 1;
  let joins = count - shabbosos.length;
  if (joins < 0) throw new Error(`parsha: too many Shabbosos in ${what}`);
  const joined = new Set<number>();
  const take = (pair: string): boolean => {
    const a = PAIRS[pair];
    if (a === undefined || a < first || a + 1 > last || joined.has(a)) return false;
    joined.add(a);
    joins -= 1;
    return true;
  };
  let f = forcedCount;
  for (const pair of forced) if (f > 0 && joins > 0 && take(pair)) f -= 1;
  if (f > 0) throw new Error(`parsha: cannot fit Bamidbar before Shavuos in ${what}`);
  for (const pair of priority) if (joins > 0) take(pair);
  if (joins > 0) throw new Error(`parsha: not enough pairs to join in ${what}`);
  let p = first;
  for (const s of shabbosos) {
    const reading: ParshaId[] = [PARSHIYOS[p] as ParshaId];
    if (joined.has(p)) {
      p += 1;
      reading.push(PARSHIYOS[p] as ParshaId);
    }
    out.set(s, reading);
    p += 1;
  }
}

/** Order in which pairs after Pesach are joined, beyond those forced by the Shavuos anchor. */
const COMMON_SUMMER_PRIORITY = ['tazria-metzora', 'acharei-mos-kedoshim', 'matos-masei', 'behar-bechukosai', 'chukas-balak'];
const LEAP_SUMMER_PRIORITY = ['matos-masei', 'chukas-balak', 'acharei-mos-kedoshim', 'behar-bechukosai'];

const cache = new Map<string, Map<DayNumber, ParshaId[]>>();

/** All regular Shabbos readings from Shabbos Bereshis of `year` to the last Shabbos before Rosh Hashana of `year + 1`. */
function readingsForYear(year: number, location: Location): Map<DayNumber, ParshaId[]> {
  const key = `${year}:${location}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const leap = isLeapYear(year);
  const out = new Map<DayNumber, ParshaId[]>();

  const pesach = hebrewToDayNumber(year, NISAN, 15);
  const shavuos = hebrewToDayNumber(year, SIVAN, 6);
  const tishaBav = hebrewToDayNumber(year, AV, 9);
  const nextRh = roshHashana(year + 1);
  const afterSimchasTorah = hebrewToDayNumber(year, TISHREI, 22);

  // Segment 1: Bereshis to Tzav (common), Metzora (leap) or Acharei Mos (leap year with Rosh Hashana on Thursday).
  const achareiBeforePesach = leap && dayOfWeek(roshHashana(year)) === 4;
  const lastBeforePesach = !leap ? 'tzav' : achareiBeforePesach ? 'acharei-mos' : 'metzora';
  fill(regularShabbosos(afterSimchasTorah, pesach, location), idx('bereshis'), idx(lastBeforePesach),
    ['vayakhel-pekudei', 'tazria-metzora'], out, `${year} Bereshis–Pesach`);

  // Shabbos on Tisha B'Av (nidcheh) still reads Devarim: include it in the segment.
  const afterTishaBav = tishaBav + 1;
  const segment2Start = idx(lastBeforePesach) + 1;
  // Segment 2: from Pesach to Tisha B'Av. Bamidbar must be read before Shavuos, which forces some joins
  // when there are few Shabbosos before it; the remaining joins follow the order below.
  const beforeShavuos = regularShabbosos(pesach, shavuos, location).length;
  const toBamidbar = idx('bamidbar') - segment2Start + 1;
  const forcedJoins = Math.max(0, toBamidbar - beforeShavuos);
  const springPairs = ['tazria-metzora', 'acharei-mos-kedoshim', 'behar-bechukosai'];
  fill(regularShabbosos(pesach, afterTishaBav, location), segment2Start, idx('devarim'),
    leap ? LEAP_SUMMER_PRIORITY : COMMON_SUMMER_PRIORITY, out, `${year} Pesach–Tisha B'Av`, springPairs, forcedJoins);

  // Segment 4: Va'eschanan to Nitzavim (+ Vayelech unless it is read on Shabbos Shuva next year).
  const vayelechNextYear = regularShabbosos(nextRh, hebrewToDayNumber(year + 1, TISHREI, 22), location).length === 2;
  fill(regularShabbosos(afterTishaBav, nextRh, location), idx('vaeschanan'), idx(vayelechNextYear ? 'nitzavim' : 'vayelech'),
    ['nitzavim-vayelech'], out, `${year} Tisha B'Av–Rosh Hashana`);

  // Segment 0 of this year: Shabbosos between Rosh Hashana and Simchas Torah: Haazinu, preceded by Vayelech if needed.
  const early = regularShabbosos(roshHashana(year), afterSimchasTorah, location);
  if (early.length === 2) {
    out.set(early[0] as DayNumber, ['vayelech']);
    out.set(early[1] as DayNumber, ['haazinu']);
  } else if (early.length === 1) {
    out.set(early[0] as DayNumber, ['haazinu']);
  }

  if (cache.size > 64) cache.clear();
  cache.set(key, out);
  return out;
}

/**
 * The reading for the Shabbos on or after `dayNumber` (pass a Shabbos to get that Shabbos).
 * `location` is required because Israel and the diaspora sometimes differ.
 */
export function parshaOn(dayNumber: DayNumber, location: Location): ShabbosReading {
  const shabbos = shabbosOnOrAfter(dayNumber);
  const special = festivalReading(shabbos, location);
  if (special) return { dayNumber: shabbos, parsha: null, special };
  const year = dayNumberToHebrew(shabbos).year;
  const parsha = readingsForYear(year, location).get(shabbos);
  /* c8 ignore next */
  if (!parsha) throw new Error(`parsha: no reading computed for day ${shabbos}`);
  return { dayNumber: shabbos, parsha, special: null };
}

/** Every Shabbos reading in Hebrew year `year` (1 Tishrei to 29 Elul). */
export function parshiyosOfYear(year: number, location: Location): ShabbosReading[] {
  const out: ShabbosReading[] = [];
  const end = roshHashana(year + 1);
  for (let s = shabbosOnOrAfter(roshHashana(year)); s < end; s += 7) out.push(parshaOn(s, location));
  return out;
}

/** True if Israel and the diaspora read different parshiyos on this Shabbos. */
export function readingsDiffer(shabbos: DayNumber): boolean {
  const a = parshaOn(shabbos, 'israel');
  const b = parshaOn(shabbos, 'diaspora');
  return JSON.stringify([a.parsha, a.special]) !== JSON.stringify([b.parsha, b.special]);
}

/**
 * Display name of a reading: `"Vayakhel-Pekudei"`, `"ויקהל-פקודי"`, or the festival reading's name.
 */
export function readingName(reading: ShabbosReading, names: NameStyle | NameTable = 'en'): string {
  if (reading.parsha) return reading.parsha.map((p) => nameOf(`parsha.${p}`, names)).join('-');
  return nameOf(`reading.${reading.special}`, names);
}
