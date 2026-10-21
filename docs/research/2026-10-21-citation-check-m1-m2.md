# Citation check, milestones M1–M2 (2026-10-21)

Scope: every halachic, Talmudic and Rambam citation in `src/calendar/*.ts`, `src/holidays/*.ts`,
`ROADMAP.md` and `DECISIONS.md`. Each one was checked against the text on Sefaria (Hebrew original,
with Sefaria's English where it exists). Verdicts:

- **CORRECT**: the source says what the comment says.
- **PARTLY**: the source is relevant, but the location, the attribution (Mechaber or Rema) or the
  wording needs fixing.
- **WRONG**: the source does not say what the comment says.

Sefaria URL pattern: `https://www.sefaria.org/<Ref>` (for example `Shulchan_Arukh,_Orach_Chayim.426.3`).
The API form `https://www.sefaria.org/api/texts/<Ref>?context=0` returns the same text as JSON.

Abbreviations: SA = Shulchan Aruch; OC = Orach Chaim; MB = Mishna Berura; MA = Magen Avraham;
KH = Rambam, Hilchos Kiddush HaChodesh.

## 1. Rambam, Hilchos Kiddush HaChodesh

| Location | Citation as written | Claim | Verdict | Correct reference / note | Source |
|---|---|---|---|---|---|
| year.ts:2–3; ROADMAP:26 | Rambam KH ch. 6–8 | Fixed-calendar rules | CORRECT | Ch. 6 covers the molad and the 19-year cycle, ch. 7 the dechiyos, ch. 8 the month lengths and year types. | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.6 |
| year.ts:15 | KH 6:2 | 1080 chalakim in an hour | CORRECT | "והשעה מחולקת לאלף ושמונים חלקים". | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.6.2 |
| year.ts:19 | KH 6:3 | Mean month = 29 d 12 h 793 p | CORRECT | "תשעה ועשרים יום ושתים עשרה שעות... ושבע מאות ושלשה ותשעים חלקים". | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.6.3 |
| year.ts:24 | KH 6:8 | Molad BaHaRaD (Monday night, 5 h 204 p) | CORRECT | "בליל שני חמש שעות בלילה ומאתים וארבעה חלקים, סימן להם בהר"ד". It is restated in 6:13. | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.6.8 |
| year.ts:28; ROADMAP:28 | KH 6:11 | Leap years are years 3, 6, 8, 11, 14, 17 and 19 of the cycle | CORRECT | Lists exactly these years. | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.6.11 |
| molad.ts:4; ROADMAP:27 | KH 6:2–8 | Molad arithmetic | CORRECT | 6:2–3 give the units, 6:5–7 the remainders and how to add them, 6:8 BaHaRaD. | same chapter |
| year.ts:82; ROADMAP:29 | KH 7:1–7 | The four dechiyos | CORRECT | 7:1–6 give the rules and 7:7 gives the reason for Lo ADU. 7:8 continues the reasoning; "7:1–8" would cover it all, but 7:1–7 is fine. | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.7 |
| year.ts:84 | 7:1 | Lo ADU Rosh | CORRECT | "אין קובעין ראש חדש תשרי לא באחד בשבת ולא ברביעי ולא בערב שבת... אד"ו". | …Month.7.1 |
| year.ts:85 | 7:2 | Molad zaken (noon or later) | CORRECT | "בחצי היום או למעלה מחצי היום". 7:3 adds the combined case: postponed to the next day, and if that day is ADU, postponed again. | …Month.7.2 |
| year.ts:86 | 7:4 | GaTaRaD: common year, Tuesday, 9 h 204 p or later → Thursday | CORRECT | "בשנה פשוטה... בליל שלישי תשע שעות ומאתים וארבעה חלקים... ג ט רד". 7:6 gives the 9 h 203 p boundary. | …Month.7.4 |
| year.ts:87 | 7:5 | BeTU'TaKPaT: year after a leap year, Monday, 15 h 589 p or later → Tuesday | CORRECT | "במוצאי העיבור... ביום שני... ט"ו שעות ותקפ"ט חלקים". | …Month.7.5 |
| year.ts:126; ROADMAP:30 | KH 8:5–6 | Year types chaserim / kesidran / shleimim | CORRECT | 8:5: fixed months (Tishrei full, Teves deficient, alternating from Teves). 8:6: Cheshvan and Kislev, with the names "שלמים / חסרים / כסדרן". Optional: 8:7–8 give the rule the code actually uses (type from the distance between consecutive Rosh Hashanas). | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.8.5-8 |
| months.ts:4–5 | Shemos 12:2; Rambam KH 1:1 ff. | Months counted from Nisan | CORRECT (loose) | KH 1:1 quotes Shemos 12:2 ("ראש חדשים") to show that the months are lunar; it does not number them. Acceptable as written. Nisan as "the first month" is explicit in Shemos 12:2 and Vayikra 23:5. | https://www.sefaria.org/Mishneh_Torah,_Sanctification_of_the_New_Month.1.1 |
| DECISIONS.md:57,60 | "the Rambam" | Rambam arithmetic is exact over the range | CORRECT | General reference; nothing specific to check. | — |

## 2. Anniversaries (src/calendar/anniversary.ts; ROADMAP:32)

| Location | Citation as written | Claim | Verdict | Correct reference / note | Source |
|---|---|---|---|---|---|
| anniversary.ts:9; ROADMAP:32 | "the Shulchan Aruch (Orach Chaim 55:10) gives Adar II" for a bar mitzvah | Born in Adar of a common year, bar mitzvah in a leap year → Adar II | **PARTLY** | The Adar II ruling is the **Rema's gloss** on 55:10 (citing Teshuvos Mahari Mintz §9): "ומי שנולד באדר ונעשה בר מצוה בשנת העיבור אינו נעשה בר מצוה עד אדר השני". The Mechaber's own text in 55:10 is the different case of 29 Adar I versus 1 Adar II with a common 13th year. | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.55.10 |
| anniversary.ts:10–11; ROADMAP:32 | Mechaber OC 568:7 Adar II; Rema Adar I, some keep both | Yahrzeit in Adar | CORRECT | Mechaber: "יתענה באדר ב'". Rema: "וי"א דיתענה בראשון... וכן המנהג להתענות בראשון מיהו יש מחמירין להתענות בשניהם". Not mentioned in the code: the Rema's exception, that if the death was in Adar II of a leap year, Adar II is kept (Terumas HaDeshen 294). Parallel: Rema YD 402:12. | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.568.7 |
| anniversary.ts:13–15 | (as built) | 30 Adar I → 30 Shevat in a common year | Supported | MB 568:42 (end): someone who died on the first day of Rosh Chodesh Adar II is observed in a common year "ביום א' דר"ח אדר ולא בכ"ט בו", i.e. 30 Shevat. MA 568:20 gives the mirror case. Cite **MB 568:42; MA 568:20**. | https://www.sefaria.org/Mishnah_Berurah.568.42 |
| anniversary.ts:16–21 | (as built, "firstAnniversary") | 30 Cheshvan/Kislev: keep the 30th when it exists; otherwise follow the first anniversary (29-day month → the 29th; 30-day month → the 1st of the next month) | Supported; cite **MA 568:20, MB 568:42** | MA 568:20: "ונ"ל דאם שנה ראשונה היא חסרה יקבע בכ"ט לחשון... אבל כששנה ראשונה היא ג"כ מלאה... יקבע היום בר"ח ולכן אף בשנים הבאים אחריהם אף שהם חסרים יקבע בר"ח". MB 568:42 brings it, notes that some later authorities say always Rosh Chodesh, and concludes "והעולם נוהגין כהמ"א". This is the source of the "first anniversary determines" rule. | https://www.sefaria.org/Magen_Avraham.568.20 |

## 3. Holidays and fasts (src/holidays/holidays.ts; ROADMAP HOL-*)

| Location | Citation as written | Claim | Verdict | Correct reference / note | Source |
|---|---|---|---|---|---|
| holidays.ts:69; ROADMAP:49 | SA OC 549:1, 550:3 | Tzom Gedalia 3 Tishrei; pushed to Sunday from Shabbos | CORRECT | 549:1 lists the four fasts, including "ג' בתשרי". 550:3: "כל ד' צומות הללו אם חלו להיות בשבת נדחין לאחר השבת". | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.550.3 |
| holidays.ts:105 | SA OC 550:3 and commentaries | Asarah B'Teves is never pushed off and can fall on Friday | CORRECT | The Rema on 550:3 ("ואם חלו בע"ש קורים... ויחל") treats a fast that falls on Friday, which in the fixed calendar can only be 10 Teves. | same |
| holidays.ts:117 | SA OC 685:1 | Shekalim: the Shabbos on or before Rosh Chodesh Adar (Adar II in a leap year) | **PARTLY** | 685:1 covers only Rosh Chodesh on Shabbos ("ר"ח אדר הסמוך לניסן שחל להיות בשבת"). The "Shabbos before" case is **685:5** ("חל ר"ח אדר... בתוך ימי השבוע ואפילו בע"ש מקדימין לקרות פרשת שקלים בשבת שלפניו"). Cite **685:1, 5**. | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.685.5 |
| holidays.ts:119 | SA OC 685:2 | Zachor: the Shabbos before Purim | **PARTLY** | 685:2 gives the reading. "The Shabbos before Purim" is stated in **685:5** ("כדי שתהא פרשת זכור בשבת הסמוכה לפורים מלפניה"). Cite **685:2, 5**. | …Orach_Chayim.685.2 |
| holidays.ts:121; ROADMAP:49 | SA OC 686:2 | Taanis Esther moves back to Thursday | CORRECT | "ואם חל פורים באחד בשבת מקדימין להתענות ביום חמישי". | …Orach_Chayim.686.2 |
| holidays.ts:131; ROADMAP:50 | SA OC 688:6 | Purim Meshulash | CORRECT | Megillah on Friday, Al HaNissim and "ויבא עמלק" on Shabbos, the seudah on Sunday. | …Orach_Chayim.688.6 |
| holidays.ts:133 | SA OC 685:1 | Parah = the Shabbos before HaChodesh; HaChodesh = on or before 1 Nisan | **WRONG** | 685:1 is Shekalim. Parah is **685:3** (the fourth Shabbos, 22 Adar, i.e. the week before HaChodesh) and HaChodesh is **685:4** (29 Adar, i.e. the Shabbos before 1 Nisan, or 1 Nisan itself when it is Shabbos). 685:6 gives the skipped weeks (זט"ו ב"ו ד"ד ובי"ו). Cite **685:3–4, 6**. | …Orach_Chayim.685.3 |
| holidays.ts:139 | SA OC 430:1 | Shabbos HaGadol | CORRECT | "שבת שלפני הפסח קורין אותו שבת הגדול". | …Orach_Chayim.430.1 |
| holidays.ts:141; ROADMAP:49 | SA OC 470:2 | Taanis Bechoros moves to Thursday when Erev Pesach is Shabbos | CORRECT | The Mechaber brings two opinions (Thursday, or no fast at all); the Rema rules like the first: "אבל יש לנהוג כסברא הראשונה". Optional: "SA OC 470:2 with Rema". | …Orach_Chayim.470.2 |
| holidays.ts:178 | SA OC 550:3; 552:10 | 17 Tammuz and 9 Av pushed to Sunday | CORRECT | The rule is in 550:3. 552:10 assumes it ("חל בשבת ונדחה לאחר השבת", about the seudah hamafsekes). | …Orach_Chayim.552.10 |
| holidays.ts:195–196 | Rema OC 581:1 | Leil Selichos: the Motzaei Shabbos before Rosh Hashana, or a week earlier if fewer than four days would remain | **PARTLY** | The Rema gives the rule as a weekday test: "ביום א' שלפני ר"ה ואם חל ר"ה ב' וג' אז מתחילין מיום א' שבוע שלפניו". The **four-day** reason is **MB 581:6** ("לכך צריך להשלים ד' ימים קודם ר"ה"). The code gives the same dates as the Rema. | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.581.1 ; https://www.sefaria.org/Mishnah_Berurah.581.6 |
| holidays.ts:213–214; ROADMAP:52 | SA OC 417, 284:7 (Mevorchim custom) | Shabbos Mevorchim; none before Tishrei | **PARTLY** | SA 417:1 is about women refraining from work on Rosh Chodesh. The Mevorchim custom, and the exception of Tishrei ("בכסה ליום חגנו"), is in **MA 417:1** and **MB 417:1**. Rema 284:7 mentions blessing the month only incidentally (some omit Av HaRachamim on Mevorchim). | https://www.sefaria.org/Mishnah_Berurah.417.1 |
| holidays.ts:216–218; ROADMAP:54 | MB 417 (Yom Kippur Katan) | Erev Rosh Chodesh; Friday/Shabbos → Thursday; not before Tishrei, Cheshvan, Teves, Iyar | **PARTLY** | **MB 417:4** (end) describes "סדר יוה"כ קטן" and the move: on Shabbos → Thursday; on Friday, those who say selichos fast Thursday and others fast Friday. The code always uses Thursday, the selichos-sayers' practice. The **month exclusions are not in MB or MA**. They are a printed-siddur and luach custom (Tishrei: Erev Rosh Hashana; Cheshvan: Tishrei is festive; Teves: Chanukah; Iyar: Nisan, and some lists differ). Keep "as practised" and cite **MB 417:4; MA 417:3**. | https://www.sefaria.org/Mishnah_Berurah.417.4 |
| holidays.ts:226; ROADMAP:54 | SA OC 492:1 | BeHaB: Mon/Thu/Mon after the first Shabbos of Cheshvan and of Iyar | **PARTLY** | 492:1 (Mechaber): Mon-Thu-Mon after Pesach and Sukkos, once Nisan and Tishrei have passed. The Rema adds "מיד... שאפשר". The "first Shabbos" detail is **MB 492:3**: "ומברכין בבהכ"נ בשבת הראשון שאחר ר"ח למי שיתענה בה"ב ואחר אותו שבת מתחילין". Cite **SA OC 492:1 with Rema; MB 492:3**. Note: MB says the first Shabbos *after* Rosh Chodesh, but the code's `d(m,1).onOrAfter(SHABBAT)` takes 1 Cheshvan/Iyar itself when it is Shabbos. Check this edge case against a printed luach. | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.492.1 ; https://www.sefaria.org/Mishnah_Berurah.492.3 |
| ROADMAP:47 | SA OC 496 | Yom Tov Sheni | CORRECT | 496: "דיני יום טוב שני של גליות". | …Orach_Chayim.496.1 |
| ROADMAP:48 | SA OC 429 (Isru Chag) | Isru Chag | CORRECT; make specific | **Rema 429:2**: "ונוהגין להרבות קצת באכילה ושתיה ביום אחר החג והוא אסרו חג". | …Orach_Chayim.429.2 |
| ROADMAP:49 | SA OC 549–550, 686:2, 470:2 | Fasts | CORRECT | See above. | — |
| ROADMAP:50 | SA OC 670–697; 688:6 | Chanukah/Purim | CORRECT | 670:1 is Chanukah from 25 Kislev; 697:1 is Purim Katan. | …Orach_Chayim.670.1 |
| ROADMAP:53 | SA OC 685 | Four parshiyos | CORRECT | See the 685 rows above. | — |
| ROADMAP:67 | Tur/SA OC 428:4 | Parsha order (Tzav before Pesach, etc.) | CORRECT | — | …Orach_Chayim.428.4 |
| ROADMAP:68 | SA OC 425, 428:8 | Special haftaros | CORRECT | 425 is Rosh Chodesh on Shabbos; 428:8 is the 3 haftaros of rebuke, 7 of consolation and 2 of repentance. | …Orach_Chayim.428.8 |
| ROADMAP:69 | SA OC 292:2 (Rema) | Pirkei Avos in summer | CORRECT | "אבל אומרים פרקי אבות בקיץ". | …Orach_Chayim.292.2 |
| ROADMAP:91 | SA OC 261, 443 | Candle lighting; chametz times | CORRECT | 261 is the time for lighting Shabbos candles; 443 is chametz after the sixth hour. | …Orach_Chayim.261.1 |
| ROADMAP:92 | SA OC 562 | End of fast | CORRECT | 562:1: until tzeis, three medium stars. | …Orach_Chayim.562.1 |
| omer.ts:4 | Vayikra 23:15–16 | Count from 16 Nisan for 49 days | CORRECT | "ממחרת השבת" read as the day after the first day of Pesach (Menachos 65b–66a). | https://www.sefaria.org/Leviticus.23.15-16 |

## 4. Tefillah (src/holidays/tefillah.ts)

| Location | Citation as written | Claim | Verdict | Correct reference / note | Source |
|---|---|---|---|---|---|
| tefillah.ts:67 | Arachin 10a | Days of full Hallel | CORRECT | R. Yochanan: 18 days in Israel (8 of Sukkos including Shemini Atzeres, 8 of Chanukah, the first day of Pesach, Shavuos); 21 in the diaspora. | https://www.sefaria.org/Arakhin.10a |
| tefillah.ts:67 | SA OC 422:2 | Half Hallel on Rosh Chodesh | CORRECT | "וקורים הלל בדילוג". | …Orach_Chayim.422.2 |
| tefillah.ts:67 | SA OC 488:1 | Full Hallel on the first day(s) of Pesach | CORRECT | "וגומרין ההלל". | …Orach_Chayim.488.1 |
| tefillah.ts:67 | SA OC 490:4 | Half Hallel on Chol Hamoed and the last days of Pesach | CORRECT | "כל הימים של חולו של מועד ושני ימים אחרונים... בדילוג". | …Orach_Chayim.490.4 |
| tefillah.ts:67 | SA OC 683:1 | Full Hallel all 8 days of Chanukah | CORRECT | "כל שמונת ימי חנוכה גומרין את ההלל". | …Orach_Chayim.683.1 |
| tefillah.ts:67 | (missing) | Full Hallel on Sukkos/Shemini Atzeres and Shavuos | **PARTLY** (incomplete) | Add **SA OC 644:1** ("וכן כל שמונת ימי החג") and **494:1** (Shavuos, "וגומרים ההלל"). | …Orach_Chayim.644.1 ; …494.1 |
| tefillah.ts:6, 76 | MB 131; SA OC 131:4–7 | Days without Tachanun | **PARTLY** | 131:4–5 are about mourners, a bris and a chasan, which are not modelled. The calendar list is **131:6–7**. Cite **SA OC 131:6–7 (with Rema); MB 131**. | …Orach_Chayim.131.6 |
| tefillah.ts:78 | SA OC 429:2 | No Tachanun all of Nisan | CORRECT | "אין נופלים על פניהם בכל חדש ניסן". Also 131:7. | …Orach_Chayim.429.2 |
| tefillah.ts:85 | Rema OC 581:3 | No Tachanun on Erev Rosh Hashana | **PARTLY** (attribution) | In 581:3 "אין נופלים על פניהם בערב ראש השנה" is the **Mechaber**; only "ואין תוקעין... (מנהגים)" is Rema. The Rema says the same in **131:6** ("וכן ערב ר"ה אפילו שחרית"). Cite **SA OC 581:3; Rema 131:6**. | …Orach_Chayim.581.3 |
| tefillah.ts:79–84 | (uncited) | Erev Yom Kippur through Sukkos; option to the end of Tishrei | Source to add | Erev Yom Kippur: Rema 131:6. "בין י"ה לסוכות": 131:7. Through the end of Tishrei is Ashkenazi custom (luach); no SA source. | — |
| tefillah.ts:86–89 | (uncited) | Sivan: Rosh Chodesh to Isru Chag, or to 12 Sivan | Source to add | **Rema 494:3** ("מתחילת ראש חודש סיון עד ח' בו דהיינו אחר אסרו חג"); Rema 131:7. **MB 131:36**: "ויש מקומות נוהגין שלא ליפול כל הששה ימים שאחר שבועות" (tashlumin), which is the 12 Sivan option. | https://www.sefaria.org/Mishnah_Berurah.131.36 |
| tefillah.ts:90–94 | (uncited) | Pesach Sheni, Lag BaOmer, 9 Av, Tu B'Av, Tu B'Shvat, Purim, Purim Katan | Source to add | Lag BaOmer, Tu B'Av, Tu B'Shvat, Purim: 131:6. Tisha B'Av: 131:7. Purim Katan: **SA OC 697:1**. Pesach Sheni is disputed (Sha'arei Teshuvah 131 omits it; Pri Megadim says it); cite as custom. | …Orach_Chayim.697.1 |
| tefillah.ts:97 | Rema OC 51:9 | Mizmor L'Sodah omitted on Shabbos/Yom Tov, Pesach, Erev Pesach, Erev Yom Kippur | CORRECT | "וא"א מזמור לתודה בשבת וי"ט... או בימי פסח... ולא בערב פסח... ולא בעיו"כ". Also Rema 429:2. | …Orach_Chayim.51.9 |

## 5. Seasonal (src/holidays/seasonal.ts; ROADMAP HOL-11..13)

| Location | Citation as written | Claim | Verdict | Correct reference / note | Source |
|---|---|---|---|---|---|
| seasonal.ts:4 | Eruvin 56a | Tekufos of Shmuel: 91 d 7½ h, 365¼-day year | CORRECT | "אין בין תקופה לתקופה אלא תשעים ואחד יום ושבע שעות ומחצה". | https://www.sefaria.org/Eruvin.56a |
| seasonal.ts:28; ROADMAP:57 | Taanis 10a; SA OC 117:1 | Israel: from Maariv of 7 Cheshvan | CORRECT | Mishna (10a), Rabban Gamliel: 7 Cheshvan. "אמר רבי אלעזר הלכה כרבן גמליאל". SA 117:1: "ובארץ ישראל מתחילין לשאול מליל ז' במרחשון". | https://www.sefaria.org/Taanit.10a ; …Orach_Chayim.117.1 |
| seasonal.ts:30–31 | SA OC 117:1 | Diaspora: Maariv of the 60th day after tekufas Tishrei, counting the tekufah day | CORRECT | "בתפלת ערבית של יום ס' אחר תקופת תשרי [ויום התקופה הוא בכלל הס']". Optional: add **Taanis 10a** (Chananya, halacha per Shmuel: 60 days after the tekufah). | same |
| seasonal.ts:53 | Taanis 2a; SA OC 114:1 | Mashiv haruach from Musaf of Shemini Atzeres to Musaf of the first day of Pesach | **PARTLY** | Taanis 2a (Mishna 1:1) gives only the start, R. Yehoshua's "from the last Festival day". The Musaf detail and the Pesach end are in **Mishna 1:2, Taanis 4b** (R. Yehuda: "ביום טוב הראשון של פסח הראשון מזכיר האחרון אינו מזכיר"). SA 114:1 is exact. Cite **Taanis 2a, 4b; SA OC 114:1**. | https://www.sefaria.org/Taanit.4b ; …Orach_Chayim.114.1 |
| seasonal.ts:56 | SA OC 117:1 | Tal umatar asked "until Musaf of the first day of Pesach" | **PARTLY** (wording) | 117:1: "ושואלין עד תפלת המנחה של ערב י"ט הראשון של פסח". The last request is Mincha of Erev Pesach, since there is no weekday Amidah on Yom Tov. The code's date test (`< pesach`) matches; only the comment is wrong. | …Orach_Chayim.117.1 |
| seasonal.ts:82; ROADMAP:58 | Berachos 59b; SA OC 229:2 | Birkas HaChama every 28 years; tekufah at the start of Tuesday night going into Wednesday; blessing Wednesday morning | CORRECT | Abaye: "לעשרים ושמונה שנין דהדר מחזור ונפלה תקופת ניסן בשבתאי באורתא דתלת נגהי ארבע". SA 229:2: "מכ"ח לכ"ח שנה והתקופה בתחלת ליל ד' כשרואה אותה ביום ד' בבקר". | https://www.sefaria.org/Berakhot.59b ; …Orach_Chayim.229.2 |
| seasonal.ts:135 | "Rabbeinu Yonah (cited in Beis Yosef OC 426); Rema OC 426:4" | Earliest Kiddush Levana at 3 days | **PARTLY / WRONG** | Rema 426:4 says only "אין מקדשין הלבנה תחת הגג"; it says nothing about 3 days, so that part is **WRONG**. The 3-day view is **Talmidei Rabbeinu Yonah** (on the Rif, Berachos ch. 4, Rif page 21a; page reference from secondary sources, check in print), brought by the Beis Yosef on 426, and **MB 426:20**: "ורוב האחרונים פליגי ע"ז ולדידהו עכ"פ לאחר ג' ימים מעל"ע מעת המולד... יש לברך". | https://www.sefaria.org/Mishnah_Berurah.426.20 |
| seasonal.ts:136 | "Shulchan Aruch OC 426:4 (kabbalistic practice)" | Earliest at 7 days | CORRECT (gloss loose) | 426:4: "אין מברכין עליה עד שיעברו שבעת ימים עליה". The Mechaber states it as law; the kabbalistic basis (R. Yosef Gikatilla, Sha'arei Orah) is in the Beis Yosef. | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.426.4 |
| seasonal.ts:139 | "Shulchan Aruch OC 426:3" | Latest = half the month from the molad (14 d 18 h 22 m 1⅔ s) | **WRONG (swapped)** | Half the mean month is the **Rema** on 426:3, citing Teshuvos Maharil: "ואין לקדש אלא עד חצי כ"ט י"ב תשצ"ג מן המולד". | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.426.3 |
| seasonal.ts:140 | "Rema OC 426:3 (citing Maharil)" | Latest = 15 full days from the molad | **WRONG (swapped)** | 15 days is the **Mechaber** on 426:3: "עד י"ו מיום המולד ולא י"ו בכלל". MB 426:17 counts it from the molad's moment: "משעת המולד מנינן ט"ו יום מעל"ע". | same; https://www.sefaria.org/Mishnah_Berurah.426.17 |
| ROADMAP:59 | SA OC 426:3–4; Rema | Kiddush Levana times | CORRECT (general) | — | — |

## Fixes needed

1. **seasonal.ts:139–140: swap the Kiddush Levana attributions.**
   - `halfMonth` source → `'Rema OC 426:3 (citing Teshuvos Maharil)'`
   - `fifteenDays` source → `'Shulchan Aruch OC 426:3 (until the 16th day from the molad, not inclusive; MB 426:17)'`
2. **seasonal.ts:135: the 3-day source.** Replace with
   `'Talmidei Rabbeinu Yonah (Berachos 21a in the Rif), cited in Beis Yosef OC 426; MB 426:20'`.
3. **seasonal.ts:136:** `'Shulchan Aruch OC 426:4 (Beis Yosef: kabbalistic source, R. Yosef Gikatilla)'`, or drop the parenthesis.
4. **holidays.ts:133:** `SA OC 685:1` → `SA OC 685:3–4 (and 685:6)`.
5. **holidays.ts:117:** `SA OC 685:1` → `SA OC 685:1, 5`. **holidays.ts:119:** `SA OC 685:2` → `SA OC 685:2, 5`.
6. **holidays.ts:196:** `(Rema OC 581:1)` → `(Rema OC 581:1; the four-day reason is MB 581:6)`.
7. **holidays.ts:226:** `(SA OC 492:1)` → `(SA OC 492:1 with Rema; MB 492:3)`. Also check the case where 1 Cheshvan or 1 Iyar is Shabbos: MB says "the first Shabbos after Rosh Chodesh".
8. **holidays.ts:216–217 (Yom Kippur Katan):** add `(MB 417:4; MA 417:3)`; the month exclusions stay "as practised".
9. **ROADMAP:52:** `SA OC 417, 284:7 (Mevorchim custom)` → `MA/MB 417:1 (Mevorchim; not before Tishrei); Rema 284:7`.
   **ROADMAP:54:** `SA OC 492; MB 417` → `SA OC 492:1, MB 492:3; MB 417:4`. **ROADMAP:48:** `SA OC 429` → `Rema OC 429:2`.
10. **anniversary.ts:9 and ROADMAP:32:** "the Shulchan Aruch (Orach Chaim 55:10) gives Adar II" → "the Rema (Orach Chaim 55:10, citing Mahari Mintz) gives Adar II". Also cite **MA 568:20 / MB 568:42** for the `firstAnniversary` rule and for 30 Adar I → 30 Shevat.
11. **tefillah.ts:85:** `(Rema OC 581:3)` → `(SA OC 581:3; Rema 131:6)`.
12. **tefillah.ts:76 and :6:** `SA OC 131:4–7` → `SA OC 131:6–7 (with Rema)`. Add `Rema 494:3; MB 131:36` for the Sivan option and `SA OC 697:1` for Purim Katan.
13. **tefillah.ts:67:** add `644:1, 494:1` (full Hallel on Sukkos/Shemini Atzeres and Shavuos).
14. **seasonal.ts:53:** `(Taanis 2a; SA OC 114:1)` → `(Taanis 2a, 4b; SA OC 114:1)`.
15. **seasonal.ts:56:** "until Musaf of the first day of Pesach (SA OC 117:1)" → "until Mincha of Erev Pesach (SA OC 117:1)".
