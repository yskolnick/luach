# Changelog

All notable changes for users of Luach. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and Luach uses [semantic versioning](https://semver.org/).

## [1.0.0] — unreleased

First release.

### Calendar
- Hebrew ↔ Gregorian conversion for Hebrew years 1–9999 (proleptic Gregorian before 1582), from the Rambam's rules:
  molad with chalakim, the 19-year cycle, the four dechiyos, year types.
- Yahrzeits, birthdays and bar/bas mitzvah dates, with every custom (Adar, 30 Cheshvan/Kislev) labelled and sourced.
- Hebrew numerals (gematriya) with geresh/gershayim and ט״ו/ט״ז; parsing; years with or without thousands.
- Month, weekday, holiday and parsha names in Hebrew, Ashkenazi, Sephardi/Israeli and plain English; pluggable tables.
- Opt-in Unicode isolates for Hebrew text in left-to-right layouts.

### Holidays and readings
- Yomim Tovim, Chol Hamoed, fasts with their postponements, Chanukah (candles per night), Purim (incl. Meshulash and
  Katan), Rosh Chodesh, Shabbos Mevorchim, special Shabbosos, optional customs (BeHaB, Yom Kippur Katan, Shovavim, Leil
  Selichos) and modern Israeli days, for Israel and the diaspora.
- Omer (text and sefirah), Hallel, mashiv haruach / tal umatar (computed from Shmuel's tekufa), Birkas HaChama,
  Kiddush Levana, molad announcement.
- Weekly parsha for Israel and the diaspora; haftara by custom (Ashkenaz, Sephardi, Chabad, Teimani where sourced);
  Pirkei Avos.
- Learning cycles: Daf Yomi (Bavli, Yerushalmi), Mishna Yomis, Rambam (1 and 3 chapters), Nach Yomi, Daf HaShavua,
  with siyum dates.

### Zmanim
- About 45 named opinions, each with its source; null with a reason when the sun doesn't reach an angle; documented
  rounding; sea level or elevation; opt-in high-latitude fallback; IANA time zones with a pluggable provider.
- Candle lighting, havdala, Erev Pesach chametz times, fast start/end.

### Places and outputs
- About 180 built-in cities (GeoNames) with Hebrew names and search; a full 34,000-city table as `luach/cities-full`;
  `isInIsrael()`.
- `getDay()` JSON with a JSON Schema; iCalendar export; the `luach` command-line tool.

### Accuracy
- See the [accuracy report](docs/accuracy.md): calendar, parsha, holidays and learning cycles checked day by day against
  independent implementations; zmanim in 19 cities over 4 years.
