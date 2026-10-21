# Luach roadmap

Every feature has an ID, a one-line spec, its source, and how it is tested. Status is one of
**done**, **in progress**, **planned**, **post-1.0** (moved to a later milestone) or
**deferred** (needs Yosef's approval; see `DECISIONS.md`).

Oracles used in tests (devDependencies only, never shipped): `@hebcal/core` (GPL-2.0+),
`kosher-zmanim` (LGPL), `astronomy-engine` (MIT), and published values entered by hand
with their source. "Oracle: hebcal" means the test compares against `@hebcal/core`.

Research behind the extra items (marked †): `docs/research/2026-10-21-what-users-want.md`.

## M0. Repository and process

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| REPO-01 | Apache-2.0 `LICENSE` + `NOTICE` naming Yosef Skolnick | P-01 | licence check in CI | done |
| REPO-02 | `AGENTS.md`, `CLAUDE.md`, `ROADMAP.md`, `DECISIONS.md`, ADRs, `docs/data-sources.md` | plan §3 | review | done |
| REPO-03 | Clean-room guard: `src/` imports nothing; no runtime deps with non-permissive licences; no `eval`/network | plan §1 | `scripts/check-imports.mjs`, `scripts/check-licenses.mjs` | done |
| REPO-04 | Bundle size budget | plan §M8 | `scripts/check-size.mjs` | done |

## M1. Core calendar

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| CAL-01 | Gregorian ↔ Hebrew for Hebrew years 1–9999, proleptic Gregorian | Rambam KH 6–8; Hinnant (PD) civil algorithm | oracle: hebcal every day 1900–2240; property round-trips over full range | done |
| CAL-02 | Molad of any month, in chalakim; announcement clock form | Rambam KH 6:2–8 | BaHaRaD; oracle: hebcal molad 5660–6000 | done |
| CAL-03 | Leap years (19-year cycle) | Rambam KH 6:11 | oracle: hebcal | done |
| CAL-04 | The four dechiyos | Rambam KH 7:1–7 | properties: RH never Sun/Wed/Fri; YK never Fri/Sun; lengths 353–355/383–385 | done |
| CAL-05 | Year types (chaserim, kesidran, shleimim) | Rambam KH 8:5–6 | property: type ↔ month lengths | done |
| CAL-06 | Day of week; days in month/year; Adar I/II | — | unit + oracle | done |
| CAL-07 | Yahrzeit/birthday/bar mitzvah in Adar, 30 Cheshvan, 30 Kislev with both customs | Rema OC 55:10; SA OC 568:7 with Rema; Magen Avraham 568:20, MB 568:42 | unit; oracle: hebcal yahrzeit (Adar I custom) | done |
| CAL-08 | Gematriya with geresh/gershayim, 15/16 rule, with/without thousands; parsing | — | unit; round-trip 1–9999; oracle: hebcal 1–999 | done |
| CAL-09 | Names in Hebrew, Ashkenazi, Sephardi/Israeli and plain English; pluggable tables | — | unit | done |
| CAL-10 | RTL: opt-in Unicode isolates; docs explain why | Unicode UAX #9 | unit | done |
| CAL-11 | `HebrewDate` with `afterSunset` input † | research §2 | unit | done |
| CAL-12 | Parse Hebrew date strings ("י״ד אדר תשפ״ז", "14 Adar 5787") † | research §10 | unit | planned |
| CAL-13 | Day-boundary-aware "Hebrew date now at a place" (uses zmanim) † | research §2 | unit with zmanim | done |

## M2. Holidays and special days

All events carry flags: `yomTov`, `melachaForbidden`, `cholHamoed`, `fast` (`major`/`minor`),
`roshChodesh`, `modernIsraeli`, `minor`, `specialShabbos`, `erev`, `isruChag`, plus `israelOnly`/`diasporaOnly`.

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| HOL-01 | Rosh Hashana, Yom Kippur, Sukkos, Shemini Atzeres, Simchas Torah, Pesach, Shavuos, with Yom Tov Sheni outside Israel | Torah; SA OC 496 | oracle: hebcal 50 years, Israel + diaspora | done |
| HOL-02 | Chol Hamoed, Hoshana Rabba, Isru Chag, Erev Yom Tov | Rema OC 429:2 (Isru Chag) | oracle: hebcal | done |
| HOL-03 | Fasts with nidcheh rules: Tzom Gedalia, Asarah B'Teves, Taanis Esther (Thursday rule), 17 Tammuz, Tisha B'Av, Taanis Bechoros (Thursday) | SA OC 549–550, 686:2, 470:2 | oracle: hebcal | done |
| HOL-04 | Chanukah with candle count; Purim, Shushan Purim, Purim Meshulash, Purim Katan, Shushan Purim Katan | SA OC 670–697; 688:6 | oracle: hebcal | done |
| HOL-05 | Tu B'Shvat, Lag BaOmer, Tu B'Av, Pesach Sheni, Shloshes Yemei Hagbala | — | oracle: hebcal | done |
| HOL-06 | Rosh Chodesh (1 or 2 days), Shabbos Mevorchim, molad announcement text | Magen Avraham / MB 417:1 (Mevorchim; not before Tishrei); Rema OC 284:7 | oracle: hebcal | in progress (announcement text planned) |
| HOL-07 | Special Shabbosos: Shuva, Shira, Shekalim, Zachor, Parah, HaChodesh, HaGadol, Chazon, Nachamu, Chol Hamoed | SA OC 685:1–6 | oracle: hebcal | in progress (Shira waits for parsha, M3) |
| HOL-08 | Optional: BeHaB, Yom Kippur Katan, Shovavim (off by default) | SA OC 492:1, MB 492:3; MB 417:4 | unit + oracle where available | done |
| HOL-09 | Optional: Yom HaShoah, Yom HaZikaron, Yom HaAtzmaut, Yom Yerushalayim with Knesset postponement rules | Knesset laws (see research note) | oracle: hebcal | done |
| HOL-10 | Omer: day, weeks-and-days text in Hebrew and English, sefirah | — | oracle: hebcal omer | done |
| HOL-11 | V'sein tal umatar start (7 Cheshvan in Israel; Dec 4/5 outside, any century), mashiv haruach / morid hatal | Taanis 10a; SA OC 117:1; 114 | unit across 1900–2240 | done |
| HOL-12 | Birkas HaChama (28-year cycle) | Berachos 59b; SA OC 229:2 | unit (1981, 2009, 2037) | done |
| HOL-13 | Kiddush Levana earliest/latest by several opinions (3 days, 7 days, half-month, 15 days) | SA OC 426:3–4 with Rema; Beis Yosef OC 426 | unit | done |
| HOL-14 | Tefillah predicates: tachanun, Hallel (full/half), Yaaleh V'Yavo, Al HaNissim, Mizmor L'Sodah, is-fast-day, is-aveilus period † | research §7 | unit, published siddur rules | done |
| HOL-15 | Holiday names in all four locales | — | unit | done |
| HOL-16 | Other Israeli days (Sigd, Yom HaAliyah, Swords of Iron memorial day…) and Chag HaBanot | Knesset laws | oracle: hebcal | planned |
| HOL-17 | Shovavim (optional) | MB 685 / customs | unit | planned (needs parsha, M3) |

## M3. Parsha, haftara and learning cycles

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| PAR-01 | Weekly parsha in Israel and diaspora, doubled parshiyos, split weeks; `null` on Yom Tov / Chol Hamoed Shabbos with the special reading | Tur/SA OC 428:4 | oracle: hebcal 50 years both | done |
| PAR-02 | Haftara by minhag (Ashkenaz, Sephardi, Chabad; Teimani where sourced), special haftaros and precedence; references only | SA OC 425, 428:8, 684, 685; research note | oracle: @hebcal/leyning every Shabbos 5660–6000 (explained variants) | done |
| PAR-03 | Pirkei Avos chapter on summer Shabbosim, with the cycle custom | SA OC 292:2 (Rema) | unit | done |
| LRN-01 | Daf Yomi Bavli (Vilna) with siyum dates | first cycle 11 Sep 1923 | oracle: hebcal daf yomi | done |
| LRN-02 | Daf Yomi Yerushalmi, Vilna edition (pauses on Yom Kippur and Tisha B'Av) | cycle start 15 Shevat 5740 | oracle: @hebcal/learning 1980–2060 | done |
| LRN-02b | Daf Yomi Yerushalmi, Schottenstein edition | needs seven tractate lengths (research note) | — | post-1.0 (P-05) |
| LRN-03 | Mishna Yomis | published start | published + oracle | done |
| LRN-04 | Rambam 3 chapters and 1 chapter; Sefer HaMitzvos day number | cycle start 27 Nisan 5744 | oracle: @hebcal/learning 1985–2060 | done |
| LRN-04b | Sefer HaMitzvos: the mitzvos of each day | published Chabad table | — | post-1.0 (P-05) |
| LRN-05 | Nach Yomi | published start | published | done |
| LRN-06 | Chofetz Chaim / Shemiras HaLashon yomi | published date-keyed table | — | post-1.0 (P-05) |
| LRN-07 | Tanya Yomi | published date-keyed table (Chabad) | — | post-1.0 (P-05) |
| LRN-08 | Halacha Yomis (Mishna Berura: Dirshu Daf HaYomi B'Halacha) | Dirshu's luach has irregular days | — | post-1.0 (P-05) |
| LRN-09 | Daf HaShavua, Amud HaYomi (Dirshu) | research note | oracle: @hebcal/learning | done |

## M4. Zmanim

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| ZMN-01 | NOAA solar calculator (public domain), sea level and elevation | NOAA GML | oracle: astronomy-engine < 1 min | done |
| ZMN-02 | Second algorithm for cross-checking (USNO Almanac for Computers, public domain) | USNO 1990 | agrees with NOAA within 2 min | done |
| ZMN-03 | Every opinion in plan §M4 as a named function with source | see `docs/halacha/` | oracle: kosher-zmanim, 19 cities, 4 years | done |
| ZMN-04 | `Zman` object `{ time, opinion, source, rounded }` + `toJSON` | — | unit | done |
| ZMN-05 | `null` with reason when the sun does not reach the angle | — | Tromsø, Reykjavik, London 16.1° June | done |
| ZMN-06 | Rounding: earliest up, deadlines down, opt-out | — | unit | done |
| ZMN-07 | IANA zones via Intl; regression for kosher-zmanim #37 (Sydney, Auckland, Chatham) | research | unit | done |
| ZMN-08 | Candle lighting (configurable; 18/40/30/20), havdala, second-night Yom Tov, Erev Pesach chametz times | SA OC 261, 443 | oracle: hebcal + kosher-zmanim | done |
| ZMN-09 | Fast start/end by opinion | SA OC 562 | oracle | done |
| ZMN-10 | High-latitude fallback (off by default, marked) | — | unit | done |
| ZMN-11 | Host-zone independence: same results under any `TZ` † | research | tests run under several TZ | done |
| ZMN-12 | Zman labels in Hebrew and English † | research §10 | unit | done |
| ZMN-13 | Netz HaNireh (visible sunrise with terrain) | needs terrain data | — | post-1.0 |
| ZMN-14 | Time-aware "is melacha forbidden now" (Motzaei Shabbos correct) † | research | unit | done |
| ZMN-15 | Bein HaShmashos: Rabbeinu Tam, Geonim (13.5/16.875/18), Yereim (18/16.875/13.5) | SA OC 261:2; Biur Halacha 261:2; Yereim 274 | oracle | done |

## M5. Places

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| PLC-01 | Small built-in city table: coordinates, elevation, IANA zone, Israel flag | GeoNames CC-BY 4.0 | unit | planned |
| PLC-02 | Optional full dataset as a separate import | GeoNames | size budget | planned |
| PLC-03 | Search by name, Hebrew names, alternate spellings | — | unit | planned |
| PLC-04 | `isInIsrael(lat, lon)` with documented boundary and override | — | unit | planned |
| PLC-05 | Docs: plugging in a platform geocoder (no service built in) | — | docs | planned |

## M6. Outputs and integrations

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| OUT-01 | ESM + CJS + types; Node, browser, Deno, Bun, React Native (Hermes) | — | CI: Node; Hermes run | planned |
| OUT-02 | iCal (.ics) export for holidays, zmanim, learning | RFC 5545 | unit + validator | planned |
| OUT-03 | "Everything about this day" JSON + JSON Schema | — | schema validation test | planned |
| OUT-04 | CLI: `luach today --city`, `luach zmanim DATE --lat --lon` | — | unit | planned |
| OUT-05 | Example HTTP server (examples/, not shipped) | — | smoke test | planned |
| OUT-06 | Formatting helpers (Hebrew, English, short/long) | — | unit | in progress (dates done) |
| OUT-07 | Range queries: next N days, next occurrence of an event † | research | unit | planned |
| OUT-08 | Swift and Kotlin ports from shared test vectors | — | — | post-1.0 |
| OUT-09 | WebAssembly build | — | — | post-1.0 |
| OUT-10 | Printable luach PDF | — | — | post-1.0 |
| OUT-11 | Temporal adapters † | research | — | post-1.0 |

## M7. Docs and demo

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| DOC-01 | Docs site (VitePress): getting started, recipes, API reference from TSDoc | — | build in CI | planned |
| DOC-02 | Halachic notes per opinion with sources | — | citation review | planned |
| DOC-03 | Accuracy report generated from oracle tests | — | generated | planned |
| DOC-04 | Licence and how to credit | — | review | planned |
| APP-01 | Expo demo app: today, zmanim + opinion picker, week's holidays, parsha, daf; light/dark, RTL, accessible | — | every screen rendered and checked | planned |
| EX-01 | Examples: Node, browser, React, React Native, CLI | — | smoke tests | planned |

## M8. Release

| ID | Spec | Source | Test | Status |
|---|---|---|---|---|
| REL-01 | CI: typecheck, lint, unit/property/oracle tests, Hermes, licence check, size budget | — | GitHub Actions | in progress |
| REL-02 | Semver, `CHANGELOG.md`, release script | — | — | planned |
| REL-03 | `RELEASING.md` (Yosef publishes) | — | review | planned |
| REL-04 | `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, "How to credit" | — | review | planned |
