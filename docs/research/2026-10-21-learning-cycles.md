# Daily learning cycles: rules, anchors and structure (research note, 2026-10-21)

Scope: the facts Luach needs to compute ten learning schedules, with machine data in
a companion `learning-cycles.json` (to be copied into the repo when the feature lands). Nothing here comes
from hebcal (any package, including @hebcal/learning), KosherJava, kosher-zmanim or Calendrical
Calculations. Web searches sometimes returned hebcal blog or package pages; they were not opened, and
nothing below depends on them.

How facts were checked:
- **Structure** (dafim, chapters, mishnayos) comes from Sefaria's public API (`/api/shape`,
  `/api/v2/raw/index`), Wikipedia and he.wikipedia. Counts are facts, not expression.
- **Anchors** (cycle start dates) come from publishers' announcements (OU, ArtScroll, Dirshu, Chabad) and
  Wikipedia.
- **Arithmetic cross-check.** For every cycle marked "fully specified", I worked out the date from the
  structure plus the anchor and compared it with an independent observation. That observation is the
  output of Sefaria's public calendar API (`/api/calendars`) or a publisher page for a given date.
  Only the outputs were used, never code. Every check listed below matched.

## Status summary

| Cycle | Status |
|---|---|
| Daf Yomi Bavli | Fully specified |
| Yerushalmi (Vilna) | Fully specified |
| Yerushalmi (Oz VeHadar / Schottenstein) | Partial: start date and per-tractate counts are known; skip rules and order are not published |
| Mishna Yomis | Fully specified (Sefaria numbering) |
| Rambam 3/day and 1/day | Fully specified, including two layout quirks |
| Sefer HaMitzvos | Blocked: Chabad's published table |
| Nach Yomi | Fully specified |
| Chofetz Chaim / Shemiras HaLashon | Blocked: published date-keyed table |
| Tanya Yomi | Blocked: date-keyed table (Hayom Yom) |
| Dirshu Daf HaYomi B'Halacha | Partial: rate and anchor known; amud map of the Dirshu Mishnah Berurah is not public |
| Halacha Yomis (Sztencl) | Blocked: no cycle anchor found |
| Daf HaShavua | Fully specified (start date derived from an OU anchor) |
| Amud Yomi (Dirshu) | Partial: start date and unit known; amud-level mapping is off by one day against a published anchor |

## 1. Daf Yomi Bavli

- **Unit:** one daf (both sides) of the Vilna Shas per day, every day, with no skips [1][2].
- **Cycle 1:** 1 Tishrei 5684 = 1923-09-11 [1][2].
- **Rule change:** cycles 1-7 had 2,702 dafim. From cycle 8 (15 Tammuz 5735 = 1975-06-24), the Agudah
  Daf Yomi commission switched Shekalim to the Vilna pagination, raising the total to 2,711 [1][2].
  en.wikipedia says Shekalim went from "13 dafim" to "22 dafim"; he.wikipedia says from 12 to 21 pages.
  Both mean the last daf was 13 and is now 22, since tractates start at daf 2. That is 12 learning days
  before the change and 21 after, a difference of 9 = 2711 - 2702.
- **Arithmetic check:** 1923-09-11 + 7×2702 days = 1975-06-24, the cycle 8 start in [2]. Adding
  6×2711 days gives 2020-01-05, the cycle 14 start, which matches Sefaria (Berakhot 2 on 2020-01-05, Niddah
  73 on 2020-01-04). The tractate table below puts 2026-10-21 at Bechoros 33, and Sefaria agrees [4].
  The next cycle starts 2027-06-08.
- **Tractate list:** 37 lines in he.wikipedia, which counts Meilah+Kinnim+Tamid+Middos as one 36-page
  line [2]. The per-tractate last daf comes from Sefaria's Bavli shape [6] and Wikipedia's tractate
  table [3]. The total is 2,711 (checked in code).
- **Kinnim, Tamid, Middos:** these are learned straight after Meilah on continuous Vilna folio numbers.
  The day labels are Meilah 2-22, Kinnim 23-25, Tamid 26-33, Middos 34-37, so the block is 36 days
  (2-37). Kinnim starts on Meilah 22a, and Tamid starts on 25b. Steinsaltz's daf archive labels
  "Me'ila 22a", "Kinnim 23a-b … 25a", "Tamid 26a-b … 33a-b", "Middot 34a-b …" [5]. Sefaria's calendar
  gives the same day labels for 2027-03-10 to 2027-03-27 [4].
