---
outline: [2, 3]
---

# Why Luach works this way

This page explains every entry in
[DECISIONS.md](https://github.com/yskolnick/luach/blob/main/DECISIONS.md): what Luach does,
why, which sources it rests on, what it was checked against, how confident the reasoning is,
and what would change it. It is written for scholars, rabbanim and developers who want to
examine the reasoning and correct it.

::: warning Written by an AI, not a ruling
This page was written by the AI coding assistant that built Luach. (Each commit names the
model in its `Co-Authored-By:` line.) It records the assistant's reasoning so that people can
check it. It is not a psak and decides nothing: **ask your rav. This library calculates; it
does not rule.** Where Yosef Skolnick has decided something, his words are quoted in
DECISIONS.md and marked *Decided*. Everything else is a proposal, an open question, or
behaviour the code has that nobody has yet chosen (*As built*).
:::

## How to read an entry

Each entry has the same parts:

- **What it does:** the behaviour, briefly.
- **Why:** the reasoning, as the assistant made it.
- **Sources:** where the behaviour comes from. A citation marked *verified* was read in the
  primary text (usually on Sefaria); *secondary* means it was confirmed only through a named
  secondary source; *not verified* means nobody has checked it in print.
  *No source recorded* means the repository has none: the choice was a convenience.
- **Checked against:** the independent oracle or published data the tests compare with.
- **Confidence:** *High* (sources read and an independent check agrees), *Medium* (sources
  secondary or the check partial), *Low* (a judgement, a back-computation, or nothing to
  check against), or *Not applicable* (project housekeeping, not a calculation).
- **Open:** known gaps, disagreements, and what would change the decision.

The research notes behind these entries, with full source lists, are in
[`docs/research/`](https://github.com/yskolnick/luach/tree/main/docs/research). The zmanim
table with every opinion and source is on [Zmanim and sources](./halacha/zmanim.md).

## How to challenge an entry

Open an issue with the **Challenge a decision or source** template
([new issue](https://github.com/yskolnick/luach/issues/new/choose)) and give the entry's ID,
what is wrong, and your source. Corrections to sources are especially welcome. Fixes are
recorded as new entries; old ones are superseded, not erased.

## Decided

### D-01. The name is Luach {#d-01}

- **What it does:** the package is `luach` on npm; the repository is `yskolnick/luach`.
- **Why:** Yosef chose it: "use luach".
- **Sources:** DECISIONS.md D-01. An unrelated package, `luach-picker`, is a date-picker
  widget; the README says so to avoid confusion.
- **Checked against:** the npm registry (the name is registered to Yosef's account).
- **Confidence:** Not applicable.
- **Open:** nothing.

### D-02. Commits name the models that wrote and checked them; no session links {#d-02}

- **What it does:** every commit ends with a `Co-Authored-By:` line naming the AI model that
  wrote it, and may name the model that checked it. Links to private working sessions are
  never published.
- **Why:** Yosef: "since it is a public repo and we want transparency." The session links
  pointed to private working sessions, which are not for the public.
- **Sources:** DECISIONS.md D-02.
- **Checked against:** the history of `main` (no session links; model lines kept).
- **Confidence:** Not applicable.
- **Open:** GitHub keeps each pull request's original commits; only GitHub Support can purge
  the old links there.

### D-03. A public project log {#d-03}

- **What it does:** [LOG.md](https://github.com/yskolnick/luach/blob/main/LOG.md) records each
  working session's updates, decisions and open questions, with nothing personal.
- **Why:** Yosef asked for updates and decisions to be "shown to people".
- **Sources:** DECISIONS.md D-03.
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** nothing.

### D-04. A rationale page tied to every decision {#d-04}

- **What it does:** this page. Every entry in DECISIONS.md has a section here, and a test
  fails if one is missing or lacks its sources and confidence.
- **Why:** Yosef asked for "a document that scholars can look at and analyze and fix", tied
  to every decision.
- **Sources:** DECISIONS.md D-04.
- **Checked against:** `test/rationale.test.ts`.
- **Confidence:** Not applicable.
- **Open:** the entries were written from the repository's research notes, code comments
  and tests on 2026-10-21. Where the repository records no source, the entry says so rather
  than supplying one.

### D-05. One implementation: `main` {#d-05}

- **What it does:** keeps the implementation on `main` and ports into it what a second,
  parallel implementation did better (yskolnick/luach#14). The second one stays on the branch
  `archive/parallel-implementation-2026-10-21` for reference.
- **Why:** Yosef: "Keep main and see where this code is better, add that". Three comparisons
  (calendar and readings; zmanim and places; outputs and tooling) ran both on the same inputs
  and against the oracles; each difference was decided by the primary source or the oracle,
  not by which implementation wrote it.
- **Sources:** DECISIONS.md D-05. The sources index, [Sources](./sources.md), came from the
  same session: Yosef: "Write up a sources and decisions document about where times came
  from and cite and source every decision and document etc. This is being built in public".
- **Checked against:** every ported change has a test that failed before it; `npm run check`.
- **Confidence:** Not applicable.
- **Open:** items found but not ported are listed in the pull request and the LOG.

### D-06. Table-only learning cycles deferred {#d-06}

- **What it does:** five cycles that need a publisher's day-by-day table are not built for
  1.0 (see [P-05](#p-05)).
- **Why:** Yosef: "defer for now". A guessed table would be wrong, and a publisher's table
  needs its permission.
- **Sources:** DECISIONS.md D-06; [learning cycles](./research/2026-10-21-learning-cycles.md).
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** they can be added after 1.0 if the tables can be licensed or computed.

### D-07. The credit line {#d-07}

- **What it does:** NOTICE asks apps to show "Built on Luach by Yosef Skolnick".
- **Why:** Yosef's choice.
- **Sources:** DECISIONS.md D-07.
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** nothing.

### D-08. Modern Israeli days follow each law from its year {#d-08}

- **What it does:** see [Q-05](#q-05).
- **Why:** Yosef accepted the rules as built, so a historical date matches what was observed.
- **Sources:** DECISIONS.md D-08; [modern Israeli days](./research/2026-10-21-modern-israeli-days.md).
- **Checked against:** hebcal, every year 5660–6000 (differences explained).
- **Confidence:** Medium (the Knesset's own PDFs could not be opened).
- **Open:** whether the Yom HaShoah Friday rule was in the 1959 law or the 1961 amendment;
  it changes no date.

### D-09. Accurate and source-based {#d-09}

- **What it does:** closes Q-06, and sets the rule that where a source and a convenience
  differ, Luach follows the source and says so.
- **Why:** Yosef: "We want accurate and source based unless i specifically say otherwise".
- **Sources:** DECISIONS.md D-09; [Q-06](#q-06).
- **Checked against:** the citation audits in `docs/research/`.
- **Confidence:** Not applicable.
- **Open:** nothing.

### D-10. Israel or the diaspora from the place {#d-10}

- **What it does:** when a caller gives a place but not `israel`, Luach decides with
  `isInIsrael`; without a place, the diaspora stays the default; an explicit option wins.
- **Why:** Yosef chose "Infer Israel from the place". A user in Jerusalem who forgets the
  option should not get two days of Yom Tov.
- **Sources:** DECISIONS.md D-10; the outline is [P-06](#p-06).
- **Checked against:** the `isInIsrael` border tests, and tests that a place in Israel gives
  Israel rules unless the option says otherwise.
- **Confidence:** Medium. Near a border the outline is approximate ([P-06](#p-06)).
- **Open:** near a border, pass `israel` explicitly and ask your rav.

### D-11. The shared tables are frozen {#d-11}

- **What it does:** the built-in tables cannot be changed by a caller.
- **Why:** Yosef: "Yes, freeze them". A wrong zman is worse than a missing one, and a server
  shares one copy among users.
- **Sources:** DECISIONS.md D-11; [P-08](#p-08).
- **Checked against:** `test/immutability.test.ts`.
- **Confidence:** Not applicable.
- **Open:** nothing.

### D-12. API clean-up before 1.0 {#d-12}

- **What it does:** a single zman costs less in a bundle; internal helpers are no longer
  exported; every rule the code audit found without a source gets a source or an option.
  Done so far: the public API is listed by name in `src/index.ts` (96 names, down from 149);
  what was removed is in CHANGELOG.md, and `test/public-api.test.ts` pins the list. Kept:
  everything an app calls or reads (dates, holidays, parsha, learning, zmanim, places,
  outputs, and the documented tables such as `ZMANIM` and `LOCAL_CANDLE_LIGHTING`). Removed:
  validation, raw calendar and solar arithmetic, rounding, search folding, iCal escaping and
  locale lookup helpers, none of which the guides, examples or demo app use.
- **Why:** Yosef asked for all three before 1.0, when breaking changes cost least.
- **Sources:** DECISIONS.md D-12; [code audit](./research/2026-10-21-citation-audit-code.md).
- **Checked against:** size budgets in CI; the public API test; the citation audits.
- **Confidence:** Not applicable.
- **Open:** tracked in LOG.md until done.

### D-13. One zman costs 10.6 KB for 1.0 {#d-13}

- **What it does:** keeps one way to compute zmanim, `ZmanimCalendar`. Importing it costs
  10.6 KB gzip, because a class carries all of its methods and their opinion texts.
- **Why:** Yosef chose to keep it and revisit after 1.0. Luach is already about a quarter
  of the size of the other zmanim libraries, and a lighter route can be added later without
  breaking anyone; adding it now would grow the API just after it was trimmed.
- **Sources:** DECISIONS.md D-13. Sizes measured with esbuild (minify, gzip) on one sunrise.
- **Checked against:** `@hebcal/core` 44.8 KB and `kosher-zmanim` 49.0 KB, the same way.
- **Confidence:** Not applicable.
- **Open:** ROADMAP OUT-12, after 1.0.

## Open questions

### Q-00. Unmerged branches {#q-00}

- **What it does:** lists branches with work not yet on `main` (see DECISIONS.md Q-00).
- **Why:** so nobody loses track of unfinished work.
- **Sources:** project process (AGENTS.md).
- **Checked against:** the repository's branches.
- **Confidence:** Not applicable.
- **Open:** nothing.

### Q-01. Licence: Apache-2.0 with NOTICE, or MIT {#q-01}

- **What it does:** Luach is Apache-2.0 with a NOTICE file until Yosef decides.
- **Why:** see [P-01](#p-01).
- **Sources:** ADR 0002.
- **Checked against:** the licence check in CI (`npm run check:licenses`).
- **Confidence:** Not applicable.
- **Open:** Yosef's choice.

### Q-02. How credit should read {#q-02}

- **What it does:** NOTICE says "Built on Luach by Yosef Skolnick".
- **Why:** a short line an app can put on its About screen.
- **Sources:** README, "How to credit".
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** decided: [D-07](#d-07).

### Q-04. Anniversary rules {#q-04}

- **What it does:** `anniversary()` offers both customs for Adar and for the 30th of Cheshvan
  and Kislev. Defaults: a yahrzeit from Adar of a common year falls in Adar I of a leap year;
  a birthday in Adar II. 30 Adar I in a common year becomes 30 Shevat. A missing 30th follows
  the first anniversary for a yahrzeit and moves to the next month for a birthday.
- **Why:** the poskim differ, so both are offered; the defaults follow the common practice
  for each kind of date.
- **Sources:**
  - Birthday or bar mitzvah, Adar II: Rema OC 55:10, citing Mahari Mintz §9 (*verified*; the
    citation check found that the ruling is the Rema's gloss, not the Mechaber's).
  - Yahrzeit: Mechaber OC 568:7 gives Adar II, the Rema gives Adar I and notes that some
    observe both (*verified*).
  - 30 Adar I → 30 Shevat and the "first anniversary" rule: Magen Avraham 568:20; Mishna
    Berura 568:42, which notes that some later authorities say always Rosh Chodesh and
    concludes "והעולם נוהגין כהמ״א" (*verified*).
  - Research: [citation check](./research/2026-10-21-citation-check-m1-m2.md).
- **Checked against:** hebcal's `getYahrzeit`, for deaths in 5700–5800 followed 40 years
  ahead (more than 10,000 dates), with the Adar I custom. Birthday defaults: unit tests only.
- **Confidence:** High for the sources; the choice of defaults is a judgement.
- **Open:**
  - Not modelled: the Rema's exception that a death in Adar II of a leap year keeps Adar II
    in later leap years (Terumas HaDeshen 294; Rema YD 402:12).
  - The defaults await Yosef's decision.
- **Update 2026-10-21:** a birthday for 30 Adar I observed in a common year is now 1 Nisan,
  not 30 Shevat: Magen Avraham OC 55:10 and Mishna Berura 55:45 (the age is not complete until
  the 1st of the next month) and MB 55:44 (*verified*); hebcal's `getBirthdayHD` agrees and is
  now a test oracle. New option `adarI` for one born in Adar I whose birthday falls in a leap
  year: `'levush'` (default; MB 55:43, "the consensus of the later authorities") or
  `'magen-avraham'` (MA 55:10, Adar II) (*verified*).

### Q-05. Modern Israeli days before their amendments {#q-05}

- **What it does:** the moving rules apply from the year each was adopted: Yom HaShoah
  Friday → Thursday from 1959 and Sunday → Monday from 1997; Yom HaAtzmaut Monday → Tuesday
  from 2004. These days are optional and off by default.
- **Why:** a historical date should match what was observed that year.
- **Sources:** [modern Israeli days](./research/2026-10-21-modern-israeli-days.md): the law
  texts on Wikisource, the Knesset committee protocol of 11 March 1997 (Amendment No. 3),
  and news and educational sources listed there.
- **Checked against:** hebcal, every year 5660–6000 (differences explained in
  [Accuracy](./accuracy.md)).
- **Confidence:** Medium. The Knesset's own PDFs could not be opened.
- **Open:**
  - **Resolved 2026-10-21:** the Friday → Thursday rule for Yom HaShoah now applies from
    1959, the year of the law, as the research note says; 1954 stays on Friday. Whether the
    rule was in the 1959 law or added in 1961 is still unconfirmed (it affects no year: no
    27 Nisan fell on Friday between 1959 and 1961).
  - Not modelled: the 1954 date of Yom HaAtzmaut's Shabbos rule, and the uncertain 1950
    date.

### Q-06. The example citation in the brief {#q-06}

- **What it does:** the zmanim table cites each part of "72 minutes / 16.1°" separately
  instead of attributing both to the Magen Avraham.
- **Why:** the research found the combined citation inaccurate:
  - Magen Avraham OC 58:1 (with 233:3) says only that the day is counted from alos; it never
    says "72 minutes" or "16.1°" (*verified*).
  - 72 minutes is 4 mil of 18 minutes (Pesachim 94a; SA OC 459:2) (*verified*).
  - 16.1° is a modern conversion of 72 minutes in Jerusalem at the equinox.
  - Shulchan Aruch HaRav 89:1 gives no minutes; 459:10 makes a mil 24 minutes, which implies
    96 (*verified*).
- **Sources:** [zmanim opinions](./research/2026-10-21-zmanim-opinions.md).
- **Checked against:** the primary texts on Sefaria.
- **Confidence:** High.
- **Open:** decided: [D-09](#d-09).

### Q-07. Chabad on Shabbos HaChodesh or Chanukah before Rosh Chodesh {#q-07}

- **What it does:** on Shabbos HaChodesh on 29 Adar and a Shabbos of Chanukah on 29 Kislev,
  the Chabad haftara has no Machar Chodesh verses added.
- **Why:** Chabad's addition after Shekalim is in the haftara table; for these two days Luach
  found no source either way.
- **Sources:** SA OC 425:2, 685:4, 684:3; Aruch HaShulchan OC 425:4–5 (the displacement
  itself, *verified*); no Chabad source read for the added verses.
- **Checked against:** nothing; the oracle tests do not cover Chabad.
- **Confidence:** Low.
- **Open:** a Chabad luach or Sefer HaMinhagim for these two days.

## Proposals

### P-01. Apache-2.0 with a NOTICE file {#p-01}

- **What it does:** the licence is Apache-2.0; redistributors must carry NOTICE.
- **Why:** Apache-2.0 is the standard licence closest to "use it freely, but credit Yosef",
  and it has an explicit patent grant. MIT only requires keeping the copyright line inside the
  licence text. Other calendar libraries are GPL or LGPL, which developers report as a
  barrier (KosherJava #184; hebcal-es6 #790; hebcal-learning #17).
- **Sources:** ADR 0002; [what users want](./research/2026-10-21-what-users-want.md).
- **Checked against:** CI fails if a runtime dependency has a non-permissive licence.
- **Confidence:** Not applicable (a licensing choice).
- **Open:** Yosef may choose MIT; only LICENSE, NOTICE and `package.json` would change.

### P-02. Zero runtime dependencies; TypeScript, tsup, Vitest, ESLint {#p-02}

- **What it does:** Luach depends on nothing at run time.
- **Why:** smallest bundle, no licence risk, and it runs on React Native's Hermes engine.
- **Sources:** ADR 0003.
- **Checked against:** CI on Node 20 and 22, Hermes, Deno and Bun.
- **Confidence:** Not applicable.
- **Open:** nothing.

### P-03. Days counted from 1970-01-01; months numbered from Nisan {#p-03}

- **What it does:** dates are counted in days from 1 January 1970; Nisan is month 1 and
  Adar II is 13.
- **Why:** day counts line up with JavaScript's `Date`; numbering from Nisan follows the
  Torah (Shemos 12:2) and the Rambam (Kiddush HaChodesh 1:1).
- **Sources:** ADR 0004; the civil-date algorithm of Howard Hinnant (public domain).
- **Checked against:** see [P-04](#p-04).
- **Confidence:** High.
- **Open:** nothing.

### P-04. Supported range: Hebrew years 1–9999, proleptic Gregorian {#p-04}

- **What it does:** converts dates for Hebrew years 1 to 9999 (3761 BCE to 6239 CE), using
  the Gregorian calendar even before 1582.
- **Why:** the Rambam's arithmetic is exact over the whole range (the largest number of
  chalakim, about 10¹¹, is far inside JavaScript's exact integers), and using one civil
  calendar throughout avoids a silent switch in 1582.
- **Sources:** Rambam, Hilchos Kiddush HaChodesh 6–8: BaHaRaD (6:8), the 19-year cycle,
  and the four dechiyos (7:1–7) (*verified* in the citation check). ADR 0004.
- **Checked against:** hebcal on every day from 1900 to 2240; 20,000 random round trips over
  years 1–9999; published Rosh Hashana dates.
- **Confidence:** High.
- **Open:** dates before 1582 are proleptic Gregorian, not the Julian dates historians use;
  this is documented, not converted.

### P-05. Move table-only learning cycles after 1.0 {#p-05}

- **What it does:** Chofetz Chaim / Shemiras HaLashon yomi, Tanya yomi, the mitzvos of each
  Sefer HaMitzvos day, the Schottenstein Yerushalmi cycle and Dirshu's Daf HaYomi B'Halacha
  are not built.
- **Why:** they cannot be computed from the structure of the text. Each needs a publisher's
  day-by-day table, whose licence is unknown and which must be treated as copyrighted. For
  Schottenstein, several tractate lengths were not found. A guess would be wrong.
- **Sources:** [learning cycles](./research/2026-10-21-learning-cycles.md).
- **Checked against:** nothing yet.
- **Confidence:** High that they need tables.
- **Open:** decided: deferred ([D-06](#d-06)).

### P-06. What `isInIsrael` covers {#p-06}

- **What it does:** a simplified outline of where communities keep one day of Yom Tov: the
  State of Israel with Judea and Samaria, the Golan Heights and Gaza, accurate to a few
  kilometres. Callers can always pass `israel` explicitly.
- **Why:** the function only chooses Israel or diaspora rules; it makes no political
  statement.
- **Sources:** *no external source recorded*. The outline was drawn for Luach from public map
  knowledge ([data sources](./data-sources.md)).
- **Checked against:** border tests: Eilat, Metula, Majdal Shams, Ma'ale Adumim, Efrat and
  Ariel inside; Aqaba, Taba, Quneitra, Tyre and El Arish outside. No point in Gaza is tested.
- **Confidence:** Medium for the outline; the question of which places keep one day near the
  borders is halachic, and the library does not decide it.
- **Open:** near a border, ask your rav. A sourced outline would be welcome.

### P-07. Per-module ESM output and name tables {#p-07}

- **What it does:** each module is a separate file, so apps only include what they use.
- **Why:** a single bundle defeats tree-shaking; the name tables were pulled in by every
  date format.
- **Sources:** ADR 0005.
- **Checked against:** size budgets in CI (Hebrew date and formatting about 3.4 KB gzip,
  zmanim 9.4 KB, holidays 5.8 KB).
- **Confidence:** Not applicable.
- **Open:** nothing.

### P-08. Freeze the shared tables {#p-08}

- **What it does:** since [D-11](#d-11), `ZMANIM`, `DEFAULT_DAY_ZMANIM`, the place objects
  (built-in and full), `LOCAL_CANDLE_LIGHTING` and `ISRAEL_BOUNDARY` are deeply frozen where
  they are built.
- **Why:** they are shared by every caller in a process. A test showed that writing to one
  (for example, a zman's opinion text, or a place's latitude) changes every later result.
- **Sources:** no halachic source; an engineering choice.
- **Checked against:** `test/immutability.test.ts`, whose tests run as soon as the tables are
  frozen (they passed with the tables frozen in a trial).
- **Confidence:** Not applicable.
- **Open:** decided: [D-11](#d-11). A caller's write now throws in strict mode (and is
  ignored otherwise).

### P-09. Tachanun after Sukkos: which default {#p-09}

- **What it does:** `tefillahOn` omits Tachanun through Rosh Chodesh Cheshvan unless
  `tishreiTachanun: 'isruChag'` is given.
- **Why:** proposed change: the module's defaults are common Ashkenazi practice, and the
  Ashkenazi works Luach read resume Tachanun after Isru Chag. The old documentation called
  the longer custom "widespread Ashkenazi"; the sources say otherwise.
- **Sources:** SA OC 131:7; Kitzur SA 22:8; Sha'arei Teshuvah 131:19 ("במדינות אלו אין
  המנהג כן ומי שנוהג כן ... אין מוחין בידו"); Aruch HaShulchan OC 131:12 ("ואינו עיקר");
  Kaf HaChaim OC 131:98 (Knesses HaGedolah; Pri Chadash; Chaim Sha'al: the custom in Israel)
  (*verified*, Sefaria).
- **Checked against:** `test/sourced-options.test.ts`.
- **Confidence:** High on the sources; what shuls do today was not surveyed.
- **Open:** Yosef's choice of default.

## As built

These are defaults and details the code has that nobody has chosen. Each can be changed.

### AB-01. Exact thousands in gematriya {#ab-01}

- **What it does:** 1000 is written א׳, the same as 1; `parseGematriya('א׳')` returns 1.
- **Why:** thousands are written as a letter with a geresh (ה׳ = 5000), so an exact
  multiple of 1000 is ambiguous; reading it as the units digit is the safer guess for dates.
- **Sources:** *no source recorded*.
- **Checked against:** hebcal for 1–999; round trips for 1–9999 except exact thousands.
- **Confidence:** Low (a convention, not a source).
- **Open:** a printed convention for writing exact thousands would settle it.

### AB-02. Hebrew years without the thousands {#ab-02}

- **What it does:** `formatHebrewDate` writes 5787 as תשפ״ז; `thousands: true` gives ה׳תשפ״ז.
- **Why:** this is how years are usually written.
- **Sources:** *no source recorded* (common usage).
- **Checked against:** unit tests only.
- **Confidence:** Medium.
- **Open:** nothing.

### AB-03. Purim Meshulash on 16 Adar {#ab-03}

- **What it does:** when 15 Adar is Shabbos, the event "Purim Meshulash" is on Sunday,
  16 Adar.
- **Why:** Jerusalem spreads Shushan Purim over three days; the event marks the third.
- **Sources:** SA OC 688:6: Megillah on Friday, Al HaNissim on Shabbos, the seudah on Sunday
  (*verified*).
- **Checked against:** hebcal, every year 5660–6000.
- **Confidence:** High for the dates. Choosing the Sunday to carry the name is a convention.
- **Open:** an app may want all three days listed.

### AB-04. Leil Selichos on the Shabbos {#ab-04}

- **What it does:** Leil Selichos (Ashkenaz) is dated on the Shabbos whose night begins
  Selichos.
- **Why:** the date follows the Rema's rule; the event is placed on the Shabbos so that its
  night is the right one.
- **Sources:** Rema OC 581:1 gives the weekday rule; the four-day reason is Mishna Berura
  581:6 (*verified*; the citation check corrected the attribution).
- **Checked against:** hebcal, every year 5660–6000.
- **Confidence:** High.
- **Open:** Sephardim say Selichos from Rosh Chodesh Elul (SA OC 581:1); this event is
  Ashkenazi only.

### AB-05. Yom Kippur Katan {#ab-05}

- **What it does:** optional. Not listed before Rosh Chodesh Tishrei, Cheshvan, Teves or
  Iyar; moved to Thursday when Erev Rosh Chodesh is Friday or Shabbos.
- **Why:** the move follows the Mishna Berura; the exclusions follow printed siddurim and
  luchos.
- **Sources:** Mishna Berura 417:4; Magen Avraham 417:3 (*verified*). The month exclusions
  are **not** in the MB or MA; they are a siddur and luach custom, and lists differ.
- **Checked against:** hebcal, every year 5660–6000.
- **Confidence:** Medium.
- **Open:** **superseded as to its sources by [AB-37](#ab-37)** (2026-10-21). Erev Rosh
  Chodesh on Friday is now an option (`yomKippurKatanOnFriday`), with the Magen Avraham and
  the Mishna Berura cited for each side; Thursday stays the default.

### AB-06. BeHaB {#ab-06}

- **What it does:** optional. Monday, Thursday and Monday after the first Shabbos of
  Cheshvan and of Iyar.
- **Why:** the fast follows the Yamim Tovim, after the Shabbos on which it is announced.
- **Sources:** SA OC 492:1 with the Rema; Mishna Berura 492:3 (*verified*).
- **Checked against:** unit tests only; hebcal's comparison does not include BeHaB.
- **Confidence:** Medium.
- **Open:** **superseded by [AB-38](#ab-38)** (2026-10-21). The edge case recorded here
  (MB 492:3 speaks of the first Shabbos *after* Rosh Chodesh, but the code counted 1 Cheshvan
  or 1 Iyar itself when it was Shabbos) is fixed: the count now starts after Rosh Chodesh.

### AB-07. The molad in Jerusalem mean time {#ab-07}

- **What it does:** to turn the molad into an instant (for Kiddush Levana times), Luach
  reads it as mean solar time at longitude 35.2354° E (Jerusalem).
- **Why:** the calendar's molad is reckoned for Jerusalem.
- **Sources:** the molad itself: Rambam, Kiddush HaChodesh 6:8. *No source recorded* for the
  exact longitude, or for using mean rather than another local time. Kiddush Levana times:
  3 days (Talmidei Rabbeinu Yonah, cited in the Beis Yosef OC 426; MB 426:20), 7 days
  (SA OC 426:4), half a month (Rema OC 426:3), 15 days (SA OC 426:3; MB 426:17), all
  *verified*; the citation check found two of these attributions swapped and fixed them.
- **Checked against:** the molad's day, hour and chalakim match hebcal for Tishrei and Nisan
  5660–6000. The instant is not checked against an outside source.
- **Confidence:** Medium.
- **Open:** a source for the longitude convention used by luchos would settle this.
  Night-only and Motzaei Shabbos rules are not modelled.

### AB-08. Tachanun defaults {#ab-08}

- **What it does:** no Tachanun from Erev Yom Kippur through the end of Tishrei, and from
  Rosh Chodesh Sivan through 12 Sivan. Both are options.
- **Why:** these are common Ashkenazi customs.
- **Sources:** SA OC 131:6–7 with the Rema; Rema 494:3; Mishna Berura 131:36 for the days of
  tashlumin after Shavuos (*verified*). The end of Tishrei has **no Shulchan Aruch source**;
  it is luach custom.
- **Checked against:** unit tests only.
- **Confidence:** Medium.
- **Open:** customs differ widely; the defaults should be confirmed against a printed luach.

### AB-09. Omer count text in Nusach Ashkenaz {#ab-09}

- **What it does:** the count's wording defaults to Nusach Ashkenaz; Sefard and Edot
  HaMizrach are options.
- **Why:** a default had to be chosen.
- **Sources:** the count itself: Vayikra 23:15–16; Menachos 65b–66a (*verified*). *No source
  recorded* for the wording of any nusach.
- **Checked against:** the day numbers and sefiros match hebcal for all 49 days; the wording
  has unit tests only.
- **Confidence:** Low for the wording.
- **Open:** each wording should be checked against a named siddur.

### AB-10. Sea-level sunrise and sunset by default {#ab-10}

- **What it does:** sunrise and sunset are at sea level unless `useElevation` is on.
  Zmanim defined by degrees are always at sea level.
- **Why:** most luchos are calculated at sea level; a depression angle measures how bright
  the sky is, which does not depend on the visible horizon.
- **Sources:** R. Isser Zalman Meltzer, cited in Peninei Halakha, Tefilla 11:6 n. 7
  (*secondary*); Zmanim KeHilchasam, ch. 2 §§7, 9 (*secondary*, through a blog).
- **Checked against:** sea-level times against kosher-zmanim; elevation only by direction
  (earlier sunrise, later sunset).
- **Confidence:** Medium.
- **Open:** Peninei Halakha reports that the Shulchan Aruch HaRav uses a sunrise for about
  800 m everywhere, citing Igros Moshe OC 1:97 (*not verified*).

### AB-11. Rounding {#ab-11}

- **What it does:** times are rounded to the minute: earliest times up, deadlines down. It
  can be turned off.
- **Why:** a rounded time should never be less stringent than the exact one.
- **Sources:** *no source recorded* (a safety convention).
- **Checked against:** unit tests; oracle comparisons run unrounded.
- **Confidence:** High that it is the safer direction.
- **Open:** a fast's start is rounded down, because it is a deadline for eating.

### AB-12. Candle lighting 18 minutes; havdala at 8.5° {#ab-12}

- **What it does:** candle lighting defaults to 18 minutes before sunset; havdala and
  second-night candles to 8.5°.
- **Why:** 18 minutes is the most common diaspora custom; 8.5° is a widely printed time for
  three small stars.
- **Sources:**
  - Tosefes Shabbos: SA OC 261:2; the minutes are custom (Igros Moshe OC 2:6; Kaf HaChaim
    261:23; Yabia Omer 5:21) (*secondary*).
  - Three small stars: SA OC 293:2 (*verified*); 8.5° per R. Tukaczinsky and the Chabad luach
    (*secondary*).
  - Second night: SA OC 503:1 (not in the research note).
- **Checked against:** kosher-zmanim for candle lighting (within 10 seconds; 34 at Tromsø) and
  for tzeis 8.5°.
- **Confidence:** Medium.
- **Open:** local customs (Jerusalem 40 minutes and others) are options, not defaults.

### AB-13. Mincha Gedola and chatzos {#ab-13}

- **What it does:** chatzos is the sun's transit. Mincha Gedola of the Gra is 6.5 seasonal
  hours after sunrise; "30 minutes" is after the transit; "the later of the two" is
  offered too.
- **Why:** chatzos is the sun's true midpoint; the definitions follow the sources below.
- **Sources:** Magen Avraham 233:4 (chatzos is the sun's midpoint) (*verified*); SA OC 233:1
  and MB 233:1–4 (*verified*); "the later of" is Chabad practice (*secondary*; no primary
  source found).
- **Checked against:** kosher-zmanim (chatzos and 30 minutes within 15 seconds; Gra within
  1 second).
- **Confidence:** High for the Gra; Medium for "the later of".
- **Open:** the constant 15-second difference for chatzos is not explained.

### AB-14. Plag HaMincha of the Levush {#ab-14}

- **What it does:** Plag of the Levush is the same calculation as the Gra's (1¼ seasonal
  hours before sunset, on a sunrise-to-sunset day).
- **Why:** the Magen Avraham reports that the Levush counts the day from sunrise to sunset.
- **Sources:** Magen Avraham 233:3 and 267:1 (*verified*). The Levush's own text was **not
  read** (*not verified*).
- **Checked against:** the Gra's plag is checked against kosher-zmanim (within 8 seconds).
- **Confidence:** Medium.
- **Open:** **superseded as to its source by [AB-40](#ab-40)** (2026-10-21). The second
  citation audit found the source is Levush OC 267 as reported in Biur Halacha 261:2, and that
  Magen Avraham 233:3 reads the Levush as counting from tzeis; the sources above are kept
  for the record. The Levush should still be read in the original.

### AB-15. Fast times {#ab-15}

- **What it does:** minor fasts begin at alos 72 minutes and end at 7.083°.
- **Why:** both are common defaults in printed luachos.
- **Sources:** eating until alos: SA OC 564:1 (*verified*); the choice of alos is custom. End
  at three medium stars: SA OC 562:1 (*verified*). 7.083° per Dr. Baruch Cohn (*not
  verified*). *No source recorded* for choosing 7.083° over 6.45° (the Israeli custom).
- **Checked against:** both component times against kosher-zmanim; `fastTimes` itself has
  unit tests only.
- **Confidence:** Low for the choice of default.
- **Open:** whether the default should be 6.45° in Israel.

### AB-16. The Hebrew date changes at sunset {#ab-16}

- **What it does:** `hebrewDateAt` moves to the next day at sunset by default; nightfall is
  an option.
- **Why:** between sunset and nightfall the date is in doubt; the caller should choose the
  boundary that suits the question.
- **Sources:** *no source recorded* for sunset as the default.
- **Checked against:** unit tests only.
- **Confidence:** Medium.
- **Open:** nothing.

### AB-17. The horizon dip uses the earth's mean radius {#ab-17}

- **What it does:** with elevation on, the horizon dip uses a radius of 6,371 km.
- **Why:** the standard mean radius.
- **Sources:** *no source recorded*.
- **Checked against:** never compared with an outside oracle.
- **Confidence:** Medium.
- **Open:** a comparison with a luach that uses elevation would test it.

### AB-18. No made-up times at high latitudes {#ab-18}

- **What it does:** when the sun does not reach an angle, the time is `null` with a reason.
  Fallbacks (`nearestDay`, `halfNight`) exist but are off and are labelled when used.
- **Why:** a made-up time could be used as if it were real.
- **Sources:** the research recommends returning null and offering the Chabad fallback only
  as an explicit option (*secondary*). The opinions of Igros Moshe, the Minchas Yitzchak and
  the London Beth Din on high latitudes are *not verified* and are not cited.
- **Checked against:** unit tests (London 16.1° in June; Tromsø without sunrise).
- **Confidence:** High that null is the safe default.
- **Open:** neither fallback cites a source.

### AB-19. Haftara defaults {#ab-19}

- **What it does:** the minhag defaults to Ashkenaz. Shabbos HaGadol's haftara is read every
  year for Ashkenaz and Sephardi, only when Erev Pesach is Shabbos for Chabad, and never for
  Teimani. The Ashkenazi haftara of Kedoshim is Ezekiel 22:1–16.
- **Why:** each follows the most widely printed practice for that minhag.
- **Sources:**
  - Precedence: SA OC 425, 428, 684 and 685 with the Rema and Mishna Berura.
  - Shabbos HaGadol: customs differ; Chabad per Sefer HaMinhagim and SA HaRav 430:3; the
    Vilna Gaon's custom (every year except when Erev Pesach is Shabbos) is not built.
  - Kedoshim: Rema OC 428:8, ArtScroll, the Ezras Torah luach and Chabad; Hertz, Koren and
    Sefaria swap it with Amos.
  - [haftaros](./research/2026-10-21-haftaros.md); a value was recorded only when two
    sources agreed.
- **Checked against:** hebcal-leyning on every Shabbos 5660–6000; seven variants explained
  in [Accuracy](./accuracy.md).
- **Confidence:** High for Ashkenaz and Chabad; Medium for Sephardi (Sefaria's Sephardi data
  is incomplete); Low for Teimani (several values are null).
- **Open:** *no source recorded* for choosing "every year" as the Sephardi default for
  Shabbos HaGadol.

### AB-20. Daf HaShavua {#ab-20}

- **What it does:** a week runs Sunday to Shabbos, counted from 6 March 2005.
- **Why:** back-computed from Megillah 2 in October 2018 (Jewish Link, 4 October 2018).
- **Sources:** [learning cycles](./research/2026-10-21-learning-cycles.md).
- **Checked against:** hebcal-learning, 2005–2060.
- **Confidence:** Low. The back-computation puts Megillah 2 a day off the newspaper's date,
  so some groups may start the week on Shabbos.
- **Open:** confirmation from the organisers.

### AB-21. Mishna Yomis before 2021 {#ab-21}

- **What it does:** cycles before the 14th (25 December 2021) are counted back in 2,096-day
  cycles.
- **Why:** the 14th cycle's start is well documented; the early ones are not.
- **Sources:** Yeshiva World and the ArtScroll blog for the 14th cycle.
- **Checked against:** all 1,421 days of the dafyomi.co.il chart (2022–2026); hebcal-learning
  1990–2060.
- **Confidence:** High from 2021; Low before it. Early cycles may have run at another pace.
- **Open:** the first cycle's start date.

### AB-22. Amud HaYomi stops in 2038 {#ab-22}

- **What it does:** returns null after Me'ilah 22a (10 February 2038).
- **Why:** Dirshu has not published how Kinnim, Tamid and Middos will be learned.
- **Sources:** the Dirshu luach 5784 (Berachos 2a on 16 October 2023).
- **Checked against:** about 1,000 days of Dirshu's luach; hebcal-learning to 2037.
- **Confidence:** High up to 2038.
- **Open:** Dirshu's plan for the end of Kodashim.

### AB-23. The built-in city table {#ab-23}

- **What it does:** about 150 cities with Jewish communities, plus test cities for high
  latitudes and the date line. Israeli communities that GeoNames puts in Asia/Hebron are
  given Asia/Jerusalem.
- **Why:** those communities keep Israel time; Asia/Hebron's daylight-saving dates differ.
- **Sources:** GeoNames (CC-BY 4.0); overrides documented in `scripts/build-places.py`.
- **Checked against:** every place has a valid time zone and a Hebrew name.
- **Confidence:** High.
- **Open:** the count is **superseded by [AB-41](#ab-41)** (197 places since 2026-10-21).
  Requests for more cities are welcome.

### AB-24. Place search ranking {#ab-24}

- **What it does:** exact matches first, then prefixes, transliteration matches and
  substrings; larger places win ties.
- **Why:** so "Bene Beraq", "Petach Tikvah" and בני ברק all find the same place.
- **Sources:** *no source recorded* (a usability choice).
- **Checked against:** unit tests for common spellings.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-25. The day view's default zmanim {#ab-25}

- **What it does:** alos 72 minutes and 16.1°, misheyakir 11°, sunrise, Shema (Magen Avraham
  72 and Gra), Tefilla (Gra), chatzos, Mincha Gedola (later of two), Mincha Ketana and Plag
  (Gra), sunset, tzeis 8.5° and Rabbeinu Tam.
- **Why:** a set that covers the times most printed luachos show.
- **Sources:** *no source recorded* for the selection; each zman's own sources are on
  [Zmanim and sources](./halacha/zmanim.md).
- **Checked against:** each zman against kosher-zmanim.
- **Confidence:** Low (a selection, not a source).
- **Open:** apps should show the opinions their community follows.

### AB-26. The CLI prints Ashkenazi names {#ab-26}

- **What it does:** `npx luach` prints Ashkenazi names; `--locale` changes it.
- **Why:** a default had to be chosen.
- **Sources:** *no source recorded*.
- **Checked against:** CLI tests.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-27. iCal events {#ab-27}

- **What it does:** holidays, parsha and learning are all-day events; candle lighting,
  havdala and zmanim are zero-length events at the instant.
- **Why:** calendar apps show all-day events as banners and timed ones as moments.
- **Sources:** RFC 5545.
- **Checked against:** an independent parser (ical.js).
- **Confidence:** High.
- **Open:** nothing.

### AB-28. Israeli commemorations {#ab-28}

- **What it does:** optional. Each is listed from the year of its law. Yom HaAliyah on
  7 Cheshvan only; Begin Day on 4 Adar II in a leap year; Chag HaBanot on 1 Teves.
- **Why:** each follows its statute.
- **Sources:** [Israeli commemorations](./research/2026-10-21-israeli-commemorations.md):
  - Yom HaAliyah: the 2016 law, s. 2(א), sets 7 Cheshvan; 10 Nisan appears only in the
    purpose clause (Confidence: high).
  - Begin Day: the 1998 law says "ד׳ באדר"; Begin died on 4 Adar II 5752. The leap-year
    month is a judgement (Confidence: low).
  - Chag HaBanot: an ethnic custom, not an official day; 1 Teves per the Ministry of
    Education (Confidence: medium).
- **Checked against:** hebcal from the later of the two first years, Israel mode, with
  explained differences. Begin Day is not compared.
- **Confidence:** Medium.
- **Open:** Begin Day in a leap year.

### AB-29. English spellings {#ab-29}

- **What it does:** the plain-English locale writes "Tishri, Heshvan, Iyyar" and "Saturday".
- **Why:** conventional English spellings.
- **Sources:** *no source recorded* (common usage).
- **Checked against:** unit tests.
- **Confidence:** Not applicable.
- **Open:** the Ashkenazi and Sephardi locales are there for other spellings.

### AB-30. The demo app's choices {#ab-30}

- **What it does:** opens on Jerusalem with Ashkenazi names. Its pickers offer alos 72 min,
  16.1° and 90 min; Shema of the Gra, Magen Avraham 72, Magen Avraham 16.1° and the Baal
  HaTanya; tzeis 8.5°, 7.083°, 50 minutes and Rabbeinu Tam.
- **Why:** a demonstration of choosing opinions, not a recommendation.
- **Sources:** *no source recorded* for the selection.
- **Checked against:** all 16 screens are rendered in CI.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-31. Degree signs in Hebrew labels {#ab-31}

- **What it does:** a left-to-right mark follows each degree sign in Hebrew labels.
- **Why:** without it, "16.1°" can display as "°16.1" in right-to-left text.
- **Sources:** the Unicode bidirectional algorithm.
- **Checked against:** a unit test, and the demo app's Hebrew screens.
- **Confidence:** High.
- **Open:** nothing.

### AB-32. Release numbering before 1.0 {#ab-32}

- **What it does:** a patch release fixes bugs only; any change to an API, a default or a
  calculated result is a minor release.
- **Why:** people rely on calculated times; changing one silently could mislead them.
- **Sources:** Semantic Versioning (semver.org).
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-33. Publishing runs every check first {#ab-33}

- **What it does:** `npm publish` runs `npm run check` first; one command sets the version.
- **Why:** so a broken build cannot be published by accident.
- **Sources:** RELEASING.md.
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-34. No source maps for the city data {#ab-34}

- **What it does:** the generated city tables ship without source maps.
- **Why:** the maps were megabytes and useless; the package is about half the size.
- **Sources:** *no source recorded*.
- **Checked against:** the packed package was installed and tested in an empty project.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-35. Security reports and the code of conduct {#ab-35}

- **What it does:** security problems are reported privately through GitHub; the code of
  conduct is Luach's own short text.
- **Why:** private reports protect users until a fix is out.
- **Sources:** SECURITY.md; CODE_OF_CONDUCT.md.
- **Checked against:** nothing to check.
- **Confidence:** Not applicable.
- **Open:** private vulnerability reporting must be turned on in the repository settings.

### AB-36. Pirkei Avos one chapter a week {#ab-36}

- **What it does:** on the summer Shabbosim, one chapter a week; doubling up at the end is an
  option.
- **Why:** the simplest custom; the others are options.
- **Sources:** Rema OC 292:2 records the custom of saying Pirkei Avos in the summer
  (*verified*). *No source recorded* for one chapter rather than doubling up.
- **Checked against:** unit tests only.
- **Confidence:** Medium.
- **Open:** some read only until Shavuos; customs for the end of the summer differ.

### AB-37. Yom Kippur Katan when Erev Rosh Chodesh is Friday {#ab-37}

- **What it does:** an option `yomKippurKatanOnFriday`: Thursday (default) or Friday. On Shabbos it is Thursday.
- **Why:** the sources differ, so both are offered; the default is the behaviour before, and agrees with the oracle.
- **Sources:** Magen Avraham OC 417:3 (Friday); Mishna Berura 417:4 (Thursday for those who say Selichos, Friday for those who don't) (*verified*, citation audit).
- **Checked against:** @hebcal/core (Thursday); unit tests for both options.
- **Confidence:** High for the sources; the default is a judgement.
- **Open:** the month exclusions (AB-05) still have no source.

### AB-38. BeHaB from the first Shabbos after Rosh Chodesh {#ab-38}

- **What it does:** BeHaB starts after the first Shabbos *after* Rosh Chodesh; a Shabbos that is Rosh Chodesh is not counted.
- **Why:** the source says so; before, a Rosh Chodesh Shabbos was counted and the fasts came a week early.
- **Sources:** Mishna Berura 492:3, "שבת הראשון שאחר ר"ח" (*verified*).
- **Checked against:** @hebcal/core (`addBehab`); unit test for 5785 Cheshvan.
- **Confidence:** High.
- **Open:** nothing.

### AB-39. Local candle-lighting customs {#ab-39}

- **What it does:** a place may carry its documented custom (Jerusalem 40, Haifa 30); the day view, CLI and iCal use it unless the caller sets the minutes, and label it with the source.
- **Why:** the minutes are a local custom; a city whose custom is documented should not get the generic 18.
- **Sources:** Peninei Halakha, Shabbat 3:2 (Jerusalem 40, Haifa 30) and Zemanim 13:5 n. 11 (Jerusalem) (*verified*, read on ph.yhb.org.il). Not set without a source: Zichron Yaakov 30, Petach Tikva 40, the Shomron 30.
- **Checked against:** unit and CLI tests.
- **Confidence:** Medium: one published source per city.
- **Open:** Lu'ach Eretz Yisrael is reported to give Jerusalem 25 (not verified); other cities need sources.

### AB-40. Plag HaMincha of the Levush: the source {#ab-40}

- **What it does:** unchanged calculation (the Gra's); the citation now names where the Levush's view is reported.
- **Why:** the earlier citation, Magen Avraham 233:3, reads the Levush differently (from tzeis).
- **Sources:** Levush OC 267, as reported in Biur Halacha 261:2 s.v. "להקדים" (*verified*); Magen Avraham 233:3 (*verified*).
- **Checked against:** the [citation audit](./research/2026-10-21-citation-audit-zmanim.md).
- **Confidence:** Medium: the Levush itself was not read.
- **Open:** reading the Levush directly; whether to offer MA's reading as an option.

### AB-41. 197 built-in places {#ab-41}

- **What it does:** the built-in table has 197 places (was 144), adding cities with Jewish communities.
- **Why:** the second implementation had communities `main` lacked (Toms River, Spring Valley, Boca Raton, Durban, Brisbane…).
- **Sources:** GeoNames (CC-BY 4.0), regenerated with `scripts/build-places.py`; six Hebrew names written for Luach where GeoNames has none. *No source recorded* for the choice of cities: a judgement.
- **Checked against:** regenerating without changes reproduced the existing files exactly; place tests.
- **Confidence:** Medium.
- **Open:** Kiryat Ata and Nof HaGalil are not built in.

### AB-42. Search no longer guesses {#ab-42}

- **What it does:** transliteration matches need four consonants and must cover most of the name; the full table knows the built-in spellings and every Hebrew name.
- **Why:** "Tzfat" returned a town in Egypt and "Boro Park" a district of São Paulo: a wrong place gives wrong zmanim, worse than no match.
- **Sources:** *No source recorded*: an engineering choice.
- **Checked against:** search tests with those cases.
- **Confidence:** Medium.
- **Open:** nothing.

### AB-43. The CLI's place and elevation options {#ab-43}

- **What it does:** `--city` falls back to the full table; `--lat/--lon` need `--tz`; `--elevation` turns on elevation-adjusted sunrise and sunset.
- **Why:** a missing city, or the computer's own time zone, silently gave wrong or no results.
- **Sources:** *No source recorded*: interface choices. Elevation follows AB-10 and AB-17.
- **Checked against:** CLI tests.
- **Confidence:** Not applicable.
- **Open:** `luach ics --elevation` errors, because the iCal export takes no zmanim options.

### AB-44. Kedoshim when Acharei Mos's haftara was displaced {#ab-44}

- **What it does:** Ashkenazi Kedoshim reads Amos 9:7-15 when Acharei Mos's own haftara was displaced; otherwise Ezekiel 22:1-16.
- **Why:** the source says so; the accuracy page had called the difference a Rema-vs-Hertz variant.
- **Sources:** Mishna Berura 428:26, citing R. Akiva Eiger, who names Machar Chodesh (*verified*). Applying the same reason to Shabbos HaGadol and Rosh Chodesh is Luach's reading.
- **Checked against:** @hebcal/leyning, every Shabbos 5660–6000 (it agrees, apart from ending Ezekiel 22 at 22:19).
- **Confidence:** High for Machar Chodesh; Medium for the extension.
- **Open:** whether the MB's reason covers Shabbos HaGadol and Rosh Chodesh.

### AB-45. Shabbos Shuva: Micah or Joel {#ab-45}

- **What it does:** Ashkenazi Shabbos Shuva adds Micah 7:18-20 with Vayelech and Joel 2:15-27 with Haazinu; option `shuvaAddition`.
- **Why:** the source says so; before, Joel was always added.
- **Sources:** Mishna Berura 428:23, recording the Dagul Mervava (*verified*). Joel before Micah for `'both'`: *no source recorded* (book order).
- **Checked against:** @hebcal/leyning for the Vayelech years.
- **Confidence:** High.
- **Open:** the order for `'both'`.

### AB-46. Rosh Chodesh Av and Elul haftara options {#ab-46}

- **What it does:** options `roshChodeshAv` and `roshChodeshElul`; defaults unchanged.
- **Why:** the Rema and the Mishna Berura differ, so both are offered.
- **Sources:** Rema OC 425:1; Mishna Berura 425:7–8; Shulchan Aruch OC 425:1 (*verified*).
- **Checked against:** unit tests.
- **Confidence:** High for the sources; the defaults are the behaviour before.
- **Open:** nothing.

### AB-47. Pirkei Avos on Erev Tisha B'Av, and until Shavuos {#ab-47}

- **What it does:** Pirkei Avos is not said on Shabbos 8 Av; option `until: 'shavuos'` for one round before Shavuos.
- **Why:** the source says so; before, a chapter was said on 8 Av and every later chapter shifted.
- **Sources:** Rema OC 553:2, "אם חל [ערב ת"ב] בשבת אין אומרים פרקי אבות"; Kaf HaChaim 292:23 (*verified*).
- **Checked against:** @hebcal/learning (`pirkeiAvot`), every Shabbos 5700–5900, Israel and diaspora.
- **Confidence:** High.
- **Open:** what is read on a seventh Shabbos before Shavuos (null).

### AB-48. Year 9999 {#ab-48}

- **What it does:** every date in 9999 works; answers that need a date in year 10000 are null.
- **Why:** 9999 is advertised as supported (P-04); a guessed answer would be worse than none.
- **Sources:** P-04; the calendar arithmetic of Rosh Hashana 10000 (Rambam, Hilchos Kiddush HaChodesh 7).
- **Checked against:** unit tests over every day of 9999.
- **Confidence:** High.
- **Open:** nothing.

### AB-49. No fallback in polar night {#ab-49}

- **What it does:** the high-latitude fallbacks apply only when the sun never gets low enough; in polar night the time stays null.
- **Why:** in polar night the sun never rises to the angle, so any time would be invented.
- **Sources:** *No source recorded* for the fallbacks themselves (AB-18).
- **Checked against:** Svalbard in winter and summer; astronomy-engine for edge days.
- **Confidence:** High for the null; the fallbacks remain a judgement.
- **Open:** nothing.

### AB-50. Limits on caller-supplied numbers {#ab-50}

- **What it does:** angles must be more than 0.833° and at most 30° below the horizon, minutes after sunset 0–180, candle lighting 0–180; otherwise a RangeError.
- **Why:** a missing or negative number produced an invalid time and crashed JSON output; a negative angle gave "havdala" before sunset.
- **Sources:** *No source recorded*: the limits are generous bounds, not halachic positions.
- **Checked against:** unit tests.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-51. Historical offsets keep their seconds {#ab-51}

- **What it does:** UTC offsets keep seconds (local mean time before standard time); rounding is to whole minutes of the local clock.
- **Why:** rounding the offset moved historical zmanim by up to 30 seconds.
- **Sources:** the IANA time-zone database through `Intl`.
- **Checked against:** Jerusalem 1900 noon (09:39:20Z).
- **Confidence:** High.
- **Open:** nothing.

### AB-52. The day JSON Schema ships in the package {#ab-52}

- **What it does:** `luach/schema/day.schema.json`, with a URL that serves JSON; every fixed-shape object is closed.
- **Why:** the schema was only in the docs, and its URL served a web page.
- **Sources:** JSON Schema 2020-12.
- **Checked against:** Ajv against real output over a year of days, Israel and diaspora, polar places, every locale.
- **Confidence:** High.
- **Open:** nothing.

### AB-53. Import and licence checks read code properly {#ab-53}

- **What it does:** the checks use a small tokenizer, catch `createRequire` and computed imports, and scan the built files for oracle code.
- **Why:** regular expressions could be fooled, which matters for the clean room (P-01).
- **Sources:** ADR 0006.
- **Checked against:** 22 probe tests.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-54. Runtime smoke tests {#ab-54}

- **What it does:** CI loads the built package on Node 18, 20 and 22, Bun, Deno and headless Chromium, in ESM and CommonJS, and runs the CLI.
- **Why:** the package says Node 18+ and ships CommonJS; neither was tested.
- **Sources:** ADR 0007.
- **Checked against:** the runtimes themselves.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-55. The example server limits calendar ranges {#ab-55}

- **What it does:** at most 400 days with a place, 5 × 366 without.
- **Why:** one request for many years could tie up the server.
- **Sources:** *No source recorded*: an engineering choice for the example only.
- **Checked against:** handler tests.
- **Confidence:** Not applicable.
- **Open:** nothing.

### AB-56. Shabbos before a postponed Tisha B'Av {#ab-56}

- **What it does:** on that Shabbos the day view gives when Shabbos ends (not havdala) and when the fast begins; havdala over a cup comes when the fast ends on Sunday night.
- **Why:** havdala over a cup is not said on Motzaei Shabbos then; showing a havdala time was wrong.
- **Sources:** Shulchan Aruch OC 556:1; Mishna Berura 556:2; Rema OC 299:10 ("HaMavdil" before melacha) (*verified*).
- **Checked against:** unit, CLI and iCal tests for 2 August 2025, New York.
- **Confidence:** High.
- **Open:** nothing.

### AB-57. Mourning restrictions by named custom {#ab-57}

- **What it does:** `mourningPeriods(date, { sefirah, beinHametzarim, meatWine })` says, per
  category, whether the custom restricts haircuts, weddings, meat and wine, and laundry that
  day, with part of the day (`until-sunrise`, `night-only`, `until-chatzos`) and the source.
- **Why:** the customs differ widely and there is no common default; a calendar span alone
  ("the Three Weeks") was being read as a rule. Days the sources do not settle (weddings on
  10 Av for Ashkenaz; the fast day itself for Sephardim when there is no week of Tisha B'Av;
  meat on 10 Av without a Three Weeks custom) are `null`.
- **Sources:** SA and Rema OC 493:1–3; MB 493:5–7, 10–11, 14–15; Kaf HaChaim OC 493:13
  (the Arizal); SA and Rema OC 551:2–4, 9; MB 551:58–59; SA and Rema OC 558:1; MB 558:3–4
  (*verified*, Sefaria). Kaf HaChaim OC 551:125 (from 2 Av) was found by a research agent and
  not re-read.
- **Checked against:** `test/mourning.test.ts`, a test per rule.
- **Confidence:** Medium: the sources are read, but the exceptions (a bris, a seudas mitzvah,
  Shabbos Chazon, mourners, children) are not modelled.
- **Open:** more customs on request.

### AB-58. Tachanun on Pesach Sheni {#ab-58}

- **What it does:** no Tachanun on 14 Iyar unless `pesachSheniTachanun: 'say'`.
- **Why:** the Shulchan Aruch does not list it; the later works record the custom to omit it.
- **Sources:** Kaf HaChaim OC 131:98 (Knesses HaGedolah); Sha'arei Teshuvah 131:19; Aruch
  HaShulchan OC 131:12 ("ופסח שני לא חשבו והוא פלא, ומנהג הספרדים שלא ליפול בו")
  (*verified*, Sefaria).
- **Checked against:** `test/sourced-options.test.ts`.
- **Confidence:** High.
- **Open:** nothing.

### AB-59. Yom Kippur Katan: which months {#ab-59}

- **What it does:** no Yom Kippur Katan before Tishrei, Iyar or Teves; before Cheshvan only
  with `yomKippurKatanCheshvan`. Friday or Shabbos moves it to Thursday by default.
- **Why:** each exclusion now has its reason; Cheshvan had none, so it became an option.
- **Sources:** SA OC 581:2 (Erev Rosh Hashana); MB 429:10 (Erev Rosh Chodesh Iyar is in
  Nisan); SA OC 670:1 and MA, MB 686:1 (Chanukah); Kaf HaChaim OC 417:16 (Cheshvan: "צריך
  להתענות"); MB 550:11 and Aruch HaShulchan OC 417:11 (Thursday) (*verified*, Sefaria).
- **Checked against:** `test/sourced-options.test.ts`; the hebcal oracle for the other months.
- **Confidence:** Medium: the default for Cheshvan (off) has no source.
- **Open:** whether Cheshvan should be on by default.

### AB-60. Mashiv haruach and morid hatal {#ab-60}

- **What it does:** `amidahSeason` gives "mashiv haruach" at Shacharis of 15 Nisan, and
  `moridHatal` only for a non-Ashkenaz `nusach` or in Israel.
- **Why:** the change is at Musaf of the first day of Pesach, so Shacharis is still winter;
  and Ashkenazim outside Israel say neither in summer.
- **Sources:** SA OC 114:1–3; Rema OC 114:3 ("ואנו בני אשכנז לא מזכירין טל"); MB 114:3, 13;
  Tashbetz Katan 101 (Israel) (*verified* except the Tashbetz Katan, found by a research agent).
- **Checked against:** `test/amidah-season.test.ts`.
- **Confidence:** High.
- **Open:** nothing.
