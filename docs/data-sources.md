# Data sources and licences

Every dataset Luach ships or tests against, and its licence.

| Data | Used for | Source | Licence | Shipped? |
|---|---|---|---|---|
| Calendar rules (molad, dechiyos, leap cycle) | M1 | Rambam, Hilchos Kiddush HaChodesh 6–8 | Public domain (12th century) | Yes (as code) |
| Solar position equations | M4 | NOAA Global Monitoring Laboratory Solar Calculator; Meeus, *Astronomical Algorithms* (method) | NOAA: US government work, public domain | Yes (as code) |
| City coordinates, elevation, time zones | M5 | GeoNames, https://www.geonames.org | CC-BY 4.0 — credited in NOTICE | Yes |
| Parsha sequence and keviyos | M3 | Tur OC 428; the Torah's parsha division | Public domain | Yes |
| Learning-cycle orders (tractate/chapter lengths) | M3 | Counts of dapim/chapters in standard printed editions (facts) | Facts, not copyrightable | Yes |
| Holiday and parsha oracle | tests | @hebcal/core | GPL-2.0-or-later | No (devDependency) |
| Learning-cycle oracle | tests | @hebcal/learning | BSD-2-Clause | No (devDependency) |
| Zmanim oracle | tests | kosher-zmanim | LGPL-3.0 | No (devDependency) |
| Solar oracle | tests | astronomy-engine | MIT | No (devDependency) |
| Hand-entered published luach values | tests | named in each test | facts quoted for verification | No |
