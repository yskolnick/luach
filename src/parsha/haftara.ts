/**
 * The haftara for a day, by custom (references only).
 *
 * Order of precedence on a Shabbos (SA OC 425, 428:8, 684, 685; Rema there; Mishna Berura):
 * 1. Yom Tov and Chol Hamoed: the festival's haftara.
 * 2. Shabbos Shuva; the three of affliction (after 17 Tammuz) and seven of consolation (after Tisha B'Av).
 *    On Rosh Chodesh Av and Rosh Chodesh Elul the customs differ; see {@link HaftaraOptions}.
 * 3. The four parshiyos (Shekalim, Zachor, Parah, HaChodesh) and Chanukah, even on Rosh Chodesh.
 * 4. Shabbos HaGadol (by custom).
 * 5. Rosh Chodesh, then Machar Chodesh (the Shabbos before a Sunday Rosh Chodesh).
 * 6. The parsha's own haftara; for two parshiyos read together, the second's, with the exceptions in the data.
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @packageDocumentation
 */

import { type DayNumber, dayOfWeek } from '../calendar/gregorian.js';
import { AV, ELUL, NISAN, SIVAN, TAMMUZ, TISHREI, dayNumberToHebrew, hebrewToDayNumber } from '../calendar/hebrew.js';
import { holidaysOn } from '../holidays/holidays.js';
import { type Location, festivalReading, parshaOn } from './parsha.js';
import { AFFLICTION, COMBINED_HAFTARA, CONSOLATION, type Minhag, PARSHA_HAFTARA, SPECIAL_HAFTARA } from './haftara-data.js';

export type { Minhag } from './haftara-data.js';

export interface HaftaraOptions {
  /**
   * Rosh Chodesh Av on Shabbos: `'affliction'` (Shim'u, Mishna Berura 425:8 citing the Gra; default) or
   * `'rosh-chodesh'` (Isaiah 66, the other view in the Rema OC 425:1).
   */
  readonly roshChodeshAv?: 'affliction' | 'rosh-chodesh';
  /**
   * Rosh Chodesh Elul on Shabbos (Re'eh): `'rema'` (Isaiah 66; Re'eh's haftara added the next week; default for
   * Ashkenaz and Chabad) or `'mechaber'` (Re'eh's consolation; default for Sephardi and Teimani). SA OC 425:1.
   */
  readonly roshChodeshElul?: 'rema' | 'mechaber';
  /**
   * Shabbos HaGadol: `'always'` (default except Chabad), `'erev-pesach-only'` (only when it is Erev Pesach; Chabad
   * default) or `'not-erev-pesach'` (every year except then; the Gra's custom).
   */
  readonly shabbosHagadol?: 'always' | 'erev-pesach-only' | 'not-erev-pesach';
  /**
   * Ashkenaz Shabbos Shuva: what follows Hosea 14 (Mishna Berura 428:23). `'dagul-mervava'` (default): Micah with
   * Vayelech, Joel with Haazinu; or always `'micah'`, `'joel'`, or `'both'` (the Prague custom).
   */
  readonly shuvaAddition?: 'dagul-mervava' | 'micah' | 'joel' | 'both';
}

/** A haftara and why it was chosen. */
export interface Haftara {
  /** The reference, or null where the custom reads none or no source was found. */
  readonly reference: string | null;
  /** Why: `'parsha'`, `'rosh-chodesh'`, `'machar-chodesh'`, `'shekalim'`, `'affliction-2'`, `'pesach-1'`… */
  readonly reason: string;
  /** For `'parsha'`: the parsha ids. */
  readonly parsha?: readonly string[];
  /** Shacharis or Mincha (fast days and Yom Kippur have a Mincha haftara). */
  readonly service: 'shacharis' | 'mincha';
  /** Extra reading appended, e.g. Re'eh's haftara on Ki Seitzei after Rosh Chodesh Elul (Rema). */
  readonly appended?: string;
}

const SHABBOS = 6;

function special(id: string, minhag: Minhag): string | null {
  const s = SPECIAL_HAFTARA[id];
  return s ? s[minhag] : null;
}

/** First Shabbos on or after `n`. */
const onOrAfter = (n: DayNumber) => n + ((SHABBOS - dayOfWeek(n) + 7) % 7);
/** Last Shabbos on or before `n`. */
const onOrBefore = (n: DayNumber) => n - ((dayOfWeek(n) - SHABBOS + 7) % 7);

/** Which of the three (affliction) or seven (consolation) weeks this Shabbos is, or null. */
function threeOrSeven(shabbos: DayNumber, year: number): { kind: 'affliction' | 'consolation'; index: number } | null {
  const chazon = onOrBefore(hebrewToDayNumber(year, AV, 9));
  const k = (chazon - shabbos) / 7;
  if (k >= 0 && k <= 2) return { kind: 'affliction', index: 2 - k };
  const nachamu = onOrAfter(hebrewToDayNumber(year, AV, 10));
  const c = (shabbos - nachamu) / 7;
  if (c >= 0 && c <= 6) return { kind: 'consolation', index: c };
  return null;
}

