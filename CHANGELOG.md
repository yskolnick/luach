# Changelog

All notable changes for users of the `luach` package. This project follows
[Semantic Versioning](https://semver.org/).

## Unreleased

## 0.5.0 — 2026-11-13

### Changed
- The events of a day come in a documented order, the first the one to name the day by: Yom Tov
  and Yom Kippur, Chol Hamoed, a fast, Rosh Chodesh, a minor holiday, a special Shabbos, an eve,
  Isru Chag, then the rest. Where a source orders two that meet it follows it: Rosh Chodesh Teves
  before Chanukah (Shulchan Aruch OC 684:3). In `holidaysOn`, `holidaysForYear`, the day and now
  documents and the calendar file; only the order within a day changes.
- In Israel, Shavuos is named "Shavuos" (שבועות, "Shavuot"), not "Shavuos I": it is one day there,
  so its event has no `day`. A new name key, `holiday.shavuos`. In the diaspora the two days keep
  their numbers. No other festival day in Israel had a number it did not need (Rosh Hashana,
  Sukkos and Pesach number days of a festival of several days).

### Added
- `parseSettings(json)` and `settingsToJSON(settings)`: read and write the settings that are not
  opinions (`useElevation`, `candleLightingMinutes`, `ateretTorahMinutes`, `highLatitudeFallback`,
  `algorithm`, `round`) and the customs `chanukahLighting`, `secondNightCandles` and `omerFrom`.
  `parseSettings` never throws: `{ ok, value, problems }`, as `parseOpinions`.
- `round: 'none'` (in `ZmanimSettings` and every function that takes them): times are not rounded;
  `time` is the exact time, `rounded` is null, and `localTime()` and the JSON's `local` give
  `HH:MM:SS`. The default, `'safe'`, is unchanged.
- The halachic choices page says exactly what `useElevation` changes: sunrise and sunset and every
  time counted from them (fixed minutes, candle lighting, the seasonal hours of a day from sunrise
  to sunset), never a time set by the sun's angle, a day set by angles, or chatzos; a test now
  holds every zman to that rule. Nothing changes.
- `yizkor: true` in the holiday options: an optional `yizkor` event on Yom Kippur, and in the
  diaspora on the last day of Pesach, the second day of Shavuos and Shemini Atzeres (Mishna Berura
  494:17, 668:15). In Israel only Yom Kippur for now; the festival days there are an open question.
- `tefillaAt(instant, location, options)`: the davening windows at an instant, Shacharis, Mincha,
  Maariv and on Yom Kippur Neilah, each with `opens`, `closes`, how far it extends after the fact
  (`bedieved`), `inProgress`, its rule and its sources, and `service`, the one to daven now (New
  York, Thu 12 Nov 2026, 4:30 PM: Mincha until sunset at 4:40, Mincha Ketana from 2:36).
- `Night.omerFrom` (in `nightOf`, the new `nightAt` and `nowInfo`'s nights): the earliest time to
  count the Omer, by default the later of nightfall and the end of Shabbos or Yom Tov
  (`omerFrom: 'tzeis'` for nightfall alone), with its sources on the halachic choices page.
- `nightAt(instant, location, options)`: the night in progress, from its sunset to its dawn (also
  after midnight), or `null` by day; cheaper than `nowInfo` for asking often.
- `secondNightCandles` (a nightfall zman id) in the options of `dayInfo`, `nowInfo`,
  `melachaRunAt` and the other functions that give candles: the time of the candles on a second
  night of Yom Tov, apart from havdala. Left out, it is the `havdala` opinion, as before: New York,
  Sat 12 Sep 2026 with Rabbeinu Tam's havdala still gives 8:23 PM, and 7:52 PM with
  `secondNightCandles: 'tzeis-8.5'`.
- `dayInfo(...).eruvTavshilin`: an eruv tavshilin is made today (Shulchan Aruch OC 527:1; Mishna
  Berura 527:1), by the Israel or diaspora setting; also before Shavuos on Friday and Shabbos in
  the diaspora, whose Friday is Yom Tov.
- `kiddushLevanaAt(...).previous` (and `nowInfo.kiddushLevana.previous`): the month before, with
  its latest times by each opinion and `closed`, the later of them, so an app can say when the
  window that just closed closed (New York, Tue 27 Oct 2026: Cheshvan's closed Mon 26 Oct at 3:22
  AM by the fifteen days, Sun 25 Oct at 9:44 PM by half a month).
- `omerNusach` in `dayInfo` and `nowInfo`: `day.omer.text` in the chosen wording (`'ashkenaz'`,
  the default, `'sefard'` or `'edot-hamizrach'`), as `omerText` gives it.
- `Zman.fallbacks` (and `fallbacks` in the JSON): where a time does not occur because the sun does
  not get low enough (far north in summer), what each high-latitude rule would give, `halfNight`
  (solar midnight) and `nearestDay`, each marked in its own `fallback`. Nothing changes unless a
  caller reads one; the default is still no time. Tromsø, the evening of 24 May 2027: nightfall
  `null`, `fallbacks.halfNight` 00:42, `fallbacks.nearestDay` 00:12. The halachic choices page now
  lists, for a fast's start and end, the Omer, Maariv and Shema and the end of Shabbos, which rule
  the sources give, with the sources.

## 0.4.0 — 2026-11-13

### Breaking
- Node 20.19 or later (or 22.12 or later) is required; Node 18 is no longer supported. The
  CommonJS `luach/places-full` now loads the same city table file as the ES module build instead
  of carrying its own copy, which needs `require` of an ES module. The package is 1.6 MB packed
  (was 2.5 MB) and 5.4 MB unpacked (was 7.9 MB).
- The day and now documents use one name for one thing. In `dayInfo` (and `nowInfo.day`),
  `gregorian` is now `date` and `hebrew` is now `hebrewDate`, as the now document already names
  them; `nowInfo.clock.dayOfWeek` is now `clock.weekday`, as in `dayInfo`. Both schemas are
  updated.

### Added
- `dayPartAt(instant, location, options)`: whether it is before sunrise, day, between sunset and
  nightfall (`'bein-hashmashos'`) or night, by the person's `sunrise`, `sunset` and `tzeis`
  opinions, with the times compared and their civil date; `part` is `null` where the sun gives no
  time.
- `eventsAt(instant, location, options)`: the events in force at an instant, each with `from`,
  `until` and `inProgress`: the Hebrew date's events, plus a Yom Tov or fast still running past the
  date's boundary (Yom Kippur until its fast ends) and a Yom Tov already begun at its candles; Isru
  Chag from the end of the Yom Tov.
- `MelachaRun.kinds` (and `nowInfo.melacha.kinds`): what a run of holy days holds, `'shabbos'`,
  `'yom-tov'`, `'yom-kippur'` in that order, so an app can say "Shabbos and Yom Tov end tomorrow
  night".
- The words of the day in every name set, as `termName` keys: `today`, `tonight`, `tomorrow`,
  `tomorrow-night`, `night`, `evening`, `afternoon` (Hebrew: היום, הלילה, מחר, מחר בלילה, לילה, ערב,
  אחר הצהריים). `weekdayName(day, locale, { form: 'short' })` gives the short weekday ("Fri",
  "יום ו׳"), from the new keys `weekday.N.short`; `nameEntries` lists them.
- `dayInfo` (and `nowInfo.day`) has `shabbos`, `yomTov`, `melachaForbidden` (Shabbos, Yom Tov or
  Yom Kippur) and `fastKind` (`'major' | 'minor' | null`), so a reader need not scan the events'
  flags, and `followedBy` on every day: what the next day is (`'shabbos'`, then `'yom-kippur'` or
  `'yom-tov'`), also on a day that is itself holy (Shavuos on a Friday in the diaspora:
  `['shabbos', 'yom-tov']`), where `erev` is empty.
- Every event (`HolidayEvent` and the JSON's events) has `begins`: `'sunset'`, the evening before,
  or `'dawn'` for a minor fast. Purim begins at night, with the Megillah (Megillah 4a; Shulchan
  Aruch OC 687:1).
- The JSON's events carry `month` and `monthYear` for Rosh Chodesh, Shabbos Mevorchim and Yom
  Kippur Katan, as `HolidayEvent` already did.
- Each time in the JSON has `offset`, its UTC offset at that time (`"-05:00"`), so `local` and
  `offset` give the full local time; `null` when there is no time.
- Sunrise and sunset say where they are seen from: their `opinion` ends "at sea level" or "at the
  place's elevation of N m" (it said "at sea level unless the calculator's useElevation is on").
- From this release the schemas' `$id`, the documents' `$schema` and the now schema's reference to
  the day schema name the release's tag (`…/luach/v<version>/schema/…`) instead of `main`, so a
  document says which version of the schema describes it.
- `compactJson(doc)`: a day or now document (or `{ days: [...] }`) with each opinion and source
  stated once in `sources` and each time's `timeZone` left out; about a fifth smaller for
  `nowInfo`, two fifths for a month of days. The full documents are unchanged.
- `learningDetail` in the day JSON (with `learning: dayLearning`) and `dayLearningDetail` in
  `luach/learning`: each cycle's portion as data (cycle, number, day, length; tractate and daf for
  daf yomi) beside its text.

### Fixed
- `fastAt` (and `nowInfo`'s fast) says a fast is in progress from its start until the fast day's
  sunset where its end has no time (no nightfall far north). Until now `inProgress` was `null` from
  the moment the fast began: Tromsø, Tisha B'Av 5787, at 20:30Z on 11 August. After the sunset it
  is `null` until the end of the next civil day, as `melachaRunAt` keeps a run; until now the fast
  was not found at all after local midnight.
- A `HebrewDate` made by one copy of the library is read as the same Hebrew date by another.
  An app that loads `luach` through both `import` and `require` has two copies. Until now,
  `dayInfo` and the other functions that take a civil or a Hebrew date read the other copy's
  `HebrewDate` as a civil date, so 25 Kislev 5787 came out as a day in the year 5787 CE.
  `instanceof HebrewDate` is now true across copies too.
- A function that takes a `HebrewDate` throws a `TypeError` when given a civil date
  `{ year, month, day }`. Until now it read the civil date's numbers as a Hebrew date:
  `holidaysOn({ year: 2026, month: 12, day: 5 })` returned `[]`, not Chanukah. It also throws
  for a JavaScript `Date`, a string, `undefined` or `null`, and the message names the function
  to call instead. A learning function's day count must be a whole number.
- The functions that take an instant (`nowInfo`, `hebrewDateAt`, `melachaRunAt`,
  `timesBetween`, `Zmanim.at` and others) throw a `TypeError` that says to pass a `Date` when
  given a number, a string or `undefined`, and a `RangeError` for an invalid `Date`.
- `dayInfoRange(start, count)` throws unless `count` is a whole number of 0 or more. A count of
  `Infinity` ran until the process ran out of memory, and an end date returned `[]`.
- iCalendar: the UIDs of candle lighting, havdala, the end of Shabbos and zmanim include the
  place, so calendars for two places no longer replace each other's events. Calendar apps will
  re-create these events once. Events without a place keep their UIDs.
- `parseHebrewDate("3 Kislev")` says that the year is missing.

### Changed
- The package ships no source maps: 1.2 MB packed (3.9 MB unpacked). An error inside Luach
  points to the built file in `dist/`.
- The published schemas allow fields they do not list (no `additionalProperties: false`), so a
  document from a later version, which may add fields, still validates against an earlier schema.
- The command line checks its options. An unknown option (with the nearest name suggested), an
  option the command does not use, an option with a missing value, an option given twice, an
  argument too many or too few, and a year such as `luach holidays 2026` that looks like a civil
  year are now errors with exit code 1. Until now they were ignored, so a typo such as
  `--elevaton` gave times without the elevation, with no warning.
- `luach zmanim` says in words why a time is missing; `--json` still gives the code.
- `luach today` and `luach date` name the learning cycles ("Daf Yomi", "דף יומי") instead of
  printing their keys (`dafYomi:`); `--json` keeps the keys.
- `--city` with a name that several places share says which one it used and how to pick another.

## 0.3.1 — 2026-11-12

### Changed
- The README (the npm page), the docs home page and the package description now say that Luach
  is VERY BETA and constantly changing: its API, defaults and results may change in any release
  until 1.0, so pin an exact version and read this changelog before upgrading. No code changed.

## 0.3.0 — 2026-11-12

### Added
- The earliest time to light the Chanukah lights, by custom. `Night.chanukahLighting` (and
  `night.chanukahLighting` and `nextNight.chanukahLighting` in `nowInfo`, described in
  `schema/now.schema.json`) gives `lights`, `evening` (`weekday`, `erev-shabbos` or
  `motzaei-shabbos`), `custom` (the custom in force), `isDefault`, `customs` (each with its
  `earliest` time, opinion and source), `earliest`,
  `before` (the Shabbos candles on Erev Shabbos) and `until` (dawn of the morning after); it is
  `null` outside Chanukah. It is built only from times Luach already computes. On a weekday it
  offers two customs, from sunset and from nightfall; the new option `chanukahLighting: 'sunset' |
  'tzeis'` chooses one. Left out, the custom is nightfall (`'tzeis'`) as a default, not a ruling:
  `isDefault` is `true`, a weekday `earliest` is the nightfall time, and `customs` lists both.
  `nowInfo.settings.chanukahLighting` gives the custom in force and
  `settings.chanukahLightingIsDefault` says whether it is the default; `luach now` marks the line
  "(Luach's default)" where it marks a chosen one "(your choice)". On Erev Shabbos the earliest is plag
  hamincha and on Motzaei Shabbos when Shabbos ends. The command line's `luach now` prints it with
  `--chanukah-lighting sunset|tzeis`, and the example server's `/now` takes `chanukahLighting`. The
  `ChanukahLighting` and `ChanukahCustom` types. See "At this instant" and the halachic choices.
- The day view has `erev`: an array, usually empty, of `{ id: 'erev-shabbos' | 'erev-yom-tov' | 'erev-yom-kippur', name }`
  for a civil day that is itself neither Shabbos nor a Yom Tov on which melacha is forbidden and is
  followed by Shabbos and/or such a Yom Tov (for the Israel or diaspora setting; Yom Kippur counts;
  both can apply, Shabbos first; the eve of Yom Kippur has `erev-yom-kippur` only, never
  `erev-yom-tov`, because the sources name that day "Erev Yom Kippur"; it is named as the day's
  event is, and `erev-shabbos` still comes first when Yom Kippur falls on Shabbos). A day that is itself Shabbos or Yom Tov gets an empty array. The
  `name` is the everyday word in the locale (`term.erev-shabbos`, `term.erev-yom-tov`), so it can be
  changed like any name. `schema/day.schema.json` describes it, and the command line's `today` and
  `date` print the name under the weekday line. It is separate from the `erev` flag on a holiday
  event, which is unchanged.
- Change any name: `nameEntries(locale)` lists every name Luach gives (months, weekdays, holidays,
  zmanim, parshiyos and the everyday words) with its key, group and current name, and whether it
  differs from the built-in set; `parseNames(json)` reads a person's saved changes back without
  throwing, keeps the valid ones and reports the rest (including a name that drops or adds a
  `{n}` or `{month}` placeholder, and `term.havdala` or `term.candle-lighting`, which are
  `zman.havdala` and `zman.candle-lighting`); `extendLocale` applies them. The `NameEntry`
  and `ParsedNames` types. The command line takes `--names '<json>'` and the example server a `names`
  query parameter. See the guide, "Change any name".
- The command line's `--locale` and the example server's `locale` also take `chabad`, `israeli` and `yi`.
- `formatTime` options `padHour: false` ("6:41" instead of "06:41") and `uppercase: true` ("6:41 PM"),
  and the `TimeFormatOptions` type. The defaults are unchanged.
- `termName(key, locale)` and the `TermKey` type: the everyday words (Shabbos, Motzei Shabbos, Yom Tov,
  Shacharis, Mincha, Maariv, Musaf, Sefiras HaOmer, the menorah; the eve of Shabbos, the eve of a Yom
  Tov and the night after a Yom Tov; "Parshas", "Parsha" and "Omer" as the calendar file and command
  line write them) by name set, and Havdala and candle lighting, which give the name of `zman.havdala`
  and `zman.candle-lighting`. Override any with `term.<key>` in a locale's `names`; for Havdala and
  candle lighting, change the `zman.*` key. In the Hebrew sets Yom Tov, Musaf, Sefiras HaOmer, the
  menorah, "parsha" (פרשה) and "omer" (עומר) are plain Hebrew, chosen for Luach, with no written
  source yet; the command line's day text in `--locale he` or `yi` prints the last two in Hebrew.
- Three name sets, `chabad`, `israeli` and `yi` (Yiddish, in Hebrew letters). Each follows its base
  set (`ashkenazi`, `sephardi`, `he`) except where it names something itself, and none does yet.
  See the guide, "Names and name sets".

### Fixed
- The calendar file (`toICalendar`) wrote candle lighting and havdala in fixed English or Hebrew; it now
  uses the locale's names for them (`zman.candle-lighting`, `zman.havdala`), so a changed name shows. The
  names of the built-in sets are unchanged.
- The command line's day text writes candle lighting, havdala and "Shabbos ends" with the locale's
  everyday words rather than fixed English; with `--locale sephardi` or `en` the last reads "Shabbat ends",
  and with `--locale he` or `yi` the first two are in Hebrew. The melacha line of `luach now` names
  Shabbos the same way.

### Changed (breaking)
- The built-in city table moved to `luach/places`: `builtInPlaces`, `getPlace`, `searchPlaces`,
  `nearestPlace`, `distanceKm`, `LOCAL_CANDLE_LIGHTING` and the `Place`, `CandleLightingCustom` and
  `SearchOptions` types. `isInIsrael` and `ISRAEL_BOUNDARY` stay in `luach`.
  Before: `import { getPlace, Zmanim } from 'luach'`.
  After: `import { Zmanim } from 'luach'; import { getPlace } from 'luach/places'`.
- The learning cycles moved to `luach/learning`: `dafYomi`, `locate`, `BAVLI_TRACTATES`,
  `yerushalmiYomi`, `amudYomi`, `dafHaShavua`, `mishnaYomis`, `rambamOneChapter`,
  `rambamThreeChapters`, `seferHaMitzvosDay`, `nachYomi` and their types.
  Before: `import { dafYomi } from 'luach'`. After: `import { dafYomi } from 'luach/learning'`.
- `dayInfo` and `nowInfo` leave `learning` null unless you pass the plug-in, so the learning
  tables are no longer part of every bundle. `dayLearning` gives exactly what `learning` held before.
  Before: `dayInfo(date, { location })`.
  After: `import { dayLearning } from 'luach/learning'; dayInfo(date, { location, learning: dayLearning })`.
- `toICalendar`'s `learning` option takes `icalLearning([...])` instead of a list of names; a plain
  list throws a `TypeError`.
  Before: `toICalendar(from, to, { learning: ['dafYomi'] })`.
  After: `import { icalLearning } from 'luach/learning'; toICalendar(from, to, { learning: icalLearning(['dafYomi']) })`.
- The `IcalLearning` type is now the plug-in's type (what `icalLearning` returns); the names are
  `IcalLearningName` in `luach/learning`.
- The example server's `/day` and `/now` leave `learning` null unless the request has `learning=1`
  (and `/calendar.ics` takes the cycles by name: `learning=dafYomi,mishnaYomis`). The `luach` command
  includes the learning, as before.

### Added
- Erev Pesach chametz times for every Shema opinion's day: `sof-zman-achilas-chametz-` and
  `sof-zman-biur-chametz-` with `mga-90`, `mga-72-zmaniyos`, `mga-90-zmaniyos`, `mga-16.1`,
  `baal-hatanya` and `ateret-torah` (eating until the end of the 4th seasonal hour, burning until
  the end of the 5th, of that day).
- More zmanim, 26 in all (122 now): `chatzos-midpoint` (midway between sunrise and sunset);
  `tzeis-72-zmaniyos`, `tzeis-90`, `tzeis-96`, `tzeis-120`, `tzeis-90-zmaniyos`,
  `tzeis-96-zmaniyos` and `tzeis-120-zmaniyos` (nightfall after sunset by the same minutes as the
  matching `alos-` entries); the Magen Avraham days `mga-96`, `mga-96-zmaniyos` and `mga-120`
  (a stringency), each with `sof-zman-shema-`, `sof-zman-tefilla-`, `plag-hamincha-`,
  `sof-zman-achilas-chametz-` and `sof-zman-biur-chametz-`; and `plag-hamincha-` for
  `mga-72-zmaniyos`, `mga-90` and `mga-90-zmaniyos`. `DayName`, the argument of
  `shaahZmanis`, includes the three new days. Each names its opinion and source; none is a default.
- `nowInfo(instant, place, options)`: everything true at an instant at a place as one plain JSON
  document: the clock there, the Hebrew date and when it changes, whether melacha is forbidden and
  until when (`null`, never off, where Luach has no time), the fast, the night in progress and the
  next one (their Omer count and Chanukah lights), what comes next, Kiddush Levana, the settings in
  force, `validUntil` (ask again then) and the whole day view of the place's civil day. Its schema
  ships as `luach/schema/now.schema.json` (`NOW_INFO_SCHEMA_ID`).
- `luach now [place]`: the same, in words, or the document with `--json`; `--at <instant>` asks
  about another moment.
- `examples/server` serves it at `/now`, and `examples/home-assistant` shows Home Assistant
  sensors reading it.
- `zonedParts(instant, timeZone)`: the wall clock in a zone at an instant (date, time to the
  second, day of the week and the zone's offset), never the machine's. `zonedInstant(parts,
  timeZone)` is the other way: the instant at which a zone's clock shows a date and time. A time
  skipped by a clock change becomes one gap later, a time shown twice is the earlier instant,
  and an invalid date or time throws a `RangeError`.

- `hebrewDateSpanAt(instant, place, options)`: the Hebrew date at an instant (always what
  `hebrewDateAt` gives), the civil date there, and the `dayBoundary` times that began and end it.
- `fastAt(instant, place, options)`: the fast of the place's today or tomorrow (or of yesterday,
  while it is still on after local midnight) with its start and end, and whether it is in progress:
  `true`, `false`, or `null` where a time it needs does not occur.
- `nightOf(date, place, options)`: the night that begins a Hebrew date: the evening's sunset and
  nightfall, the morning's dawn and sunrise, the events, the Omer day counted, the Chanukah lights
  lit, and the candles, end of Shabbos or Yom Tov and havdala of the evening.
- `kiddushLevanaAt(instant, place, options)`: Kiddush Levana for the month whose latest time has
  not passed, with every opinion's earliest and latest time and each night in the window.
- `melachaRunAt(instant, place, options)`: the run of consecutive days on which melacha is
  forbidden (Shabbos, Yom Tov, Yom Kippur) that is in progress or next, with the eve, each day's
  events and candles, the first candles and the end, and whether it is in progress: `true`, `false`,
  or `null` where a time it needs does not occur.
- `timesBetween(from, to, place, options)`: every time in a range in time order, with the Hebrew
  date whose day view gives it: the zmanim chosen with `which`, and candle lighting, havdala, the
  end of Shabbos and a fast's start and end.

### Changed
- `luach`: an unknown `--locale` is a usage error (it fell back to `ashkenazi` without a word).
- `Zmanim` uses the place's documented candle-lighting custom when `candleLightingMinutes` is
  not given, as the day view does: `new Zmanim(getPlace('jerusalem')).on(date).get('candle-lighting')`
  is 40 minutes before sunset, not 18, and names the custom and its source. `zmanim.settings`
  shows the minutes in force. Pass `candleLightingMinutes` to choose the minutes yourself. A
  place without a documented custom is unchanged.
- `isMelachaForbiddenAt` takes a `DayLocation` and uses the place's documented candle-lighting
  custom when `candleLightingMinutes` is not given, as the day view does (Jerusalem: 40 minutes
  before sunset, not 18). Pass `candleLightingMinutes` to choose the minutes yourself.
- For every location in Israel that has no documented candle-lighting custom and no
  `candleLightingMinutes` (a built-in place such as Tel Aviv, a city of the full table, a record of
  your own, or bare coordinates), the candle-lighting zman's opinion now ends with a note: "Luach
  has no documented custom for this place". `nowInfo`'s
  `settings.candleLightingNote` carries it, and `luach` prints it with the time. The time is still
  18 minutes. To combine a GPS position with a chosen city, spread the city and set the position:
  `{ ...getPlace('jerusalem'), latitude, longitude }`.

### Fixed
- `slot('chametzEat')` and `slot('chametzBurn')` follow every Shema opinion's day; for an opinion
  with no chametz entry of its own they gave the Gra's later times.
- `isMelachaForbiddenAt`: where the sun sets after local midnight (far north in June), the day
  before stays in effect until that sunset. It had answered "not forbidden" from midnight while the
  sun was still up on Shabbos.
- `toICalendar`: a range can end on the last supported day (29 Elul 9999).
- `dayInfo`: holiday options given at the top level (`{ yomKippurKatan: true }`) are read as well as
  under `holidays`, so a day's events and its fast follow the same options.
- `isMelachaForbiddenAt` now answers "forbidden" from candle lighting on the evening before
  Shabbos or Yom Tov where candle lighting occurs but the havdala time does not (Stockholm in
  June, for example). It had answered by the civil day and said "not forbidden" until midnight.
  Where the havdala time does not occur Luach still has no time at which Shabbos or Yom Tov
  ends, and the end is the end of the civil day; setting `highLatitudeFallback` gives that
  rule's time instead.

## 0.2.0 — 2026-11-10

This release replaces the zmanim interface. Every time Luach computes is unchanged.

### Added
- `Zmanim`: a place and the opinions its user follows, in one object.
  `new Zmanim(place, opinions?, settings?)`, then `.on(date)` or `.at(instant)` for a day,
  `.next(now, which?)`, `.between(from, to, which?)` and `.hebrewDateAt(instant)`.
  `.at(instant)` gives the civil day *at the place*, never on the device's clock.
- `ZmanimDay`: `.slot('shema')` (the user's opinion), `.slots(part?)` (the day in order),
  `.get(id)` (any opinion by id) and `.shaahZmanis(day)`.
- Opinions are one plain object, `{ shema: 'sof-zman-shema-mga-72', tzeis: 'tzeis-8.5', … }`,
  checked by TypeScript and at run time; `Zmanim.defaults`, `Zmanim.choices(choice)` for a
  settings screen, and `Zmanim.parseOpinions(json)` to read stored settings back (it never throws,
  and reads the method names of 0.1).
- `Zman.explain()`: how the time was calculated that day, step by step, with the local time of
  each step, then how it was rounded. `Zman.exact`, `Zman.kind` (`'earliest' | 'deadline'`),
  `Zman.slot` and `Zman.remaining(now)` (a countdown that is never generous).
- `zmanName(id, locale)`: a name split into the time and the opinion, for a heading and a label.
- The day JSON gains `exact`, `kind` and `slot` for every zman.

### Changed (breaking)
- `ZmanimCalendar` and its 87 methods are removed. Use `new Zmanim(place).on(date).get(id)`:
  `z.sofZmanShemaGra()` becomes `day.get('sof-zman-shema-gra')`, `z.alos16Point1()` becomes
  `day.get('alos-16.1')`, `z.tzeis8Point5()` becomes `day.get('tzeis-8.5')`. Every id is in the
  [table of zmanim](docs/halacha/zmanim.md); `Zmanim.parseOpinions` converts old method names.
- `ZmanimCalendar`'s `rounding: false` is gone: `Zman.time` is always rounded on the safe side,
  and `Zman.exact` is the exact instant.
- `havdala({ degrees })`, `candleLightingSecondNight({ … })` and `candleLighting(minutes)` are
  replaced by the `havdala` opinion (a tzeis id) and the `candleLightingMinutes` setting.
- `dayInfo`, `toICalendar`, `fastTimes`, `isMelachaForbiddenAt` and `hebrewDateAt` take
  `opinions` and the settings: `boundary` becomes `opinions.dayBoundary`, `begins` and `ends`
  become `opinions.fastBegins` and `opinions.fastEnds`, melacha's `ends` becomes
  `opinions.havdala`, `beginsMinutesBeforeSunset` becomes `candleLightingMinutes`. Their `zmanim`
  lists take ids or slots (`'sof-zman-shema-gra'`, `'shema'`) instead of method names, and
  `DEFAULT_DAY_ZMANIM` lists ids.
- Removed exports: `ZmanimCalendar`, `DEPRESSION_RANGE`, `MINUTES_RANGE`, and the types
  `DayBoundary`, `FastTimesOptions` and `MelachaOptions` (now `ZmanimOptions`).
- The day JSON's havdala, second-night candle lighting and "Shabbos ends" name the tzeis opinion
  they follow in their `source`.

### Fixed
- The React Native example passed a JavaScript `Date` to `dayInfo`, which takes a civil date.

## 0.1.1 — 2026-11-08

### Documentation
- The README, which is also the npm page, now opens with a notice that Luach was built
  mostly by AI and may contain mistakes. The package description says so too, and the
  keywords include `ai-generated`. No code changes.

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
