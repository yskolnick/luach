# What users want from a Hebrew calendar + zmanim library (research note, 2026-10-21)

Scope: GitHub issue trackers of the three main JS/Java zmanim libraries, developer Q&A, community
app feedback, feature sets of leading luach/zmanim products, requested zmanim opinions and
candle-lighting customs, learning-cycle data, and licences. Nothing below copies code or data tables
from GPL/LGPL projects; all figures are summarised from documentation pages.

Method caveats: `stackoverflow.com` and `reddit.com` refuse automated fetches, and web search did not
surface any individual Reddit or Stack Overflow thread. Sections 2 and 3 therefore rely on the next
best public signals (library Q&A forums, app-vendor support pages, app-store reviews, an aggregator)
and are marked as such. Everything else was read directly.

## 1. GitHub issue themes (hebcal-es6, hebcal-js, KosherJava/zmanim, kosher-zmanim)

Repos scanned: hebcal/hebcal-es6 (90 issues, 4 open) [1-4], hebcal/hebcal-js (68 issues, deprecated)
[5-6], KosherJava/zmanim (58 issues) [7-9], BehindTheMath/KosherZmanim (16 issues) [10].

**kosher-zmanim #37 confirmed.** Title: *"TimeZone.getRawOffset() is sign-inverted in DST zones,
causing false antimeridian adjustment"*. The DST branch of the raw-offset derivation negates the
result, so the antimeridian adjustment returns +1 for Sydney and Auckland and their zmanim land on
the following civil day; New York, Melbourne, Chatham and Dublin are also discussed. It is still
open; the maintainer's plan is to drop `getRawOffset()` entirely, matching upstream KosherJava
(whose own "far east time zones (+14:00) are one day off" bug was #117) [11][9].

Top recurring themes, roughly by frequency and severity:

1. **Timezone / DST bugs.** kosher-zmanim #2, #9, #15 (Asia/Jerusalem wrong), #37 (above);
   hebcal-es6 #786 (times 60 min early in the repeated DST hour because rounding used local-time
   `Date` setters; fixed by switching to UTC setters, verified against 501k NOAA samples) [12];
   KosherJava #117, #178 (kiddush levana across DST boundary); hebcal-js #23, #30 [6][9][10].
2. **Bundle size / tree-shaking / module format.** hebcal-es6 #475 (150 kB minified for a trivial
   script; fixed by standalone exports, app chunk 258→151 kB; closed Apr 2026) [13]; #647 dropped
   CJS/Node 16; kosher-zmanim #25 "Add ESM bundle" (Deno/Bun/browser users hit a missing `Big`
   export) and #28 "Replace Luxon with Temporal" (both open) [10][14][15].
3. **Bundler / runtime environment problems.** hebcal-es6 #18 Expo/React Native (bundler picked the
   non-module `browser` IIFE; fixed by removing the `browser` key) [16]; #358 Vite, #448 Google Apps
   Script, #395 `Intl.DateTimeFormat` "incompatible receiver", #371/#343/#357 TypeScript typings [2-3].
4. **Hebrew date should change at sunset.** hebcal-es6 #450, #383, #546, #19 → `makeSunsetAwareHDate`
   added in 5.5.0 [17]; KosherJava #139 (open since 2019: `isAssurBemelacha` true after nightfall
   on Motzaei Shabbat, maintainer says the calendar "has no concept of time") [18].
5. **Israel vs diaspora.** hebcal-es6 #780 (explicit `il:false` overwritten by location), #792 (open:
   Tish'a B'Av ends at 6.45° in the diaspora while minor fasts use 7.083°, a leak of an Israeli
   custom) [19]; hebcal-js #62 parsha after Pesach; KosherJava #191 getParsha [1][5][8].
