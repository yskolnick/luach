/**
 * Every name Luach gives, as a list: for a settings screen that lets a person change them one by
 * one, and for reading their changes back.
 *
 * @packageDocumentation
 */

import { he } from './he.js';
import { ashkenazi } from './ashkenazi.js';
import { sephardi } from './sephardi.js';
import { en } from './en.js';
import { lookup, lookupIn, type Locale } from './types.js';
import { termName } from './terms.js';
import { NAMES as HOLIDAY_NAMES } from '../holidays/names-data.js';
import { NAMES as ZMAN_NAMES } from '../zmanim/labels-data.js';
import { ZMANIM } from '../zmanim/opinions.js';
import { NAMES as PARSHA_NAMES } from '../parsha/names-data.js';
import type { TermKey } from './terms.js';

/** One changeable name: its key, which kind of name it is, and the name now. */
export interface NameEntry {
  /** The key to give `extendLocale`, e.g. `month.10`, `holiday.pesach.1`, `zman.sunrise`, `term.shabbos`. */
  readonly key: string;
  /** The kind of name. */
  readonly group: 'month' | 'weekday' | 'holiday' | 'zman' | 'parsha' | 'term';
  /** The name the locale gives. A holiday name may hold `{n}` (the day's number) or `{month}`; those are filled in when the name is shown. */
  readonly name: string;
  /** Whether the locale gives a different name from the built-in set it is based on. */
  readonly changed: boolean;
}

/**
 * Every everyday word with a name of its own, in the order of `termName`'s keys; the type makes the
 * compiler check none is missing. `havdala` and `candle-lighting` are the zmanim's names (`zman.*`).
 */
const termKeys = (): string[] => Object.keys({
  'shabbos': 0, 'motzaei-shabbos': 0, 'yom-tov': 0, 'shacharis': 0,
  'mincha': 0, 'maariv': 0, 'musaf': 0, 'sefiras-haomer': 0, 'menorah': 0,
  'parshas': 0, 'parsha': 0, 'omer': 0, 'erev-shabbos': 0, 'erev-yom-tov': 0, 'motzaei-yom-tov': 0,
  'today': 0, 'tonight': 0, 'tomorrow': 0, 'tomorrow-night': 0, 'night': 0, 'evening': 0, 'afternoon': 0,
} satisfies Record<Exclude<TermKey, 'havdala' | 'candle-lighting'>, 0>);

/** The keys that were once a `term.*` name: one name each, now the zman's. */
const ZMAN_TERMS = new Set(['term.havdala', 'term.candle-lighting']);

const builtIn = (base: string | undefined): Locale => (base === 'ashkenazi' ? ashkenazi : base === 'sephardi' ? sephardi : base === 'en' ? en : he);

/** [key, group] in listing order. Months run Nisan first, as Luach numbers them; Adar I and Adar II are the leap-year Adar. */
function keys(): readonly (readonly [string, NameEntry['group']])[] {
  const out: (readonly [string, NameEntry['group']])[] = [];
  for (let m = 1; m <= 12; m++) out.push([`month.${m}`, 'month']);
  out.push(['month.12.leap', 'month'], ['month.13.leap', 'month']);
  for (let d = 0; d <= 6; d++) out.push([`weekday.${d}`, 'weekday']);
  for (let d = 0; d <= 6; d++) out.push([`weekday.${d}.short`, 'weekday']);
  for (const k of Object.keys(HOLIDAY_NAMES.he!)) out.push([`holiday.${k}`, 'holiday']);
  for (const k of Object.keys(ZMANIM)) out.push([`zman.${k}`, 'zman']);
  for (const k of Object.keys(PARSHA_NAMES.he!)) out.push([`parsha.${k}`, 'parsha']);
  for (const k of termKeys()) out.push([`term.${k}`, 'term']);
  return out;
}

function nameIn(locale: Locale, key: string, group: NameEntry['group']): string {
  switch (group) {
    case 'month':
    case 'weekday': return lookup(locale, key);
    case 'holiday': return lookupIn(locale, key, HOLIDAY_NAMES);
    case 'zman': return lookupIn(locale, key, ZMAN_NAMES);
    case 'parsha': return lookupIn(locale, key, PARSHA_NAMES);
    case 'term': return termName(key.slice(5) as TermKey, locale);
  }
}

const PLACEHOLDER = /\{\w+\}/g;
const placeholders = (name: string): Set<string> => new Set(name.match(PLACEHOLDER) ?? []);

/** The placeholders (`{n}`, `{month}`) the built-in names of `key` hold, across the built-in sets. */
function placeholdersOf(key: string): Set<string> {
  const group = keys().find(([k]) => k === key)![1];
  const out = new Set<string>();
  for (const l of [he, ashkenazi, sephardi, en]) for (const p of placeholders(nameIn(l, key, group))) out.add(p);
  return out;
}