/** Rosh Chodesh: the 30th of a month, or the 1st of any month but Tishrei (which is Rosh Hashana). */
function isRoshChodesh(n: DayNumber): boolean {
  const { month, day } = dayNumberToHebrew(n);
  return day === 30 || (day === 1 && month !== TISHREI);
}

/** The haftara read on Shabbos `shabbos` (a Shabbos day number). */
export function shabbosHaftara(shabbos: DayNumber, location: Location, minhag: Minhag, options: HaftaraOptions = {}): Haftara {
  if (dayOfWeek(shabbos) !== SHABBOS) throw new RangeError('shabbosHaftara needs a Shabbos');
  const h = dayNumberToHebrew(shabbos);
  const out = (reason: string, reference: string | null, extra: Partial<Haftara> = {}): Haftara => ({ reference, reason, service: 'shacharis', ...extra });

  // 1. Festivals.
  const fest = festivalReading(shabbos, location);
  if (fest) return festivalHaftara(shabbos, location, minhag)[0] as Haftara;

  // 2. Shuva, affliction, consolation.
  if (h.month === TISHREI && h.day >= 3 && h.day <= 9) {
    if (minhag !== 'ashkenaz') return out('shuva', special('shuva', minhag));
    // Ashkenaz additions vary (Mishna Berura 428:23). Dagul Mervava: with Vayelech add Micah, with Haazinu add Joel.
    const parsha = parshaOn(shabbos, location).parsha ?? [];
    const add = options.shuvaAddition ?? 'dagul-mervava';
    const micah = 'Micah 7:18-20';
    const joel = 'Joel 2:15-27';
    const ending = add === 'micah' ? [micah] : add === 'joel' ? [joel] : add === 'both' ? [micah, joel] : parsha.includes('vayelech') ? [micah] : [joel];
    return out('shuva', ['Hosea 14:2-10', ...ending].join('; '));
  }
  const ts = threeOrSeven(shabbos, h.year);
  if (ts?.kind === 'affliction') {
    const rcAv = isRoshChodesh(shabbos) && (h.month === AV || h.month === TAMMUZ);
    if (rcAv && options.roshChodeshAv === 'rosh-chodesh') return out('rosh-chodesh', special('rosh-chodesh', minhag));
    return out(`affliction-${ts.index + 1}`, AFFLICTION[minhag][ts.index] ?? null);
  }
  if (ts?.kind === 'consolation') {
    const rcElul = isRoshChodesh(shabbos) && (h.month === AV || h.month === ELUL);
    const custom = options.roshChodeshElul ?? (minhag === 'ashkenaz' || minhag === 'chabad' ? 'rema' : 'mechaber');
    if (rcElul && custom === 'rema') return out('rosh-chodesh', special('rosh-chodesh', minhag));
    // Re'eh (the 3rd consolation) on Rosh Chodesh Elul is displaced (Rema); its haftara is added to Ki Seitzei (the 5th).
    // Rosh Chodesh Elul on Shabbos always falls on the 3rd week, since Tisha B'Av is never on Friday.
    const prevWasRoshChodeshElul = ts.index === 4 && custom === 'rema' && isRoshChodesh(shabbos - 14);
    const base = CONSOLATION[ts.index] ?? null;
    if (prevWasRoshChodeshElul && base) {
      return out(`consolation-${ts.index + 1}`, `${base}; ${CONSOLATION[2]}`, { appended: CONSOLATION[2] });
    }
    return out(`consolation-${ts.index + 1}`, base);
  }

  // 3. The four parshiyos and Chanukah.
  const ids = holidaysOn(shabbos, { location }).map((x) => x.id);
  for (const p of ['shabbos-shekalim', 'shabbos-zachor', 'shabbos-parah', 'shabbos-hachodesh'] as const) {
    if (ids.includes(p)) return out(p.replace('shabbos-', ''), special(p.replace('shabbos-', ''), minhag));
  }
  const chanukah = holidaysOn(shabbos, { location }).find((x) => x.id === 'chanukah');
  if (chanukah) {
    // A second Shabbos of Chanukah exists only when the first day is Shabbos; it is then day 8.
    const second = chanukah.day === 8;
    return out(second ? 'chanukah-2' : 'chanukah-1', special(second ? 'chanukah-2' : 'chanukah-1', minhag));
  }

  // 4. Shabbos HaGadol.
  if (ids.includes('shabbos-hagadol')) {
    const custom = options.shabbosHagadol ?? (minhag === 'chabad' ? 'erev-pesach-only' : 'always');
    const erevPesach = h.month === NISAN && h.day === 14;
    if (custom === 'always' || (custom === 'erev-pesach-only' && erevPesach) || (custom === 'not-erev-pesach' && !erevPesach)) {
      const ref = special('hagadol', minhag);
      if (ref) return out('hagadol', ref);
    }
  }

  // 5. Rosh Chodesh, Machar Chodesh (tomorrow is the first day of Rosh Chodesh).
  if (isRoshChodesh(shabbos)) return out('rosh-chodesh', special('rosh-chodesh', minhag));
  if (isRoshChodesh(shabbos + 1)) return out('machar-chodesh', special('machar-chodesh', minhag));

  // 6. The parsha.
  const r = parshaOn(shabbos, location);
  const parsha = r.parsha ?? [];
  if (parsha.length === 2) return out('parsha', COMBINED_HAFTARA[`${parsha[0]}-${parsha[1]}`]?.[minhag] ?? null, { parsha });
  if (minhag === 'ashkenaz' && parsha[0] === 'kedoshim') {
    // If Acharei Mos's own haftara (Amos 9) was displaced (e.g. by Machar Chodesh), it is read on Kedoshim instead
    // (Mishna Berura 428:26, R. Akiva Eiger).
    const prev = shabbosHaftara(shabbos - 7, location, minhag, options);
    if (prev.reason !== 'parsha' && prev.reason !== 'festival') return out('parsha', PARSHA_HAFTARA['acharei-mos']?.ashkenaz ?? null, { parsha });
  }
  return out('parsha', PARSHA_HAFTARA[parsha[0] as string]?.[minhag] ?? null, { parsha });
}

