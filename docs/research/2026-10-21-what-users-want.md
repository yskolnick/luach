# What users want from Hebrew calendar and zmanim libraries

- Date: 2026-10-21
- Purpose: Background research for Luach, a clean-room, Apache-2.0 JavaScript/TypeScript Hebrew calendar and zmanim library. It records what developers and end users ask for, and which bugs other libraries have had, so the roadmap and the regression tests reflect real demand.
- Method: Reading public GitHub issue trackers (open and closed), Stack Overflow (through the Stack Exchange API), app-store listings and product pages. **No code was copied or read for implementation purposes.** Only facts about requested features and reported behavior are recorded here, each with its source.
- Limits: Reddit was not reachable from the research environment (reddit.com and old.reddit.com both refused automated access, and web search returned no reddit.com pages). The Reddit section therefore records that gap rather than guessing at its contents. Stack Overflow pages could not be fetched directly, so question titles and bodies came from the public Stack Exchange API.

## Summary of demand

Ranked roughly by how often a theme appears across trackers and how much harm it caused. The ranking is a judgment call; the sources are not.

1. **Correct time-zone handling, independent of the host machine's zone.** This is the most frequent bug class in every library surveyed: DST repeated hours, sign-inverted offsets, results returned in the wrong zone, and date shifts.
   - https://github.com/BehindTheMath/KosherZmanim/issues/37
   - https://github.com/hebcal/hebcal-es6/issues/786
   - https://github.com/BehindTheMath/KosherZmanim/issues/22
2. **A Hebrew date that knows about sunset or nightfall.** Developers want "what is the Hebrew date right now, here", plus before/after-sunset input for birthdays and yahrzeits.
   - https://github.com/hebcal/hebcal-es6/issues/450
   - https://github.com/hebcal/hebcal-es6/issues/546
   - https://github.com/KosherJava/zmanim/issues/139
3. **More zmanim opinions, and matching well-known sites.** Examples include Baal HaTanya (Chabad), Rabbeinu Tam havdalah, 8.5° tzeit, 72-minute alot, Netz HaNireh (visible sunrise) and Itim Levina.
   - https://github.com/hebcal/hebcal-es6/issues/679
   - https://github.com/hebcal/hebcal/issues/308
   - https://github.com/hebcal/hebcal-es6/issues/420
4. **Graceful behavior at high latitudes,** where some zmanim do not occur (no crash, no "Invalid Date").
   - https://github.com/hebcal/hebcal-es6/issues/580
   - https://github.com/hebcal/hebcal/issues/263
5. **A permissive license.** Users asked KosherJava for Apache/MIT and were declined. License inconsistencies were also reported in hebcal-es6, hebcal-learning and kosher-zmanim.
   - https://github.com/KosherJava/zmanim/issues/184
   - https://github.com/BehindTheMath/KosherZmanim/issues/35
   - https://github.com/hebcal/hebcal-es6/issues/790
6. **Small, tree-shakable, modern packaging** (ESM, TypeScript types, bundler and runtime compatibility).
   - https://github.com/hebcal/hebcal-es6/issues/475
   - https://github.com/BehindTheMath/KosherZmanim/issues/25
   - https://github.com/hebcal/hebcal-es6/issues/448
7. **Tefillah and halachic day rules:** tachanun, mizmor l'todah, morid hatal, and helpers like is-fast-day and is-aveilut.
   - https://github.com/hebcal/hebcal/issues/287
   - https://github.com/hebcal/hebcal-es6/issues/617
   - https://github.com/BehindTheMath/KosherZmanim/issues/20
8. **More daily-learning cycles:** Amud Yomi, Kitzur Shulchan Aruch Yomi, Sefer HaMitzvos, Rambam variants, 929, and Yerushalmi editions.
   - https://github.com/hebcal/hebcal/issues/270
   - https://github.com/hebcal/hebcal-learning/issues/4
   - https://github.com/hebcal/hebcal/issues/300
9. **Leyning detail and customs:** weekday readings, Chabad and Sephardi haftarot, triennial haftarot, and the Israel/Diaspora split.
   - https://github.com/hebcal/hebcal-es6/issues/453
   - https://github.com/hebcal/hebcal-leyning/issues/732
   - https://github.com/hebcal/hebcal-leyning/issues/92
10. **Localization of names:** Hebrew with or without nikud, labels for zmanim in Hebrew and English, and parsing Hebrew date strings.
    - https://github.com/hebcal/hebcal/issues/294
    - https://github.com/KosherJava/zmanim/issues/171
    - https://github.com/hebcal/hebcal-es6/issues/335
11. **Clear, non-JSON usage examples and an API that is hard to misuse,** for example dates rendered in the location's zone rather than the machine's zone.
    - https://github.com/BehindTheMath/KosherZmanim/issues/22
    - https://github.com/BehindTheMath/KosherZmanim/issues/15
    - https://github.com/hebcal/hebcal-es6/issues/458