- JSON: `dafYomiBavli.tractates` as `[name, firstDaf, lastDaf]`.

## 2. Daf Yomi Yerushalmi

### 2a. Vilna pagination (the original cycle)
- **Start:** 15 Shevat 5740 = Saturday 1980-02-02 [2][8]. It is announced as about 4¼ years per
  cycle [2][8].
- **Unit:** one Vilna daf (1922 edition, numbered from 1a) per day.
- **Skips:** Yom Kippur and Tisha B'Av are not learned. Sefaria's calendar shows no Yerushalmi entry on
  YK 2023-09-25 or on 9 Av 2023-07-27, and the daf resumes the next day [4]. Whether a postponed
  (nidcheh) Tisha B'Av is skipped on the Sunday was not independently confirmed. The expected rule is
  "the day the fast is kept"; treat this as **(unverified)**.
- **Total:** 1,554 dafim. I computed the per-tractate counts from Sefaria's `Vilna` alt-structure in
  each Jerusalem Talmud index (last amud of the last chapter node) [7]. For example, Berakhot has 68.
  Sefaria's Peah and Demai nodes have small internal gaps or overlaps between chapters, but the last
  daf is unaffected.
- **Order** (from the D.A.F. Yerushalmi index [9], confirmed by sampling Sefaria every 10 days through
  cycle 11 [4]): Zeraim in the usual order. Then Shabbos, Eruvin, Pesachim, **Beitzah, Rosh Hashanah,
  Yoma, Sukkah, Taanis, Shekalim**, Megillah, Chagigah, Moed Katan. Then Yevamos, **Kesubos, Sotah**,
  Nedarim, Nazir, Gittin, Kiddushin. Then Bava Kamma, Bava Metzia, Bava Basra, **Shevuos, Makkos,
  Sanhedrin**, Avodah Zarah, Horayos, Niddah. This is not the Bavli order.
- **Anchors:** cycle 10 started 2018-08-04 (ArtScroll announcement [10]; Sefaria agrees), and cycle 11
  started 20 Cheshvan 5783 = 2022-11-14 [2][4]. Cycle 11 ends 15 Adar I 5787 [2]. My count of 1,554
  learning days plus 8 skipped days gives 2027-02-22, which is 15 Adar I 5787 by my reckoning of 5787.
  Cycle length is not a constant: 1980-02-02 + 9×1562 days misses 2018-08-04, because the number of
  YK/TB days inside a cycle varies. The library must step through cycles day by day from the
  1980-02-02 epoch, not divide by a fixed length.

### 2b. Oz VeHadar layout ("Schottenstein" cycle)
- ArtScroll announced "a 5-1/2-year Yerushalmi Daf Yomi cycle based on the Oz V'hadar page layout as
  used in the Schottenstein Edition", starting "November 14th / כ חשון" (article dated 2022-11-09) [11].
  he.wikipedia also describes it (from 20 Cheshvan 5783, about 5½ years) [8].
- **Per-tractate counts:** Wikipedia's tractate table uses the Oz VeHadar numbering for the Yerushalmi:
  Berakhot 94 … Niddah 11, total 2,094 [3]. These are in the JSON.
- **Not established:** skip days, tractate order, and whether a tractate's count starts at daf 1. If
  there are no skips, 2,094 days from 2022-11-14 ends 2028-08-07. That is derived, not published, and
  it does not match ArtScroll's "5½ years". Status: **partial**.

## 3. Mishna Yomis

- **Unit:** two mishnayos a day, every day. Founded in 1948 by R. Yonah Sztencl [12]. The first-cycle
  start date was not found.
- **Anchors** [12]: 22 Tammuz 5770 = 2010-07-04, 20 Adar II 5776 = 2016-03-30, and 21 Teves 5782 =
  2021-12-25.
- **Total:** 4,192 mishnayos in 525 chapters, including Avos chapter 6 (Kinyan Torah). The total
  appears in [12] and [3]. 2010-07-04 + 2096 = 2016-03-30 and + 2096 = 2021-12-25 exactly, so a cycle
  is 2,096 days with no skips and Avos 6 is included. The next cycle starts 2027-09-21.
- **Pairs cross boundaries.** The sequence is one flat list. Sefaria shows days such as "Megillah
  3:6-4:1", and 31 tractates begin on the second mishnah of a day.
