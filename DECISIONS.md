# Decisions

Yosef Skolnick decides everything about Luach. This file holds:

- **D-nn, Decided:** a ruling, with Yosef's own words quoted.
- **Q-nn, Open question:** what is being asked, and what the code does until it is answered.
- **P-nn, Proposal:** a recommendation, why, and the default in effect until Yosef decides.
- ***As built*:** behaviour the code has that nobody chose; listed so it can be chosen or changed.

Entries are added and superseded, never rewritten. Architecture, tooling, dependency and
licence choices also have an ADR in `docs/decisions/`.

## Decided

### D-01. The name is Luach
The npm package is `luach` and the repository is `yskolnick/luach`. Yosef: "use luach".
The name was free on npm on 2026-10-21; Yosef has since reserved it (a placeholder release
held for npm's staged-release review). An unrelated package, `luach-picker`, is a browser
date-picker widget; Luach is a calculation library with no UI (see README).

### D-02. Commits name the models that wrote and checked them; no session links
Yosef: "All commits on this repo can say which model worked on it and which checked it
since it is a public repo and we want transparency." Commits end with a `Co-Authored-By:`
line naming the model that wrote the change, and may add a line naming the model that
checked it. Session links stay out: on 2026-10-21 the `Claude-Session:` lines were removed
from every commit on `main` (history rewritten and force-pushed; file contents unchanged)
and from the pull-request descriptions. This supersedes, for commit messages only, the
earlier rule against model names in the repository.

### D-03. A public project log
Yosef: "I would like a log to be in here also. Nothing personal at all should be there but
updates and decisions that are relevant should be shown to people". `LOG.md` records each
working session's updates, decisions and open questions. Personal notes and conversation
records stay in the private records repository.

## Open questions

### Q-00. Unmerged branches
Branches with work not yet on `main`: none.

### Q-01. Licence: Apache-2.0 with NOTICE, or MIT
See P-01. **Until decided:** Apache-2.0 with a `NOTICE` file.

### Q-02. How credit should read
**Until decided:** NOTICE says "Built on Luach by Yosef Skolnick".

Q-03 is recorded in the private records repository.

### Q-04. Anniversary rules (30 Adar I, 30 Cheshvan/Kislev defaults)
`anniversary()` offers both customs for the 30th of Cheshvan/Kislev and for Adar of a
common year in a leap year. The defaults are *as built*: Adar I for yahrzeits, Adar II for
birthdays, `'firstAnniversary'` for yahrzeits and `'nextMonth'` for birthdays; 30 Adar I
in a common year becomes 30 Shevat. **Until decided:** these defaults, documented as
defaults, not rulings.

### Q-05. Modern Israeli days before their amendments
Rules are applied from the year they were adopted
(`docs/research/2026-10-21-modern-israeli-days.md`): Yom HaShoah Friday → Thursday from 1951
and Sunday → Monday from 1997; Yom HaAtzmaut Monday → Tuesday from 2004. Not modelled: the
1954 date of the Shabbos → Thursday rule for Yom HaAtzmaut (applied from 1949), and the
uncertain 1950 date. The 7 October memorial day (24 Tishrei) is not built yet (HOL-16).
**Until decided:** as described; these days are optional and off by default.

### Q-06. The example citation in the brief
The brief's example, "Magen Avraham, 72 minutes as 16.1°; Shulchan Aruch Harav 89:1", is
only partly accurate (`docs/research/2026-10-21-zmanim-opinions.md`): the Magen Avraham
(OC 58:1) says the day runs from alos, not 72 minutes or 16.1°; 72 minutes is 4 mil of
18 minutes (Pesachim 94a; SA OC 459:2); 16.1° is a modern Jerusalem-equinox conversion;
and Shulchan Aruch HaRav 89:1 gives no minutes (459:10 makes a mil 24 minutes). **Until
decided:** Luach cites each part separately, as in `src/zmanim/opinions.ts`.

## Proposals

### P-01. Apache-2.0 with a NOTICE file
**Why:** Apache-2.0 requires redistributors to carry the NOTICE text, which is the closest
standard licence to "use it freely, but credit Yosef". It also has an explicit patent
grant. MIT would only require keeping the copyright line inside the licence text.
**Default until decided:** Apache-2.0. If Yosef picks MIT, the `LICENSE` and `NOTICE` files
change and nothing else does. ADR: `docs/decisions/0002-licence-and-clean-room.md`.

### P-02. Zero runtime dependencies; TypeScript, tsup, Vitest, ESLint
**Why:** smallest bundle, no licence risk, works on Hermes. ADR 0003.
**Default until decided:** as proposed.

### P-03. Days counted from 1970-01-01; months numbered from Nisan
**Why:** epoch days line up with JavaScript `Date`; numbering from Nisan follows the Torah
and the Rambam. ADR 0004. **Default until decided:** as proposed.

### P-04. Supported range: Hebrew years 1–9999, proleptic Gregorian
**Why:** covers every practical use; the Rambam's arithmetic is exact over the range;
proleptic Gregorian avoids a silent calendar switch in 1582. ADR 0004.
**Default until decided:** as proposed.

### P-05. Move table-only learning cycles after 1.0
Chofetz Chaim / Shemiras HaLashon yomi, Tanya yomi, the mitzvos of each Sefer HaMitzvos
day, the Schottenstein Yerushalmi cycle, and Dirshu's Daf HaYomi B'Halacha cannot be computed
from structure: each needs a published day-by-day table (or, for Schottenstein, seven
tractate lengths not yet found). **Why:** shipping a publisher's table needs its licence or
permission; a guess would be wrong. **Default until decided:** listed as post-1.0 in the
roadmap. Yosef may instead approve deferring them, or obtaining permission to ship tables.

### P-06. What `isInIsrael` covers
The built-in boundary is a simplified outline of the area where communities keep one day of
Yom Tov: the State of Israel with Judea and Samaria, the Golan Heights and Gaza, accurate to
a few kilometres. **Why:** the function exists to choose Israel or diaspora rules; it makes no
political statement, and callers can always pass `israel` explicitly. **Default until
decided:** as described (`ISRAEL_BOUNDARY` in `src/places/places.ts`).

### P-07. Per-module ESM output and name tables
See ADR 0005. **Default until decided:** as proposed.

## As built

- *As built:* `gematriya()` writes an exact multiple of 1000 like its units digit (א׳ is 1
  or 1000); `parseGematriya('א׳')` returns 1.
- *As built:* `formatHebrewDate()` omits the year's thousands by default (תשפ״ז).
- *As built:* Purim Meshulash is listed on 16 Adar (the Sunday, third of its three days).
- *As built:* Leil Selichos is listed on the Shabbos whose night begins Selichos (Ashkenaz).
- *As built:* Yom Kippur Katan (optional) is not listed before Rosh Chodesh Tishrei, Cheshvan,
  Teves or Iyar (common practice; not stated in MB 417:4), and moves to Thursday from
  Friday/Shabbos (MB 417:4).
- *As built:* BeHaB (optional) is the Monday, Thursday and Monday after the first Shabbos of
  Cheshvan and of Iyar.
- *As built:* the molad is read as Jerusalem mean time at longitude 35.2354° E when turned
  into an instant (Kiddush Levana times).
- *As built:* Tachanun defaults: no Tachanun from Erev Yom Kippur through the end of Tishrei,
  and from Rosh Chodesh Sivan through 12 Sivan; both are options.
- *As built:* the Omer count text defaults to Nusach Ashkenaz wording; Sefard and Edot
  HaMizrach are options.
- *As built:* zmanim default to sea-level sunrise and sunset (`useElevation: false`);
  degree-based zmanim are always at sea level.
- *As built:* rounding is on by default (earliest times up, deadlines down).
- *As built:* candle lighting defaults to 18 minutes; havdala and second-night candles to 8.5°.
- *As built:* Mincha Gedola (Gra) is 6.5 seasonal hours after sunrise; "30 minutes" is after
  astronomical chatzos; chatzos is the solar transit.
- *As built:* Plag HaMincha per the Levush is the Gra's calculation (Magen Avraham 233:3).
- *As built:* fasts begin at alos 72 minutes (rounded down) and end at 7.083° by default.
- *As built:* the Hebrew date at an instant changes at sunset by default (`hebrewDateAt`).
- *As built:* the horizon dip for elevation uses the earth's mean radius, 6,371 km.
- *As built:* high-latitude fallbacks (`nearestDay`, `halfNight`) are off by default.
- *As built:* haftara defaults: Ashkenaz; Shabbos HaGadol's haftara always (Ashkenaz and
  Sephardi), only when Erev Pesach is Shabbos (Chabad), never (Teimani); Ashkenazi Kedoshim
  is Ezekiel 22:1-16 (Rema, ArtScroll, Ezras Torah luach) where some lists swap it with Amos.
