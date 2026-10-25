---
outline: [2, 3]
---

# Halachic choices and calculations

> **Ask your rav. This library calculates; it does not rule.**

Every place where Luach had to choose, between opinions, customs, or ways to calculate, is
listed here: what it does, why, the sources it rests on, how
confident the reasoning is, and what is still open. It is here so that scholars, rabbanim and
developers can examine it, question it and correct it.

Luach follows the sources: where a source and a convenience differ, it follows the source and
says so. Where customs differ it offers each as an option, and its default is a convenience,
documented as one, never a ruling.

::: warning Written by an AI, not a ruling
These notes were written by the AI coding assistant that built Luach, to record its reasoning
so that people can check it. They are not a psak.
:::

## How to read an entry

- **Status:** *Settled* (chosen and in effect), *Default* (what the code does unless you pass an
  option; open to review), *Open question* (not yet settled; the current behaviour is given),
  or *Proposed*.
- **Sources:** a citation marked *verified* was read in the primary text (usually on Sefaria);
  *secondary* means it was confirmed through a named secondary source; *not verified* means
  nobody has checked it in print. *No source recorded* means none is known: the choice was a
  convenience.
- **Confidence:** *High*, *Medium* or *Low*.
- **Open:** known gaps, disagreements, and what would change it.

## Ask a question or correct a source

