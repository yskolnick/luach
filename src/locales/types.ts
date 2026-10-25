/**
 * Name tables ("locales").
 *
 * A locale is a plain object mapping stable keys to display strings, e.g.
 * `{ 'month.7': 'Tishrei', 'weekday.6': 'Shabbos', 'holiday.pesach-1': 'Pesach I' }`.
 * Four ship with Luach: {@link he}, {@link ashkenazi}, {@link sephardi} and {@link en}.
 * To change a name, spread one and override keys:
 *
 * ```ts
 * const mine = { ...ashkenazi, 'holiday.pesach-1': 'Passover' };
 * ```
 *
 * Missing keys fall back to the `fallback` locale if set, then to the key itself.
 *
 * Keys:
 * - `month.N` (N = 1–13) and `month.12.leap` / `month.13.leap` for Adar I / Adar II;
 * - `weekday.N` (0 = Sunday … 6 = Shabbos);
 * - `holiday.<id>` for every holiday id;
 * - `parsha.<id>` for every parsha id;
 * - other `<module>.<id>` keys documented with each module.
 *
 * @packageDocumentation
 */

/** A table of names. */
export interface Locale {
  /** A short identifier, e.g. "he", "ashkenazi". */
  readonly id: string;
  /** Text direction of the strings. */
  readonly dir: 'rtl' | 'ltr';
  /** Whether numbers in dates are written in Hebrew letters (`'hebrew'`) or digits. */
  readonly numerals: 'hebrew' | 'arabic';
  /**
   * Which built-in style this locale is based on. Holiday, parsha and zman names live in
   * per-module tables (so apps that never show them do not bundle them) and are found by
   * this. Keys in `names` always win.
   */
  readonly base?: 'he' | 'ashkenazi' | 'sephardi' | 'en';
  /** Locale to consult for keys this one lacks. */
  readonly fallback?: Locale;
  /** The names. */
  readonly names: Readonly<Record<string, string>>;
}

/** Looks up `key` in `locale`, then its fallbacks; returns the key itself if none has it. */
export function lookup(locale: Locale, key: string): string {
  for (let l: Locale | undefined = locale; l; l = l.fallback) {
    const v = l.names[key];
    if (v !== undefined) return v;
  }
  return key;
}

/**
 * Looks up `key` (e.g. "holiday.pesach") in the locale chain, then in a module's name table
 * (`table[base][subkey]`), then returns the key itself.
 */
export function lookupIn(locale: Locale, key: string, table: Readonly<Record<string, Readonly<Record<string, string>>>>): string {
  for (let l: Locale | undefined = locale; l; l = l.fallback) {
    const v = l.names[key];
    if (v !== undefined) return v;
  }
  const sub = key.slice(key.indexOf('.') + 1);
  for (let l: Locale | undefined = locale; l; l = l.fallback) {
    const v = l.base ? table[l.base]?.[sub] : undefined;
    if (v !== undefined) return v;
  }
  return key;
}

/** A new locale: `base` with some names replaced or added. */
export function extendLocale(base: Locale, names: Record<string, string>, id?: string): Locale {
  return { ...base, id: id ?? base.id, names: { ...base.names, ...names } };
}