12. **Reminders and calendar sync for Hebrew-date events** such as yahrzeits and birthdays. These are prominent in consumer apps and in Hebcal's iCal and API feeds.
    - https://www.hebcal.com/home/developer-apis
    - https://www.myzmanim.com/read/overview.aspx
    - https://apps.apple.com/us/app/jewish-calendar-calj/id345650585

## GitHub issues by repository

### hebcal/hebcal-es6 (@hebcal/core)

Tracker: https://github.com/hebcal/hebcal-es6/issues (about 90 issues at time of reading).

- **#786:** Zmanim were 60 minutes early when the process TZ was not UTC and the instant fell in the repeated DST hour. Local-time `Date` setters were used for rounding, and the fix moved to UTC setters. Candle lighting and havdalah were affected. Closed Oct 2026. https://github.com/hebcal/hebcal-es6/issues/786
- **#792:** Tish'a B'Av appears to end at 6.45° in the Diaspora while other fasts end at 7.083°. This is an open question about which opinion applies where. https://github.com/hebcal/hebcal-es6/issues/792
- **#679:** Times were several minutes off from Chabad.org because Chabad uses Baal HaTanya zmanim and 8.5° for the end of Shabbat. Baal HaTanya functions were added in Apr 2026. https://github.com/hebcal/hebcal-es6/issues/679
- **#580:** Warsaw `alotHaShachar()` produced "Invalid Date" / `RangeError` in summer, because 16.1° never occurs there. The fix added a 72-minute alternative and returns null. https://github.com/hebcal/hebcal-es6/issues/580
- **#450:** A request for the Hebrew date after nightfall. `HDate` ignores time, and adding location to `HDate` was declined for bundle-size reasons. A `Zmanim.makeSunsetAwareHDate()` helper was added instead. https://github.com/hebcal/hebcal-es6/issues/450
- **#546:** A request to convert a Gregorian date with a before/after-sunset flag for Bar Mitzvah and yahrzeit. The answer was to call `.next()` in application code. https://github.com/hebcal/hebcal-es6/issues/546
- **#458:** "All events are one day too early." The cause was the app's UTC-vs-local handling, because the library returns local-time `Date`s. This is a usability trap rather than a library bug. https://github.com/hebcal/hebcal-es6/issues/458
- **#548:** "Incorrect candle lighting during Pesach." The user was confused by multiple candle-lighting events (second-day Yom Tov) and by local-zone rendering. Not a bug. https://github.com/hebcal/hebcal-es6/issues/548
- **#617:** A request for `isFastDay()` and `isAveilut()` (Omer, Bein HaMeitzarim) to drive automations. Implemented May 2026. https://github.com/hebcal/hebcal-es6/issues/617
- **#475:** Tree shaking. A year of parsha names bundled to 150 kB (54 kB gzip). The refactor exposed standalone functions. https://github.com/hebcal/hebcal-es6/issues/475
- **#448:** v5 broke Google Apps Script (no private class fields) because of a dependency. It was fixed by downgrading the dependency. https://github.com/hebcal/hebcal-es6/issues/448
- **#647:** Drop CommonJS and Node 16 (closed). https://github.com/hebcal/hebcal-es6/issues/647
- **#420:** Netz HaNireh (visible sunrise, terrain-dependent) is still open. Commenters asked for it as a separate zman next to standard sunrise. https://github.com/hebcal/hebcal-es6/issues/420
- **#335:** A request to parse Hebrew gematriya date strings. `HDate.fromGematriyaString` was added. **#776** is still open and points to a separate package for messy, transliterated strings. https://github.com/hebcal/hebcal-es6/issues/335 , https://github.com/hebcal/hebcal-es6/issues/776
- **#780:** An explicit `il: false` option was overwritten by `location.getIsrael()`. Explicit options should win over inferred ones. https://github.com/hebcal/hebcal-es6/issues/780
- **#784:** A tachanun-in-Tishrei rule question (closed). https://github.com/hebcal/hebcal-es6/issues/784
- **#790:** The package.json license (GPL-2.0-only) contradicted the source headers ("or later"). https://github.com/hebcal/hebcal-es6/issues/790
- Other requests, as titles only, from the issue listing (https://github.com/hebcal/hebcal-es6/issues?q=is%3Aissue):
  - #453 weekday Torah reading
  - #447 mincha ketana 72 minutes
  - #445 Eruv Tavshilin
  - #436 fasts of BeHaB and Selichot
  - #435 Pirkei Avot
  - #419 Itim Levina opinion
  - #417 sea-level sunrise
  - #380 MGA at 16.1°
  - #379 Shabbat Mevarchim and molad
  - #378 12-hour format
  - #354 Ofek Yerushalayim
  - #290 gematriya without nikud
  - #247 Yerushalmi Yomi
  - #499 Hebrew name for Shabbatot without a parsha
  - #518 Sigd when Cheshvan 29 is on Shabbat
  - #564 Shabbat Chol HaMoed Pesach
  - #657 Vezot HaBracha missing from list

### hebcal/hebcal (CLI and hebcal.com)

Tracker: https://github.com/hebcal/hebcal/issues (about 263 issues).

- **#263:** A segfault (Go panic) printing zmanim for northern cities in summer. Alot at 16.1° returned a zero time that was never checked. Fixed in 5.8.3. https://github.com/hebcal/hebcal/issues/263
- **#310:** A panic for year −1, because there is no Gregorian year 0. Fixed in 5.9.8. https://github.com/hebcal/hebcal/issues/310
- **#282:** A user reported yahrzeit API results changing from one day to the next. The maintainer said the algorithm is deterministic. This shows that users expect deterministic, documented anniversary rules. https://github.com/hebcal/hebcal/issues/282
- **#308:** A feature request for a Rabbeinu Tam (16.1°) havdalah setting. https://github.com/hebcal/hebcal/issues/308
- **#312:** Havdalah time with elevation. https://github.com/hebcal/hebcal/issues/312
- **#302:** A Yerushalmi Yomi schedule error (skips Niddah 13 in 2082). This is long-range cycle correctness. https://github.com/hebcal/hebcal/issues/302
- **#316:** An extra Rosh Hashana amud in Dirshu Amud Yomi. https://github.com/hebcal/hebcal/issues/316
- **#287 (open):** Tachanun, morid hatal and similar functions. https://github.com/hebcal/hebcal/issues/287
- **#296 (open):** Torah readings for Sukkot. https://github.com/hebcal/hebcal/issues/296
- Requests for learning additions:
  - #270 Amud HaYomi https://github.com/hebcal/hebcal/issues/270
  - #277 Kitzur Shulchan Aruch https://github.com/hebcal/hebcal/issues/277
  - #300 929 https://github.com/hebcal/hebcal/issues/300
  - #305 Rambam for seder tefillah https://github.com/hebcal/hebcal/issues/305
- Output and formatting requests:
  - #294 and #275 Hebrew without nikud https://github.com/hebcal/hebcal/issues/294
  - #278 omit secular date https://github.com/hebcal/hebcal/issues/278
  - #283 week number https://github.com/hebcal/hebcal/issues/283
  - #292 Israeli workdays https://github.com/hebcal/hebcal/issues/292
  - #285 disable the Julian transition https://github.com/hebcal/hebcal/issues/285
  - #279 0-minute candle-lighting offset ignored https://github.com/hebcal/hebcal/issues/279
- **#269:** Israeli cities had an incorrect Israel flag, which matters for the Israel/Diaspora holiday schedule. https://github.com/hebcal/hebcal/issues/269
- **#284:** A custom parsha iCal export was broken. **#257:** an error adding to Google Calendar. iCal output is a heavily used path. https://github.com/hebcal/hebcal/issues/284 , https://github.com/hebcal/hebcal/issues/257

### hebcal/hebcal-learning

- **#1 (open):** Chafetz Chayim Yomi has a double entry for Shevat and Iyar. https://github.com/hebcal/hebcal-learning/issues/1
- **#2, #3, #4:** Requests for Kitzur Shulchan Aruch Yomi, Oz v'Hadar Yerushalmi Yomi, and Daily Sefer HaMitzvos. https://github.com/hebcal/hebcal-learning/issues?q=is%3Aissue
- **#17:** The LICENSE (GPL-2.0) contradicts package.json (BSD-2-Clause). https://github.com/hebcal/hebcal-learning/issues/17

### hebcal/hebcal-leyning

- **#736 (open):** The Terumah aliyah 2 boundary differs from Sefaria and printed Chumashim. Users want aliyah boundaries to have sources. https://github.com/hebcal/hebcal-leyning/issues/736
- **#732:** Haftarah according to Chabad custom. **#346:** Ashkenazi haftarah for Acharei Mot. **#512:** Sephardic data. https://github.com/hebcal/hebcal-leyning/issues/732
- **#92:** Haftarot for the triennial cycle. https://github.com/hebcal/hebcal-leyning/issues/92
- **#430 and #437:** Combined days (Shabbat Rosh Chodesh Chanukah) returned the wrong number of readings. **#463:** Shir HaShirim missing when the last days of Pesach fall on Shabbat. https://github.com/hebcal/hebcal-leyning/issues/430
- **#432:** Files could not be imported from TypeScript with `module: NodeNext`. **#433:** tree shaking. https://github.com/hebcal/hebcal-leyning/issues/432

### KosherJava/zmanim (Java reference library)

Tracker: https://github.com/KosherJava/zmanim/issues (about 58 issues).

- **#184:** A request to relicense under Apache 2.0 or MIT for inclusion in Apache products. Declined because the library is LGPL. https://github.com/KosherJava/zmanim/issues/184
- **#139 (open):** `JewishCalendar` changes day at midnight, so `isAssurBemelacha()` is true on Motzaei Shabbat. The maintainer said the design "has no concept of time." https://github.com/KosherJava/zmanim/issues/139
- **#178:** Sof zman kiddush levana was one hour off across the DST-to-standard transition. Fixed. https://github.com/KosherJava/zmanim/issues/178
- **#244:** `getChatzos()` astronomical vs half-day results were about 24 h apart at lat −72.86, lon 176.93, GMT−12. This was a day-boundary bug near the date line, fixed by PR #245. https://github.com/KosherJava/zmanim/issues/244
- **#264:** `getChatzos` did not return null when sunrise is null (polar). https://github.com/KosherJava/zmanim/issues/264
- **#281:** A local-mean-time calculation east of Greenwich was reported as wrong. The maintainer judged it correct. https://github.com/KosherJava/zmanim/issues/281
- **#246:** The sof zman achilas chametz (GRA) Erev Pesach check was commented out. Fixed in 3.0. https://github.com/KosherJava/zmanim/issues/246
- **#180 (open):** Support Jewish dates back to about 500 BCE. The library throws before 1 CE. https://github.com/KosherJava/zmanim/issues/180
- **#171 (open):** Hebrew and English labels for every zman. https://github.com/KosherJava/zmanim/issues/171
- Other requests, as titles only, from https://github.com/KosherJava/zmanim/issues?page=2&q=is%3Aissue:
  - #173 choose which temporal hour a zmanis method uses
  - #144 multiple days / next event API
  - #198 and #218 tefila rules
  - #201 special Shabbatot
  - #200 isYomTov
  - #160 Shabbat Mevarchim in Tishrei
  - #132 negative elevation
  - #133 wrong alos 16.1°
- Ports keep appearing: Kotlin Multiplatform #280, Go #203, VB #236. This shows demand for the same engine across runtimes. https://github.com/KosherJava/zmanim/issues/280

### BehindTheMath/KosherZmanim (kosher-zmanim on npm)

Tracker: https://github.com/BehindTheMath/KosherZmanim/issues (16 issues).

- **#37 (open, with PR #38):** "TimeZone.getRawOffset() is sign-inverted in DST zones, causing false antimeridian adjustment". https://github.com/BehindTheMath/KosherZmanim/issues/37
  - The bug: `getRawOffset()` should return the zone's standard offset (the lesser of the January and July offsets). In DST-observing zones, it negates the result instead.
  - Sydney and Auckland: `GeoLocation#getAntimeridianAdjustment()` returns +1, so their zmanim are computed for the *next* civil day. For example, a Sydney calendar for 2026-09-01 yields sunrise on 2026-09-02.
  - A follow-up confirmed the bug on 0.9.0 (npm latest). On 2026-01-16 it measured a Sydney offset of 20.08 h (expected 0.08), Auckland 23.65 h (expected −0.35), and Chatham also on the next day. Melbourne escaped only because it fell under a 20 h threshold.
  - Because only January 1 and July 1 are sampled, the error is year-round, not just during DST.
  - West-of-UTC zones also get the wrong sign. New York returns +4 h instead of −5 h. This does not trigger the antimeridian check, but it skews local mean time, fixed-local chatzos and `getMoladAsDate()`.
  - The maintainer said KosherJava stopped using raw offset in local-mean-time calculation, and the port will follow suit.
  - Noted edge case: zones with negative DST, such as Europe/Dublin in tzdata.
- **#36 (open):** `JewishDate.clone()` hardcodes the base class, so cloning a `JewishCalendar` loses subclass methods and `getParsha` throws. https://github.com/BehindTheMath/KosherZmanim/issues/36
- **#35:** The repository had no license. LGPL-2.1-only was settled on because KosherJava is LGPL-2.1. https://github.com/BehindTheMath/KosherZmanim/issues/35
- **#28 (open):** Replace Luxon with Temporal. https://github.com/BehindTheMath/KosherZmanim/issues/28
- **#25 (open):** Add an ESM bundle. https://github.com/BehindTheMath/KosherZmanim/issues/25
- **#22 (open):** A request for a real non-JSON example. Times displayed in the machine zone, the offset was 0 despite passing Asia/Jerusalem, and alos72 looked about 2 h off. https://github.com/BehindTheMath/KosherZmanim/issues/22
- **#20 (open):** Add tefilla rules. https://github.com/BehindTheMath/KosherZmanim/issues/20
- **#15:** Jerusalem times appeared wrong because results are UTC Luxon objects and the user must call `.setZone()`. https://github.com/BehindTheMath/KosherZmanim/issues/15
- **#9:** `getMoladAsDate` used `Etc/GMT-2` for Jerusalem. POSIX `Etc/` signs are inverted, which makes them an easy source of mistakes. https://github.com/BehindTheMath/KosherZmanim/issues/9
- **#2:** Asia/Jerusalem times landed on the wrong civil date. https://github.com/BehindTheMath/KosherZmanim/issues/2
- **#19:** `getZmanimJson` did not return plag hamincha. **#8:** JS results differ from Java. https://github.com/BehindTheMath/KosherZmanim/issues?q=is%3Aissue

## Stack Overflow and Mi Yodeya

The pages were read through the Stack Exchange API (https://api.stackexchange.com). Volume is low, but the questions are telling:

- A React Native user could not get a Hebrew date: hebcal "is just incompatible with react native", and he-date threw "Object is not a constructor". https://stackoverflow.com/questions/67560172/need-help-getting-hebrew-date-in-react-native-app
- A question asking for an open-source algorithm for Shabbat candle lighting by GPS location. https://stackoverflow.com/questions/7714454/shabat-times-algorithm
- A request for an Angular events-calendar component with Hebrew dates and Jewish events, "like Google Calendar". https://stackoverflow.com/questions/49402793/angular-2-events-calendar-with-hebrew-and-jewish-dates
- A request for an Android calendar grid showing Hebrew-letter dates in each cell. https://stackoverflow.com/questions/27278667/hebrew-jewish-calendar-in-android
- A question about week-of-year in the Jewish calendar. https://stackoverflow.com/questions/53516959/how-to-get-week-of-year-for-jewish-calendar
- Calling the Hebcal REST converter from AngularJS, which shows that people reach for a network API when a local library would do. https://stackoverflow.com/questions/28845190/angularjs-hebrew-date-converter
- Hebrew dates through moment.js locale. https://stackoverflow.com/questions/34115785/using-moment-js-to-process-a-date-in-hebrew
- "Does the Date object ever use a non-Gregorian calendar?" https://stackoverflow.com/questions/10723638/does-the-date-object-ever-use-a-non-gregorian-calendar
- Similar questions in other languages show the same need elsewhere: Python https://stackoverflow.com/questions/2442674/calculating-hebrew-date-in-python and C# https://stackoverflow.com/questions/6245546/how-can-i-get-todays-jewish-date-in-c
- One library author notes that `Intl` (`u-ca-hebrew`) only converts Gregorian to Hebrew, not back, and reports a date where it differs. https://github.com/AvrahamO/he-date
- Mi Yodeya users ask how to compute alot without an app, and about weather-adjusted zmanim. https://judaism.stackexchange.com/questions/142280/how-to-calculate-what-time-is-alot-hashachar-without-zmanim-apps , https://judaism.stackexchange.com/questions/156473/precise-zmanim-after-incorporating-weather

## Reddit

- No content was gathered. reddit.com, old.reddit.com and Reddit's JSON search all refused automated access (HTTP 403 or fetch blocked), and web searches restricted to reddit.com returned no Reddit pages.
- This section should be filled in by hand later, by searching r/Judaism, r/Jewish and r/learnprogramming for "zmanim app", "luach", "hebcal" and "yahrzeit".

## App and service features (facts only)

- **Hebcal.com developer APIs:**
  - Hebrew date converter (JSON/XML)
  - Holidays, Torah readings and candle lighting (JSON)
  - Leyning, including triennial and weekday readings
  - Shabbat times
  - Yahrzeit, Yizkor, Hebrew birthday and anniversary dates for 20 years
  - Zmanim
  - An "assur bemelacha" query for a date, time and location
  - Location by GeoNames ID, ZIP code or lat/long, with optional elevation
  - RSS and iCalendar feeds, a WordPress plugin, and embeddable widgets
  - No API key; rate limit of 90 requests per 10 s
  - Generated content is licensed CC BY 4.0

  https://www.hebcal.com/home/developer-apis
- **Hebcal anniversary rules:**
  - Documented rules for yahrzeits in Adar and Adar I/II.
  - A death on Adar I 30 is observed on the last day of Shevat in a common year.
  - Cheshvan and Kislev 30 have their own rules.
  - Hebcal once had a bug that showed Adar II anniversaries in Adar I.

  https://www.hebcal.com/home/54/anniversaries-adar-cheshvan-kislev , https://www.hebcal.com/home/54/how-does-hebcal-determine-an-anniversary-occurring-in-adar
- **MyZmanim:**
  - Live countdowns and an extended set of zmanim with explanations
  - In-flight zmanim: enter a flight number and departure time, receive a PDF
  - Free PDF calendar for any location
  - Alerts for mincha, candle lighting and the omer by text, email or Telegram
  - Spreadsheet export, a web widget and a developer API
  - SMS text-back service and a phone info line
  - Location by city, airport, coordinates, or US, UK, Canadian or Israeli postal codes
  - Arrows showing whether zmanim are getting earlier or later

  https://www.myzmanim.com/read/overview.aspx , https://www.myzmanim.com/ , https://apps.apple.com/us/app/myzmanim/id1450374488
- **Chabad.org zmanim:**
  - Location by city, ZIP code or coordinates, with a time zone and a custom name
  - Configurable minutes before sunset for candle lighting
  - Shabbat end by astronomical calculation or a fixed number of minutes
  - "Visual shkiah" adjustment
  - Default and additional zmanim
  - Printable daily and monthly charts, and RSS
  - SMS Shabbat times and Shabbat alerts

  https://www.chabad.org/calendar/zmanim_cdo/aid/143790/jewish/Zmanim-Halachic-Times.htm
- **CalJ (iOS):**
  - Two-way date conversion, holidays for any year, parsha, Rosh Chodesh and Shabbat times
  - Zmanim with reminders
  - Birthday and yahrzeit tracking
  - Omer counter and Jerusalem compass
  - Seasonal hour by MGA and a Breslov chatzot-laila option
  - Long-press explanation of each zman, dark mode and Apple Watch
  - Seven UI languages

  https://apps.apple.com/us/app/jewish-calendar-calj/id345650585
- **Other iOS zmanim apps:** Common features are saved locations, reminders, a Jerusalem compass, scripting and customization (Zmanim Advanced), countdowns, auto-location, Satmar and Chabad presets (Zman), offline use, and Sefaria links for parsha and Daf Yomi (Zmanim Pro). One listing warns its times are approximate and unverified. https://apps.apple.com/app/id335372293 , https://apps.apple.com/us/app/-/id6743945901 , https://apps.apple.com/app/id6476107960 , https://apps.apple.com/mx/app/instant-zmanim/id6752849012
- **Hebrew-date reminders and calendar sync:**
  - Hebcal's app lets the user choose before or after sunset and how many years ahead to calculate (default 20). https://www.hebcal.com/home/?p=632
  - A Chrome extension adds Hebrew dates and zmanim to Google Calendar and creates recurring Hebrew-date events. https://chromewebstore.google.com/detail/nbckaiikiadmgjbimdhmlekjifagpfah
  - YomKeeper stores data on the device only, with no sync. https://apps.apple.com/us/app/yomkeeper/id6752567247
- **KosherJava ecosystem:** The README lists ports to about 20 languages (.NET, Python, Go, Swift and others) and a desktop app built on the .NET port. It warns users to double-check results before relying on them for halacha l'maaseh. https://github.com/Elyahu41/zmanim (a fork that mirrors the KosherJava README)

## Existing npm names

- **`luach-picker`:** A zero-dependency, MIT-licensed browser date-picker UI widget. It shows Gregorian and Hebrew months with mixed-language labels, RTL, keyboard and mobile support, and relies on the browser's `Intl` for Hebrew conversion. It has no zmanim, holidays, parsha or calculation engine. Version 2.1.0 was published 2026-09-18, with 58 downloads in its first month. https://registry.npmjs.org/luach-picker , https://github.com/kervio/luach-picker
  - **How Luach differs:** Luach is a calculation library (dates, holidays, readings, learning, zmanim) with no UI, and it does not depend on `Intl`'s Hebrew calendar. A picker like luach-picker could sit on top of it.
- `luach` on npm currently holds a 0.0.1 Apache-2.0 placeholder, "Hebrew calendar and zmanim library. In development." https://registry.npmjs.org/luach
- `zmanim` on npm: 0.0.1, MIT, last modified 2022. https://registry.npmjs.org/zmanim

## Implications for Luach

The baseline items already planned are confirmed as demanded, as follows:

- **Hebrew/Gregorian conversion:** Confirmed. It is the most common Stack Overflow need, and `Intl` alone is one-way. https://github.com/AvrahamO/he-date
- **Holidays:** Confirmed, including Israel/Diaspora and minor and modern days. https://github.com/hebcal/hebcal-es6/issues/518
- **Parsha:** Confirmed. https://github.com/hebcal/hebcal-es6/issues/657
- **Daf yomi and learning cycles:** Confirmed, with steady requests for more cycles. https://github.com/hebcal/hebcal/issues/270
- **Zmanim by many opinions:** Confirmed and the top halachic request. https://github.com/hebcal/hebcal-es6/issues/679
- **Cities:** Confirmed, including the correct Israel flag per city. https://github.com/hebcal/hebcal/issues/269
- **iCal:** Confirmed. https://github.com/hebcal/hebcal/issues/284
- **CLI:** Confirmed by the hebcal CLI tracker volume. https://github.com/hebcal/hebcal/issues
- **JSON day view:** Implied by the API and JSON usage, for example getZmanimJson. https://github.com/BehindTheMath/KosherZmanim/issues/19
- **React Native/Hermes support:** Confirmed. https://stackoverflow.com/questions/67560172/need-help-getting-hebrew-date-in-react-native-app , https://github.com/hebcal/hebcal-es6/issues/448

Additional roadmap items suggested by this research:

- **Zone-explicit API.** Every instant should be computed and returned against an explicit IANA zone, never the host zone. Use UTC arithmetic internally, and never use local `Date` setters (see hebcal-es6 #786). Run tests under several `TZ` values. Render helpers should format in the location's zone. https://github.com/hebcal/hebcal-es6/issues/786 , https://github.com/BehindTheMath/KosherZmanim/issues/22
- **Derive standard offset and date-line handling from tzdata correctly,** or avoid needing them. Add tests for Sydney, Auckland, Chatham, Melbourne, New York, Dublin (negative DST) and Kiribati/Samoa. https://github.com/BehindTheMath/KosherZmanim/issues/37
- **Sunset- and nightfall-aware "Hebrew date now at location",** plus a before/after-sunset flag on date input for yahrzeits and birthdays. Keep the pure date type free of astronomy so it stays small. https://github.com/hebcal/hebcal-es6/issues/450 , https://github.com/KosherJava/zmanim/issues/139
- **Explicit null or "does not occur" results with a reason** (polar day, polar night, angle not reached), never throwing or returning Invalid Date. Offer documented fallbacks (72 minutes, chatzot) as separate named zmanim. https://github.com/hebcal/hebcal-es6/issues/580 , https://github.com/hebcal/hebcal/issues/263
- **Named opinion presets** (GRA, MGA, Baal HaTanya/Chabad, Rabbeinu Tam, 8.5°, Itim Levina, Ofek Yerushalayim). Each zman should carry metadata (definition, degrees or minutes, source) and Hebrew and English labels. https://github.com/KosherJava/zmanim/issues/171 , https://github.com/hebcal/hebcal-es6/issues/419
- **Elevation-aware and visible-sunrise (Netz HaNireh) zmanim** as optional, separate zmanim. https://github.com/hebcal/hebcal-es6/issues/420 , https://github.com/hebcal/hebcal/issues/312
- **Halachic day predicates:** is-assur-bemelacha (date-time aware), is-fast-day, is-aveilut, tachanun, hallel, morid hatal / mashiv haruach, ya'aleh v'yavo, mizmor l'todah, Shabbat Mevarchim, special Shabbatot, eruv tavshilin. https://github.com/hebcal/hebcal-es6/issues/617 , https://github.com/hebcal/hebcal/issues/287
- **Fast start and end times with per-fast, per-region rules** that are documented and configurable (see the Tish'a B'Av angle question). https://github.com/hebcal/hebcal-es6/issues/792
- **Yahrzeit, birthday and anniversary engine** with documented Adar, Adar I/II, Cheshvan 30 and Kislev 30 rules, and a choice of custom (Adar I vs Adar II). It must be deterministic across runs. https://www.hebcal.com/home/54/anniversaries-adar-cheshvan-kislev , https://github.com/hebcal/hebcal/issues/282
- **Leyning with customs:** Ashkenaz, Sephardi and Chabad haftarot, weekday readings, triennial, and sourced aliyah boundaries. https://github.com/hebcal/hebcal-leyning/issues/732 , https://github.com/hebcal/hebcal-leyning/issues/736
- **Extensible learning cycles:** Amud Yomi, Kitzur SA Yomi, Sefer HaMitzvos, 929, Yerushalmi editions, Chafetz Chaim. Write long-range schedule tests decades out. https://github.com/hebcal/hebcal/issues/302 , https://github.com/hebcal/hebcal-learning/issues/1
- **Localization:** Hebrew with and without nikud, Ashkenazi and Sephardi transliteration, gematriya formatting and parsing (including messy strings), a 12/24-hour option. https://github.com/hebcal/hebcal/issues/294 , https://github.com/hebcal/hebcal-es6/issues/378
- **Packaging:** ESM-first, tree-shakable standalone functions, TypeScript types that work with `NodeNext`, no private-field-only dependencies. Test in Hermes, Google Apps Script-like ES2015 runtimes and edge workers. Publish a bundle-size budget. https://github.com/hebcal/hebcal-es6/issues/475 , https://github.com/hebcal/hebcal-leyning/issues/432
- **Temporal-friendly API.** Accept and return Temporal types where available, with a small adapter layer, since a JS port of KosherJava is planning a move from Luxon to Temporal. https://github.com/BehindTheMath/KosherZmanim/issues/28
- **Explicit options always override inferred ones** (for example an Israel flag vs location). https://github.com/hebcal/hebcal-es6/issues/780
- **Consistent licensing:** one Apache-2.0 LICENSE, matching package.json and file headers. Several projects have had mismatches. https://github.com/hebcal/hebcal-es6/issues/790 , https://github.com/hebcal/hebcal-learning/issues/17
- **Docs with plain, copy-paste examples,** including how to render in the location's zone, plus a "why does my time differ from site X" page explaining opinions, angles and rounding. https://github.com/hebcal/hebcal-es6/issues/679 , https://github.com/BehindTheMath/KosherZmanim/issues/22
- **Range queries** ("next N days / next occurrence of event") and a year-at-a-glance export (CSV/PDF-friendly JSON). https://github.com/KosherJava/zmanim/issues/144 , https://www.myzmanim.com/read/overview.aspx
- **Optional historical range:** define behavior before 1 CE and around Gregorian year 0, either by supporting it or by rejecting it clearly. https://github.com/KosherJava/zmanim/issues/180 , https://github.com/hebcal/hebcal/issues/310
- **Later candidates, after the core:** in-flight zmanim along a route, and reminder scheduling helpers. https://www.myzmanim.com/read/overview.aspx

## Known bugs in other libraries worth regression-testing

| Area | Case to test | Source |
|---|---|---|
| Time zone / standard offset | Sydney, Auckland, Chatham must not be shifted to the next civil day. New York standard offset must be −5 h. Check across a whole year. | https://github.com/BehindTheMath/KosherZmanim/issues/37 |
| Negative DST | Europe/Dublin: standard vs "DST" in tzdata. | https://github.com/BehindTheMath/KosherZmanim/issues/37 |
| DST repeated hour | tzeit 8.5° at lat −57, lon −40 on 2027-10-30 with process TZ=Asia/Jerusalem must equal the TZ=UTC result. Candle lighting and havdalah in the fall-back week. | https://github.com/hebcal/hebcal-es6/issues/786 |
| DST and molad | Sof zman kiddush levana near the Nov 2021 US fall-back must not be off by 1 h. | https://github.com/KosherJava/zmanim/issues/178 |
| Date line / day boundary | Chatzot at lat −72.86, lon 176.93, GMT−12 must fall on the same day by both methods. | https://github.com/KosherJava/zmanim/issues/244 |
| Host-zone independence | Results must be identical regardless of process TZ, and returned in the location's zone (Jerusalem from a New York machine). | https://github.com/BehindTheMath/KosherZmanim/issues/22 , https://github.com/BehindTheMath/KosherZmanim/issues/2 |
| Etc/GMT sign | Molad in Jerusalem standard time (Etc/GMT-2 means UTC+2). | https://github.com/BehindTheMath/KosherZmanim/issues/9 |
| High latitude | Alot 16.1° in Warsaw and Amsterdam in June must be null with a reason, with no throw or crash. Chatzot must be null when sunrise is null. | https://github.com/hebcal/hebcal-es6/issues/580 , https://github.com/hebcal/hebcal/issues/263 , https://github.com/KosherJava/zmanim/issues/264 |
| Year boundaries | Gregorian year −1/0/1 must not crash. Behavior before 1 CE must be defined. | https://github.com/hebcal/hebcal/issues/310 , https://github.com/KosherJava/zmanim/issues/180 |
| Adar yahrzeit | Adar II in leap years, Adar I 30 to Shevat 30, plain Adar in a leap year under each custom, and Cheshvan/Kislev 30. | https://www.hebcal.com/home/54/anniversaries-adar-cheshvan-kislev , https://www.hebcal.com/home/54/how-does-hebcal-determine-an-anniversary-occurring-in-adar |
| Sunset-aware date | A date-time after sunset or tzeit must give the next Hebrew date. Motzaei Shabbat must not be assur bemelacha. | https://github.com/hebcal/hebcal-es6/issues/450 , https://github.com/KosherJava/zmanim/issues/139 |
| Erev Pesach zmanim | Sof zman achilat/biur chametz only on 14 Nisan. | https://github.com/KosherJava/zmanim/issues/246 |
| Combined days | Shabbat Rosh Chodesh Chanukah gives the right number of readings. Shir HaShirim on the last days of Pesach on Shabbat. Shabbat Chol HaMoed. | https://github.com/hebcal/hebcal-leyning/issues/430 , https://github.com/hebcal/hebcal-leyning/issues/463 , https://github.com/hebcal/hebcal-es6/issues/564 |
| Special days | Sigd when 29 Cheshvan is on Shabbat. Vezot HaBracha in the parsha list. Tachanun in Tishrei. Shabbat Mevarchim in Tishrei (false). | https://github.com/hebcal/hebcal-es6/issues/518 , https://github.com/hebcal/hebcal-es6/issues/657 , https://github.com/hebcal/hebcal-es6/issues/784 , https://github.com/KosherJava/zmanim/issues/160 |
| Fast ends | Tish'a B'Av vs minor fasts in Israel and the Diaspora use the configured angle. | https://github.com/hebcal/hebcal-es6/issues/792 |
| Learning cycles | Yerushalmi Yomi in 2082 (Niddah 13). Dirshu Amud Yomi around Rosh Hashana. Chafetz Chaim Shevat/Iyar duplicates. Daf Yomi Tamid/Midot 34. | https://github.com/hebcal/hebcal/issues/302 , https://github.com/hebcal/hebcal/issues/316 , https://github.com/hebcal/hebcal-learning/issues/1 , https://github.com/hebcal/hebcal-es6/issues/163 |
| Options precedence | An explicit `il: false` is not overridden by the location's Israel flag. A zero-minute candle offset is honored. | https://github.com/hebcal/hebcal-es6/issues/780 , https://github.com/hebcal/hebcal/issues/279 |
| Subclass cloning | Cloning a calendar object keeps its type and methods. | https://github.com/BehindTheMath/KosherZmanim/issues/36 |
| Runtime compatibility | Runs in Hermes and in ES2015-ish runtimes (no private class fields from dependencies). | https://github.com/hebcal/hebcal-es6/issues/448 , https://stackoverflow.com/questions/67560172/need-help-getting-hebrew-date-in-react-native-app |
| Intl cross-check | Compare conversions against `Intl` `u-ca-hebrew` across a wide range, and document any known divergences. | https://github.com/AvrahamO/he-date |