6. **High-latitude nulls.** hebcal-es6 #580 (Warsaw: 16.1° dawn never reached for ~6 weeks → "Invalid
   Date"/RangeError; mitigated with a 72-minute alot method, still null where there is no sunrise)
   [20]; KosherJava #264 (chatzos should be null when sunrise is null), #248 NPE; docs promise null /
   `Long.MIN_VALUE` near the Arctic and Antarctic circles [21].
7. **Elevation and "visible sunrise" (netz ha-nireh).** hebcal-es6 #354 "Ofek Yerushalayim" led to
   opt-in `useElevation` in 5.0.0 after Jerusalem luchot differed by 3–5 min [22]; #420 (open) asks
   for visible sunrise, which needs a digital elevation model [23]; KosherJava forum: elevation is
   never applied to degree-based zmanim [24].
8. **Matching a specific printed luach.** hebcal-es6 #679 (few minutes vs Chabad.org in Brooklyn),
   #419 (vs Itim LeVina), #354; KosherJava Q&A: ~2-minute diffs come from coordinates and rounding [24].
9. **Rounding.** #786 above; hebcal rounds Friday candle-lighting down to the whole minute so the
   displayed time is never later than computed [25].
10. **Choice of opinion / temporal hour.** hebcal-es6 #380 (MGA 16.1° shema), #447 (mincha ketana
    72), KosherJava #173 (pass which shaah zmanis to use; implemented) [26].
11. **Candle-lighting customs.** hebcal-es6 #340, #548 (Pesach), #451 (flags on Ha'azinu), #201;
    hebcal-js #53 (Jerusalem) [3][6].
12. **Learning cycles.** hebcal-es6 #247 Yerushalmi Yomi, #466, #163/hebcal-js #47 (Tamid 34 should
    be Midot 34); KosherJava #126 Daf Yomi miscalculation, #207/#204 Yerushalmi daf boundaries and
    names [3][6][8-9].
13. **Hebrew formatting / RTL / transliteration.** hebcal-es6 #290 (gematriya without nikud), #449,
    #499 (open), #646; hebcal-js #61 (apostrophe vs geresh), #32, #56; KosherJava #171 (open: Hebrew
    and English labels for every zman), #235, #215 [2-3][5][8].
14. **Holiday/tefilla rules.** KosherJava #198, #218, #201, #160; kosher-zmanim #20 "Add tefilla
    rules"; hebcal-es6 #784 (tachanun in Tishrei), #617 (`isAveilut`, `isFastDay`), #445 (eruv
    tavshilin), #436 (BeHaB, selichot) [1][2][8][10].
15. **Export / interop.** hebcal-es6 #56 iCloud, #181 custom export, #226 "few shabbat in advance"
    API; hebcal-js #93 ES5 monolith, #86 SSR [3-5].
16. **Licence questions.** hebcal-es6 #129 "GPL License" and #790; KosherJava #184 "Apache or MIT?",
    #115, #106; kosher-zmanim #35 "no license" — people repeatedly ask for a permissive licence [3][9][10].
17. **Range / history.** KosherJava #180 (go back to ~500 BCE), hebcal-js #84 (RangeError year
    3765), #55 (dates before Gregorian year 1) [5][8].

## 2. Developer Q&A (Stack Overflow could not be fetched; proxies used)

Web search returned no Stack Overflow pages for any Hebrew-date/zmanim query, so this is inferred
from what surfaced instead: library READMEs that point users to Stack Overflow and the KosherJava Q&A
forum.

- The dominant question is Gregorian→Hebrew→Gregorian conversion in plain JS. The native
  `toLocaleDateString('en-US-u-ca-hebrew')` route is widely known, but it only goes one way and the
  `he-date` README warns its output is "not 100% correct" for some dates (it cites a 2046 example)
  [27]. Small packages (`hebrew-date`, `jewish-date`, `he-date`, `@hebcal/hdate`) exist for this [27-29].
- Hebcal explicitly recommends its native JS library over the REST API "for a faster experience",
  which implies people were calling the HTTP converter from browser code [30].
