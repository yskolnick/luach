/**
 * Formatting Hebrew dates for display.
 *
 * Bidirectional text: a Hebrew date dropped into left-to-right text can come out with its parts in the
 * wrong order, because the Unicode Bidirectional Algorithm (UAX #9) resolves the numbers and punctuation
 * around it using the surrounding direction. Wrapping the Hebrew in a right-to-left isolate (U+2067 … U+2069)
 * keeps it intact. The `isolate` option does that; it is off by default because the marks are invisible
 * and some systems (old terminals, some fonts) show them as boxes.
 *
 * @packageDocumentation
 */

import { dayOfWeek } from '../calendar/gregorian.js';
import { type HebrewDate, hebrewToDayNumber } from '../calendar/hebrew.js';
import { type GematriyaOptions, gematriya, hebrewYearNumeral } from './gematriya.js';
import { type NameStyle, type NameTable, monthName, weekdayName } from './names.js';

/** Right-to-left isolate and pop directional isolate (UAX #9). */
export const RLI = '⁧';
export const PDI = '⁩';

/** Wrap text in a right-to-left isolate. */
export function isolateRtl(text: string): string {
  return RLI + text + PDI;
}

export interface FormatOptions extends GematriyaOptions {
  /** `'he'` writes Hebrew letters; other styles write numbers and transliterated names. Default `'en'`. */
  readonly style?: NameStyle;
  /** Custom name table (overrides `style` for names). */
  readonly names?: NameTable;
  /** `'short'`: day and month. `'medium'` (default): day, month, year. `'long'`: weekday, day, month, year. */
  readonly length?: 'short' | 'medium' | 'long';
  /** Hebrew style only: write the year with its thousands (ה׳תשפ״ז). Default false. */
  readonly thousands?: boolean;
  /** Hebrew style only: wrap the result in a right-to-left isolate. Default false. */
  readonly isolate?: boolean;
}

/**
 * Format a Hebrew date.
 *
 * - `formatHebrewDate(d, { style: 'he' })` → `"י״ד אדר תשפ״ז"`
 * - `formatHebrewDate(d, { style: 'ashkenazi' })` → `"14 Adar 5787"`
 * - `formatHebrewDate(d, { style: 'he', length: 'long' })` → `"יום ראשון, י״ד אדר תשפ״ז"`
 */
export function formatHebrewDate(date: HebrewDate, options: FormatOptions = {}): string {
  const style = options.style ?? 'en';
  const names = options.names ?? style;
  const length = options.length ?? 'medium';
  const month = monthName(date.year, date.month, names);
  let text: string;
  if (style === 'he') {
    text = `${gematriya(date.day, options)} ${month}`;
    if (length !== 'short') text += ` ${hebrewYearNumeral(date.year, options)}`;
  } else {
    text = `${date.day} ${month}`;
    if (length !== 'short') text += ` ${date.year}`;
  }
  if (length === 'long') {
    const weekday = weekdayName(dayOfWeek(hebrewToDayNumber(date.year, date.month, date.day)), names);
    text = `${weekday}, ${text}`;
  }
  return style === 'he' && options.isolate ? isolateRtl(text) : text;
}
