# Halachic notes

> **Ask your rav. This library calculates; it does not rule.**

This page lists every zman Luach names, with the opinion and source each function reports about itself (it is
generated from the code). A source marked "(unverified)" has not yet been checked against the text; please
[open an issue](https://github.com/yskolnick/luach/issues) if you can confirm or correct one.

## Conventions

### Sea level and elevation

Sunrise and sunset are computed at sea level unless you pass `{ elevation: true }`, which adds the dip of the
horizon seen from the location's elevation, or `{ horizonDip }` with your own value. Times defined by the sun's
depression angle (16.1°, 8.5°…) and the fixed-minute times of the Magen Avraham are always computed at sea level
and geometrically: the angles were chosen to match a level of light at a given place and season, and most luchos
that use them compute them this way. Some luchos (for example in Jerusalem) use elevation for netz and shkiah; that
is a choice for the caller.

### Rounding

An earliest time ("not before": alos, netz, mincha, tzeis) rounds **up** to the next minute; a deadline ("not after":
Shema, Tefilla, chametz, shkiah, candle lighting) rounds **down**. The start of a fast is the deadline for eating and
rounds down. Pass `{ rounding: 'none' }` for exact times, or `'up'`/`'down'` to force a direction.

### Proportional hours

Hours in the Shulchan Aruch are proportional ("shaos zmaniyos", Rema OC 233:1): a twelfth of the day, where the day
is defined by the opinion:

| Day | Definition | Source |
|---|---|---|
| `gra` | Gra: the day from sunrise to sunset | Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) |
| `ma72` | Magen Avraham: the day from alos to tzeis, 72 fixed minutes | Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) |
| `ma90` | Magen Avraham: the day from alos to tzeis, 90 fixed minutes | Magen Avraham 58:1; 4 mil of 22½ minutes (unverified) |
| `ma96` | Magen Avraham: the day from alos to tzeis, 96 fixed minutes | Magen Avraham 58:1; 4 mil of 24 minutes (unverified) |
| `ma120` | Magen Avraham: the day from alos to tzeis, 120 fixed minutes | Magen Avraham 58:1; 5 mil of 24 minutes (unverified) |
| `ma72z` | Magen Avraham: the day from alos to tzeis, 72 proportional minutes (1.2 hours zmaniyos) | Magen Avraham 58:1; Pesachim 94a |
| `ma90z` | Magen Avraham: the day from alos to tzeis, 90 proportional minutes | Magen Avraham 58:1 (unverified for 90) |
| `ma16` | Magen Avraham: the day from alos to tzeis at 16.1° (72 minutes in Jerusalem at the equinox) | Magen Avraham 58:1; 16.1° as the equinox equivalent of 72 minutes in Jerusalem |
| `tanya` | Baal HaTanya: the day from netz amiti to shkiah amitis (1.583°) | Shulchan Aruch HaRav, Seder Hachnasas Shabbos (unverified) |
| `ateret` | Ateret Torah: the day from alos (1/10 of the day) to tzeis 40 minutes | Chacham Yosef Harari-Raful, Yeshivat Ateret Torah (unverified) |

### When the sun doesn't reach the angle

Far from the equator the sun may not get 16.1° (or even 8.5°) below the horizon in summer, and near the poles it may
not rise or set. Luach then returns `time: null` and `reason: 'sun-always-above'` or `'sun-always-below'`; it
never returns a made-up time. An opt-in fallback, `{ highLatitude: 'solar-midnight' }`, uses the moment the sun is
lowest instead and marks the result `fallback: 'solar-midnight'`. It is a convenience, not a halachic opinion.

### Misheyakir angles

Luach names misheyakir at 11.5°, 11° and 10.2°. Other angles are printed in some luchos (7.65°, 9.5°, 12.85°), but no
published source tying them to a named authority was found; use `misheyakirAtDegrees(x)` for them on your rav's
say-so.

### Candle lighting

