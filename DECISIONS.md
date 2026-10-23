# Decisions

Yosef Skolnick decides everything about Luach. This file records each decision and the state
of everything not yet decided:

- **Decided (D-nn):** a ruling, with Yosef's words quoted.
- **Open question (Q-nn):** what is being asked, and what the code does until it is answered.
- **Proposal (P-nn):** a recommendation, the reason for it, and the default in effect until
  Yosef decides.
- **Settled:** questions and proposals that a decision has closed, kept for reference.
- **As built (AB-nn):** behaviour the code has that nobody has formally chosen, listed so it
  can be chosen or changed.

A decision is never changed silently: a later entry supersedes it and says so. Architecture,
tooling, dependency and licence choices also have an ADR in `docs/decisions/`.

Every entry has a matching section in [docs/rationale.md](docs/rationale.md), written by the
AI that built the code: why it was done this way, the sources, how confident the reasoning
is, and what would change it. A test fails if an entry has no rationale.

## Decided

### D-01. The name is Luach
The npm package is `luach` and the repository is `yskolnick/luach`. Yosef: "use luach".
Yosef has reserved the name on npm. An unrelated package, `luach-picker`, is a browser
date-picker widget; Luach is a calculation library with no UI (see README).

### D-02. Commits name the models that wrote and checked them
Yosef: "All commits on this repo can say which model worked on it and which checked it
since it is a public repo and we want transparency." Each commit ends with a
`Co-Authored-By:` line naming the model that wrote the change, and may add a line naming the
model that checked it. Nothing else in the repository names a model. Links to private
working sessions are never published; they were removed from the history of `main` on
2026-10-21 (see LOG.md).

### D-03. A public project log
Yosef: "Nothing personal at all should be there but updates and decisions that are relevant
should be shown to people". `LOG.md` records each working session's updates, decisions and
open questions. Personal notes stay in a private records repository.

### D-04. A rationale page tied to every decision
Yosef: "This should tie to every decision. It should be a document that scholars can look
at ... and fix". [docs/rationale.md](docs/rationale.md) has one section per entry in this
file: what the code does, why, the sources (with how far each was verified), what it was
checked against, a confidence level, and what is open. A test fails if any entry lacks a
section. Scholars challenge an entry with the "Challenge a decision or source" issue
template.

