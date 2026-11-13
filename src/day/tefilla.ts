/**
 * The davening windows at an instant: Shacharis, Mincha, Maariv and, on Yom Kippur, Neilah, each
 * from the zmanim of the person's opinions, with when it opens and closes and how far it extends
 * after the fact (bedieved). Luach rules on nothing: every window says its sources.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { instantArg } from '../calendar/date-input.js';
import { civilDateAt } from '../time/zone.js';
import { holidaysOn } from '../holidays/holidays.js';
import { israelFor } from '../places/israel.js';
import { zmanimFor, type ZmanimOptions } from '../zmanim/day.js';
import type { DayLocation } from '../zmanim/day-location.js';
import type { Zman } from '../zmanim/zman.js';

/** One service's window (see {@link tefillaAt}). */
export interface TefillaWindow {
  readonly id: 'shacharis' | 'mincha' | 'maariv' | 'neilah';
  /** The Hebrew date of the service; for Maariv, the date whose night it is. */
  readonly date: HebrewDate;
  /** When it opens, from the start (lechatchila); null for Neilah, whose start ("when the sun is on the treetops") Luach has no time for. */
  readonly opens: Zman | null;
  /** When it closes, from the start (lechatchila). */
  readonly closes: Zman;
  /** How far it extends after the fact: earlier `opens`, later `closes`, or null where the sources give none. */
  readonly bedieved: { readonly opens: Zman | null; readonly closes: Zman | null };
  /** Mincha: Mincha Ketana, its main time by the Shulchan Aruch (233:1). */
  readonly preferredFrom?: Zman;
  /** From `opens` until `closes` (exact times); null where a time it needs does not occur. */
  readonly inProgress: boolean | null;
  /** From `bedieved.opens` (or `opens`) until `bedieved.closes` (or `closes`); null as above. */
  readonly bedievedInProgress: boolean | null;
  /** The rule, in words. */
  readonly opinion: string;
  /** Where it is found. */
  readonly source: string;
}

/** The davening windows at an instant (see {@link tefillaAt}). */
export interface TefillaAt {
  /** The service to daven now: the first window in progress from the start, else the first in progress after the fact, else null. */
  readonly service: TefillaWindow['id'] | null;
  /** Last night's Maariv while it is still open after the fact, today's Shacharis and Mincha, Neilah on Yom Kippur, tonight's Maariv. */
  readonly windows: readonly TefillaWindow[];
}

const SHACHARIS = {
  opinion: 'From sunrise until the end of the fourth hour; after the fact from dawn, once the east has lit up, and until midday',
  source: 'Shulchan Aruch OC 89:1 (with the Rema: not after midday); Mishna Berura 89:2 (before the east lights up it does not count even after the fact)',
};
const MINCHA = {
  opinion: 'From Mincha Gedola, its main time from Mincha Ketana, finished before sunset; after the fact after sunset until near nightfall',
  source: 'Shulchan Aruch OC 233:1 with the Rema; Mishna Berura 233:1 and 233:14 (finish before the sun is hidden; after the fact until about a quarter of an hour before nightfall)',
};
const MAARIV = {
  opinion: 'From nightfall until midnight; after the fact from plag hamincha, and until dawn',
  source: 'Shulchan Aruch OC 235:1 and 235:3 (the night Shema: from three small stars, until midnight, after the fact until dawn); Mishna Berura 235:34 (Maariv until dawn); Shulchan Aruch and Rema OC 233:1 (from plag hamincha)',
};
const NEILAH = {
  opinion: 'Begun while it is fully day, "when the sun is on the treetops", to finish near sunset; after the fact into the night',
  source: 'Shulchan Aruch OC 623:2; Mishna Berura 623:2',
};

/**
 * The davening windows at `instant`, by the person's opinions (`sunrise`, `alos`, `tefilla`,
 * `chatzos`, `minchaGedola`, `minchaKetana`, `plag`, `sunset`, `tzeis`, `chatzosHalayla`): which
 * service it is time for (`service`), and for each of the day's services when it opens, when it
 * closes and how far it extends after the fact, with its sources. Times compare exactly, as the
 * other at-instant functions do. Ask your rav.
 */
export function tefillaAt(instant: Date, location: DayLocation, options: ZmanimOptions = {}): TefillaAt {
  instant = instantArg(instant, 'tefillaAt');
  const t = instant.getTime();
  const z = zmanimFor(location, options);
  const date = HebrewDate.fromCivil(civilDateAt(t, location.timeZone));
  const at = (x: Zman | null) => x?.exact?.getTime() ?? null;
  // In the window from `from` to `to` (exact times). A start with no time (Neilah's, or one the sun
  // does not give) leaves the state unknown until the end has passed.
  const within = (from: Zman | null, to: Zman): boolean | null => {
    const a = at(from);
    const b = at(to);
    if (a !== null && t < a) return false;
    if (b !== null && t >= b) return false;
    return a !== null && b !== null ? true : null;
  };
  const make = (id: TefillaWindow['id'], d: HebrewDate, opens: Zman | null, closes: Zman, bOpens: Zman | null, bCloses: Zman | null, text: { opinion: string; source: string }, preferredFrom?: Zman): TefillaWindow =>
    Object.freeze({
      id,
      date: d,
      opens,
      closes,
      bedieved: Object.freeze({ opens: bOpens, closes: bCloses }),
      ...(preferredFrom ? { preferredFrom } : {}),
      inProgress: within(opens, closes),
      bedievedInProgress: within(bOpens ?? opens, bCloses ?? closes),
      ...text,
    });
  const maariv = (eve: HebrewDate): TefillaWindow => {
    const e = z.on(eve);
    const night = eve.next();
    return make('maariv', night, e.slot('tzeis'), e.slot('chatzosHalayla'), e.slot('plag'), z.on(night).slot('alos'), MAARIV);
  };
  const windows: TefillaWindow[] = [];
  const last = maariv(date.prev());
  const lastEnd = at(last.bedieved.closes);
  if (lastEnd === null || t < lastEnd) windows.push(last);
  const day = z.on(date);
  windows.push(make('shacharis', date, day.slot('sunrise'), day.slot('tefilla'), day.slot('alos'), day.slot('chatzos'), SHACHARIS));
  windows.push(make('mincha', date, day.slot('minchaGedola'), day.slot('sunset'), null, day.slot('tzeis'), MINCHA, day.slot('minchaKetana')));
  if (holidaysOn(date, { ...options, israel: israelFor(options.israel, location) }).some((e) => e.id === 'yom-kippur')) {
    windows.push(make('neilah', date, null, day.slot('sunset'), null, day.slot('tzeis'), NEILAH));
  }
  if (date.epochDays < MAX_DAYS) windows.push(maariv(date));
  const service = windows.find((w) => w.inProgress === true)?.id ?? windows.find((w) => w.bedievedInProgress === true)?.id ?? null;
  return Object.freeze({ service, windows: Object.freeze(windows) });
}
