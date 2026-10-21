# Citation audit of the calendar, holiday and reading code (2026-10-21)

A second, independent check of the halachic, textual and legal citations in `src/` outside the
zmanim table (calendar, holidays, tefillah, Omer, parsha, haftaros, learning, places). 69
citations were read: the Rambam, Talmud, Tanach, Shulchan Aruch, Rema, Mishna Berura, Magen
Avraham and Beis Yosef on Sefaria, and 15 Knesset laws on he.wikisource. Each record (where it
is cited, the claim, status, link, the decisive words) is in `data/citation-audit-code.json`.

| Status | Count |
|---|---|
| verified | 62 |
| imprecise | 5 |
| wrong | 1 |
| not read | 1 |

## Findings

- **Wrong: Herzl Day.** The code's rule (10 Iyar on Shabbos moves to Sunday) matches the law,
  but its comment says 10 Iyar is never Shabbos. It is whenever Pesach begins on Tuesday: 10
  Iyar 5784 was Shabbos, 18 May 2024, and Luach already moves it. **Fixed:** the comment, and a
  dated correction in the commemorations research note.
- **Imprecise: Asarah B'Teves.** SA OC 550:3 counts all four fasts as pushed off Shabbos; that
  10 Teves is never pushed off is the Abudraham, via the Beis Yosef on 550. Moot in practice:
  10 Teves never falls on Shabbos in the fixed calendar. **Fixed:** the comment says so.
- **Imprecise: Taanis Bechoros on Thursday.** The Mechaber records a dispute; Thursday is the
  Rema's ruling (Rema OC 470:2). **Fixed.**
- **Imprecise: Yom Kippur Katan when Erev Rosh Chodesh is Friday.** MB 417:4 moves it to
  Thursday only for those who say Selichos; Magen Avraham 417:3 keeps it on Friday. **Fixed:**
  option `yomKippurKatanOnFriday`, citations corrected.
- **Imprecise: the parsha schedule (SA OC 428:4).** The comment omits the Shulchan Aruch's own
  exception, Acharei Mos before Pesach in certain leap years. The code already handles it. **Fixed:** the comment.
- **Imprecise: the Omer from 16 Nisan.** The verse says "the day after the sabbath"; the date
  is the halacha. **Fixed:** the comment now cites Shulchan Aruch OC 489:1.
- **Not read:** the Daf Yomi page change for Shekalim from the eighth cycle, a historical fact.

## Rules found with no citation

Found by the same audit; each needs a source or an option:

- Yaaleh V'Yavo was off on Yom Kippur. **Fixed** after reading the Yom Kippur Amidah.
- Mizmor L'Sodah was dropped on 22 Nisan in Israel, which is Isru Chag. **Fixed.**
- The Sefirah, Three Weeks and Nine Days mourning periods are fixed; customs differ (SA OC 493,
  551) and no option is offered.
- Yom Kippur Katan month exclusions; Tachanun on Pesach Sheni, through the end of Tishrei and on
  the modern Israeli days; who says "morid hatal"; the one-day Yom Tov boundary in
  `isInIsrael`; Machar Chodesh displaced by the four parshiyos or Chanukah; no Shabbos Mevorchim
  before Tishrei (could cite MB 417:1).
- The Yom HaShoah Friday rule was applied from 1951; the law that set it dates from 1959.
  **Fixed:** applied from 1959 (Q-05 has a dated note).