- **Chapter lengths:** taken from `https://www.sefaria.org/api/shape/Mishnah` (63 tractates), and stored
  in JSON as `mishnaYomis.tractates` = `{tractate: [mishnayos per chapter]}` plus an ordered list
  with Hebrew names. All 63 per-tractate totals match Wikipedia's table [3]. Position check: the 2021-12-25
  anchor puts 2026-10-21 at Oholos 11:6-7, the same as Sefaria [4].
- **Numbering vs Kehati:** totals agree at the tractate level and the cycle arithmetic only works with
  4,192. I found no public source listing chapter-level differences between Sefaria's numbering and
  the Kehati numbering used in printed Mishna Yomis calendars. **Open:** spot-check a few chapters
  known to vary between editions against a printed Kehati before shipping verse-level labels.

## 4. Rambam (Chabad, from 1984)

- **Start:** 27 Nisan 5744 = Sunday 1984-04-29 [13]. Chabad.org cites the Rebbe's talk of
  1984-04-28 [15], and he.wikipedia gives 27 Nisan [13]. The user's "27 April" is not supported. The
  first 3-chapter siyum was 11 Nisan 5745 (= 1985-04-02 = start + 338 days). The first 1-chapter siyum
  was 10 Shevat 5747 (= 1987-02-09 = start + 1016 days) [13]. Both tracks finished together on
  2020-07-09 (39th and 13th cycles) [14].
- **3 chapters/day: 339-day cycle.** Days 1-4 are the introduction (Mesoras HaTorah, 45 paragraphs),
  the list of positive mitzvos, the list of negative mitzvos, and the 14-part table of contents. Each is
  learned whole in one day. Then come 1,006 hilchos chapters at 3 a day. Quirk: the "Text of the
  Haggadah" (Sefaria's Chametz uMatzah ch. 9) shares a day with ch. 8. Chabad.org for 2025-04-25
  lists "Chametz U'Matzah ch. 8; Text of the Haggadah; Shofar ch. 1; ch. 2" [16]. So 1,005 counted
  units / 3 = 335 days, and 4 + 335 = 339. Seder HaTefillah counts as 5 units (Chabad.org for 2025-04-06:
  "Text of the Grace After Meals; Shabbat 1; 2" [16]).
