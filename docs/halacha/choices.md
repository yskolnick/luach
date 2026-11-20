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
  *secondary* means it was confirmed through a named secondary source; *not checked against the text* means
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
  and the four dechiyos (7:1–7) (*verified*).
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
    ruling is the Rema's gloss, not the Mechaber's).
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
- **What it does:** where 15 Adar is kept (`walledCity`, which is on for Jerusalem in the day view) and
  it is Shabbos, "Purim Meshulash" is three events: Friday 14 Adar (the Megillah and matanos
  laevyonim), Shabbos 15 Adar (Al HaNissim and the Torah reading) and Sunday 16 Adar (the seudah and
  mishloach manos). Elsewhere there is none.
- **Why:** Jerusalem keeps Purim on the 15th, and spreads it over three days when the 15th is
  Shabbos.
- **Sources:** SA OC 688:6; Mishna Megillah 1:1 for a city walled since Yehoshua (*verified*).
- **Confidence:** High for the dates.
- **Open:** the cities whose walls in Yehoshua's days are in doubt (Teveria, Hebron, Tzfas and
  others, which may keep both days: SA OC 688:4) and the Jerusalem neighbourhoods are not
  included: a question for a rav.

### Leil Selichos on the Shabbos {#leil-selichos-on-the-shabbos}

- **Status:** Default.
- **What it does:** Leil Selichos (Ashkenaz) is dated on the Shabbos whose night begins
  Selichos.
- **Why:** the date follows the Rema's rule; the event is placed on the Shabbos so that its
  night is the right one.
- **Sources:** Rema OC 581:1 gives the weekday rule; the four-day reason is Mishna Berura
  581:6 (*verified*).
- **Confidence:** High.
- **Open:** Sephardim say Selichos from Rosh Chodesh Elul (SA OC 581:1); this event is
  Ashkenazi only.

### Yom Kippur Katan {#yom-kippur-katan}

- **Status:** Default.
- **What it does:** optional. Not listed before Rosh Chodesh Tishrei, Cheshvan, Teves or
  Iyar; moved to Thursday when Erev Rosh Chodesh is Friday or Shabbos.
