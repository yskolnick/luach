# Daily learning cycles: start dates, units and structure

- Date: 2026-10-21
- Purpose: Facts Luach needs to compute "what is learned on date D" for the main daily-learning cycles. It covers start dates, units, ordered unit lists with sizes, cycle lengths, siyum dates and special rules, each with sources and verification data points.
- Method: The cycles' own publishers' calendars (Dirshu, ArtScroll, OU, Chabad), Wikipedia, and Sefaria's public API for structural counts. **Kollel Iyun Hadaf's weekly "Yomi" charts** (dafyomi.co.il) were downloaded for every week from Tishrei 5783 to Elul 5786 (208 pages, 2022-09-25 to 2026-09-05, with a few weeks missing) and parsed into a day-by-day table. That table was used as an independent check. Candidate rules were written as small scripts in a scratch area (not in `src/`) and compared day by day against those calendars.
- Clean room: no code or data files from any other calendar library were opened. Two blog posts by a calendar website came up in web searches and their prose was read, but every fact taken from them was confirmed from another source listed below. Only facts are recorded: dates, counts and orders.
- Licences: Sefaria's API was used only for counts and order (chapter, mishnah and amud counts, and Vilna Yerushalmi pagination from the `alt_structs.Vilna` index field). Sefaria's texts carry individual licences (several CC-BY, CC-BY-SA, CC-BY-NC, public domain), and no text was used. Counts and orders are facts and not copyrightable. Publishers' calendars (Dirshu, ArtScroll, OU, Kollel Iyun Hadaf) are copyrighted documents, so only individual facts were taken from them for verification. No tables were reproduced.
- Output data: `data-staging/learning/*.json` (structure) and `data-staging/learning/cycles.json` (epochs and day rules).

## Summary

| # | Cycle | Unit | Epoch / current cycle | Derivable? | Data file | Confidence |
|---|---|---|---|---|---|---|
| 1 | Daf Yomi Bavli | 1 daf/day, no skips | 1923-09-11 (1 Tishrei 5684); 14th cycle 2020-01-05; 15th 2027-06-08 | Yes | `bavli.json` | High: 3,000+ days verified |
| 2a | Yerushalmi Yomi (Vilna) | 1 daf/day, skips Yom Kippur and Tisha B'Av | 1980-02-02 (15 Shevat 5740); 11th cycle 2022-11-14 | Yes | `yerushalmi-vilna.json` | High: 1,421 days verified |
| 2b | Yerushalmi Yomi (Schottenstein / Oz Vehadar) | 1 daf/day, no skips | 2022-11-14 (20 Cheshvan 5783) | Not yet: 7 lengths missing | `yerushalmi-schottenstein.json` | Medium for the known part |
| 3 | Mishnah Yomis | 2 mishnayot/day, continuous | 14th cycle 2021-12-25 (21 Teves 5782) | Yes | `mishnah.json` | High: 1,421 days verified |
| 4a | Rambam, 3 chapters | 4 intro days + 335 days of 3 chapters = 339 days | 1984-04-29 (27 Nisan 5744) | Yes, with a 4-row intro table | `rambam.json` | High |
| 4b | Rambam, 1 chapter | 12 intro days + 1,005 units = 1,017 days | 1984-04-29 | Yes, with a 12-row intro table | `rambam.json` | High |
| 4c | Sefer HaMitzvos (Chabad) | "Day N" = day N of the 1-chapter cycle | same | Day number yes; mitzvot per day need a table | none | High for alignment |
| 5 | Nach Yomi (OU) | 1 chapter/day, 742 days, no skips | 2007-11-01; current 2026-02-12 | Yes | `nach.json` | High |
| 6 | Chofetz Chaim yomi | Hebrew-date lessons, 3 cycles/year | restarts 1 Tishrei / 1 Shevat / 1 Sivan (leap: 1 Tishrei / 11 Shevat / 20 Iyar) | No: published table | none | Medium |
| 7 | Tanya yomi (Chabad) | Hebrew-date portions, 19 Kislev to 19 Kislev, separate leap track | annual | No: published table | none | Medium |
| 8a | Dirshu Daf HaYomi B'Halacha | 1 amud of Mishnah Berurah Sun–Thu, Fri/Shabbos review | about 2022-02 (not confirmed) | Approximate; exact pages need the luach | `mishnah-berurah.json` | Medium |
| 8b | Mishnah Berurah, Mifal Shonei Halachos | 1 amud/day, every day | 2022-02-08 (back-computed) | Yes for 2022–2026 | `mishnah-berurah.json` | Medium |
| 9 | Daf HaShavua | 1 daf/week, Daf Yomi order | Sunday 2005-03-06 (back-computed) | Yes, low confidence | `bavli.json` | Low |
| 10 | Amud HaYomi (Dirshu) | 1 amud/day, no skips (Rosh Hashanah included) | 2023-10-16 (1 Cheshvan 5784) | Yes, until Kinnim in 2038 | `bavli.json` | High: 1,650+ days verified |

"Verified" means a rule written from the structure alone was compared with a publisher's or third party's day-by-day calendar and gave zero differences over the stated span.

---

## 1. Daf Yomi Bavli