- *As built:* Daf HaShavua runs Sunday–Shabbos from 6 March 2005 (back-computed; low confidence).
- *As built:* Mishna Yomis cycles before the 14th (2021) are counted back from it.
- *As built:* Amud HaYomi returns null after Me'ilah 22a (2038) until Dirshu publishes how
  Kinnim, Tamid and Middos are learned.
- *As built:* the built-in city table (about 150 places) was chosen for Luach: cities with
  Jewish communities, plus the test cities for high latitude and the date line. Israeli
  communities that GeoNames puts in Asia/Hebron are given Asia/Jerusalem, the time they keep.
- *As built:* place search ranks exact, prefix, transliteration-skeleton, then substring
  matches, with larger places first on ties.
- *As built:* the day view's default zmanim are alos 72 min and 16.1°, misheyakir 11°,
  sunrise, Shema (MGA 72, Gra), Tefilla (Gra), chatzos, Mincha Gedola (later of two), Mincha
  Ketana and Plag (Gra), sunset, tzeis 8.5° and Rabbeinu Tam: a common set, not a ruling.
- *As built:* the CLI prints Ashkenazi names by default (`--locale` changes it).
- *As built:* iCal events are all-day for holidays, parsha and learning, and zero-length at the
  instant for candle lighting, havdala and zmanim.
