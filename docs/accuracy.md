# Accuracy report

How Luach's results compare with independent oracles. Every comparison is a test in
`test/`; numbers here come from those tests.

## Calendar

- Hebrew ↔ Gregorian: identical to `@hebcal/core` on **every day** from 1900-01-01 to
  2240-12-31; round-trips hold on 20,000 random days across the whole range (years 1–9999).
- Properties over Hebrew years 5660–6000: year lengths only 353–355/383–385, Rosh Hashana
  never Sunday/Wednesday/Friday, Yom Kippur never Friday/Sunday, Pesach on Tisha B'Av's
  weekday. All hold.
- Molad: identical to `@hebcal/core` for Tishrei and Nisan of 5660–6000.

## Holidays

Identical to `@hebcal/core` for every event in every year 5660–6000, Israel and diaspora,
with these explained differences:

| Difference | Explanation |
|---|---|
| Yom HaShoah on a Sunday before 1997 | The Knesset adopted the Sunday → Monday rule in 1997 (Amendment No. 3); hebcal applies it to every year. Luach keeps earlier Sunday years on Sunday. Source: `docs/research/2026-10-21-modern-israeli-days.md`. |
| Modern days before 1951; Yom Yerushalayim 1967 | Listing convention: Luach lists these days from their first observance. |
| Israeli commemorations (option `israeliCommemorations`): first years | Each is listed from the year of its law (research note); hebcal starts some a year apart, and lists most only in Israel mode. Compared from the later first year, in Israel mode. |
| Yom HaAliyah on a Friday | The 2016 law moves it to the Wednesday before; hebcal does not. Hebcal's "Yom HaAliyah" on 10 Nisan is not in the law (only in its purpose clause). |
| Chag HaBanot | A North African custom, not an official day. Luach lists 1 Teves (the Ministry of Education's date); hebcal lists the first day of Rosh Chodesh Teves. |

## Parsha

Identical to `@hebcal/core` on every Shabbos 5660–6000, Israel and diaspora.

Pirkei Avos (`cycle: 'doubled'`): identical to `@hebcal/learning`'s `pirkeiAvot` on every
Shabbos from Pesach 5700 to Rosh Hashana 5900, Israel and diaspora, including the Shabbos
of 8 Av, on which it is not said (Rema OC 553:2).

## Learning

- Daf Yomi (Bavli): identical to `@hebcal/learning` on every day 1923-09-11 to 2240-12-31.
- Yerushalmi Yomi (Vilna) 1980–2060, Amud HaYomi 2023–2037, Daf HaShavua 2005–2060, Mishna
  Yomis 1990–2060, Rambam one and three chapters 1985–2060 (chapter days), Nach Yomi
  2007–2060, Sefer HaMitzvos day numbers 1985–2060: identical to `@hebcal/learning` every
  day. Intro-day labels for the Rambam differ in wording only.

## Haftara

Every Shabbos 5660–6000, Ashkenaz and Sephardi, Israel and diaspora, against
`@hebcal/leyning`, ignoring notation (a repeated last verse; contiguous ranges written as
two). Explained differences — genuine variants between published lists, all documented in
`docs/research/2026-10-21-haftaros.md`:

| Minhag | Haftara | Luach | hebcal | Why |
|---|---|---|---|---|
| Ashkenaz | Kedoshim | Ezekiel 22:1-16 | Ezekiel 22:1-19 | where the haftara ends; both are in published lists |
| Ashkenaz | Shabbos Shuva on Haazinu | Hosea 14 + Joel 2:15-27 | Hosea 14 + Micah 7:18-20 | both customs exist; Luach follows the Dagul Mervava (MB 428:23): Micah with Vayelech (as hebcal), Joel with Haazinu |
| Both | Shavuos day 2 | Habakkuk 2:20-3:19 | Habakkuk 3:1-19 | both customs exist |
| Sephardi | Re'eh on Rosh Chodesh Elul, and Ki Seitzei after it | Re'eh's own; Ki Seitzei not doubled | Isaiah 66; doubled | Sephardi practice per the research note |
| Sephardi | Shabbos Rosh Chodesh when Sunday is also Rosh Chodesh | adds Machar Chodesh's first and last verses | does not | SA OC 425:1 (Sephardim, Chabad) vs Rema |
| Sephardi | Rosh Chodesh Av | no Isaiah 66 verses | adds them | Chabad adds them; Sephardim do not |
| Sephardi | Simchas Torah | Joshua 1:1-9 | Joshua 1:1-18 | Sephardi lists end at 1:9 |

Acharei Mos and Kedoshim are not a variant between the two: both read Amos 9:7-15 on Acharei
Mos and Ezekiel 22 on Kedoshim, and when Acharei Mos's haftara was displaced (by Machar
Chodesh or Shabbos HaGadol), both read Amos 9:7-15 on Kedoshim (MB 428:26, citing R. Akiva
Eiger). The test checks which haftara Kedoshim reads; only the end verse is explained.

## Zmanim

- The NOAA implementation agrees with `astronomy-engine` (MIT) on sunrise and sunset within
  1 minute in 6 cities at latitudes up to 64°, 2025–2028; the second (USNO) algorithm agrees
  with it within 2 minutes up to ±60°.
- Against kosher-zmanim (test-only): 51 zmanim, 19 cities, every day of 2025–2028 —
  1.37 million compared values, **largest difference 60 seconds**. Full table:
  [accuracy-zmanim.md](accuracy-zmanim.md).

Differences of more than a minute, all explained:

| Where | What | Explanation |
|---|---|---|
| Reykjavik 2028-08-12 misheyakir 11°; Tromsø 2026-08-27 misheyakir 10.2°, 2025-09-14 alos 16.9° | 64–148 s | The sun only grazes the angle that night (its lowest point is within 0.5° of it). Near that point the time moves very fast with tiny differences in declination, and any two methods diverge. |
| Chatham, 67 days (4–20 February each year) | not compared | Not kosher-zmanim issue #37: that shift (its Chatham times are a day ahead on every day) is corrected for in the comparison. On these days Chatham's solar transit is within seconds of 00:00 UTC and kosher-zmanim's transit jumps a day, so no date asked of it gives Luach's day. astronomy-engine agrees with Luach: chatzos on 2026-02-20 is 2026-02-19T23:59:58Z (astronomy-engine) and 2026-02-20T00:00:00Z (Luach), while kosher-zmanim, asked for 2026-02-20, gives 2026-02-20T23:59:57Z, the next day's transit. Luach's date-line results are checked separately against astronomy-engine, every day of 2025–2028, in Sydney, Auckland, Chatham, Apia and Kiritimati. |
| Boundary days at high latitude | `null` on one side | The first or last day each year when the sun reaches an angle: one method finds it, the other does not. Never more than 2 per zman per year. |
