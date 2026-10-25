import type { Locale } from './types.js';

/** Sephardi / Israeli transliteration (Tevet, Shabbat). */
export const sephardi: Locale = {
  id: 'sephardi',
  base: 'sephardi',
  dir: 'ltr',
  numerals: 'arabic',
  names: {
    'month.1': 'Nisan',
    'month.2': 'Iyar',
    'month.3': 'Sivan',
    'month.4': 'Tamuz',
    'month.5': 'Av',
    'month.6': 'Elul',
    'month.7': 'Tishrei',
    'month.8': 'Cheshvan',
    'month.9': 'Kislev',
    'month.10': 'Tevet',
    'month.11': 'Shvat',
    'month.12': 'Adar',
    'month.12.leap': 'Adar Alef',
    'month.13.leap': 'Adar Bet',
    'weekday.0': 'Sunday',
    'weekday.1': 'Monday',
    'weekday.2': 'Tuesday',
    'weekday.3': 'Wednesday',
    'weekday.4': 'Thursday',
    'weekday.5': 'Friday',
    'weekday.6': 'Shabbat',
  },
};