- **Why:** the move follows the Mishna Berura; each excluded month has its own source, listed in
  [Yom Kippur Katan: which months](#yom-kippur-katan-which-months).
- **Sources:** Mishna Berura 417:4; Magen Avraham 417:3 (*verified*). Each excluded month has its
  source (Shulchan Aruch OC 581:2 and 670:1, Mishna Berura 429:10, 550:11 and 686:1, Kaf HaChaim
  OC 417:16). No source read leaves out Av, Sivan, Adar I or Adar II.
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
- **Open:** the month exclusions are in [Yom Kippur Katan: which months](#yom-kippur-katan-which-months), each with its source.

### Yom Kippur Katan: which months {#yom-kippur-katan-which-months}

- **Status:** Default.
- **What it does:** no Yom Kippur Katan before Tishrei, Iyar or Teves; before Cheshvan only
  with `yomKippurKatanCheshvan`. Friday or Shabbos moves it to Thursday by default.
- **Why:** each exclusion now has its reason; Cheshvan had none, so it became an option.
- **Sources:** SA OC 581:2 (Erev Rosh Hashana); MB 429:10 (Erev Rosh Chodesh Iyar is in
  Nisan); SA OC 670:1 and MA, MB 686:1 (Chanukah); Kaf HaChaim OC 417:16 (Cheshvan: "צריך
  להתענות"); MB 550:11 and Aruch HaShulchan OC 417:11 (Thursday) (*verified*, Sefaria). Magen
  Avraham, Mishna Berura, Kaf HaChaim and Aruch HaShulchan on OC 417 leave out no other month:
  no source read leaves out Av, Sivan, Adar I or Adar II.
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
  at three medium stars: SA OC 562:1 (*verified*). 7.083° per Dr. Baruch Cohn (*not checked against the text*). *No source recorded* for choosing 7.083° over 6.45° (the Israeli custom).
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
  *verified*.
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
- **What it does:** `tefillaOn` omits Tachanun through Rosh Chodesh Cheshvan in Israel and
  through Isru Chag outside it, unless `tishreiTachanun` is given.
- **Why:** to match the customs. The Ashkenazi works resume after Isru Chag; the
  custom in Israel (and of the Sephardim) is the whole of Tishrei. Luach has no nusach option
  in `tefillaOn`, so the place decides and Sephardim abroad pass the option.
- **Sources:** SA OC 131:7; Kitzur SA 22:8; Sha'arei Teshuvah 131:19; Aruch HaShulchan OC
  131:12; Kaf HaChaim OC 131:98 (citing Chaim Sha'al on the custom in Israel) (*verified*,
  Sefaria).
- **Confidence:** Medium: the reading of "Match the customs" is Luach's; the Israeli Ashkenazi
  custom rests on Kaf HaChaim's report.
- **Open:** a `nusach` option for `tefillaOn`, if wanted.

### Tachanun on Pesach Sheni {#tachanun-on-pesach-sheni}

- **Status:** Default.
- **What it does:** no Tachanun on 14 Iyar unless `pesachSheniTachanun: 'say'`.
- **Why:** the Shulchan Aruch does not list it; the later works record the custom to omit it.
- **Sources:** Kaf HaChaim OC 131:98 (Knesses HaGedolah); Sha'arei Teshuvah 131:19; Aruch
  HaShulchan OC 131:12 ("ופסח שני לא חשבו והוא פלא, ומנהג הספרדים שלא ליפול בו")
  (*verified*, Sefaria).
- **Confidence:** High.
- **Open:** nothing.

### A community's own days without Tachanun {#a-community-s-own-days-without-tachanun}

- **Status:** Option, off by default.
- **What it does:** `noTachanunDays` adds days without Tachanun at Shacharis, by month and day, for
  a community.
- **Why:** Chassidim omit Tachanun on the yahrzeit of the tzaddik they follow; Luach has no list of
  those, so the caller gives the dates.
- **Sources:** Peninei Halakha, Tefillah 21:8 (the yahrzeit of a tzaddik) (*verified*).
- **Confidence:** High.
- **Open:** Mincha: the days given here change Shacharis only.
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

### Barchenu and Barech Aleinu {#barchenu-and-barech-aleinu}

- **Status:** Default.
- **What it does:** `amidahSeason(...).barchenu` is true for `nusach: 'edot-hamizrach'` on the
  days that do not ask for rain, when the blessing of the years opens "ברכנו"; otherwise "ברך
  עלינו".
- **Why:** Sephardim, following the Arizal, change the blessing's text with the season;
  Ashkenazim keep "ברך עלינו" and change only the request. Luach takes winter as the days of
  `talUmatar`, since the winter text holds "ותן טל ומטר" (Luach's reading).
- **Sources:** Kaf HaChaim OC 117:1 ("והספרדים נוהגים לומר בקיץ ברכינו ובחורף ברך עלינו",
  citing the Tur, the Beis Yosef and Sha'ar HaKavanos) (*verified*, Sefaria).
- **Confidence:** High for the custom; Medium that the switch is the day of tal umatar.
- **Open:** whether Nusach Sefard and Chabad say Barchenu (Luach says not, without a source).

### Mizmor L'Sodah on Erev Pesach, Chol Hamoed Pesach and Erev Yom Kippur {#mizmor-lesodah}

- **Status:** Default, with an option.
- **What it does:** by default not said on those days; `mizmorLesodah: 'sephardi'` says it.
  Never on Shabbos or Yom Tov.
- **Why:** the Rema leaves it out; the Sephardi custom recorded in the Kaf HaChaim says it.
- **Sources:** Rema OC 51:9; Kaf HaChaim OC 51:50–53 ("מנהגינו לאומרו בע"פ ובחוה"מ דפסח";
  "הכנה"ג בהגה"ט כתב דמנהגינו לאומרו" on Erev Yom Kippur) (*verified*, Sefaria).
- **Confidence:** High.
- **Open:** Rosh Hashana: Kaf HaChaim OC 51:50 records that in Sefarad it was said on Rosh
  Hashana, and that Beis El adds nothing then; Luach does not say it on Yom Tov.

### Omer count text in Nusach Ashkenaz {#omer-count-text-in-nusach-ashkenaz}

- **Status:** Default.
- **What it does:** the count's wording defaults to Nusach Ashkenaz; Sefard and Edot
  HaMizrach are options, in `omerText` and in the day record (`omerNusach` in `dayInfo` and
  `nowInfo`).
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
  (*verified*, Sefaria). Kaf HaChaim OC 551:126 (meat on Rosh Chodesh Av, so from 2 Av) (*verified*,
  Sefaria; 551:125 before it forbids Rosh Chodesh too).
- **Confidence:** Medium: the sources are read, but the exceptions (a bris, a seudas mitzvah,
  Shabbos Chazon, mourners, children) are not modelled.
- **Open:** more customs on request.


## Chabad customs

Luach keeps only the Chabad customs it has read in a sefer or on Sefaria, each citing it. Customs
whose only source was a Chabad website are not offered until a sefer is read for them.

Chabad learning schedules are paused until they can all be done, Tanya included.

### The count and morid hatal in nusach Chabad {#the-count-and-morid-hatal-in-nusach-chabad}

- **Status:** Default for `nusach: 'chabad'`.
- **What it does:** the Omer count is worded exactly as in nusach Ashkenaz ("…לעומר" at the end,
  units before tens); in summer morid hatal is said, as in nusach Sefard.
- **Why:** the count in the Chabad siddur reads as the Ashkenaz wording does (e.g. day 41:
  "היום אחד וארבעים יום שהם חמשה שבועות וששה ימים לעומר").
- **Sources:** the Chabad siddur, Siddur Tehillat Hashem, as on Sefaria: the count of the Omer, all
  49 days (*verified*); morid hatal in summer, "בקיץ מוריד הטל", in its Shacharis Amidah (*verified*).
- **Confidence:** High.
- **Open:** Shulchan Aruch HaRav OC 114 speaks of "these countries, where they do not mention tal in
  summer" ("בִּמְדִינוֹת אֵלּוּ שֶׁאֵין נוֹהֲגִין לְהַזְכִּיר טַל בִּימוֹת הַחַמָּה"). How that sits with the siddur's
  nusach is not settled by the text: ask a rav.

### The Chabad days {#the-chabad-days}

- **Status:** Default (off unless asked: `chabad: true` in the holiday options).
- **What it does:** adds 23 optional minor days, with ids like `chabad-19-kislev`, on their Hebrew
  dates in every year: 6, 13 Tishrei; 20 Cheshvan; 9, 10, 14, 19, 20, 27 Kislev; 24 Teves; 10 Shevat;
  2, 11, 13 Nissan; 2 Iyar; 6 Sivan; 3, 12, 13 Tammuz; 20 Av; 15, 18, 29 Elul. The English name says
  what the sefer says the day marks, in Luach's own words; the Hebrew name is the date. 19 and 20
  Kislev are named as the Rosh HaShanah of Chassidus (together); 3 Tammuz is named as the Previous
  Rebbe's release from imprisonment (5687), not as a yahrzeit.
- **Why:** an app that follows the Chabad custom should not have to work these out itself.
- **Sources:** Hayom Yom (the entry of the date) and Sefer HaMinhagim (Kehot's English translation):
  6 Tishrei (SM, "Vav Tishrei"); 13 Tishrei (HY; SM); 20 Cheshvan (HY; SM); 9 Kislev (HY; SM); 10 Kislev
  (HY; SM, "Festival of Liberation"); 14 Kislev (SM); 19 Kislev (HY); 20 Kislev (SM: "The 19th and 20th
  of Kislev are the Rosh HaShanah of Chassidus"); 27 Kislev (SM, Chanukah: the third day of Chanukah,
  5561); 24 Teves (HY; SM); 10 Shevat (SM); 2 Nisan (HY; SM); 11 Nisan (SM); 13 Nisan (HY; SM); 2 Iyar
  (SM; HY has the same day); 6 Sivan (HY; SM, "Vav Sivan"); 3 Tammuz (SM, "Gimmel Tammuz"); 12 and 13
  Tammuz (HY; SM); 20 Av (SM, "Chaf Menachem Av"); 15 Elul (SM); 18 Elul (SM); 29 Elul (HY; SM,
  "Chaf-tes Elul") (*verified*, each opened and read).
- **Confidence:** High for the dates; the names are Luach's words for what the sefer says.
- **Open:** four days of the earlier list are not offered, as no sefer was read for them: 1 Kislev,
  5 Teves, 22 Shevat, 25 Adar. The Rebbe's own yahrzeit (3 Tammuz) is later than every sefer read.
  The sefarim differ on the year of the Maharash's birth (Hayom Yom 5593, Sefer HaMinhagim 5594), so
  no year is stated. The Hebrew names stay the date.

### Tachanun by the Chabad custom {#tachanun-by-the-chabad-custom}

- **Status:** Default for `minhag: 'chabad'` (off unless asked).
- **What it does:** no Tachanun on 10, 19 and 20 Kislev, 12 and 13 Tammuz and 7 Adar, and at the
  Mincha before them (`tachanunOmittedAtMincha`); from erev Yom Kippur to the end of Tishrei, in Israel
  or not, so Tachanun is said again on 2 Cheshvan. The rest (all of Nisan, Pesach Sheni, Lag BaOmer, 1 to
  12 Sivan) is the general default. Yom HaAtzmaut and Chai Elul are not part of this custom: they are
  as the general custom has them.
- **Why:** the points are the ones read in the sources; none is taken from a list.
- **Sources:** Sefer HaMinhagim (its section on Tachanun, "The Six Remembrances", and the month of
  Adar): the five days of Kislev and Tammuz each with the preceding Mincha; 7 Adar and the preceding
  Mincha ("the Rebbeim of Chabad never said Tachanun"); from erev Yom Kippur until the end of Tishrei,
  and from Motzaei Yom Kippur until the end of Rosh Chodesh Cheshvan; Pesach Sheni, Lag BaOmer, through
  12 Sivan, with Mincha of erev Pesach Sheni said; Tachanun is said on the yahrzeit of a Rebbe unless
  there is another reason. Hayom Yom, 9 Tishrei: "עד סוף תשרי א"א תחנון"; 1 Nisan: "כל החדש א"א
  תחנון" (*verified*). Rosh Chodesh Cheshvan is 30 Tishrei and 1 Cheshvan, so both readings resume on
  2 Cheshvan.
- **Confidence:** High for the days of Kislev and Tammuz and for Tishrei; Medium for 7 Adar.
- **Open:** in a leap year the sefer says "Adar" and does not say which: Luach reads Adar II. No sefer
  was read for Yom HaAtzmaut or Chai Elul; ask a rav.

### Chabad customs not offered {#chabad-open-questions}

- 1 Kislev, 5 Teves, 22 Shevat and 25 Adar, and the Rebbe's own yahrzeit on 3 Tammuz: no sefer was read.
- Tachanun on Yom HaAtzmaut and Chai Elul as a Chabad custom: no sefer was read.

## Zmanim

### Sea-level sunrise and sunset by default {#sea-level-sunrise-and-sunset-by-default}

- **Status:** Default.
- **What it does:** sunrise and sunset are at sea level unless `useElevation` is on. With it on,
  sunrise and sunset are those seen from the place's height (the horizon dips), and so is every
  time counted from them: the fixed minutes before and after (dawn 72 minutes, nightfall 72
  minutes), and the seasonal hours of the Gra's and the Magen Avraham's day from
  sunrise to sunset or 72 minutes around them (Shema, tefilla, Mincha, plag). A time set by the
  sun's angle below the horizon (dawn at 16.1°, nightfall at 8.5°, havdala, the second-night
  candles), a day whose ends are set by angles (the Magen Avraham's from 16.1°, the Baal HaTanya's),
  and chatzos are never moved by height. Candle lighting and the start of Yom Kippur and Tisha
  B'Av stay at the sea-level sunset by default (see the next entry). `sunrise-sea-level`,
  `sunrise-elevation` and the sunset pair give each one explicitly.
- **Why:** most luchos are calculated at sea level; a depression angle measures how bright
  the sky is, which does not depend on the visible horizon.
- **Sources:** what the texts call sunrise and sunset is what is seen: sunrise is "when the sun
  begins to shine on the mountaintops" (Mishna Berura 58:7, 89:1); sunset "when the sun is no
  longer seen on the earth" (Shulchan Aruch OC 261:2), and Mincha should be finished "while the sun
  is not yet hidden from our eyes" (Mishna Berura 233:14). None of the texts opened speaks of the
  place's height, or of sea level against the visible horizon. R. Isser Zalman Meltzer, cited in
  Peninei Halakha, Tefilla 11:6 n. 7 (*secondary*); Zmanim KeHilchasam, ch. 2 §§7, 9
  (*secondary*, through a blog).
- **Confidence:** Medium.
- **Open:** Peninei Halakha reports that the Shulchan Aruch HaRav uses a sunrise for about
  800 m everywhere, citing Igros Moshe OC 1:97 (*not checked against the text*). Whether `useElevation` should
  move the seasonal hours as well as sunrise and sunset, or sunrise and sunset only, is open; it
  moves both today.

### Candle lighting and the start of Yom Kippur and Tisha B'Av at the sea-level sunset {#beginnings-at-the-sea-level-sunset}

- **Status:** Default (an option, `beginningsSunset`).
- **What it does:** with `useElevation` on, candle lighting (Shabbos and Yom Tov, and the evening
  before Yom Kippur) and the start of Yom Kippur and Tisha B'Av count from the sea-level sunset, not
  the later sunset seen from the place's height. `beginningsSunset: 'elevation'` counts them from
  the elevated sunset instead. Sunrise, sunset and every other time still follow `useElevation`;
  without it the option changes nothing. Their `opinion` says which sunset they count from. In
  Jerusalem (786 m) Yom Kippur 5788 begins at 18:13 by default and at 18:17 with `'elevation'`.
- **Why:** a beginning is a time to stop by, so the earlier sunset is the cautious one; the
  difference in high places is four to eight minutes. This is a documented default, not a ruling:
  which sunset these beginnings count from is a question for a rav.
- **Sources:** candle lighting comes before sunset, with tosefes Shabbos (Shulchan Aruch OC
  261:2); Yom Kippur and Tisha B'Av begin at sunset the evening before (Shulchan Aruch OC 553:2,
  608:1). On height, see the entry above: no text opened speaks of the place's height, for these
  beginnings or for sunset itself.
- **Confidence:** Low: no source for either side was found.
- **Open:** the default, for a rav.

### Rounding {#rounding}

- **Status:** Default.
- **What it does:** times are rounded to the minute: earliest times up, deadlines down. The
  exact time is always there as well (`exact`), and `explain()` says which way a time was rounded.
  `round: 'none'` gives the exact time in `time` and `local` (with seconds) instead.
- **Why:** a rounded time should never be less stringent than the exact one.
- **Sources:** *no source recorded* (a safety convention).
- **Confidence:** High that it is the safer direction.
- **Open:** a fast's start is rounded down, because it is a deadline for eating.

### States change at the exact time {#states-change-at-the-exact-time}

- **Status:** Default.
- **What it does:** `hebrewDateAt`, `isMelachaForbiddenAt`, `hebrewDateSpanAt`, `fastAt` and
  `melachaRunAt` change at a boundary's exact time (`exact`), not at the minute that is displayed
  (`time`, rounded on the safe side). For up to a minute a state can change before the displayed
  minute: a havdala time of 17:21:52 is shown as 17:22, and melacha is not forbidden from 17:21:52.
  `Zmanim#next` and `Zmanim#between` list times by the displayed minute; `timesBetween` by the
  exact time.
- **Why:** the exact time is what is calculated; the displayed minute is a rounding of it for
  reading. An app that must never show a state change before the time it prints should compare
  with `time` itself.
- **Sources:** *no source recorded* (a calculation convention).
- **Confidence:** High that it follows the calculation.
- **Open:** whether states should follow the displayed minute instead.

### Where the havdala time or candle lighting does not occur {#where-havdala-does-not-occur}

- **Status:** Default.
- **What it does:** far north in summer the sun may not reach the `havdala` angle (with the default
  `highLatitudeFallback: 'none'`), and in polar night or day there may be no sunset (so no candle
  lighting). `isMelachaForbiddenAt`, which answers with a plain `true` or `false`, then answers by
  the civil day: forbidden from shkiah where that occurs, and, leaving Shabbos or Yom Tov,
  until the end of its civil day, or until its sunset where that falls after midnight. That end
  is not a time from any source, and it can be earlier than any high-latitude rule Luach offers.
  `melachaRunAt` and `fastAt` give `inProgress: null` there instead, and `nowInfo` passes that on.
  A fast whose end does not occur is still in progress, certainly, from its start until the fast
  day's sunset; only after that is it `null`.
  Setting `highLatitudeFallback` gives that rule's time, marked in `Zman.fallback`.
- **Why:** Luach has no time to give there; a function that must answer yes or no answers by the
  civil day, and the functions that can say "unknown" say it.
- **Sources:** *no source recorded*.
- **Confidence:** Low.
- **Open:** what the answer should be there. Ask your rav.

### Where night begins at an instant {#where-night-begins-at-an-instant}

- **Status:** Default.
- **What it does:** `dayPartAt` calls the time from sunset to the person's `tzeis` opinion
  bein hashmashos, and night from their `tzeis`; `eventsAt` keeps a Yom Tov in force until the
  person's havdala, a fast until their `fastEnds`, and starts Isru Chag at that havdala. The default
  `tzeis` is `tzeis-8.5`, as everywhere in Luach.
- **Why:** the library rules on nothing; the boundary is the opinion the person chose.
- **Sources:** Shulchan Aruch OC 261:2 (bein hashmashos from sunset until the night); the opinions' own sources in [Zmanim and sources](./zmanim.md).
- **Confidence:** High for following the opinion; the opinion itself is the person's.
- **Open:** nothing new.

### Second-night candles {#second-night-candles}

- **Status:** Default, with an option.
- **What it does:** on a second night of Yom Tov, or for Yom Tov after Shabbos, the candles are lit
  from an existing flame after the first day has ended (`candle-lighting-second-night`). By default
  that is the person's `havdala` opinion (8.5° unless they chose another); `secondNightCandles`
  (a nightfall zman id) sets it apart from havdala, so someone whose Shabbos ends by Rabbeinu Tam can
  light the second-night candles at another nightfall if their rav says so. Havdala is unchanged.
- **Why:** the two are the same question only if the end of the first day is the person's end of
  Shabbos; the sources opened do not say so.
- **Sources:** Shulchan Aruch OC 503:1 (no preparing from one day of Yom Tov for the next); Mishna
  Berura 514:35 (setting up candles for the night is forbidden, also from the first day to the
  second). No text was found that ties the second night's candles to the person's own end of
  Shabbos. Kaf HaChaim OC 514:82, citing the Shelah, speaks of women lighting "in the evening" for
  the second night.
- **Confidence:** Low for the default: it was a convenience.
- **Open:** which nightfall; whether lighting near dark is meant. Ask your rav.

### Eruv tavshilin {#eruv-tavshilin}

- **Status:** Rule from the sources.
- **What it does:** `dayInfo(...).eruvTavshilin` is true on a day that is not itself Shabbos or Yom
  Tov when the Yom Tov that begins that night runs into a Friday: Yom Tov on Friday (Shavuos in
  Israel, 10 June 2027), the first days of Pesach on Thursday and Friday, Rosh Hashana on Thursday
  and Friday, and Shavuos on Friday and Shabbos in the diaspora (made on Thursday).
- **Why:** cooking on Yom Tov for Shabbos needs an eruv when Yom Tov is on Erev Shabbos, and it is
  made on the eve of the first day.
- **Sources:** Shulchan Aruch OC 527:1; Mishna Berura 527:1 ("there is no difference between the
  first day of Yom Tov and the second day of the diaspora: if the second day falls on Friday, it is
  also forbidden to cook for Shabbos without an eruv, which is made on the eve of the first day");
  Kaf HaChaim 527:1 (the same). For Yom Tov on Friday and Shabbos (Shavuos in the diaspora):
  Taz OC 527:12 (cooking on the Friday, the first day, is plainly allowed by an eruv tavshilin) and
  Beis Yosef OC 527, quoting Hagahos Maimoniyos, which names the two days as Shabbos and Erev
  Shabbos.
- **Confidence:** High.
- **Open:** nothing.

### When the Omer may be counted {#when-the-omer-may-be-counted}

- **Status:** Default, with an option.
- **What it does:** `Night.omerFrom` (in `nightOf`, `nightAt` and `nowInfo`'s nights) is the
  earliest time to count. By default (`omerFrom: 'holy-day-ends'`) it is the later of the person's
  `tzeis` and the end of Shabbos or Yom Tov that evening (their `havdala`, or the second-night
  candles when Yom Tov follows): New York, Motzaei Shabbos 24 April 2027, 8:29 PM by 8.5°, but
  8:57 PM for someone who keeps Shabbos until Rabbeinu Tam. `omerFrom: 'tzeis'` gives nightfall
  alone.
- **Why:** someone who holds that Shabbos lasts until a later nightfall holds that it is still day
  until then.
- **Sources:** Shulchan Aruch OC 489:2 and Mishna Berura 489:14 (count at nightfall; bein hashmashos
  only after the fact); Kaf HaChaim OC 489:44 (some wait an hour and a quarter after sunset, by
  Rabbeinu Tam; most count when the stars are seen, and one should not protest); Shulchan Aruch OC
  489:9 (on Motzaei Shabbos the count comes before havdala); Mishna Berura 489:18 (after nightfall
  one may count before Maariv). No text was found that ties the count to the person's own end of
  Shabbos.
- **Confidence:** Medium.
- **Open:** the default. Ask your rav.

### Davening windows {#davening-windows}

- **Status:** Rule from the sources, by the person's opinions.
- **What it does:** `tefillaAt` gives, at an instant, each service's window from the person's
  zmanim: Shacharis from sunrise to the end of the fourth hour (`tefilla`), after the fact from dawn
  (`alos`) and until midday; Mincha from Mincha Gedola, its main time from Mincha Ketana, to sunset,
  after the fact to nightfall; Maariv from nightfall (`tzeis`) to midnight (`chatzosHalayla`), after
  the fact from plag hamincha and until dawn; and on Yom Kippur Neilah, to sunset, after the fact
  into the night, with no time for its start.
- **Why:** each window is the sources' own, made of the person's zmanim.
- **Sources:** Shulchan Aruch OC 89:1 with the Rema; Mishna Berura 89:2 (dawn counts only once the
  east has lit up, which Luach gives as the person's `alos`); Shulchan Aruch OC 233:1 with the Rema;
  Mishna Berura 233:1 and 233:14 (after sunset only after the fact, and in truth until about a
  quarter of an hour before nightfall: Luach gives nightfall and says so); Shulchan Aruch OC 235:1,
  235:3; Mishna Berura 235:34; Shulchan Aruch OC 623:2; Mishna Berura 623:2.
- **Confidence:** Medium: the rules are read; the after-the-fact ends are given at the zman the
  source names, not earlier.
- **Open:** midnight is twelve hours after midday (Mishna Berura 1:9; Shulchan Aruch HaRav 1:8;
  Kaf HaChaim 1:7), which is Luach's `chatzos-halayla`. No source was found for "halfway from
  sunset to sunrise", so it is not offered; a third view (Yad Ephraim OC 1) counts six hours from
  the start of the night.

### Yizkor {#yizkor}

- **Status:** Off by default (`yizkor: true` to include).
- **What it does:** an optional event `yizkor` on Yom Kippur, and in the diaspora on the last day
  of Pesach (22 Nisan), the second day of Shavuos (7 Sivan) and Shemini Atzeres (22 Tishrei). In
  Israel only Yom Kippur, for now.
- **Why:** these are the days the sources name. Mishna Berura 494:17 and Sha'arei Ephraim 10:31
  tie Yizkor on the festivals to the reading of "Kol HaBechor", which is not read in Israel on
  those days, so Israel keeps Yom Kippur only.
- **Sources:** Shulchan Aruch OC 621:6 (Yom Kippur); Mishna Berura 494:17 ("and souls are
  remembered and Av HaRachamim is said on the second day, and wherever Kol HaBechor is read") and
  668:15 (Shemini Atzeres); Sha'arei Ephraim 10:31 (Yom Kippur, the last day of Pesach, the second
  day of Shavuos and Shemini Atzeres, the days Kol HaBechor is read).
- **Confidence:** High for the diaspora; Israel is open.
- **Open:** the festival days in Israel: Mishna Berura 668:15 (Shemini Atzeres) gives Yizkor with
  no such condition, and Peninei Halakha, Festivals 2:8 lists the days without naming Israel. Ask
  your rav. The custom of some not to say it when Yom Tov is on
  Shabbos (Sha'arei Ephraim 10:31); Sephardi customs (no text found).

### The order of a day's events {#the-order-of-a-days-events}

- **Status:** Display order.
- **What it does:** the events of a day come in a documented order, the first the one to name the
  day by: Yom Tov and Yom Kippur, Chol Hamoed, a fast, Rosh Chodesh, a minor holiday or a day of
  the State, a special Shabbos, an eve, Isru Chag, then the rest (optional days such as Yizkor).
  Events of one rank keep their order. New York, 10 December 2026: Rosh Chodesh Teves, then
  Chanukah day 6.
- **Why:** an app needs one name for a day; where a source orders two events that meet, the order
  follows it, and the rest is Luach's own display order. It rules on nothing.
- **Sources:** the more frequent comes first (Zevachim 89a, the mishna); on Rosh Chodesh Teves the
  reading of Rosh Chodesh comes before that of Chanukah (Shulchan Aruch OC 684:3).
- **Confidence:** High where a source orders the two; the rest is a convenience.
- **Open:** nothing.

### The date line {#the-date-line}

- **Status:** Default.
- **What it does:** every date, Shabbos included, is the civil date in the place's time zone, so
  places just west of the date line (Kiritimati, Samoa, Fiji, the Chatham Islands) keep Shabbos on
  their own civil Saturday.
- **Why:** Luach computes the civil date at the place from its zone; it does not model a halachic
  date line, on which there are several opinions.
- **Sources:** *no source recorded*.
- **Confidence:** Low near the date line.
- **Open:** a halachic date line as an option. Ask your rav.

### Melacha forbidden from shkiah {#melacha-forbidden-from-shkiah}

- **Status:** Default.
- **What it does:** `isMelachaForbiddenAt`, `melachaRunAt`, `eventsAt` and `nowInfo().melacha` count
  Shabbos and Yom Tov as forbidden from shkiah, the sunset on the eve (the sunset that candle
  lighting is counted from: at sea level unless `useElevation` and `beginningsSunset: 'elevation'`),
  not from candle lighting. Candle lighting is unchanged and is shown as the custom's time to light.
  Where the candles are lit from an existing flame after nightfall (a second night of Yom Tov, or
  Yom Tov after Shabbos), the run is already in progress. Yom Kippur and Tisha B'Av begin at
  sunset as before. Where the sun does not set, the existing answers by the civil day and the
  `null` results stand. There is no option for the start at candle lighting.
- **Why:** the Rambam, the Tur, the Gra and (as the Biur Halacha reports) the Geonim begin the
  doubtful time of bein hashmashos at shkiah, and melacha is forbidden from then (Mishna Berura
  261:23); a flag that began later would allow what they forbid. Candle lighting is a custom of
  some minutes before shkiah, and the minutes differ by place (18, 40, ...), so it is not the time
  melacha becomes forbidden. This is Luach's default, not a ruling.
- **Sources:** Shabbat 34b–35b (bein hashmashos, from shkiah on the opinion followed for Shabbos);
  Rambam, Hilchos Shabbos 5:3–4; Tur and Shulchan Aruch OC 261:1–2; Mishna Berura 261:2, 23
  (the Gra and many Rishonim: bein hashmashos begins at once after the sun sets, and one should
  finish lighting before shkiah); Biur Halacha 261; Shulchan Aruch OC 263:10 with the Rema, on
  accepting Shabbos by lighting.
- **Confidence:** Medium: the Rambam, the Tur, the Gra and the Mishna Berura (261:23) agree on
  shkiah; Rabbeinu Tam's view, which the Shulchan Aruch (261:2) follows, is later.
- **Open:** Rabbeinu Tam's later start (the day lasts until his second sunset); a personal
  acceptance of Shabbos, by lighting (the Rema, 263:10) or in shul, which makes it begin earlier for
  that person and is not known to Luach; tosefes Shabbos, which is a mitzvah to add from the day
  and has no fixed length. Luach rules on none of these. Ask your rav.

### Candle lighting 18 minutes; havdala at 8.5° {#candle-lighting-18-minutes-havdala-at-8-5}

- **Status:** Default.
- **What it does:** candle lighting defaults to the place's documented custom where Luach has
  one (a built-in place's `candleLighting`, such as Jerusalem's 40 minutes, with its source),
  otherwise 18 minutes before sunset; havdala and second-night candles to 8.5°. The same
  default applies everywhere: `Zmanim`, the day view and iCal. (Melacha begins at shkiah, not at
  candle lighting: see "Melacha forbidden from shkiah".)
- **Why:** 18 minutes is the most common diaspora custom; 8.5° is a widely printed time for
  three small stars.
- **Sources:**
  - Tosefes Shabbos: SA OC 261:2; the minutes are custom (Igros Moshe OC 2:6; Kaf HaChaim
    261:23; Yabia Omer 5:21) (*secondary*).
  - Three small stars: SA OC 293:2 (*verified*); 8.5° per R. Tukaczinsky and Chabad practice
    (*secondary*).
  - Second night: SA OC 503:1.
- **Confidence:** Medium.
- **Open:** cities whose custom has no source in Luach get 18 minutes; see the next entry.

### Local candle-lighting customs {#local-candle-lighting-customs}

- **Status:** Default.
- **What it does:** a place may carry its documented custom (Jerusalem 40, Haifa 30); `Zmanim`, the day view, the CLI, iCal and every at-an-instant function use it unless the caller sets the minutes, and label it with the source. It applies when the city is given (a built-in place, or a location that carries `candleLighting`), never guessed from coordinates: times are always computed from the location's own coordinates. For a GPS position in a chosen city, spread the city and set the position: `{ ...getPlace('jerusalem'), latitude, longitude, elevation }`. Every location in Israel with no documented custom and no `candleLightingMinutes` (a built-in place such as Tel Aviv, a city of the full table, a record of the caller's, or bare coordinates) gets 18 minutes and a plain note in the zman's opinion: "Luach has no documented custom for this place"; to use a city's custom, pass that city or `candleLightingMinutes`. `nowInfo.settings.candleLightingNote` carries it. Jerusalem's custom is never attached to the other places of its district.
- **Why:** the minutes are a local custom; a city whose custom is documented should not get the generic 18.
- **Sources:** Peninei Halakha, Shabbat 3:2 (Jerusalem 40, Haifa 30) and Zemanim 13:5 n. 11 (Jerusalem) (*verified*, read on ph.yhb.org.il). Not set without a source: Zichron Yaakov 30, Petach Tikva 40, the Shomron 30.
- **Confidence:** Medium: one published source per city.
- **Open:** other values reported for Jerusalem (not checked against the text); other cities need sources. Where a
  custom ends is a question for a rav, so Luach does not infer a city from coordinates: bare
  coordinates, even inside Jerusalem, get 18 minutes with the note, unless the caller passes the
  city or the minutes.

### The earliest time to light the Chanukah lights {#the-earliest-time-to-light-the-chanukah-lights}

- **Status:** Default.
- **What it does:** `nightOf(...).chanukahLighting` and `nowInfo`'s `night` and `nextNight` give the earliest time to light the Chanukah lights on each evening of Chanukah, by custom, from times Luach already computes. On a weekday it offers two customs: from sunset (the evening's `sunset`) and from nightfall (the evening's `tzeis`, so it follows the caller's nightfall opinion). The caller chooses with the `chanukahLighting` option (`'sunset'` or `'tzeis'`); with none chosen the custom in force is nightfall, a default, so a weekday `earliest` is the nightfall custom's time, `custom` says `'tzeis'`, `isDefault` is `true` (and `nowInfo`'s `settings.chanukahLightingIsDefault` too), and `customs` still lists both. On Erev Shabbos the earliest is the caller's `plag` and the Shabbos candle lighting is given as `before`; on Motzaei Shabbos it is when Shabbos ends (the caller's havdala time). `until` is the dawn of the morning after. Where plag falls after the candle lighting (a long candle-lighting custom with a Magen Avraham plag) both times are given as they are.
- **Why:** the sources differ on what "sunset" means for the lights. Luach's default is nightfall, the reading of "the end of sunset" in Shulchan Aruch OC 672:1 as the Mishna Berura 672:1 explains it. It is a default, not a ruling: Luach rules on none of the customs, and the caller changes it with `chanukahLighting: 'sunset'`. It is marked as the default wherever it is shown (`isDefault`, and "Luach's default" on the command line). The special evenings do not depend on the choice, so they are given whichever custom is set.
- **Sources:**
  - From sunset: Rambam, Hilchos Megillah vChanukah 4:5; Beur HaGra OC 672:1 (*verified*).
  - From nightfall, "the end of sunset", explained as when the stars come out: Shulchan Aruch OC 672:1; Mishna Berura 672:1 (*verified*).
  - Erev Shabbos, before the Shabbos candles, from plag hamincha, with oil to burn until half an hour after the stars come out: Shulchan Aruch OC 679:1; Mishna Berura 679:2 (*verified*). The Mishna Berura reckons plag hamincha as an hour and a quarter of seasonal hours before nightfall (672:3, *verified*); Luach gives the caller's own plag opinion, which by default is counted from sunset and so is earlier than his. The Mishna Berura (233:4) states both ways of counting the day's hours: from dawn to nightfall, or from sunrise to sunset.
  - Motzaei Shabbos: the lights first, Shulchan Aruch and Rema OC 681:2; havdala first, the Taz, cited in Mishna Berura 681:3 (*verified*).
  - Until dawn: Rema OC 672:2; Mishna Berura 672:11, with the berachah while the household is awake (*verified*). The proper time to light is about half an hour from the earliest time (Shulchan Aruch OC 672:2) and is not turned into a clock time.
- **Confidence:** Medium: the sources are read, but which customs are held where is not settled here.
- **Open:** customs not offered yet: lighting shortly after sunset as in Chabad practice, and Rabbeinu Tam's sunset. On Erev Shabbos Luach has no plag counted from nightfall by the caller's own nightfall opinion, as the Mishna Berura counts it: the earliest shown follows the plag opinion chosen. Whether the lights or havdala come first on Motzaei Shabbos is left to the household.

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
- **Sources:** Magen Avraham 233:3 and 267:1 (*verified*). The Levush's own text was *not checked against the text*.
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
- **Confidence:** Medium: the Levush itself was not checked against the text.
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
  the London Beth Din on high latitudes are *not checked against the text* and are not cited.
- **Confidence:** High that null is the safe default.
- **Open:** `nearestDay` cites no source; `halfNight` now does (see [The far north: which rule for which use](#far-north-which-rule-for-which-use)).

### The far north: which rule for which use {#far-north-which-rule-for-which-use}

- **Status:** Default (`highLatitudeFallback: 'none'`); the rules are options.
- **What it does:** where the sun never gets low enough for an angle (far north in summer), the
  time is `null` with `reason: 'sun-always-above'`, and `Zman.fallbacks` gives what each rule would
  give: `halfNight`, solar midnight (the sun's lowest point), and `nearestDay`, the same offset from
  solar noon as on the nearest day the sun reaches the angle. Neither is used unless chosen, by
  reading it or by setting `highLatitudeFallback`. In polar night there are none.
- **Each use, and what the sources say:**
  - *A minor fast begins* (no dawn): from midnight. The Siddur of the Alter Rebbe (Seder Sefiras
    HaOmer) writes that from 18 Iyar to 17 Tammuz "in these northern lands" dawn is at midnight,
    "so once midnight of the night of 17 Tammuz has come it is forbidden to eat"; the Biur HaGra
    (OC 261:2) that in northern lands in summer dawn begins at midnight. `fallbacks.halfNight`.
  - *A fast ends* (no nightfall): no source found that sets it. By analogy only, the end of Shabbos
    at chatzos below. The Tiferes Yisrael (Boaz, Berachos 1:3) names the fast among the questions
    of such places and leaves it open.
  - *The Omer, with a bracha until*: midnight (the Siddur, as above). `fallbacks.halfNight` of dawn.
  - *The Omer, from when* (no nightfall): no source found.
  - *Maariv*: from plag hamincha (R' Dovid Heber, "Halachos in Arctic & Polar Regions",
    Kashrus Kurrents; B'Mareh HaBazak V:1 for the polar summer). Plag occurs; no fallback is needed.
  - *The night Shema*: repeated just before chatzos (R' Heber). `fallbacks.halfNight`.
  - *The end of Shabbos and Yom Tov*: chatzos (R' Heber, who calls that moment both nightfall and
    dawn; B'Mareh HaBazak V:1 for the polar summer; Chevel Nachalaso 6:23 reports this custom in
    Scandinavia). B'Mareh HaBazak V:36 reports another practice, an angle of 8.1°, which Luach does
    not offer.
  - `nearestDay`: no source found in any text opened.
- **Why:** Luach rules on nothing: the default stays "no time", and the rules are given with their
  sources so the person and their rav can choose.
- **Sources:** as listed above; Shulchan Aruch OC 562:1, 564:1, 489:1 and 235:1 for the ordinary
  rules, each tied to an angle.
- **Confidence:** Medium: the texts are read; which applies where is for a rav.
- **Open:** a default for each use; whether the Siddur's "these northern
  lands" reaches every latitude; Luach's solar midnight is the midpoint of two solar transits, which
  the sources call chatzos halayla, not halfway from sunset to sunrise; when the Omer may be counted
  where there is no nightfall.

### No fallback in polar night {#no-fallback-in-polar-night}

- **Status:** Default.
- **What it does:** the high-latitude fallbacks apply only when the sun never gets low enough; in polar night the time stays null.
- **Why:** in polar night the sun never rises to the angle, so any time would be invented.
- **Sources:** *No source recorded* for the fallbacks themselves (see [No made-up times at high latitudes](#no-made-up-times-at-high-latitudes)).
- **Confidence:** High for the null; the fallbacks remain a judgement.
- **Open:** where a place has a havdala time in polar night but no shkiah, melacha stays forbidden
  until the civil day ends, the cautious side. No source read supports that. B'Mareh HaBazak V:1
  (reporting Rav Goren and Rav Koren) gives midday (chatzos hayom) for the polar winter; Chevel
  Nachalaso 6:23 argues against reckoning by degrees there. Ask your rav.

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
- **Open:** apps should show the opinions their community follows. In northern summers (London and
  Antwerp from about mid-April to the end of August; Montreal mainly June and July) the default
  alos at 72 minutes falls after misheyakir at 11°. Every source read puts alos before misheyakir
  (Shulchan Aruch OC 58:1, 3, 4; Mishna Berura 89:2); none says which is primary when they cross.
  Ask your rav.


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
    Vilna Gaon's custom (every year except when Erev Pesach is Shabbos, Maaseh Rav 176) is the
    option `shabbosHagadol: 'exceptErevPesach'`.
  - Kedoshim: Rema OC 428:8, ArtScroll, a published Ashkenazi luach and Chabad; Hertz, Koren and
    Sefaria swap it with Amos.
  - A value was recorded only when two sources agreed.
- **Confidence:** High for Ashkenaz and Chabad; Medium for Sephardi (Sefaria's Sephardi data
  is incomplete); Low for Teimani (several values are null).
- **Open:** *no source recorded* for choosing "every year" as the Sephardi default for
  Shabbos HaGadol.

### Teimani haftaros from the Rambam's list {#teimani-haftaros-from-the-rambam-s-list}

- **Status:** Sourced; some values still null.
- **What it does:** the Teimani (Baladi) haftara of Chayei Sarah (I Kings 1:1–31), Ki Sisa
  (I Kings 18:1–45), Masei and Matos-Masei (Isaiah 1:1–20, the second of the three of
  affliction), Acharei Mos-Kedoshim (Kedoshim's, Ezekiel 20:1–15), Behar-Bechukosai
  (Bechukosai's, Ezekiel 34:1–27), the second day of Shavuos (Habakkuk 2:20–3:19), and Shekalim,
  HaChodesh and Chanukah on Shabbos Rosh Chodesh (their own haftara, with no Rosh Chodesh verses).
  Still null: Shabbos Rosh Chodesh Av, the Rosh Chodesh Elul cases, Shekalim before Rosh Chodesh,
  Shabbos Rosh Chodesh with Erev Rosh Chodesh, the second day of Sukkos and the Mincha of Tisha
  B'Av.
- **Why:** the Baladi Teimanim follow the Rambam, who lists the haftaros and gives the rules:
  joined parshiyos read the second's haftara ("כל שבת שקורין בה שתי פרשיות מפטירין בה מענין
  פרשה אחרונה"), and the three of affliction are Jeremiah, "חזון ישעיהו", "איכה".
- **Sources:** Rambam, Seder HaTefillah, the order of the haftaros; Hilchos Tefillah 13:9, 13:17,
  13:19–20; Megillah 29b; with the haftara notes of *Miqra al pi ha-Masorah* for the verse
  ranges (*verified*). The end of Isaiah 1:20 is from *Miqra al pi ha-Masorah* alone.
- **Confidence:** Medium: the Rambam's list is the Baladi source, but a printed Baladi Tiklal was
  not checked against the text.
- **Open:** the null values above; whether Shabbos Shuva adds Micah 7:18–20 (*Miqra al pi
  ha-Masorah* says so for Teimanim; Luach has Hosea alone); the Shami customs (Malachi on
  Shabbos HaGadol; Kedoshim to 20:20).

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

- **Status:** Sourced for Shabbos HaChodesh; open question for Chanukah.
- **What it does:** on Shabbos HaChodesh on 29 Adar, the Chabad haftara is HaChodesh's followed
  by the first and last verse of Machar Chodesh (`hachodesh-machar-chodesh`). On a Shabbos of
  Chanukah on 29 Kislev no Machar Chodesh verses are added.
- **Why:** Sefer HaMinhagim (Chabad) gives the rule for HaChodesh: "If this Shabbos is Rosh
  Chodesh or erev Rosh Chodesh, the Haftorah of Parshas HaChodesh is followed by the first and
  last verse of the Haftorah of Shabbos Rosh Chodesh or of machar chodesh." It says nothing of
  Chanukah, so Luach adds nothing there.
- **Sources:** Sefer HaMinhagim, "The Torah Reading on Shabbos and Festivals" (English, Kehot)
  (*verified*); SA OC 425:2, 685:4, 684:3; Aruch HaShulchan OC 425:4–5 (the displacement itself,
  *verified*).
- **Confidence:** High for HaChodesh; Low for Chanukah.
- **Open:** a Chabad source for a Shabbos of Chanukah on 29 Kislev.

### Chabad on Shabbos Rosh Chodesh Av {#chabad-on-shabbos-rosh-chodesh-av}

- **Status:** Sourced.
- **What it does:** the Chabad haftara on Shabbos Rosh Chodesh Av is Shim'u (Jeremiah 2:4-28;
  4:1-2) alone, with no verses of Isaiah 66 added.
- **Why:** Sefer HaMinhagim lists "Shabbos Rosh Chodesh Menachem Av: shim'u", and in the laws of
  the Three Weeks gives Jeremiah 2:4-28 and 4:1-2. Its note records that the Rebbe Rashab once
  read Isaiah 66 and later regretted it.
- **Sources:** Sefer HaMinhagim, "The Torah Reading on Shabbos and Festivals" and "The Three
  Weeks" (English, Kehot) (*verified*).
- **Confidence:** High.
- **Open:** nothing.

### Shnayim Mikra {#shnayim-mikra}

- **Status:** Sourced.
- **What it does:** `shnayimMikra` gives the parsha (or joined parshiyos) the congregation reads on
  the coming Shabbos, its verses, and that Shabbos. In a week whose Shabbos is Yom Tov, the next
  parsha read on Shabbos. After the year's last Shabbos parsha until Simchas Torah, Vezos
  HaBeracha, with no Shabbos. On Shabbos itself, that Shabbos's parsha (from Mincha the next week's
  counts too; a date has no time of day). No split by day.
- **Why:** the Shulchan Aruch ties it to the week's parsha read with the congregation, and sets no
  daily portion.
- **Sources:** SA OC 285:1 ("חייב לקרות לעצמו בכל שבוע פרשת אותו שבוע"), 285:3 ("מיום ראשון ואילך
  חשיב עם הצבור"), 285:4 (best before the Shabbos meal; until Mincha; some say until Wednesday or
  Simchas Torah), 285:7 ("אין צריך לקרות פרשת יו"ט"); MB 285:7 and 10 (from Shabbos Mincha the next
  week's), 285:8 (the Gra read part of it each day and finished on Friday), 285:18 (Vezos HaBeracha
  on Hoshana Rabba) (*verified*, Sefaria).
- **Confidence:** High.
- **Open:** nothing.

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
