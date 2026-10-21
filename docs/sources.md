---
aside: false
---

# Sources and decisions

> Ask your rav. This library calculates; it does not rule.

Luach is built in public. This page says where every time, rule, table and decision comes
from, so anyone can check it. Most of it is generated from the code by
`scripts/gen-sources.mjs`, and a test fails if it falls out of date.

The **Audit** column records an independent second check of each zman's citations against
the texts (`docs/research/2026-10-21-citation-audit-zmanim.md`, data in
`docs/research/data/citation-audit-zmanim.json`): **checked** means the passage was read and
says what Luach claims; **corrected** means the check found a problem and the source was
fixed; **part from a secondary source** means a modern work citing it was read instead;
**part not verified** means part of the source could not be read, and the source says so.

## How a time is calculated

1. **The sun's position.** The NOAA Solar Calculator equations, which implement the
   low-precision solar theory of Jean Meeus, *Astronomical Algorithms* (2nd ed., 1998), chapters
   25 and 28. NOAA's method is a US Government work in the public domain; Luach re-implements it
   from the published description. Code: [`src/zmanim/solar.ts`](https://github.com/yskolnick/luach/blob/main/src/zmanim/solar.ts).
   - NOAA Solar Calculator: <https://gml.noaa.gov/grad/solcalc/>; calculation details:
     <https://gml.noaa.gov/grad/solcalc/calcdetails.html>
2. **Sunrise and sunset** are when the sun's centre is 90°50′ from the zenith: 34′ for
   atmospheric refraction plus 16′ for the sun's semi-diameter, the standard almanac
   convention. **A zman at *d* degrees** below the horizon uses the sun's centre at 90° + *d*,
   geometric, with no refraction.
3. **Elevation** (only where a zman says so) lowers the horizon by the dip angle
   arccos(R / (R + h)), with R = 6,371 km, the earth's mean radius (*As built*).
4. **Proportional hours** (*sha'os zmaniyos*) divide the day between the two times that
   the opinion names, into twelve.
5. **Rounding** to the minute is up for earliest times and down for deadlines, so a displayed
   time never moves in the lenient direction. It can be switched off. Code: [`src/zmanim/zman.ts`](https://github.com/yskolnick/luach/blob/main/src/zmanim/zman.ts).
6. **Civil time** comes from the IANA time-zone database through the platform's `Intl`, or a
   provider the caller passes. Luach never derives a "standard offset" from a zone or a
   longitude. Code: [`src/time/zone.ts`](https://github.com/yskolnick/luach/blob/main/src/time/zone.ts). IANA: <https://www.iana.org/time-zones>.
7. **When the sun never reaches an angle** (high latitudes), the time is `null` with a reason.
   Fallbacks are opt-in and marked on the result.
8. **A second algorithm** for cross-checking: the US Naval Observatory's *Almanac for
   Computers* (1990, public domain). Code: [`src/zmanim/usno.ts`](https://github.com/yskolnick/luach/blob/main/src/zmanim/usno.ts).

Accuracy against independent implementations is in [accuracy](./accuracy) and
[zmanim accuracy](./accuracy-zmanim).

## Every zman and its source

Generated from [`src/zmanim/opinions.ts`](https://github.com/yskolnick/luach/blob/main/src/zmanim/opinions.ts). The research behind them is in
[`docs/research/2026-10-21-zmanim-opinions.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-zmanim-opinions.md).

| Id | Opinion | Source | Rounding | Audit |
|---|---|---|---|---|
| `sunrise` | Sunrise (netz hachama), at sea level unless the calculator's useElevation is on | Berachos 9b; Shulchan Aruch OC 58:1 | up | checked |
| `sunrise-sea-level` | Sunrise at sea level (upper limb at the horizon, standard refraction) | NOAA Solar Calculator; sea-level practice: R. Isser Zalman Meltzer, cited in Peninei Halakha, Tefilla 11:6 n. 7 | up | part from a secondary source, part not verified |
| `sunrise-elevation` | Sunrise adjusted for the observer's elevation (lower horizon, earlier) | Zmanim KeHilchasam (R. Bursztyn), ch. 2 §§7, 9: elevation for sunrise and sunset only (not verified: the book was not read) | up | part not verified |
| `sunrise-visible` | Visible sunrise over the actual terrain (netz hanireh) | Divrei Yosef; Maharil Diskin (cited in Peninei Halakha, Tefilla 11). Needs terrain data: not computed | up | part from a secondary source |
| `sunset` | Sunset (shkiah), at sea level unless the calculator's useElevation is on | Shabbos 34b–35a; Shulchan Aruch OC 261:2 | down | checked |
| `sunset-sea-level` | Sunset at sea level | NOAA Solar Calculator | down | part not verified |
| `sunset-elevation` | Sunset adjusted for the observer's elevation (later) | Zmanim KeHilchasam (R. Bursztyn), ch. 2 §§7, 9 (not verified: the book was not read) | down | part not verified |
| `chatzos` | Midday: the sun on the meridian (astronomical transit) | Magen Avraham OC 233:4 | down | checked |
| `chatzos-halayla` | Midnight: halfway between one transit and the next | Berachos 3b; Mishna Berura 1:9 (midnight is twelve hours after midday) | down | checked, corrected |
| `alos-72` | Dawn 72 fixed minutes before sunrise (4 mil of 18 minutes) | Pesachim 94a; Shulchan Aruch OC 459:2; Magen Avraham 89:2 | up | checked |
| `alos-90` | Dawn 90 fixed minutes before sunrise (4 mil of 22.5 minutes) | Pesachim 94a; Biur Halacha 459:2 | up | checked |
| `alos-96` | Dawn 96 fixed minutes before sunrise (4 mil of 24 minutes) | Pesachim 94a; Magen Avraham 89:2; Shulchan Aruch HaRav 459:10 | up | checked |
| `alos-120` | Dawn 120 fixed minutes before sunrise (5 mil of 24 minutes; a stringency) | Pesachim 93b (Ulla: 5 mil, refuted on 94a); Magen Avraham 89:2 (5 mil reckoned as two hours, as a stringency) | up | corrected, checked |
| `alos-72-zmaniyos` | Dawn 72 proportional minutes (1.2 seasonal hours of the Gra day) before sunrise | Rambam, Peirush HaMishnayos Berachos 1:1 (an hour and a fifth of seasonal hours); Pesachim 94a | up | checked |
| `alos-90-zmaniyos` | Dawn 90 proportional minutes (1.5 seasonal hours) before sunrise | Pesachim 94a; Biur Halacha 459:2 | up | checked |
| `alos-96-zmaniyos` | Dawn 96 proportional minutes (1.6 seasonal hours) before sunrise | Pesachim 94a; Magen Avraham 89:2 | up | checked |
| `alos-120-zmaniyos` | Dawn 120 proportional minutes (2 seasonal hours) before sunrise (a stringency) | Pesachim 93b (Ulla: 5 mil, refuted on 94a); Magen Avraham 89:2 (5 mil reckoned as two hours) | up | corrected |
| `alos-16.1` | Dawn when the sun is 16.1° below the horizon: 72 minutes before sunrise in Jerusalem at the equinox | Yechave Daas 2:8 (cited in Peninei Halakha, Tefilla 11:2); 72 minutes per Pesachim 94a | up | checked, part from a secondary source |
| `alos-18` | Dawn at 18° (astronomical twilight) | Astronomical dawn (cited in Peninei Halakha, Tefilla 11) | up | part from a secondary source |
| `alos-19.8` | Dawn at 19.8°: 90 minutes before sunrise in Jerusalem at the equinox | Computed: the sun's depression 90 minutes before sunrise in Jerusalem at the equinox; 90 minutes per Biur Halacha 459:2. Peninei Halakha, Tefilla 11:2 gives 19.75° and cautions against relying on such calendars | up | checked, corrected |
| `alos-26` | Dawn at 26°: about 120 minutes before sunrise in Jerusalem at the equinox (a stringency) | Computed: the sun's depression 120 minutes before sunrise in Jerusalem at the equinox; 120 minutes per Magen Avraham 89:2 (5 mil) | up | corrected |
| `alos-baal-hatanya` | Dawn of the Baal HaTanya, 16.9° below the horizon | Shulchan Aruch HaRav OC 89:1; 16.9° per the Chabad luach (Chabad.org) | up | checked, part from a secondary source |
| `misheyakir-10.2` | Misheyakir at 10.2° | Berachos 9b; Shulchan Aruch OC 18:3; 10.2° per the Chabad.org luach, which names no source; attributed to Kovetz Otzros Yerushalayim by MyZmanim (not verified) | up | checked, part from a secondary source, corrected |
| `misheyakir-11` | Misheyakir at 11° | Berachos 9b; Shulchan Aruch OC 18:3; Peninei Halakha, Tefilla 11 | up | checked, part from a secondary source |
| `misheyakir-11.5` | Misheyakir at 11.5° (custom of Eretz Yisrael) | Berachos 9b; Shulchan Aruch OC 18:3; 11.5° as the custom of Eretz Yisrael per MyZmanim (secondary; not verified) | up | checked |
| `misheyakir-12.85` | Misheyakir at 12.85° | Berachos 9b; Shulchan Aruch OC 18:3; 12.85° attributed to Birur Halacha (R. Zilber) OC 18 (not verified) | up | checked, part not verified |
| `sof-zman-shema-gra` | Latest Shema, Gra: 3 seasonal hours of a sunrise-to-sunset day | Shulchan Aruch OC 58:1; Mishna Berura 58:4 | down | checked |
| `sof-zman-shema-mga-72` | Latest Shema, Magen Avraham: 3 seasonal hours of a day from alos to tzeis, 72 fixed minutes | Magen Avraham OC 58:1, 233:3; Mishna Berura 58:4; 72 min = 4 mil × 18 min (Pesachim 94a; SA OC 459:2) | down | checked |
| `sof-zman-shema-mga-90` | Latest Shema, Magen Avraham with 90 fixed minutes | Magen Avraham OC 58:1; Mishna Berura 58:4; Biur Halacha 459:2 | down | checked |
| `sof-zman-shema-mga-72-zmaniyos` | Latest Shema, Magen Avraham with 72 proportional minutes | Magen Avraham OC 58:1; Mishna Berura 58:4 | down | checked |
| `sof-zman-shema-mga-90-zmaniyos` | Latest Shema, Magen Avraham with 90 proportional minutes | Magen Avraham OC 58:1; Mishna Berura 58:4 | down | checked |
| `sof-zman-shema-mga-16.1` | Latest Shema, Magen Avraham, day from alos to tzeis at 16.1° | Magen Avraham OC 58:1; Mishna Berura 58:4; 16.1° = Jerusalem equinox equivalent of 72 minutes (Peninei Halakha, Tefilla 11:2 n. 1) | down | checked, corrected |
| `sof-zman-shema-baal-hatanya` | Latest Shema, Baal HaTanya: 3 seasonal hours of a day from netz amiti to shkia amitis (sun 1.583° below the horizon) | Shulchan Aruch HaRav OC 443:4; 1.583° per the Chabad luach (Chabad.org) | down | checked, part from a secondary source |
| `sof-zman-shema-ateret-torah` | Latest Shema, Ateret Torah: day from alos (72 proportional minutes) to tzeis (40 minutes after sunset) | Ateret Torah luach (Chacham Yosef Harari-Raful); not verified against a printed source | down | part not verified |
| `sof-zman-tefilla-gra` | Latest Shacharis, Gra: 4 seasonal hours of a sunrise-to-sunset day | Shulchan Aruch OC 89:1; Mishna Berura 58:4 | down | checked |
| `sof-zman-tefilla-mga-72` | Latest Shacharis, Magen Avraham, 72 fixed minutes | Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4 | down | corrected, checked |
| `sof-zman-tefilla-mga-90` | Latest Shacharis, Magen Avraham, 90 fixed minutes | Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4 | down | corrected, checked |
| `sof-zman-tefilla-mga-72-zmaniyos` | Latest Shacharis, Magen Avraham, 72 proportional minutes | Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4 | down | corrected, checked |
| `sof-zman-tefilla-mga-90-zmaniyos` | Latest Shacharis, Magen Avraham, 90 proportional minutes | Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4 | down | corrected, checked |
| `sof-zman-tefilla-mga-16.1` | Latest Shacharis, Magen Avraham, 16.1° | Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4 | down | corrected, checked |
| `sof-zman-tefilla-baal-hatanya` | Latest Shacharis, Baal HaTanya | Shulchan Aruch OC 89:1 (four hours); the day from netz to shkiah: Shulchan Aruch HaRav OC 443:4. (Shulchan Aruch HaRav OC 89:1 counts from alos instead.) | down | corrected, checked |
| `sof-zman-tefilla-ateret-torah` | Latest Shacharis, Ateret Torah | Ateret Torah luach (Chacham Yosef Harari-Raful); not verified against a printed source | down | part not verified |
| `mincha-gedola-30` | Mincha Gedola: 30 fixed minutes after chatzos | Shulchan Aruch OC 233:1 (six and a half seasonal hours), which Mishna Berura 233:1 glosses as half an hour after chatzos; fixed clock minutes are a common practice (not verified as a ruling) | up | checked, corrected |
| `mincha-gedola-gra` | Mincha Gedola, Gra: 6.5 seasonal hours after sunrise | Shulchan Aruch OC 233:1; Mishna Berura 233:1–4 | up | checked |
| `mincha-gedola-greater` | Mincha Gedola: the later of 30 minutes after chatzos and 6.5 seasonal hours (Chabad practice) | Shulchan Aruch OC 233:1; practice per the Chabad luach (Chabad.org) | up | checked, part from a secondary source |
| `mincha-gedola-mga-72` | Mincha Gedola, Magen Avraham (72 fixed minutes) | Shulchan Aruch OC 233:1; Magen Avraham 233:3 | up | checked |
| `mincha-gedola-baal-hatanya` | Mincha Gedola, Baal HaTanya | Shulchan Aruch HaRav OC 443:4 (day from netz to shkia) | up | checked |
| `mincha-ketana-gra` | Mincha Ketana, Gra: 9.5 seasonal hours | Shulchan Aruch OC 233:1; Mishna Berura 233:1–4 | up | checked |
| `mincha-ketana-mga-72` | Mincha Ketana, Magen Avraham (72 fixed minutes) | Shulchan Aruch OC 233:1; Magen Avraham 233:3 | up | checked |
| `mincha-ketana-baal-hatanya` | Mincha Ketana, Baal HaTanya | Shulchan Aruch HaRav OC 443:4 | up | checked |
| `plag-hamincha-gra` | Plag HaMincha, Gra (and Levush): 1¼ seasonal hours before sunset, day from sunrise to sunset | Berachos 26a–26b; Shulchan Aruch OC 233:1; Magen Avraham 233:3 | up | corrected, checked |
| `plag-hamincha-mga-72` | Plag HaMincha, Magen Avraham (72 fixed minutes) | Terumas HaDeshen, cited in Magen Avraham 233:3; Mishna Berura 233:4, 261:25 | up | checked |
| `plag-hamincha-mga-16.1` | Plag HaMincha, Magen Avraham (16.1°) | Magen Avraham 233:3; Mishna Berura 233:4 | up | checked |
| `plag-hamincha-baal-hatanya` | Plag HaMincha, Baal HaTanya | Shulchan Aruch HaRav OC 443:4; Chabad luach | up | checked, part from a secondary source |
| `plag-hamincha-levush` | Plag HaMincha, Levush: 1¼ hours before sunset as Biur Halacha reports it, computed here as the Gra's (seasonal hours, sunrise to sunset) | Levush OC 267, as reported in Biur Halacha 261:2 s.v. "להקדים"; Magen Avraham 233:3 reads the Levush as counting from tzeis | up | checked, corrected |
| `bein-hashmashos-rabbeinu-tam` | Start of bein hashmashos, Rabbeinu Tam: 3¼ mil (58.5 minutes) after sunset, lasting 13.5 minutes | Tosafos Shabbos 35a, Pesachim 94a; Shulchan Aruch OC 261:2 | down | checked |
| `bein-hashmashos-geonim-13.5` | End of bein hashmashos, Geonim and Gra: ¾ mil of 18 minutes (13.5 minutes) after sunset | Biur Halacha 261:2; Mishna Berura 261:23; mil of 18 minutes: Shulchan Aruch OC 459:2 | up | checked |
| `bein-hashmashos-geonim-16.875` | End of bein hashmashos, Geonim: ¾ mil of 22.5 minutes (16.875 minutes) after sunset | Biur Halacha 261:2; mil of 22.5 minutes: Biur Halacha 459:2 | up | checked |
| `bein-hashmashos-geonim-18` | End of bein hashmashos, Geonim: ¾ mil of 24 minutes (18 minutes) after sunset | Biur Halacha 261:2; mil of 24 minutes: Shulchan Aruch HaRav 459:10 | up | checked |
| `bein-hashmashos-yereim-18` | Start of bein hashmashos, Yereim: ¾ mil of 24 minutes (18 minutes) before sunset | Sefer Yereim 274 (Vilna ed.); Biur Halacha 261:2; Shulchan Aruch HaRav 261:5; mil of 24 minutes: Shulchan Aruch HaRav 459:10 | down | checked |
| `bein-hashmashos-yereim-16.875` | Start of bein hashmashos, Yereim: ¾ mil of 22.5 minutes (16.875 minutes) before sunset | Sefer Yereim 274; Biur Halacha 261:2; mil of 22.5 minutes: Biur Halacha 459:2 | down | checked |
| `bein-hashmashos-yereim-13.5` | Start of bein hashmashos, Yereim: ¾ mil of 18 minutes (13.5 minutes) before sunset | Sefer Yereim 274; Biur Halacha 261:2; mil of 18 minutes: Shulchan Aruch OC 459:2 | down | checked |
| `tzeis-8.5` | Nightfall at 8.5° (three small stars) | Shulchan Aruch OC 293:2 (three small stars); 8.5° per the Chabad luach; attribution to R. Tukaczinsky not verified | up | checked, part from a secondary source, part not verified |
| `tzeis-7.083` | Nightfall at 7.083° (three medium stars, about 29 minutes after sunset in Jerusalem at the equinox) | Shulchan Aruch OC 562:1 (three medium stars); 7.083° attributed to Dr. Baruch Cohn (not verified: no primary source read) | up | checked, part not verified |
| `tzeis-6.45` | Nightfall at 6.45° (three medium stars; custom in Israel) | Shulchan Aruch OC 562:1 (three medium stars); 6.45° as the custom of Eretz Yisrael per MyZmanim (secondary; not verified) | up | checked, corrected |
| `tzeis-42` | Nightfall 42 fixed minutes after sunset (a custom in the United States) | Custom; ¾ mil reckoning of the Geonim adapted to latitude (not verified against a printed source) | up | part not verified |
| `tzeis-50` | Nightfall 50 fixed minutes after sunset | Igros Moshe OC 4:62 (not verified: cited from secondary sources; given for New York) | up | part from a secondary source |
| `tzeis-60` | Nightfall 60 fixed minutes after sunset | Custom (not verified against a printed source) | up | part not verified |
| `tzeis-72` | Nightfall 72 fixed minutes after sunset (4 mil of 18 minutes) | Pesachim 94a; Tosafos Shabbos 35a; Shulchan Aruch OC 261:2 | up | checked |
| `tzeis-rabbeinu-tam` | Nightfall of Rabbeinu Tam: 72 fixed minutes after sunset | Tosafos Shabbos 35a, Pesachim 94a; Shulchan Aruch OC 261:2 | up | checked |
| `tzeis-baal-hatanya` | Nightfall of the Baal HaTanya, 6° below the horizon | Chabad luach (Chabad.org), which names no primary source for 6° (not verified) | up | corrected, part from a secondary source |
| `tzeis-ateret-torah` | Nightfall, Ateret Torah: a fixed number of minutes after sunset (default 40) | Ateret Torah luach (Chacham Yosef Harari-Raful); not verified against a printed source | up | part not verified |
| `candle-lighting` | Candle lighting a fixed number of minutes before sunset, by local custom (18 common; Jerusalem 40) | Shulchan Aruch OC 261:2 (tosefes Shabbos); the minutes are local custom: Kaf HaChaim 261:23 (a third of an hour); Igros Moshe OC 2:6 and Yabia Omer 5:21 as cited by the OU (not verified) | down | checked, corrected, part from a secondary source |
| `havdala` | End of Shabbos or Yom Tov: three small stars (by degrees) or a fixed number of minutes | Shulchan Aruch OC 293:2 | up | checked |
| `candle-lighting-second-night` | Candles on the second night of Yom Tov, or Yom Tov after Shabbos: after nightfall | Shulchan Aruch OC 503:1 (no preparing from one day of Yom Tov for the next); lighting after nightfall follows from it and is not stated there | up | corrected |
| `sof-zman-achilas-chametz-gra` | Latest time to eat chametz on Erev Pesach, Gra: 4 seasonal hours | Pesachim 11b; Shulchan Aruch OC 443:1 | down | checked |
| `sof-zman-achilas-chametz-mga-72` | Latest time to eat chametz, Magen Avraham (72 minutes) | Pesachim 11b; Shulchan Aruch OC 443:1 with Rema | down | checked |
| `sof-zman-biur-chametz-gra` | Latest time to burn chametz on Erev Pesach, Gra: 5 seasonal hours | Pesachim 11b; Shulchan Aruch OC 443:1 | down | checked |
| `sof-zman-biur-chametz-mga-72` | Latest time to burn chametz, Magen Avraham (72 minutes) | Pesachim 11b; Shulchan Aruch OC 443:1 with Rema | down | checked |
| `fast-begins` | A minor fast begins at dawn | Shulchan Aruch OC 564:1 | down | checked |
| `fast-begins-sunset` | Yom Kippur and Tisha B'Av begin at sunset the evening before (from bein hashmashos) | Shulchan Aruch OC 553:2, 608:1 | down | checked |
| `fast-ends` | A fast ends at nightfall (three medium stars) | Shulchan Aruch OC 562:1 | up | checked |

## The calendar

- **Molad, month length, leap years, the four dechiyos and year types:** the Rambam, Hilchos
  Kiddush HaChodesh, chapters 6–8. Molad BaHaRaD, the month of 29 days, 12 hours and 793
  chalakim, and the 19-year cycle. Code: [`src/calendar/year.ts`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts).
- **Civil dates:** Howard Hinnant, "chrono-Compatible Low-Level Date Algorithms"
  (<https://howardhinnant.github.io/date_algorithms.html>), public domain.
  Code: [`src/time/civil.ts`](https://github.com/yskolnick/luach/blob/main/src/time/civil.ts).
- **Holidays, fasts and their postponements, readings, haftaros, tefillah changes, learning
  cycles:** each rule cites its source in the code. Every such citation is listed in the next
  section.

## Every citation in the code

Comments in `src/` that cite a halachic, legal or technical source, generated by scanning
the code. Zmanim are in the table above; verse references for haftaros are in
[`src/parsha/haftaros-data.ts`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftaros-data.ts) and the [haftaros research note](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-haftaros.md).

| Where | Citation |
|---|---|
| [`src/calendar/anniversary.ts:8`](https://github.com/yskolnick/luach/blob/main/src/calendar/anniversary.ts#L8) | 1. **Adar of a common year, observed in a leap year.** For a birthday or bar mitzvah the Rema (Orach Chaim 55:10, citing Mahari Mintz) gives Adar II; that is the default for `kind: 'birthday'`. For a yahrzeit the Mechaber (OC 568:7) gives Adar II and the Rema there gives Adar I, adding that some observe both; the default for `kind: 'yahrzeit'` is Adar I. Set `adarInLeapYear` to choose. 2. **Adar I or Adar II of a leap year, observed in a common year:** Adar. 30 Adar I (the first day of Rosh Chodesh Adar II) becomes 30 Shevat, the first day of Rosh Chodesh Adar in a common year (*as built*; see DECISIONS.md). 3. **The 30th of Cheshvan or Kislev, in a year when that month has 29 days.** `'nextMonth'` moves it to the 1st of the following month (the second day of the same Rosh Chodesh); `'firstAnniversary'` keeps the 30th whenever it exists, and otherwise follows the first anniversary: if the month had only 29 days in the year after the event, the 29th; if it had 30, the 1st of the next month. Defaults: `'nextMonth'` for birthdays, `'firstAnniversary'` for yahrzeits (*as built*; see DECISIONS.md). |
| [`src/calendar/molad.ts:4`](https://github.com/yskolnick/luach/blob/main/src/calendar/molad.ts#L4) | Rambam, Hilchos Kiddush HaChodesh 6:2–8. Times are in the calendar's hours, which are counted from 6 pm of the evening before; the announced clock time is the same instant read on a 24-hour clock starting at midnight. Both are given. These are mean Jerusalem times (the calendar's reckoning), not local clock time. |
| [`src/calendar/months.ts:4`](https://github.com/yskolnick/luach/blob/main/src/calendar/months.ts#L4) | Months are numbered as the Torah counts them, from Nisan (Shemos 12:2; Rambam, Hilchos Kiddush HaChodesh 1:1 ff.): Nisan = 1 … Elul = 6, Tishrei = 7 … Shevat = 11, Adar = 12. In a leap year 12 is Adar I (Adar Rishon) and 13 is Adar II (Adar Sheni). The year itself begins on 1 Tishrei. |
| [`src/calendar/year.ts:2`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L2) | The fixed Hebrew calendar, computed from the rules in the Rambam, Hilchos Kiddush HaChodesh, chapters 6–8. |
| [`src/calendar/year.ts:15`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L15) | Chalakim (parts) in an hour. Rambam, KH 6:2. |
| [`src/calendar/year.ts:19`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L19) | Length of a mean lunar month in chalakim: 29 d 12 h 793 p. Rambam, KH 6:3. |
| [`src/calendar/year.ts:22`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L22) | The molad of Tishrei of year 1 ("BaHaRaD": day 2, 5 hours, 204 parts), counted in chalakim from the start of the first day (Sunday, 6 pm Saturday night) of that week. Rambam, KH 6:8. |
| [`src/calendar/year.ts:28`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L28) | The years of the 19-year cycle that have 13 months. Rambam, KH 6:11. |
| [`src/calendar/year.ts:81`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L81) | The day (counted from day 0 of {@link moladTishreiParts}) of Rosh Hashana of `year`, after the four dechiyos of Rambam, KH 7:1–7: |
| [`src/calendar/year.ts:126`](https://github.com/yskolnick/luach/blob/main/src/calendar/year.ts#L126) | Rambam, KH 8:5–6. |
| [`src/holidays/holidays.ts:4`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L4) | Dates follow the Torah and the Shulchan Aruch, as cited per event. Where a day is moved (a fast that falls on Shabbos, Taanis Esther, Taanis Bechoros, the modern Israeli days), the rule is stated next to the code. Israel vs the diaspora is always the caller's explicit choice (`israel` option). |
| [`src/holidays/holidays.ts:93`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L93) | Tzom Gedalia, 3 Tishrei; on Shabbos it is pushed to Sunday (SA OC 549:1, 550:3). |
| [`src/holidays/holidays.ts:129`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L129) | Asarah B'Teves: never pushed off; it can fall on Friday (SA OC 550:3 and commentaries). |
| [`src/holidays/holidays.ts:134`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L134) | Shabbos Shira: the Shabbos of Parshas Beshalach (the Song of the Sea, Shemos 15). |
| [`src/holidays/holidays.ts:139`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L139) | Shovavim (optional): the weeks of Shemos through Mishpatim, and in a leap year also Terumah and Tetzaveh ("Shovavim Tat"), a custom of fasting and teshuvah (see docs). |
| [`src/holidays/holidays.ts:156`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L156) | Shabbos Shekalim: the Shabbos on or before Rosh Chodesh Adar (Adar II in a leap year). SA OC 685:1, 5. |
| [`src/holidays/holidays.ts:158`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L158) | Shabbos Zachor: the Shabbos before Purim. SA OC 685:2, 5. |
| [`src/holidays/holidays.ts:160`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L160) | Taanis Esther, 13 Adar; on Shabbos it moves back to Thursday (SA OC 686:2). |
| [`src/holidays/holidays.ts:169`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L169) | Purim Meshulash: when 15 Adar is Shabbos, Jerusalem spreads Shushan Purim over Friday–Sunday (SA OC 688:6). The event marks the Sunday, 16 Adar, the third day. |
| [`src/holidays/holidays.ts:172`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L172) | Shabbos Parah: the Shabbos before Shabbos HaChodesh. Shabbos HaChodesh: on or before 1 Nisan. SA OC 685:3–4, 6. |
| [`src/holidays/holidays.ts:177`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L177) | Nisan Shabbos HaGadol: the Shabbos before Pesach (on 14 Nisan if Erev Pesach is Shabbos). SA OC 430:1. |
| [`src/holidays/holidays.ts:180`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L180) | Taanis Bechoros, 14 Nisan; when Erev Pesach is Shabbos it moves to Thursday (SA OC 470:2). |
| [`src/holidays/holidays.ts:216`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L216) | Tammuz / Av 17 Tammuz and 9 Av: on Shabbos the fast is pushed to Sunday (SA OC 550:3; 552:10). |
| [`src/holidays/holidays.ts:234`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L234) | Leil Selichos (Ashkenaz): the Motzaei Shabbos before Rosh Hashana, or a week earlier if fewer than four days of selichos would remain (Rema OC 581:1; the four-day reason is MB 581:6). Dated on the Shabbos. |
| [`src/holidays/holidays.ts:256`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L256) | Yom Kippur Katan: the day before Rosh Chodesh, moved to Thursday if it falls on Friday or Shabbos; not kept before Tishrei, Cheshvan, Teves or Iyar (MB 417:4; Magen Avraham 417:3; the exclusions are common practice, not stated there). |
| [`src/holidays/holidays.ts:267`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L267) | BeHaB: Monday, Thursday, Monday after the first Shabbos of Cheshvan and of Iyar (SA OC 492:1 with Rema; MB 492:3). |
| [`src/holidays/holidays.ts:278`](https://github.com/yskolnick/luach/blob/main/src/holidays/holidays.ts#L278) | Modern Israeli days (Knesset laws; see docs/research/2026-10-21-modern-israeli-days.md) |
| [`src/holidays/omer.ts:4`](https://github.com/yskolnick/luach/blob/main/src/holidays/omer.ts#L4) | The count begins on the night of 16 Nisan, the second night of Pesach (Vayikra 23:15–16, "the day after the sabbath", read as after the first day of Pesach; Shulchan Aruch OC 489:1: "בליל שני ... מתחילין לספור העומר") and runs 49 days to the eve of Shavuos. A Hebrew date's Omer day is the count said on the evening that *begins* that date: 16 Nisan is day 1. |
| [`src/holidays/seasonal.ts:28`](https://github.com/yskolnick/luach/blob/main/src/holidays/seasonal.ts#L28) | **Israel:** from Maariv of 7 Cheshvan (Taanis 10a; SA OC 117:1), i.e. the evening of 6 Cheshvan in civil terms. **Diaspora:** from Maariv of the 60th day after tekufas Tishrei, counting the day of the tekufah as the first (SA OC 117:1). By Shmuel's tekufah that Maariv is on the evening of 21 November in the Julian calendar, or 22 November when the following Julian year is a leap year. In Gregorian terms this is the evening of 4 December, or 5 December before a Gregorian leap year, for 1900–2099; from 2100 it is a day later (5/6 December), from 2200 later again, and so on. Computed, not tabulated. |
| [`src/holidays/seasonal.ts:52`](https://github.com/yskolnick/luach/blob/main/src/holidays/seasonal.ts#L52) | `mashivHaruach`: "mashiv haruach umorid hageshem" is said from Musaf of Shemini Atzeres to Musaf of the first day of Pesach (Taanis 2a, 4b; SA OC 114:1). On those two days the value describes Shacharis, and `changesAtMusaf` is true. `talUmatar`: "v'sein tal umatar" is asked from the start date (see {@link talUmatarStart}) until Mincha of Erev Pesach (SA OC 117:1). Values describe the daytime Shacharis of `date`. |
| [`src/holidays/seasonal.ts:81`](https://github.com/yskolnick/luach/blob/main/src/holidays/seasonal.ts#L81) | Shmuel's tekufas Nisan returns to the start of Wednesday (Tuesday 6 pm) every 28 years (Berachos 59b; SA OC 229:2). That happens on 26 March (Julian) in years ≡ 1981 mod 28; the blessing is said that Wednesday morning, e.g. 8 April 1981, 2009, 2037. |
| [`src/holidays/tefillah.ts:5`](https://github.com/yskolnick/luach/blob/main/src/holidays/tefillah.ts#L5) | Customs differ widely, above all for Tachanun. The defaults follow common Ashkenazi practice (SA OC 131:6–7 with Rema; Mishna Berura there) and are *defaults*, not rulings; each custom that commonly differs is an option. Ask your rav. |
| [`src/holidays/tefillah.ts:67`](https://github.com/yskolnick/luach/blob/main/src/holidays/tefillah.ts#L67) | Hallel (Arachin 10a; SA OC 422:2, 488:1, 490:4, 494:1, 644:1, 683:1) |
| [`src/holidays/tefillah.ts:76`](https://github.com/yskolnick/luach/blob/main/src/holidays/tefillah.ts#L76) | Tachanun (SA OC 131:6–7 with Rema; Rema 494:3 and MB 131:36 for Sivan; SA OC 697:1 for Purim Katan) |
| [`src/holidays/tefillah.ts:97`](https://github.com/yskolnick/luach/blob/main/src/holidays/tefillah.ts#L97) | Mizmor L'Sodah: not on Shabbos/Yom Tov, Erev Pesach, Chol Hamoed Pesach, Erev Yom Kippur (Rema OC 51:9). |
| [`src/learning/bavli.ts:2`](https://github.com/yskolnick/luach/blob/main/src/learning/bavli.ts#L2) | Daf Yomi (Babylonian Talmud, Vilna pagination): one folio (daf) a day. |
| [`src/learning/cycles.ts:110`](https://github.com/yskolnick/luach/blob/main/src/learning/cycles.ts#L110) | Amud HaYomi (Dirshu): one amud a day, from Berachos 2a on 1 Cheshvan 5784 (16 October 2023), every day. How the cycle will handle Kinnim, Tamid and Middos after Me'ilah 22a (February 2038) is not yet published; until it is, this returns null from that point. |
| [`src/learning/cycles.ts:182`](https://github.com/yskolnick/luach/blob/main/src/learning/cycles.ts#L182) | Rambam |
| [`src/learning/cycles.ts:243`](https://github.com/yskolnick/luach/blob/main/src/learning/cycles.ts#L243) | Rambam, one chapter a day (Chabad cycle from 27 Nisan 5744, 29 April 1984; 1,017 days). |
| [`src/learning/cycles.ts:252`](https://github.com/yskolnick/luach/blob/main/src/learning/cycles.ts#L252) | Rambam, three chapters a day (Chabad cycle from 27 Nisan 5744; 339 days). |
| [`src/learning/cycles.ts:263`](https://github.com/yskolnick/luach/blob/main/src/learning/cycles.ts#L263) | The day number of Sefer HaMitzvos (Chabad), which runs in parallel with the three-chapter Rambam cycle (Day 1 is that cycle's first day; chabad.org shows "Day 1" on 1 March 2025, the start of a three-chapter cycle). The mitzvos for each day come from a published table that Luach does not ship. |
| [`src/parsha/haftara.ts:4`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L4) | Precedence on Shabbos (docs/research/2026-10-21-haftaros.md; SA OC 425, 428, 684, 685 with Rema and Mishna Berura): |
| [`src/parsha/haftara.ts:7`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L7) | 1. Yom Tov and Chol Hamoed have their own haftara. 2. The four parshiyos (Shekalim, Zachor, Parah, HaChodesh) displace Rosh Chodesh and Machar Chodesh (Rema 425:1; SA 685:1). Chabad adds the first and last verses of the displaced haftara. 3. Shabbos Chanukah displaces Rosh Chodesh Teves (SA 684:3) and Machar Chodesh. 4. Shabbos Shuva (SA OC 428:8). Ashkenazim add verses after Hosea 14; by default Micah with Vayelech and Joel with Haazinu (MB 428:23; see `shuvaAddition`). 5. The three haftaros of affliction (the Shabbosos before Tisha B'Av; the third is Devarim's own) and the seven of consolation (after Tisha B'Av). Rosh Chodesh Av keeps the second of affliction by default (MB 425:8; see `roshChodeshAv`). Rosh Chodesh Elul on Shabbos: Ashkenazim and Chabad read Rosh Chodesh's and make up Re'eh's on Ki Seitzei (Rema 425:1; MB 425:7); Sephardim keep Re'eh's (SA 425:1; see `roshChodeshElul`). 6. Shabbos HaGadol, by custom (see `shabbosHagadol`). 7. Shabbos Rosh Chodesh (with the first and last verses of Machar Chodesh added by Sephardim and Chabad when Sunday is also Rosh Chodesh), then Machar Chodesh. 8. Otherwise the parsha's own; for joined parshiyos the second one's, except Acharei Mos–Kedoshim, where Ashkenazim and Chabad read Acharei Mos's (Rema OC 428:8). Ashkenazim read Kedoshim's "Hatishpot" (Ezekiel 22) only because Acharei Mos's "Halo kivnei kushiyim" (Amos 9) was already read; so when Acharei Mos fell on Machar Chodesh, Kedoshim reads Amos 9 (MB 428:26, citing R. Akiva Eiger: "וה"ה אם שבת פ' אחרי היה ער"ח ומפטירין מחר חודש דמפטירין בשבת פרשת קדושים הלוא כבני כושיים"). The MB names Machar Chodesh; Luach applies its reason to any special haftara that displaced Acharei Mos's, such as Shabbos HaGadol (*as built*). |
| [`src/parsha/haftara.ts:57`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L57) | Ashkenaz only: the verses added after Hosea 14 on Shabbos Shuva, so the haftara does not end on "ופושעים יכשלו בם" (MB 428:23). `'dagulMervava'` (default): Micah 7:18-20 when the parsha is Vayelech, Joel 2:15-27 when it is Haazinu (the Dagul Mervava, as MB 428:23 records him); `'micah'` or `'joel'` always; `'both'` (the Prague custom, per the Eliyahu Rabba in MB 428:23), in book order, Joel then Micah (*as built*). The MB ends that all follow the local custom. |
| [`src/parsha/haftara.ts:66`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L66) | Rosh Chodesh Av on Shabbos. `'affliction'` (default, all minhagim): the second haftara of affliction, "Shim'u" (the first view in the Rema OC 425:1; MB 425:8: the Gra rules so). `'roshChodesh'`: Isaiah 66, "השמים כסאי", which the Rema calls primary where there is no custom ("וי"א השמים כסאי וכן עיקר במקום שאין מנהג", Rema OC 425:1). |
| [`src/parsha/haftara.ts:73`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L73) | Rosh Chodesh Elul on Shabbos Re'eh. `'consolation'`: Re'eh's own, "Aniya So'ara" (SA OC 425:1); default for Sephardi and Teimani. `'roshChodesh'`: Isaiah 66 (Rema OC 425:1: "וכן נוהגים במדינות אלו"), with Re'eh's haftara added after Ki Seitzei's two weeks later so none of the seven is skipped (MB 425:7); default for Ashkenaz and Chabad. |
| [`src/parsha/haftara.ts:176`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L176) | Ki Seitzei's own, then Re'eh's (MB 425:7: "יסיימו גם בעניה סוערה הכתובה אחריה"). |
| [`src/parsha/haftara.ts:208`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L208) | Ashkenazi Shabbos Shuva: Hosea 14 and the verses added after it (MB 428:23). |
| [`src/parsha/haftara.ts:236`](https://github.com/yskolnick/luach/blob/main/src/parsha/haftara.ts#L236) | Communal fasts only (SA OC 566:1). Taanis Bechoros is the firstborn's fast (SA OC 470:1) and has no reading. |
| [`src/parsha/parsha.ts:8`](https://github.com/yskolnick/luach/blob/main/src/parsha/parsha.ts#L8) | Seven pairs may be read together on one Shabbos when there are fewer Shabbosos than parshiyos (Vayakhel–Pekudei, Tazria–Metzora, Acharei Mos–Kedoshim, Behar–Bechukosai, Chukas–Balak, Matos–Masei, Nitzavim–Vayelech). The schedule is fixed by deadlines (Tur and Shulchan Aruch OC 428:4): |
| [`src/parsha/parsha.ts:13`](https://github.com/yskolnick/luach/blob/main/src/parsha/parsha.ts#L13) | in a common year Tzav is read before Pesach, in a leap year Metzora; Bamidbar before Shavuos; Devarim on the Shabbos before Tisha B'Av (Shabbos Chazon), Vaeschanan after it; Nitzavim before Rosh Hashana; Haazinu before Sukkos. |
| [`src/parsha/parsha.ts:105`](https://github.com/yskolnick/luach/blob/main/src/parsha/parsha.ts#L105) | Shabbosos with no parsha: Yom Tov or Chol Hamoed (and Yom Kippur). Between Rosh Hashana and Sukkos the only such days are 1–2 Tishrei and 10 Tishrei (Vayikra 23:24, 23:27); a Shabbos there past the supported range has no date and is left out of the result. |
| [`src/parsha/parsha.ts:197`](https://github.com/yskolnick/luach/blob/main/src/parsha/parsha.ts#L197) | `'roshHashana'` (default): the whole summer (Rema OC 292:2). `'shavuos'`: one round on the Shabbosos between Pesach and Shavuos, "כל שבת פרק א'", the custom the Kaf HaChaim records (292:23). |
| [`src/parsha/parsha.ts:204`](https://github.com/yskolnick/luach/blob/main/src/parsha/parsha.ts#L204) | The chapter of Pirkei Avos read on a summer Shabbos afternoon (between Pesach and Rosh Hashana; Rema OC 292:2 records the custom). Chapters 1–6 are read in order, one each Shabbos, and repeated. Skipped, without losing a chapter: a Shabbos that is Yom Tov; Erev Tisha B'Av, 8 Av (Rema OC 553:2: "אם חל בשבת אין אומרים פרקי אבות"); and 9 Av, when the fast is postponed to Sunday. In the last weeks before Rosh Hashana, when fewer than six Shabbosos remain for a full round, some double up the chapters so the year ends with chapter 6 (`cycle: 'doubled'`); the default, `cycle: 'single'`, keeps one chapter a week (*as built*). With `until: 'shavuos'`, one round of chapters 1–6 before Shavuos (Kaf HaChaim 292:23); in Israel, when the first Shabbos after Pesach is 22 Nisan, there are seven Shabbosos and the seventh returns null, since the source does not say what is read then (*as built*). Returns null outside the season or when not read. |
| [`src/parsha/parsha.ts:231`](https://github.com/yskolnick/luach/blob/main/src/parsha/parsha.ts#L231) | Erev Tisha B'Av (Rema OC 553:2); 9 Av on Shabbos, when the fast is on Sunday. |
| [`src/places/full.ts:2`](https://github.com/yskolnick/luach/blob/main/src/places/full.ts#L2) | `luach/places-full`: every city of 15,000+ people (about 34,000), from GeoNames (https://www.geonames.org/), CC-BY 4.0. A separate entry point so that the main bundle stays small. Use it with `searchPlaces(query, { places: fullPlaces() })`. |
| [`src/places/places.ts:6`](https://github.com/yskolnick/luach/blob/main/src/places/places.ts#L6) | City data: GeoNames (https://www.geonames.org/), licensed CC-BY 4.0. Country codes are GeoNames' (ISO 3166) and are not used to decide anything; the `israel` flag comes from {@link isInIsrael}. |
| [`src/places/places.ts:10`](https://github.com/yskolnick/luach/blob/main/src/places/places.ts#L10) | No geocoding service is built in, and nothing here makes a network call. To find the user's location, use the platform (the browser Geolocation API, expo-location, …) and pass the coordinates and the device's IANA zone; see the docs, "Places". |
| [`src/places/places.ts:32`](https://github.com/yskolnick/luach/blob/main/src/places/places.ts#L32) | IANA zone. |
| [`src/places/places.ts:34`](https://github.com/yskolnick/luach/blob/main/src/places/places.ts#L34) | ISO 3166 country code, as given by GeoNames. |
| [`src/time/civil.ts:7`](https://github.com/yskolnick/luach/blob/main/src/time/civil.ts#L7) | The arithmetic is the era-based method published by Howard Hinnant in "chrono-Compatible Low-Level Date Algorithms" (placed in the public domain), re-implemented here. It is exact for every year JavaScript numbers can hold. |
| [`src/time/zone.ts:4`](https://github.com/yskolnick/luach/blob/main/src/time/zone.ts#L4) | Offsets always come from the IANA time-zone database through `Intl.DateTimeFormat`. Luach never derives a "standard offset" from a zone or from longitude: doing that puts zmanim on the wrong civil day near the date line (Sydney, Auckland, Chatham) and across DST changes. |
| [`src/time/zone.ts:25`](https://github.com/yskolnick/luach/blob/main/src/time/zone.ts#L25) | An IANA zone name such as `"America/New_York"`, or a custom provider. |
| [`src/time/zone.ts:63`](https://github.com/yskolnick/luach/blob/main/src/time/zone.ts#L63) | Throws a RangeError if `zone` is not an IANA zone name this runtime knows. |
| [`src/zmanim/calendar.ts:16`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L16) | The day is the civil date in the location's IANA time zone. The sun is followed from that day's local noon, so places near the date line (Chatham, Auckland, Sydney) get their own day's times. |
| [`src/zmanim/calendar.ts:40`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L40) | IANA zone name (e.g. "Asia/Jerusalem") or a provider. |
| [`src/zmanim/calendar.ts:295`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L295) | Seasonal hour of the Magen Avraham, 72 fixed minutes. |
| [`src/zmanim/calendar.ts:297`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L297) | Seasonal hour of the Magen Avraham, 90 fixed minutes. |
| [`src/zmanim/calendar.ts:299`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L299) | Seasonal hour of the Magen Avraham, 72 proportional minutes. |
| [`src/zmanim/calendar.ts:301`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L301) | Seasonal hour of the Magen Avraham, 90 proportional minutes. |
| [`src/zmanim/calendar.ts:303`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L303) | Seasonal hour of the Magen Avraham, 16.1°. |
| [`src/zmanim/calendar.ts:314`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L314) | Latest Shema, Magen Avraham (72 fixed minutes). |
| [`src/zmanim/calendar.ts:316`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L316) | Latest Shema, Magen Avraham (90 fixed minutes). |
| [`src/zmanim/calendar.ts:318`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L318) | Latest Shema, Magen Avraham (72 proportional minutes). |
| [`src/zmanim/calendar.ts:320`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L320) | Latest Shema, Magen Avraham (90 proportional minutes). |
| [`src/zmanim/calendar.ts:322`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L322) | Latest Shema, Magen Avraham (16.1°). |
| [`src/zmanim/calendar.ts:330`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L330) | Latest Shacharis, Magen Avraham (72 fixed minutes). |
| [`src/zmanim/calendar.ts:332`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L332) | Latest Shacharis, Magen Avraham (90 fixed minutes). |
| [`src/zmanim/calendar.ts:334`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L334) | Latest Shacharis, Magen Avraham (72 proportional minutes). |
| [`src/zmanim/calendar.ts:336`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L336) | Latest Shacharis, Magen Avraham (90 proportional minutes). |
| [`src/zmanim/calendar.ts:338`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L338) | Latest Shacharis, Magen Avraham (16.1°). |
| [`src/zmanim/calendar.ts:357`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L357) | Mincha Gedola, Magen Avraham (72 fixed minutes): 6.5 hours into the MGA day. |
| [`src/zmanim/calendar.ts:363`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L363) | Mincha Ketana, Magen Avraham (72 fixed minutes). |
| [`src/zmanim/calendar.ts:369`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L369) | Plag HaMincha, Magen Avraham (72 fixed minutes). |
| [`src/zmanim/calendar.ts:371`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L371) | Plag HaMincha, Magen Avraham (16.1°). |
| [`src/zmanim/calendar.ts:376`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L376) | Plag HaMincha, Levush: the same calculation as the Gra (see the source note). |
| [`src/zmanim/calendar.ts:436`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L436) | Latest time to eat chametz, Magen Avraham 72 (only on 14 Nisan). |
| [`src/zmanim/calendar.ts:440`](https://github.com/yskolnick/luach/blob/main/src/zmanim/calendar.ts#L440) | Latest time to burn chametz, Magen Avraham 72 (only on 14 Nisan). |
| [`src/zmanim/solar.ts:2`](https://github.com/yskolnick/luach/blob/main/src/zmanim/solar.ts#L2) | The position of the sun and the times it crosses a given altitude, after the NOAA Solar Calculator (NOAA Global Monitoring Laboratory; a US Government work in the public domain), which implements the low-precision solar theory in Jean Meeus, *Astronomical Algorithms*, chapters 25 and 28. Accuracy is about a minute for latitudes within ±72°. |
| [`src/zmanim/usno.ts:16`](https://github.com/yskolnick/luach/blob/main/src/zmanim/usno.ts#L16) | Sun at `zenith` on the solar day nearest `transit` (an approximate local noon instant), rising or setting, by the USNO method. |

## Data that ships

Every table in the package, its source and licence, is in [data sources](./data-sources).
In short: calendar constants from the Rambam; city coordinates, elevations, time zones and
Hebrew names from GeoNames (<https://www.geonames.org/>, CC-BY 4.0, credited in NOTICE);
learning-cycle structure (counts and order, no text) from Sefaria's public structure data,
checked against the cycles' published calendars; haftara verse references from the sources
in the haftaros research note.

## Clean room

Luach is written from primary and public-domain sources. Code, tables and structure from
hebcal (GPL), KosherJava and kosher-zmanim (LGPL), KosherCocoa and the code of *Calendrical
Calculations* are never copied. Some of them are installed only as test oracles: their output
is compared with Luach's, and nothing in `src/` imports them (`npm run check:imports` and
`npm run check:licenses` enforce this). See [`docs/decisions/0002-licence-and-clean-room.md`](https://github.com/yskolnick/luach/blob/main/docs/decisions/0002-licence-and-clean-room.md).

### Test oracles and tools

Development dependencies only; none ships in the package.

| Package | Licence | Used for |
|---|---|---|
| `@babel/core` | MIT | Build, test or docs tooling |
| `@babel/preset-env` | MIT | Build, test or docs tooling |
| `@hebcal/core` | GPL-2.0-or-later | Calendar, holidays and parsha, compared day by day |
| `@hebcal/learning` | BSD-2-Clause | Learning cycles, compared day by day |
| `@hebcal/leyning` | BSD-2-Clause | Haftaros, compared Shabbos by Shabbos |
| `@types/node` | MIT | Build, test or docs tooling |
| `ajv` | MIT | Validates day output against its JSON Schema |
| `astronomy-engine` | MIT | Independent solar positions (date-line and grazing-angle cases) |
| `esbuild` | MIT | Build, test or docs tooling |
| `eslint` | MIT | Build, test or docs tooling |
| `fast-check` | MIT | Build, test or docs tooling |
| `ical.js` | MPL-2.0 | Parses generated iCalendar files |
| `kosher-zmanim` | LGPL-3.0 | Zmanim, compared value by value |
| `playwright` | Apache-2.0 | Build, test or docs tooling |
| `tsup` | MIT | Build, test or docs tooling |
| `typedoc` | Apache-2.0 | Build, test or docs tooling |
| `typedoc-plugin-markdown` | MIT | Build, test or docs tooling |
| `typedoc-vitepress-theme` | MIT | Build, test or docs tooling |
| `typescript` | Apache-2.0 | Build, test or docs tooling |
| `typescript-eslint` | MIT | Build, test or docs tooling |
| `vitepress` | MIT | Build, test or docs tooling |
| `vitest` | MIT | Build, test or docs tooling |

## Decisions

Yosef Skolnick decides. A *Decided* entry quotes his words; a proposal (P) or question (Q)
carries a default that is in effect until he answers; *As built* marks choices nobody made
explicitly. Full text: [`DECISIONS.md`](https://github.com/yskolnick/luach/blob/main/DECISIONS.md).

| Id | Decision | Status |
|---|---|---|
| D-01 | The name is Luach | Decided |
| D-04 | One implementation: `main` | Decided |
| Q-00 | Unmerged branches | Open questions |
| Q-01 | Licence: Apache-2.0 with NOTICE, or MIT | Open questions |
| Q-02 | How credit should read | Open questions |
| Q-04 | Anniversary rules (30 Adar I, 30 Cheshvan/Kislev defaults) | Open questions |
| Q-05 | Modern Israeli days before their amendments | Open questions |
| Q-06 | The example citation in the brief | Open questions |
| P-01 | Apache-2.0 with a NOTICE file | Proposals |
| P-02 | Zero runtime dependencies; TypeScript, tsup, Vitest, ESLint | Proposals |
| P-03 | Days counted from 1970-01-01; months numbered from Nisan | Proposals |
| P-04 | Supported range: Hebrew years 1–9999, proleptic Gregorian | Proposals |
| P-05 | Move table-only learning cycles after 1.0 | Proposals |
| P-06 | What `isInIsrael` covers | Proposals |
| P-07 | Per-module ESM output and name tables | Proposals |

### Architecture decision records

- [`docs/decisions/0001-record-decisions.md`](https://github.com/yskolnick/luach/blob/main/docs/decisions/0001-record-decisions.md): 0001. Record decisions in DECISIONS.md and ADRs
- [`docs/decisions/0002-licence-and-clean-room.md`](https://github.com/yskolnick/luach/blob/main/docs/decisions/0002-licence-and-clean-room.md): 0002. Apache-2.0 and a clean-room implementation
- [`docs/decisions/0003-tooling-and-zero-dependencies.md`](https://github.com/yskolnick/luach/blob/main/docs/decisions/0003-tooling-and-zero-dependencies.md): 0003. TypeScript, zero runtime dependencies, tsup, Vitest, ESLint
- [`docs/decisions/0004-calendar-representation.md`](https://github.com/yskolnick/luach/blob/main/docs/decisions/0004-calendar-representation.md): 0004. Day count, month numbering and supported range
- [`docs/decisions/0005-build-output-and-name-tables.md`](https://github.com/yskolnick/luach/blob/main/docs/decisions/0005-build-output-and-name-tables.md): 0005. Per-module ESM output and per-module name tables

## Research notes and reports

Each note records what was read, where, and what was concluded.

- [`docs/research/2026-10-21-citation-audit-code.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-citation-audit-code.md): Citation audit of the calendar, holiday and reading code (2026-10-21)
- [`docs/research/2026-10-21-citation-audit-zmanim.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-citation-audit-zmanim.md): Citation audit of the zmanim sources (2026-10-21)
- [`docs/research/2026-10-21-citation-check-m1-m2.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-citation-check-m1-m2.md): Citation check, milestones M1–M2 (2026-10-21)
- [`docs/research/2026-10-21-haftaros.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-haftaros.md): Haftaros by minhag: research notes
- [`docs/research/2026-10-21-israeli-commemorations.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-israeli-commemorations.md): Israeli official commemorations set by Hebrew date
- [`docs/research/2026-10-21-learning-cycles.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-learning-cycles.md): Daily learning cycles: start dates, units and structure
- [`docs/research/2026-10-21-modern-israeli-days.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-modern-israeli-days.md): Modern Israeli days: rules and their history (2026-10-21)
- [`docs/research/2026-10-21-what-users-want.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-what-users-want.md): What users want from Hebrew calendar and zmanim libraries
- [`docs/research/2026-10-21-zmanim-opinions.md`](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-zmanim-opinions.md): Zmanim opinions: definitions, holders, sources (research notes)
- [`docs/accuracy.md`](https://github.com/yskolnick/luach/blob/main/docs/accuracy.md): Accuracy report
- [`docs/accuracy-zmanim.md`](https://github.com/yskolnick/luach/blob/main/docs/accuracy-zmanim.md): Zmanim accuracy (generated)
- [`docs/data-sources.md`](https://github.com/yskolnick/luach/blob/main/docs/data-sources.md): Data sources
- [`ROADMAP.md`](https://github.com/yskolnick/luach/blob/main/ROADMAP.md): Luach roadmap