Candle lighting is a fixed number of minutes before sunset by local custom: 18 is the common default; Jerusalem 40;
Haifa and Zikhron Ya'akov 30. These are customs, not rules; pass the number your community uses.

## Sunrise and sunset

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `netz` | Netz HaChama | SA OC 58:1, 89:1 | up |
| `shkiah` | Shkiah | SA OC 261:2; Mishna Berura 261:23 | down |
| `sunriseElevation` | Sunrise from elevation | NOAA Solar Calculator; zenith 90°50′ plus dip of the horizon | up |
| `sunriseSeaLevel` | Sunrise at sea level | NOAA Solar Calculator; zenith 90°50′ | up |
| `sunsetElevation` | Sunset from elevation | NOAA Solar Calculator; zenith 90°50′ plus dip of the horizon | down |
| `sunsetSeaLevel` | Sunset at sea level | NOAA Solar Calculator; zenith 90°50′ | down |

## Alos (dawn)

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `alos120` | Alos 120 minutes before sunrise | 5 mil of 24 minutes (unverified) | up |
| `alos16_1` | Alos at 16.1° | Equinox equivalent of 72 minutes in Jerusalem | up |
| `alos18` | Alos at 18° | Astronomical twilight (unverified as a halachic source) | up |
| `alos19_8` | Alos at 19.8° | Equinox equivalent of 90 minutes in Jerusalem | up |
| `alos26` | Alos at 26° | Equinox equivalent of 120 minutes in Jerusalem | up |
| `alos72` | Alos 72 minutes before sunrise | Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | up |
| `alos72Zmaniyos` | Alos 72 proportional minutes before sunrise | Pesachim 94a; proportional minutes (unverified) | up |
| `alos90` | Alos 90 minutes before sunrise | 4 mil of 22½ minutes (unverified) | up |
| `alos96` | Alos 96 minutes before sunrise | 4 mil of 24 minutes (unverified) | up |

## Misheyakir

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `misheyakir10_2` | Misheyakir at 10.2° | SA OC 58:1; angle (unverified) | up |
| `misheyakir11` | Misheyakir at 11° | SA OC 58:1; angle (unverified) | up |
| `misheyakir11_5` | Misheyakir at 11.5° | SA OC 58:1 ("recognise a friend"); angle (unverified) | up |

## Latest Shema

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `sofZmanShemaAteretTorah` | Sof zman Shema, Ateret Torah: the day from alos (1/10 of the day) to tzeis 40 minutes | SA OC 58:1 (end of 3 hours, a quarter of the day); Chacham Yosef Harari-Raful, Yeshivat Ateret Torah (unverified) | down |
| `sofZmanShemaBaalHaTanya` | Sof zman Shema, Baal HaTanya: the day from netz amiti to shkiah amitis (1.583°) | SA OC 58:1 (end of 3 hours, a quarter of the day); Shulchan Aruch HaRav, Seder Hachnasas Shabbos (unverified) | down |
| `sofZmanShemaGra` | Sof zman Shema, Gra: the day from sunrise to sunset | SA OC 58:1 (end of 3 hours, a quarter of the day); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | down |
| `sofZmanShemaMA16_1` | Sof zman Shema, Magen Avraham: the day from alos to tzeis at 16.1° (72 minutes in Jerusalem at the equinox) | SA OC 58:1 (end of 3 hours, a quarter of the day); Magen Avraham 58:1; 16.1° as the equinox equivalent of 72 minutes in Jerusalem | down |
| `sofZmanShemaMA72` | Sof zman Shema, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 58:1 (end of 3 hours, a quarter of the day); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | down |
| `sofZmanShemaMA72Zmaniyos` | Sof zman Shema, Magen Avraham: the day from alos to tzeis, 72 proportional minutes (1.2 hours zmaniyos) | SA OC 58:1 (end of 3 hours, a quarter of the day); Magen Avraham 58:1; Pesachim 94a | down |
| `sofZmanShemaMA90` | Sof zman Shema, Magen Avraham: the day from alos to tzeis, 90 fixed minutes | SA OC 58:1 (end of 3 hours, a quarter of the day); Magen Avraham 58:1; 4 mil of 22½ minutes (unverified) | down |
| `sofZmanShemaMA90Zmaniyos` | Sof zman Shema, Magen Avraham: the day from alos to tzeis, 90 proportional minutes | SA OC 58:1 (end of 3 hours, a quarter of the day); Magen Avraham 58:1 (unverified for 90) | down |