### D-05. One implementation: `main`
Two implementations of Luach were built on 2026-10-21. Yosef: "Keep main and see where this
code is better, add that". The second is kept for reference on the branch
`archive/parallel-implementation-2026-10-21`; what it did better was ported to `main`
(yskolnick/luach#14), each change with its tests. The same review produced
[docs/sources.md](docs/sources.md), generated from the code. Yosef: "cite and source every
decision ... This is being built in public".

### D-06. Table-only learning cycles wait until after 1.0
Yosef, on P-05: "defer for now". Chofetz Chaim / Shemiras HaLashon yomi, Tanya yomi, the
mitzvos of each Sefer HaMitzvos day, the Schottenstein Yerushalmi cycle and Dirshu's Daf
HaYomi B'Halacha need publishers' day-by-day tables and are not part of 1.0.

### D-07. The credit line
Yosef chose "Built on Luach by Yosef Skolnick", the wording in NOTICE and README.

### D-08. Modern Israeli days follow each law from its year
Yosef approved the rules as built: each moving rule applies from the year it was adopted
(Yom HaShoah Friday → Thursday from 1959, Sunday → Monday from 1997; Yom HaAtzmaut Monday →
Tuesday from 2004).

### D-09. Accurate and source-based
Yosef: "We want accurate and source based". Where the sources and a convenience differ,
Luach follows the sources and says so. Applied first to Q-06: Luach cites each part of
"72 minutes / 16.1°" separately, as the texts say.

### D-10. Israel or the diaspora from the place
Yosef chose "Infer Israel from the place". When a caller gives a place and does not say
Israel or the diaspora, Luach decides from the place with `isInIsrael`. With no place, the
diaspora is the default, as documented. An explicit `israel` option always wins.

### D-11. The shared tables are frozen
Yosef, on P-08: "Yes, freeze them". The tables listed in P-08 are frozen where they are built.

### D-12. API clean-up before 1.0
Yosef set three goals for 1.0: a smaller bundle cost for a single zman; no internal helpers
in the public API; and a source or an option for every halachic rule the code audit found
without a source. All three are settled: D-13 for the bundle; the public API went from 149
names to 96; and AB-57 to AB-60 for the sources and options.

### D-13. One zman costs 10.6 KB for 1.0
Yosef chose "Keep 10.6 KB; revisit after 1.0". Measured on 2026-10-21 (one sunrise, minified
and gzipped): Luach 10.6 KB, `@hebcal/core` 44.8 KB, `kosher-zmanim` 49.0 KB. A lighter route
(importable definitions computed by one function) would only add to the API, so it can come
later without breaking anyone (ROADMAP OUT-12). This settles the bundle part of D-12.

### D-14. Tachanun after Sukkos follows the place's custom
Yosef chose "Match the customs". By default Tachanun resumes after the end of Tishrei
(`'endOfTishrei'`) in Israel and after Isru Chag (`'isruChag'`) outside it (Kaf HaChaim OC
131:98; Sha'arei Teshuvah 131:19; Aruch HaShulchan OC 131:12). Sephardim outside Israel pass
`'endOfTishrei'`. Settles P-09.

### D-15. Mourning restrictions have no default
Yosef chose "No default": `mourningPeriods` reports restrictions only for a custom the caller
names (AB-57).

### D-16. Yom Kippur Katan before Cheshvan is off by default
Yosef chose "Keep it off": `yomKippurKatanCheshvan` turns it on (AB-59).

## Open questions

### Q-00. Branches
All work is on `main`. `archive/parallel-implementation-2026-10-21` is kept for reference
(D-05) and is not to be merged. The other branches on GitHub are merged and can be deleted.

### Q-01. Licence: Apache-2.0 with NOTICE, or MIT
See P-01. **Until decided:** Apache-2.0 with a `NOTICE` file.

### Q-04. Anniversary rules (30 Adar I, 30 Cheshvan/Kislev defaults)
`anniversary()` offers both customs for the 30th of Cheshvan/Kislev and for Adar of a common
year in a leap year. **Until decided**, the defaults are: Adar I for yahrzeits, Adar II for
birthdays; `'firstAnniversary'` for yahrzeits and `'nextMonth'` for birthdays; a yahrzeit of
30 Adar I falls on 30 Shevat in a common year. They are documented as defaults, not rulings.

- **Birthdays on a day that does not exist** (for example 30 Adar I in a common year) fall
  on the 1st of the next month, so 30 Adar I becomes 1 Nisan. Magen Avraham OC 55:10 and
  Mishna Berura 55:45: when the 30th does not exist, the age is not complete until the 1st
  of the next month ("עדיין לא מלאה לו שנה ... דבעי' י"ג שנים שלימים"); MB 55:44: one born in
  Adar I counts from Adar, not Shevat. This corrected an earlier default (30 Shevat) that put
  a bar mitzvah a month early.
- **Born in Adar I, observed in a leap year:** option `adarI`, `'levush'` (Adar I; Levush OC
  685 as cited by MA 55:10; MB 55:43, "the consensus of the later authorities, against the
  Magen Avraham") or `'magen-avraham'` (Adar II; MA 55:10, "נעשה ב"מ באדר שני"). **Until
  decided:** `'levush'`.

### Q-07. Chabad on Shabbos HaChodesh or Chanukah before Rosh Chodesh
When Shabbos HaChodesh is 29 Adar, or a Shabbos of Chanukah is 29 Kislev, Rosh Chodesh is on
Sunday. Chabad adds the first and last verses of Machar Chodesh after Shekalim in that case
(`shekalim-machar-chodesh`), but Luach found no source for whether it does so after
HaChodesh or the Chanukah haftara. **Until decided:** no verses are added.

(Q-03 is not about Luach and is kept with the project's private records.)

## Proposals

### P-01. Apache-2.0 with a NOTICE file
**Why:** Apache-2.0 requires redistributors to carry the NOTICE text, which is the closest
standard licence to "use it freely, but credit Yosef". It also has an explicit patent grant.
MIT would only require keeping the copyright line inside the licence text.
**Default until decided:** Apache-2.0. Choosing MIT would change only `LICENSE` and `NOTICE`.
ADR: `docs/decisions/0002-licence-and-clean-room.md`.

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

### P-06. What `isInIsrael` covers
The built-in boundary is a simplified outline of the area where communities keep one day of
Yom Tov: the State of Israel with Judea and Samaria, the Golan Heights and Gaza, accurate to
a few kilometres. **Why:** the function exists to choose Israel or diaspora rules; it makes
no political statement, and callers can always pass `israel` explicitly. **Default until
decided:** as described (`ISRAEL_BOUNDARY` in `src/places/places.ts`).

### P-07. Per-module ESM output and name tables
See ADR 0005. **Default until decided:** as proposed.

## Settled

### Q-02. How credit should read
Settled by D-07: "Built on Luach by Yosef Skolnick".

### Q-05. Modern Israeli days before their amendments
Settled by D-08. Each rule applies from the year it was adopted
(`docs/research/2026-10-21-modern-israeli-days.md`): Yom HaShoah Friday → Thursday from 1959,
the year of the law (the 1951 Knesset resolution had no weekday rule, so 1954, with 27 Nisan
on Friday, stays on Friday), and Sunday → Monday from 1997; Yom HaAtzmaut Monday → Tuesday
from 2004. Not modelled: the 1954 date of the Shabbos → Thursday rule for Yom HaAtzmaut
(applied from 1949), and the uncertain 1950 date. The 7 October memorial day (24 Tishrei) is
not built yet (HOL-16). These days are optional and off by default.

### Q-06. The example citation in the brief
Settled by D-09. The brief's example, "Magen Avraham, 72 minutes as 16.1°; Shulchan Aruch
Harav 89:1", is only partly accurate (`docs/research/2026-10-21-zmanim-opinions.md`): the
Magen Avraham (OC 58:1) says the day runs from alos, not 72 minutes or 16.1°; 72 minutes is
4 mil of 18 minutes (Pesachim 94a; SA OC 459:2); 16.1° is a modern Jerusalem-equinox
conversion; and Shulchan Aruch HaRav 89:1 gives no minutes (459:10 makes a mil 24 minutes).
Luach cites each part separately, as in `src/zmanim/opinions.ts`.

### P-05. Move table-only learning cycles after 1.0
Settled by D-06. These cycles cannot be computed from structure: each needs a published
day-by-day table (or, for Schottenstein, seven tractate lengths not yet found). Shipping a
publisher's table needs its licence or permission, and a guess would be wrong. They are
listed as post-1.0 in the roadmap.

### P-08. Freeze the shared tables
Settled by D-11. `ZMANIM` (and each entry), `DEFAULT_DAY_ZMANIM`, the places from
`getPlace()`, `builtInPlaces()` and `fullPlaces()`, and `ISRAEL_BOUNDARY` were plain objects
and arrays, so a caller's write would change every later result in the process. They are now
deeply frozen where they are built (`test/immutability.test.ts`). A wrong zman is worse than
a missing one, and a server or app shares one copy.

### P-09. Tachanun after Sukkos: which default
Settled by D-14. The sources Luach read put the custom of no Tachanun through the end of
Tishrei with the Sephardim and Israel (Knesses HaGedolah in Kaf HaChaim OC 131:98), and the
Ashkenazi works against it: Sha'arei Teshuvah 131:19 "במדינות אלו אין המנהג כן", Aruch
HaShulchan OC 131:12 "ואינו עיקר", Kitzur SA 22:8 (through Isru Chag). The default now
follows the place.

## As built

An entry marked *replaced* has been superseded by a later one; the later entry gives the
current behaviour.

- **AB-01** *As built:* `gematriya()` writes an exact multiple of 1000 like its units digit (א׳ is 1
  or 1000); `parseGematriya('א׳')` returns 1.
- **AB-02** *As built:* `formatHebrewDate()` omits the year's thousands by default (תשפ״ז).
- **AB-03** *As built:* Purim Meshulash is listed on 16 Adar (the Sunday, third of its three days).
- **AB-04** *As built:* Leil Selichos is listed on the Shabbos whose night begins Selichos (Ashkenaz).
- **AB-05** *As built (replaced by AB-37):* Yom Kippur Katan (optional) is not listed before Rosh
  Chodesh Tishrei, Cheshvan, Teves or Iyar, and moves to Thursday from Friday/Shabbos (MB 417:4).
- **AB-06** *As built (replaced by AB-38):* BeHaB (optional) is the Monday, Thursday and Monday after
  the first Shabbos of Cheshvan and of Iyar.
- **AB-07** *As built:* the molad is read as Jerusalem mean time at longitude 35.2354° E when turned
  into an instant (Kiddush Levana times).
- **AB-08** *As built:* Tachanun defaults: no Tachanun from Erev Yom Kippur through the end of Tishrei,
  and from Rosh Chodesh Sivan through 12 Sivan; both are options. (After Sukkos, see D-14.)
- **AB-09** *As built:* the Omer count text defaults to Nusach Ashkenaz wording; Sefard and Edot
  HaMizrach are options.
- **AB-10** *As built:* zmanim default to sea-level sunrise and sunset (`useElevation: false`);
  degree-based zmanim are always at sea level.
- **AB-11** *As built:* rounding is on by default (earliest times up, deadlines down).
- **AB-12** *As built:* candle lighting defaults to 18 minutes; havdala and second-night candles to 8.5°.
- **AB-13** *As built:* Mincha Gedola (Gra) is 6.5 seasonal hours after sunrise; "30 minutes" is after
  astronomical chatzos; chatzos is the solar transit.
- **AB-14** *As built (source replaced by AB-40):* Plag HaMincha per the Levush is the Gra's
  calculation.
- **AB-15** *As built:* fasts begin at alos 72 minutes (rounded down) and end at 7.083° by default.
- **AB-16** *As built:* the Hebrew date at an instant changes at sunset by default (`hebrewDateAt`).
- **AB-17** *As built:* the horizon dip for elevation uses the earth's mean radius, 6,371 km.
- **AB-18** *As built:* high-latitude fallbacks (`nearestDay`, `halfNight`) are off by default.
- **AB-19** *As built:* haftara defaults: Ashkenaz; Shabbos HaGadol's haftara always (Ashkenaz and
  Sephardi), only when Erev Pesach is Shabbos (Chabad), never (Teimani). (Kedoshim: see AB-44.)
- **AB-20** *As built:* Daf HaShavua runs Sunday–Shabbos from 6 March 2005 (back-computed; low confidence).
- **AB-21** *As built:* Mishna Yomis cycles before the 14th (2021) are counted back from it.
- **AB-22** *As built:* Amud HaYomi returns null after Me'ilah 22a (2038) until Dirshu publishes how
  Kinnim, Tamid and Middos are learned.
- **AB-23** *As built:* the built-in city table was chosen for Luach: cities with Jewish communities,
  plus test cities for high latitude and the date line. Israeli communities that GeoNames puts
  in Asia/Hebron are given Asia/Jerusalem, the time they keep. (Count: see AB-41.)
- **AB-24** *As built:* place search ranks exact, prefix, transliteration-skeleton, then substring
  matches, with larger places first on ties.
- **AB-25** *As built:* the day view's default zmanim are alos 72 min and 16.1°, misheyakir 11°,
  sunrise, Shema (MGA 72, Gra), Tefilla (Gra), chatzos, Mincha Gedola (later of two), Mincha
  Ketana and Plag (Gra), sunset, tzeis 8.5° and Rabbeinu Tam: a common set, not a ruling.
- **AB-26** *As built:* the CLI prints Ashkenazi names by default (`--locale` changes it).
- **AB-27** *As built:* iCal events are all-day for holidays, parsha and learning, and zero-length at the
  instant for candle lighting, havdala and zmanim.
- **AB-28** *As built:* Israeli commemorations (option `israeliCommemorations`) are listed from the
  year of each law; Yom HaAliyah on 7 Cheshvan only; Begin Day on 4 Adar II in a leap year
  (the law says "4 Adar"; Begin died on 4 Adar II); Chag HaBanot on 1 Teves.
- **AB-29** *As built:* the plain-English locale (`en`) uses "Tishri, Heshvan, Iyyar" spellings and
  "Saturday".
- **AB-30** *As built:* the demo app opens on Jerusalem with Ashkenazi names until the user picks a
  place or language; its opinion pickers offer alos 72 min / 16.1° / 90 min; Shema Gra / MGA 72 /
  MGA 16.1° / Baal HaTanya; tzeis 8.5° / 7.083° / 50 min / Rabbeinu Tam (first of each is
  selected). "Use my location" runs on the device only and keeps nothing.
- **AB-31** *As built:* Hebrew zman labels put a left-to-right mark after each degree sign so "16.1°"
  does not flip in right-to-left text.
- **AB-32** *As built:* before 1.0, a patch release fixes bugs only; anything that changes an API, a
  default or a calculated result someone may depend on is a minor release (`RELEASING.md`).
- **AB-33** *As built:* `npm publish` runs `npm run check` first (`prepublishOnly`); the version is set
  in one step by `npm run release:version`.
- **AB-34** *As built:* the city-data files ship without source maps (they are generated tables), which
  halves the package.
- **AB-35** *As built:* security reports go through GitHub's private vulnerability reporting; the code
  of conduct is Luach's own, short text.
- **AB-36** *As built:* Pirkei Avos defaults to one chapter a week on the summer Shabbosim
  (`cycle: 'single'`); doubling up at the end is an option.
- **AB-37** *As built (supersedes AB-05):* Yom Kippur Katan (optional) is not listed before Rosh
  Chodesh Tishrei, Teves or Iyar, nor by default before Cheshvan (AB-59). When Erev Rosh
  Chodesh is Shabbos, it is on Thursday (Magen Avraham 417:3: Rosh Chodesh on Sunday, fast on Thursday;
  MB 417:4). When it is Friday the sources differ: Magen Avraham 417:3 keeps it on Friday ("ואם
  חל ר"ח בשבת מתענין ביום ו'"); MB 417:4 says those who say Selichos fast on Thursday and those
  who don't on Friday. Option `yomKippurKatanOnFriday`: `'thursday'` (default; @hebcal/core,
  the test oracle, agrees) or `'friday'`. The default is a default, not a ruling.
- **AB-38** *As built (supersedes AB-06):* BeHaB (optional) is the Monday, Thursday and Monday
  after the first Shabbos *after* Rosh Chodesh Cheshvan and Iyar (MB 492:3, "שבת הראשון שאחר
  ר"ח"). When 1 Cheshvan or 1 Iyar is Shabbos, that Shabbos is Rosh Chodesh and is not counted
  (5785: 11, 14 and 18 November 2024).
- **AB-39** *As built (adds to AB-12):* a place may carry its documented candle-lighting custom,
  and the day view (and so the CLI and iCal) uses it when the caller has not set
  `candleLightingMinutes`, labelled with the custom and its source. Set only where a source was
  read: Jerusalem 40 and Haifa 30 (Peninei Halakha, Shabbat 3:2; Jerusalem also Zemanim 13:5
  n. 11). Not set: Zichron Yaakov 30 (no source found beyond other software's settings);
  Petach Tikva 40 (one article by R. Eliezer Melamed, "Adding Sanctity to the Sabbath", says
  so; his Peninei Halakha does not); the Shomron 30 (same article; a region, not a city).
  Lu'ach Eretz Yisrael is reported to give Jerusalem 25 (not verified).
- **AB-40** *As built (supersedes AB-14 as to its source):* Plag HaMincha per the Levush is
  computed as the Gra's. The source is Levush OC 267 as reported in Biur Halacha 261:2
  ("1¼ hours before sunset"); Magen Avraham 233:3 reads the Levush as counting from tzeis.
  See `docs/research/2026-10-21-citation-audit-zmanim.md`.
- **AB-41** *As built (supersedes the count in AB-23):* the built-in table has 197 places,
  including cities with Jewish communities such as Toms River, Spring Valley, Queens, Boca
  Raton, Skokie, Salford, Durban, Calgary, Montevideo and Brisbane, and Borough Park and
  Immanuel. Left out: Cairo (almost no community today) and Nazareth (Nof HaGalil would be
  the Jewish town; not added).
- **AB-42** *As built (adds to AB-24):* a transliteration match needs a skeleton of at least
  four consonants, and a skeleton-prefix match must cover three quarters of the name, so
  "Tzfat", "Boro Park" and "Emmanuel" find the right places and not Zefta, a São Paulo district
  or Manila. The full table carries the built-in table's spellings for the same GeoNames city
  and every non-historic Hebrew name GeoNames has. The CLI takes a loose full-table match only
  when no built-in place matches at all.
- **AB-43** *As built:* the CLI's `--city` searches the built-in places, then (only when none
  matches by name or prefix) the full table, loaded on demand; `--lat/--lon` need `--tz` (the
  computer's own zone is never assumed); `--elevation <m>` turns on elevation-adjusted sunrise
  and sunset (`useElevation`) and says so in the output.
- **AB-44** *As built (supersedes the Kedoshim part of AB-19):* Ashkenazi Kedoshim is Ezekiel
  22:1-16 (Rema, ArtScroll, Ezras Torah luach), except when Acharei Mos's own haftara (Amos
  9:7-15) was displaced: then Kedoshim reads Amos 9:7-15 (MB 428:26, citing R. Akiva Eiger, who
  names Machar Chodesh; Luach applies the same reason to Shabbos HaGadol and Rosh Chodesh).
  `@hebcal/leyning` agrees, apart from ending Ezekiel 22 at 22:19.
- **AB-45** *As built:* Ashkenazi Shabbos Shuva adds Micah 7:18-20 when the parsha is Vayelech
  and Joel 2:15-27 when it is Haazinu (the Dagul Mervava, MB 428:23). Option `shuvaAddition`:
  `'micah'`, `'joel'` or `'both'` (Luach puts Joel before Micah, in book order, which the MB
  does not specify).
- **AB-46** *As built:* haftara options `roshChodeshAv` (default `'affliction'`, Shim'u, per
  MB 425:8 following the Gra; `'roshChodesh'`, Isaiah 66, which the Rema OC 425:1 calls
  primary where there is no custom) and `roshChodeshElul` (default by minhag;
  `'consolation'` per the SA OC 425:1, `'roshChodesh'` per the Rema there, with Re'eh's
  haftara added on Ki Seitzei per MB 425:7).
- **AB-47** *As built (adds to AB-36):* `pirkeiAvos` skips Shabbos Erev Tisha B'Av (8 Av; Rema
  OC 553:2). With `until: 'shavuos'` (Kaf HaChaim 292:23) it reads chapters 1–6 before
  Shavuos; a seventh Shabbos (Israel, when Pesach begins on Shabbos) returns null, since the
  source does not say what is read then.
- **AB-48** *As built:* in year 9999, the last supported year, answers that need a date in year
  10000 are left out rather than guessed: `readingCycle(9999)` stops at the last Shabbos of 9999
  (its joins still use the known weekday of 1 Tishrei 10000); `parshaFor` (and
  `dayInfo().parsha`) is null for the few days whose coming Shabbos is in 10000. Leil Selichos
  and candle lighting on 29 Elul 9999 are computed (Rosh Hashana 10000 is always Yom Tov).
- **AB-49** *As built (adds to AB-18):* when turned on, `nearestDay` and `halfNight` replace a
  time only when the sun does not get low enough (`sun-always-above`, summer nights). In polar
  night (`sun-always-below`) the time stays `null` with its reason, since any time would be
  invented.
- **AB-50** *As built:* caller-supplied angles for havdala and second-night candles must be more
  than 0.833° (sunset) and at most 30° below the horizon; minutes after sunset more than 0 and
  at most 180; candle-lighting minutes 0–180. Anything else, or a non-finite number, throws a
  `RangeError` (`DEPRESSION_RANGE`, `MINUTES_RANGE`).
- **AB-51** *As built:* UTC offsets from `Intl` are not rounded to whole minutes (historical
  local mean time has seconds), and rounded zmanim are rounded to whole minutes of the local
  clock, which is the same as UTC minutes for every zone with a whole-minute offset.
- **AB-52** *As built:* the day JSON Schema ships in the package as `luach/schema/day.schema.json`
  (`docs/schema/` keeps an identical copy, checked by a test). Its `$id`, and `$schema` in
  every `dayInfo()` object, is
  `https://raw.githubusercontent.com/yskolnick/luach/main/schema/day.schema.json`, a URL that
  serves the JSON. Every object in the schema with a fixed shape, including `learning`, is
  closed (`additionalProperties: false`).
- **AB-53** *As built:* the import and licence checks read code with a small tokenizer of their
  own (`scripts/lib/js-scan.mjs`), fail on `createRequire`, computed `import()`/`require()` and
  devDependency names in strings, and check the built `dist/` for oracle text and package
  imports; `npm run check` builds before the licence check (ADR 0006).
- **AB-54** *As built:* CI builds once and smoke-tests the built package on Node 18, 20 and 22
  (ESM, CommonJS, the `exports` map and the CLI), in Bun (ESM and CommonJS), in Deno (ESM) and
  in headless Chromium (`test/runtimes/`, ADR 0007).
- **AB-55** *As built:* the example server's `/calendar.ics` serves at most 400 days with a place
  (candle lighting and havdala make each day costly) and 5 × 366 days without, answering a
  longer range with 400 Bad Request.
- **AB-56** *As built:* the day view on a Shabbos before Tisha B'Av postponed to Sunday gives
  `shabbosEnds` (when Shabbos ends; not havdala) and `fastBeginsTonight`, and havdala over a cup
  when the fast ends on Sunday night (SA OC 556:1; MB 556:2). `fastBeginsTonight` is also set on
  Erev Yom Kippur and Erev Tisha B'Av.
- **AB-57** *As built (D-12):* `mourningPeriods(date, options)` reports the restrictions
  (haircuts, weddings, meat and wine, laundry) only for customs the caller names: six Sefirah
  customs (SA, Rema and MB 493; Kaf HaChaim OC 493:13), Ashkenaz or Sephard for the Three Weeks
  (SA and Rema OC 551:2–4; MB 558:3–4), four meat-and-wine customs (SA OC 551:9; MB 551:58–59;
  Kaf HaChaim OC 551:125), ending on 10 Av per SA or Rema OC 558:1. There is no default (D-15);
  with no custom, `restrictions` is `null`, and a day the sources read do not settle is `null`.
  It also gives `weekOfTishaBav` (none when 9 Av is Sunday or Shabbos, SA OC 551:4).
- **AB-58** *As built (D-12):* Tachanun is omitted on Pesach Sheni by default
  (`pesachSheniTachanun: 'omit'`; Kaf HaChaim OC 131:98; Sha'arei Teshuvah 131:19; Aruch
  HaShulchan OC 131:12); `'say'` follows the Shulchan Aruch's list.
- **AB-59** *As built (D-12):* Yom Kippur Katan is not kept before Tishrei (SA OC 581:2), Iyar
  (MB 429:10) or Teves (SA OC 670:1); before Cheshvan it is off by default (D-16) and on with
  `yomKippurKatanCheshvan` (Kaf HaChaim OC 417:16 says to fast; Luach found no source for
  leaving it out).
- **AB-60** *As built (D-12):* `amidahSeason` says "mashiv haruach" at Shacharis of the first
  day of Pesach (it changes at Musaf), and "morid hatal" by `nusach`: not for Ashkenaz outside
  Israel (Rema OC 114:3, the default), yes for other nusachos and in Israel (MB 114:3, 13;
  Tashbetz Katan 101).
