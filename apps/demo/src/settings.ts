import { ashkenazi, en, he, sephardi, getPlace, type Locale, type Place } from 'luach';

export type LocaleId = 'ashkenazi' | 'sephardi' | 'he' | 'en';
export const LOCALES: Record<LocaleId, Locale> = { ashkenazi, sephardi, he, en };

/** A place chosen from the table, or the device's own position. */
export interface Where {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation: number;
  readonly timeZone: string;
  readonly name: string;
  readonly nameHe?: string;
  readonly israel: boolean;
}

export const DEFAULT_PLACE: Place = getPlace('jerusalem')!;

export interface Settings {
  where: Where;
  localeId: LocaleId;
  /** null = decide by the place. */
  israel: boolean | null;
}

/** Strings for the app's own interface (Luach supplies the calendar names). */
export const UI = {
  en: {
    today: 'Today', zmanim: 'Zmanim', week: 'Week', settings: 'Settings',
    parsha: 'Parsha', daf: 'Daf Yomi', omer: 'Omer', candles: 'Candle lighting', havdala: 'Havdala',
    fast: 'Fast', begins: 'begins', ends: 'ends', noEvents: 'No special day',
    place: 'Place', search: 'Search for a city', useLocation: 'Use my location', locating: 'Finding your location…',
    locationDenied: 'Location permission was not given. Choose a city instead.', language: 'Names',
    israel: 'Israel or diaspora', auto: 'By place', inIsrael: 'Israel', diaspora: 'Diaspora',
    opinion: 'Opinion', alos: 'Dawn', shema: 'Latest Shema', tzeis: 'Nightfall', doesNotOccur: 'does not occur today',
    disclaimer: 'Ask your rav. This app calculates; it does not rule.',
    credit: 'Built on Luach by Yosef Skolnick. City data: GeoNames (CC-BY 4.0).',
    privacy: 'Your location stays on this device.',
    source: 'Source',
  },
  he: {
    today: 'היום', zmanim: 'זמנים', week: 'השבוע', settings: 'הגדרות',
    parsha: 'פרשה', daf: 'דף יומי', omer: 'ספירת העומר', candles: 'הדלקת נרות', havdala: 'הבדלה',
    fast: 'תענית', begins: 'תחילה', ends: 'סיום', noEvents: 'יום רגיל',
    place: 'מקום', search: 'חיפוש עיר', useLocation: 'המיקום שלי', locating: 'מאתר מיקום…',
    locationDenied: 'לא ניתנה הרשאת מיקום. אפשר לבחור עיר.', language: 'שמות',
    israel: 'ארץ ישראל או חוץ לארץ', auto: 'לפי המקום', inIsrael: 'ארץ ישראל', diaspora: 'חוץ לארץ',
    opinion: 'שיטה', alos: 'עלות השחר', shema: 'סוף זמן קריאת שמע', tzeis: 'צאת הכוכבים', doesNotOccur: 'אינו חל היום',
    disclaimer: 'שאל את רבך. האפליקציה מחשבת; היא אינה פוסקת.',
    credit: 'מבוסס על Luach מאת יוסף סקולניק. נתוני ערים: GeoNames (CC-BY 4.0).',
    privacy: 'המיקום שלך נשאר במכשיר.',
    source: 'מקור',
  },
};
export type Strings = typeof UI.en;
