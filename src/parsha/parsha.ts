/**
 * The weekly Torah reading (parsha).
 *
 * The Torah is read in 54 parshiyos over a year, from the Shabbos after Simchas Torah to
 * Simchas Torah. Vezos HaBeracha is read on Simchas Torah itself, not on a Shabbos.
 * A Shabbos that is Yom Tov or Chol Hamoed has its own reading and no parsha.
 *
 * Seven pairs may be read together on one Shabbos when there are fewer Shabbosos than
 * parshiyos (Vayakhel–Pekudei, Tazria–Metzora, Acharei Mos–Kedoshim, Behar–Bechukosai,
 * Chukas–Balak, Matos–Masei, Nitzavim–Vayelech). The schedule is fixed by deadlines
 * (Tur and Shulchan Aruch OC 428:4):
 *
 * - in a common year Tzav is read before Pesach, in a leap year Metzora;
 * - Bamidbar before Shavuos;
 * - Devarim on the Shabbos before Tisha B'Av (Shabbos Chazon), Vaeschanan after it;
 * - Nitzavim before Rosh Hashana;
 * - Haazinu before Sukkos.
 *
 * Pairs are joined only when the Shabbosos before a deadline cannot fit the parshiyos that
 * must be read by then, in a fixed order of preference. Israel and the diaspora diverge
 * when the last day of Pesach or the second day of Shavuos falls on Shabbos outside
 * Israel; the diaspora then joins one more pair than Israel before the next deadline, and
 * the readings realign.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { isLeapYear, roshHashanaDays, MAX_DAYS } from '../calendar/year.js';
import { dayOfWeekOfDays } from '../time/civil.js';
import { festivalOn } from '../holidays/holidays.js';
import { lookupIn, type Locale } from '../locales/types.js';
import { NAMES } from './names-data.js';
import { he } from '../locales/he.js';

/** The 54 parshiyos in order. Index = position in the Torah. */
export const PARSHIYOS = [
  'bereshis', 'noach', 'lech-lecha', 'vayera', 'chayei-sarah', 'toldos', 'vayetzei', 'vayishlach', 'vayeshev', 'miketz',
  'vayigash', 'vayechi', 'shemos', 'vaera', 'bo', 'beshalach', 'yisro', 'mishpatim', 'terumah', 'tetzaveh',
  'ki-sisa', 'vayakhel', 'pekudei', 'vayikra', 'tzav', 'shemini', 'tazria', 'metzora', 'acharei-mos', 'kedoshim',
  'emor', 'behar', 'bechukosai', 'bamidbar', 'nasso', 'behaaloscha', 'shelach', 'korach', 'chukas', 'balak',
  'pinchas', 'matos', 'masei', 'devarim', 'vaeschanan', 'eikev', 'reeh', 'shoftim', 'ki-seitzei', 'ki-savo',
  'nitzavim', 'vayelech', 'haazinu', 'vezos-haberacha',
] as const;

/** A parsha id, e.g. `"bereshis"`. Display names use the locale key `parsha.<id>`. */
export type ParshaId = (typeof PARSHIYOS)[number];

const P = (id: ParshaId): number => PARSHIYOS.indexOf(id);

/**
 * The pairs that may be joined (by first parsha), in order of preference: when a segment
 * needs k joined pairs, the first k that lie in it are joined. Tazria–Metzora before
 * Acharei Mos–Kedoshim before Behar–Bechukosai; Matos–Masei before Chukas–Balak.
 */
const JOIN_PREFERENCE = [P('vayakhel'), P('tazria'), P('acharei-mos'), P('behar'), P('matos'), P('chukas'), P('nitzavim')];

/** The reading for one Shabbos. */
export interface ShabbosReading {
  /** The Shabbos. */
  readonly date: HebrewDate;
  /** One parsha, or two when joined; `null` when the Shabbos is Yom Tov or Chol Hamoed. */
  readonly parsha: readonly ParshaId[] | null;
  /** When `parsha` is null, the holiday whose reading replaces it (an event id, e.g. `"pesach"`). */
  readonly holiday?: string;
}

interface Deadline {
  /** Last Shabbos (epoch day) by which `through` must have been read. */
  readonly by: number;
  readonly through: number;
}

const cache = new Map<string, ShabbosReading[]>();