## Latest Shacharis

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `sofZmanTefillaAteretTorah` | Sof zman Tefilla, Ateret Torah: the day from alos (1/10 of the day) to tzeis 40 minutes | SA OC 89:1 (end of 4 hours, a third of the day); Chacham Yosef Harari-Raful, Yeshivat Ateret Torah (unverified) | down |
| `sofZmanTefillaBaalHaTanya` | Sof zman Tefilla, Baal HaTanya: the day from netz amiti to shkiah amitis (1.583°) | SA OC 89:1 (end of 4 hours, a third of the day); Shulchan Aruch HaRav, Seder Hachnasas Shabbos (unverified) | down |
| `sofZmanTefillaGra` | Sof zman Tefilla, Gra: the day from sunrise to sunset | SA OC 89:1 (end of 4 hours, a third of the day); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | down |
| `sofZmanTefillaMA16_1` | Sof zman Tefilla, Magen Avraham: the day from alos to tzeis at 16.1° (72 minutes in Jerusalem at the equinox) | SA OC 89:1 (end of 4 hours, a third of the day); Magen Avraham 58:1; 16.1° as the equinox equivalent of 72 minutes in Jerusalem | down |
| `sofZmanTefillaMA72` | Sof zman Tefilla, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 89:1 (end of 4 hours, a third of the day); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | down |
| `sofZmanTefillaMA72Zmaniyos` | Sof zman Tefilla, Magen Avraham: the day from alos to tzeis, 72 proportional minutes (1.2 hours zmaniyos) | SA OC 89:1 (end of 4 hours, a third of the day); Magen Avraham 58:1; Pesachim 94a | down |
| `sofZmanTefillaMA90` | Sof zman Tefilla, Magen Avraham: the day from alos to tzeis, 90 fixed minutes | SA OC 89:1 (end of 4 hours, a third of the day); Magen Avraham 58:1; 4 mil of 22½ minutes (unverified) | down |
| `sofZmanTefillaMA90Zmaniyos` | Sof zman Tefilla, Magen Avraham: the day from alos to tzeis, 90 proportional minutes | SA OC 89:1 (end of 4 hours, a third of the day); Magen Avraham 58:1 (unverified for 90) | down |

## Chatzos

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `chatzos` | Chatzos: solar transit | Astronomical noon | down |
| `chatzosHalaila` | Chatzos HaLaila: the sun at its lowest | Astronomical midnight | down |
| `chatzosHalfDay` | Chatzos: midpoint of sunrise and sunset | SA OC 233:1 with proportional hours | down |

## Mincha and Plag

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `minchaGedola30` | Mincha Gedola 30 minutes after chatzos | SA OC 233:1; fixed half hour (unverified) | up |
| `minchaGedolaGra` | Mincha Gedola, Gra: the day from sunrise to sunset | SA OC 233:1 (6½ hours); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | up |
| `minchaGedolaGreaterOf` | Mincha Gedola: the later of 30 minutes and half a proportional hour after chatzos | SA OC 233:1; Mishna Berura 233:1 (unverified) | up |
| `minchaGedolaMA72` | Mincha Gedola, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 233:1 (6½ hours); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | up |
| `minchaKetanaGra` | Mincha Ketana, Gra: the day from sunrise to sunset | SA OC 233:1 (9½ hours); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | up |
| `minchaKetanaMA72` | Mincha Ketana, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 233:1 (9½ hours); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | up |
| `plagHaminchaGra` | Plag HaMincha, Gra: the day from sunrise to sunset | SA OC 233:1 (11 hours less a quarter); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | up |
| `plagHaminchaMA72` | Plag HaMincha, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 233:1 (11 hours less a quarter); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | up |

