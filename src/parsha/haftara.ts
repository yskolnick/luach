/**
 * The haftara: by minhag, with the special haftaros and their order of precedence.
 *
 * Precedence on Shabbos (docs/research/2026-10-21-haftaros.md; SA OC 425, 428, 684, 685
 * with Rema and Mishna Berura):
 *
 * 1. Yom Tov and Chol Hamoed have their own haftara.
 * 2. The four parshiyos (Shekalim, Zachor, Parah, HaChodesh) displace Rosh Chodesh and
 *    Machar Chodesh (Rema 425:1; SA 685:1). Chabad adds the first and last verses of the
 *    displaced haftara.
 * 3. Shabbos Chanukah displaces Rosh Chodesh Teves (SA 684:3) and Machar Chodesh.
 * 4. Shabbos Shuva.
 * 5. The three haftaros of affliction (the Shabbosos before Tisha B'Av; the third is
 *    Devarim's own) and the seven of consolation (after Tisha B'Av). Rosh Chodesh Av keeps
 *    the second of affliction (MB 425:8). Rosh Chodesh Elul on Shabbos: Ashkenazim and Chabad
 *    read Rosh Chodesh's and make up Re'eh's on Ki Seitzei (MB 425:7); Sephardim keep Re'eh's.
 * 6. Shabbos HaGadol, by custom (see `shabbosHagadol`).
 * 7. Shabbos Rosh Chodesh (with the first and last verses of Machar Chodesh added by
 *    Sephardim and Chabad when Sunday is also Rosh Chodesh), then Machar Chodesh.
 * 8. Otherwise the parsha's own; for joined parshiyos the second one's, except Acharei
 *    Mos–Kedoshim, where Ashkenazim and Chabad read Acharei Mos's (Rema OC 428:8).
 *    Ashkenazim read Kedoshim's "Hatishpot" (Ezekiel 22) only because Acharei Mos's "Halo
 *    kivnei kushiyim" (Amos 9) was already read; so when Acharei Mos fell on Machar Chodesh,
 *    Kedoshim reads Amos 9 (MB 428:26, citing R. Akiva Eiger: "וה"ה אם שבת פ' אחרי היה
 *    ער"ח ומפטירין מחר חודש דמפטירין בשבת פרשת קדושים הלוא כבני כושיים"). The MB names
 *    Machar Chodesh; Luach applies its reason to any special haftara that displaced Acharei
 *    Mos's, such as Shabbos HaGadol (*as built*).
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { festivalOn, holidaysOn, roshChodeshOn } from '../holidays/holidays.js';
import { parshaFor } from './parsha.js';
import { PARSHA_HAFTAROS, SPECIAL_HAFTAROS, type HaftaraRow } from './haftaros-data.js';

/** Customs with haftara data. */
export type HaftaraMinhag = 'ashkenaz' | 'sephardi' | 'chabad' | 'teimani';

/** Options for {@link haftaraFor}. */
export interface HaftaraOptions {
  israel?: boolean;
  /** Default `'ashkenaz'`. */
  minhag?: HaftaraMinhag;
  /**
   * When the haftara of Shabbos HaGadol (Malachi 3) is read:
   * `'always'`; `'erevPesachOnly'` (only when Erev Pesach is Shabbos; Chabad);
   * `'exceptErevPesach'` (the Gra); `'never'` (Baladi Teimanim).
   * Default by minhag: Ashkenaz and Sephardi `'always'`, Chabad `'erevPesachOnly'`,
   * Teimani `'never'` (*as built*; customs differ within each).
   */
  shabbosHagadol?: 'always' | 'erevPesachOnly' | 'exceptErevPesach' | 'never';
}

/** The haftara read on a day. */
export interface Haftara {
  /** Which haftara: a parsha id (or "a-b") or a special key such as "shekalim", "machar-chodesh", "pesach-7". */
  readonly key: string;
  readonly minhag: HaftaraMinhag;
  /** References joined with "; ", e.g. "Isaiah 66:1-24; Isaiah 66:23"; null if not known for this minhag. */
  readonly reference: string | null;
  /** The same, split into segments. */
  readonly segments: readonly string[];
}

