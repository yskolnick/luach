# Project log

What happened in each working session: what was built, what was decided, and what is
still open. Newest first. Decisions are recorded in full in [DECISIONS.md](DECISIONS.md),
plans in [ROADMAP.md](ROADMAP.md) and user-facing changes in [CHANGELOG.md](CHANGELOG.md).

## Open

- **First release (0.1.0).** Ready; Yosef publishes it from his own npm account
  ([RELEASING.md](RELEASING.md)).
- **Q-01** Licence: Apache-2.0 with NOTICE (current) or MIT.
- **Q-02** How credit should read (current: "Built on Luach by Yosef Skolnick").
- **Q-04** Anniversary defaults for Adar and the 30th of Cheshvan/Kislev.
- **Q-05** Modern Israeli days in the years before their amendments.
- **Q-06** A citation in the original project brief that was only partly accurate.
- **P-05** Move the learning cycles that need a publisher's day-by-day table to after 1.0.
- Private vulnerability reporting to be turned on in the repository settings
  ([SECURITY.md](SECURITY.md) points there).

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
