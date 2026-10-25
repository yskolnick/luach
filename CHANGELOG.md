# Changelog

All notable changes for users of the `luach` package. This project follows
[Semantic Versioning](https://semver.org/).

## Unreleased

### Documentation
- The README now opens with a notice that Luach was written entirely by AI and may contain
  mistakes, and the package description says so too.

## 0.1.0 — 2026-10-24

### Changed (breaking)
- Internal helpers are no longer exported (149 names → 96). Removed from `luach`: the
  validation helpers (`assertCivil`, `assertHebrewDate`, `assertTimeZone`, `assertYear`); the
  raw calendar arithmetic (`hebrewToDays`, `daysToHebrew`, `roshHashanaDays`,
  `moladTishreiParts`, `monthsBeforeYear`, `daysBeforeMonth`, `cyclePosition`, `MIN_DAYS`,
  `MAX_DAYS`, `PARTS_PER_HOUR`, `PARTS_PER_DAY`, `MONTH_PARTS`, `MOLAD_BAHARAD`,
  `MS_PER_DAY`, `dayOfWeekOfDays`, `julianToDays`, `isGregorianLeapYear`,
  `gregorianMonthLength`); time-zone internals (`zoneName`, `zonedToInstant`, `localParts`,
  `civilDateOf`); the sun calculation (`solarPosition`, `solarTransit`, `solarAltitude`,
  `timeAtZenith`, `usnoTimeAtZenith`, `julianCentury`, `horizonDip`, `SUNRISE_ZENITH`,
  `EARTH_RADIUS_M`); `roundToMinute`, `roundToLocalMinute`; `festivalOn`, `purimMonth`,
  `JERUSALEM_LONGITUDE`, `dafYomiCycleStart`; `foldName`, `nameSkeleton` (also from
  `luach/places-full`); `icalEscape`, `icalFold`; `lookup`, `lookupIn`; and the character
  constants `GERESH`, `GERSHAYIM`, `RLI`, `LRI`, `FSI`, `PDI`. Use `HebrewDate`,
  `ZmanimCalendar` and the documented functions instead.
- A calendar call given a place but not `israel` now decides from the place: a location
  inside Israel without its own `israel` flag used to get diaspora rules. Applies to
  `dayInfo`, `toICalendar`, `fastTimes` and `isMelachaForbiddenAt`; `israel` still wins.
- The shared tables are frozen: `ZMANIM` and its entries, `DEFAULT_DAY_ZMANIM`, every place
  from `getPlace()`, `builtInPlaces()` and `fullPlaces()`, `LOCAL_CANDLE_LIGHTING` and
  `ISRAEL_BOUNDARY`. Writing to
  them throws in strict mode. Copy a table before changing it.
- `tefillahOn` outside Israel now says Tachanun again after Isru Chag of Sukkos (it used to
  wait for Rosh Chodesh Cheshvan); in Israel the default is unchanged. Pass
  `tishreiTachanun: 'endOfTishrei'` for the old behaviour.
- `mourningPeriods` returns `weekOfTishaBav` and `restrictions` as well, and moved to its own
  module (still exported from `luach`). `restrictions` is `null` unless a custom is given; see
  `MourningOptions`. Code comparing the whole result with `toEqual` needs the new fields.
- `amidahSeason(...).moridHatal` now follows `nusach` (default `'ashkenaz'`): false outside
  Israel for Ashkenaz, which says neither in summer (Rema OC 114:3). Pass `nusach: 'sefard'`
  or `'edot-hamizrach'`, or `israel: true`, for the old value.

### Added
- Mourning restrictions by named custom (`mourningPeriods(date, { sefirah, beinHametzarim,
  meatWine })`), each with its source and part of the day.
- `pesachSheniTachanun` (`tefillahOn`) and `yomKippurKatanCheshvan` (holiday options).
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
- Places: a built-in table of about 200 cities (`builtInPlaces`, `getPlace`), search by
  English spellings and Hebrew (`searchPlaces`), `isInIsrael`, `nearestPlace`; every city of
  15,000+ people in a separate import, `luach/places-full` (GeoNames, CC-BY 4.0).
- The ESM build is now one file per module, so unused features are dropped by bundlers.
- `dayInfo` / `dayInfoRange`: everything about a day as JSON, with a JSON Schema
  shipped in the package as `luach/schema/day.schema.json`; its `$id` and each object's
  `$schema` are a URL that serves the JSON file.
- iCalendar export (`toICalendar`) of holidays, parsha, learning, candle lighting, havdala
  and zmanim.
- `parseHebrewDate` for "י״ד אדר תשפ״ז" and "14 Adar II 5787"; `moladAnnouncement`;
  `formatTime`.
- The `luach` command line (`npx luach today --city lakewood`).
- Runs on Hermes (React Native) with the same output as Node.
- Optional Israeli commemorations by Hebrew date (`israeliCommemorations: true`): Sigd, Yom
  HaAliyah, Herzl, Ben-Gurion, Jabotinsky, Rabin, the 7 October memorial day and others,
  each with its law's moving rule.

### Changed
- A birthday or bar mitzvah for someone born on 30 Adar I, in a common year, is 1 Nisan
  (was 30 Shevat; Magen Avraham 55:10, Mishna Berura 55:45). New option `adarI` for one born
  in Adar I whose birthday falls in a leap year (Levush, the default, or Magen Avraham).
- BeHaB counts from the first Shabbos after Rosh Chodesh (MB 492:3): when 1 Cheshvan or
  1 Iyar is Shabbos the fasts are a week later than before.
- Yom Kippur Katan: new option `yomKippurKatanOnFriday` (`'thursday'`, the default, or
  `'friday'`) for an Erev Rosh Chodesh on Friday; moved days carry `moved: true`; the
  citations now say what Magen Avraham 417:3 and Mishna Berura 417:4 each hold.
- Every date in Hebrew year 9999 works: `holidaysForYear(9999)` and everything built on it
  no longer throw. `parshaFor` returns `null` (and `dayInfo().parsha` is `null`) only for the
  last days of 9999, whose coming Shabbos is in year 10000; `readingCycle(9999)` omits the
  Shabbosos of year 10000.
- `parseGematriya` rejects numerals not written the standard way (letters out of order,
  repeated units or tens, יה/יו for 15/16, doubled geresh or gershayim) instead of adding up
  the letters; every string `gematriya()` writes still parses, and thousands need a geresh.
- Jerusalem and Haifa carry their documented candle-lighting customs (40 and 30 minutes,
  Peninei Halakha, Shabbat 3:2); `dayInfo`, iCal and the CLI use them unless
  `candleLightingMinutes` is given, and label the time with the custom and its source.
- CLI: `--city` also searches every city of 15,000+ people when the built-in table has no
  match; `--lat/--lon` need `--tz`; `--elevation <m>` (or `=<m>`) turns on
  elevation-adjusted sunrise and sunset.
- Place search: short or loose transliteration resemblances no longer return a wrong city
  ("Tzfat", "Boro Park", "Emmanuel"); the full table knows the built-in spellings and every
  Hebrew name GeoNames has (e.g. both "סיאול" and "סאול").
- `isInIsrael`: the outline is redrawn near the borders (Yotvata, Ramat Magshimim, Hamat
  Gader and Ghajar are inside; Egyptian Rafah is outside).
- Three zmanim defined by 16.1° (Shema, Shacharis and Plag of the Magen Avraham) were
  labelled "16.1 min"; they now read "16.1°".
- The city-data files ship without source maps; the package is about half the size.
- Hebrew zman labels carry a left-to-right mark (U+200E) after each degree sign, so the
  angle reads correctly in right-to-left text.

### Fixed
- `amidahSeason` on the first day of Pesach: Shacharis still says "mashiv haruach" (the change
  is at Musaf); it used to report summer for the whole day.
- iCalendar: semicolons and lone carriage returns in text values are now escaped
  (RFC 5545 §3.3.11), so summaries like Rambam's "chapter 18, 19; Fasts chapter 1" and
  calendar names survive a round trip. An invalid `now` and a `zmanim` name that is not a
  zman method (e.g. `constructor`) throw a `RangeError`.
