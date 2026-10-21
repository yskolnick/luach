# Project log

What happened in each working session: what was built, what was decided, and what is
still open. Newest first. Decisions are recorded in full in [DECISIONS.md](DECISIONS.md),
plans in [ROADMAP.md](ROADMAP.md) and user-facing changes in [CHANGELOG.md](CHANGELOG.md).

## Open

- **First release (0.1.0).** Yosef publishes it from his own npm account
  ([RELEASING.md](RELEASING.md)), after the API clean-up below.
- **Q-01** Licence: Apache-2.0 with NOTICE (current) or MIT. Yosef is not sure yet.
- **Q-04** Anniversary defaults for Adar and the 30th of Cheshvan/Kislev: left open.
- **API clean-up (D-12), in progress:**
  - infer Israel from the place (D-10): done;
  - stop exporting internal helpers: done (149 names → 96);
  - one zman's bundle cost: kept at 10.6 KB for 1.0 (D-13; hebcal 44.8 KB, kosher-zmanim
    49.0 KB);
  - a source or an option for every rule the code audit found without one: done (AB-57 to
    AB-60).
- **P-09** Tachanun after Sukkos: whether the default should be Isru Chag (the Ashkenazi
  sources) instead of the end of Tishrei.
- **Q-07** Chabad's haftara when Shabbos HaChodesh or Chanukah is the day before Rosh Chodesh.
- Private vulnerability reporting to be turned on in the repository settings
  ([SECURITY.md](SECURITY.md) points there).

## 2026-10-21 (sources and options)

The last D-12 item: every rule the code audit found without a source now has one, or an option.
- Mourning periods: the restrictions of each named custom (Sefirah, the Three Weeks, meat and
  wine), with sources, and `null` where the sources do not settle a day. No default (AB-57).
- Tachanun on Pesach Sheni is now an option, with sources (AB-58); the Tishrei default's
  documentation was wrong and now cites both sides (P-09 proposes changing the default).
- Yom Kippur Katan: a source for each month it is skipped; Cheshvan is an option (AB-59).
- Mashiv haruach on the first morning of Pesach fixed; morid hatal follows the nusach (AB-60).
- Machar Chodesh's precedence and Shabbos Mevorchim before Tishrei now cite their sources.

## 2026-10-21 (decisions)

Yosef answered the open questions:
- **D-06** P-05 deferred: the table-only learning cycles wait until after 1.0.
- **D-07** Q-02: the credit line stays "Built on Luach by Yosef Skolnick".
- **D-08** Q-05: modern Israeli days follow each law from its year, as built.
- **D-09** Q-06 closed, and a rule: "We want accurate and source based".
- **D-10** When a caller gives a place but not Israel or the diaspora, Luach decides from the
  place (done: `dayInfo`, `toICalendar`, `fastTimes`, `isMelachaForbiddenAt`).
- **D-11** P-08: the shared tables are frozen (done; a breaking change, in the CHANGELOG).
- **D-13** One zman's bundle cost stays at 10.6 KB for 1.0; a lighter route after 1.0.
- **D-12** Before 1.0: a smaller bundle for one zman, no internal helpers in the public API,
  and a source or an option for every rule that lacks one.

Q-01 (licence) and Q-04 (anniversary defaults) stay open.

## 2026-10-21 (second session)

A second session had built Luach in parallel. Yosef kept `main` (**D-05**: "Keep main and see
where this code is better, add that"). The second implementation is archived, unmerged; what it
did better is in yskolnick/luach#14, each change with a test that failed first.

**Fixed:**
- Shabbos candles on a Friday that is Yom Tov were given after nightfall.
- A Shabbos before Tisha B'Av postponed to Sunday showed havdala.
- At high latitudes, the Hebrew date and the melacha check went wrong just after midnight.
- Taanis Bechoros got a Mincha haftara.
- Pirkei Avos was said on Shabbos Erev Tisha B'Av.
- The Kedoshim haftara was wrong when Acharei Mos's had been displaced.
- Shabbos Shuva always added Joel.
- A bar mitzvah for 30 Adar I came out a month early in common years.
- BeHaB started a week early when Rosh Chodesh was Shabbos (the AB-06 question).
- Yaaleh V'Yavo was off on Yom Kippur.
- Yom HaShoah's Friday rule applied from 1951 instead of the 1959 law (the Q-05 question).
- The high-latitude fallbacks invented times in polar night.
- iCal did not escape semicolons.

**Added:**
- Local candle-lighting customs with their source (Jerusalem 40, Haifa 30).
- 197 built-in places.
- Search that no longer guesses wrong cities.
- The JSON Schema shipped in the package.
- Runtime tests on Node 18–22, Bun, Deno and Chromium.
- The published USNO tables as a test.
- [Sources](docs/sources.md): an index, generated from the code, of every zman's source, every
  citation in the code, the data, the test oracles, every decision and every research note.
  Yosef: "Write up a sources and decisions document about where times came from and cite and
  source every decision and document etc. This is being built in public".

**Citation audits:** every citation was read again in the primary texts.
- Zmanim: 67 citations; 3 wrong and 12 imprecise, all corrected. Unread attributions are marked
  "not verified" (several are known only from other software's documentation).
- Calendar and readings: 69 citations; 1 wrong and 5 imprecise, all corrected.
- Notes in [docs/research](docs/research). The Levush source for Plag (AB-14) is now Biur
  Halacha 261:2 (AB-40).

**Open, found but not done:**
- The library assumes the diaspora and Ashkenaz when the caller doesn't choose.
- One zman costs about 10 KB in a bundle.
- Many internal helpers are exported.
- Several halachic rules have no source or option (see the code audit note).

## 2026-10-21

**Built: milestones M0–M8, all merged (PRs #1–#11).**

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

**Decided:** D-01 (the name), D-02 (commits name the models that wrote and checked them; no
session links), D-03 (this log), D-04 (a rationale page tied to every decision).

**Rationale page:** [docs/rationale.md](docs/rationale.md) explains every decision: why, the
sources and how far each was verified, what it was checked against, and a confidence level.
The *As built* entries are now numbered AB-01 to AB-36 (AB-36, Pirkei Avos, was missing).
Writing it turned up these, now fixed: three zmanim defined by 16.1° were labelled "16.1 min";
the accuracy report said 52 zmanim where 51 are compared; the anniversary code lacked its
citation (Magen Avraham 568:20; MB 568:42). Recorded as open for scholars: the BeHaB edge
case when Rosh Chodesh is Shabbos (AB-06); the year Yom HaShoah's Friday rule began (Q-05);
the Levush's own text for Plag (AB-14); and several defaults with no source (rounding, the Omer
wording, 7.083° for fasts).

**Housekeeping:** commit messages on `main` had carried links to private working sessions.
Those lines were removed and the history rewritten, so commit hashes before this date
changed. File contents are unchanged. If you cloned the repository before the change,
clone it again.

**Known limits:** Amud HaYomi stops after Me'ilah 22a (2038) until Dirshu publishes the
rest; Daf HaShavua's start date is back-computed; visible sunrise over terrain is planned
for after 1.0.
