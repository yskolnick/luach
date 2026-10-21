# Roadmap

Status: `planned` · `in progress` · `done` · `deferred` (reason + Yosef's approval) · `post-1.0`.
Sources are primary or public-domain. "Oracle" means an independent implementation used only in tests
(hebcal, kosher-zmanim, astronomy-engine — devDependencies, never shipped), or values hand-entered from a
published luach with the source named in the test.

User research behind this list: `docs/research/2026-10-21-what-users-want.md`.

## M1. Core calendar

| ID | Feature | Source | Test | Status |
|---|---|---|---|---|
| CAL-01 | Hebrew ↔ Gregorian conversion, Hebrew years 1–9999, proleptic Gregorian before 1582 (AB-02) | Rambam, Kiddush HaChodesh 6–8; Gregorian rules (Inter gravissimas, 1582) | round-trip property 1900–2240; oracle hebcal daily 1900–2240 | done |
| CAL-02 | Molad of any month, with day, hours and chalakim | Rambam KH 6:2–8 (month 29d 12h 793p; BaHaRaD) | oracle hebcal molad 5660–6000; published molad announcements | done |
| CAL-03 | Leap years: the 19-year cycle (3, 6, 8, 11, 14, 17, 19) | Rambam KH 6:11 | property: 7 leap years in every cycle; oracle | done |
| CAL-04 | The four dechiyos (molad zaken, lo ADU rosh, GaTaRaD, BeTU'TaKPaT) | Rambam KH 7:1–8 | property: RH never Sun/Wed/Fri; year lengths 353–355/383–385; oracle | done |
| CAL-05 | Year type (chaseira / kesidra / sheleima), keviah letters, day of week | Rambam KH 8:5–8; Tur OC 428 (keviyos) | property: only 14 keviyos occur; oracle | done |
| CAL-06 | Days in month / year; Adar I and II; Cheshvan and Kislev lengths | Rambam KH 8:5–6 | property; oracle | done |
| CAL-07 | Yahrzeit and birthday (bar/bas mitzvah) anniversaries, with both customs for Adar, Cheshvan 30 and Kislev 30 | Shulchan Aruch OC 568:7 and Rema; Magen Avraham 568:20; OC 55:10 (bar mitzvah in Adar) | hand-entered cases; oracle hebcal | done |
| CAL-08 | Hebrew numerals / gematriya, geresh and gershayim, ט״ו and ט״ז, years with or without thousands | standard Hebrew orthography | unit tables; round-trip parse | done |
| CAL-09 | Month and holiday names: Hebrew, Ashkenazi, Sephardi/Israeli, English; pluggable name tables | — | unit | done |
| CAL-10 | RTL safety: opt-in Unicode isolates (U+2067/U+2069) around Hebrew output | Unicode Bidirectional Algorithm (UAX #9) | unit | done |
| CAL-11 | Property invariants over 5660–6000: Pesach day 1 = Tisha B'Av weekday (at-bash); YK never Fri/Sun; Purim never Sat/Mon/Wed; Hoshana Rabba never Sat | Tur OC 428 | property | done |
| CAL-12 | Day of week, days between dates, add days/months/years to a Hebrew date | — | property | done |
| CAL-13 | Civil date from `Date` in a given IANA zone, and "Hebrew date now" after sunset | — | unit | done |

## M2. Holidays and special days

All events carry flags: `yomTov` (melacha forbidden), `cholHamoed`, `fast` (`major`/`minor`), `roshChodesh`, `modernIsraeli`, `minor`, `specialShabbos`, `erev`, `isruChag`, plus `israel`/`diaspora` scope.

| ID | Feature | Source | Test | Status |
|---|---|---|---|---|
| HOL-01 | Yomim Tovim: RH, YK, Sukkos, Shemini Atzeres/Simchas Torah, Pesach, Shavuos; Yom Tov Sheni in the diaspora; Israel rules | Torah; SA OC 496 | oracle hebcal 50 years, Israel and diaspora | planned |
| HOL-02 | Chol Hamoed, Hoshana Rabba, Isru Chag, Erev Yom Tov | SA OC 429 (Isru Chag: Rema OC 429:2) | oracle | planned |
| HOL-03 | Fasts with postponement: Tzom Gedalia, Asara B'Teves (can fall on Friday), Shiva Asar B'Tammuz, Tisha B'Av (nidcheh), Taanis Esther (Thursday rule), Taanis Bechoros (Thursday when 14 Nisan is Shabbos) | SA OC 549–550, 686:2, 470:2 | oracle; property (no fast on Shabbos except YK) | planned |
| HOL-04 | Fast start/end times with zmanim (needs M4) | SA OC 562, 564 | oracle kosher-zmanim | planned |
| HOL-05 | Chanukah with candle count per night | SA OC 670–671 | oracle | planned |
| HOL-06 | Purim, Shushan Purim, Purim Meshulash, Purim Katan, Shushan Purim Katan | SA OC 688, 697 | oracle; hand-entered Meshulash years (5765, 5768, 5781, 5785) | planned |
| HOL-07 | Tu B'Shvat, Lag BaOmer, Tu B'Av, Pesach Sheni, Shloshes Yemei Hagbala, Lag BaOmer | Mishna RH 1:1; SA OC 493 | oracle | planned |
| HOL-08 | Rosh Chodesh (1 or 2 days), Shabbos Mevorchim, molad announcement text (Hebrew/English) | SA OC 417, 284:7 (Mishna Berura 417) | oracle | planned |
| HOL-09 | Special Shabbosos: Shuva, Shira, Shekalim, Zachor, Parah, HaChodesh, HaGadol, Chazon, Nachamu, Chol Hamoed | SA OC 685, 430 | oracle | planned |
| HOL-10 | Optional, off by default: BeHaB, Yom Kippur Katan, Shovavim(-Tat) | SA OC 492; Magen Avraham 417 | oracle; hand-entered | planned |
| HOL-11 | Optional, off by default: Yom HaShoah, Yom HaZikaron, Yom HaAtzmaut, Yom Yerushalayim with Knesset postponement rules; Yom HaAliyah, Sigd | Israeli laws (1951, 1959, 1963, 1998, 2004 amendments) | oracle | planned |
| HOL-12 | Sefiras HaOmer: day, weeks-and-days text in Hebrew and English, sefirah | SA OC 489; Kabbalistic sefiros (Siddur) | unit; oracle | planned |
| HOL-13 | V'sein tal umatar start: 7 Cheshvan in Israel; diaspora 60th day from Tekufas Tishrei (Shmuel), computed, not hard-coded | Taanis 10a; SA OC 117:1 | oracle; hand-entered 1900–2200 | planned |
| HOL-14 | Mashiv haruach / morid hatal periods | SA OC 114 | unit | planned |
| HOL-15 | Birkas HaChama (28-year cycle from Tekufas Nisan of Shmuel) | Berachos 59b; SA OC 229:2 | hand-entered (1953, 1981, 2009, 2037) | planned |
| HOL-16 | Kiddush Levana earliest (3 days, 7 days) and latest (half the month by molad, 15 days) | SA OC 426:3–4, Rema; Mishna Berura 426 | oracle kosher-zmanim | planned |
| HOL-17 | Tachanun / Hallel indicators (optional) | SA OC 131, 422 | unit | planned |
| HOL-18 | Holiday queries: by year, by range, filters | — | unit | planned |

## M3. Parsha, haftara and learning cycles

| ID | Feature | Source | Test | Status |
|---|---|---|---|---|
| PAR-01 | Weekly parsha, Israel and diaspora, doubled parshiyos, divergence weeks | Tur OC 428 (keviyos tables) | oracle hebcal Sedra 5660–6000 both locations | planned |
| PAR-02 | `null` on Shabbos that is Yom Tov / Chol Hamoed, with the special reading | SA OC 488, 490, 663 | oracle | planned |
| PAR-03 | Haftara by minhag (Ashkenaz, Sephardi, Chabad; Teimani only with a source), special haftaros; references only | SA OC 284, 425, 428; Mishna Berura | hand-entered from a printed Chumash (named per test) | planned |
| PAR-04 | Pirkei Avos chapter on summer Shabbosim, with cycle customs | Rema OC 292:2 | hand-entered | planned |
| LRN-01 | Daf Yomi Bavli (from 11 Sept 1923) | published cycle | oracle @hebcal/learning (BSD) | planned |
| LRN-02 | Daf Yomi Yerushalmi, Vilna and Schottenstein (if a public table exists) | published cycle | oracle | planned |
| LRN-03 | Mishna Yomis | published cycle | oracle | planned |
| LRN-04 | Rambam 3 chapters, 1 chapter; Sefer HaMitzvos | published cycle (Chabad) | oracle | planned |
| LRN-05 | Nach Yomi | published cycle | oracle | planned |
| LRN-06 | Chofetz Chaim and Shemiras HaLashon yomi | published cycle | oracle / hand-entered | planned |
| LRN-07 | Tanya Yomi | published cycle | oracle | planned |
| LRN-08 | Halacha Yomis (Mishna Berura) | published cycle | hand-entered | planned |
| LRN-09 | Daf HaShavua, Amud Yomi | published cycles | hand-entered | planned |
| LRN-10 | Siyum dates for each cycle | derived | unit | planned |

## M4. Zmanim

| ID | Feature | Source | Test | Status |
|---|---|---|---|---|
| ZMN-01 | NOAA solar position and sunrise/sunset/angle times | NOAA Solar Calculator (public domain), Meeus ch. 25 | oracle astronomy-engine; kosher-zmanim | planned |
| ZMN-02 | Second algorithm for cross-check (Meeus higher-accuracy) | Meeus | unit compare | planned |
| ZMN-03 | Sea level vs elevation-adjusted; caller horizon angle (Q-08) | — | oracle | planned |
| ZMN-04 | Alos 72/90/96/120 min; 16.1°, 18°, 19.8°, 26° | Pesachim 94a; Magen Avraham OC 58 / 89; Minchas Cohen | oracle kosher-zmanim | planned |
| ZMN-05 | Misheyakir 10.2°, 11°, 11.5°, 7.65° (Q-09) | SA OC 18:3; Igros Moshe | oracle | planned |
| ZMN-06 | Netz sea level and elevation | — | oracle | planned |
| ZMN-07 | Sof zman Shema / Tefilla: Gra, Magen Avraham (72, 90 fixed and zmaniyos, 16.1°), Baal HaTanya, Ateret Torah | SA OC 58:1, 89:1; Biur HaGra; SA HaRav | oracle | planned |
| ZMN-08 | Chatzos, Chatzos Halayla | SA OC 1 | oracle | planned |
| ZMN-09 | Mincha Gedola (30 min, half shaah zmanis, later of the two) | SA OC 233:1; Mishna Berura 233 | oracle | planned |
| ZMN-10 | Mincha Ketana, Plag HaMincha (Gra, Magen Avraham, Levush) | SA OC 233:1 | oracle | planned |
| ZMN-11 | Shkiah (sea level, elevation) | — | oracle | planned |
| ZMN-12 | Bein HaShmashos: Rabbeinu Tam, Geonim, Yereim | Shabbos 34b–35a; Tosafos | oracle | planned |
| ZMN-13 | Tzeis: 8.5°, 7.083°, 42, 50, 60, 72 min, Rabbeinu Tam | SA OC 261, 293 | oracle | planned |
| ZMN-14 | Shaah zmanis per opinion | — | oracle | planned |
| ZMN-15 | Candle lighting (configurable; 18 default; Jerusalem 40; others as reported customs) | SA OC 261; Mishna Berura 261:23 | hand-entered luach values | planned |
| ZMN-16 | Havdala by degrees or minutes; second-night Yom Tov candles after tzeis | SA OC 293; 514 | oracle | planned |
| ZMN-17 | Erev Pesach: sof zman achilas / biur chametz (Gra, MA) | SA OC 443:1 | oracle | planned |
| ZMN-18 | Fast start/end by opinion | SA OC 562 | oracle | planned |
| ZMN-19 | High-latitude fallback, off by default, clearly marked | — | unit (Tromsø, Reykjavik) | planned |
| ZMN-20 | `Zman` return object `{ time, opinion, source, rounded, reason? }` + `toJSON` | — | unit | planned |
| ZMN-21 | Rounding: earliest rounds up, deadline rounds down, per-zman default, overridable, can be off | — | unit | planned |
| ZMN-22 | Time zones via IANA ids through Intl; pluggable provider where Intl is missing; regression for Sydney/Auckland/Chatham day boundary | — | unit + oracle 19 cities x 4 years | planned |

## M5. Places

| ID | Feature | Source | Test | Status |
|---|---|---|---|---|
| PLC-01 | Small built-in city table (coords, elevation, IANA zone, Israel flag, Hebrew name) | GeoNames (CC-BY 4.0) | data validation tests | planned |
| PLC-02 | Optional full dataset as a separate import (`luach/cities-full`) | GeoNames | size budget | planned |
| PLC-03 | Search by name incl. Hebrew and alternate spellings | — | unit | planned |
| PLC-04 | `isInIsrael(lat, lon)` with documented boundary and override | — | unit | planned |
| PLC-05 | Docs: plugging in a platform geocoder (no built-in network) | — | docs | planned |

## M6. Outputs and integrations

| ID | Feature | Source | Test | Status |
|---|---|---|---|---|
| OUT-01 | ESM + CJS + types; Node, browser, Deno, Bun, React Native (Hermes) | — | CI smoke on each | planned |
| OUT-02 | iCal (.ics) export of holidays, zmanim, learning | RFC 5545 | unit + validator | planned |
| OUT-03 | `getDay()` JSON "everything about this day" + JSON Schema | JSON Schema 2020-12 | schema validation test | planned |
| OUT-04 | CLI: `luach today --city Lakewood`, `luach zmanim DATE --lat --lon` | — | unit + snapshot | planned |
| OUT-05 | Example HTTP server (examples/, not shipped) | — | smoke | planned |
| OUT-06 | Formatting helpers: "י״ד אדר תשפ״ז", English, short/long | — | unit | planned |

## M7. Docs and examples (demo app removed by D-02)

| ID | Feature | Status |
|---|---|---|
| DOC-01 | Docs site (static): getting started, recipes, API reference from TSDoc | planned |
| DOC-02 | Halachic notes per opinion with sources; "Ask your rav. This library calculates; it does not rule." | planned |
| DOC-03 | Accuracy report generated from oracle tests | planned |
| DOC-04 | Licence and how to credit | planned |
| DOC-05 | Examples: Node, browser, React, React Native (code only), CLI | planned |
| APP-01 | Expo demo app | deferred — D-02 ("Expo isn't part of this run") |

## M8. Release

| ID | Feature | Status |
|---|---|---|
| REL-01 | GitHub Actions CI: typecheck, lint, unit, property, oracle, Hermes, licence check, size budget | planned |
| REL-02 | Semver, CHANGELOG.md, release script | planned |
| REL-03 | RELEASING.md (Yosef publishes; token never handled by agents) | planned |
| REL-04 | SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates, README "How to credit" | planned |

## Post-1.0

| ID | Feature |
|---|---|
| P1-01 | Swift and Kotlin ports generated from the shared test vectors |
| P1-02 | WebAssembly build |
| P1-03 | Printable luach PDF |
| P1-04 | Visible netz with terrain data (Q-08) |
