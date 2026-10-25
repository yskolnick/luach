# Modern Israeli days: rules and their history (2026-10-21)

The rules come from the Knesset laws as they stand now (the consolidated texts on Hebrew Wikisource,
which link each amendment's Sefer HaChukim PDF on fs.knesset.gov.il) and from one Knesset committee
protocol. fs.knesset.gov.il is geo-blocked from this environment, so I could not open the amendment
PDFs. Amendment *contents* are taken from the consolidated text, the committee protocol and secondary
sources, as noted.

Possible weekdays (fixed calendar; 15 Nisan falls only on Sun/Tue/Thu/Sat):

| Date | Possible weekdays |
|---|---|
| 27 Nisan | Sun, Tue, Thu, Fri |
| 5 Iyar | Mon, Wed, Fri, Sat |
| 28 Iyar | Mon, Wed, Fri, Sun |
| 24 Tishrei | Mon, Wed, Thu, Sat |

## 1. Yom HaShoah — יום הזכרון לשואה ולגבורה

**Rule (current law, §1):** 27 Nisan. "חל כ״ז בניסן בששי בשבוע, יקויים יום הזכרון בכ״ו בניסן של
אותה שנה; חל כ״ז בניסן בראשון בשבוע, יקוים יום הזכרון בכ״ח בניסן של אותה שנה." The day runs from
sunset of the evening before to nightfall.
→ Friday moves back to Thursday (26 Nisan); Sunday moves forward to Monday (28 Nisan).

**History:**
- **12 April 1951:** Knesset resolution fixing 27 Nisan ("יום השואה ומרד הגטאות"). No weekday rule.
- **8 April 1959:** חוק יום הזכרון לשואה ולגבורה, תשי״ט–1959 (ס״ח תשי״ט 112).
- **1961:** amendment (ס״ח תשכ״א 78), which touched §1. The 1997 committee protocol describes the
  1959 law as amended in 1961 "to make clear that it begins on the night of 27 Nisan, i.e. in the
  evening, and ends at nightfall", and adds closure of entertainment venues and cafés (§2א–2ג).
- **Friday → Thursday:** already in the law before 1997. In the 1997 committee meeting the legal
  adviser read §1 of the existing law: "אם חל יום הזיכרון ביום שישי בשבוע יקויים יום הזיכרון בכ"ו
  בניסן". The 1997 amendment text also replaces "כ"ז בניסן או כ"ו בניסן" with a three-date list, so
  the 26 Nisan option predates 1997. Hebrew Wikipedia places the Friday rule in the 1959 law. I could
  not confirm whether it was in the 1959 original or added in 1961. Either way it is in force from
  1959 or 1961.
- **Sunday → Monday: 1997.** Amendment No. 3 (ס״ח תשנ״ז 88). The government had brought a one-year bill
  (הוראת שעה) because 27 Nisan 5757 fell on Sunday 4 May 1997. On **11 March 1997** the Knesset
  Education Committee (protocol 62, 14th Knesset) turned it into a permanent rule. The first year the
  rule applied was **1997**: Monday 5 May 1997 (28 Nisan 5757). Hebrew Wikipedia: "כלל זה הוחל משנת
  תשנ"ז-1997".

**For the code:** `addModernIsraeli` applies both rules to every year from 1951.
- Before 1997, these years had 27 Nisan on a Sunday and were observed on Sunday: 1953, 1956, 1957,
  1960, 1963, 1966, 1967, 1970, 1973, 1980, 1983, 1984, 1987, 1990, 1993.
- Years from 1951 with 27 Nisan on a Friday: 1954 (before the 1959 law), 1974, 1977, 1981, 1994.

For historical accuracy:
- Sunday → Monday only from 1997.
- Friday → Thursday from 1959. 1954 is uncertain: it fell under the 1951 resolution alone.

Whether to keep the simple retroactive rule is left open.

## 2. Yom HaZikaron and Yom HaAtzmaut

**Yom HaAtzmaut rule (חוק יום העצמאות, תש״ט–1949, §1(ב)):** 5 Iyar.
- Shabbos → **3 Iyar** (Thursday).
- Friday → **4 Iyar** (Thursday).
- Monday → **6 Iyar** (Tuesday).

**Yom HaZikaron rule (חוק יום הזכרון לחללי מערכות ישראל, התשכ״ג–1963, §1(ב)):** 4 Iyar.
- 4 Iyar on Friday → **2 Iyar** (Wednesday).
- 4 Iyar on Thursday → **3 Iyar** (Wednesday).
- 4 Iyar on Sunday → **5 Iyar** (Monday).

The memorial day is always the day before Yom HaAtzmaut. The code's "atz.prev()" agrees with both
laws.

**History:**
- **1949:** Yom HaAtzmaut law (passed 12 April 1949), fixing 5 Iyar.
- **1950** (5 Iyar was Shabbos, 22 April 1950): per Hebrew Wikipedia, the law was amended (ס״ח תש״י 105)
  and the day was **postponed to Sunday, 6 Iyar**, with memorial events on Thursday. I have not
  confirmed this in a primary source. An independent calendar library shows 3 Iyar for 1950.
- **1951** (5 Iyar was Friday): second amendment (ס״ח תשי״א 109). Friday → Thursday 4 Iyar.
- **1954** (5 Iyar was Shabbos): third amendment (ס״ח תשי״ד 80). Shabbos → Thursday 3 Iyar. This is the
  current Fri/Sat rule.
- **Yom HaZikaron** was kept on the eve of Yom HaAtzmaut from 1951 by government decision, and became
  law in 1963. Its §1 was amended in 1981 (תשמ״א) and 2004.
- **Monday → Tuesday: 2004.** חוק יום הזכרון לחללי מערכות ישראל ויום העצמאות (תיקוני חקיקה), התשס״ד–2004
  (ס״ח תשס״ד 312) amended both laws. It was passed for 2004, when 5 Iyar 5764 was Monday 26 April
  2004, and first applied that year: Yom HaZikaron Monday 26 April and Yom HaAtzmaut Tuesday 27 April
  2004. **2004 confirmed.**
- 1998 had a one-off: Friday 5 Iyar 5758 was declared an extra day of rest for the jubilee (ס״ח תשנ״ח 180).

**For the code:** the Fri/Sat rule is applied from 1949. Historically:
- 1950 may have been Sunday 6 Iyar rather than Thursday 3 Iyar (unconfirmed).
- 1951–1953 match the code.
- The Shabbos → Thursday rule dates from 1954.

The Monday rule from 2004 is correct.

## 3. Yom Yerushalayim — יום ירושלים

**Rule:** 28 Iyar. **No moving rule.** חוק יום ירושלים, התשנ״ח–1998 (passed 23 March 1998; ס״ח תשנ״ח
180) declares 28 Iyar a state holiday and an optional day off (יום בחירה). It says nothing about
Friday or Sunday.
- 28 Iyar can fall on Friday, e.g. 2009, 2020, 2023 and 2026. In those years some municipal events
  (for example the flag dance) were held on Thursday, but the day itself was not moved. ynet 2009: "בחוק
  יום ירושלים אין כל התייחסות לסוגיית הקדמת החגיגות במקרה שכ"ח באייר חל ביום שישי".
- Halachic practice (Hallel and so on) stays on 28 Iyar, per the yeshiva.org.il responses.

**History:**
- Government decision of **12 May 1968**.
- First official observance: **28 Iyar 5728 = Sunday 26 May 1968**.
- Made law in 1998.

**For the code:** "28 Iyar from 1968, no move" is correct.

## 4. Memorial day for 7 October / Swords of Iron

**Name:**
- Government decision: "יום הזיכרון הלאומי לאסון 7 באוקטובר ולמלחמת חרבות ברזל" (Jewish Virtual
  Library: "Remembrance Day for the October 7 Disaster and the Swords of Iron War").
- Enacted law: **חוק זיכרון הטבח והנצחת הגבורה ביום כ״ב בתשרי (שמחת תורה) – 7 באוקטובר, התשפ״ו–2026**.
  The word "טבח" was restored after the PMO tried to drop it.
- Wikipedia's article name: "Remembrance Day for the Fallen of the Swords of Iron War".

**Rule:** **24 Tishrei**, two days after Shemini Atzeres/Simchas Torah (22 Tishrei; 23 Tishrei is
Isru Chag in Israel and Simchas Torah in the diaspora).
- 24 Tishrei falls only on Mon/Wed/Thu/Sat, so only Shabbos needs a rule.
- Under the government decision, Shabbos moves the ceremonies to **Sunday, 25 Tishrei**. This applied
  in 2024: 24 Tishrei 5785 = Shabbos 26 Oct 2024, ceremonies Sunday 27 Oct.
- A 2025 Education Committee draft moves the day to the next ordinary weekday when it falls on Shabbos
  or a rest day. That is Sunday again.
- I could not get the enacted text to confirm the final wording.

**History:**
- **17 March 2024:** government decision (unanimous), 24 Tishrei every year. A one-time extra state
  ceremony was held on the Gregorian date, 7 October 2024.
- **Law:** passed its second and third readings at 04:40 on a Friday in **July 2026**, just before the
  Knesset dissolved (ynet; Davar, updated 19.07.2026; Globes 07.10.2026: "עוגנה בחוק ביולי האחרון").
  Library of Congress Global Legal Monitor entry dated 2026-08-26.
- **Observances:**

  | Year | 24 Tishrei | Observed |
  |---|---|---|
  | 2024 | Shabbos 26 Oct | Sunday 27 Oct |
  | 2025 | Thursday 16 Oct | as is |
  | 2026 | Monday 5 Oct | as is |
  | 2027 | Monday 25 Oct | as is |
  | 2028 | Shabbos 14 Oct | → Sunday 15 Oct |

**For the code:** to add it, use `24 Tishrei, Shabbos → Sunday 25 Tishrei, from 5785 (2024)`, with
`modernIsraeli` and `optional` flags. Mark the Shabbos rule *as practised (2024 government decision)*
until the law's text is checked.

## Sources

- Hebrew Wikisource, consolidated texts with amendment lists and Knesset PDF links:
  [חוק יום הזכרון לשואה ולגבורה](https://he.wikisource.org/wiki/חוק_יום_הזכרון_לשואה_ולגבורה) ·
  [חוק יום העצמאות](https://he.wikisource.org/wiki/חוק_יום_העצמאות) ·
  [חוק יום הזכרון לחללי מערכות ישראל](https://he.wikisource.org/wiki/חוק_יום_הזכרון_לחללי_מערכות_ישראל) ·
  [חוק יום ירושלים](https://he.wikisource.org/wiki/חוק_יום_ירושלים)
- Knesset Education and Culture Committee, protocol 62, 11.03.1997 (14th Knesset), on the 1997
  Yom HaShoah amendment:
  [oknesset mirror (.doc)](https://production.oknesset.org/pipelines/data/committees/download_document_committee_session/files/23/4/8/483539.DOC)
- Amendment PDFs (geo-blocked here): Yom HaShoah 1961 `fs.knesset.gov.il/4/law/4_lsr_210130.pdf`,
  1997 `fs.knesset.gov.il/14/law/14_lsr_211388.pdf`; 2004 combined amendment
  `fs.knesset.gov.il/16/law/16_lsr_299641.pdf`; Yom Yerushalayim law `fs.knesset.gov.il/14/law/14_lsr_211498.pdf`
- Hebrew Wikipedia: [יום הזיכרון לשואה ולגבורה](https://he.wikipedia.org/wiki/יום_הזיכרון_לשואה_ולגבורה) ·
  [יום העצמאות](https://he.wikipedia.org/wiki/יום_העצמאות)
- English Wikipedia: [Yom HaShoah](https://en.wikipedia.org/wiki/Yom_HaShoah) ·
  [Iron Sword War Memorial Day](https://en.wikipedia.org/wiki/Iron_Sword_War_Memorial_Day)
- USHMM, [Days of Remembrance calendar](https://main.ushmm.org/remember/days-of-remembrance/resources/calendar)
- ynet 2009 on Yom Yerushalayim on a Friday: https://www.ynet.co.il/articles/0,7340,L-3718720,00.html
- yeshiva.org.il responses on Yom Yerushalayim on Friday: https://www.yeshiva.org.il/ask/19460 ,
  https://www.yeshiva.org.il/ask/19765
- Ministry of Education on the 1968 decision: https://pop.education.gov.il/tchumey_daat/moledet_hevra_ezrahut/yesodi/noseem_nilmadim/yom_yerushalaim/
- 7 October law: [ynet (Hebrew)](https://www.ynet.co.il/news/article/b148kppezg) ·
  [ynetnews](https://www.ynetnews.com/article/bka6dvpezl) · [Davar](https://www.davar1.co.il/689392/) ·
  [Globes](https://www.globes.co.il/news/article.aspx?did=1001558636) ·
  [Jewish Virtual Library](https://jewishvirtuallibrary.org/remembrance-day-for-the-october-7-disaster-and-the-swords-of-iron-war) ·
  [LoC Global Legal Monitor](https://www.loc.gov/item/global-legal-monitor/2026-08-26/israel-law-adopted-to-preserve-the-memory-of-the-october-7-2023-massacre-and-commemorate-heroism/) ·
  [Haaretz, 2024 decision](https://www.haaretz.com/israel-news/2024-10-14/ty-article/.premium/israels-govt-approves-national-day-of-mourning-for-october-7-attack-held-on-hebrew-date/00000192-877e-de5b-abf7-8f7e29290000) ·
  [Knesset committee draft 14.7.25](https://fs.knesset.gov.il/25/Committees/25_cs_sl_7666136.pdf) (geo-blocked here)
- Weekday tables computed with this library's `dist` build.