- React Native/Hermes: Intl on Android works "out of the box with Hermes from RN 0.66"; older
  JSC builds ship a subset of locales, and `toLocaleString` on Android is a long-running pain [31].
- KosherJava Q&A forum recurring questions: device/process timezone differs from location
  (Israel user seeing yesterday's sunset); ~3-minute offsets caused by elevation; "why no visible
  sunrise"; which calculator/opinion a site uses; whether elevation affects degree-based tzais
  (it does not) [24].

## 3. Community feedback on luach/zmanim apps (Reddit could not be fetched; proxies used)

- Hebcal's own support page lists the top complaints: wrong zmanim when location permission is off
  or GPS is weak indoors; parsha shown for the diaspora unless "I am in Israel" is on; app freezes;
  notification failures [32].
- Chabad.org Android reviews praise the bundle (articles, zmanim, daily study, candle-lighting) and
  complain about white-screen crashes and login problems [33].
- MyZmanim is praised for accuracy and location precision ("exact location rather than nearest
  city", arrows showing whether each zman is getting earlier or later); an aggregator reports
  mandatory phone-number registration as the common complaint [34][35].
- Pocket Luach reviews mention Yom HaZikaron/Yom HaAtzmaut shown on the wrong day one year and
  start-up crashes after OS updates [36].
- KosherJava's docs say "one of the more common complaints about incorrect zmanim" is a device set
  to the wrong timezone after travel [24].

## 4. Feature sets of leading products (facts only)

- **MyZmanim**: extended zman selection with per-zman explanations; live countdowns; PDF calendars
  for any location; in-flight zmanim PDF by email; spreadsheet data; SMS/phone access; reminder
  alerts (mincha, candle lighting, omer) by text/email/Telegram; embeddable widget; developer API;
  published pages on degrees and on sources for tzais and misheyakir [34][37].
- **Chabad.org zmanim**: default + "additional" zmanim; Shabbat start/end as location default or
  custom minutes; Shabbat end astronomical or minutes after sunset; "visual shkiah" adjustment;
  location by city, US ZIP or lat/lon; RSS feed; printable monthly chart; 9 languages [38].
- **hebcal.com**: REST/JSON for date conversion, calendar, leyning (incl. triennial and weekday),
  Shabbat times, yahrzeit/anniversary (20 years ahead), zmanim, "assur melacha"; iCal and RSS feeds;
  embeddable widgets; location by GeoNames ID/ZIP/lat-lon; elevation on/off; no API key; 90 req/10 s
  limit [39]. Candle lighting default 18 min, Jerusalem 40, Haifa and Zikhron Ya'akov 30; havdalah
  8.5° default or 42/50/72 min; minor fasts 16.1°→7.083°; Tish'a B'Av sunset→7.083° [25].
- **KosherJava-based "Rabbi Ovadiah Yosef Calendar" (Android/iOS/WearOS)**: follows Ohr HaChaim
  luach in Israel and R' Dahan's luach abroad; per-zman explanations; visible sunrise via
  user-downloaded ChaiTables; elevation FAQ; English and Hebrew [40].
- **RustyBrick Siddur/Zmanim/Luach/Minyanim**: GPS zmanim with manual override and multiple
  locations; zmanim export to email; push zmanim subscription; luach with iCal event integration;
  minyan database; Apple Watch; four nuschaot; offline [41][42].
- **YidKit Smart Siddur**: "over 100 zman variations"; candle lighting/havdalah, chag, fast
  start/end, Chanukah and chametz zmanim; zmanim shown in the selected location's timezone, not the
  device's; siddur sections auto-shown/hidden by day; tefillin mirror; Tanach; minyan finder [43].
- **Pocket Luach**: Hebrew/civil calendar, holidays, fasts, parasha; zmanim with "fully customizable"
  calculation rules; Apple Watch glance; English and French [36][44].
- **Am Hazak**: Shabbat times for current or destination location; zmanim adjusted for Shabbat,
  High Holidays and fasts; siddur; Hebrew/English with transliteration [45].
- **Zmanim Advanced**: multiple saved locations; zmanim customisable via Lua scripts [46].
- **Zman (Tappix)**: selectable opinion presets (Satmar, Chabad, Gra) [47].

## 5. Most-requested opinions and customs

- Tzeit: 8.5° (three small stars) is the de-facto Shabbat-end default at hebcal and MyZmanim; fixed
  42/50/72 min and Rabbeinu Tam (16.1°/20° or 72/90 min) are the alternates; 7.083° and 6.45° for
  fast ends; MyZmanim cites 7.12° (R' Moshe Feinstein) and 6.45° (Eretz Yisrael custom) [25][48][49].
- Alot: 16.1° (72 min), 19.8° (90 min), ~21° (96 min); Jerusalem practice per Tucazinsky uses 20°;
  Baal HaTanya 16.9° [48][50][51].
- Candle lighting: 18 min default; Jerusalem 40; Haifa and Zikhron Ya'akov 30 (hebcal), explained by
  mountains obscuring the horizon [25][52]; Rav Moshe's "established custom" 20 min [53]; Chabad notes
  "Jerusalem and several other communities" use more than 18 year-round without naming a figure [54];
  hebcal-es6 #354 reports a Jerusalem luach matching 35 min [22]. **Tzfat**: no published offset was
  found in any source; the only Israeli exceptions documented by hebcal are Jerusalem, Haifa and
  Zikhron Ya'akov. Treat a Tzfat value as unsourced unless a local luach is cited.
- Temporal hours: Gra (sunrise–sunset) vs MGA (72-min dawn–dusk) for shema/tefilla; users ask to
  choose which shaah zmanis feeds the zmaniyos methods [26][51].

## 6. Misheyakir degrees

Standard values and what documentation attaches to them: 11.5° ≈ 52 min before sunrise in
Jerusalem at the equinox (KosherJava's article computes 11.424° equinox / 11.442° equilux, calling
11.5° a slight leniency that matters at high latitude); 11° ≈ 48 min; 10.2° ≈ 45 min (Chabad.org's
choice); 9.5° and 7.65° are listed "according to some opinions" with no authority named in the
kosher-zmanim doc comments [50][55][56]. MyZmanim's sources page gives Kaf HaChaim 60 min before
sunrise in Eretz Yisrael, Nivreshet/Bais Baruch 52 min (lechatchila 42), and minute ranges for
10.2°/11.5°/11° (the last attributed to R' Meir Posen) [49]. The Shulchan Aruch HaRav site cites
Igros Moshe 4:6 for a 35–40-minute view [57]; 7.65° is the degree equivalent commonly paired with
that, but no page explicitly ties the number 7.65 to Igros Moshe.

**12.85° has no published source.** Searches for "12.85" with misheyakir in English and Hebrew
returned nothing; neither MyZmanim's degrees page nor its sources page, nor KosherJava, nor hebcal
mention it. The nearest documented figure is ~12.9°, which one search snippet tied to 60 minutes
before sunrise in Jerusalem (the Kaf HaChaim position) but which could not be confirmed on a live
page [49][55]. Recommendation: do not ship 12.85° as a named opinion; if offered, label it
"≈60 min before sunrise in Jerusalem, equinox" and let the user supply the degree.

## 7. Learning-cycle data

- **Daf Yomi Yerushalmi (Vilna)**: started 2 Feb 1980 (Tu BiShvat 5740); ~4¼ years; skips Yom
  Kippur and Tish'a B'Av; 1,554 dapim (KosherJava constant); Berakhot = 68 [58][59][60].
- **Yerushalmi (Schottenstein/ArtScroll numbering)**: same current start 14 Nov 2022 (20 Cheshvan
  5783); ~5¾ years (hebcal-learning README says ~6); does not skip YK/9 Av; Berakhot = 94. A total
  daf count is not published on any page found; derive it from a per-tractate table [58][61].
- **Mishna Yomis**: 2 mishnayot/day, ~6-year cycle; current cycle from 21 Tevet 5782 (25 Dec 2021);
  prior starts 4 Jul 2010 and 30 Mar 2016; calendar at dafyomi.co.il [62].
- **Rambam**: three tracks since spring 1984 (3 ch/day < 1 year; 1 ch/day ~3 years; Sefer HaMitzvot
  paired with the 3-chapter track); schedules on chabad.org [63].
- **Tanya**: annual cycle restarting 19 Kislev; separate leap-year division [64][65].
- **Nach Yomi**, **Tanakh Yomi**, **929**, **Psalms (30-day)** are all in @hebcal/learning [61].
- **Chofetz Chaim** and **Shemirat HaLashon**: dafyomi.co.il lists both as 4-month cycles; the
  Chofetz Chaim Heritage Foundation's current calendar was not found online [66].
- **Daf HaYomi B'Halacha (Dirshu)**: third cycle 20 Feb 2022 – 31 Aug 2027 [61].
- **Amud HaYomi (Dirshu)**: began Berachos on Rosh Chodesh Cheshvan 5784 (15 Oct 2023) [67];
  dafyomi.co.il lists a 15-year Amud Yomi cycle [66].
- **Daf-a-Week** (and Sundays-only variant), **Perek Yomi**, **Arukh HaShulchan Yomi**, **Kitzur
  Yomi**, **Pirkei Avot (summer Shabbatot)**, **Sefer HaMitzvot** are also in @hebcal/learning,
  which is BSD-2-Clause and therefore a safe reference for cycle definitions [61].

## 8. Licences (verified)

| Component | Licence | Note |
|---|---|---|
| @hebcal/core | GPL-2.0-or-later (package.json) | issue #790 fixed "GPL-2.0" to "or later" [68][1] |
| @hebcal/learning | BSD-2-Clause | [61] |
| KosherJava/zmanim | LGPL-2.1 | LICENSE file [69] |
| kosher-zmanim | LGPL-2.1-only (package.json 0.9.0, depends on luxon + big.js) | not LGPL-3.0 as sometimes stated [70] |
| KosherCocoa | LGPL-2.1 plus a README rider | you agree not to release an app "which includes a list of zmanim as its primary function", and to honour takedown requests [71] |
| astronomy-engine | MIT; JS/npm package; sunrise/set, twilight, refraction | [72] |
| GeoNames | CC-BY-4.0 | [73] |
| Sefaria | per-version: classical texts public domain; Sefaria translations CC-BY-SA; some modern translations CC-BY-NC; one CC0 release (Urim); `license` field in the v3 texts API; code AGPL-3.0 | [74][75][76] |
| NOAA solar calculator | no licence text on the page; "research and recreational use only"; Meeus-based; ±1 min within ±72° latitude | as a US-government work it is not subject to US copyright, but NOAA disclaims certification [77][78] |

## Implications for Luach (prioritised)

1. Do all instant arithmetic in UTC epoch milliseconds; never round with local-time `Date` setters (hebcal #786).
2. Never derive a "standard offset" from January/July samples; compute offsets per instant with `Intl`/Temporal (kosher-zmanim #37, KosherJava #117).
3. Ship ESM-only, side-effect-free, per-function exports so a candle-lighting widget costs kilobytes, not 150 kB (hebcal #475, kosher-zmanim #25).
4. Zero runtime deps (no Luxon/big.js); accept Temporal when present (kosher-zmanim #28).
5. Return `null` (typed) for unreachable depressions; document it; offer minute-based fallbacks per zman (hebcal #580, KosherJava #264).
6. Make `il` an explicit, never-overwritten option, and audit every default for Israel-only leakage (hebcal #780, #792).
7. Provide a sunset-aware Hebrew date as a first-class API (hebcal #450, KosherJava #139).
8. Make elevation opt-in, apply it only to sunrise/sunset-based zmanim, never to degree-based ones (hebcal #354, KosherJava forum).
9. Expose a "visible sunrise" hook that accepts external tables (ChaiTables-style) rather than pretending to compute it (hebcal #420).
10. Candle-lighting presets: 18 default, Jerusalem 40, Haifa/Zikhron 30, plus free minutes; no Tzfat preset without a cited luach.
11. Havdalah presets: 8.5° default; 42/50/72 min; 7.083° and 6.45° for fasts; label each with its source.
12. Misheyakir presets 11.5/11/10.2 (sourced); 9.5/7.65 "some opinions"; omit or clearly flag 12.85°.
13. Let callers pick the shaah zmanis (Gra/MGA/custom dawn-dusk pair) for every zmaniyos zman (KosherJava #173).
14. Round only at render time, with a documented policy (floor for candle lighting, ceil for end-of-Shabbat).
15. Hebrew output: gematriya with/without nikud, geresh/gershayim, RTL-safe strings, labels for every zman in he/en (KosherJava #171, hebcal #290, hebcal-js #61).
16. Learning cycles: implement from BSD-licensed @hebcal/learning definitions, with both Yerushalmi numberings and the Tamid/Midot 34 fix; keep cycle start dates as data.
17. Tefilla-rule helpers (tachanun, BeHaB, selichot, isAssurBemelacha with time) are a recurring ask across all three trackers.
18. Offer iCal/JSON export helpers and a "next N Shabbatot" convenience (hebcal #56, #226).
19. Test on Expo/Hermes, Vite, Deno/Bun and Google Apps Script; avoid a `browser` package.json key.
20. Pick MIT/BSD and say so prominently; licence questions are a recurring issue on every competitor.
21. Publish a "why my times differ by 2 minutes" doc (coordinates, elevation, rounding, timezone) to pre-empt the most common support thread.

## Sources

1. https://github.com/hebcal/hebcal-es6/issues?q=is%3Aissue
2. https://github.com/hebcal/hebcal-es6/issues?q=is%3Aissue&page=2
3. https://github.com/hebcal/hebcal-es6/issues?q=is%3Aissue&page=3
4. https://github.com/hebcal/hebcal-es6/issues?q=is%3Aissue&page=4
5. https://github.com/hebcal/hebcal-js/issues?q=is%3Aissue
6. https://github.com/hebcal/hebcal-js/issues?q=is%3Aissue&page=2
7. https://github.com/KosherJava/zmanim/issues?q=is%3Aissue
8. https://github.com/KosherJava/zmanim/issues?q=is%3Aissue&page=2
9. https://github.com/KosherJava/zmanim/issues?q=is%3Aissue&page=3
10. https://github.com/BehindTheMath/KosherZmanim/issues?q=is%3Aissue
11. https://github.com/BehindTheMath/KosherZmanim/issues/37
12. https://github.com/hebcal/hebcal-es6/issues/786
13. https://github.com/hebcal/hebcal-es6/issues/475
14. https://github.com/BehindTheMath/KosherZmanim/issues/25
15. https://github.com/BehindTheMath/KosherZmanim/issues/28
16. https://github.com/hebcal/hebcal-es6/issues/18
17. https://github.com/hebcal/hebcal-es6/issues/450
18. https://github.com/KosherJava/zmanim/issues/139
19. https://github.com/hebcal/hebcal-es6/issues/792
20. https://github.com/hebcal/hebcal-es6/issues/580
21. https://github.com/BehindTheMath/KosherZmanim/blob/master/src/ComplexZmanimCalendar.ts
22. https://github.com/hebcal/hebcal-es6/issues/354
23. https://github.com/hebcal/hebcal-es6/issues/420
24. https://kosherjava.com/zmanim-project/zmanim-q-a-forum/
25. https://www.hebcal.com/home/4463/candle-lighting-havdalah-fast-times
26. https://github.com/KosherJava/zmanim/issues/173
27. https://github.com/AvrahamO/he-date
28. https://github.com/Shmulik-Kravitz/jewish-date
29. https://cdn.jsdelivr.net/npm/@hebcal/hdate@0.22.0/README.md
30. https://www.hebcal.com/home/219/hebrew-calendar-rest-api
31. https://github.com/SharfMohiuddin/react-native-paper-dates
32. https://www.hebcal.co.il/post/answers-to-common-issues?lang=en
33. https://play.google.com/store/apps/details?id=org.chabad.mobile&hl=en_US
34. https://apps.apple.com/us/app/myzmanim/id1450374488
35. https://marlvel.ai/apps/myzmanim
36. https://apps.apple.com/app/id285016304
37. https://www.myzmanim.com/read/overview.aspx
38. https://www.chabad.org/calendar/zmanim.htm
39. https://www.hebcal.com/home/developer-apis
40. https://github.com/Elyahu41/RabbiOvadiahYosefCalendarApp
41. https://apps.apple.com/us/app/siddur-zmanim-luach-minyanim/id286478367
42. https://www.rustybrick.com/siddur
43. https://apps.apple.com/us/app/-/id962044994
44. https://apps.apple.com/app/id376005314
45. https://apps.apple.com/app/id6469804094
46. https://apps.apple.com/app/id335372293
47. https://apps.apple.com/us/app/-/id6743945901
48. https://en.wikipedia.org/wiki/Zmanim
49. https://www.myzmanim.com/read/sources.aspx
50. https://kosherjava.com/?p=4859
51. https://www.hebcal.com/home/1663/zmanim-halachic-times
52. https://en.wikipedia.org/wiki/Shabbat_candles
53. https://www.etzion.org.il/sites/default/files/05lighti.doc
54. https://www.chabad.org/library/article_cdo/aid/134527/jewish/About-Our-Zmanim-Calculations.htm
55. https://www.myzmanim.com/read/degrees.aspx
56. https://www.chabad.org/3209349
57. https://shulchanaruchharav.com/?p=13111
58. https://www.hebcal.com/home/4348/yerushalmi-yomi
59. https://kosherjava.com/zmanim/docs/api/src-html/com/kosherjava/zmanim/hebrewcalendar/YerushalmiYomiCalculator.html
60. https://www.dafyomi.co.il/yeru_picker_daf.php
61. https://github.com/hebcal/hebcal-learning
62. https://en.wikipedia.org/wiki/Mishnah_Yomis
63. https://en.wikipedia.org/wiki/Daily_Rambam_Study
64. https://www.chabad.org/library/article_cdo/aid/6031317/jewish/What-Is-Chitas-The-Daily-Study-Program.htm
65. https://www.chitas.org/whatischitas
66. https://dafyomi.co.il/calendars/yomi/ymi80-41.htm
67. https://jewishlink.news/new-amud-hayomi-program-to-begin-on-rosh-chodesh-cheshvan/
68. https://raw.githubusercontent.com/hebcal/hebcal-es6/main/package.json
69. https://raw.githubusercontent.com/KosherJava/zmanim/master/LICENSE
70. https://raw.githubusercontent.com/BehindTheMath/KosherZmanim/master/package.json
71. https://github.com/MosheBerman/KosherCocoa
72. https://github.com/cosinekitty/astronomy
73. https://www.geonames.org/about.html
74. https://www.sefaria.org/llms.txt
75. https://developers.sefaria.org/reference/tutorial-dvar-torah-outliner
76. https://www.sefaria.org/sheets/299298
77. https://gml.noaa.gov/grad/solcalc/calcdetails.html
78. https://www.usa.gov/government-copyright
