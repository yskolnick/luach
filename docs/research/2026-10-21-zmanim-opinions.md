# Zmanim opinions: definitions, holders, sources (research notes)

Date: 2026-10-21. Status: background research for Luach (clean-room, Apache-2.0).

Clean-room note: no code or code comments from KosherJava, kosher-zmanim, KosherCocoa or hebcal were copied. Their public docs were used only to learn which opinions exist, and that use is marked "existence only". Every halachic attribution below either comes from a text read on Sefaria or is marked as secondary or unverified.

## Verification legend

| Status | Meaning |
|---|---|
| **VERIFIED** | Primary text read on Sefaria (Hebrew), and the claim matches it. |
| **VERIFIED-2** | Confirmed only through a named, reliable secondary source that quotes or cites the primary. The primary itself was not read. |
| **UNVERIFIED** | Commonly attributed, but neither the primary nor a reliable secondary was confirmed. Do not put it in code as fact. |
| **COMPUTED** | Degree value I derived myself (see the method below). It is not a halachic source. |

### Degree-conversion method (COMPUTED, my own)

Jerusalem is at 31.778°N. At the equinox, take declination 0 and treat the hour angle as advancing 0.25° per minute. Sea-level sunrise/sunset is when the sun's center is 0.833° below the geometric horizon. The depression at N minutes before sea-level sunrise or after sea-level sunset comes out as follows:

| Minutes | Depression | Common published value |
|---|---|---|
| 13.5 | 3.70° | 3.7° |
| 16.875 | 4.42° | |
| 18 | 4.66° | |
| 24 | 5.93° | 5.95° |
| 30 | 7.20° | 7.083° is *not* 30 min. It is ≈29.4 min. |
| 36 | 8.47° | 8.5° |
| 45 | 10.37° | 10.2° is ≈44 min |
| 48 | 11.0° | |
| 52 | 11.85° | 11.5° is ≈50 min |
| 57 | 12.9° | 12.85° |
| 58.5 | 13.22° | 13.24° |
| 60 | 13.5° | |
| 72 | 16.05° | **16.1°** |
| 90 | **19.80°** | |
| 96 | **≈21.0°** | **Not 20°.** 96 min is about 21°. |
| 120 | **≈25.95°** | **26°** |

Reverse lookups:

- 6° ≈ 24.3 min
- 6.45° ≈ 26.5 min
- 7.083° ≈ 29.4 min
- 8.5° ≈ 36.1 min after sea-level sunset

For the Baal HaTanya, "netz/shkia amitis" (1.583°) falls about 3.5 min from sea-level sunrise/sunset. 72 min before netz amiti ≈ 16.8° (Chabad publishes 16.9°). 20 min after shkia amitis ≈ 5.8° (Chabad publishes 6°).

The equilux instead of the equinox changes these by about 0.01–0.05°. Fixed-minute → degree conversions apply only to Jerusalem at the equinox. That is the whole premise: "the light-level at N minutes in Jerusalem in Nisan/Tishrei" (Peninei Halakha, Prayer 11:2 n.1, VERIFIED-2: https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.2).

### The mil (drives every minute-based opinion)

The base text is Pesachim 93b–94a: a person walks 10 parsaos (40 mil) in a day. Alos→netz and shkia→tzeis are 5 mil for Ulla (refuted: "תיובתא") and 4 mil for R. Yehuda (accepted). VERIFIED: https://www.sefaria.org/Pesachim.94a

