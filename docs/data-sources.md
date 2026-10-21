# Data sources and licences

Every dataset Luach ships or tests against, and its licence.

| Data | Used for | Source | Licence | Shipped? |
|---|---|---|---|---|
| Calendar rules (molad, dechiyos, leap cycle) | M1 | Rambam, Hilchos Kiddush HaChodesh 6–8 | Public domain (12th century) | Yes (as code) |
| Solar position equations | M4 | NOAA Global Monitoring Laboratory Solar Calculator; Meeus, *Astronomical Algorithms* (method) | NOAA: US government work, public domain | Yes (as code) |
| City coordinates, elevation, time zones, Hebrew names | M5 | GeoNames `cities15000` and `alternateNamesV2` (language `he`), downloaded 2026-10-21, https://download.geonames.org/export/dump/ | CC-BY 4.0 — credited in NOTICE | Yes |
| City elevations where GeoNames has none | M5 | GeoNames `dem` column (derived from SRTM3, NASA; US government work) | Public domain (SRTM) via GeoNames CC-BY 4.0 | Yes |
| Hebrew names for Modiin Ilit and Ariel | M5 | Entered by hand (GeoNames has none) | Facts | Yes |
| Israel boundary polygon (`src/places/israel-boundary.json`) | M5 | Drawn by hand from published coordinates of border points, accurate to a few km | Facts | Yes |
| Candle-lighting minutes for Jerusalem (40), Haifa and Zikhron Ya'akov (30) | M5 | Local customs as documented in the research note (docs/research/2026-10-21-what-users-want.md §5) | Facts | Yes |
| Parsha sequence and keviyos | M3 | Tur OC 428; the Torah's parsha division | Public domain | Yes |
| Learning-cycle structure (dafim per tractate, mishnayos per chapter, Rambam chapters, Nach chapters) and start dates | M3 | Wikipedia (en/he), Sefaria's text structure API, the cycles' organisers (OU, Chabad.org, Dirshu, dafyomi.co.il); see docs/research/2026-10-21-learning-cycles.md | Facts | Yes |
| Haftara references by custom | M3 | Shulchan Aruch / Mishna Berura (Sefaria), Sefaria calendar API, Wikipedia (en/he), AlHaTorah, Chabad.org; see docs/research/2026-10-21-haftaros.md | Facts (references only, no text) | Yes |
| Learning-cycle oracle | tests | @hebcal/learning | BSD-2-Clause | No (devDependency) |
| Haftara oracle | tests | @hebcal/leyning | BSD-2-Clause | No (devDependency) |
| Holiday and parsha oracle | tests | @hebcal/core | GPL-2.0-or-later | No (devDependency) |
| Learning-cycle oracle | tests | @hebcal/learning | BSD-2-Clause | No (devDependency) |
| Zmanim oracle | tests | kosher-zmanim | LGPL-3.0 | No (devDependency) |
| Solar oracle | tests | astronomy-engine | MIT | No (devDependency) |
| Hand-entered published luach values | tests | named in each test | facts quoted for verification | No |
