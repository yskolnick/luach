# Project log

What happened in each working session: what was built, what was decided, and what is still
open. Newest first. Decisions are recorded in full in [DECISIONS.md](DECISIONS.md), plans in
[ROADMAP.md](ROADMAP.md) and user-facing changes in [CHANGELOG.md](CHANGELOG.md).

## Open

- **First release (0.1.0).** Yosef publishes it from his own npm account
  ([RELEASING.md](RELEASING.md)).
- **Q-01** Licence: Apache-2.0 with NOTICE (current) or MIT.
- **Q-04** Anniversary defaults for Adar and the 30th of Cheshvan/Kislev.
- **Q-07** Chabad's haftara when Shabbos HaChodesh or Chanukah is the day before Rosh Chodesh.
- Private vulnerability reporting to be turned on in the repository settings
  ([SECURITY.md](SECURITY.md) points there).

## 2026-10-23

DECISIONS.md and this log edited for readability: settled questions and proposals moved to
their own section, replaced *As built* entries marked as such. No decision changed.

## 2026-10-21: sources and options

Finished the API clean-up for 1.0 (D-12): every rule the code audit found without a source now
has one, or an option.
- Mourning periods: the restrictions of each named custom (Sefirah, the Three Weeks, meat and
  wine), with sources, and `null` where the sources do not settle a day (AB-57).
- Tachanun on Pesach Sheni is an option, with sources (AB-58); the documentation of the
  Tishrei default now cites both sides.
- Yom Kippur Katan: a source for each month it is skipped; Cheshvan is an option (AB-59).
- Mashiv haruach on the first morning of Pesach fixed; morid hatal follows the nusach (AB-60).
- Machar Chodesh's precedence and Shabbos Mevorchim before Tishrei now cite their sources.

**Decided:** D-14 Tachanun after Sukkos follows the place's custom (end of Tishrei in Israel,
after Isru Chag elsewhere); D-15 no default for mourning restrictions; D-16 Yom Kippur Katan
before Cheshvan is off by default.

## 2026-10-21: decisions

**Decided:**
- **D-06** Table-only learning cycles wait until after 1.0.
- **D-07** The credit line is "Built on Luach by Yosef Skolnick".
- **D-08** Modern Israeli days follow each law from its year.
- **D-09** Accurate and source-based: where sources and convenience differ, the sources win.
- **D-10** When a caller gives a place but not Israel or the diaspora, Luach decides from the
  place (`dayInfo`, `toICalendar`, `fastTimes`, `isMelachaForbiddenAt`).
- **D-11** The shared tables are frozen (a breaking change, in the CHANGELOG).
- **D-12** Goals for 1.0: a smaller bundle for one zman, no internal helpers in the public API
  (now 96 names, from 149), and a source or an option for every rule that lacks one.
- **D-13** One zman's bundle cost stays at 10.6 KB for 1.0 (hebcal 44.8 KB, kosher-zmanim
  49.0 KB); a lighter route can come after 1.0.

## 2026-10-21: review and citation audit

Two implementations of Luach had been built. Yosef kept `main` (D-05) and had the other
reviewed for anything it did better; those improvements are in yskolnick/luach#14, each with a
test that failed first. The other implementation is archived, unmerged.

**Fixed:**
- Shabbos candles on a Friday that is Yom Tov were given after nightfall.
- A Shabbos before Tisha B'Av postponed to Sunday showed havdala.
- At high latitudes, the Hebrew date and the melacha check went wrong just after midnight.
- Taanis Bechoros got a Mincha haftara.
- Pirkei Avos was said on Shabbos Erev Tisha B'Av.
- The Kedoshim haftara was wrong when Acharei Mos's had been displaced.
- Shabbos Shuva always added Joel.
- A bar mitzvah for 30 Adar I came out a month early in common years.
- BeHaB started a week early when Rosh Chodesh was Shabbos.
- Yaaleh V'Yavo was off on Yom Kippur.
- Yom HaShoah's Friday rule applied from 1951 instead of the 1959 law.
- The high-latitude fallbacks invented times in polar night.
- iCal did not escape semicolons.

**Added:**
- Local candle-lighting customs with their source (Jerusalem 40, Haifa 30).
- 197 built-in places, and place search that no longer matches the wrong city.
- The JSON Schema shipped in the package.
- Runtime tests on Node 18–22, Bun, Deno and Chromium.
- The published USNO tables as a test.
- [Sources](docs/sources.md): an index, generated from the code, of every zman's source, every
  citation in the code, the data, the test oracles, every decision and every research note.

**Citation audits:** every citation was read again in the primary texts.
- Zmanim: 67 citations; 3 wrong and 12 imprecise, all corrected. Attributions not yet read in
  print are marked "not verified".
- Calendar and readings: 69 citations; 1 wrong and 5 imprecise, all corrected.
- Notes in [docs/research](docs/research). The Levush source for Plag is now Biur Halacha
  261:2 (AB-40).

## 2026-10-21: first build

**Built: milestones M0–M8 (PRs #1–#11).**

- Hebrew calendar for years 1–9999 from the Rambam's rules; yahrzeit and birthday dates;
  gematriya; Hebrew, Ashkenazi, Sephardi and English names; right-to-left text handling.
- Holidays and fasts for Israel and the diaspora, Omer, seasonal tefillah changes, Birkas
  HaChama, Kiddush Levana, modern Israeli days and optional commemorations.
- Weekly parsha, haftaros by minhag, Pirkei Avos; Daf Yomi and other learning cycles.
- Zmanim: two solar algorithms, every opinion named with its source, `null` with a reason
  when the sun does not reach an angle, time zones from IANA.
- Places (about 150 built in, every city over 15,000 people in `luach/places-full`).
- Day JSON with a schema, iCalendar export, a command line, examples.
- Runs on Node, browsers, Deno, Bun and React Native (Hermes).
- Documentation site, an Expo demo app, and the release files.

**Accuracy** (details in [docs/accuracy.md](docs/accuracy.md)):

- Calendar identical to an independent library every day 1900–2240; holidays every year
  5660–6000 (differences explained); parsha every Shabbos 5660–6000.
- Zmanim: 1.37 million values in 19 cities over 2025–2028, largest difference 60 seconds,
  three grazing-angle days explained.

**Decided:** D-01 the name; D-02 commits name the models that wrote and checked them; D-03
this log; D-04 a rationale page tied to every decision.

**Rationale page:** [docs/rationale.md](docs/rationale.md) explains every decision: why, the
sources and how far each was verified, what it was checked against, and a confidence level.
Writing it also caught and fixed three zmanim labelled "16.1 min" instead of 16.1°, a
miscount in the accuracy report, and a missing citation in the anniversary code.

**Commit history:** links to private working sessions were removed from commit messages on
`main`, so commit hashes from before 2026-10-21 changed; file contents did not. If you cloned
the repository before then, clone it again.

**Known limits:** Amud HaYomi stops after Me'ilah 22a (2038) until Dirshu publishes the
rest; Daf HaShavua's start date is back-computed; visible sunrise over terrain is planned
for after 1.0.