/**
 * Every Shabbos reading of the cycle that begins after Simchas Torah of Hebrew year `year`
 * and ends with Haazinu before Sukkos of `year + 1`. For 9999, the last supported year, the
 * schedule is worked out in full (1 Tishrei 10000 is known), but the Shabbosos that fall in
 * year 10000 are omitted.
 */
export function readingCycle(year: number, options?: { israel?: boolean }): ShabbosReading[] {
  const israel = options?.israel ?? false;
  const key = `${year}|${israel ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const start = new HebrewDate(year, Month.TISHREI, israel ? 22 : 23).next().onOrAfter(6);
  // The last Shabbos before Sukkos of `year + 1`, as an epoch day: for 9999 it lies in year
  // 10000, which has no HebrewDate, but its day is known from the molad arithmetic.
  const rhNext = roshHashanaDays(year + 1);
  const sukkosEve = rhNext + 13;
  const endDays = sukkosEve - ((dayOfWeekOfDays(sukkosEve) + 1) % 7);
  const festivalOnDays = (days: number): string | null => {
    if (days <= MAX_DAYS) return festivalOn(HebrewDate.fromEpochDays(days), israel);
    // Tishrei of year 10000, before Sukkos: only Rosh Hashana and Yom Kippur are Yom Tov.
    const t = days - rhNext + 1;
    return t === 1 || t === 2 ? 'rosh-hashana' : t === 10 ? 'yom-kippur' : null;
  };
  const lastShabbosBefore = (d: HebrewDate) => d.prev().onOrBefore(6).epochDays;
  // Pesach, Shavuos and Tisha B'Av of this cycle fall in Hebrew year `year` (Tishrei–Elul).
  const deadlines: Deadline[] = [
    { by: lastShabbosBefore(new HebrewDate(year, Month.NISAN, 15)), through: P(isLeapYear(year) ? 'metzora' : 'tzav') },
    { by: lastShabbosBefore(new HebrewDate(year, Month.SIVAN, 6)), through: P('bamidbar') },
    { by: new HebrewDate(year, Month.AV, 9).onOrBefore(6).epochDays, through: P('devarim') },
    // Nitzavim before Rosh Hashana follows from this last deadline: there are always seven
    // Shabbosos from Tisha B'Av to Rosh Hashana for Vaeschanan–Nitzavim.
    { by: endDays, through: P('haazinu') },
  ];

  // Shabbosos with no parsha: Yom Tov or Chol Hamoed (and Yom Kippur).
  const shabbosos: { days: number; holiday: string | null }[] = [];
  for (let days = start.epochDays; days <= endDays; days += 7) {
    shabbosos.push({ days, holiday: festivalOnDays(days) });
  }

  // Decide which pairs to join, deadline by deadline: when the Shabbosos before a deadline
  // are fewer than the parshiyos that must be read by then, join that many pairs, in the
  // customary order of preference (JOIN_PREFERENCE).
  const reading = shabbosos.filter((x) => !x.holiday);
  const joins = new Set<number>();
  let i = 0;
  let slot = 0;
  for (const dl of deadlines) {
    let slots = 0;
    while (slot + slots < reading.length && reading[slot + slots]!.days <= dl.by) slots++;
    const needed = dl.through - i + 1;
    if (needed > slots) {
      const candidates = JOIN_PREFERENCE.filter((p) => p >= i && p + 1 <= dl.through);
      if (candidates.length < needed - slots) throw new Error(`Parsha schedule for ${year}: cannot fit ${needed} parshiyos in ${slots} Shabbosos before ${dl.through} (at ${i})`);
      for (const p of candidates.slice(0, needed - slots)) joins.add(p);
    }
    // Advance through this segment.
    for (let n = 0; n < slots; n++) i += joins.has(i) ? 2 : 1;
    slot += slots;
  }

  const out: ShabbosReading[] = [];
  i = 0;
  for (const { days, holiday } of shabbosos) {
    // Year 10000 is outside the range: its Shabbosos are counted but not listed.
    const date = days <= MAX_DAYS ? HebrewDate.fromEpochDays(days) : null;
    if (holiday) {
      if (date) out.push({ date, parsha: null, holiday });
      continue;
    }
    if (i > P('haazinu')) throw new Error(`Parsha schedule overran in ${year}`);
    const parsha: ParshaId[] = joins.has(i) ? [PARSHIYOS[i]!, PARSHIYOS[i + 1]!] : [PARSHIYOS[i]!];
    if (date) out.push({ date, parsha });
    i += parsha.length;
  }
  if (i !== P('vezos-haberacha')) throw new Error(`Parsha schedule for ${year} ended at ${PARSHIYOS[i]}`);
  cache.set(key, out);
  return out;
}

/**
 * The reading for the Shabbos on or after `date` (so on a weekday it is "this week's
 * parsha"). `parsha` is null when that Shabbos is Yom Tov or Chol Hamoed. Returns null only
 * for the last days of year 9999, whose coming Shabbos is in year 10000, outside the range.
 */
export function parshaFor(date: HebrewDate, options?: { israel?: boolean }): ShabbosReading | null {
  if (date.epochDays + ((6 - date.dayOfWeek + 7) % 7) > MAX_DAYS) return null;
  const shabbos = date.onOrAfter(6);
  // The cycle that contains this Shabbos began after Simchas Torah of this year or the year before.
  for (const y of [shabbos.year, shabbos.year - 1]) {
    if (y < 1) continue;
    const r = readingCycle(y, options).find((x) => x.date.epochDays === shabbos.epochDays);
    if (r) return r;
  }
  // Between Rosh Hashana and Simchas Torah on a Shabbos that is Yom Tov (belongs to neither list).
  return { date: shabbos, parsha: null, holiday: festivalOn(shabbos, options?.israel ?? false) ?? 'unknown' };
}

/**
 * The display name of a reading, e.g. "Vayakhel-Pekudei" or "ויקהל-פקודי". Joined
 * parshiyos use the locale key `parsha.join` as the separator. Returns null for a
 * Shabbos with no parsha.
 */
export function parshaName(parsha: readonly ParshaId[] | null, locale: Locale = he): string | null {
  if (!parsha) return null;
  return parsha.map((p) => lookupIn(locale, `parsha.${p}`, NAMES)).join(lookupIn(locale, 'parsha.join', NAMES));
}

/**
 * The chapter of Pirkei Avos read on a summer Shabbos afternoon (between Pesach and Rosh
 * Hashana; Rema OC 292:2 records the custom). Chapters 1–6 are read in order, one each
 * Shabbos, and repeated; Shabbosos that are Yom Tov or Tisha B'Av are skipped. In the last
 * weeks before Rosh Hashana, when fewer than six Shabbosos remain for a full round, some
 * double up the chapters so the year ends with chapter 6 (`cycle: 'doubled'`); the default,
 * `cycle: 'single'`, keeps one chapter a week (*as built*). Customs vary (some read only until Shavuos); returns null outside
 * the season or when not read.
 */
export function pirkeiAvos(date: HebrewDate, options?: { israel?: boolean; cycle?: 'doubled' | 'single' }): number[] | null {
  if (!date.isShabbos) return null;
  const israel = options?.israel ?? false;
  const y = date.year;
  const firstAfterPesach = new HebrewDate(y, Month.NISAN, israel ? 22 : 23).onOrAfter(6);
  // The season ends with the year (29 Elul), so year 9999 needs no date in year 10000.
  const lastDay = new HebrewDate(y, Month.ELUL, 29).epochDays;
  if (date.epochDays < firstAfterPesach.epochDays || date.epochDays > lastDay) return null;
  const av9 = new HebrewDate(y, Month.AV, 9);
  const counted: HebrewDate[] = [];
  for (let days = firstAfterPesach.epochDays; days <= lastDay; days += 7) {
    const d = HebrewDate.fromEpochDays(days);
    if (festivalOn(d, israel) || d.equals(av9)) continue;
    counted.push(d);
  }
  const idx = counted.findIndex((d) => d.equals(date));
  if (idx < 0) return null;
  const n = counted.length;
  const r = n % 6;
  const lastStart = n - r;
  if ((options?.cycle ?? 'single') === 'single' || r === 0 || idx < lastStart) return [(idx % 6) + 1];
  // The final partial round of r Shabbosos ends with chapter 6, doubling up from the end:
  // r = 5: 1, 2, 3, 4, 5–6; r = 4: 1, 2, 3–4, 5–6; r = 3: 1–2, 3–4, 5–6; r = 2: 3–4, 5–6; r = 1: 5–6.
  const k = idx - lastStart;
  const singles = Math.max(0, 2 * r - 6);
  if (k < singles) return [k + 1];
  const c = 7 - 2 * (r - k);
  return [c, c + 1];
}
