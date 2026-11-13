/**
 * Everyday words by built-in style (key: the part after `term.`). Override any of them through a
 * locale's `names` (`term.<key>`). Kept apart from the locales so an app that never asks for them
 * does not bundle them.
 */
export const TERMS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  he: {
    // Luach's own Hebrew: the weekday name and the label for the end of Shabbos. Yom Tov, Musaf,
    // Sefiras HaOmer, the menorah, "parsha" and "omer" are plain Hebrew, chosen for Luach, with no
    // written source yet.
    'shabbos': 'שבת',
    'motzaei-shabbos': 'מוצאי שבת',
    'shacharis': 'שחרית',
    'mincha': 'מנחה',
    'maariv': 'ערבית',
    'yom-tov': 'יום טוב',
    'musaf': 'מוסף',
    'sefiras-haomer': 'ספירת העומר',
    'menorah': 'מנורה',
    'parshas': 'פרשת',
    'parsha': 'פרשה',
    'omer': 'עומר',
    'erev-shabbos': 'ערב שבת',
    'erev-yom-tov': 'ערב יום טוב',
    'motzaei-yom-tov': 'מוצאי יום טוב',
    // The words of the day, as Yosef gave them (2026-11-13): everyday Hebrew.
    'today': 'היום',
    'tonight': 'הלילה',
    'tomorrow': 'מחר',
    'tomorrow-night': 'מחר בלילה',
    'night': 'לילה',
    'evening': 'ערב',
    'afternoon': 'אחר הצהריים',
  },
  ashkenazi: {
    'shabbos': 'Shabbos',
    'motzaei-shabbos': 'Motzei Shabbos',
    'yom-tov': 'Yom Tov',
    'shacharis': 'Shacharis',
    'mincha': 'Mincha',
    'maariv': 'Maariv',
    'musaf': 'Musaf',
    'sefiras-haomer': 'Sefiras HaOmer',
    'menorah': 'Menorah',
    'parshas': 'Parshas',
    'parsha': 'Parsha',
    'omer': 'Omer',
    'erev-shabbos': 'Erev Shabbos',
    'erev-yom-tov': 'Erev Yom Tov',
    'motzaei-yom-tov': 'Motzei Yom Tov',
    'today': 'Today',
    'tonight': 'Tonight',
    'tomorrow': 'Tomorrow',
    'tomorrow-night': 'Tomorrow night',
    'night': 'Night',
    'evening': 'Evening',
    'afternoon': 'Afternoon',
  },
  sephardi: {
    'shabbos': 'Shabbat',
    'yom-tov': 'Yom Tov',
    'shacharis': 'Shacharis',
    'mincha': 'Mincha',
    'maariv': 'Maariv',
    'musaf': 'Musaf',
    'sefiras-haomer': 'Sefirat HaOmer',
    'menorah': 'Menorah',
    'erev-shabbos': 'Erev Shabbat',
    'erev-yom-tov': 'Erev Yom Tov',
  },
  en: {
    'menorah': 'Menorah',
  },
};

/** Which table to try next, after a style's own, for a word it has none for. */
export const TERM_FALLBACK: Readonly<Record<string, string>> = { he: 'ashkenazi', sephardi: 'ashkenazi', en: 'sephardi' };