- **1 chapter/day: 1,017-day cycle** (3 × 339). The four introduction texts take 3 days each, 12 days
  in all (Sefaria: Introduction 1-21 / 22-33 / 34-45, Positive 1-83 / 84-166 / 167-248, and so on). Then one
  chapter a day. Quirks: the Haggadah is its own day (Chabad.org 2023-10-05) [16], and Seder HaTefillah
  parts 4-5 share a day (Chabad.org 2023-08-08: "Text of the Confession" + "Text of the Grace After
  Meals") [16]. 12 + 1006 - 1 = 1017.
- **Arithmetic check:** cycle starts at 1984-04-29 + 339k (3/day) and + 1017k (1/day). Both give
  2020-07-10, 2023-04-23 and 2026-02-03, which match Sefaria [4]. I compared one whole 3/day cycle
  (2025-03-01 to 2026-02-02) day by day with Sefaria. The only irregular days were the 4 introduction
  days and the Haggadah day.
- **Chapter order and counts:** 84 Sefaria hilchos units (Seder HaTefillah counted separately) in learning
  order, from the Sefaria index plus `/api/shape/Mishneh Torah, <hilchos>`, totalling 1,006 chapters.
  They are in JSON as `[sefer, English, Hebrew, chapters]`. Sefaria's chapter counts follow its own text
  (for example, Chametz uMatzah 9, Seder HaTefillah 5). The quirks above map them onto Chabad's day units.
- **Sefer HaMitzvos:** runs alongside the 3-chapter track and finishes all 613 mitzvos each year
  [13][15]. The daily mitzvos are "related to the topic of that day's three chapters" [13], so they
  come from a published Chabad table, not from structure. **Blocked** unless that table's licence
  permits reuse.
- **Licence note:** Chabad.org pages are "© all rights reserved" [15]. The schedule rules above are
  facts reconstructed from counts and a few dated observations. Do not scrape the table.

## 5. Nach Yomi (OU)

- **Unit:** one chapter of Nevi'im/Kesuvim a day, Joshua 1 to II Chronicles 36 [17]. There are no
  skips and no special Tehillim split. The OU's first cycle "ran for 742 days" [17], and Nach has
  exactly 742 chapters (Sefaria Tanakh shape, 34 books with Samuel, Kings, Ezra-Nehemiah and Chronicles
  counted as Sefaria splits them) [19].
- **Anchors:** 2007-11-01 (debut) and 2009-11-12 [17], 2015-12-17, and 2026-02-12 [18]. All fall on
  2007-11-01 + 742k, as do 2020-01-09 (from the OU page [21]) and 2024-02-01.
- JSON: `nachYomi.books` = `[English, Hebrew, chapters]`.

## 6. Chofetz Chaim / Shemiras HaLashon yomi

- Devised by R. Yehuda Zev Segal of Manchester: two halachos a day. It is "completed once every four
  months", with three cycles a year, one starting on Rosh Hashanah. In a leap year it is divided over 13
  months [22][23].
- No rule produces the daily portions. They are a fixed list of segments assigned to Hebrew dates in
  the Chofetz Chaim Heritage Foundation calendar and in ArtScroll's *Chofetz Chaim: A Lesson a Day*
  (Mesorah), a copyrighted book. Booksellers' descriptions disagree on the segment count (128 vs 178),
  and no publisher page states the per-date table. **Blocked** until the Foundation grants
  permission or publishes the table under an open licence.

## 7. Tanya Yomi (Chabad)

- An annual cycle keyed to the Hebrew date, from 19 Kislev to 18 Kislev, set in *Hayom Yom* (compiled by
  R. Menachem M. Schneerson, Kehot 1943, covering 19 Kislev 5703 to 18 Kislev 5704) [24]. 5703 was a
  leap year. How non-leap years combine portions is not documented in any source I read. Sefaria's
  calendar labels the portion by date ("10 Cheshvan" → Iggeres HaKodesh 26) [4].
- It is a table, not a rule. *Hayom Yom* is a Kehot publication, presumably still in copyright (the
  status of the date-to-portion mapping is not stated anywhere I found). **Blocked** pending permission
  from Kehot or a source with a clear licence.

## 8. Halacha: Dirshu Daf HaYomi B'Halacha, and Sztencl's Halacha Yomis

- **Dirshu Daf HaYomi B'Halacha:** one amud of Mishnah Berurah (Dirshu edition) a day, five days a week.
  Friday and Shabbos are for review [25]. A new machzor began Sunday 2 Nisan 5775 = 2015-03-22, about 7
  years [25]. Chelek Gimmel began 17 Tammuz (2017) [26]. The amud-to-siman map depends on Dirshu's
  printed pagination, which is not public. **Partial:** Luach could report "day N of machzor" but not
  the amud. A later machzor start (around 2022) was found only on low-quality mirror sites and is not
  used.
- **Halacha Yomis (Sztencl, about 1950):** 3 se'ifim of Shulchan Aruch OC a day, then 5 of Kitzur, about 4
  years [20]. No cycle anchor was found. (Sefaria's "Halakhah Yomit" stream shows Kitzur in early 2025
  and Shulchan Aruch OC 2:1-3 on 2025-04-16 [4], but that is not a publisher source.) **Blocked.**

## 9. Daf HaShavua (Daf-a-Week)

- **Unit:** one Bavli daf a week, in the same tractate list as Daf Yomi (2,711 weeks, about 52 years).
  It started in Passaic with Berachos in 2005 [27].
- **Anchor:** the OU says Beitzah (2a) begins Sunday 2016-10-16 [28]. Beitzah is preceded by 606 dafim, so
  week 1 began Sunday **2005-03-06** (derived). The same arithmetic gives Megillah on 2018-10-07, which
  matches "begins Megillah on October 6" [27] (a Saturday-night start), and Nazir 14 on 2026-10-21,
  which matches Sefaria [4]. Weeks run Sunday to Shabbos.

## 10. Amud Yomi (Dirshu Amud HaYomi)

- **Unit:** one amud a day, "every day, weekday, Shabbos and Yom Tov", about 14 years [29][30]. It
  started on Berachos 2a on "the first day of Rosh Chodesh Cheshvan, October 15, 2023" (30 Tishrei 5784)
  [29].
- **Anchor:** Pesachim begins Monday 25 Tammuz = 2025-07-21 [31]. The first siyum, on Berachos, was 10
  Adar I 5784 in Vienna [32].
- **Open problem:** counting Sefaria's amudim (Berachos 2a-64a = 125, Shabbos 2a-157b = 312, Eruvin
  2a-105a = 207) from 2023-10-15 puts Pesachim 2a on 2025-07-20, one day early. Dirshu may count a
  single-sided last page as a full day, or the effective start may be 1 Cheshvan (2023-10-16). Shekalim
  (Yerushalmi) and Kinnim/Tamid/Middos handling is also unknown. **Partial:** mapping needs Dirshu's
  calendar.

