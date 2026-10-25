/**
 * Every zman Luach computes: its definition, whose opinion it is, the source, and how it
 * is rounded. This table is the single place where citations live; the docs are generated
 * from it. Citations are checked against the texts (docs/research/2026-10-21-zmanim-opinions.md).
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @packageDocumentation
 */

import { deepFreeze } from '../util/freeze.js';
import type { RoundingDirection } from './zman.js';
import { lookupIn, type Locale } from '../locales/types.js';
import { NAMES } from './labels-data.js';
import { he } from '../locales/he.js';

/** Metadata for one zman. */
export interface ZmanDefinition {
  /** Whose opinion, and what the time is. */
  readonly opinion: string;
  /** Where it is found. */
  readonly source: string;
  /** Earliest times round up, deadlines round down. */
  readonly round: RoundingDirection;
}

const up = 'up' as const;
const down = 'down' as const;

/** All zmanim by id. */
export const ZMANIM: Readonly<Record<string, ZmanDefinition>> = /*#__PURE__*/ deepFreeze({
  // ---- Sun ----
  'sunrise': { opinion: 'Sunrise (netz hachama), at sea level unless the calculator\'s useElevation is on', source: 'Berachos 9b; Shulchan Aruch OC 58:1', round: up },
  'sunrise-sea-level': { opinion: 'Sunrise at sea level (upper limb at the horizon, standard refraction)', source: 'NOAA Solar Calculator; sea-level practice: R. Isser Zalman Meltzer, cited in Peninei Halakha, Tefilla 11:6 n. 7', round: up },
  'sunrise-elevation': { opinion: 'Sunrise adjusted for the observer\'s elevation (lower horizon, earlier)', source: 'Zmanim KeHilchasam (R. Bursztyn), ch. 2 §§7, 9: elevation for sunrise and sunset only (not verified: the book was not read)', round: up },
  'sunrise-visible': { opinion: 'Visible sunrise over the actual terrain (netz hanireh)', source: 'Divrei Yosef; Maharil Diskin (cited in Peninei Halakha, Tefilla 11). Needs terrain data: not computed', round: up },
  'sunset': { opinion: 'Sunset (shkiah), at sea level unless the calculator\'s useElevation is on', source: 'Shabbos 34b–35a; Shulchan Aruch OC 261:2', round: down },
  'sunset-sea-level': { opinion: 'Sunset at sea level', source: 'NOAA Solar Calculator', round: down },
  'sunset-elevation': { opinion: 'Sunset adjusted for the observer\'s elevation (later)', source: 'Zmanim KeHilchasam (R. Bursztyn), ch. 2 §§7, 9 (not verified: the book was not read)', round: down },
  'chatzos': { opinion: 'Midday: the sun on the meridian (astronomical transit)', source: 'Magen Avraham OC 233:4', round: down },
  'chatzos-halayla': { opinion: 'Midnight: halfway between one transit and the next', source: 'Berachos 3b; Mishna Berura 1:9 (midnight is twelve hours after midday)', round: down },

  // ---- Alos (the mil: 18 min, SA OC 459:2 / MB 459:15; 22.5 min, Biur Halacha 459:2; 24 min, Magen Avraham 89:2, SA HaRav 459:10) ----
  'alos-72': { opinion: 'Dawn 72 fixed minutes before sunrise (4 mil of 18 minutes)', source: 'Pesachim 94a; Shulchan Aruch OC 459:2; Magen Avraham 89:2', round: up },
  'alos-90': { opinion: 'Dawn 90 fixed minutes before sunrise (4 mil of 22.5 minutes)', source: 'Pesachim 94a; Biur Halacha 459:2', round: up },
  'alos-96': { opinion: 'Dawn 96 fixed minutes before sunrise (4 mil of 24 minutes)', source: 'Pesachim 94a; Magen Avraham 89:2; Shulchan Aruch HaRav 459:10', round: up },
  'alos-120': { opinion: 'Dawn 120 fixed minutes before sunrise (5 mil of 24 minutes; a stringency)', source: 'Pesachim 93b (Ulla: 5 mil, refuted on 94a); Magen Avraham 89:2 (5 mil reckoned as two hours, as a stringency)', round: up },
  'alos-72-zmaniyos': { opinion: 'Dawn 72 proportional minutes (1.2 seasonal hours of the Gra day) before sunrise', source: 'Rambam, Peirush HaMishnayos Berachos 1:1 (an hour and a fifth of seasonal hours); Pesachim 94a', round: up },
  'alos-90-zmaniyos': { opinion: 'Dawn 90 proportional minutes (1.5 seasonal hours) before sunrise', source: 'Pesachim 94a; Biur Halacha 459:2', round: up },
  'alos-96-zmaniyos': { opinion: 'Dawn 96 proportional minutes (1.6 seasonal hours) before sunrise', source: 'Pesachim 94a; Magen Avraham 89:2', round: up },
  'alos-120-zmaniyos': { opinion: 'Dawn 120 proportional minutes (2 seasonal hours) before sunrise (a stringency)', source: 'Pesachim 93b (Ulla: 5 mil, refuted on 94a); Magen Avraham 89:2 (5 mil reckoned as two hours)', round: up },
  'alos-16.1': { opinion: 'Dawn when the sun is 16.1° below the horizon: 72 minutes before sunrise in Jerusalem at the equinox', source: 'Yechave Daas 2:8 (cited in Peninei Halakha, Tefilla 11:2); 72 minutes per Pesachim 94a', round: up },
  'alos-18': { opinion: 'Dawn at 18° (astronomical twilight)', source: 'Astronomical dawn (cited in Peninei Halakha, Tefilla 11)', round: up },
  'alos-19.8': { opinion: 'Dawn at 19.8°: 90 minutes before sunrise in Jerusalem at the equinox', source: 'Computed: the sun\'s depression 90 minutes before sunrise in Jerusalem at the equinox; 90 minutes per Biur Halacha 459:2. Peninei Halakha, Tefilla 11:2 gives 19.75° and cautions against relying on such calendars', round: up },
  'alos-26': { opinion: 'Dawn at 26°: about 120 minutes before sunrise in Jerusalem at the equinox (a stringency)', source: 'Computed: the sun\'s depression 120 minutes before sunrise in Jerusalem at the equinox; 120 minutes per Magen Avraham 89:2 (5 mil)', round: up },
  'alos-baal-hatanya': { opinion: 'Dawn of the Baal HaTanya, 16.9° below the horizon', source: 'Shulchan Aruch HaRav OC 89:1; 16.9° as calculated in Chabad practice', round: up },

  // ---- Misheyakir ----
  'misheyakir-10.2': { opinion: 'Misheyakir at 10.2°', source: 'Berachos 9b; Shulchan Aruch OC 18:3; 10.2° as published in a luach that names no source; attributed elsewhere to Kovetz Otzros Yerushalayim (not verified)', round: up },
  'misheyakir-11': { opinion: 'Misheyakir at 11°', source: 'Berachos 9b; Shulchan Aruch OC 18:3; Peninei Halakha, Tefilla 11', round: up },
  'misheyakir-11.5': { opinion: 'Misheyakir at 11.5° (custom of Eretz Yisrael)', source: 'Berachos 9b; Shulchan Aruch OC 18:3; 11.5° as the custom of Eretz Yisrael per a published luach (secondary; not verified)', round: up },
  'misheyakir-12.85': { opinion: 'Misheyakir at 12.85°', source: 'Berachos 9b; Shulchan Aruch OC 18:3; 12.85° attributed to Birur Halacha (R. Zilber) OC 18 (not verified)', round: up },

  // ---- Shema and Tefilla ----
  'sof-zman-shema-gra': { opinion: 'Latest Shema, Gra: 3 seasonal hours of a sunrise-to-sunset day', source: 'Shulchan Aruch OC 58:1; Mishna Berura 58:4', round: down },
  'sof-zman-shema-mga-72': { opinion: 'Latest Shema, Magen Avraham: 3 seasonal hours of a day from alos to tzeis, 72 fixed minutes', source: 'Magen Avraham OC 58:1, 233:3; Mishna Berura 58:4; 72 min = 4 mil × 18 min (Pesachim 94a; SA OC 459:2)', round: down },
  'sof-zman-shema-mga-90': { opinion: 'Latest Shema, Magen Avraham with 90 fixed minutes', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4; Biur Halacha 459:2', round: down },
  'sof-zman-shema-mga-72-zmaniyos': { opinion: 'Latest Shema, Magen Avraham with 72 proportional minutes', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4', round: down },
  'sof-zman-shema-mga-90-zmaniyos': { opinion: 'Latest Shema, Magen Avraham with 90 proportional minutes', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4', round: down },
  'sof-zman-shema-mga-16.1': { opinion: 'Latest Shema, Magen Avraham, day from alos to tzeis at 16.1°', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4; 16.1° = Jerusalem equinox equivalent of 72 minutes (Peninei Halakha, Tefilla 11:2 n. 1)', round: down },
  'sof-zman-shema-baal-hatanya': { opinion: 'Latest Shema, Baal HaTanya: 3 seasonal hours of a day from netz amiti to shkia amitis (sun 1.583° below the horizon)', source: 'Shulchan Aruch HaRav OC 443:4; 1.583° as calculated in Chabad practice', round: down },
  'sof-zman-shema-ateret-torah': { opinion: 'Latest Shema, Ateret Torah: day from alos (72 proportional minutes) to tzeis (40 minutes after sunset)', source: 'Ateret Torah luach (Chacham Yosef Harari-Raful); not verified against a printed source', round: down },
  'sof-zman-tefilla-gra': { opinion: 'Latest Shacharis, Gra: 4 seasonal hours of a sunrise-to-sunset day', source: 'Shulchan Aruch OC 89:1; Mishna Berura 58:4', round: down },
  'sof-zman-tefilla-mga-72': { opinion: 'Latest Shacharis, Magen Avraham, 72 fixed minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down },
  'sof-zman-tefilla-mga-90': { opinion: 'Latest Shacharis, Magen Avraham, 90 fixed minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down },
  'sof-zman-tefilla-mga-72-zmaniyos': { opinion: 'Latest Shacharis, Magen Avraham, 72 proportional minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down },
  'sof-zman-tefilla-mga-90-zmaniyos': { opinion: 'Latest Shacharis, Magen Avraham, 90 proportional minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down },
  'sof-zman-tefilla-mga-16.1': { opinion: 'Latest Shacharis, Magen Avraham, 16.1°', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down },
  'sof-zman-tefilla-baal-hatanya': { opinion: 'Latest Shacharis, Baal HaTanya', source: 'Shulchan Aruch OC 89:1 (four hours); the day from netz to shkiah: Shulchan Aruch HaRav OC 443:4. (Shulchan Aruch HaRav OC 89:1 counts from alos instead.)', round: down },
  'sof-zman-tefilla-ateret-torah': { opinion: 'Latest Shacharis, Ateret Torah', source: 'Ateret Torah luach (Chacham Yosef Harari-Raful); not verified against a printed source', round: down },

  // ---- Mincha ----
  'mincha-gedola-30': { opinion: 'Mincha Gedola: 30 fixed minutes after chatzos', source: 'Shulchan Aruch OC 233:1 (six and a half seasonal hours), which Mishna Berura 233:1 glosses as half an hour after chatzos; fixed clock minutes are a common practice (not verified as a ruling)', round: up },
  'mincha-gedola-gra': { opinion: 'Mincha Gedola, Gra: 6.5 seasonal hours after sunrise', source: 'Shulchan Aruch OC 233:1; Mishna Berura 233:1–4', round: up },
  'mincha-gedola-greater': { opinion: 'Mincha Gedola: the later of 30 minutes after chatzos and 6.5 seasonal hours (Chabad practice)', source: 'Shulchan Aruch OC 233:1; Chabad practice', round: up },
  'mincha-gedola-mga-72': { opinion: 'Mincha Gedola, Magen Avraham (72 fixed minutes)', source: 'Shulchan Aruch OC 233:1; Magen Avraham 233:3', round: up },
  'mincha-gedola-baal-hatanya': { opinion: 'Mincha Gedola, Baal HaTanya', source: 'Shulchan Aruch HaRav OC 443:4 (day from netz to shkia)', round: up },
  'mincha-ketana-gra': { opinion: 'Mincha Ketana, Gra: 9.5 seasonal hours', source: 'Shulchan Aruch OC 233:1; Mishna Berura 233:1–4', round: up },
  'mincha-ketana-mga-72': { opinion: 'Mincha Ketana, Magen Avraham (72 fixed minutes)', source: 'Shulchan Aruch OC 233:1; Magen Avraham 233:3', round: up },
  'mincha-ketana-baal-hatanya': { opinion: 'Mincha Ketana, Baal HaTanya', source: 'Shulchan Aruch HaRav OC 443:4', round: up },
  'plag-hamincha-gra': { opinion: 'Plag HaMincha, Gra (and Levush): 1¼ seasonal hours before sunset, day from sunrise to sunset', source: 'Berachos 26a–26b; Shulchan Aruch OC 233:1; Magen Avraham 233:3', round: up },
  'plag-hamincha-mga-72': { opinion: 'Plag HaMincha, Magen Avraham (72 fixed minutes)', source: 'Terumas HaDeshen, cited in Magen Avraham 233:3; Mishna Berura 233:4, 261:25', round: up },
  'plag-hamincha-mga-16.1': { opinion: 'Plag HaMincha, Magen Avraham (16.1°)', source: 'Magen Avraham 233:3; Mishna Berura 233:4', round: up },
  'plag-hamincha-baal-hatanya': { opinion: 'Plag HaMincha, Baal HaTanya', source: 'Shulchan Aruch HaRav OC 443:4; as calculated in Chabad practice', round: up },
  'plag-hamincha-levush': { opinion: 'Plag HaMincha, Levush: 1¼ hours before sunset as Biur Halacha reports it, computed here as the Gra\'s (seasonal hours, sunrise to sunset)', source: 'Levush OC 267, as reported in Biur Halacha 261:2 s.v. "להקדים"; Magen Avraham 233:3 reads the Levush as counting from tzeis', round: up },

  // ---- Bein hashmashos ----
  'bein-hashmashos-rabbeinu-tam': { opinion: 'Start of bein hashmashos, Rabbeinu Tam: 3¼ mil (58.5 minutes) after sunset, lasting 13.5 minutes', source: 'Tosafos Shabbos 35a, Pesachim 94a; Shulchan Aruch OC 261:2', round: down },
  'bein-hashmashos-geonim-13.5': { opinion: 'End of bein hashmashos, Geonim and Gra: ¾ mil of 18 minutes (13.5 minutes) after sunset', source: 'Biur Halacha 261:2; Mishna Berura 261:23; mil of 18 minutes: Shulchan Aruch OC 459:2', round: up },
  'bein-hashmashos-geonim-16.875': { opinion: 'End of bein hashmashos, Geonim: ¾ mil of 22.5 minutes (16.875 minutes) after sunset', source: 'Biur Halacha 261:2; mil of 22.5 minutes: Biur Halacha 459:2', round: up },
  'bein-hashmashos-geonim-18': { opinion: 'End of bein hashmashos, Geonim: ¾ mil of 24 minutes (18 minutes) after sunset', source: 'Biur Halacha 261:2; mil of 24 minutes: Shulchan Aruch HaRav 459:10', round: up },
  'bein-hashmashos-yereim-18': { opinion: 'Start of bein hashmashos, Yereim: ¾ mil of 24 minutes (18 minutes) before sunset', source: 'Sefer Yereim 274 (Vilna ed.); Biur Halacha 261:2; Shulchan Aruch HaRav 261:5; mil of 24 minutes: Shulchan Aruch HaRav 459:10', round: down },
  'bein-hashmashos-yereim-16.875': { opinion: 'Start of bein hashmashos, Yereim: ¾ mil of 22.5 minutes (16.875 minutes) before sunset', source: 'Sefer Yereim 274; Biur Halacha 261:2; mil of 22.5 minutes: Biur Halacha 459:2', round: down },
  'bein-hashmashos-yereim-13.5': { opinion: 'Start of bein hashmashos, Yereim: ¾ mil of 18 minutes (13.5 minutes) before sunset', source: 'Sefer Yereim 274; Biur Halacha 261:2; mil of 18 minutes: Shulchan Aruch OC 459:2', round: down },

  // ---- Tzeis ----
  'tzeis-8.5': { opinion: 'Nightfall at 8.5° (three small stars)', source: 'Shulchan Aruch OC 293:2 (three small stars); 8.5° as calculated in Chabad practice; attribution to R. Tukaczinsky not verified', round: up },
  'tzeis-7.083': { opinion: 'Nightfall at 7.083° (three medium stars, about 29 minutes after sunset in Jerusalem at the equinox)', source: 'Shulchan Aruch OC 562:1 (three medium stars); 7.083° attributed to Dr. Baruch Cohn (not verified: no primary source read)', round: up },
  'tzeis-6.45': { opinion: 'Nightfall at 6.45° (three medium stars; custom in Israel)', source: 'Shulchan Aruch OC 562:1 (three medium stars); 6.45° as the custom of Eretz Yisrael per a published luach (secondary; not verified)', round: up },
  'tzeis-42': { opinion: 'Nightfall 42 fixed minutes after sunset (a custom in the United States)', source: 'Custom; ¾ mil reckoning of the Geonim adapted to latitude (not verified against a printed source)', round: up },
  'tzeis-50': { opinion: 'Nightfall 50 fixed minutes after sunset', source: 'Igros Moshe OC 4:62 (not verified: cited from secondary sources; given for New York)', round: up },
  'tzeis-60': { opinion: 'Nightfall 60 fixed minutes after sunset', source: 'Custom (not verified against a printed source)', round: up },
  'tzeis-72': { opinion: 'Nightfall 72 fixed minutes after sunset (4 mil of 18 minutes)', source: 'Pesachim 94a; Tosafos Shabbos 35a; Shulchan Aruch OC 261:2', round: up },
  'tzeis-rabbeinu-tam': { opinion: 'Nightfall of Rabbeinu Tam: 72 fixed minutes after sunset', source: 'Tosafos Shabbos 35a, Pesachim 94a; Shulchan Aruch OC 261:2', round: up },
  'tzeis-baal-hatanya': { opinion: 'Nightfall of the Baal HaTanya, 6° below the horizon', source: 'Chabad practice; no primary source for 6° was found (not verified)', round: up },
  'tzeis-ateret-torah': { opinion: 'Nightfall, Ateret Torah: a fixed number of minutes after sunset (default 40)', source: 'Ateret Torah luach (Chacham Yosef Harari-Raful); not verified against a printed source', round: up },

  // ---- Shabbos, Yom Tov, Pesach, fasts ----
  'candle-lighting': { opinion: 'Candle lighting a fixed number of minutes before sunset, by local custom (18 common; Jerusalem 40)', source: 'Shulchan Aruch OC 261:2 (tosefes Shabbos); the minutes are local custom: Kaf HaChaim 261:23 (a third of an hour); Igros Moshe OC 2:6 and Yabia Omer 5:21 as cited by the OU (not verified)', round: down },
  'havdala': { opinion: 'End of Shabbos or Yom Tov: three small stars (by degrees) or a fixed number of minutes', source: 'Shulchan Aruch OC 293:2', round: up },
  'shabbos-ends-no-havdala': { opinion: 'Shabbos ends (three small stars) before Tisha B\'Av postponed to Sunday: no havdala over a cup tonight; say "Baruch HaMavdil bein kodesh lechol" before melacha', source: 'Shulchan Aruch OC 556:1; Mishnah Berurah 556:2; Shulchan Aruch OC 299:10; Shulchan Aruch OC 293:2', round: up },
  'havdala-after-fast': { opinion: 'Havdala over a cup, without candle or spices, when Tisha B\'Av postponed from Shabbos ends', source: 'Shulchan Aruch OC 556:1', round: up },
  'candle-lighting-second-night': { opinion: 'Candles on the second night of Yom Tov, or Yom Tov after Shabbos: after nightfall', source: 'Shulchan Aruch OC 503:1 (no preparing from one day of Yom Tov for the next); lighting after nightfall follows from it and is not stated there', round: up },
  'sof-zman-achilas-chametz-gra': { opinion: 'Latest time to eat chametz on Erev Pesach, Gra: 4 seasonal hours', source: 'Pesachim 11b; Shulchan Aruch OC 443:1', round: down },
  'sof-zman-achilas-chametz-mga-72': { opinion: 'Latest time to eat chametz, Magen Avraham (72 minutes)', source: 'Pesachim 11b; Shulchan Aruch OC 443:1 with Rema', round: down },
  'sof-zman-biur-chametz-gra': { opinion: 'Latest time to burn chametz on Erev Pesach, Gra: 5 seasonal hours', source: 'Pesachim 11b; Shulchan Aruch OC 443:1', round: down },
  'sof-zman-biur-chametz-mga-72': { opinion: 'Latest time to burn chametz, Magen Avraham (72 minutes)', source: 'Pesachim 11b; Shulchan Aruch OC 443:1 with Rema', round: down },
  'fast-begins': { opinion: 'A minor fast begins at dawn', source: 'Shulchan Aruch OC 564:1', round: down },
  'fast-begins-sunset': { opinion: 'Yom Kippur and Tisha B\'Av begin at sunset the evening before (from bein hashmashos)', source: 'Shulchan Aruch OC 553:2, 608:1', round: down },
  'fast-ends': { opinion: 'A fast ends at nightfall (three medium stars)', source: 'Shulchan Aruch OC 562:1', round: up },
});

/** A short display label for a zman id (locale key `zman.<id>`), e.g. "סוף זמן קריאת שמע (גר״א)". */
export function zmanLabel(id: string, locale: Locale = he): string {
  return lookupIn(locale, `zman.${id}`, NAMES);
}