Open an issue with the **Question about a source or a halachic choice** template
([new issue](https://github.com/yskolnick/luach/issues/new/choose)). Name the entry, say what
is wrong or unclear, and give your source. Corrections to sources are especially welcome.

Every zman's opinion and source is on [Zmanim: opinions and sources](./zmanim.md); every citation
in the code is on [Sources](../sources.md).


## Calendar and dates

### Supported range: Hebrew years 1–9999, proleptic Gregorian {#supported-range-hebrew-years-1-9999-proleptic-gregorian}

- **Status:** Proposed.
- **What it does:** converts dates for Hebrew years 1 to 9999 (3761 BCE to 6239 CE), using
  the Gregorian calendar even before 1582.
- **Why:** the Rambam's arithmetic is exact over the whole range (the largest number of
  chalakim, about 10¹¹, is far inside JavaScript's exact integers), and using one civil
  calendar throughout avoids a silent switch in 1582.
- **Sources:** Rambam, Hilchos Kiddush HaChodesh 6–8: BaHaRaD (6:8), the 19-year cycle,
  and the four dechiyos (7:1–7) (*verified* in the citation check). ADR 0004.
- **Confidence:** High.
- **Open:** dates before 1582 are proleptic Gregorian, not the Julian dates historians use;
  this is documented, not converted.

### Year 9999 {#year-9999}

- **Status:** Default.
- **What it does:** every date in 9999 works; answers that need a date in year 10000 are null.
- **Why:** 9999 is documented as supported; a guessed answer would be worse than none.
- **Sources:** the supported range above; the calendar arithmetic of Rosh Hashana 10000 (Rambam, Hilchos Kiddush HaChodesh 7).
- **Confidence:** High.
- **Open:** nothing.

### Exact thousands in gematriya {#exact-thousands-in-gematriya}

- **Status:** Default.
- **What it does:** 1000 is written א׳, the same as 1; `parseGematriya('א׳')` returns 1.
- **Why:** thousands are written as a letter with a geresh (ה׳ = 5000), so an exact
  multiple of 1000 is ambiguous; reading it as the units digit is the safer guess for dates.
- **Sources:** *no source recorded*.
- **Confidence:** Low (a convention, not a source).
- **Open:** a printed convention for writing exact thousands would settle it.

### Hebrew years without the thousands {#hebrew-years-without-the-thousands}

- **Status:** Default.
- **What it does:** `formatHebrewDate` writes 5787 as תשפ״ז; `thousands: true` gives ה׳תשפ״ז.
- **Why:** this is how years are usually written.
- **Sources:** *no source recorded* (common usage).
- **Confidence:** Medium.
- **Open:** nothing.

### The Hebrew date changes at sunset {#the-hebrew-date-changes-at-sunset}

- **Status:** Default.
- **What it does:** `hebrewDateAt` moves to the next day at sunset by default; nightfall is
  an option.
- **Why:** between sunset and nightfall the date is in doubt; the caller should choose the
  boundary that suits the question.
- **Sources:** *no source recorded* for sunset as the default.
- **Confidence:** Medium.
- **Open:** nothing.

### Anniversary rules {#anniversary-rules}

- **Status:** Open question.
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
- **Confidence:** High for the sources; the choice of defaults is a judgement.
- **Open:**
  - Not modelled: the Rema's exception that a death in Adar II of a leap year keeps Adar II
    in later leap years (Terumas HaDeshen 294; Rema YD 402:12).
  - The defaults are open for comment.
- **Update 2026-10-21:** a birthday for 30 Adar I observed in a common year is now 1 Nisan,
  not 30 Shevat: Magen Avraham OC 55:10 and Mishna Berura 55:45 (the age is not complete until
  the 1st of the next month) and MB 55:44 (*verified*). New option `adarI` for one born in Adar I whose birthday falls in a leap
  year: `'levush'` (default; MB 55:43, "the consensus of the later authorities") or
  `'magen-avraham'` (MA 55:10, Adar II) (*verified*).


## Israel or the diaspora

### Israel or the diaspora from the place {#israel-or-the-diaspora-from-the-place}

- **Status:** Settled.
- **What it does:** when a caller gives a place but not `israel`, Luach decides with
  `isInIsrael`; without a place, the diaspora stays the default; an explicit option wins.
- **Why:** a user in Jerusalem who forgets the option should not get two days of Yom Tov.
- **Sources:** the outline is [What `isInIsrael` covers](#what-isinisrael-covers).
- **Confidence:** Medium. Near a border the outline is approximate ([What `isInIsrael` covers](#what-isinisrael-covers)).
- **Open:** near a border, pass `israel` explicitly and ask your rav.

### What `isInIsrael` covers {#what-isinisrael-covers}

- **Status:** Proposed.
- **What it does:** a simplified outline of where communities keep one day of Yom Tov: the
  State of Israel with Judea and Samaria, the Golan Heights and Gaza, accurate to a few
  kilometres. Callers can always pass `israel` explicitly.
- **Why:** the function only chooses Israel or diaspora rules; it makes no political
  statement.
- **Sources:** *no external source recorded*. The outline was drawn for Luach from public map
  knowledge ([data sources](../data-sources.md)).
- **Confidence:** Medium for the outline; the question of which places keep one day near the
  borders is halachic, and the library does not decide it.
- **Open:** near a border, ask your rav. A sourced outline would be welcome.


## Holidays, fasts and special days

### Purim Meshulash on 16 Adar {#purim-meshulash-on-16-adar}

- **Status:** Default.
- **What it does:** when 15 Adar is Shabbos, the event "Purim Meshulash" is on Sunday,
  16 Adar.
- **Why:** Jerusalem spreads Shushan Purim over three days; the event marks the third.
- **Sources:** SA OC 688:6: Megillah on Friday, Al HaNissim on Shabbos, the seudah on Sunday
  (*verified*).
- **Confidence:** High for the dates. Choosing the Sunday to carry the name is a convention.
- **Open:** an app may want all three days listed.

### Leil Selichos on the Shabbos {#leil-selichos-on-the-shabbos}

- **Status:** Default.
- **What it does:** Leil Selichos (Ashkenaz) is dated on the Shabbos whose night begins
  Selichos.
- **Why:** the date follows the Rema's rule; the event is placed on the Shabbos so that its
  night is the right one.
- **Sources:** Rema OC 581:1 gives the weekday rule; the four-day reason is Mishna Berura
  581:6 (*verified*; the citation check corrected the attribution).
- **Confidence:** High.
- **Open:** Sephardim say Selichos from Rosh Chodesh Elul (SA OC 581:1); this event is
  Ashkenazi only.

### Yom Kippur Katan {#yom-kippur-katan}

- **Status:** Default.
- **What it does:** optional. Not listed before Rosh Chodesh Tishrei, Cheshvan, Teves or
  Iyar; moved to Thursday when Erev Rosh Chodesh is Friday or Shabbos.
- **Why:** the move follows the Mishna Berura; the exclusions follow printed siddurim and
  luchos.
- **Sources:** Mishna Berura 417:4; Magen Avraham 417:3 (*verified*). The month exclusions
  are **not** in the MB or MA; they are a siddur and luach custom, and lists differ.
- **Confidence:** Medium.
- **Open:** see also [Yom Kippur Katan when Erev Rosh Chodesh is Friday](#yom-kippur-katan-when-erev-rosh-chodesh-is-friday). Erev Rosh
  Chodesh on Friday is now an option (`yomKippurKatanOnFriday`), with the Magen Avraham and
  the Mishna Berura cited for each side; Thursday stays the default.

### Yom Kippur Katan when Erev Rosh Chodesh is Friday {#yom-kippur-katan-when-erev-rosh-chodesh-is-friday}

- **Status:** Default.
- **What it does:** an option `yomKippurKatanOnFriday`: Thursday (default) or Friday. On Shabbos it is Thursday.
- **Why:** the sources differ, so both are offered; the default is the behaviour before.
- **Sources:** Magen Avraham OC 417:3 (Friday); Mishna Berura 417:4 (Thursday for those who say Selichos, Friday for those who don't) (*verified*).
- **Confidence:** High for the sources; the default is a judgement.
- **Open:** the month exclusions (in [Yom Kippur Katan](#yom-kippur-katan)) still have no source.

### Yom Kippur Katan: which months {#yom-kippur-katan-which-months}

- **Status:** Default.
- **What it does:** no Yom Kippur Katan before Tishrei, Iyar or Teves; before Cheshvan only
  with `yomKippurKatanCheshvan`. Friday or Shabbos moves it to Thursday by default.
- **Why:** each exclusion now has its reason; Cheshvan had none, so it became an option.
- **Sources:** SA OC 581:2 (Erev Rosh Hashana); MB 429:10 (Erev Rosh Chodesh Iyar is in
  Nisan); SA OC 670:1 and MA, MB 686:1 (Chanukah); Kaf HaChaim OC 417:16 (Cheshvan: "צריך
  להתענות"); MB 550:11 and Aruch HaShulchan OC 417:11 (Thursday) (*verified*, Sefaria).
- **Confidence:** Medium: the default for Cheshvan (off) has no source.
- **Open:** whether Cheshvan should be on by default.

### Yom Kippur Katan before Cheshvan stays off by default {#yom-kippur-katan-before-cheshvan-stays-off-by-default}

- **Status:** Settled.
- **What it does:** no Yom Kippur Katan before Cheshvan unless `yomKippurKatanCheshvan`.
- **Why:** common printed calendars leave it out.
- **Sources:** Kaf HaChaim OC 417:16 for the option (*verified*).
- **Confidence:** Low as to a source for the default; none was found.
- **Open:** a source for leaving it out.

### BeHaB {#behab}

- **Status:** Default.
- **What it does:** optional. Monday, Thursday and Monday after the first Shabbos of
  Cheshvan and of Iyar.
- **Why:** the fast follows the Yamim Tovim, after the Shabbos on which it is announced.
- **Sources:** SA OC 492:1 with the Rema; Mishna Berura 492:3 (*verified*).
- **Confidence:** Medium.
- **Open:** corrected in [BeHaB from the first Shabbos after Rosh Chodesh](#behab-from-the-first-shabbos-after-rosh-chodesh). The edge case recorded here
  (MB 492:3 speaks of the first Shabbos *after* Rosh Chodesh, but the code counted 1 Cheshvan
  or 1 Iyar itself when it was Shabbos) is fixed: the count now starts after Rosh Chodesh.

### BeHaB from the first Shabbos after Rosh Chodesh {#behab-from-the-first-shabbos-after-rosh-chodesh}

- **Status:** Default.
- **What it does:** BeHaB starts after the first Shabbos *after* Rosh Chodesh; a Shabbos that is Rosh Chodesh is not counted.
- **Why:** the source says so; before, a Rosh Chodesh Shabbos was counted and the fasts came a week early.
- **Sources:** Mishna Berura 492:3, "שבת הראשון שאחר ר"ח" (*verified*).
- **Confidence:** High.
- **Open:** nothing.

### Fast times {#fast-times}

- **Status:** Default.
- **What it does:** minor fasts begin at alos 72 minutes and end at 7.083°.
- **Why:** both are common defaults in printed luachos.
- **Sources:** eating until alos: SA OC 564:1 (*verified*); the choice of alos is custom. End
  at three medium stars: SA OC 562:1 (*verified*). 7.083° per Dr. Baruch Cohn (*not
  verified*). *No source recorded* for choosing 7.083° over 6.45° (the Israeli custom).
- **Confidence:** Low for the choice of default.
- **Open:** whether the default should be 6.45° in Israel.

### Shabbos before a postponed Tisha B'Av {#shabbos-before-a-postponed-tisha-b-av}

- **Status:** Default.
- **What it does:** on that Shabbos the day view gives when Shabbos ends (not havdala) and when the fast begins; havdala over a cup comes when the fast ends on Sunday night.
- **Why:** havdala over a cup is not said on Motzaei Shabbos then; showing a havdala time was wrong.
- **Sources:** Shulchan Aruch OC 556:1; Mishna Berura 556:2; Rema OC 299:10 ("HaMavdil" before melacha) (*verified*).
- **Confidence:** High.
- **Open:** nothing.

### Modern Israeli days follow each law from its year {#modern-israeli-days-follow-each-law-from-its-year}

- **Status:** Settled.
- **What it does:** see [Modern Israeli days before their amendments](#modern-israeli-days-before-their-amendments).
- **Why:** so a historical date matches what was observed.
- **Sources:** the Knesset laws and their amendments.
- **Confidence:** Medium (the Knesset's own PDFs could not be opened).
- **Open:** whether the Yom HaShoah Friday rule was in the 1959 law or the 1961 amendment;
  it changes no date.

### Modern Israeli days before their amendments {#modern-israeli-days-before-their-amendments}

- **Status:** Open question.
- **What it does:** the moving rules apply from the year each was adopted: Yom HaShoah
  Friday → Thursday from 1959 and Sunday → Monday from 1997; Yom HaAtzmaut Monday → Tuesday
  from 2004. These days are optional and off by default.
- **Why:** a historical date should match what was observed that year.
- **Sources:** the law
  texts on Wikisource, the Knesset committee protocol of 11 March 1997 (Amendment No. 3),
  and news and educational sources.
- **Confidence:** Medium. The Knesset's own PDFs could not be opened.
- **Open:**
  - **Resolved 2026-10-21:** the Friday → Thursday rule for Yom HaShoah now applies from
    1959, the year of the law; 1954 stays on Friday. Whether the
    rule was in the 1959 law or added in 1961 is still unconfirmed (it affects no year: no
    27 Nisan fell on Friday between 1959 and 1961).
  - Not modelled: the 1954 date of Yom HaAtzmaut's Shabbos rule, and the uncertain 1950
    date.

### Israeli commemorations {#israeli-commemorations}

- **Status:** Default.
- **What it does:** optional. Each is listed from the year of its law. Yom HaAliyah on
  7 Cheshvan only; Begin Day on 4 Adar II in a leap year; Chag HaBanot on 1 Teves.
- **Why:** each follows its statute.
- **Sources:** the Knesset laws:
  - Yom HaAliyah: the 2016 law, s. 2(א), sets 7 Cheshvan; 10 Nisan appears only in the
    purpose clause (Confidence: high).
  - Begin Day: the 1998 law says "ד׳ באדר"; Begin died on 4 Adar II 5752. The leap-year
    month is a judgement (Confidence: low).
  - Chag HaBanot: an ethnic custom, not an official day; 1 Teves per the Ministry of
    Education (Confidence: medium).
- **Confidence:** Medium.
- **Open:** Begin Day in a leap year.


## Molad and Kiddush Levana

### The molad in Jerusalem mean time {#the-molad-in-jerusalem-mean-time}

- **Status:** Default.
- **What it does:** to turn the molad into an instant (for Kiddush Levana times), Luach
  reads it as mean solar time at longitude 35.2354° E (Jerusalem).
- **Why:** the calendar's molad is reckoned for Jerusalem.
- **Sources:** the molad itself: Rambam, Kiddush HaChodesh 6:8. *No source recorded* for the
  exact longitude, or for using mean rather than another local time. Kiddush Levana times:
  3 days (Talmidei Rabbeinu Yonah, cited in the Beis Yosef OC 426; MB 426:20), 7 days
  (SA OC 426:4), half a month (Rema OC 426:3), 15 days (SA OC 426:3; MB 426:17), all
  *verified*; the citation check found two of these attributions swapped and fixed them.
- **Confidence:** Medium.
- **Open:** a source for the longitude convention used by luchos would settle this.
  Night-only and Motzaei Shabbos rules are not modelled.


## Tefillah and customs

### Tachanun defaults {#tachanun-defaults}

- **Status:** Default.
- **What it does:** no Tachanun from Erev Yom Kippur through the end of Tishrei, and from
  Rosh Chodesh Sivan through 12 Sivan. Both are options.
- **Why:** these are common Ashkenazi customs.
- **Sources:** SA OC 131:6–7 with the Rema; Rema 494:3; Mishna Berura 131:36 for the days of
  tashlumin after Shavuos (*verified*). The end of Tishrei has **no Shulchan Aruch source**;
  it is luach custom.
- **Confidence:** Medium.
- **Open:** customs differ widely; the defaults should be confirmed against a printed luach.

### Tachanun after Sukkos follows the place's custom {#tachanun-after-sukkos-follows-the-place-s-custom}

- **Status:** Settled.
- **What it does:** `tefillahOn` omits Tachanun through Rosh Chodesh Cheshvan in Israel and
  through Isru Chag outside it, unless `tishreiTachanun` is given.
- **Why:** to match the customs. The Ashkenazi works resume after Isru Chag; the
  custom in Israel (and of the Sephardim) is the whole of Tishrei. Luach has no nusach option
  in `tefillahOn`, so the place decides and Sephardim abroad pass the option.
- **Sources:** SA OC 131:7; Kitzur SA 22:8; Sha'arei Teshuvah 131:19; Aruch HaShulchan OC
  131:12; Kaf HaChaim OC 131:98 (citing Chaim Sha'al on the custom in Israel) (*verified*,
  Sefaria).
- **Confidence:** Medium: the reading of "Match the customs" is Luach's; the Israeli Ashkenazi
  custom rests on Kaf HaChaim's report.
- **Open:** a `nusach` option for `tefillahOn`, if wanted.

### Tachanun on Pesach Sheni {#tachanun-on-pesach-sheni}

- **Status:** Default.
- **What it does:** no Tachanun on 14 Iyar unless `pesachSheniTachanun: 'say'`.
- **Why:** the Shulchan Aruch does not list it; the later works record the custom to omit it.
- **Sources:** Kaf HaChaim OC 131:98 (Knesses HaGedolah); Sha'arei Teshuvah 131:19; Aruch
  HaShulchan OC 131:12 ("ופסח שני לא חשבו והוא פלא, ומנהג הספרדים שלא ליפול בו")
  (*verified*, Sefaria).
- **Confidence:** High.
- **Open:** nothing.

### Mashiv haruach and morid hatal {#mashiv-haruach-and-morid-hatal}

- **Status:** Default.
- **What it does:** `amidahSeason` gives "mashiv haruach" at Shacharis of 15 Nisan, and
  `moridHatal` only for a non-Ashkenaz `nusach` or in Israel.
- **Why:** the change is at Musaf of the first day of Pesach, so Shacharis is still winter;
  and Ashkenazim outside Israel say neither in summer.
- **Sources:** SA OC 114:1–3; Rema OC 114:3 ("ואנו בני אשכנז לא מזכירין טל"); MB 114:3, 13;
  Tashbetz Katan 101 (Israel) (*verified* except the Tashbetz Katan, found in a secondary search).
- **Confidence:** High.
- **Open:** nothing.

### Omer count text in Nusach Ashkenaz {#omer-count-text-in-nusach-ashkenaz}

- **Status:** Default.
- **What it does:** the count's wording defaults to Nusach Ashkenaz; Sefard and Edot
  HaMizrach are options.
- **Why:** a default had to be chosen.
- **Sources:** the count itself: Vayikra 23:15–16; Menachos 65b–66a (*verified*). *No source
  recorded* for the wording of any nusach.
- **Confidence:** Low for the wording.
- **Open:** each wording should be checked against a named siddur.

### Mourning restrictions have no default {#mourning-restrictions-have-no-default}

- **Status:** Settled.
- **What it does:** `mourningPeriods` gives `restrictions: null` unless a custom is named.
- **Why:** the customs differ too much to apply one silently.
- **Sources:** the customs themselves are in [Mourning restrictions by named custom](#mourning-restrictions-by-named-custom).
- **Confidence:** Not applicable.
- **Open:** nothing.

### Mourning restrictions by named custom {#mourning-restrictions-by-named-custom}

- **Status:** Default.
- **What it does:** `mourningPeriods(date, { sefirah, beinHametzarim, meatWine })` says, per
  category, whether the custom restricts haircuts, weddings, meat and wine, and laundry that
  day, with part of the day (`until-sunrise`, `night-only`, `until-chatzos`) and the source.
- **Why:** the customs differ widely and there is no common default; a calendar span alone
  ("the Three Weeks") was being read as a rule. Days the sources do not settle (weddings on
  10 Av for Ashkenaz; the fast day itself for Sephardim when there is no week of Tisha B'Av;
  meat on 10 Av without a Three Weeks custom) are `null`.
- **Sources:** SA and Rema OC 493:1–3; MB 493:5–7, 10–11, 14–15; Kaf HaChaim OC 493:13
  (the Arizal); SA and Rema OC 551:2–4, 9; MB 551:58–59; SA and Rema OC 558:1; MB 558:3–4
  (*verified*, Sefaria). Kaf HaChaim OC 551:125 (from 2 Av) was found in a secondary search and
  not re-read.
- **Confidence:** Medium: the sources are read, but the exceptions (a bris, a seudas mitzvah,
  Shabbos Chazon, mourners, children) are not modelled.
- **Open:** more customs on request.


## Zmanim

### Sea-level sunrise and sunset by default {#sea-level-sunrise-and-sunset-by-default}

- **Status:** Default.
- **What it does:** sunrise and sunset are at sea level unless `useElevation` is on.
  Zmanim defined by degrees are always at sea level.
- **Why:** most luchos are calculated at sea level; a depression angle measures how bright
  the sky is, which does not depend on the visible horizon.
- **Sources:** R. Isser Zalman Meltzer, cited in Peninei Halakha, Tefilla 11:6 n. 7
  (*secondary*); Zmanim KeHilchasam, ch. 2 §§7, 9 (*secondary*, through a blog).
- **Confidence:** Medium.
- **Open:** Peninei Halakha reports that the Shulchan Aruch HaRav uses a sunrise for about
  800 m everywhere, citing Igros Moshe OC 1:97 (*not verified*).

### Rounding {#rounding}

- **Status:** Default.
- **What it does:** times are rounded to the minute: earliest times up, deadlines down. It
  can be turned off.
- **Why:** a rounded time should never be less stringent than the exact one.
- **Sources:** *no source recorded* (a safety convention).
- **Confidence:** High that it is the safer direction.
- **Open:** a fast's start is rounded down, because it is a deadline for eating.

### Candle lighting 18 minutes; havdala at 8.5° {#candle-lighting-18-minutes-havdala-at-8-5}

- **Status:** Default.
- **What it does:** candle lighting defaults to 18 minutes before sunset; havdala and
  second-night candles to 8.5°.
- **Why:** 18 minutes is the most common diaspora custom; 8.5° is a widely printed time for
  three small stars.
- **Sources:**
  - Tosefes Shabbos: SA OC 261:2; the minutes are custom (Igros Moshe OC 2:6; Kaf HaChaim
    261:23; Yabia Omer 5:21) (*secondary*).
  - Three small stars: SA OC 293:2 (*verified*); 8.5° per R. Tukaczinsky and Chabad practice
    (*secondary*).
  - Second night: SA OC 503:1.
- **Confidence:** Medium.
- **Open:** local customs (Jerusalem 40 minutes and others) are options, not defaults.

### Local candle-lighting customs {#local-candle-lighting-customs}

- **Status:** Default.
- **What it does:** a place may carry its documented custom (Jerusalem 40, Haifa 30); the day view, CLI and iCal use it unless the caller sets the minutes, and label it with the source.
- **Why:** the minutes are a local custom; a city whose custom is documented should not get the generic 18.
- **Sources:** Peninei Halakha, Shabbat 3:2 (Jerusalem 40, Haifa 30) and Zemanim 13:5 n. 11 (Jerusalem) (*verified*, read on ph.yhb.org.il). Not set without a source: Zichron Yaakov 30, Petach Tikva 40, the Shomron 30.
- **Confidence:** Medium: one published source per city.
- **Open:** Lu'ach Eretz Yisrael is reported to give Jerusalem 25 (not verified); other cities need sources.

### Mincha Gedola and chatzos {#mincha-gedola-and-chatzos}

- **Status:** Default.
- **What it does:** chatzos is the sun's transit. Mincha Gedola of the Gra is 6.5 seasonal
  hours after sunrise; "30 minutes" is after the transit; "the later of the two" is
  offered too.
- **Why:** chatzos is the sun's true midpoint; the definitions follow the sources below.
- **Sources:** Magen Avraham 233:4 (chatzos is the sun's midpoint) (*verified*); SA OC 233:1
  and MB 233:1–4 (*verified*); "the later of" is Chabad practice (*secondary*; no primary
  source found).
- **Confidence:** High for the Gra; Medium for "the later of".
- **Open:** the constant 15-second difference for chatzos is not explained.

### Plag HaMincha of the Levush {#plag-hamincha-of-the-levush}

- **Status:** Default.
- **What it does:** Plag of the Levush is the same calculation as the Gra's (1¼ seasonal
  hours before sunset, on a sunrise-to-sunset day).
- **Why:** the Magen Avraham reports that the Levush counts the day from sunrise to sunset.
- **Sources:** Magen Avraham 233:3 and 267:1 (*verified*). The Levush's own text was **not
  read** (*not verified*).
- **Confidence:** Medium.
- **Open:** the source is corrected in [Plag HaMincha of the Levush: the source](#plag-hamincha-of-the-levush-the-source). The second
  check of the citation found the source is Levush OC 267 as reported in Biur Halacha 261:2, and that
  Magen Avraham 233:3 reads the Levush as counting from tzeis; the sources above are kept
  for the record. The Levush should still be read in the original.

### Plag HaMincha of the Levush: the source {#plag-hamincha-of-the-levush-the-source}

- **Status:** Default.
- **What it does:** unchanged calculation (the Gra's); the citation now names where the Levush's view is reported.
- **Why:** the earlier citation, Magen Avraham 233:3, reads the Levush differently (from tzeis).
- **Sources:** Levush OC 267, as reported in Biur Halacha 261:2 s.v. "להקדים" (*verified*); Magen Avraham 233:3 (*verified*).
- **Confidence:** Medium: the Levush itself was not read.
- **Open:** reading the Levush directly; whether to offer MA's reading as an option.

### The horizon dip uses the earth's mean radius {#the-horizon-dip-uses-the-earth-s-mean-radius}

- **Status:** Default.
- **What it does:** with elevation on, the horizon dip uses a radius of 6,371 km.
- **Why:** the standard mean radius.
- **Sources:** *no source recorded*.
- **Confidence:** Medium.
- **Open:** whether elevation should apply beyond sunrise and sunset.

### No made-up times at high latitudes {#no-made-up-times-at-high-latitudes}

- **Status:** Default.
- **What it does:** when the sun does not reach an angle, the time is `null` with a reason.
  Fallbacks (`nearestDay`, `halfNight`) exist but are off and are labelled when used.
- **Why:** a made-up time could be used as if it were real.
- **Sources:** the recommendation is to return null and offering the Chabad fallback only
  as an explicit option (*secondary*). The opinions of Igros Moshe, the Minchas Yitzchak and
  the London Beth Din on high latitudes are *not verified* and are not cited.
- **Confidence:** High that null is the safe default.
- **Open:** neither fallback cites a source.

### No fallback in polar night {#no-fallback-in-polar-night}

- **Status:** Default.
- **What it does:** the high-latitude fallbacks apply only when the sun never gets low enough; in polar night the time stays null.
- **Why:** in polar night the sun never rises to the angle, so any time would be invented.
- **Sources:** *No source recorded* for the fallbacks themselves (see [No made-up times at high latitudes](#no-made-up-times-at-high-latitudes)).
- **Confidence:** High for the null; the fallbacks remain a judgement.
- **Open:** nothing.

### Historical offsets keep their seconds {#historical-offsets-keep-their-seconds}

- **Status:** Default.
- **What it does:** UTC offsets keep seconds (local mean time before standard time); rounding is to whole minutes of the local clock.
- **Why:** rounding the offset moved historical zmanim by up to 30 seconds.
- **Sources:** the IANA time-zone database through `Intl`.
- **Confidence:** High.
- **Open:** nothing.

### The day view's default zmanim {#the-day-view-s-default-zmanim}

- **Status:** Default.
- **What it does:** alos 72 minutes and 16.1°, misheyakir 11°, sunrise, Shema (Magen Avraham
  72 and Gra), Tefilla (Gra), chatzos, Mincha Gedola (later of two), Mincha Ketana and Plag
  (Gra), sunset, tzeis 8.5° and Rabbeinu Tam.
- **Why:** a set that covers the times most printed luachos show.
- **Sources:** *no source recorded* for the selection; each zman's own sources are on
  [Zmanim and sources](https://github.com/yskolnick/luach/blob/main/docs/halacha/zmanim.md).
- **Confidence:** Low (a selection, not a source).
- **Open:** apps should show the opinions their community follows.


## Readings and learning

### Haftara defaults {#haftara-defaults}

- **Status:** Default.
- **What it does:** the minhag defaults to Ashkenaz. Shabbos HaGadol's haftara is read every
  year for Ashkenaz and Sephardi, only when Erev Pesach is Shabbos for Chabad, and never for
  Teimani. The Ashkenazi haftara of Kedoshim is Ezekiel 22:1–16.
- **Why:** each follows the most widely printed practice for that minhag.
- **Sources:**
  - Precedence: SA OC 425, 428, 684 and 685 with the Rema and Mishna Berura.
  - Shabbos HaGadol: customs differ; Chabad per Sefer HaMinhagim and SA HaRav 430:3; the
    Vilna Gaon's custom (every year except when Erev Pesach is Shabbos) is not built.
  - Kedoshim: Rema OC 428:8, ArtScroll, a published Ashkenazi luach and Chabad; Hertz, Koren and
    Sefaria swap it with Amos.
  - A value was recorded only when two sources agreed.
- **Confidence:** High for Ashkenaz and Chabad; Medium for Sephardi (Sefaria's Sephardi data
  is incomplete); Low for Teimani (several values are null).
- **Open:** *no source recorded* for choosing "every year" as the Sephardi default for
  Shabbos HaGadol.

### Kedoshim when Acharei Mos's haftara was displaced {#kedoshim-when-acharei-mos-s-haftara-was-displaced}

- **Status:** Default.
- **What it does:** Ashkenazi Kedoshim reads Amos 9:7-15 when Acharei Mos's own haftara was displaced; otherwise Ezekiel 22:1-16.
- **Why:** the source says so; it had been treated as a Rema-vs-Hertz variant.
- **Sources:** Mishna Berura 428:26, citing R. Akiva Eiger, who names Machar Chodesh (*verified*). Applying the same reason to Shabbos HaGadol and Rosh Chodesh is Luach's reading.
- **Confidence:** High for Machar Chodesh; Medium for the extension.
- **Open:** whether the MB's reason covers Shabbos HaGadol and Rosh Chodesh.

### Shabbos Shuva: Micah or Joel {#shabbos-shuva-micah-or-joel}

- **Status:** Default.
- **What it does:** Ashkenazi Shabbos Shuva adds Micah 7:18-20 with Vayelech and Joel 2:15-27 with Haazinu; option `shuvaAddition`.
- **Why:** the source says so; before, Joel was always added.
- **Sources:** Mishna Berura 428:23, recording the Dagul Mervava (*verified*). Joel before Micah for `'both'`: *no source recorded* (book order).
- **Confidence:** High.
- **Open:** the order for `'both'`.

### Rosh Chodesh Av and Elul haftara options {#rosh-chodesh-av-and-elul-haftara-options}

- **Status:** Default.
- **What it does:** options `roshChodeshAv` and `roshChodeshElul`; defaults unchanged.
- **Why:** the Rema and the Mishna Berura differ, so both are offered.
- **Sources:** Rema OC 425:1; Mishna Berura 425:7–8; Shulchan Aruch OC 425:1 (*verified*).
- **Confidence:** High for the sources; the defaults are the behaviour before.
- **Open:** nothing.

### Chabad on Shabbos HaChodesh or Chanukah before Rosh Chodesh {#chabad-on-shabbos-hachodesh-or-chanukah-before-rosh-chodesh}

- **Status:** Open question.
- **What it does:** on Shabbos HaChodesh on 29 Adar and a Shabbos of Chanukah on 29 Kislev,
  the Chabad haftara has no Machar Chodesh verses added.
- **Why:** Chabad's addition after Shekalim is in the haftara table; for these two days Luach
  found no source either way.
- **Sources:** SA OC 425:2, 685:4, 684:3; Aruch HaShulchan OC 425:4–5 (the displacement
  itself, *verified*); no Chabad source read for the added verses.
- **Confidence:** Low.
- **Open:** a Chabad source such as Sefer HaMinhagim for these two days.

### Pirkei Avos one chapter a week {#pirkei-avos-one-chapter-a-week}

- **Status:** Default.
- **What it does:** on the summer Shabbosim, one chapter a week; doubling up at the end is an
  option.
- **Why:** the simplest custom; the others are options.
- **Sources:** Rema OC 292:2 records the custom of saying Pirkei Avos in the summer
  (*verified*). *No source recorded* for one chapter rather than doubling up.
- **Confidence:** Medium.
- **Open:** some read only until Shavuos; customs for the end of the summer differ.

### Pirkei Avos on Erev Tisha B'Av, and until Shavuos {#pirkei-avos-on-erev-tisha-b-av-and-until-shavuos}

- **Status:** Default.
- **What it does:** Pirkei Avos is not said on Shabbos 8 Av; option `until: 'shavuos'` for one round before Shavuos.
- **Why:** the source says so; before, a chapter was said on 8 Av and every later chapter shifted.
- **Sources:** Rema OC 553:2, "אם חל [ערב ת"ב] בשבת אין אומרים פרקי אבות"; Kaf HaChaim 292:23 (*verified*).
- **Confidence:** High.
- **Open:** what is read on a seventh Shabbos before Shavuos (null).

### Daf HaShavua {#daf-hashavua}

- **Status:** Default.
- **What it does:** a week runs Sunday to Shabbos, counted from 6 March 2005.
- **Why:** back-computed from Megillah 2 in October 2018 (Jewish Link, 4 October 2018).
- **Sources:** the cycles' published calendars.
- **Confidence:** Low. The back-computation puts Megillah 2 a day off the newspaper's date,
  so some groups may start the week on Shabbos.
- **Open:** confirmation from the organisers.

### Mishna Yomis before 2021 {#mishna-yomis-before-2021}

- **Status:** Default.
- **What it does:** cycles before the 14th (25 December 2021) are counted back in 2,096-day
  cycles.
- **Why:** the 14th cycle's start is well documented; the early ones are not.
- **Sources:** Yeshiva World and the ArtScroll blog for the 14th cycle.
- **Confidence:** High from 2021; Low before it. Early cycles may have run at another pace.
- **Open:** the first cycle's start date.

### Amud HaYomi stops in 2038 {#amud-hayomi-stops-in-2038}

- **Status:** Default.
- **What it does:** returns null after Me'ilah 22a (10 February 2038).
- **Why:** Dirshu has not published how Kinnim, Tamid and Middos will be learned.
- **Sources:** the Dirshu luach 5784 (Berachos 2a on 16 October 2023).
- **Confidence:** High up to 2038.
- **Open:** Dirshu's plan for the end of Kodashim.