/** Why `name` cannot be the name of `key` because of its placeholders, or null. */
function placeholderProblem(key: string, name: string): string | null {
  const want = placeholdersOf(key);
  const have = placeholders(name);
  for (const p of want) if (!have.has(p)) return `keeps ${p}: the name must contain ${p}, where the number or month is shown`;
  for (const p of have) if (!want.has(p)) return `has ${p}, which this name does not use: remove it`;
  return null;
}

/** Every key Luach reads a name from, for {@link nameEntries} and {@link parseNames}. */
export function nameKeys(): ReadonlySet<string> {
  return new Set(keys().map(([k]) => k));
}

/**
 * Every name Luach gives in `locale` (default `he`), one entry per key the name functions read
 * (`monthName`, `weekdayName`, `holidayName`, `zmanName`, `parshaName`, `termName`), with the name
 * the locale gives now. `changed` is true when that name differs from the built-in set the locale
 * is based on, which is what a person's changes (see `extendLocale`) do.
 *
 * Order: by group (months, weekdays, holidays, zmanim, parshiyos, everyday words). Months run Nisan
 * first, as Luach numbers them, then the leap-year Adar I and Adar II (`month.12.leap`,
 * `month.13.leap`); in a leap year those two replace `month.12`. Holidays follow the order of
 * Luach's name table: the days of the Israeli calendar first, then the year from Rosh Hashana.
 * Zmanim follow the catalogue, parshiyos the reading order (then the separator of a joined
 * reading, `parsha.join`), everyday words the order of `termName`'s keys.
 *
 * @example nameEntries(ashkenazi).find((e) => e.key === 'term.shabbos') // { key: 'term.shabbos', group: 'term', name: 'Shabbos', changed: false }
 */
export function nameEntries(locale: Locale = he): readonly NameEntry[] {
  const pristine = builtIn(locale.base);
  return Object.freeze(
    keys().map(([key, group]) => {
      const name = nameIn(locale, key, group);
      return Object.freeze({ key, group, name, changed: name !== nameIn(pristine, key, group) });
    }),
  );
}

/** What {@link parseNames} found. `value` always holds the valid names, so an app can carry on with them. */
export type ParsedNames =
  | { readonly ok: true; readonly value: Readonly<Record<string, string>> }
  | {
      readonly ok: false;
      readonly value: Readonly<Record<string, string>>;
      readonly problems: readonly { readonly key: string; readonly value: unknown; readonly problem: string }[];
    };

/**
 * Reads a person's changed names from storage or a request: plain JSON in (an object of
 * `{ key: name }`), the valid names out, ready for `extendLocale`. A key must be one of the keys
 * {@link nameEntries} lists; a name must be a string that is not empty and has no control
 * characters (no line breaks or tabs). A name that has a placeholder (`{n}`, `{month}`) in its
 * built-in form must keep it, and a name must not add one the key does not have. Anything else is left out of `value` and reported in
 * `problems`; the rest is kept. `null` or `undefined` is no changes. Never throws.
 */
export function parseNames(json: unknown): ParsedNames {
  const value: Record<string, string> = {};
  const problems: { key: string; value: unknown; problem: string }[] = [];
  if (json === null || json === undefined) return { ok: true, value };
  if (typeof json !== 'object' || Array.isArray(json)) {
    return { ok: false, value, problems: [{ key: '', value: json, problem: 'names must be an object' }] };
  }
  const known = nameKeys();
  let pairs: [string, unknown][];
  try {
    pairs = Object.entries(json as Record<string, unknown>);
  } catch {
    return { ok: false, value, problems: [{ key: '', value: json, problem: 'names could not be read' }] };
  }
  for (const [key, v] of pairs) {
    if (ZMAN_TERMS.has(key)) problems.push({ key, value: v, problem: `is the same name as zman.${key.slice(5)}: change that key instead` });
    else if (!known.has(key)) problems.push({ key, value: v, problem: 'is not a name Luach knows' });
    else if (typeof v !== 'string') problems.push({ key, value: v, problem: 'must be text' });
    else if (v === '') problems.push({ key, value: v, problem: 'must not be empty' });
    else if (/[\u0000-\u001f\u007f-\u009f]/u.test(v)) problems.push({ key, value: v, problem: 'must not contain control characters' });
    else {
      const bad = placeholderProblem(key, v);
      if (bad) problems.push({ key, value: v, problem: bad });
      else value[key] = v;
    }
  }
  return problems.length ? { ok: false, value, problems } : { ok: true, value };
}
