import type { GeoLocation } from './calendar.js';

/**
 * A place for the day view and the functions that answer for a place: a GeoLocation,
 * optionally with a name, an Israel flag and a documented local candle-lighting custom (as on
 * a built-in `Place`).
 */
export type DayLocation = GeoLocation & {
  readonly israel?: boolean;
  readonly candleLighting?: { readonly minutes: number; readonly custom: string; readonly source: string };
};