## Sources (all fetched 2026-10-21)
1. https://en.wikipedia.org/wiki/Daf_Yomi
2. https://he.wikipedia.org/wiki/הדף_היומי
3. https://en.wikipedia.org/wiki/List_of_Talmudic_tractates
4. Sefaria calendar API, e.g. https://www.sefaria.org/api/calendars?year=2026&month=10&day=21&diaspora=1 (outputs only)
5. https://steinsaltz.org/daf/page/4/
6. https://www.sefaria.org/api/shape/Bavli
7. https://www.sefaria.org/api/v2/raw/index/Jerusalem_Talmud_Berakhot (and the other 38 tractates)
8. https://he.wikipedia.org/wiki/תלמוד_ירושלמי
9. https://dafyomi.co.il/yeru_picker_perek.php?gid_yeru=3
10. https://www.theyeshivaworld.com/news/promotions/1563334/artscroll-yerushalmi-ready-for-new-learning-cycle-the-next-daf-yomi-begins-on-august-4th.html
11. https://www.theyeshivaworld.com/news/promotions/2136727/talmud-yerushalmi-to-begin-new-cycle-of-daf-yomi-on-november-14-join-today.html
12. https://en.wikipedia.org/wiki/Mishnah_Yomis
13. https://he.wikipedia.org/wiki/הרמב"ם_היומי
14. https://en.wikipedia.org/wiki/Daily_Rambam_Study
15. https://www.chabad.org/library/article_cdo/aid/900030/jewish/Studying-Rambam-Daily.htm
16. https://www.chabad.org/dailystudy/rambam.asp?tdate=4/25/2025&rambamChapters=3 (also tdate=4/6/2025, and rambamChapters=1 for 10/5/2023 and 8/8/2023)
17. https://www.ou.org/news/second_ou_nach_yomi_cycle_to_begin_nov_12_siyyum_on_ou_radio_nov_11_to_mark/
18. https://www.ou.org/the-time-is-now
19. https://www.sefaria.org/api/shape/Tanakh ; https://www.sefaria.org/api/shape/Mishnah ; https://www.sefaria.org/api/index/ ; https://www.sefaria.org/api/shape/Mishneh%20Torah,%20Sabbath (and the other 83 hilchos)
20. https://en.wikipedia.org/wiki/Halacha_Yomis
21. https://www.ou.org/start-tractate-chagigah-with-daf-hashavua/
22. https://www.theyeshivaworld.com/news/headlines-breaking-stories/342270/two-halachos-a-day-begins-on-rosh-hashanah.html
23. https://chareidi.org/archives5771/YSR71aloshon.htm
24. https://en.wikipedia.org/wiki/Hayom_Yom
25. https://www.theyeshivaworld.com/news/headlines-breaking-stories/291587/hagaon-harav-malkiel-kotler-shlita-meets-lakewood-rabbonim-urges-participation-in-new-machzor-of-daf-hayomi-bhalacha.html
26. https://jewishlink.news/daf-hayomi-b-halacha-is-set-to-begin-chelek-gimmel-of-mishnah-berurah/
27. https://jewishlink.news/learn-talmud-with-daf-hashavua/
28. https://ou.org/start-5777-daf-week
29. https://jewishlink.news/new-amud-hayomi-program-to-begin-on-rosh-chodesh-cheshvan/
30. https://jewishlink.news/history-made-as-more-than-50000-begin-amud-hayomi/
31. https://jewishlink.news/amud-hayomi-learners-begin-maseches-pesachim-this-week/
32. https://jewishlink.news/amud-hayomi-set-to-begin-masechta-shabbos/

Data licence note for `docs/data-sources.md`: the counts in the JSON are facts. They were taken from
Sefaria API structure and Wikipedia (CC BY-SA text; the facts themselves are not copyrightable). No table
was copied from a calendar publisher.
