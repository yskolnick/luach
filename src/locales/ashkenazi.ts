import type { Locale } from './types';

/** Ashkenazi transliteration (Teves, Shabbos). */
export const ashkenazi: Locale = {
  id: 'ashkenazi',
  dir: 'ltr',
  numerals: 'arabic',
  names: {
    'month.1': 'Nissan',
    'month.2': 'Iyar',
    'month.3': 'Sivan',
    'month.4': 'Tammuz',
    'month.5': 'Av',
    'month.6': 'Elul',
    'month.7': 'Tishrei',
    'month.8': 'Cheshvan',
    'month.9': 'Kislev',
    'month.10': 'Teves',
    'month.11': 'Shevat',
    'month.12': 'Adar',
    'month.12.leap': 'Adar I',
    'month.13.leap': 'Adar II',
    'weekday.0': 'Sunday',
    'weekday.1': 'Monday',
    'weekday.2': 'Tuesday',
    'weekday.3': 'Wednesday',
    'weekday.4': 'Thursday',
    'weekday.5': 'Friday',
    'weekday.6': 'Shabbos',
  },
};
