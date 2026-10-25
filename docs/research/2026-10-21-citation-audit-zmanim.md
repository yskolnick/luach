# Citation audit of the zmanim sources (2026-10-21)

A second, independent check of every `source` string in `src/zmanim/opinions.ts`, after the
first check recorded in `2026-10-21-zmanim-opinions.md`. Each source string was split into
single citations and duplicates merged: 67 citations covering every zman. Every primary text
was read in Hebrew on Sefaria. The record for each citation (status, link, the decisive words,
a note) is in `data/citation-audit-zmanim.json`; the sources page shows the result per zman.

| Status | Count | Meaning |
|---|---|---|
| verified | 37 | The passage was read and says what Luach claims. |
| imprecise | 12 | The passage is relevant but does not say exactly what was claimed. |
| wrong | 3 | The passage does not support the claim. |
| secondary-read | 8 | Only a modern work citing the source was read. |
| not-read | 7 | Nothing was found that could be read for this attribution. |

The mil lengths behind the minute-based opinions all check out: Shulchan Aruch OC 459:2
("רביעית שעה וחלק מעשרים", 18 minutes), Mishna Berura 459:15 ("י"ח מינוטין"), Biur Halacha
459:2 (22.5 minutes) and Shulchan Aruch HaRav 459:10 (two-fifths of an hour).

## Wrong, and what changed

1. **Baal HaTanya, latest Shacharis: Shulchan Aruch HaRav OC 89:1.** The seif counts the hours
   "מעלות השחר עד צאת הכוכבים", from alos, which contradicts the netz-to-shkiah day this zman
   uses. The source now cites SA OC 89:1 for the four hours and Shulchan Aruch HaRav OC 443:4
   ("מנץ החמה עד שקיעת החמה") for the day, and notes that SAHR 89:1 counts from alos.
2. **Baal HaTanya, nightfall at 6°: Shulchan Aruch HaRav OC 261:5.** The seif rules like
   Rabbeinu Tam (four mil from sunset), not 6°. Removed; the source is the Chabad luach, which
   names no primary source, marked not verified.
3. **6.45° attributed to R. Tukaczinsky.** MyZmanim, the cited reporter, calls 6.45° the custom
   of Eretz Yisrael and gives R. Tukaczinsky only a minute figure. The source now says so.

## Imprecise, and what changed

- **Plag HaMincha (Gra): Berachos 26a.** The definition is on 26b; now 26a–26b.
- **Chatzos HaLayla: SA OC 1:3.** That seif is about rising at midnight; the definition is
  Mishna Berura 1:9. Replaced.
- **Second-night candles: SA OC 503:1.** It forbids preparing from one day of Yom Tov for the
  next and does not mention candles; the source now says the rule follows from it.
- **120 minutes and 26°: Pesachim 93b.** It gives Ulla's 5 mil, refuted on 94a. Magen Avraham
  89:2, which reckons 5 mil as two hours, is added; 26° is labelled as a computed equivalent.
- **Magen Avraham latest Shacharis: MA 58:1, MB 58:4.** Both are about Shema. SA OC 89:1 (the
  four hours) is added; MA 58:1 and MB 58:4 remain for the alos-to-tzeis day.
- **Mincha Gedola, 30 fixed minutes: MB 233:1.** It glosses six and a half seasonal hours as
  half an hour after chatzos; fixed clock minutes are a practice. Now said.
- **Plag HaMincha, Levush: via Magen Avraham 233:3.** MA reads the Levush as counting from tzeis.
  Biur Halacha 261:2 s.v. "להקדים" reports Levush 267 as 1¼ hours before sunset; that is now the
  source, with MA's reading noted.
- **Candle lighting: Kaf HaChaim 261:23.** It gives a third of an hour (20 minutes), not 18 or
  40. Now said; Igros Moshe and Yabia Omer are marked as cited by the OU, not read.
- **19.8°: Peninei Halakha, Tefilla 11:2.** PH gives 19.75° and cautions against relying on such
  calendars. Now labelled as a computed equivalent of 90 minutes, with PH's caution.
- **16.1° = 72 minutes: Peninei Halakha, Tefilla 11:10.** The equivalence is in 11:2 n. 1.
- **10.2°: Kovetz Otzros Yerushalayim via Chabad.org.** Chabad.org names no source; the
  attribution comes from MyZmanim. Now said, not verified.
- **Bein hashmashos rows** cited Biur Halacha 261:2 for ¾ mil but not the mil's length; each now
  cites the mil it uses.

## Not verified, now marked

Zmanim KeHilchasam (elevation), Dr. Baruch Cohn (7.083°), Birur Halacha (12.85°), the Ateret
Torah luach, R. Tukaczinsky for 8.5°, Igros Moshe OC 4:62 (50 minutes), the 42- and 60-minute
customs, and 11.5° for misheyakir. Each source string now says "not verified" or "secondary".

## Clean room

Several attributions are known to this project only from the documentation of KosherJava and
kosher-zmanim (LGPL), which Luach may not use as a source: Zmanim KeHilchasam ch. 2 §§7, 9;
6.45° to R. Tukaczinsky; 7.083° to Dr. Baruch Cohn; 12.85° to Birur Halacha; and the Ateret
Torah definition. The values are facts and the opinions are real, but until a halachic source is
read for each, they are marked not verified. Reading those sources is open work.

## Sources consulted

- Sefaria: <https://www.sefaria.org> (references and links per citation in the data file).
- MyZmanim, sources page: <https://myzmanim.com/read/sources.aspx>
- Chabad.org zmanim explanation: <https://www.chabad.org/3209349>
- OU Torah article on candle-lighting times: <https://outorah.org/p/34953>