const COLUMN: Record<HaftaraMinhag, number> = { ashkenaz: 0, sephardi: 1, chabad: 2, teimani: 3 };

function make(key: string, row: HaftaraRow | undefined, minhag: HaftaraMinhag): Haftara {
  const ref = row ? row[COLUMN[minhag]] ?? null : null;
  return { key, minhag, reference: ref, segments: ref ? ref.split('; ') : [] };
}

const special = (key: string, minhag: HaftaraMinhag) => make(key, SPECIAL_HAFTAROS[key], minhag);

/** The holiday haftara key for a Yom Tov or Chol Hamoed day, or null. */
function holidayKey(date: HebrewDate, israel: boolean): string | null {
  const f = festivalOn(date, israel);
  if (!f) return null;
  const d = date.day;
  switch (f) {
    case 'rosh-hashana': return d === 1 ? 'rosh-hashana-1' : 'rosh-hashana-2';
    case 'yom-kippur': return 'yom-kippur-shacharis';
    case 'sukkos': return d === 15 ? 'sukkos-1' : 'sukkos-2';
    case 'sukkos-chol-hamoed': case 'hoshana-rabba': return date.isShabbos ? 'shabbos-chol-hamoed-sukkos' : null;
    case 'shemini-atzeres': return 'shemini-atzeres';
    case 'shemini-atzeres-simchas-torah': case 'simchas-torah': return 'simchas-torah';
    case 'pesach': return `pesach-${d - 14}`;
    case 'pesach-chol-hamoed': return date.isShabbos ? 'shabbos-chol-hamoed-pesach' : null;
    case 'shavuos': return d === 6 ? 'shavuos-1' : 'shavuos-2';
    default: return null;
  }
}

/**
 * The haftara for `date`: on Shabbos the weekly or special haftara; on a Yom Tov or Tisha
 * B'Av its own (Shacharis). Returns null on days without a haftara at Shacharis.
 * For the Mincha haftara of a fast day, see {@link fastMinchaHaftara}.
 */
