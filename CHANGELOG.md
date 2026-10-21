# Changelog

All notable changes for users of the `luach` package. This project follows
[Semantic Versioning](https://semver.org/).

## Unreleased

### Added
- Hebrew ↔ Gregorian conversion for Hebrew years 1–9999 (`HebrewDate`), computed from
  the Rambam's rules; molad; leap years; year types; month and year lengths.
- Yahrzeit and birthday dates (`anniversary`, `barMitzvahDate`) with a choice of customs.
- Hebrew numerals (`gematriya`, `parseGematriya`).
- Names in Hebrew, Ashkenazi, Sephardi and English (`he`, `ashkenazi`, `sephardi`, `en`),
  pluggable; `formatHebrewDate`; opt-in Unicode isolates for right-to-left text.
- Holidays, fasts and special days for Israel and the diaspora (`holidaysForYear`,
  `holidaysOn`, `holidaysBetween`, `nextHoliday`), with filter flags and optional
  BeHaB, Yom Kippur Katan and modern Israeli days; names in all four locales (`holidayName`).
- Omer day, count text (three nuschaos) and sefirah; v'sein tal umatar and mashiv haruach
  seasons; Birkas HaChama; Kiddush Levana times; Tachanun, Hallel and other tefillah changes.
- Weekly parsha for Israel and the diaspora (`parshaFor`, `readingCycle`, `parshaName`),
  Pirkei Avos chapters, Shabbos Shira, Shovavim, and Daf Yomi (`dafYomi`).
- Zmanim (`ZmanimCalendar`): NOAA solar calculator with a second (USNO) algorithm, sea
  level and elevation, and a named function for every opinion, each returning a `Zman`
  with its opinion, source and rounding; `null` with a reason when the sun does not reach
  an angle; optional high-latitude fallbacks; labels in Hebrew and English (`zmanLabel`).
- `hebrewDateAt`, `fastTimes` and `isMelachaForbiddenAt` for zmanim-aware questions.
- Haftaros by minhag (Ashkenaz, Sephardi, Chabad, Teimani where sourced) with the special
  haftaros and their precedence (`haftaraFor`, `fastMinchaHaftara`).
- Learning cycles: Yerushalmi Yomi (Vilna), Amud HaYomi, Daf HaShavua, Mishna Yomis, Rambam
  (one and three chapters), Sefer HaMitzvos day number, Nach Yomi.
- Places: a built-in table of about 150 cities (`builtInPlaces`, `getPlace`), search by
  English spellings and Hebrew (`searchPlaces`), `isInIsrael`, `nearestPlace`; every city of
  15,000+ people in a separate import, `luach/places-full` (GeoNames, CC-BY 4.0).
- The ESM build is now one file per module, so unused features are dropped by bundlers.
- `dayInfo` / `dayInfoRange`: everything about a day as JSON, with a JSON Schema
  (`docs/schema/day.schema.json`).
- iCalendar export (`toICalendar`) of holidays, parsha, learning, candle lighting, havdala
  and zmanim.
- `parseHebrewDate` for "י״ד אדר תשפ״ז" and "14 Adar II 5787"; `moladAnnouncement`;
  `formatTime`.
- The `luach` command line (`npx luach today --city lakewood`).
- Tested on Hermes (React Native): output identical to Node.
- Optional Israeli commemorations by Hebrew date (`israeliCommemorations: true`): Sigd, Yom
  HaAliyah, Herzl, Ben-Gurion, Jabotinsky, Rabin, the 7 October memorial day and others,
  each with its law's moving rule.
- Documentation site (VitePress) with guides, zmanim sources and the API reference.
- An Expo demo app (`apps/demo`, not published): today, zmanim with opinion pickers, the
  week, and settings; Hebrew and English, light and dark.

### Changed
- A birthday or bar mitzvah for someone born on 30 Adar I, in a common year, is 1 Nisan
  (was 30 Shevat; Magen Avraham 55:10, Mishna Berura 55:45). New option `adarI` for one born
  in Adar I whose birthday falls in a leap year (Levush, the default, or Magen Avraham).
- BeHaB counts from the first Shabbos after Rosh Chodesh (MB 492:3): when 1 Cheshvan or
  1 Iyar is Shabbos the fasts are a week later than before.
- Yom Kippur Katan: new option `yomKippurKatanOnFriday` (`'thursday'`, the default, or
  `'friday'`) for an Erev Rosh Chodesh on Friday; moved days carry `moved: true`; the
  citations now say what Magen Avraham 417:3 and Mishna Berura 417:4 each hold.
- The city-data files ship without source maps; the package is about half the size.
- Hebrew zman labels carry a left-to-right mark (U+200E) after each degree sign, so the
  angle reads correctly in right-to-left text.