| Mil | Basis | Source | Status |
|---|---|---|---|
| 18 min | 12 h / 40 mil | SA OC 459:2 ("רביעית שעה וחלק מעשרים"); MB 459:15 ("י"ח מינוטין") | VERIFIED |
| 22.5 min | per Gra / Seder Zmanim | Biur Halacha 459:2 s.v. "הוי רביעית שעה" | VERIFIED |
| 24 min (2/5 hour) | netz→shkia = 30 mil | Magen Avraham 89:2 (citing Rambam via Tosafos Yom Tov); Shulchan Aruch HaRav OC 459:10 rules this is the main view ("העקר כסברא האחרונה") | VERIFIED |
| 15 min | Chavas Yair / Divrei Malkiel | existence only | UNVERIFIED |

This gives 4 mil = 72 / 90 / 96 min and 5 mil = 90 / 112.5 / 120 min. MA 89:2 explicitly computes 5 mil as 2 hours (24-min mil) and as 1.5 hours (18-min mil).

---

## 1. Alos hashachar (dawn)

Definition sources:

- SA OC 89:1: "משעלה עמוד השחר והאיר פני המזרח". VERIFIED.
- MA 89:2: alos is "האור הנוצץ בפאת המזרח ... שעה וחומש שעה" (Rambam). VERIFIED.
- Rambam, Commentary on Mishna Berachos 1:1: "בכדי שעה וחומש שעה **מן השעות הזמניות**", i.e., 1.2 *proportional* hours = 72 min zmaniyos. VERIFIED: https://www.sefaria.org/Rambam_on_Mishnah_Berakhot.1.1

| id | Definition | Holder | Source | Status | URL |
|---|---|---|---|---|---|
| `alos-72-min` | 72 fixed min before sea-level sunrise | Practice on Rambam / 4×18-min mil | Pesachim 94a; SA OC 459:2; MA 89:2 | VERIFIED (sources) | https://www.sefaria.org/Magen_Avraham.89.2 |
| `alos-72-zmaniyos` | 1.2 shaos zmaniyos (1/10 of sunrise→sunset day) before sunrise | Rambam | Rambam, Pirush HaMishna Berachos 1:1 | VERIFIED | https://www.sefaria.org/Rambam_on_Mishnah_Berakhot.1.1 |
| `alos-90-min` | 90 fixed min | 4×22.5-min mil (or 5×18) | BH 459:2 (22.5-min mil); MA 89:2 (5 mil × 18 = 1.5 h) | VERIFIED (mil); attribution to a specific luach UNVERIFIED | https://www.sefaria.org/Biur_Halacha.459.2 |
| `alos-90-zmaniyos` | 1.5 shaos zmaniyos before sunrise | same, proportional | as above | VERIFIED (mil only) | |
| `alos-96-min` | 96 fixed min | 4×24-min mil | MA 89:2; SAHR 459:10 | VERIFIED | https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.459.10 |
| `alos-96-zmaniyos` | 1.6 shaos zmaniyos | same, proportional | as above | VERIFIED (mil only) | |
| `alos-120-min` | 120 fixed min | 5×24-min mil (Ulla). Lechumra only (e.g., fast start) | MA 89:2 (computes 2 hours) | VERIFIED (text); "lechumra only" is practice | https://www.sefaria.org/Magen_Avraham.89.2 |
| `alos-120-zmaniyos` | 2 shaos zmaniyos | same | as above | VERIFIED (mil only) | |
| `alos-16.1` | Sun 16.1° below geometric horizon | 72 min in Jerusalem at equinox. Peninei Halakha's preferred view; Yechave Daas 2:8 (per PH) | Peninei Halakha, Prayer 11:2 n.1 (cites BH and Yechave Daas 2:8) | VERIFIED-2 | https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.2 |
| `alos-18` | 18° (astronomical twilight) | Astronomical; PH notes no light is visible before about 18° | PH 11:2 n.1 | VERIFIED-2 (as astronomy) | same |
| `alos-19.8` | 19.8° | 90 min in Jerusalem at equinox. Per PH, "many calendars" use 19.75° | PH 11:2 n.1 ("19.75") | VERIFIED-2 | same |
| `alos-26` | 26° | 120 min at equinox. Lechumra only | Chabad-oriented site ties Admur's 120 min to ≈26° | VERIFIED-2 (weak) / COMPUTED | https://sites.google.com/site/zmanimadmorhazaken/ (alos page) |
| `alos-baal-hatanya` | 16.9° | Chabad (Alter Rebbe): 72 min before *netz amiti* at Jerusalem equinox | Chabad.org "About Our Zmanim Calculations" | VERIFIED-2 (Chabad.org page) | https://www.chabad.org/3209349 |

Notes:

- **17.5°**: Peninei Halakha suggests this for "first glimmer" (MA/Pri Megadim) vs. 16.1° for "east lit up" (Gra / Eliyah Rabbah). VERIFIED-2.
- **MB 89:2** says alos is "מה שמתחיל השחר להבריק במקצתו". VERIFIED.
- **Chabad 120 min.** A Chabad zmanim site (Hebrew, secondary) argues that the Alter Rebbe holds alos = 120 min (24-min mil per Siddur). It cites R' Avraham Chaim Naeh, *Shaarei Tziyon* §37. That is distinct from Chabad.org's published 16.9°. VERIFIED-2 (secondary only).
- **96 min is about 21°, not 20°.** My computation gives 21.0°. Do not label 96 min as "20°".

## 2. Misheyakir

The base text is SA OC 58:1: "משיכיר את חבירו הרגיל עמו קצת ברחוק ד' אמות". VERIFIED.

| id | Definition | Holder | Source | Status | URL |
|---|---|---|---|---|---|
| `misheyakir-10.2` | 10.2° | Chabad.org (≈45 min Jerusalem equinox). MyZmanim attributes it to *Kovetz Otzros Yerushalayim* | Chabad.org zmanim page; MyZmanim sources page | VERIFIED-2 | https://www.chabad.org/3209349 ; https://myzmanim.com/read/sources.aspx |
| `misheyakir-11` | 11° | Peninei Halakha's practical ruling (≈48 min equinox). MyZmanim attributes it to R' Meir Posen | PH Prayer 11:2 n.2 | VERIFIED-2 | https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.2 |
| `misheyakir-11.5` | 11.5° | "Minhag Eretz Yisrael" per MyZmanim (≈50–52 min) | MyZmanim sources page | VERIFIED-2 | https://myzmanim.com/read/sources.aspx |
| `misheyakir-12.85` | 12.85° | ≈57 min. *Birur Halacha* (R' Y.A. Zilber) OC 18, for she'as hadchak only | existence only (KosherJava docs) | UNVERIFIED | |

Minute traditions:

- Yechave Daas 2:8: 66 min.
- Kaf HaChaim 18:18: 60 min.
- Tukaczinsky, *Sefer Eretz Yisrael*: 60 min.
- Jerusalem: 50–55 min.
- Bnei Brak (some): 45 min.

All of these are VERIFIED-2 via PH 11:2 n.2 and MyZmanim.

Also found but not in the request: 9.5° and 7.65° (US poskim, 45 / 35–36 min). These are existence only and UNVERIFIED.

## 3. Netz hachama (sunrise)

| id | Definition | Holder | Source | Status | URL |
|---|---|---|---|---|---|
| `netz-sea-level` | Upper limb at the sea-level horizon (center 0.833° down, standard refraction) | Most printed luchos; R' Isser Zalman Meltzer (per PH): calculate as at sea level | PH Prayer 11:6 n.7 | VERIFIED-2 | https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.6 |
| `netz-elevation` | Sunrise from the observer's elevation (dip correction) | Some; *Birur Halacha* (Zilber) vol. 6 ch. 58 pp. 34, 42 (per KosherJava blog) | secondary | VERIFIED-2 (weak) | https://kosherjava.com/tag/sea-level |
| `netz-visible` | First actual sight over local terrain (mountains) | Divrei Yosef (per PH). Maharil Diskin: ignore near hills (Mount of Olives) but count far ones (Moav) | PH 11:6 n.7 | VERIFIED-2 | as above |
| `netz-amiti-baal-hatanya` | Sun's center 1.583° below horizon (≈3.5 min after sea-level sunrise). Used only to compute zmanim, not published | Chabad (Alter Rebbe) | Chabad.org "About Our Zmanim Calculations" | VERIFIED-2 | https://www.chabad.org/3209349 |

Definition of netz:

- Netz is the *start* of the sun's appearance (BH 58:1 s.v. "כמו", per PH 11:6 n.6). VERIFIED-2.
- MB 89:1: "השעה שהחמה מתחלת לזרוח בראשי ההרים". VERIFIED.
- The Rema in SA 58:1 discusses how netz is measured. VERIFIED (text present).

Why luchos use sea level for degree-based zmanim:

- Alos, misheyakir and tzeis by degrees measure *sky brightness* (solar depression). They are not tied to the visible horizon.
- PH 11:6 n.7: misheyakir "is dependent upon light ... no connection to the visible sunrise". VERIFIED-2.
- *Zmanim KeHilchasam* (R' Dovid Yehuda Bursztyn), 7th ed., ch. 2 §7 pp. 181–182 and §9 pp. 186–187: no zman other than sunrise/sunset should use elevation. VERIFIED-2 via KosherJava blog (secondary).

Elevation debate (per PH 11:6 n.7):

- PH says Shulchan Aruch HaRav uses sunrise at about 800 m (Jerusalem's altitude) everywhere. PH cites Igros Moshe OC 1:97 for this.
- PH: at 800 m, sunrise/sunset shift by about 4.6 min.
- Custom: a hilly city follows its highest neighborhood. Distant mountain ranges that uniformly block the horizon may be considered.
- *HaZmanim BaHalacha* (R' Chaim Benish) ch. 7 collects the opinions.
- All of the above are VERIFIED-2 (PH quotes them). Igros Moshe OC 1:97 itself is UNVERIFIED.

**R' Yisroel Belsky** on elevation: UNVERIFIED (nothing found). **R' Yehuda Levi** (*Jewish Chrononomy* / *Zmanei HaYom BaHalacha*): existence only, UNVERIFIED.

## 4. Sof zman Krias Shema and Tefilla

Base texts (all VERIFIED):

- SA OC 58:1: Shema until the end of 3 hours (¼ of the day).
- SA OC 89:1: tefilla until the end of 4 hours (⅓ of the day).
- Rema 233:1: hours are *zmaniyos*.

The question is how the day is bounded:

- MA 58:1 (VERIFIED): "נ"ל דהכא לכ"ע מנינן מעלות השחר ... ועמ"ש סי' רל"ג". Shema hours are counted from alos.
- MA 233:3 (VERIFIED): Terumas HaDeshen implies alos→tzeis. Levush and Bach count netz→shkia. MA brings support for the latter.
- MB 58:4 (VERIFIED): "ומונין אלו הג' שעות מזמן עמוד השחר כן כתב המ"א ודעת הגר"א משעת הנץ החמה".
- MB 233:4 (VERIFIED): lays out both views (alos→tzeis vs. netz→shkia) for all hour-based zmanim.
- SAHR 58:3 (VERIFIED): "עד סוף ג' שעות מעלות השחר".
- SAHR 89:1 (VERIFIED): alos is "מהלך ד' מילין קודם נץ החמה", tefilla runs "עד סוף שעה ד' מעלות השחר", and the example is "אם היום ארוך י"ח שעות מעלות השחר עד צאת הכוכבים". So the Shulchan Aruch HaRav reckons the day from alos to tzeis.
- SAHR 443:4 (VERIFIED): "היום דהיינו מנץ החמה עד שקיעת החמה הוא נחשב לעולם לי"ב שעות". This is netz→shkia, matching the Siddur. The Chabad practice follows the Siddur.

| id | Day for shaos zmaniyos | Zman | Holder | Source | Status |
|---|---|---|---|---|---|
| `sof-zman-shma-gra` / `sof-zman-tfila-gra` | sea-level sunrise → sunset | +3 / +4 h | Gra | MB 58:4; MB 233:4 | VERIFIED |
| `sof-zman-shma-mga-72` / `-tfila-` | alos 72 fixed → tzeis 72 fixed | +3 / +4 h from alos | MA (as conventionally computed) | MA 58:1; MB 58:4; Pesachim 94a; SA 459:2 | VERIFIED (day bounds); "72 symmetric" is a luach convention |
| `sof-zman-shma-mga-72-zmaniyos` | alos 72 zmaniyos → tzeis 72 zmaniyos | +3 / +4 | MA + Rambam's proportional 1.2 h | MA 58:1; Rambam PhM Berachos 1:1 | VERIFIED |
| `sof-zman-shma-mga-90` / `-90-zmaniyos` | alos 90 → tzeis 90 | +3 / +4 | MA with 22.5-min mil | MA 58:1; BH 459:2 | VERIFIED (components) |
| `sof-zman-shma-mga-96` / `-96-zmaniyos` | alos 96 → tzeis 96 | +3 / +4 | MA with 24-min mil | MA 58:1; MA 89:2; SAHR 459:10 | VERIFIED (components) |
| `sof-zman-shma-mga-120` | alos 120 → tzeis 120 | +3 / +4 | stringency | MA 89:2 | VERIFIED (components) |
| `sof-zman-shma-mga-16.1` | alos 16.1° → tzeis 16.1° | +3 / +4 | MA in degrees (Jerusalem rabbis / Tukaczinsky symmetric approach per PH 11:10 n.14) | MA 58:1; PH 11:10 n.14 | VERIFIED + VERIFIED-2 |
| `sof-zman-shma-mga-18` / `-19.8` | symmetric 18° / 19.8° | +3 / +4 | MA in degrees | MA 58:1; PH 11:10 n.14 (19.75° noted, criticized) | VERIFIED-2 |
| `sof-zman-shma-baal-hatanya` / `-tfila-` | netz amiti → shkia amitis (1.583°) | +3 / +4 | Chabad | Chabad.org; SAHR 443:4; Siddur (UNVERIFIED primary) | VERIFIED-2 |
| `sof-zman-shma-ateret-torah` / `-tfila-` | alos 72 zmaniyos (1/10 of day before sunrise) → 40 min after sunset (25 min in Israel) | +3 / +4 | Chacham Yosef Harari-Raful (Ateret Torah) | luach of Yeshivat Ateret Torah; existence only | UNVERIFIED |
| `sof-zman-shma-alos16.1-tzeis7.083` | asymmetric 16.1° → 7.083° | +3 | some Sefardi luchos (Ma'amar Mordechai 233:3, Ben Ish Chai Vayakhel 4, Divrei Yosef hold alos→tzeis-geonim, per PH 11:10 n.14) | PH 11:10 n.14 | VERIFIED-2 (concept); exact degrees UNVERIFIED |
| `sof-zman-shma-3h-before-chatzos` | 3 fixed hours before chatzos | | "Komarno"/Yaavetz | existence only | UNVERIFIED |

**Rabbeinu Tam's symmetric MGA.** PH 11:10 n.14 (VERIFIED-2) says Rav Tukaczinsky and the Jerusalem rabbis "established the time after sunset as equal to the time before sunrise", so that chatzos is the same for MGA and Gra. This is the justification for the symmetric 72/72 or 16.1°/16.1° day.

### Verdict on the example citation "Magen Avraham, 72 minutes as 16.1°; Shulchan Aruch Harav 89:1"

The citation is **only partly accurate. Do not use it as written.**

- **Magen Avraham.** MA 58:1 (with 233:3) establishes only that the day is counted from alos. MA never says "72 minutes" or "16.1°".
  - "72" comes from 4 mil × 18 min (Pesachim 94a; SA 459:2). MA 89:2 actually questions how the Rambam reached 1.2 hours and computes 1.5 h and 2 h.
  - 16.1° is a modern conversion (Jerusalem, equinox).
- **SAHR 89:1** does count the day from alos to tzeis and puts alos 4 mil before netz. But it gives no minute or degree value. Elsewhere the Shulchan Aruch HaRav rules mil = 24 min (SAHR 459:10), which implies 96 min, not 72. Its final position (SAHR 443:4 / Siddur, Chabad practice) counts netz→shkia.

Recommended string: **"Magen Avraham OC 58:1; Mishna Berura 58:4 (day from alos); 72 min = 4 mil × 18 min (Pesachim 94a; SA OC 459:2); 16.1° = Jerusalem equinox equivalent"**. If the Shulchan Aruch HaRav is wanted for the day-bounds, cite "Shulchan Aruch HaRav OC 58:3, 89:1".

## 5. Chatzos and chatzos halayla

| id | Definition | Source | Status | URL |
|---|---|---|---|---|
| `chatzos-astronomical` | Solar transit (local apparent noon) | MA 233:4 s.v. "שעות זמניות": mincha time is "מחצות היום ... משינטה החמה למערב ... באמצע היום ממש". Chatzos is the sun's true midpoint. | VERIFIED | https://www.sefaria.org/Magen_Avraham.233 |
| `chatzos-midpoint` | Midpoint of sunrise and sunset (or of alos and tzeis if symmetric) | MB 233:4 (12 equal parts); PH 11:10 n.14 notes asymmetric days push chatzos off true midday | VERIFIED / VERIFIED-2 | |
| `chatzos-baal-hatanya` | Midpoint of netz amiti and shkia amitis | Chabad.org | VERIFIED-2 | https://www.chabad.org/3209349 |
| `chatzos-halayla` | Solar anti-transit, ≈ midpoint of sunset and next sunrise | MA 233:4 refers to siman 1 (Zohar): night counted as 12 hours for chatzos halayla. Chabad.org: midpoint shkia amitis → netz amiti | VERIFIED (MA) / VERIFIED-2 | |

The asymmetric/symmetric chatzos controversy is discussed in Minchas Yitzchak 4:53 per the Seforim Blog (Gewirtz). That is VERIFIED-2 only for the existence of the discussion.

## 6. Mincha gedola, mincha ketana, plag hamincha

Base texts (VERIFIED: https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.233.1, https://www.sefaria.org/Mishnah_Berurah.233):

- SA OC 233:1: mincha valid from 6½ hours; main time from 9½; plag is "סוף י"א שעות חסר רביע".
- MB 233:1: 6½ hours means "חצי שעה אחר חצות".
- MB 233:3: plag = 1¼ hours before the end of the day.
- MB 233:4: hours are zmaniyos; day = alos→tzeis or netz→shkia.

| id | Definition | Holder | Source | Status |
|---|---|---|---|---|
| `mincha-gedola-gra` | chatzos + 0.5 shaah zmanis (sunrise→sunset) | Gra | SA 233:1; MB 233:1, 233:4 | VERIFIED |
| `mincha-gedola-30-min` | chatzos + 30 fixed min | | MB 233:1 wording "חצי שעה אחר חצות" (read literally) | VERIFIED (wording); fixed-minute reading is interpretation |
| `mincha-gedola-greater-of` | later of the two above (winter: 30 min) | Chabad practice ("preferable to wait the full 30 minutes") | Chabad.org | VERIFIED-2. Primary source for "later of" UNVERIFIED |
| `mincha-gedola-mga-*` | 6.5 h on the MGA day | MA | MB 233:4 | VERIFIED |
| `mincha-ketana-gra` / `-mga-*` | 9.5 h | | SA 233:1; MB 233:3 | VERIFIED |
| `plag-gra` | 10.75 h of the sunrise→sunset day (= 1.25 h before sunset) | Gra, Levush (per MA), Bach; SAHR 443:4 / Siddur; Kitzur SA. Common practice (Kaf HaChaim 233:7 per secondary) | MB 233:4; MA 233:3 | VERIFIED |
| `plag-mga-72` (+ `-72-zmaniyos`, `-90`, `-96`, `-120`, `-16.1`, `-18`, `-19.8`, `-26`) | 10.75 h of alos→tzeis day (= 1.25 h before tzeis) | Terumas HaDeshen (per MA 233:3); MB 233:4 "כך סתם המחבר"; MB 261:25 | MA 233:3; MB 233:4; MB 261:25 | VERIFIED |
| `plag-baal-hatanya` | 1.25 h before shkia amitis (netz amiti→shkia amitis day) | Chabad | Chabad.org; SAHR 443:4 | VERIFIED-2 |
| `plag-ateret-torah` | 10.75 h on Ateret Torah day (alos 72 zmaniyos → sunset+40) | Chacham Y. Harari-Raful | existence only | UNVERIFIED |
| `plag-alos16.1-tzeis-geonim` | asymmetric day ending at tzeis Geonim | Ahavat Shalom (R' Y.M. Hillel, 3.8°) and others | existence only | UNVERIFIED |
| `plag-yereim` (stringency) | 1.25 h before *start* of sunset, and this is treated as "night" | Yereim/Geonim | SAHR 261:5 (lechumra: refrain from melacha after accepting from 1.25 h before sunset) | VERIFIED |

### Plag "according to the Levush": answer

- **The Levush's own text** (Levush HaTecheles OC 233:1, 267) is not on Sefaria and was **not read**. UNVERIFIED primary.
- **MA 233:3** (VERIFIED) reports that "בלבוש ובל"ח כתבו דמשערין מהנץ החמה עד שקיעתה". MA then adds a gloss: "וגם הלבוש כוונתו בסוף השקיעה והוא כמו רביעית שעה קודם צ"ה". In other words, MA reads the Levush's end of day as the *end* of shkiah (Rabbeinu Tam's second shkiah), about ¼ hour before tzeis.
- **MA 267:1** (VERIFIED) rejects a later writer ("הע"ש") who said that "according to the Levush, plag is 2½ hours before tzeis". MA's correction: on a netz→shkia day, the Levush's plag is "ב' שעות וג' רביעית שעה וחלק עשירי" (2.85 h) before tzeis. That is 1.25 h before sunset plus 4 mil × 24 min (1.6 h) from sunset to tzeis.
- Halachipedia (secondary) lists Levush 233:1 and 267 among those counting from netz. It cites MA 233:3, Shaar HaTziyun 233:10 and Kaf HaChaim 233:7.

So **"plag according to the Levush" = 1¼ shaos zmaniyos before sunset, with the day counted sunrise→sunset.** It is **not** "1¼ hours before tzeis" and **not** an alos→tzeis computation.

On MA's reading, the day ends at the end of shkiah (about 13.5–15 min after sunset, ≈¼ h before tzeis). This would make a slightly later variant: a sunrise → (sunset + ¾ mil) day. No surveyed library offers a distinct "Levush" plag. Recommend implementing it as an alias of `plag-gra` with this note, or omitting it.

## 7. Shkiah (sunset)

| id | Definition | Source | Status |
|---|---|---|---|
| `shkiah-sea-level` | Upper limb at the sea-level horizon (center 0.833° down) | Chabad.org (published shkiah); standard practice | VERIFIED-2 |
| `shkiah-elevation` | Elevation-adjusted | see §3 (Zmanim KeHilchasam allows elevation *only* for sunrise/sunset; PH 11:6 n.7) | VERIFIED-2 |
| `shkiah-amitis-baal-hatanya` | center 1.583° below horizon (≈3.5 min after sea-level) | Chabad.org | VERIFIED-2 |

Halachic meaning:

- Biur Halacha 261:2 (VERIFIED) rules that one must be stringent like the Gra/Geonim: from the moment the sun's disk is hidden ("משעה שהחמה נתכסה מעינינו"), it is bein hashmashos and safek sekila.
- MB 261:23 (VERIFIED) advises finishing candle lighting before sunset.

## 8. Bein hashmashos

Base texts:

- Shabbos 34b–35a (VERIFIED: https://www.sefaria.org/Shabbat.34b): Rabbah has BH of R' Yehuda = "תלתא ריבעי מילא" (¾ mil). Rav Yosef has ⅔ mil. The difference between them is "פלגא דדנקא". BH of R' Yosi is "כהרף עין".
- Tosafos Shabbos 35a s.v. "תרי תילתי מיל" and Tosafos Pesachim 94a s.v. "רבי יהודה אומר" (VERIFIED) give Rabbeinu Tam's two-shkios resolution.

| id | Definition | Holder | Source | Status | URL |
|---|---|---|---|---|---|
| `bh-start-rt-58.5` | starts 3¼ mil (58.5 min, 18-min mil) after sunset; lasts ¾ mil (13.5 min); ends 72 min | Rabbeinu Tam | SA OC 261:2 ("ג' מילין ורביע"); MB 261:20; Tosafos Shabbos 35a, Pesachim 94a | VERIFIED | https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.261.2 |
| `bh-start-rt-13.24` | 13.24° (58.5 min at Jerusalem equinox) | RT in degrees | COMPUTED (13.22°) | COMPUTED | |
| `bh-geonim-13.5` / `-16.875` / `-18` | sunset → +¾ mil (18 / 22.5 / 24-min mil) | Geonim (R' Sherira, R' Hai, R' Nissim per Maharam Alshakar 96), Gra, Rif/Rambam/Rashi per Maharalbach; Seder Zmanim | Biur Halacha 261:2 s.v. "מתחלת השקיעה"; MB 261:23 | VERIFIED | https://www.sefaria.org/Biur_Halacha.261.2 |
| `bh-geonim-3.7` / `-4.42` / `-4.66` (deg) | ¾ mil after sunset in degrees | Geonim in degrees | COMPUTED (3.70 / 4.42 / 4.66) | COMPUTED | |
| `bh-yereim-13.5` / `-16.875` / `-18` | BH runs from ¾ mil *before* sunset until sunset; night begins at sunset | Yereim (R' Eliezer of Metz); cited in Aguda, Mordechai Shabbos ch. 2; Bach urges following it; SAHR 261:5 | Sefer Yereim HaShalem (Vilna 1892–1901) siman 274; BH 261:2; SAHR 261:5 | VERIFIED | https://www.sefaria.org/Sefer_Yereim.274 ; https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.261.5 |
| `bh-yereim-2.1` / `-2.8` / `-3.05` (deg above horizon) | sun *above* horizon by these angles | Yereim in degrees | COMPUTED (2.04° / 2.75° / 2.99°) | COMPUTED | |

**Yereim siman number.** The verified number is **274** in the Vilna *Yereim HaShalem* numbering (Sefaria's numbering). The abridged/older editions are numbered differently. "331" was not found in the Sefaria text of bein hashmashos (only mitzvos 218, 274, 402, 420–422 mention BH). The OU article on candle lighting also cites "Sefer Yereim 274". Use **"Sefer Yereim 274 (HaShalem ed.)"**.

**Notes on the Yereim text** (my reading, VERIFIED text). The Yereim interprets "משתשקע החמה" as when the sun *begins* to sink, before Ulla's shkiah. He writes "ולשון משתשקע משמע הקדמה". BH comes before visible sunset, and after sunset it is "לילה גמור". The ¾-mil length is the standard reading (BH 261:2, SAHR 261:5).

The Gra adds (BH 261:2, VERIFIED) that the ¾-mil figure was stated for the Babylonian/Israeli horizon at the equinox. In northern lands BH lasts longer, so tzeis follows the visibility of 3 medium (practically small) stars. This is the halachic basis for *degree*-based tzeis outside Israel.

## 9. Tzeis hakochavim

Base texts (VERIFIED):

- SA OC 562:1: tzeis = "שיראה ג' כוכבים בינונים".
- SA OC 293:2: motzei Shabbos is when "שלשה כוכבים קטנים ... רצופים" are seen.
- MB 261:23–24.

| id | Definition | Holder | Source | Status | URL |
|---|---|---|---|---|---|
| `tzeis-geonim-3.7` | 3.7° (13.5 min) | Geonim, 18-min mil. Lechumra for "night starts" only | BH 261:2; COMPUTED | VERIFIED (opinion), COMPUTED (deg) | |
| `tzeis-geonim-3.65` | 3.65° | R' Yedidya Manet, *Zmanei HaHalacha LeMa'aseh* (different refraction) | existence only | UNVERIFIED | |
| `tzeis-geonim-3.8` | 3.8° (13.5 + ½ min heref ayin of R' Yosi) | | existence only | UNVERIFIED | |
| `tzeis-geonim-4.42` / `-4.66` / `-4.8` | 16.875 / 18 / 18.6 min | Geonim with 22.5/24-min mil; 4.8° per *Aizehu Bein HaShmashos* (R' Y.M. Shlezinger) | BH 261:2 (mil); rest existence only | VERIFIED (concept) / UNVERIFIED (attributions) | |
| `tzeis-baal-hatanya` | 6° | Chabad: ≈20 min after shkia amitis (¾ of a 24-min mil + 2 min R' Yosi) | Chabad.org | VERIFIED-2 | https://www.chabad.org/3209349 |
| `tzeis-geonim-5.95` | 5.95° (24 min) | Hazmanim BaHalacha (per docs) | existence only | UNVERIFIED |
| `tzeis-6.45` | 6.45° | Rav Tukaczinsky (3 medium stars, Jerusalem ≤31 min incl. 3-min correction); Israeli custom for ending rabbinic fasts. MyZmanim lists "6.45° (Eretz Yisrael custom)" | MyZmanim sources page (*Bein HaShmashos* 28+3 min) | VERIFIED-2 | https://myzmanim.com/read/sources.aspx |
| `tzeis-7.083` | 7°5′ | Dr. Baruch (Berthold) Cohn, *Tabellen ...* (Strasbourg 1899); endorsed by R' D.Z. Hoffmann, *Melamed LeHo'il* OC 30 | existence only | UNVERIFIED (primary not read) | |
| `tzeis-7.67` | 7.67° (45 min NY solstice) | Igros Moshe EH 4:4 (per docs) | existence only | UNVERIFIED | |
| `tzeis-8.5` | 8.5° (≈36 min Jerusalem equinox) | Rav Tukaczinsky's observation of 3 *small* stars (*Bein HaShmashos*; Jerusalem ≤40+3 min). Chabad uses it for end of Shabbos/Yom Tov. "Most luach writers" per Hazmanim BaHalacha (Avodah secondary) | MyZmanim sources page; Chabad.org; Jewish Action review (8.5° "generally" used for motzei Shabbos, based on SA 293:2) | VERIFIED-2 | https://myzmanim.com/read/sources.aspx ; https://www.chabad.org/3209349 |
| `tzeis-8.5` "Ohr Meir" attribution | R' Meir Posen, *Ohr Meir* | | none found | UNVERIFIED |
| `tzeis-9.3`, `tzeis-9.75` | Itim LeBina stringent / 60 min NY | | existence only | UNVERIFIED |
| `tzeis-42-min` | 42 fixed min | US communal practice | Kol Torah (R' Jachter) secondary | VERIFIED-2 (as custom) | https://www.koltorah.org/halachah/when-does-shabbat-end-by-rabbi-chaim-jachter |
| `tzeis-50-min` | 50 fixed min | Igros Moshe OC 4:62 (NY/NJ: sky full of stars ≈50 min; 72 recommended) | secondary quotes (Avodah, MyZmanim, Kol Torah) | VERIFIED-2 | https://myzmanim.com/read/sources.aspx |
| `tzeis-60-min` | 60 min | 4 × 15-min mil (Chavas Yair, Divrei Malkiel) | existence only | UNVERIFIED |
| `tzeis-72-min` (`tzeis-rt`) | 72 fixed min | Rabbeinu Tam | SA OC 261:2; Tosafos Shabbos 35a | VERIFIED |
| `tzeis-72-zmaniyos` | 1.2 shaos zmaniyos after sunset | RT with proportional mil | Rambam PhM Berachos 1:1 (proportional); SA 261:2 | VERIFIED (components) |
| `tzeis-90` / `-96` / `-120` (+ zmaniyos) | | RT with 22.5/24-min mil; 120 = 5 mil | BH 459:2; SAHR 459:10; MA 89:2. Halachipedia cites MA 267:1 for "96 minutes between shkia and tzeis" | VERIFIED (components) |
| `tzeis-16.1` / `-18` / `-19.8` / `-26` | degree versions | RT in degrees | COMPUTED | COMPUTED |
| `tzeis-ateret-torah` | sunset + 40 min (25 in Israel); used only as the end of the Ateret Torah day | Chacham Y. Harari-Raful | existence only | UNVERIFIED |

**"3 stars" degree.** There is no single answer:

- 3 *medium* stars (SA 562:1) is variously 6.45° (Tukaczinsky, Israel), 7.083° (Cohn) or 5.95–6° (Chabad).
- 3 *small* stars (SA 293:2, end of Shabbos) is 8.5°.

## 10. Candle lighting

Base texts:

- SA OC 261:2 / Rema: tosefes may begin from plag. VERIFIED.
- MB 261:23: light before sunset; praiseworthy to stop melacha 20–30 min before sunset. VERIFIED.

| id | Offset before sea-level sunset | Holder / place | Source | Status |
|---|---|---|---|---|
| `candles-18` | 18 min | General Ashkenazi/diaspora custom; Chabad.org | Chabad.org (custom). OU (Outorah) traces origins to the six shofar blasts (Shabbos 35b; *Minhagei Eretz Yisrael* (Gliss) 20:9) or to the Yereim's ¾ mil (Yereim 274; Shu"t Mahari Shteif 1) | VERIFIED-2 (custom); no binding primary source |
| `candles-40` | 40 min | Jerusalem (and Petach Tikva, founded by Jerusalemites) | OU cites *Shita Mekubetzes* Beitza 30a; Yabia Omer 5:21 calls it without halachic basis; Kaf HaChaim 261:23 and Igros Moshe OC 2:6 note 18–20 min communities in Jerusalem; Gewirtz (Seforim Blog 2019): origin unknown | VERIFIED-2 |
| `candles-30` | 30 min | Haifa, Zichron Yaakov | hebcal docs (existence only) | UNVERIFIED (no halachic source) |
| `candles-20` | 20 min | Tzfas / some Israeli cities; also 20–22 min customs | none confirmed | UNVERIFIED |
| `candles-22` | 22 min | "half a shaah" custom | OU (no citation) | UNVERIFIED |
| `candles-15` / `candles-10` | 15 (Satmar, *Divrei Yoel*) / 10 (Igros Moshe OC 2:6) | | OU footnotes | VERIFIED-2 |
| Bnei Brak | 20 vs 22 vs 30 | | none confirmed | UNVERIFIED |

The library should treat candle-lighting offsets as **location customs (data)**, not halachic opinions.

## 11. End of Shabbos / Havdala

| id | Definition | Source | Status |
|---|---|---|---|
| `havdala-8.5` | 8.5° | SA OC 293:2 (3 small stars); Tukaczinsky; Chabad.org | VERIFIED (SA) + VERIFIED-2 |
| `havdala-72-rt` | 72 min (or 16.1°) | SA 261:2 (RT); Igros Moshe OC 4:62 recommends 72 for the G-d-fearing | VERIFIED / VERIFIED-2 |
| `havdala-50` | 50 min (NY) | Igros Moshe OC 4:62 | VERIFIED-2 |
| `havdala-42` / `havdala-40` | fixed | US communal custom; Kaf HaChaim (40 min in EY, per MyZmanim); Nevreshes (40) | VERIFIED-2 |
| `havdala-7.083` | 7.083° | many European luchos (Cohn) | UNVERIFIED |

## 12. Erev Pesach: chametz

Base text: SA OC 443:1 (VERIFIED, https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.443.1).

- Eating is permitted until the end of the 4th hour. Benefit is permitted through the 5th hour. From the start of the 6th hour, benefit is forbidden too.
- Rema: hours follow the length of the day ("עד שליש היום", Rambam PhM). "וי"א עד ב' שעות קודם חצות (תה"ד קכ"א)" means fixed hours.
- SAHR 443:4 (VERIFIED): day = netz→shkia. A minority view uses fixed (24-per-day) hours, which may be relied on for great loss in *selling*.

| id | Definition | Status |
|---|---|---|
| `sof-achilas-chametz-gra` | sunrise + 4 shaos zmaniyos (sunrise→sunset day) | VERIFIED |
| `sof-biur-chametz-gra` | sunrise + 5 shaos zmaniyos | VERIFIED |
| `sof-achilas-chametz-mga-72` / `-72-zmaniyos` / `-16.1` | alos + 4 h on the MGA day | VERIFIED (MA 58:1 logic; MA 443 also discusses; PH notes MA 443:3 is uncertain about day bounds) |
| `sof-biur-chametz-mga-*` | alos + 5 h on the MGA day | as above |
| `sof-achilas-chametz-baal-hatanya` / `sof-biur-...` | netz amiti + 4 / + 5 | VERIFIED-2 (SAHR 443:4 + Chabad.org) |
| `sof-...-fixed-hours` (Terumas HaDeshen 121) | 2 / 1 fixed hours before chatzos | VERIFIED (Rema cites it); niche |

## 13. Fasts

Base texts (all VERIFIED):

- SA OC 564:1: may eat until alos if one did not sleep (or stipulated).
- SA OC 562:1: a fast lasts until tzeis = 3 medium stars.
- SA OC 553:2: Tisha B'Av begins at bein hashmashos, i.e., by sunset.

| id | Definition | Holder | Source | Status |
|---|---|---|---|---|
| `fast-start-alos-*` | any alos opinion (72, 16.1°, 90, 19.8°; 120/26° lechumra) | | SA 564:1 | VERIFIED (rule); choice of alos is custom |
| `fast-end-6.45` | 6.45° | Israel custom (Tukaczinsky's 3 medium stars) | MyZmanim | VERIFIED-2 |
| `fast-end-7.083` | 7.083° | European luchos | | UNVERIFIED |
| `fast-end-41-min` | NY, for one who finds fasting hard ≈41 min (MyZmanim's "7.12°" for R' Moshe) | Igros Moshe (exact siman unverified) | MyZmanim | VERIFIED-2 (minutes) / UNVERIFIED (siman) |
| `fast-end-8.5` | 8.5° | stringent | | VERIFIED-2 |
| `fast-end-25-min` | 25 min after sunset (bein hashmashos for milah) | Shemiras Shabbos KeHilchasa, quoting R' S.Z. Auerbach | MyZmanim | VERIFIED-2 |

Tisha B'Av vs. minor fasts:

- Same tzeis rule (SA 562:1).
- Tisha B'Av starts at *sunset* the previous evening (SA 553:2), and some end it later (8.5°). The latter is UNVERIFIED as a general rule.

## 14. Kiddush Levana

Texts (VERIFIED): SA OC 426:3–4 and MB 426:17–20 (https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.426.3-4).

| id | Definition | Holder | Source | Status |
|---|---|---|---|---|
| `kiddush-levana-start-3-days` | molad + 72 h | "רוב האחרונים", incl. the Gra | **MB 426:20** (not SA/Rema) | VERIFIED |
| `kiddush-levana-start-7-days` | molad + 7 days | Mechaber | **SA OC 426:4** ("עד שיעברו שבעת ימים") | VERIFIED |
| `kiddush-levana-end-half-month` | molad + 14d 18h 22m 1⅔s (half of 29d 12h 793 chalakim) | Rema (Maharil) | **Rema OC 426:3**; MB 426:19 | VERIFIED |
| `kiddush-levana-end-15-days` | molad + 15 days (until 16th, exclusive) | Mechaber | **SA OC 426:3** ("עד י"ו מיום המולד ולא י"ו בכלל"); MB 426:17 (counted from the molad hour) | VERIFIED |

Corrections to the request:

- 426:3–4 are not Rema-only. The 15-day end and the 7-day start are both the Mechaber (426:3 and 426:4). Only the half-month end is the Rema's (426:3). The Rema's gloss at 426:4 is about not sanctifying under a roof.
- The 3-day start comes from **MB 426:20**.
- Arithmetic for the half-month end: 793 chalakim / 2 = 396.5 chalakim = 22 min + ½ chelek, where 1 chelek = 3⅓ s.

## 15. High-latitude fallbacks

| id | Rule | Holder | Source | Status |
|---|---|---|---|---|
| `alos-fallback-chatzos-halayla` | In northern lands from 18 Iyar, alos begins at chatzos halayla (the sun never gets deep enough) | Alter Rebbe, Siddur (gloss on Sefiras HaOmer / Seder); Tzemach Tzedek; the Lubavitcher Rebbe 5724 re: 17 Tammuz starting at chatzos | Chabad zmanim site (secondary, quotes "וזמן התחלת עמוד השחר מח"י אייר ואילך במדינות אלו הצפוניות הוא בחצות הלילה") | VERIFIED-2 |
| `no-alos` | Where the sun never reaches 19.75°, there is no alos at that angle | R' Eitan Tzikuni (Daat) | search snippet | VERIFIED-2 (weak) |
| `polar-day-boundary-azimuth` | Polar sunrise/sunset = sun due east / west | R' Yehosef Schwarz, *Divrei Yosef*; Ben Ish Chai, *Rav Pealim* 2, Sod Yesharim 4 | existence only | UNVERIFIED |
| `polar-no-mitzvos` | Polar summer: no night mitzvos; polar winter: no day mitzvos; date changes at chatzos | R' Moshe Sternbuch, *Moadim UZmanim* 2:155 n.1; *Teshuvos VeHanhagos* 1:315, 5:84 | existence only | UNVERIFIED |

Searched for but **not found**: Igros Moshe, Minchas Yitzchak and the London Beth Din on a 16.1° fallback in British summers. **UNVERIFIED.** Do not cite them.

Recommended engineering behavior: return `null` / "does not occur" when the depression angle is never reached. Optionally offer the documented Chabad fallback (chatzos halayla) as an explicit, labelled opinion.

---

## Citation strings

Short canonical strings for code. Use only the VERIFIED ones as authoritative. The others must carry their status.

### VERIFIED (primary text read on Sefaria)

- "Pesachim 93b–94a (4 mil alos–netz / shkia–tzeis)": VERIFIED
- "Shabbos 34b–35a (bein hashmashos ¾ mil)": VERIFIED
- "Tosafos Shabbos 35a s.v. Trei Tilsei Mil; Tosafos Pesachim 94a s.v. R' Yehuda (Rabbeinu Tam)": VERIFIED
- "Rambam, Commentary on Mishna Berachos 1:1 (alos = 1.2 shaos zmaniyos)": VERIFIED
- "Shulchan Aruch OC 58:1; Magen Avraham 58:1; Mishna Berura 58:4 (day from alos vs. netz)": VERIFIED
- "Shulchan Aruch OC 89:1; Magen Avraham 89:2 (alos; mil of 18/24 min)": VERIFIED
- "Mishna Berura 89:1–2 (netz; alos)": VERIFIED
- "Shulchan Aruch OC 233:1; Rema 233:1; Mishna Berura 233:1–4": VERIFIED
- "Magen Avraham 233:3 (Terumas HaDeshen alos–tzeis; Levush/Bach netz–shkia)": VERIFIED
- "Magen Avraham 233:4 (chatzos is true midday)": VERIFIED
- "Magen Avraham 267:1 (plag per Levush ≈ 2.85 h before tzeis)": VERIFIED
- "Shulchan Aruch OC 261:2; Mishna Berura 261:20–25 (Rabbeinu Tam)": VERIFIED
- "Biur Halacha 261:2 s.v. MiTechilas HaShkiah (Geonim/Gra; Yereim)": VERIFIED
- "Sefer Yereim 274 (HaShalem ed.)": VERIFIED
- "Shulchan Aruch HaRav OC 58:3; 89:1 (day from alos to tzeis)": VERIFIED
- "Shulchan Aruch HaRav OC 443:4 (day from netz to shkia)": VERIFIED
- "Shulchan Aruch HaRav OC 459:10 (mil = 24 min)": VERIFIED
- "Shulchan Aruch HaRav OC 261:5 (Yereim stringency; plag)": VERIFIED
- "Shulchan Aruch OC 459:2; Mishna Berura 459:15 (mil = 18 min)": VERIFIED
- "Biur Halacha 459:2 (mil = 22.5 min)": VERIFIED
- "Shulchan Aruch OC 443:1; Rema 443:1 (chametz 4th/5th hour)": VERIFIED
- "Shulchan Aruch OC 293:2 (3 small stars, end of Shabbos)": VERIFIED
- "Shulchan Aruch OC 562:1 (fast ends at 3 medium stars)": VERIFIED
- "Shulchan Aruch OC 564:1 (eat until alos)": VERIFIED
- "Shulchan Aruch OC 553:2 (Tisha B'Av from bein hashmashos)": VERIFIED
- "Shulchan Aruch OC 426:3 (until 15 days); Rema 426:3 (half of 29d 12h 793p); Mishna Berura 426:17–19": VERIFIED
- "Shulchan Aruch OC 426:4 (after 7 days); Mishna Berura 426:20 (after 3 days)": VERIFIED

### VERIFIED-2 (secondary only; label as such in code)

- "Peninei Halakha, Tefilla 11:2 (alos 16.1°; misheyakir 11°)"
- "Peninei Halakha, Tefilla 11:6 (netz; elevation)"
- "Peninei Halakha, Tefilla 11:10 (MGA vs. Gra)"
- "Yechave Daas 2:8 (alos 72 min/16.1°; misheyakir 66 min), per Peninei Halakha"
- "Kaf HaChaim 18:18 (misheyakir 60 min), per Peninei Halakha"
- "Igros Moshe OC 4:62 (Shabbos ends ≥50 min NY; 72 preferable)"
- "Igros Moshe OC 1:97 (netz at Jerusalem altitude), per Peninei Halakha"
- "Zmanim KeHilchasam (Bursztyn), 7th ed., ch. 2 §§7, 9 (elevation only for sunrise/sunset)"
- "R' Y.M. Tukaczinsky, Bein HaShmashos (Jerusalem: 3 medium stars ≤28+3 min; 3 small stars ≤40+3 min)" (basis of 6.45° and 8.5°)
- "Chabad.org, About Our Zmanim Calculations (alos 16.9°, misheyakir 10.2°, netz/shkia amitis 1.583°, tzeis 6°, Shabbos end 8.5°)"
- "Siddur Admur HaZaken (northern lands: alos at chatzos from 18 Iyar)"
- Candle-lighting customs: Jerusalem 40, general 18. Cite as minhag; Yabia Omer 5:21; Igros Moshe OC 2:6; Kaf HaChaim 261:23.

### UNVERIFIED (do not present as fact)

- Levush OC 233:1 / 267 (text not read; known only via MA 233:3, 267:1)
- Melamed LeHo'il OC 30 / Dr. Baruch Cohn 7°5′
- Ohr Meir (R' Meir Posen) 8.5°
- Birur Halacha (Zilber) OC 18 (12.85°); vol. 6 ch. 58 (elevation)
- Ateret Torah (Harari-Raful) 40/25 min day
- R' Yisroel Belsky on elevation
- R' Yehuda Levi
- Haifa 30 / Tzfas 20 / Bnei Brak candle lighting
- Igros Moshe EH 4:4 (45 min)
- R' Sternbuch polar rulings
- Ben Ish Chai polar rulings
- Igros Moshe / Minchas Yitzchak / London Beth Din high-latitude 16.1° fallback

## Primary URLs used

- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.58.1
- https://www.sefaria.org/Magen_Avraham.58.1
- https://www.sefaria.org/Mishnah_Berurah.58.4
- https://www.sefaria.org/Magen_Avraham.89.2
- https://www.sefaria.org/Magen_Avraham.233
- https://www.sefaria.org/Magen_Avraham.267.1
- https://www.sefaria.org/Mishnah_Berurah.233.1-4
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.261.2
- https://www.sefaria.org/Mishnah_Berurah.261.20-27
- https://www.sefaria.org/Biur_Halacha.261.2
- https://www.sefaria.org/Sefer_Yereim.274
- https://www.sefaria.org/Shabbat.34b
- https://www.sefaria.org/Shabbat.35a
- https://www.sefaria.org/Pesachim.94a
- https://www.sefaria.org/Tosafot_on_Shabbat.35a
- https://www.sefaria.org/Tosafot_on_Pesachim.94a
- https://www.sefaria.org/Rambam_on_Mishnah_Berakhot.1.1
- https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.89.1
- https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.58.3
- https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.443.4
- https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.459.10
- https://www.sefaria.org/Shulchan_Arukh_HaRav,_Orach_Chayim.261.5
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.459.2
- https://www.sefaria.org/Biur_Halacha.459.2
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.443.1
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.426.3-4
- https://www.sefaria.org/Mishnah_Berurah.426.17-20
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.293.2
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.562.1
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.564.1
- https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.553.2
- https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.2
- https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.6
- https://www.sefaria.org/Peninei_Halakhah,_Prayer.11.10
- https://www.chabad.org/3209349
- https://myzmanim.com/read/sources.aspx
- https://outorah.org/p/34953
- https://seforimblog.com/?p=4062
- https://halachipedia.com/index.php?title=Plag_Hamincha
- https://www.koltorah.org/halachah/when-does-shabbat-end-by-rabbi-chaim-jachter
