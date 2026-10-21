/**
 * Hebrew months.
 *
 * Months are numbered as the Torah counts them, from Nisan (Shemos 12:2; Rambam,
 * Hilchos Kiddush HaChodesh 1:1 ff.): Nisan = 1 … Elul = 6, Tishrei = 7 … Shevat = 11,
 * Adar = 12. In a leap year 12 is Adar I (Adar Rishon) and 13 is Adar II (Adar Sheni).
 * The year itself begins on 1 Tishrei.
 *
 * @packageDocumentation
 */

/** Month numbers. */
export const Month = {
  NISAN: 1,
  IYAR: 2,
  SIVAN: 3,
  TAMMUZ: 4,
  AV: 5,
  ELUL: 6,
  TISHREI: 7,
  CHESHVAN: 8,
  KISLEV: 9,
  TEVES: 10,
  SHEVAT: 11,
  /** Adar in a common year; Adar I in a leap year. */
  ADAR: 12,
  /** Adar I (leap years only). Same number as {@link Month.ADAR}. */
  ADAR_I: 12,
  /** Adar II (leap years only). */
  ADAR_II: 13,
} as const;

/** A month number, 1–13. */
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