## Bein HaShmashos

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `beinHashmashosGeonim` | Bein HaShmashos of the Geonim: ¾ mil after sunset | Mishna Berura 261:23 | up |
| `beinHashmashosRabbeinuTam` | Bein HaShmashos of Rabbeinu Tam: 3¼ mil after sunset | SA OC 261:2 | up |
| `beinHashmashosYereim` | Bein HaShmashos of the Yereim: ¾ mil before sunset | Sefer Yereim 274 (unverified) | down |

## Tzeis (nightfall)

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `tzeis16_1` | Tzeis at 16.1° | Equinox equivalent of 72 minutes in Jerusalem | up |
| `tzeis42` | Tzeis 42 minutes after sunset | (unverified) | up |
| `tzeis50` | Tzeis 50 minutes after sunset | (unverified) | up |
| `tzeis60` | Tzeis 60 minutes after sunset | (unverified) | up |
| `tzeis72` | Tzeis 72 minutes after sunset (Rabbeinu Tam) | SA OC 261:2 (3¼ + ¾ mil); SA OC 459:2 (a mil is 18 minutes) | up |
| `tzeis72Zmaniyos` | Tzeis 72 proportional minutes after sunset (Rabbeinu Tam) | SA OC 261:2; proportional minutes (unverified) | up |
| `tzeis7_083` | Tzeis at 7.083° | Three medium stars; Rav Y. M. Tukachinsky (unverified) | up |
| `tzeis8_5` | Tzeis at 8.5° | Three small stars (unverified) | up |

## Erev Pesach

| Function | Opinion | Source | Rounds |
|---|---|---|---|
| `sofZmanAchilasChametzGra` | Latest time to eat chametz, Gra: the day from sunrise to sunset | SA OC 443:1 (end of 4 hours; Rema: proportional); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | down |
| `sofZmanAchilasChametzMA72` | Latest time to eat chametz, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 443:1 (end of 4 hours; Rema: proportional); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | down |
| `sofZmanBiurChametzGra` | Latest time to burn chametz, Gra: the day from sunrise to sunset | SA OC 443:1 (end of 5 hours); Biur HaGra OC 459:2 (unverified); SA OC 233:1, Rema (proportional hours) | down |
| `sofZmanBiurChametzMA72` | Latest time to burn chametz, Magen Avraham: the day from alos to tzeis, 72 fixed minutes | SA OC 443:1 (end of 5 hours); Magen Avraham 58:1 (hours from alos); Pesachim 94a (4 mil); SA OC 459:2 (a mil is 18 minutes) | down |

## Customs in the calendar

- **Yahrzeit in Adar** (death in a common year, anniversary in a leap year): Rema OC 568:7 (Adar I, "and so is the
  custom"), Shulchan Aruch OC 568:7 (Adar II); Mishna Berura 568:42 on keeping both the first time.
- **30 Cheshvan / 30 Kislev**: Magen Avraham 568:20 (fixed by the first anniversary year), with the next-day and
  last-day customs available.
- **Bar mitzvah in Adar**: Rema OC 55:10 (Adar II for someone born in a common year); Levush vs Magen Avraham 55:10 for
  someone born in Adar I whose 13th year is a leap year.
- **Yom Kippur Katan when Erev Rosh Chodesh is Friday**: Friday (Magen Avraham 417) or Thursday (those who say Selichos).
- **Parsha in Israel after an eighth-day-of-Pesach Shabbos**: Mishna Berura 428:10 records more than one custom; Luach
  follows the one current calendars use.
