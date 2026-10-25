# Israeli official commemorations set by Hebrew date

Research date: 2026-10-21. This is clean-room research: no code from any other calendar or zmanim library was read.

Sources, in order of preference:
1. The statute text on Hebrew Wikisource (`he.wikisource.org`). The OpenLawBot project mirrors the official Reshumot text and quotes the "התקבל בכנסת ביום …" line.
2. Hebrew and English Wikipedia.
3. Ministry of Education portal (`pop.education.gov.il`).
4. News.

`knesset.gov.il` and `fs.knesset.gov.il` redirect to a geo-block page from this environment, so the Knesset PDFs could not be read directly.

## Weekday analysis

The "possible weekdays" notes below are my own arithmetic, not taken from a source. They rest on two facts:
- 1 Tishrei is only ever on Mon, Tue, Thu or Sat (לא אד"ו ראש).
- 15 Nisan is only ever on Sun, Tue, Thu or Sat (לא בד"ו פסח).

Use them to decide which moving rules can ever fire. The library tests should confirm them.

Moving-rule shorthand used below:
- **"first weekday after"** means `יום החול הראשון שאחרי אותו יום`.
- **"day-before clause"** means the date also moves when it falls on the day *before* a holiday, rest day or שבתון. In practice this catches Friday and Erev Yom Tov.

---

## 1. Sigd — `sigd`
- **Hebrew / English:** חג הסיגד / Sigd
- **Date:** 29 Cheshvan (כ״ט בחשוון).
- **Moving rule:** if 29 Cheshvan is Shabbat, observe on the preceding Thursday (27 Cheshvan). The law has no Friday rule.
  - Statute, s.1(א): "חל כ״ט בחשוון בשבת, יוחג חג הסיגד ביום חמישי שלפניו."
  - Possible weekdays: 29 Cheshvan = 1 Tishrei + 58 days, so the weekday shifts by +2. That gives Wed, Thu, **Sat** or Mon, so Friday is impossible and only the Shabbat rule ever fires (years where Rosh Hashanah is on Thursday).
  - The Friday-to-Thursday custom in Ethiopia was community practice and is not in the law (he.wikipedia "סיגד").
- **Status:** a "חג המדינה" and an optional day off (יום בחירה), per s.1(ב).
- **Law:** חוק חג הסיגד, התשס״ח-2008. Passed 27 Sivan 5768 (30 June 2008). Published ס״ח תשס״ח, 625.
  - https://he.wikisource.org/wiki/חוק_חג_הסיגד
- **First year as a state holiday:** 5769 (Nov 2008). Inferred from the passage date.
- **Confidence:** high.

## 2. Yom HaAliyah — `yom-haaliyah`
- **Hebrew / English:** יום העלייה / Aliyah Day
- **Date:** 7 Cheshvan (ז׳ בחשוון).
  - Statute, s.2(א): "יום העלייה יצוין מדי שנה ביום ז׳ בחשוון."
  - 10 Nisan appears **only** in the purpose clause (s.1), as the historical date of entry into the Land. The statute sets no observance on 10 Nisan.
  - English Wikipedia calls 10 Nisan the "national holiday" date and 7 Cheshvan the "schools" date. The statute text does not support that: 7 Cheshvan is the only operative date, and it applies to everyone (Knesset, government, President, schools, IDF, police; s.3).
  - Wikisource history shows no amendment since 2016.
- **Moving rule:** if 7 Cheshvan is Friday, observe on the preceding Wednesday (5 Cheshvan). The law has no Shabbat rule.
  - Statute, s.2(ב): "חל יום העלייה ביום שישי, יצוין יום העלייה ביום רביעי שלפניו."
  - Possible weekdays: 1 Tishrei + 36 days (+1) gives Tue, Wed, **Fri** or Sun. Shabbat is impossible, so only the Friday rule ever fires.
- **Law:** חוק יום העלייה, התשע״ו-2016. Passed 15 Sivan 5776 (21 June 2016).
  - https://he.wikisource.org/wiki/חוק_יום_העלייה
- **First year:** 5777 (Nov 2016). Inferred.
  - A grassroots Tel Aviv "Aliyah Day" ran from 2009 (en.wikipedia "Yom HaAliyah").
- **Library suggestion:** emit only 7 Cheshvan as `yom-haaliyah`. If you want 10 Nisan, make it an optional, non-statutory `yom-haaliyah-historical` entry.
- **Confidence:** high for the statute text. The 10 Nisan question is settled by the statute.

## 3a. Herzl Day — `yom-herzl`
- **Hebrew / English:** יום הרצל / Herzl Day
- **Date:** 10 Iyar (Herzl's birthday).
  - Statute, s.10(א): "אחת לשנה, בי׳ באייר, יום הולדתו של בנימין זאב הרצל, יקוים יום הרצל"
- **Moving rule:** if 10 Iyar is Shabbat, observe on the following Sunday.
  - Statute, s.10(ג): "חל י׳ באייר בשבת, יקוים יום הרצל ביום א׳ שלאחריו."
  - Possible weekdays: 15 Nisan + 24 days (+3) gives Wed, Fri, Sun or Tue. So 10 Iyar is **never Shabbat** and the rule never fires. Friday is possible, and the law has no Friday rule.
  - **Correction (2026-10-21, citation audit):** the line above is wrong. 10 Iyar is 25 days after 15 Nisan, so it falls on Thu, Sat, Mon or Wed. It is Shabbat whenever Pesach begins on Tuesday (10 Iyar 5784 was Saturday, 18 May 2024), and the Sunday rule does apply. The code was already right.
- **Second date in the same law:** a state memorial ceremony on 20 Tammuz (Herzl's yahrzeit).
  - Statute, s.10א(ב): "חל כ׳ בתמוז ביום שישי, יתקיים טקס הזיכרון הממלכתי ביום חמישי שלפניו."
  - 20 Tammuz is 15 Nisan + 94 days (+3), so it is never Shabbat but can be Friday. Friday moves it to Thursday 19 Tammuz.
  - Suggested id: `herzl-memorial`.
- **Law:** חוק בנימין זאב הרצל (ציון זכרו ופועלו), התשס״ד-2004. Passed 10 Tammuz 5764 (29 June 2004).
  - https://he.wikisource.org/wiki/חוק_בנימין_זאב_הרצל_(ציון_זכרו_ופועלו)
- **First year:** 5765 (2005). Inferred, because 10 Iyar 5764 had already passed when the law was enacted.
- **Confidence:** high.

## 3b. Ben-Gurion Day — `yom-ben-gurion`
- **Hebrew / English:** יום בן-גוריון / Ben-Gurion Memorial Day
- **Date correction:** the date is **6 Kislev**, not 6 Cheshvan. It is the date of his death (1 Dec 1973).
  - Statute, s.22(א): "ו׳ בכסלו, יום פטירתו של דוד בן־גוריון, יהיה יום זכרון ממלכתי"
- **Moving rule:** if 6 Kislev is Friday or Shabbat, observe on the following Sunday.
  - Statute, s.22(ב): "חל ו׳ בכסלו בערב שבת או בשבת, יקויים יום הזכרון ביום א׳ שלאחריו."
  - So Friday moves to Sunday 8 Kislev, and Shabbat moves to Sunday 7 Kislev.
  - Possible weekdays: 1 Tishrei + 64 or 65 days (+1 or +2, depending on Cheshvan length). Both Friday and Shabbat occur (years where Rosh Hashanah is on Thursday).
- **Law:** חוק דוד בן-גוריון, התשל״ז-1976. Passed 29 Cheshvan 5737 (22 Nov 1976).
  - https://he.wikisource.org/wiki/חוק_דוד_בן-גוריון
  - There are also implementing regulations: https://he.wikisource.org/wiki/תקנות_דוד_בן-גוריון_(יום_הזכרון)
- **First year:** 5737 or 5738. Unverified, because the law passed only 7 days before 6 Kislev 5737.
- **Confidence:** high for the rule, low for the first year.

## 3c. Jabotinsky Day — `yom-jabotinsky`
- **Hebrew / English:** יום זאב ז׳בוטינסקי / Jabotinsky Day
- **Date:** 29 Tammuz (date of his death).
  - Statute, s.10(א): "אחת לשנה, בכ״ט בתמוז, יום פטירתו של זאב ז׳בוטינסקי, יקוים יום זאב ז׳בוטינסקי"
- **Moving rule:** if 29 Tammuz is Shabbat, observe on the following Sunday.
  - Statute, s.10(ג): "חל כ״ט בתמוז בשבת, יקוים יום זאב ז׳בוטינסקי ביום א׳ שלאחריו."
  - Possible weekdays: 15 Nisan + 103 days (+5) gives Fri, Sun, Tue or Thu, so the rule **never fires**. he.wikipedia notes this too.
- **School observance:** 12 Tevet, with no moving rule.
  - Statute, s.11: "אחת לשנה, ביום י״ב בטבת יוקדש זמן בבתי הספר ללימוד פועלו…"
  - Suggested id: `jabotinsky-schools`.
- **Law:** חוק זאב ז׳בוטינסקי (ציון זכרו ופועלו), התשס״ה-2005. Passed 12 Adar II 5765 (23 Mar 2005).
  - https://he.wikisource.org/wiki/חוק_זאב_ז׳בוטינסקי_(ציון_זכרו_ופועלו)
- **First year:** 5765 (Aug 2005). Inferred.
- **Confidence:** high.

## 3d. Yitzhak Rabin Memorial Day — `yom-rabin`
- **Hebrew / English:** יום הזיכרון ליצחק רבין / Yitzhak Rabin Memorial Day
- **Date:** 12 Cheshvan (י״ב בחשון).
- **Moving rule:** if 12 Cheshvan is Friday or Shabbat, observe on the preceding Thursday.
  - Statute: "חל י״ב בחשון ביום ששי או בשבת, יקוים יום הזיכרון ביום חמישי שלפניו."
  - Possible weekdays: 1 Tishrei + 41 days (+6) gives Sun, Mon, Wed or **Fri**. Shabbat is impossible, so in practice Friday moves to Thursday 11 Cheshvan.
- **Law:** חוק יום הזיכרון ליצחק רבין, התשנ״ז-1997. Passed 3 Tammuz 5757 (8 July 1997).
  - https://he.wikisource.org/wiki/חוק_יום_הזיכרון_ליצחק_רבין
- **First year:** 5758 (Nov 1997). Inferred.
- **Confidence:** high.

## 3e. Family Day — `yom-hamishpacha`
- **Hebrew / English:** יום המשפחה / Family Day (formerly Mother's Day)
- **Date:** 30 Shevat (ל׳ בשבט). This is Hebrew-date based. It marks Henrietta Szold's death; she died on the night of 1 Adar 5705 (Feb 1945).
  - Shevat always has 30 days, so the date always exists.
- **Basis:** a Ministry of Education practice, not a law.
  - The ministry moved the date to 30 Shevat in the early 1970s and introduced a uniform nationwide observance in 1974.
  - It was renamed "Family Day" in the 1990s.
- **Moving rule:** none is documented.
- **Source:** he.wikipedia "יום המשפחה" — https://he.wikipedia.org/wiki/יום_המשפחה
- **Confidence:** medium. It is an informal or educational day; do not label it "statutory".

## 3f. Hebrew Language Day — `yom-halashon-haivrit`
- **Hebrew / English:** יום השפה העברית (also יום העברית) / Hebrew Language Day
- **Date:** 21 Tevet (Eliezer Ben-Yehuda's birthday).
- **Basis:** government decisions.
  - The day was set on 18 Nov 2012.
  - An earlier decision, no. 1183, is dated 3 Jan 2010.
  - Marked in activities since 5775 (2015).
- **Moving rule:** discretionary. If 21 Tevet falls on a weekend ("באחד מימי סוף השבוע") or there is another reason, the Minister of Culture and Sport recommends another nearby date.
  - This cannot be computed deterministically. Suggest emitting 21 Tevet and flagging it as "may move".
- **Source:** https://he.wikipedia.org/wiki/יום_השפה_העברית
- **Confidence:** medium.

## 3g. Chag HaBanot — `chag-habanot`
- **Hebrew / English:** חג הבנות (עיד אל-בנאת) / Festival of the Daughters
- **Date:** Rosh Chodesh Tevet. The Ministry of Education portal specifies **1 Tevet**: "מצוין בראש חודש טבת (א׳ בטבת)".
  - Customarily the gathering happens around the 7th Hanukkah candle. When Kislev has 30 days, the 7th candle is lit on the evening that begins 1 Tevet (in a short Kislev it begins 2 Tevet).
- **Status:** an **ethnic custom**, not an official Israeli day. There is no law or government decision.
  - Communities: Tunisia, Djerba, Libya, Algeria, Morocco, Greece/Salonika, Turkey.
  - he.wikipedia classes it under "מועדי עדות".
- **Sources:**
  - https://pop.education.gov.il/maagal_hashana/hagim_yamim_meyuchadim/hag-habanot
  - https://he.wikipedia.org/wiki/חג_הבנות
- **Library suggestion:** put it under a "customs" category, not "Israel official".
- **Confidence:** high that it is not official; medium on 1 Tevet as the canonical day.

## 3h. Ethiopian Jews who died on the way to Israel — `yom-zikaron-yehudei-etiopia`
- **Hebrew / English:** יום הזיכרון ליהודי אתיופיה שנספו בדרכם לישראל / Memorial Day for Ethiopian Jews who perished on the way to Israel
- **Date:** 28 Iyar, the same day as Jerusalem Day.
  - MoE text: "בכ״ח באייר מציינת מדינת ישראל את יום הזיכרון…"
- **Basis:** a government or ministerial-committee decision, not a law.
  - In 2003 the Ministerial Committee on Aliyah and Absorption decided to build the memorial site at Mount Herzl (inaugurated 2007), and the state ceremony was tied to Jerusalem Day.
  - The first (unofficial) ceremony was held in 1986.
  - One secondary source claims Knesset legislation but gives no date. I found no law on Wikisource.
- **Moving rule:** none is documented. It presumably follows the observed Jerusalem Day; that is unverified.
- **Sources:**
  - https://he.wikipedia.org/wiki/יום_הזיכרון_ליהודי_אתיופיה_שנספו_בדרכם_לישראל
  - https://en.wikipedia.org/wiki/Memorial_Day_for_Ethiopian_Jews
  - https://pop.education.gov.il/maagal_hashana/hagim_yamim_meyuchadim/yom-zikaron-yehudei-ethiopia/
- **Confidence:** high on the date, low on the legal basis and moving rule.

## 3i. Yemenite aliyah and those who died on the way — `yom-aliyat-yehudei-teiman`
- **Hebrew / English:** יום לציון עליית יהודי תימן לישראל ולהנצחת זכרם של הנספים בדרך לישראל / Day marking the aliyah of Yemenite Jews and commemorating those who perished on the way
- **Date:** 15 Kislev (ט״ו בכסלו), per statute s.1(א).
- **Moving rule:** the date moves to the **Sunday of the following week** ("ביום ראשון בשבוע שלאחר מכן") when 15 Kislev falls on:
  - a holiday, rest day or שבתון;
  - a memorial day or state commemoration day;
  - or the day before any of these.
  - Possible weekdays: 1 Tishrei + 73 or 74 days (+3 or +4) gives Thu/Fri, Fri/Sat, Sun/Mon or Tue/Wed. Friday goes to Sunday 17 Kislev and Shabbat to Sunday 16 Kislev.
- **Law:** passed 6 Shevat 5785 (4 Feb 2025).
  - https://he.wikisource.org/wiki/חוק_יום_לציון_עליית_יהודי_תימן_לישראל_ולהנצחת_זכרם_של_הנספים_בדרך_לישראל
- **First year:** 5786 (Dec 2025). Inferred.
- **Confidence:** high.

## 3j. Fallen of Israel's wars whose burial place is unknown — `yom-zikaron-nifalim-lo-noda-kvuram`
- **Hebrew / English:** יום הזיכרון לחללי מערכות ישראל שמקום קבורתם לא נודע / Memorial Day for fallen soldiers whose burial place is unknown
- **Date:** 7 Adar, the traditional date of Moses' death, "ולא ידע איש את קבורתו".
  - In a leap year it falls on **7 Adar II**: "בשנה מעוברת מצוין … בז׳ באדר ב׳".
- **Basis:** set by the IDF Military Rabbinate. It is not a law. The state ceremony is held at the Garden of the Missing on Mount Herzl.
- **Moving rule:** none is documented.
  - Possible weekdays: 7 Adar = Purim − 7, so it falls on the same weekday as Purim: Sun, Tue, Thu or Fri. It is never Shabbat.
- **Source:** https://he.wikipedia.org/wiki/יום_הזיכרון_לחללי_מערכות_ישראל_שמקום_קבורתם_לא_נודע
- **Confidence:** high on the date and Adar II, low on the moving rule.

## 4. October 7 / Simchat Torah massacre memorial day — `yom-zikaron-7-oktober`
- **Hebrew / English:** יום הזיכרון הממלכתי לטבח ולגבורה בכ״ב בתשרי – 7 באוקטובר / State Memorial Day for the massacre and heroism of 22 Tishrei – October 7
  - Earlier government name: יום הזיכרון לחללי מלחמת חרבות ברזל (Iron Swords War Memorial Day).
- **Date:** **24 Tishrei**. It is not 22 Tishrei: the attack was on Simchat Torah (22 Tishrei) and 23 Tishrei is Isru Chag.
  - Statute, s.3(א): "כ״ד בתשרי הוא יום זיכרון ממלכתי לטבח ולגבורה בכ״ב בתשרי – 7 באוקטובר."
- **Moving rule (statute):** the date moves to the first weekday after when it falls on a holiday, rest day or שבתון, or on the day before one of these.
  - Statute, s.3(ג): "חל כ״ד בתשרי ביום חג, מנוחה או שבתון או ביום שלפני אחד הימים כאמור, יצוין יום הזיכרון ביום החול הראשון שאחרי אותו יום."
  - Possible weekdays: 1 Tishrei + 23 days (+2) gives Wed, Thu, **Sat** or Mon. Friday is impossible and 25 Tishrei is never a holiday.
  - So the effective rule is: **Shabbat moves to Sunday 25 Tishrei**. Example: 5785, when 24 Tishrei was Shabbat 26 Oct 2024 and the day was held on Sunday 27 Oct 2024.
  - The government decision of 17 Mar 2024 already had the same effective rule: "כאשר כ״ד בתשרי חל בשבת, יחול יום הזיכרון למחרת, ביום ראשון, כ״ה בתשרי".
- **Rejected earlier draft:** an older private bill said a Friday or Shabbat date would move to the preceding Thursday (ynet). This was not enacted, and it would have collided with Shemini Atzeret.
- **Other dates in the law:** s.4(ב)(11) lets the Memorial Authority also mark 7 October (Gregorian) at its discretion. This is not a fixed state day.
- **Basis:**
  1. Government Decision 1525 of the 37th Government, 17 Mar 2024: "קביעת אירועי הזיכרון הלאומי השנתיים לציון מלחמת חרבות ברזל".
     - First observance: 24 Tishrei 5785, moved to Sunday 25 Tishrei / 27 Oct 2024.
     - There was also a one-time Gregorian ceremony on 7 Oct 2024.
  2. **Statute:** חוק זיכרון הטבח והנצחת הגבורה ביום כ״ב בתשרי (שמחת תורה) – 7 באוקטובר.
     - Passed in the 2nd and 3rd readings at about 04:40 on Friday **3 Av 5786 (17 July 2026)**, in the dissolution session of the 25th Knesset.
     - The law also creates a Memorial Authority.
     - A ynetnews 25th-Knesset review claimed the law never got final approval. The Wikisource text, which shows a passage line, plus ynetnews "At the last minute…" and JPost 17 Jul 2026, contradict that.
     - The year suffix (התשפ״ו-2026) is inferred; no Sefer HaChukim reference was visible.
  - **First statutory year:** 5787. 24 Tishrei 5787 = Monday 5 Oct 2026, so no move.
- **Sources:**
  - https://he.wikisource.org/wiki/חוק_זיכרון_הטבח_והנצחת_הגבורה_ביום_כ"ב_בתשרי_(שמחת_תורה)_–_7_באוקטובר
  - https://he.wikipedia.org/wiki/יום_הזיכרון_לחללי_מלחמת_חרבות_ברזל
  - https://en.wikipedia.org/wiki/Iron_Sword_War_Memorial_Day
  - https://www.ynetnews.com/article/bka6dvpezl
  - https://www.jpost.com/israel-news/politics-and-diplomacy/article-902816
  - Committee draft, 3 Jun 2025, which already had the "first weekday after" wording: https://oknesset.org/meetings/2/2/2231589.html
- **Confidence:** high on 24 Tishrei and Shabbat-to-Sunday. Medium-high on the enactment, since the Knesset site itself was not accessible.

---

## Additional Hebrew-date statutory days found (not in the brief)

| id | Hebrew | Date | Moving rule (verbatim gist) | Law / passed | Possible weekdays (derived) | Conf. |
|---|---|---|---|---|---|---|
| `yom-zeevi` | יום הזיכרון לרחבעם זאבי | 30 Tishrei | Friday → preceding Thursday ("חל ל׳ בתשרי ביום שישי, תוקדם … ליום חמישי שלפניו") | חוק להנצחת זכרו של רחבעם זאבי, התשס״ה-2005; 4 Tammuz 5765 (11 Jul 2005) — [wikisource](https://he.wikisource.org/wiki/חוק_להנצחת_זכרו_של_רחבעם_זאבי) | Tue, Wed, Fri, Sun; never Shabbat | high |
| `yom-begin` | יום להנצחת זכרו של מנחם בגין | 4 Adar | Moves to the first weekday after if it falls on a holiday, rest day, שבתון, memorial day or state day, or the day before one (s.35א(ב), amended 5785) | חוק להנצחת זכרו של מנחם בגין, התשנ״ח-1998; 26 Adar 5758 (24 Mar 1998) — [wikisource](https://he.wikisource.org/wiki/חוק_להנצחת_זכרו_של_מנחם_בגין) | Thu, Sat, Mon, Tue (Shabbat → Sun 5 Adar). **Open:** the leap-year month. Begin died 4 Adar II 5752 (9 Mar 1992), but the law says "ד׳ באדר". | high (rule); low (leap year) |
| `yom-ovadia-yosef` | יום מרן הרב עובדיה יוסף | 3 Cheshvan | Shabbat → following Sunday | חוק להנצחת זכרו של מרן הרב עובדיה יוסף, התשפ״ה-2025; 27 Tevet 5785 (27 Jan 2025) — [wikisource](https://he.wikisource.org/wiki/חוק_להנצחת_זכרו_של_מרן_הרב_עובדיה_יוסף) | Fri, Sat, Mon, Wed | high |
| `yom-golda-meir` | יום גולדה מאיר | 8 Kislev | Moves to the first weekday after if it falls on a holiday, rest day, שבתון, memorial day or state day. **No day-before clause**, so Friday stays. | חוק להנצחת זכרה של גולדה מאיר; 3 Av 5786 (17 Jul 2026) — [wikisource](https://he.wikisource.org/wiki/חוק_להנצחת_זכרה_של_גולדה_מאיר) | 1 Tishrei + 66 or 67 days (+3 or +4) gives Thu/Fri, Fri/Sat, Sun/Mon or Tue/Wed; Shabbat → Sun 9 Kislev | high; first year 5787 |
| `yom-hashichrur-vehahatzala` | יום השחרור וההצלה מגרמניה הנאצית | 26 Iyar | **Discretionary:** if it falls on a holiday, rest day, שבתון, memorial or state day, or the day before or after one, "רשאית הממשלה לקבוע … סמוך ליום כ״ו באייר" | חוק יום השחרור וההצלה מגרמניה הנאצית, התשע״ח-2018; 22 Iyar 5778 (7 May 2018) — [wikisource](https://he.wikisource.org/wiki/חוק_יום_השחרור_וההצלה_מגרמניה_הנאצית) | Fri, Sun, Tue, Thu | high (date); the move is not computable |
| (Gregorian) | יום הניצחון על גרמניה הנאצית | 9 May | Holiday, rest day, etc. or the day before → Sunday of the following week. The Minister of Education may use 26 Iyar in some schools. | 2017 law, 3 Av 5777 (26 Jul 2017) — [wikisource](https://he.wikisource.org/wiki/חוק_יום_הניצחון_על_גרמניה_הנאצית) | n/a | high |
| `yom-hokara-ptzuei-tzahal` | יום ההוקרה לפצועי מערכות ישראל ונפגעי פעולות האיבה | 17 Kislev (the Hebrew date of 29 Nov 1947) | none documented | Government decision, July 2014 (news reports; text not seen) | — | medium |
| `yom-tel-chai` | יום תל חי | 11 Adar | not researched | No law found; state ceremony (he.wikipedia "חגי ישראל ומועדיו") | — | low |

**Checked and found to set no dated day:**
- חוק הנצחת זכרם של נשיאי ישראל וראשי ממשלותיה (1986)
- חוק המרכז להנצחת מורשת גוש קטיף וצפון השומרון (2008)
- חוק המועצה להנצחת מורשת יהדות ספרד והמזרח (2002)
- חוק להנצחת זכרו של הרב חיים דרוקמן (2025)

## Implementation notes

- **Rule shapes in these statutes:**
  - Shabbat → previous Thursday (Sigd).
  - Friday → previous Wednesday (Aliyah).
  - Friday or Shabbat → previous Thursday (Rabin).
  - Friday → previous Thursday (Ze'evi, Herzl 20 Tammuz).
  - Friday or Shabbat → next Sunday (Ben-Gurion).
  - Shabbat → next Sunday (Herzl, Jabotinsky, Ovadia Yosef).
  - "First weekday after a holiday, rest day or שבתון, optionally including the day before" (Oct 7, Begin; Golda without the day-before clause).
  - "Sunday of the following week" (Yemenite).
  - Government discretion (Liberation Day, Hebrew Language Day).
- **"יום ציון ממלכתי" collisions:** Begin, Golda and the Yemenite day also move when they land on another memorial or state day. Within this set no two fixed dates coincide, but a full implementation should check against the computed set.
- **Rules that never fire:** Herzl (10 Iyar) and Jabotinsky have Shabbat clauses that cannot trigger. Keep them for fidelity; tests can assert they never trigger.
