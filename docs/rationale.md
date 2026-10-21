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

## Open questions

### Q-00. Unmerged branches {#q-00}

- **What it does:** lists branches with work not yet on `main` (currently none).
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
- **Open:** Yosef's wording.

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

### Q-05. Modern Israeli days before their amendments {#q-05}

- **What it does:** the moving rules apply from the year each was adopted: Yom HaShoah
  Friday → Thursday from 1951 and Sunday → Monday from 1997; Yom HaAtzmaut Monday → Tuesday
  from 2004. These days are optional and off by default.
- **Why:** a historical date should match what was observed that year.
- **Sources:** [modern Israeli days](./research/2026-10-21-modern-israeli-days.md): the law
  texts on Wikisource, the Knesset committee protocol of 11 March 1997 (Amendment No. 3),
  and news and educational sources listed there.
- **Checked against:** hebcal, every year 5660–6000 (differences explained in
  [Accuracy](./accuracy.md)).
- **Confidence:** Medium. The Knesset's own PDFs could not be opened.
- **Open:**
  - **Discrepancy:** the research note says the Friday → Thursday rule for Yom HaShoah
    should apply "from 1959", but the code applies it from 1951. The note also could not
    confirm whether the rule was in the 1959 law or added in 1961. A scholar with access to
    the Knesset records could settle this.
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
- **Open:** awaits Yosef's acknowledgement.

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
- **Open:** Yosef may approve the deferral, or seek permission to ship the tables.

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
- **Open:** for Erev Rosh Chodesh on Friday, MB 417:4 says that those who say Selichos fast
  on Thursday and others on Friday; the code always uses Thursday.

### AB-06. BeHaB {#ab-06}

- **What it does:** optional. Monday, Thursday and Monday after the first Shabbos of
  Cheshvan and of Iyar.
- **Why:** the fast follows the Yamim Tovim, after the Shabbos on which it is announced.
- **Sources:** SA OC 492:1 with the Rema; Mishna Berura 492:3 (*verified*).
- **Checked against:** unit tests only; hebcal's comparison does not include BeHaB.
- **Confidence:** Medium.
- **Open:** **edge case.** MB 492:3 speaks of the first Shabbos *after* Rosh Chodesh, but
  the code counts 1 Cheshvan or 1 Iyar itself when it is Shabbos. This should be checked
  against a printed luach.

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
- **Open:** on the MA's reading the day may end at the end of sunset, which would make a
  slightly later variant; not built. The Levush should be read in the original.

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
- **Open:** requests for more cities are welcome.

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