- *As built:* Israeli commemorations (option `israeliCommemorations`) are listed from the
  year of each law; Yom HaAliyah on 7 Cheshvan only; Begin Day on 4 Adar II in a leap year
  (the law says "4 Adar"; Begin died on 4 Adar II); Chag HaBanot on 1 Teves.
- *As built:* the plain-English locale (`en`) uses "Tishri, Heshvan, Iyyar" spellings and
  "Saturday".
- *As built:* the demo app opens on Jerusalem with Ashkenazi names until the user picks a
  place or language; its opinion pickers offer alos 72 min / 16.1° / 90 min; Shema Gra / MGA 72 /
  MGA 16.1° / Baal HaTanya; tzeis 8.5° / 7.083° / 50 min / Rabbeinu Tam (first of each is
  selected). "Use my location" runs on the device only and keeps
  nothing.
- *As built:* Hebrew zman labels put a left-to-right mark after each degree sign so "16.1°"
  does not flip in right-to-left text.
- *As built:* before 1.0, a patch release fixes bugs only; anything that changes an API, a
  default or a calculated result someone may depend on is a minor release (`RELEASING.md`).
- *As built:* `npm publish` runs `npm run check` first (`prepublishOnly`); the version is set
  in one step by `npm run release:version`.
- *As built:* the city-data files ship without source maps (they are generated tables), which
  halves the package.
- *As built:* security reports go through GitHub's private vulnerability reporting; the code
  of conduct is Luach's own, short text.