**Start and cycles.** The first cycle began on the first day of Rosh Hashanah 5684, 11 September 1923 (1 Tishrei 5684). [Wikipedia: Daf Yomi](https://en.wikipedia.org/wiki/Daf_Yomi). The first siyum was 2 February 1931 (15 Shevat 5691) (same source).

**Unit.** One daf a day, every day, including Yom Kippur and Tisha B'Av ("including Tisha B'Av", Wikipedia). Dirshu's 5786 luach shows a daf on Rosh Hashanah and Yom Kippur 5786 (Zevachim 9–10 on 23–24 Sept 2025, Zevachim 18 on 2 Oct 2025): [Dirshu luach 5786](https://amudhayomi.com/wp-content/uploads/2025/12/Dirshu-Amud-HaYomi-Luach-10-20-25-HR.pdf).

**Shekalim change.** The original calendar used a 13-daf Shekalim. The cycle later switched to the Vilna Shas's 22-daf Yerushalmi Shekalim, which lengthened a cycle "from 2702 days to 2711 days" (Wikipedia). Wikipedia dates the 8th cycle's start to June 1975. Seven 2,702-day cycles from 1923-09-11 give **1975-06-24**, and 2,711-day cycles from there give the documented later dates (1 Aug 2012 is the 12th siyum, 1 Jan 2020 the 13th). So the change took effect with cycle 8.

**Cycle starts** (computed, and consistent with every published date found):

| Cycle | Start | Hebrew |
|---|---|---|
| 1 | 1923-09-11 | 1 Tishrei 5684 |
| 2 | 1931-02-03 | 16 Shevat 5691 |
| 8 | 1975-06-24 | (first 2,711-day cycle) |
| 13 | 2012-08-03 | 15 Av 5772 |
| 14 | 2020-01-05 | 8 Teves 5780 |
| 15 | 2027-06-08 | 3 Sivan 5787 |

The 14th siyum is on **2027-06-07 (2 Sivan 5787)**, Niddah 73. Sources: [Wikipedia: Siyum](https://en.wikipedia.org/wiki/Siyum) ("June 7, 2027"), and Dirshu's 5787 calendar, which shows Niddah 73 on 6/7/2027 and Berakhos 2 on 6/8/2027: [Dirshu full-size calendar 5787](https://dafhalacha.com/wp-content/uploads/2026/09/Full-Size-Calendar-5787.pdf).

**Order and last daf** (Daf Yomi order, Vilna pagination; all start at daf 2): Berakhot 64, Shabbat 157, Eruvin 105, Pesachim 121, **Shekalim 22**, Yoma 88, Sukkah 56, Beitzah 40, Rosh Hashanah 35, Taanit 31, Megillah 32, Moed Katan 29, Chagigah 27, Yevamot 122, Ketubot 112, Nedarim 91, Nazir 66, Sotah 49, Gittin 90, Kiddushin 82, Bava Kamma 119, Bava Metzia 119, Bava Batra 176, Sanhedrin 113, Makkot 24, Shevuot 49, Avodah Zarah 76, Horayot 14, Zevachim 120, Menachot 110, Chullin 142, Bekhorot 61, Arakhin 34, Temurah 34, Keritot 28, **Meilah 37** (see below), Niddah 73. The sum of (last − 1) is **2,711**.

- The lengths come from Sefaria's amud counts ([api/shape/Bavli](https://www.sefaria.org/api/shape/Bavli)). Sefaria omits Shekalim and Kinnim, Middot and the Daf Yomi numbering of Tamid, so those come from the calendars.
- The Moed order with Shekalim after Pesachim is confirmed by the Amud HaYomi rows (Pesachim 121b, then Shekalim 2a, then Yoma 2a) and by all verified Daf Yomi days.

**Meilah, Kinnim, Tamid and Middot.** These form one 36-day block, dafim 2–37:

- Dirshu's 5787 calendar labels the days Meilah 2–22, Kinnim 23–24, Tamid 25–33 and Middos 34–37 (Meilah 22 on 2027-03-12, Kinnim 23 on 03-13, Tamid 25 on 03-15, Middos 37 on 03-27, Niddah 2 on 03-28).
- Steinsaltz (2019) labels day 25 as **Kinnim 25a** and Tamid as 26–33: [steinsaltz.org archive](https://steinsaltz.org/daf/page/4/). Kinnim really ends on 25a and Tamid begins on 25b, so the two publishers differ only in naming that one day.

**Verification.**

| Date | Daf Yomi | Source |
|---|---|---|
| 2026-10-21 | Bekhorot 33 | Sefaria calendars API; Dirshu 5787 calendar |
| 2011-12-04 | Bechoros 20 | [dafyomi.co.il chart 5772](https://dafyomi.co.il/calendars/yomi/ymi72-11.htm) |
| 2027-06-07 / 2027-06-08 | Niddah 73 / Berakhot 2 | Dirshu 5787 calendar |
| 2019-10-13 | Tamid 26 | Sefaria calendars API (13th cycle) |

The rule also matches all 1,421 days in the dafyomi.co.il charts (2022-09-25 to 2026-09-05) and every day in Dirshu's luach for 5785, 5786 and 5787 (2024-09-04 to 2027-10-01). The only differences were names: on 2027-03-13 to 03-27 the luach prints Kinnim, Tamid or Middos where the test rule printed the block name "Meilah". The daf numbers all agreed.

**Verdict: derivable** from the epoch, cycle lengths and `bavli.json`.

## 2. Daf Yomi Yerushalmi

### 2a. Vilna edition

**Start.** The program was proposed by the Gerrer Rebbe at the Agudah Knessia in Teves 5740 ([Wikipedia: Daf Yomi](https://en.wikipedia.org/wiki/Daf_Yomi), "introduced in 1980 by Simcha Bunim Alter"). The first cycle began on **Tu BiShvat 5740, Shabbos 2 February 1980**.

**Unit.** One Vilna daf a day. **Yom Kippur and Tisha B'Av are skipped:** the cycle pauses that day and resumes the next. When 9 Av falls on Shabbos, the day skipped is the observed fast on Sunday 10 Av. In 5782 (2022-08-06/07), the dafyomi.co.il chart shows Sanhedrin 29 on Shabbos 9 Av and a blank on Sunday 10 Av, then Sanhedrin 30 on Monday: [ymi82-48](https://dafyomi.co.il/calendars/yomi/ymi82-48.htm), [ymi82-49](https://dafyomi.co.il/calendars/yomi/ymi82-49.htm).

**Order and sizes** (all start at daf 1; total **1,554** dafim):
- Zeraim: Berakhot 68, Peah 37, Demai 34, Kilayim 44, Sheviit 31, Terumot 59, Maasrot 26, Maaser Sheni 33, Challah 28, Orlah 20, Bikkurim 13.
- Moed: Shabbat 92, Eruvin 65, Pesachim 71, Beitzah 22, Rosh Hashanah 22, Yoma 42, Sukkah 26, Taanit 26, Shekalim 33, Megillah 34, Chagigah 22, Moed Katan 19.
- Nashim: Yevamot 85, Ketubot 72, Sotah 47, Nedarim 40, Nazir 47, Gittin 54, Kiddushin 48.
- Nezikin: Bava Kamma 44, Bava Metzia 37, Bava Batra 34, Shevuot 44, Makkot 9, Sanhedrin 57, Avodah Zarah 37, Horayot 19.
- Niddah 13.

Where these come from:
- Page counts are from Sefaria's Vilna alt-structure for each tractate (`alt_structs.Vilna`, e.g. [Jerusalem_Talmud_Berakhot](https://www.sefaria.org/api/v2/raw/index/Jerusalem_Talmud_Berakhot)).
- The order is from Kollel Iyun Hadaf's Yerushalmi index ([yeru_picker_daf](https://www.dafyomi.co.il/yeru/yeru_picker_daf.php)). It is **not** Sefaria's index order, which puts Yoma, Shekalim, Sukkah, Rosh Hashanah and Beitzah differently and Sotah before Ketubot.

**Cycle chain.** Chaining 1,554 learning days from 1980-02-02, with those skips, gives:
- Cycle 4 ends **1997-03-13 (Thursday, 4 Adar II 5757)**. This matches a report of "the fourth siyum on Thursday, 4 Adar II 5757" by R' Y. G. Bechhofer (yerushalmionline.org). That page is now a broken redirect; the date was seen only in the search-result text.
- Cycle 11 starts **2022-11-14 (20 Cheshvan 5783)**, which matches the publishers ([Yeshiva World, 9 Nov 2022](https://www.theyeshivaworld.com/news/promotions/2136727/talmud-yerushalmi-to-begin-new-cycle-of-daf-yomi-on-november-14-join-today.html), "11th cycle ... November 14th / כ חשון").
- Cycle 11 ends **2027-02-22 (15 Adar I 5787)**, and cycle 12 starts 2027-02-23. These two are computed.
- Every cycle is 1,562–1,563 calendar days long.

**Verification.**

| Date | Yerushalmi (Vilna) | Source |
|---|---|---|
| 2026-10-21 | Sanhedrin 2 | Sefaria calendars API ("Yerushalmi Yomi") |
| 2011-12-04 | Yoma 22 (Yoma 28 on 12-10) | [dafyomi.co.il ymi72-11](https://dafyomi.co.il/calendars/yomi/ymi72-11.htm) |
| 2025-08-03 (9 Av 5785) | no daf; Ketubot 37 on 08-02, Ketubot 38 on 08-04 | dafyomi.co.il chart; Sefaria |
| 2026-06-21 | Bava Metzia 6 | [dafyomi.co.il ymi86-40](https://dafyomi.co.il/calendars/yomi/ymi86-40.htm) |

All 1,421 chart days from 2022-09-25 to 2026-09-05 match, including the 8 skip days.

**Verdict: derivable.**

### 2b. Schottenstein (Oz Vehadar pagination) cycle

**Facts.**
- It began **2022-11-14 (20 Cheshvan 5783)**, with calendars "based on the Oz V'hadar page layout as used in the Schottenstein Edition" (Yeshiva World, above). It runs alongside the Vilna cycle and is the one ArtScroll, Dirshu ("Kinyan Yerushalmi") and the OU's AllDaf follow.
- It has **no skipped days**. Kilayim runs 84 consecutive days through Yom Kippur 5784, and Yevamot runs 88 consecutive days through Rosh Hashanah and Yom Kippur 5787.
- Secondary listings of ArtScroll's calendar give the cycle as **14 Nov 2022 to 7 Aug 2028**, which is 2,094 days. The ArtScroll page itself returned 403.

**Known sizes, in cycle order:**
- Zeraim: Berakhot 94, Peah 73, Demai 77, Kilayim 84, Sheviit 87, Terumot 107, Maasrot 46, Maaser Sheni 59, Challah 49, Orlah + Bikkurim 68 together (split unknown).
- Moed: Shabbat 113, Eruvin 71, Pesachim 86, Shekalim 61, Yoma 57, Sukkah 33, Beitzah 49, Rosh Hashanah 27, Taanit 31, Megillah 41, Chagigah 28, Moed Katan 23.
- Nashim: Yevamot 88, Ketubot 77, Nedarim 42, Nazir 53, Sotah 52, Gittin 53, Kiddushin 53.
- Nezikin: Bava Kamma ?, Bava Metzia ?, Bava Batra ?, Sanhedrin 75, Shevuot ?, Avodah Zarah 34, Makkot 11, Horayot 18.
- Niddah ?.

Sources for these sizes:
- [ArtScroll Yerushalmi volume checklist](https://blog.artscroll.com/wp-content/uploads/2023/01/gemara-mishnah-checklists-2023.pdf) for folio ranges of multi-volume tractates.
- The dafyomi.co.il "Oz v'Hadar" row, where it exists (5783–5784 and 5786; the 5785 charts lack it).
- Dirshu's 5787 calendar for Yevamot through Kiddushin.

**Order.** The order follows ArtScroll's volume order, which differs from Vilna. In Moed it is Shabbat, Eruvin, Pesachim, Shekalim, Yoma, Sukkah, Beitzah, Rosh Hashanah, Taanit, Megillah, Chagigah, Moed Katan. In Nezikin, Sanhedrin comes before Shevuot. The Shekalim-to-Moed Katan order is observed; Shabbat to Pesachim is inferred from the volume numbering and day arithmetic.

**Unknowns.** Bava Kamma, Bava Metzia, Bava Batra, Shevuot and Niddah, and the Orlah/Bikkurim split. If the 2,094-day figure is right, BK + BM + BB + Shevuot + Niddah = 174.

**Verification.**

| Date | Yerushalmi (Oz Vehadar) | Source |
|---|---|---|
| 2023-04-04 to 04-15 | Peah 48–59 | [ArtScroll blog, 3 Apr 2023](https://blog.artscroll.com/2023/04/03/free-yomi-downloads/) |
| 2026-06-21 | Chagigah 3 | dafyomi.co.il ymi86-40 |
| 2026-10-21 | Yevamos 74 | Dirshu 5787 calendar |
| 2027-10-01 | Bava Kamma 1 | Dirshu 5787 calendar |

**Verdict: needs the published table** (ArtScroll/Dirshu calendar) for the five missing lengths and the Orlah/Bikkurim split. Everything else is structural.

## 3. Mishnah Yomis

**Facts.**
- Founded by R' Yonah Sztencl, 1948 ([Wikipedia: Mishnah Yomis](https://en.wikipedia.org/wiki/Mishnah_Yomis)). Agudah traces the idea to 1933 ([agudah.org](https://agudah.org/join-mishnah-yomi)).
- Recent cycle starts on Wikipedia: 22 Tamuz 5770 (4 Jul 2010), 20 Adar II 5776 (30 Mar 2016), and **21 Teves 5782 (25 Dec 2021)**, the 14th cycle beginning with Berachos 1:1–2 ([Yeshiva World](https://www.theyeshivaworld.com/news/promotions/2044068/join-the-new-cycle-of-mishnah-yomi-beginning-this-shabbos.html), [ArtScroll blog](https://blog.artscroll.com/2021/12/17/mishnah-yomi-begins-soon-dont-miss-out-on-this-opportunity-and-artscrolls-fantastic-offer/)).
- The cycle is 2,096 days (4,192 mishnayot). The three Wikipedia dates are exactly 2,096 days apart.

**Unit.** Two mishnayot a day, every day, running straight across chapter and tractate boundaries, e.g. "Makos 3:16 – Shevuos 1:1" on 2025-02-09 ([ymi85-20](https://dafyomi.co.il/calendars/yomi/ymi85-20.htm)). There are no skips.

**Order and counts.** Standard Mishnah order with Sefaria's per-chapter counts ([api/shape/Mishnah](https://www.sefaria.org/api/shape/Mishnah)), 63 tractates, **4,192** mishnayot. Avot includes **chapter 6** (Kinyan Torah, 11 mishnayot): the day-by-day match through Avot proves it is learned. Per-chapter counts are in `mishnah.json`.

**Siyum and earlier cycles.**
- The 14th cycle ends **2027-09-20 (18 Elul 5787)**; the 15th begins 2027-09-21 (19 Elul 5787). Both are computed.
- Back-computing thirteen 2,096-day cycles gives 1947-05-20 (1 Sivan 5707) for cycle 1. This is **not confirmed**: no source gives the first start date, and early cycles may have run at a different pace.

**Verification.**

| Date | Mishnah Yomis | Source |
|---|---|---|
| 2026-10-21 | Oholot 11:6–7 | Sefaria calendars API |
| 2023-04-04 (to 04-15) | Pesachim 5:9 (to 8:3) | ArtScroll blog, 3 Apr 2023 |
| 2011-12-04 to 12-10 | Yoma 1:6 to 3:4 | dafyomi.co.il ymi72-11 |
| 2026-06-21 | Kelim 12:4–5 | dafyomi.co.il ymi86-40 |

All 1,421 chart days match, from Challah in 5783 to Kelim 28 in Elul 5786. Tohorot after Kelim has not yet been checked against a publisher.

**Verdict: derivable.**

## 4. Rambam yomi (Chabad) and Sefer HaMitzvos

**Facts.**
- Both tracks began **27 Nisan 5744 (29 April 1984)**. 2023-04-23 is exactly 42 × 339 = 14 × 1,017 days later, and both tracks restarted on that day (dafyomi.co.il rows and Sefaria).
- **3 chapters a day:** 339-day cycle = 4 intro days + 335 × 3 = 1,005 chapter units. Cycles began on 2023-04-23 (2 Iyar 5783, the 43rd), 2024-03-27, 2025-03-01 and **2026-02-03 (16 Shevat 5786, the 46th)**. The next begins **2027-01-08 (29 Teves 5787)**; the siyum is 2027-01-07.
- **1 chapter a day:** 1,017-day cycle = 12 intro days + 1,005 units. Cycles began on 2023-04-23 (15th) and **2026-02-03 (16th)**. The next begins **2028-11-16 (27 Cheshvan 5789)**.

**Intro days, 1-chapter track** (Chabad's published daily-study pages; checked against dafyomi.co.il):
1–3. Hakdamah in three parts.
4–6. Positive mitzvot 1–83, 84–166, 167–248.
7–9. Negative mitzvot 1–122, **123–244**, **245–365** and the closing paragraph.
10–12. "Minyan hamitzvos al seder hahalachos" in three parts: to the end of Nashim; Kedushah to the end of Korbanos; Taharah to the end of Shoftim.

Chabad's page for 30 Apr 2023 shows "Negative Commandments: Part 2", running from 123 to 244. Sefaria's calendar gives 123–245 / 246–365, so the intro needs Chabad's own table.

**Intro days, 3-chapter track:** (1) Hakdamah, (2) all positive mitzvot, (3) all negative mitzvot, (4) the listing by hilchos (Chabad's published daily-study page, 26 Apr 2023: "Listing of Mitzvot: Part 1–3").

**Chapter units.** These are the 83 hilchos in Sefaria's order with Sefaria's chapter counts (`rambam.json`; Sefaria counts 1,006 including the two special items), with two exceptions:
- **Seder Tefillos** (end of Sefer Ahavah): 5 units in the 3-chapter track, 4 days in the 1-chapter track (dafyomi.co.il rows for 5–8 Aug 2023; the 4th day runs "until the end of Sefer Ahavah").
- **Nusach HaHaggadah** (Sefaria's Chametz uMatzah ch. 9): its own day in the 1-chapter track (2023-10-05), but learned with ch. 8 and not counted in the 3-chapter track ("Chametz u'Matzah 8 – Shofar 2" on 2023-06-17).

Both tracks therefore have 1,005 units.

**Sefer HaMitzvos.**
- Chabad's "Daily Mitzvah" is numbered by the day of the **1-chapter** cycle. 2026-02-03 is "Day 1: Maimonides' Introduction to Sefer Hamitzvot", and 2026-10-21 is "Day 261" (P181, N309, N298, P184).
- Which mitzvot belong to each day is **a published table** (the mitzvot that correspond to that day's chapter). It cannot be derived from chapter counts.

**Verification.**

| Date | Track | Assignment | Source |
|---|---|---|---|
| 2026-10-21 | 3 chapters | Rotzeach uShmiras Nefesh 8–10 | Chabad's published daily-study page |
| 2026-10-21 | 1 chapter | Issurei Biah 2 | Chabad's published daily-study page |
| 2026-10-21 | Sefer HaMitzvos | Day 261 | Chabad's published daily-study page |
| 2026-06-21 | 1 / 3 chapters | Eruvin 1 / Maaser Sheni 11 – Bikurim 2 | dafyomi.co.il ymi86-40 |
| 2025-02-09 | 1 / 3 chapters | She'ar Avos haTumah 10 / Sanhedrin 22–24 | dafyomi.co.il ymi85-20 |

A sample of 110 dates from 2023 to 2026 also matched Sefaria, apart from the negative-mitzvot intro split.

**Verdict: derivable**, given the 4- and 12-day intro tables and the two special units. Sefer HaMitzvos content needs a table.

## 5. Nach Yomi (OU)

**Facts.**
- One chapter a day through Nevi'im and Ketuvim: 742 chapters (929 − 187), **742 days, no skips**.
- The first OU cycle began **1 November 2007** (Joshua 1) and was planned to end with II Chronicles 36 on 11 November 2009 ([OU news](https://www.ou.org/news/first_it_was_daf_yomi_now_its_nach_yomi_ou_webcast_of_a_biblical_cycle_to_b/)).
- 742-day steps from 2007-11-01 land exactly on 2024-02-01 and **2026-02-12 (25 Shevat 5786)**, the start of the current cycle. The 2026–28 cycle ends 2028-02-23 and the next begins 2028-02-24 (27 Shevat 5788).
- Sources: [OU calendar page](https://outorah.org/p/246875/) and its [PDF calendar](https://res.cloudinary.com/ouwp/images/v1768325263/ouredesign/main/WI-Nach-Yomi_2026-2028_v6/WI-Nach-Yomi_2026-2028_v6.pdf).

**Order.**
- Joshua, Judges, I–II Samuel, I–II Kings, Isaiah, Jeremiah, Ezekiel, and the Twelve.
- Then Psalms, Proverbs, Job, Song of Songs, Ruth, Lamentations, Ecclesiastes, Esther, Daniel, Ezra, Nehemiah, I–II Chronicles.
- This is Sefaria's Tanakh order. Chapter counts are from [api/shape/Tanakh](https://www.sefaria.org/api/shape/Tanakh).

**Verification.** All 735 rows parsed from the OU 2026–28 PDF matched the model. Examples:

| Date | Chapter |
|---|---|
| 2026-02-12 | Yehoshua 1 |
| 2026-10-21 | Yirmiyahu 39 |
| 2027-10-21 | Eicha 2 |
| 2028-02-23 | II Divrei Hayamim 36 |

**Verdict: derivable.**

Other programs exist and were not researched: 929 (one chapter Sunday–Thursday, including the Torah) and the Tanakh Yomi in Sefaria's calendar (by seder).

## 6. Chofetz Chaim yomi and Shemiras HaLashon yomi

**Facts.**
- The daily Sefer Chofetz Chaim schedule is keyed to the **Hebrew date** and runs **three times a year**.
- Restart dates, from 1,421 days of dafyomi.co.il rows labelled "Chafetz Chayim [4 month cycle]":
  - Common years (5783, 5785, 5786): 1 Tishrei, 1 Shevat and 1 Sivan.
  - The leap year 5784: 1 Tishrei, **11 Shevat** (the Chofetz Chaim's birthday) and **20 Iyar**.
- A 2011 blog describes the same leap-year shift ([gematriot.blogspot.com](http://gematriot.blogspot.com/2011/01/96-shofar-of-sefarim.html)).
- The same Hebrew date gives the same lesson in 5783, 5785 and 5786. 5784 differs throughout, so there is a separate leap-year table.
- Cycle lengths are 118 or 119 days in common years and 127–128 days in leap years. That means the table also has rules for short Cheshvan and Kislev.
- The CCHF "Daily Companion" numbers its entries Day N "based on The SH Yomi Calendar": Day 19 = 1 Oct 2026, Day 38 = 20 Oct 2026 ([cchf.global/daily-companion](https://cchf.global/daily-companion/)).
- CCHF also publishes "Shmiras Haloshon yomi". The dafyomi.co.il rows are the halachos of Sefer Chofetz Chaim (Hakdamah, Lavin, Asin, Hilchos Lashon Hara and Rechilus kelalim, Tziyurim).

**Not established.**
- The full lesson-by-date table (common and leap).
- How 30 Cheshvan and 30 Kislev are handled.
- Whether the *Shemiras HaLashon* (mussar) text has its own Hebrew-date yomi schedule. Sources conflict, and none was found from CCHF itself.

**Verification.**

| Date | Lesson | Source |
|---|---|---|
| 1 Nisan, common year (2023-03-23, 2025-03-30, 2026-03-19) | Hilchos Lashon Hara kelal 7:9 | dafyomi.co.il |
| 1 Nisan 5784 (2024-04-09, leap year) | kelal 10:5–6 | dafyomi.co.il |
| 2026-06-21 | Hilchos Lashon Hara kelal 3:1–2 | dafyomi.co.il |

**Verdict: needs a published table** (common-year and leap-year versions). Licence status of the CCHF/ArtScroll tables is unknown, so treat them as copyrighted.

## 7. Tanya yomi (Chabad)

**Facts.**
- The daily Tanya cycle "begins and ends on 19 Kislev" (Chabad's own explanation of the program, "What Is Chitas?").
- There are **two tracks**: an ordinary-year track with slightly longer portions, and a leap-year track with smaller portions so the cycle lasts an extra month. The leap track continues "several months after the leap year has concluded", meaning until the next 19 Kislev.
- Portions are assigned to Hebrew dates (as in Hayom Yom). On 10 Cheshvan 5787 (2026-10-21) Sefaria gives Iggeret HaKodesh 26.
- 5787 is a leap year, so the leap track applies from 19 Kislev 5787 to 18 Kislev 5788.

**Not established.** The day-by-day table and how missing 30 Cheshvan / 30 Kislev days are handled.

**Verdict: needs a published table** (two tracks). It cannot be derived from Tanya's chapter structure.

## 8. Halacha yomis: Mishnah Berurah programs

### 8a. Dirshu Daf HaYomi B'Halacha (DHB)

**Facts.**
- "1 page of Mishnah Berurah daily, Sunday–Thursday; Friday and Shabbos are reserved for chazara". It is a seven-year cycle with two tracks (Track 2 adds Biur Halacha and Sha'ar HaTziyun) ([dafhalacha.com/about-dhb](https://dafhalacha.com/about-dhb/)).
- **The unit is one amud**: the luach shows a "." or ":" side each day, e.g. קסט: on 23 Sept 2025, then קע. on 24 Sept.
- Yom Tov and fast days that fall on Sunday–Thursday **are** learning days (Rosh Hashanah, Yom Kippur and Sukkos 5786 all have pages).
- The pages follow the standard Mishnah Berurah pagination per chelek. Chelek 4 continues chelek 3's pagination: chelek 3 ends at 195b, chelek 4 begins at 196a, and chelek 4 began Sunday 7 Dec 2025.

**Current cycle.** The cycle began about a year before Chelek Aleph's siyum on 19 Nisan 5783 (10 Apr 2023) ([VIN, 9 Apr 2023](https://vinnews.com/2023/04/09/siyumim-on-chelek-aleph-of-mishnah-berurah-held-with-numerous-gedolei-yisroel-as-dirshus-daf-hayomi-bhalacha-set-to-complet/)). Back-computing from 2026 data gives 2022-02-14 (13 Adar I 5782) for chelek 1 2a, with the last amud of chelek 1 on 2023-04-09. That is one day off the reported siyum, so the **exact start is not confirmed**.

**Irregular days.** The luach has occasional irregular days. On 2026-11-15 (5 Kislev 5787) it assigns "ל. לא.", i.e. more than one amud, after which a naive one-amud rule is off by one.

**Verification.**

| Date | DHB | Source |
|---|---|---|
| 2026-10-21 | MB 21b (chelek 5), siman 446:2–4 | Dirshu 5787 calendar |
| 2026-06-21 | chelek 4, 266a | dafyomi.co.il |
| 2025-09-23 | 169b, siman 329:1–3 | Dirshu luach 5786 |

**Verdict: approximate rule (one amud Sun–Thu) but needs Dirshu's luach** for exact pages and for the siman ranges each day.

### 8b. Mifal Shonei Halachos (Mishnah Berurah, five-year cycle)

**Facts.**
- One amud **every day**, with the same pagination. All 1,421 chart days matched.
- Standard pagination per chelek (`mishnah-berurah.json`): chelek 1 2a–151b, chelek 2 2a–154b, chelek 3 2a–195b, chelek 4 196a–289b, chelek 5 2a–153a, chelek 6 2a–? (end not reached by the data).
- Back-computed start: **2022-02-08 (7 Adar I 5782)**. Not confirmed by the organisers.

**Verification.**

| Date | Mifal Shonei Halachos | Source |
|---|---|---|
| 2026-06-21 | chelek 6, 55b | dafyomi.co.il |
| 2025-02-09 | chelek 4, 247b | dafyomi.co.il |
| 2026-03-06 | chelek 6, 2a | dafyomi.co.il |

### Not established
- The **OU "Halacha Yomis"** is a daily Q&A feature, not found to follow a fixed text cycle.
- Sefaria's "Halakhah Yomit" (Shulchan Aruch Orach Chaim; 279:7–280:2 on 2026-10-21) and "Arukh HaShulchan Yomi" have no publisher identified here.
- dafyomi.co.il also lists "Halachah Yomis (Shulchan Aruch, Orach Chayim) [4 yr. cycle]" and a Kitzur Shulchan Aruch track. Their sponsors and start dates were not researched.

## 9. Daf HaShavua

**Facts.**
- One daf a week in Daf Yomi order. The program "started in Passaic … with Berachot in 2005". As of October 2018, Teaneck groups were finishing Taanit, with Megillah beginning October 6 ([Jewish Link, 4 Oct 2018](https://jewishlink.news/learn-talmud-with-daf-hashavua/)).
- Sefaria's "Daf a Week" changes on **Sunday**: Nazir 13 on Shabbos 2026-10-17, Nazir 14 from Sunday 10-18 to Shabbos 10-24.
- Back-computing over 1,128 weeks gives an epoch of **Sunday 2005-03-06 (25 Adar I 5765)**. That puts Megillah 2 on Sunday 2018-10-07, a day from the Jewish Link's "October 6" (Shabbos), so groups may start the week on Shabbos.
- A full cycle is 2,711 weeks, about 52 years; the current cycle ends in 2057.
- Other "daf a week" programs exist (Drisha / Fuchsberg Center "Daf Shevui", Rabbi Joshua Kulp) on their own schedules.

**Verdict: derivable from `bavli.json`, but the epoch and week boundary have low confidence.** There is no publisher calendar; confirm with the organisers before shipping.

## 10. Amud HaYomi (Dirshu)

**Facts.**
- Dirshu launched Amud HaYomi on Rosh Chodesh Cheshvan 5784 ([Yeshiva World](https://www.theyeshivaworld.com/news/general/2218521/r-2.html)).
- Dirshu's first luach shows **Berachos 2a on 10/16/23 (1 Cheshvan 5784)**, then 2b on 10/17 ([Dirshu luach 5784](https://amudhayomi.com/wp-content/uploads/2023/10/Dirshu-Luach-3.5-X-5-10-12-2023-Single-Pages_compressed.pdf), p. 4).
- "Daily Amud / 7 Amudim weekly … Completion of Shas within 15 years."

**Unit and order.**
- One amud a day, Daf Yomi tractate order, from 2a to the last amud of each tractate. The last amud is the Sefaria amud count, e.g. Pesachim 121b, Shekalim 22b, Yoma 88a.
- **No days are skipped.** Rosh Hashanah 5786 had Pesachim 34a and 34b (23–24 Sept 2025), and Yom Kippur 5786 had Pesachim 38b.
- The handling of Kinnim, Tamid and Middot after Meilah 22a is not yet published. Meilah 22a falls on 2038-02-10, so it is not needed before then.

**Verification.**

| Date | Amud HaYomi | Source |
|---|---|---|
| 2023-10-16 | Berachos 2a | Dirshu luach 5784 |
| 2024-09-04 | Shabbos 101b | Dirshu luach 5785 |
| 2026-03-18 | Shekalim 2a | dafyomi.co.il |
| 2026-10-19 / 2026-10-21 | Sukkah 2a / Sukkah 3a | Dirshu 5787 calendar |

All days from 2024-09-04 to 2027-10-01 in Dirshu's luach matched (about 1,000 days), as did the dafyomi.co.il "Amud Yomi Bavli" rows.

**Verdict: derivable** (until 2038).

## What could not be established

- The Schottenstein Yerushalmi lengths of Bava Kamma, Bava Metzia, Bava Batra, Shevuot and Niddah, the Orlah/Bikkurim split, and confirmation of the 7 Aug 2028 end date from ArtScroll itself (artscroll.com returned 403).
- The first Mishnah Yomis cycle's start date.
- Chofetz Chaim and Tanya day-by-day tables, and whether Shemiras HaLashon has its own Hebrew-date yomi.
- The exact start dates of Dirshu Daf HaYomi B'Halacha and Mifal Shonei Halachos.
- Siman ranges per chelek of the Mishnah Berurah (in `mishnah-berurah.json` from general knowledge, flagged as unverified), and the last page of chelek 6.
- The Daf HaShavua organiser's own calendar, and whether its week starts on Shabbos or Sunday.
- Amud HaYomi's handling of Kinnim, Tamid and Middot.

## Sources

Publishers and programs:
- Dirshu Amud HaYomi luach 5784: https://amudhayomi.com/wp-content/uploads/2023/10/Dirshu-Luach-3.5-X-5-10-12-2023-Single-Pages_compressed.pdf
- Dirshu Amud HaYomi luach 5785: https://amudhayomi.com/wp-content/uploads/2024/10/Dirshu-Amud-HaYomi-Luach-FINAL-4.5-X-6.5-REDUCE-78-percent-9-17-24.pdf
- Dirshu Amud HaYomi luach 5786: https://amudhayomi.com/wp-content/uploads/2025/12/Dirshu-Amud-HaYomi-Luach-10-20-25-HR.pdf
- Dirshu full-size calendar 5787 (Daf Yomi, Amud HaYomi, Yerushalmi, DHB, Chaburas Shas): https://dafhalacha.com/wp-content/uploads/2026/09/Full-Size-Calendar-5787.pdf
- Dirshu DHB: https://dafhalacha.com/about-dhb/
- ArtScroll Yerushalmi checklist: https://blog.artscroll.com/wp-content/uploads/2023/01/gemara-mishnah-checklists-2023.pdf
- ArtScroll "Free Yomi Downloads": https://blog.artscroll.com/2023/04/03/free-yomi-downloads/
- OU Nach Yomi 2026–2028: https://outorah.org/p/246875/
- OU Nach Yomi 2007 launch: https://www.ou.org/news/first_it_was_daf_yomi_now_its_nach_yomi_ou_webcast_of_a_biblical_cycle_to_b/
- Chabad's published Rambam and Sefer HaMitzvos daily-study pages
- Chabad, "What Is Chitas?"
- CCHF Daily Companion: https://cchf.global/daily-companion/

Third-party calendars and reference works:
- Kollel Iyun Hadaf "Yomi" weekly charts (index per year): https://dafyomi.co.il/calendars/yomi/ymi-indx5786.htm (and 5783–5785, 5782)
- Kollel Iyun Hadaf Yerushalmi index: https://www.dafyomi.co.il/yeru/yeru_picker_daf.php
- Sefaria API: shape (https://www.sefaria.org/api/shape/Mishnah, /Bavli, /Tanakh, /Yerushalmi, per-hilchos Mishneh Torah), raw index (`alt_structs.Vilna`), and calendars (https://www.sefaria.org/api/calendars)
- Wikipedia: Daf Yomi, Siyum, Mishnah Yomis
- Yeshiva World on the Yerushalmi 11th cycle and Amud HaYomi launch; Jewish Link on Daf HaShavua; VIN on DHB Chelek Aleph; Steinsaltz Daf Yomi archive

## Correction (same day)

Sefer HaMitzvos follows the **three-chapter** cycle (339 days), not the one-chapter cycle:
Chabad's published daily-study page shows "Day 1: Maimonides' Introduction to Sefer Hamitzvot" on 1 Adar 5785
(1 March 2025), which began a three-chapter cycle but was day 679 of the one-chapter cycle.
The two cycles both
restarted on 2026-02-03, which is why 2026-10-21 is Day 261 in both.