/** Haftaros on a Yom Tov, Yom Kippur, Tisha B'Av or a fast day; empty on other weekdays. */
function festivalHaftara(n: DayNumber, location: Location, minhag: Minhag): Haftara[] {
  const h = dayNumberToHebrew(n);
  const israel = location === 'israel';
  const sh = (id: string): Haftara => ({ reference: special(id, minhag), reason: id, service: 'shacharis' });
  if (h.month === TISHREI) {
    if (h.day === 1) return [sh('rosh-hashana-1')];
    if (h.day === 2) return [sh('rosh-hashana-2')];
    if (h.day === 10) return [sh('yom-kippur-shacharis'), { reference: special('yom-kippur-mincha', minhag), reason: 'yom-kippur-mincha', service: 'mincha' }];
    if (h.day === 15) return [sh('sukkos-1')];
    if (h.day === 16 && !israel) return [sh('sukkos-2')];
    if (h.day >= 16 && h.day <= 21) return dayOfWeek(n) === SHABBOS ? [sh('shabbos-chol-hamoed-sukkos')] : [];
    if (h.day === 22) return [sh(israel ? 'simchas-torah' : 'shemini-atzeres')];
    if (h.day === 23 && !israel) return [sh('simchas-torah')];
  }
  if (h.month === NISAN) {
    if (h.day === 15) return [sh('pesach-1')];
    if (h.day === 16 && !israel) return [sh('pesach-2')];
    if (h.day >= 16 && h.day <= 20) return dayOfWeek(n) === SHABBOS ? [sh('shabbos-chol-hamoed-pesach')] : [];
    if (h.day === 21) return [sh('pesach-7')];
    if (h.day === 22 && !israel) return [sh('pesach-8')];
  }
  if (h.month === SIVAN) {
    if (h.day === 6) return [sh('shavuos-1')];
    if (h.day === 7 && !israel) return [sh('shavuos-2')];
  }
  const fast = holidaysOn(n, { location }).find((x) => x.fast && x.id !== 'yom-kippur');
  if (fast?.id === 'tisha-beav') {
    return [sh('tisha-bav-shacharis'), { reference: special('tisha-bav-mincha', minhag), reason: 'tisha-bav-mincha', service: 'mincha' }];
  }
  if (fast && fast.category === 'fast') return [{ reference: special('fast-mincha', minhag), reason: 'fast-mincha', service: 'mincha' }];
  return [];
}

/**
 * Every haftara read on a civil date: Shabbos, Yom Tov, Yom Kippur (Shacharis and Mincha), Tisha B'Av, and Mincha
 * of a public fast. Empty on days without one.
 */
export function haftaraOn(dayNumber: DayNumber, location: Location, minhag: Minhag, options: HaftaraOptions = {}): Haftara[] {
  if (dayOfWeek(dayNumber) === SHABBOS) {
    const main = shabbosHaftara(dayNumber, location, minhag, options);
    // Yom Kippur on Shabbos also has its Mincha haftara.
    const extra = festivalHaftara(dayNumber, location, minhag).filter((x) => x.service === 'mincha');
    return [main, ...extra];
  }
  return festivalHaftara(dayNumber, location, minhag);
}
