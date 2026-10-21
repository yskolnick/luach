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
| Sigd, Yom HaAliyah, other Israeli commemorations, 7 October memorial | Not built yet (ROADMAP HOL-16). |

## Parsha

Identical to `@hebcal/core` on every Shabbos 5660–6000, Israel and diaspora.

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
| Ashkenaz | Kedoshim | Ezekiel 22:1-16 | Amos 9:7-15 / Ezekiel 22:1-19 | Rema, ArtScroll, Ezras Torah luach vs Hertz and others |
| Ashkenaz | Shabbos Shuva | Hosea 14 + Joel 2:15-27 | Hosea 14 + Micah 7:18-20 | both customs exist |
| Both | Shavuos day 2 | Habakkuk 2:20-3:19 | Habakkuk 3:1-19 | both customs exist |
| Sephardi | Re'eh on Rosh Chodesh Elul, and Ki Seitzei after it | Re'eh's own; Ki Seitzei not doubled | Isaiah 66; doubled | Sephardi practice per the research note |
| Sephardi | Shabbos Rosh Chodesh when Sunday is also Rosh Chodesh | adds Machar Chodesh's first and last verses | does not | SA OC 425:1 (Sephardim, Chabad) vs Rema |
| Sephardi | Rosh Chodesh Av | no Isaiah 66 verses | adds them | Chabad adds them; Sephardim do not |
| Sephardi | Simchas Torah | Joshua 1:1-9 | Joshua 1:1-18 | Sephardi lists end at 1:9 |

## Zmanim

- The NOAA implementation agrees with `astronomy-engine` (MIT) on sunrise and sunset within
  1 minute in 6 cities at latitudes up to 64°, 2025–2028; the second (USNO) algorithm agrees
  with it within 2 minutes up to ±60°.
- Against kosher-zmanim (test-only): 52 zmanim, 19 cities, every day of 2025–2028 —
  1.37 million compared values, **largest difference 60 seconds**. Full table:
  [accuracy-zmanim.md](accuracy-zmanim.md).

Differences of more than a minute, all explained:

| Where | What | Explanation |
|---|---|---|
| Reykjavik 2028-08-12 misheyakir 11°; Tromsø 2026-08-27 misheyakir 10.2°, 2025-09-14 alos 16.9° | 64–148 s | The sun only grazes the angle that night (its lowest point is within 0.5° of it). Near that point the time moves very fast with tiny differences in declination, and any two methods diverge. |
| Chatham, 67 days | not compared | kosher-zmanim (issue #37) puts these days on the wrong civil date. Luach's date-line results are checked separately against astronomy-engine, every day of 2025–2028, in Sydney, Auckland, Chatham, Apia and Kiritimati. |
| Boundary days at high latitude | `null` on one side | The first or last day each year when the sun reaches an angle: one method finds it, the other does not. Never more than 2 per zman per year. |
