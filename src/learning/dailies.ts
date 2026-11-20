/**
 * Dailies set by the date: Tehillim by the week and Shnayim Mikra. Each is a rule from its source;
 * nothing is read from a published table.
 *
 * @packageDocumentation
 */

import type { HebrewDate } from '../calendar/hebrew-date.js';
import { Month } from '../calendar/months.js';
import { gematriya } from '../text/gematriya.js';
import { hebrewDateArg } from '../calendar/date-input.js';
import type { LearningPortion } from './cycles.js';
import { HebrewDate as HebrewDateClass } from '../calendar/hebrew-date.js';
import { parshaFor, PARSHIYOS, type ParshaId } from '../parsha/parsha.js';
import { TEHILLIM_WEEK } from './dailies-data.js';
import { ALIYOS } from './chumash-data.js';

const gp = (n: number) => gematriya(n, { punctuate: false });

// ------------------------------------------------------------ Tehillim by the week

/** Tehillim by the day of the week: the traditional seven portions, Sunday 1–29 to Shabbos 120–150. */
export function tehillimByWeek(date: HebrewDate): LearningPortion {
  date = hebrewDateArg(date, 'tehillimByWeek');
  const [from, to] = TEHILLIM_WEEK[date.dayOfWeek]!;
  return { cycle: 'tehillim-week', cycleNumber: date.year, day: date.dayOfWeek + 1, length: 7, text: `Tehillim ${from}–${to}`, textHe: `תהילים ${gp(from)}–${gp(to)}` };
}

// ------------------------------------------------------------ The verses of a parsha

const BOOKS: readonly (readonly [string, string])[] = [['Bereishis', 'בראשית'], ['Shemos', 'שמות'], ['Vayikra', 'ויקרא'], ['Bamidbar', 'במדבר'], ['Devarim', 'דברים']];

/** Parshiyos `first` to `last` (indexes in PARSHIYOS, one book), from the first aliyah's start to the last one's end. */
function parshaRange(first: number, last: number): { text: string; textHe: string } {
  const [book, a] = ALIYOS[first]!;
  const [, z] = ALIYOS[last]!;
  const [c1, v1] = a.split(',')[0]!.split('-')[0]!.split(':').map(Number) as [number, number];
  const [c2, v2] = z.split(',')[6]!.split('-')[1]!.split(':').map(Number) as [number, number];
  const [en, he] = BOOKS[book]!;
  return { text: `${en} ${c1}:${v1}–${c2}:${v2}`, textHe: `${he} ${gp(c1)}:${gp(v1)}–${gp(c2)}:${gp(v2)}` };
}

// ------------------------------------------------------------ Shnayim Mikra

/** The week's Shnayim Mikra: the parsha (or joined parshiyos) and its verses. */
export interface ShnayimMikraPortion extends LearningPortion {
  readonly parsha: readonly ParshaId[];
  /**
   * The Shabbos on which the congregation reads it, the time to finish by: "מצוה מן המובחר שישלים
   * אותה קודם שיאכל בשבת" (SA OC 285:4). Null for Vezos HaBeracha, read on Hoshana Rabba (MB 285:18).
   */
  readonly shabbos: HebrewDate | null;
}

/**
 * Shnayim Mikra v'Echad Targum: the parsha of the week, twice in the text and once in Targum (or
 * Rashi, SA OC 285:2), for `date`. It is the parsha the congregation reads on the coming Shabbos
 * (285:1, "פרשת אותו שבוע"); a Yom Tov's own reading is not needed (285:7), so in a week whose
 * Shabbos is Yom Tov it is the next parsha read on Shabbos. From that Shabbos's Mincha on, the next
 * week's (MB 285:7, 10); Luach, given a date, gives the coming Shabbos's parsha on Shabbos too.
 * After the year's last Shabbos parsha, Vezos HaBeracha, to read on Hoshana Rabba (MB 285:18).
 *
 * When it may be read: from Sunday (285:3; from Shabbos Mincha, MB 285:7); best by the Shabbos meal
 * (285:4); after it, until Mincha, and some say until Wednesday or until Simchas Torah (285:4). No
 * split by day is given: the sources set none (the Gra read part of it each day and finished on
 * Friday, MB 285:8). The parsha is the one read in Israel or the diaspora, as `israel` says.
 */
export function shnayimMikra(date: HebrewDate, options: { israel?: boolean } = {}): ShnayimMikraPortion | null {
  date = hebrewDateArg(date, 'shnayimMikra');
  const israel = options.israel ?? false;
  const simchasTorah = new HebrewDateClass(date.year, Month.TISHREI, israel ? 22 : 23);
  const week = { cycle: 'shnayim-mikra', cycleNumber: date.year, day: date.dayOfWeek + 1, length: 7 };
  let reading = parshaFor(date, { israel });
  for (let i = 0; i < 4 && reading && reading.parsha === null; i++) reading = parshaFor(reading.date.addDays(7), { israel });
  if (!reading?.parsha) return null;
  const ids = reading.parsha;
  if (ids[0] === 'bereshis' && date.month === Month.TISHREI && date.day <= simchasTorah.day) {
    return { ...week, parsha: ['vezos-haberacha'], shabbos: null, ...parshaRange(53, 53) };
  }
  const first = PARSHIYOS.indexOf(ids[0]!);
  const last = PARSHIYOS.indexOf(ids[ids.length - 1]!);
  return { ...week, parsha: ids, shabbos: reading.date, ...parshaRange(first, last) };
}
