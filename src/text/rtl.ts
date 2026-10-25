/**
 * Bidirectional-text safety.
 *
 * A Hebrew date dropped into left-to-right text can display in the wrong order: the
 * Unicode bidi algorithm sees "14 Adar" or digits next to Hebrew letters and reorders
 * the neutral characters (spaces, punctuation, numbers) around them, so "י״ד אדר
 * תשפ״ז, 2027" may render with the parts swapped. Wrapping the Hebrew in a Unicode
 * directional isolate (U+2067 RIGHT-TO-LEFT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE)
 * makes it one opaque right-to-left unit that cannot mix with its surroundings.
 *
 * Isolates are invisible but are real characters: they count in string length and
 * appear when text is compared or copied. That is why they are opt-in.
 *
 * @packageDocumentation
 */

/** U+2067 RIGHT-TO-LEFT ISOLATE. */
export const RLI = '⁧';
/** U+2066 LEFT-TO-RIGHT ISOLATE. */
export const LRI = '⁦';
/** U+2068 FIRST STRONG ISOLATE. */
export const FSI = '⁨';
/** U+2069 POP DIRECTIONAL ISOLATE. */
export const PDI = '⁩';

/** Wraps `text` in a directional isolate. `dir` defaults to right-to-left. */
export function isolate(text: string, dir: 'rtl' | 'ltr' | 'auto' = 'rtl'): string {
  const open = dir === 'rtl' ? RLI : dir === 'ltr' ? LRI : FSI;
  return open + text + PDI;
}

/** Removes directional isolates and marks (LRM, RLM, ALM) from `text`. */
export function stripBidiControls(text: string): string {
  return text.replace(/[⁦-⁩‎‏؜]/g, '');
}
