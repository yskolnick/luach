# Project log

What changed, what was decided, and what is still open. Newest first. Decisions are recorded
in full in [DECISIONS.md](DECISIONS.md), plans in [ROADMAP.md](ROADMAP.md) and user-facing
changes in [CHANGELOG.md](CHANGELOG.md).

## Open

- **First release (0.1.0):** not yet published.
- **Q-01** Licence: Apache-2.0 with NOTICE (current) or MIT.
- **Q-04** Anniversary defaults for Adar and the 30th of Cheshvan/Kislev.
- **Q-07** Chabad's haftara when Shabbos HaChodesh or Chanukah is the day before Rosh Chodesh.

## 2026-10-21

**Built.**
- Hebrew calendar for years 1–9999 from the Rambam's rules; yahrzeit and birthday dates;
  gematriya; Hebrew, Ashkenazi, Sephardi and English names; right-to-left text handling.
- Holidays and fasts for Israel and the diaspora, Omer, seasonal tefillah changes, Birkas
  HaChama, Kiddush Levana, modern Israeli days and optional commemorations.
- Weekly parsha, haftaros by minhag, Pirkei Avos; Daf Yomi and other learning cycles.
- Zmanim: two solar algorithms, every opinion named with its source, `null` with a reason
  when the sun does not reach an angle, time zones from IANA.
- Places: 197 built in, every city over 15,000 people in `luach/places-full`, and local
  candle-lighting customs where a source was found (Jerusalem 40, Haifa 30).
- Day JSON with a schema (shipped in the package), iCalendar export, a command line,
  examples.
- Runs on Node 18–22, browsers, Deno, Bun and React Native (Hermes), each tested in CI.
- Documentation site, an Expo demo app, and the release files.
- [Why Luach works this way](docs/rationale.md), one section per decision, and
  [Sources](docs/sources.md), an index generated from the code of every source, citation,
  dataset and test oracle.

**Accuracy** (details in [docs/accuracy.md](docs/accuracy.md)):
- Calendar identical to an independent library every day 1900–2240; holidays every year
  5660–6000 (differences explained); parsha every Shabbos 5660–6000.
- Zmanim: 1.37 million values in 19 cities over 2025–2028, largest difference 60 seconds,
  three grazing-angle days explained; also checked against the published USNO tables.
- Citation audits: every citation was read again in the primary texts. Zmanim: 67 citations,
  3 wrong and 12 imprecise, all corrected. Calendar and readings: 69 citations, 1 wrong and 5
  imprecise, all corrected. Attributions not yet read in print are marked "not verified".
  Notes in [docs/research](docs/research).

**Fixed before release:**
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
- Mashiv haruach on the first morning of Pesach; morid hatal now follows the nusach (AB-60).

**Sources and options for 1.0 (D-12):** every rule the code audit found without a source now
has one, or an option: mourning periods by named custom (AB-57), Tachanun on Pesach Sheni
(AB-58), Yom Kippur Katan by month (AB-59). The public API is down to 96 names.

**Decided:** D-01 to D-16. Among them: Israel or the diaspora follows the place (D-10); the
shared tables are frozen (D-11); Tachanun after Sukkos follows the place's custom (D-14); no
default for mourning restrictions (D-15); table-only learning cycles after 1.0 (D-06).

**Known limits:** Amud HaYomi stops after Me'ilah 22a (2038) until Dirshu publishes the
rest; Daf HaShavua's start date is back-computed; visible sunrise over terrain is planned
for after 1.0.