export function haftaraFor(date: HebrewDate, options: HaftaraOptions = {}): Haftara | null {
  const israel = options.israel ?? false;
  const minhag = options.minhag ?? 'ashkenaz';
  const hk = holidayKey(date, israel);
  if (hk) return special(hk, minhag);
  const events = holidaysOn(date, { israel });
  if (events.some((e) => e.id === 'tisha-bav')) return special('tisha-bav-shacharis', minhag);
  if (!date.isShabbos) return null;

  const has = (id: string) => events.some((e) => e.id === id);
  const rcToday = roshChodeshOn(date);
  const rcTomorrow = roshChodeshOn(date.next());
  const rcBoth = rcToday !== null && rcTomorrow !== null; // Shabbos 30th, Sunday 1st

  if (has('shabbos-shekalim')) return special(rcToday ? 'shekalim-rosh-chodesh' : rcTomorrow ? 'shekalim-machar-chodesh' : 'shekalim', minhag);
  if (has('shabbos-zachor')) return special('zachor', minhag);
  if (has('shabbos-parah')) return special('parah', minhag);
  if (has('shabbos-hachodesh')) return special(rcToday ? 'hachodesh-rosh-chodesh' : 'hachodesh', minhag);

  const chanukah = events.find((e) => e.id === 'chanukah');
  if (chanukah) {
    if (chanukah.day === 8 && !rcToday) return special('shabbos-chanukah-2', minhag);
    if (rcToday) return special(rcBoth ? 'shabbos-chanukah-rosh-chodesh-and-erev' : 'shabbos-chanukah-rosh-chodesh', minhag);
    return special('shabbos-chanukah-1', minhag);
  }
  if (has('shabbos-shuva')) return special('shabbos-shuva', minhag);

  // The three weeks and the seven of consolation.
  const av9 = new HebrewDate(date.year, Month.AV, 9);
  const chazon = av9.onOrBefore(6);
  const weeksBefore = (chazon.epochDays - date.epochDays) / 7;
  if (weeksBefore === 2) return special('affliction-1', minhag);
  if (weeksBefore === 1) return special(rcToday ? 'shabbos-rosh-chodesh-av' : 'affliction-2', minhag);
  const weeksAfter = (date.epochDays - av9.next().onOrAfter(6).epochDays) / 7;
  if (weeksAfter >= 0 && weeksAfter < 7 && date.year === av9.year) {
    const k = weeksAfter + 1;
    if (k === 3 && rcToday) return special('shabbos-rosh-chodesh-elul', minhag);
    if (k === 3 && rcTomorrow) return special('machar-chodesh-elul', minhag);
    if (k === 5 && roshChodeshOn(date.addDays(-14))) return special('ki-seitzei-after-rosh-chodesh-elul', minhag);
    return special(`consolation-${k}`, minhag);
  }

  if (has('shabbos-hagadol')) {
    const rule = options.shabbosHagadol ?? (minhag === 'chabad' ? 'erevPesachOnly' : minhag === 'teimani' ? 'never' : 'always');
    const erevPesach = date.month === Month.NISAN && date.day === 14;
    const read = rule === 'always' || (rule === 'erevPesachOnly' && erevPesach) || (rule === 'exceptErevPesach' && !erevPesach);
    if (read) return special('shabbos-hagadol', minhag);
  }

  if (rcToday) return special(rcBoth ? 'shabbos-rosh-chodesh-and-erev' : 'shabbos-rosh-chodesh', minhag);
  if (rcTomorrow && rcTomorrow.day === 1) return special('machar-chodesh', minhag);

  const reading = parshaFor(date, { israel });
  if (!reading.parsha) return null;
  const key = reading.parsha.join('-');
  if (minhag === 'ashkenaz' && key === 'kedoshim' && ownHaftaraDisplaced(date, 'acharei-mos', options)) {
    return make('acharei-mos', PARSHA_HAFTAROS['acharei-mos'], minhag);
  }
  return make(key, PARSHA_HAFTAROS[key], minhag);
}

/**
 * Whether the parsha read before `date` (skipping Shabbosos of Yom Tov) was `parsha`, read
 * alone, and its own haftara gave way to a special one (Machar Chodesh, Shabbos HaGadol,
 * Rosh Chodesh).
 */
function ownHaftaraDisplaced(date: HebrewDate, parsha: string, options: HaftaraOptions): boolean {
  const israel = options.israel ?? false;
  for (let d = date.addDays(-7), n = 0; n < 3; d = d.addDays(-7), n++) {
    const r = parshaFor(d, { israel });
    if (!r.parsha) continue;
    return r.parsha.join('-') === parsha && haftaraFor(d, options)?.key !== parsha;
  }
  return false;
}

/** The haftara at Mincha of a fast day (Ashkenaz and Chabad on all public fasts; Tisha B'Av for all who read it). */
export function fastMinchaHaftara(date: HebrewDate, options: HaftaraOptions = {}): Haftara | null {
  const minhag = options.minhag ?? 'ashkenaz';
  const events = holidaysOn(date, { israel: options.israel ?? false });
  // Communal fasts only (SA OC 566:1). Taanis Bechoros is the firstborn's fast (SA OC 470:1)
  // and has no reading.
  const fast = events.find((e) => e.flags.fast !== null && e.id !== 'taanis-bechoros');
  if (!fast || fast.id === 'yom-kippur') return fast ? special('yom-kippur-mincha', minhag) : null;
  if (fast.id === 'tisha-bav') return special('tisha-bav-mincha', minhag);
  const h = special('fast-day-mincha', minhag);
  return h.reference ? h : null;
}
