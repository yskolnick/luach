/**
 * Every zman Luach computes: its definition, whose opinion it is, the source, and how it
 * is rounded. This table is the single place where citations live; the docs are generated
 * from it. Citations are checked against the texts.
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

/**
 * When a zman falls, as data: a few operations on the sun, read by the calculator. Nothing here
 * is code. `rise` and `set` follow the calculator's `useElevation`; angles are always at sea
 * level; `noon` is the sun's transit and `midnight` the halfway point to the next one. A
 * `Moment` says how a time is computed; the entry's opinion and source say why.
 */
export type Moment =
  | { readonly sun: 'rise' | 'set' | 'rise-sea-level' | 'set-sea-level' | 'rise-elevation' | 'set-elevation' | 'noon' | 'midnight' }
  | { readonly angle: number; readonly rising: boolean }
  | { readonly offset: number | { readonly option: 'candleLightingMinutes' | 'ateretTorahMinutes'; readonly sign: 1 | -1 }; readonly from: Moment }
  | { readonly hours: number; readonly of: 'gra'; readonly from: Moment }
  | { readonly hour: number; readonly of: string }
  | { readonly later: readonly Moment[] }
  | { readonly none: 'requires-terrain-data' };

/** A halachic day: the span whose twelfth is a seasonal hour (shaah zmanis) for one opinion. */
export interface DayDefinition {
  readonly start: Moment;
  readonly end: Moment;
  /** Whose day, in words. */
  readonly opinion: string;
  /** Where it is found. */
  readonly source: string;
}

/**
 * The kind of time a zman is, for grouping and for choosing an opinion: every entry belongs to
 * one. `fast`, `havdala` and `candleLighting` entries are times the calendar decides when to use.
 */
export type Slot =
  | 'alos' | 'misheyakir' | 'sunrise' | 'shema' | 'tefilla' | 'chatzos' | 'minchaGedola' | 'minchaKetana'
  | 'plag' | 'sunset' | 'beinHashmashos' | 'tzeis' | 'chatzosHalayla'
  | 'candleLighting' | 'havdala' | 'chametzEat' | 'chametzBurn' | 'fast';

/** Metadata for one zman. */
export interface ZmanDefinition {
  /** The kind of time this is. */
  readonly slot: Slot;
  /** Whose opinion, and what the time is. */
  readonly opinion: string;
  /** Where it is found. */
  readonly source: string;
  /** Earliest times round up, deadlines round down. */
  readonly round: RoundingDirection;
  /** How the time is computed. Absent where another function supplies the time (fasts). */
  readonly at?: Moment;
  /** A time that exists on one day of the year only; on others it is `null` (`'not-applicable-today'`). */
  readonly onlyOn?: 'erev-pesach';
}

const up = 'up' as const;
const down = 'down' as const;

const R = { sun: 'rise' } as const;
const S = { sun: 'set' } as const;

/** The named halachic days that seasonal hours are counted in, by id. */
export const DAYS: Readonly<Record<string, DayDefinition>> = /*#__PURE__*/ deepFreeze({
  'gra': { start: R, end: S, opinion: 'Gra: a twelfth of sunrise to sunset', source: 'Shulchan Aruch OC 58:1' },
  'mga-72': { start: { offset: -72, from: R }, end: { offset: 72, from: S }, opinion: 'Magen Avraham: a twelfth of alos 72 to tzeis 72', source: 'Magen Avraham OC 58:1' },
  'mga-90': { start: { offset: -90, from: R }, end: { offset: 90, from: S }, opinion: 'Magen Avraham: a twelfth of alos 90 to tzeis 90', source: 'Magen Avraham OC 58:1' },
  'mga-72-zmaniyos': { start: { hours: -1.2, of: 'gra', from: R }, end: { hours: 1.2, of: 'gra', from: S }, opinion: 'Magen Avraham: alos to tzeis at 72 proportional minutes', source: 'Magen Avraham OC 58:1' },
  'mga-90-zmaniyos': { start: { hours: -1.5, of: 'gra', from: R }, end: { hours: 1.5, of: 'gra', from: S }, opinion: 'Magen Avraham: alos to tzeis at 90 proportional minutes', source: 'Magen Avraham OC 58:1' },
  'mga-16.1': { start: { angle: 16.1, rising: true }, end: { angle: 16.1, rising: false }, opinion: 'Magen Avraham: alos to tzeis at 16.1°', source: 'Magen Avraham OC 58:1' },
  'baal-hatanya': { start: { angle: 1.583, rising: true }, end: { angle: 1.583, rising: false }, opinion: 'Baal HaTanya: netz amiti to shkia amitis', source: 'Shulchan Aruch HaRav OC 58:3' },
  'ateret-torah': { start: { hours: -1.2, of: 'gra', from: R }, end: { offset: { option: 'ateretTorahMinutes', sign: 1 }, from: S }, opinion: 'Ateret Torah: alos 72 proportional minutes to tzeis 40 minutes', source: 'Ateret Torah luach' },
});

/** All zmanim by id. */
export const ZMANIM = /*#__PURE__*/ deepFreeze({
  // ---- Sun ----
  'sunrise': { slot: 'sunrise', opinion: 'Sunrise (netz hachama), at sea level unless the calculator\'s useElevation is on', source: 'Berachos 9b; Shulchan Aruch OC 58:1', round: up, at: R },
  'sunrise-sea-level': { slot: 'sunrise', opinion: 'Sunrise at sea level (upper limb at the horizon, standard refraction)', source: 'NOAA Solar Calculator; sea-level practice: R. Isser Zalman Meltzer, cited in Peninei Halakha, Tefilla 11:6 n. 7', round: up, at: { sun: 'rise-sea-level' } },
  'sunrise-elevation': { slot: 'sunrise', opinion: 'Sunrise adjusted for the observer\'s elevation (lower horizon, earlier)', source: 'Zmanim KeHilchasam (R. Bursztyn), ch. 2 §§7, 9: elevation for sunrise and sunset only (not verified: the book was not read)', round: up, at: { sun: 'rise-elevation' } },
  'sunrise-visible': { slot: 'sunrise', opinion: 'Visible sunrise over the actual terrain (netz hanireh)', source: 'Divrei Yosef; Maharil Diskin (cited in Peninei Halakha, Tefilla 11). Needs terrain data: not computed', round: up, at: { none: 'requires-terrain-data' } },
  'sunset': { slot: 'sunset', opinion: 'Sunset (shkiah), at sea level unless the calculator\'s useElevation is on', source: 'Shabbos 34b–35a; Shulchan Aruch OC 261:2', round: down, at: S },
  'sunset-sea-level': { slot: 'sunset', opinion: 'Sunset at sea level', source: 'NOAA Solar Calculator', round: down, at: { sun: 'set-sea-level' } },
  'sunset-elevation': { slot: 'sunset', opinion: 'Sunset adjusted for the observer\'s elevation (later)', source: 'Zmanim KeHilchasam (R. Bursztyn), ch. 2 §§7, 9 (not verified: the book was not read)', round: down, at: { sun: 'set-elevation' } },
  'chatzos': { slot: 'chatzos', opinion: 'Midday: the sun on the meridian (astronomical transit)', source: 'Magen Avraham OC 233:4', round: down, at: { sun: 'noon' } },
  'chatzos-halayla': { slot: 'chatzosHalayla', opinion: 'Midnight: halfway between one transit and the next', source: 'Berachos 3b; Mishna Berura 1:9 (midnight is twelve hours after midday)', round: down, at: { sun: 'midnight' } },

  // ---- Alos (the mil: 18 min, SA OC 459:2 / MB 459:15; 22.5 min, Biur Halacha 459:2; 24 min, Magen Avraham 89:2, SA HaRav 459:10) ----
  'alos-72': { slot: 'alos', opinion: 'Dawn 72 fixed minutes before sunrise (4 mil of 18 minutes)', source: 'Pesachim 94a; Shulchan Aruch OC 459:2; Magen Avraham 89:2', round: up, at: { offset: -72, from: R } },
  'alos-90': { slot: 'alos', opinion: 'Dawn 90 fixed minutes before sunrise (4 mil of 22.5 minutes)', source: 'Pesachim 94a; Biur Halacha 459:2', round: up, at: { offset: -90, from: R } },
  'alos-96': { slot: 'alos', opinion: 'Dawn 96 fixed minutes before sunrise (4 mil of 24 minutes)', source: 'Pesachim 94a; Magen Avraham 89:2; Shulchan Aruch HaRav 459:10', round: up, at: { offset: -96, from: R } },
  'alos-120': { slot: 'alos', opinion: 'Dawn 120 fixed minutes before sunrise (5 mil of 24 minutes; a stringency)', source: 'Pesachim 93b (Ulla: 5 mil, refuted on 94a); Magen Avraham 89:2 (5 mil reckoned as two hours, as a stringency)', round: up, at: { offset: -120, from: R } },
  'alos-72-zmaniyos': { slot: 'alos', opinion: 'Dawn 72 proportional minutes (1.2 seasonal hours of the Gra day) before sunrise', source: 'Rambam, Peirush HaMishnayos Berachos 1:1 (an hour and a fifth of seasonal hours); Pesachim 94a', round: up, at: { hours: -1.2, of: 'gra', from: R } },
  'alos-90-zmaniyos': { slot: 'alos', opinion: 'Dawn 90 proportional minutes (1.5 seasonal hours) before sunrise', source: 'Pesachim 94a; Biur Halacha 459:2', round: up, at: { hours: -1.5, of: 'gra', from: R } },
  'alos-96-zmaniyos': { slot: 'alos', opinion: 'Dawn 96 proportional minutes (1.6 seasonal hours) before sunrise', source: 'Pesachim 94a; Magen Avraham 89:2', round: up, at: { hours: -1.6, of: 'gra', from: R } },
  'alos-120-zmaniyos': { slot: 'alos', opinion: 'Dawn 120 proportional minutes (2 seasonal hours) before sunrise (a stringency)', source: 'Pesachim 93b (Ulla: 5 mil, refuted on 94a); Magen Avraham 89:2 (5 mil reckoned as two hours)', round: up, at: { hours: -2, of: 'gra', from: R } },
  'alos-16.1': { slot: 'alos', opinion: 'Dawn when the sun is 16.1° below the horizon: 72 minutes before sunrise in Jerusalem at the equinox', source: 'Yechave Daas 2:8 (cited in Peninei Halakha, Tefilla 11:2); 72 minutes per Pesachim 94a', round: up, at: { angle: 16.1, rising: true } },
  'alos-18': { slot: 'alos', opinion: 'Dawn at 18° (astronomical twilight)', source: 'Astronomical dawn (cited in Peninei Halakha, Tefilla 11)', round: up, at: { angle: 18, rising: true } },
  'alos-19.8': { slot: 'alos', opinion: 'Dawn at 19.8°: 90 minutes before sunrise in Jerusalem at the equinox', source: 'Computed: the sun\'s depression 90 minutes before sunrise in Jerusalem at the equinox; 90 minutes per Biur Halacha 459:2. Peninei Halakha, Tefilla 11:2 gives 19.75° and cautions against relying on such calendars', round: up, at: { angle: 19.8, rising: true } },
  'alos-26': { slot: 'alos', opinion: 'Dawn at 26°: about 120 minutes before sunrise in Jerusalem at the equinox (a stringency)', source: 'Computed: the sun\'s depression 120 minutes before sunrise in Jerusalem at the equinox; 120 minutes per Magen Avraham 89:2 (5 mil)', round: up, at: { angle: 26, rising: true } },
  'alos-baal-hatanya': { slot: 'alos', opinion: 'Dawn of the Baal HaTanya, 16.9° below the horizon', source: 'Shulchan Aruch HaRav OC 89:1; 16.9° as calculated in Chabad practice', round: up, at: { angle: 16.9, rising: true } },

  // ---- Misheyakir ----
  'misheyakir-10.2': { slot: 'misheyakir', opinion: 'Misheyakir at 10.2°', source: 'Berachos 9b; Shulchan Aruch OC 18:3; 10.2° as published in a luach that names no source; attributed elsewhere to Kovetz Otzros Yerushalayim (not verified)', round: up, at: { angle: 10.2, rising: true } },
  'misheyakir-11': { slot: 'misheyakir', opinion: 'Misheyakir at 11°', source: 'Berachos 9b; Shulchan Aruch OC 18:3; Peninei Halakha, Tefilla 11', round: up, at: { angle: 11, rising: true } },
  'misheyakir-11.5': { slot: 'misheyakir', opinion: 'Misheyakir at 11.5° (custom of Eretz Yisrael)', source: 'Berachos 9b; Shulchan Aruch OC 18:3; 11.5° as the custom of Eretz Yisrael per a published luach (secondary; not verified)', round: up, at: { angle: 11.5, rising: true } },
  'misheyakir-12.85': { slot: 'misheyakir', opinion: 'Misheyakir at 12.85°', source: 'Berachos 9b; Shulchan Aruch OC 18:3; 12.85° attributed to Birur Halacha (R. Zilber) OC 18 (not verified)', round: up, at: { angle: 12.85, rising: true } },

  // ---- Shema and Tefilla ----
  'sof-zman-shema-gra': { slot: 'shema', opinion: 'Latest Shema, Gra: 3 seasonal hours of a sunrise-to-sunset day', source: 'Shulchan Aruch OC 58:1; Mishna Berura 58:4', round: down, at: { hour: 3, of: 'gra' } },
  'sof-zman-shema-mga-72': { slot: 'shema', opinion: 'Latest Shema, Magen Avraham: 3 seasonal hours of a day from alos to tzeis, 72 fixed minutes', source: 'Magen Avraham OC 58:1, 233:3; Mishna Berura 58:4; 72 min = 4 mil × 18 min (Pesachim 94a; SA OC 459:2)', round: down, at: { hour: 3, of: 'mga-72' } },
  'sof-zman-shema-mga-90': { slot: 'shema', opinion: 'Latest Shema, Magen Avraham with 90 fixed minutes', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4; Biur Halacha 459:2', round: down, at: { hour: 3, of: 'mga-90' } },
  'sof-zman-shema-mga-72-zmaniyos': { slot: 'shema', opinion: 'Latest Shema, Magen Avraham with 72 proportional minutes', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4', round: down, at: { hour: 3, of: 'mga-72-zmaniyos' } },
  'sof-zman-shema-mga-90-zmaniyos': { slot: 'shema', opinion: 'Latest Shema, Magen Avraham with 90 proportional minutes', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4', round: down, at: { hour: 3, of: 'mga-90-zmaniyos' } },
  'sof-zman-shema-mga-16.1': { slot: 'shema', opinion: 'Latest Shema, Magen Avraham, day from alos to tzeis at 16.1°', source: 'Magen Avraham OC 58:1; Mishna Berura 58:4; 16.1° = Jerusalem equinox equivalent of 72 minutes (Peninei Halakha, Tefilla 11:2 n. 1)', round: down, at: { hour: 3, of: 'mga-16.1' } },
  'sof-zman-shema-baal-hatanya': { slot: 'shema', opinion: 'Latest Shema, Baal HaTanya: 3 seasonal hours of a day from netz amiti to shkia amitis (sun 1.583° below the horizon)', source: 'Shulchan Aruch HaRav OC 443:4; 1.583° as calculated in Chabad practice', round: down, at: { hour: 3, of: 'baal-hatanya' } },
  'sof-zman-shema-ateret-torah': { slot: 'shema', opinion: 'Latest Shema, Ateret Torah: day from alos (72 proportional minutes) to tzeis (40 minutes after sunset)', source: 'Ateret Torah practice (Chacham Yosef Harari-Raful); not verified against a printed source', round: down, at: { hour: 3, of: 'ateret-torah' } },
  'sof-zman-tefilla-gra': { slot: 'tefilla', opinion: 'Latest Shacharis, Gra: 4 seasonal hours of a sunrise-to-sunset day', source: 'Shulchan Aruch OC 89:1; Mishna Berura 58:4', round: down, at: { hour: 4, of: 'gra' } },
  'sof-zman-tefilla-mga-72': { slot: 'tefilla', opinion: 'Latest Shacharis, Magen Avraham, 72 fixed minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down, at: { hour: 4, of: 'mga-72' } },
  'sof-zman-tefilla-mga-90': { slot: 'tefilla', opinion: 'Latest Shacharis, Magen Avraham, 90 fixed minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down, at: { hour: 4, of: 'mga-90' } },
  'sof-zman-tefilla-mga-72-zmaniyos': { slot: 'tefilla', opinion: 'Latest Shacharis, Magen Avraham, 72 proportional minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down, at: { hour: 4, of: 'mga-72-zmaniyos' } },
  'sof-zman-tefilla-mga-90-zmaniyos': { slot: 'tefilla', opinion: 'Latest Shacharis, Magen Avraham, 90 proportional minutes', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down, at: { hour: 4, of: 'mga-90-zmaniyos' } },
  'sof-zman-tefilla-mga-16.1': { slot: 'tefilla', opinion: 'Latest Shacharis, Magen Avraham, 16.1°', source: 'Shulchan Aruch OC 89:1 (until the end of the fourth hour); the day from alos to tzeis: Magen Avraham OC 58:1, Mishna Berura 58:4', round: down, at: { hour: 4, of: 'mga-16.1' } },
  'sof-zman-tefilla-baal-hatanya': { slot: 'tefilla', opinion: 'Latest Shacharis, Baal HaTanya', source: 'Shulchan Aruch OC 89:1 (four hours); the day from netz to shkiah: Shulchan Aruch HaRav OC 443:4. (Shulchan Aruch HaRav OC 89:1 counts from alos instead.)', round: down, at: { hour: 4, of: 'baal-hatanya' } },
  'sof-zman-tefilla-ateret-torah': { slot: 'tefilla', opinion: 'Latest Shacharis, Ateret Torah', source: 'Ateret Torah practice (Chacham Yosef Harari-Raful); not verified against a printed source', round: down, at: { hour: 4, of: 'ateret-torah' } },

  // ---- Mincha ----
  'mincha-gedola-30': { slot: 'minchaGedola', opinion: 'Mincha Gedola: 30 fixed minutes after chatzos', source: 'Shulchan Aruch OC 233:1 (six and a half seasonal hours), which Mishna Berura 233:1 glosses as half an hour after chatzos; fixed clock minutes are a common practice (not verified as a ruling)', round: up, at: { offset: 30, from: { sun: 'noon' } } },
  'mincha-gedola-gra': { slot: 'minchaGedola', opinion: 'Mincha Gedola, Gra: 6.5 seasonal hours after sunrise', source: 'Shulchan Aruch OC 233:1; Mishna Berura 233:1–4', round: up, at: { hour: 6.5, of: 'gra' } },
  'mincha-gedola-greater': { slot: 'minchaGedola', opinion: 'Mincha Gedola: the later of 30 minutes after chatzos and 6.5 seasonal hours (Chabad practice)', source: 'Shulchan Aruch OC 233:1; Chabad practice', round: up, at: { later: [{ offset: 30, from: { sun: 'noon' } }, { hour: 6.5, of: 'gra' }] } },
  'mincha-gedola-mga-72': { slot: 'minchaGedola', opinion: 'Mincha Gedola, Magen Avraham (72 fixed minutes)', source: 'Shulchan Aruch OC 233:1; Magen Avraham 233:3', round: up, at: { hour: 6.5, of: 'mga-72' } },
  'mincha-gedola-baal-hatanya': { slot: 'minchaGedola', opinion: 'Mincha Gedola, Baal HaTanya', source: 'Shulchan Aruch HaRav OC 443:4 (day from netz to shkia)', round: up, at: { hour: 6.5, of: 'baal-hatanya' } },
  'mincha-ketana-gra': { slot: 'minchaKetana', opinion: 'Mincha Ketana, Gra: 9.5 seasonal hours', source: 'Shulchan Aruch OC 233:1; Mishna Berura 233:1–4', round: up, at: { hour: 9.5, of: 'gra' } },
  'mincha-ketana-mga-72': { slot: 'minchaKetana', opinion: 'Mincha Ketana, Magen Avraham (72 fixed minutes)', source: 'Shulchan Aruch OC 233:1; Magen Avraham 233:3', round: up, at: { hour: 9.5, of: 'mga-72' } },
  'mincha-ketana-baal-hatanya': { slot: 'minchaKetana', opinion: 'Mincha Ketana, Baal HaTanya', source: 'Shulchan Aruch HaRav OC 443:4', round: up, at: { hour: 9.5, of: 'baal-hatanya' } },
  'plag-hamincha-gra': { slot: 'plag', opinion: 'Plag HaMincha, Gra (and Levush): 1¼ seasonal hours before sunset, day from sunrise to sunset', source: 'Berachos 26a–26b; Shulchan Aruch OC 233:1; Magen Avraham 233:3', round: up, at: { hour: 10.75, of: 'gra' } },
  'plag-hamincha-mga-72': { slot: 'plag', opinion: 'Plag HaMincha, Magen Avraham (72 fixed minutes)', source: 'Terumas HaDeshen, cited in Magen Avraham 233:3; Mishna Berura 233:4, 261:25', round: up, at: { hour: 10.75, of: 'mga-72' } },
  'plag-hamincha-mga-16.1': { slot: 'plag', opinion: 'Plag HaMincha, Magen Avraham (16.1°)', source: 'Magen Avraham 233:3; Mishna Berura 233:4', round: up, at: { hour: 10.75, of: 'mga-16.1' } },
  'plag-hamincha-baal-hatanya': { slot: 'plag', opinion: 'Plag HaMincha, Baal HaTanya', source: 'Shulchan Aruch HaRav OC 443:4; as calculated in Chabad practice', round: up, at: { hour: 10.75, of: 'baal-hatanya' } },
  'plag-hamincha-levush': { slot: 'plag', opinion: 'Plag HaMincha, Levush: 1¼ hours before sunset as Biur Halacha reports it, computed here as the Gra\'s (seasonal hours, sunrise to sunset)', source: 'Levush OC 267, as reported in Biur Halacha 261:2 s.v. "להקדים"; Magen Avraham 233:3 reads the Levush as counting from tzeis', round: up, at: { hour: 10.75, of: 'gra' } },

  // ---- Bein hashmashos ----
  'bein-hashmashos-rabbeinu-tam': { slot: 'beinHashmashos', opinion: 'Start of bein hashmashos, Rabbeinu Tam: 3¼ mil (58.5 minutes) after sunset, lasting 13.5 minutes', source: 'Tosafos Shabbos 35a, Pesachim 94a; Shulchan Aruch OC 261:2', round: down, at: { offset: 58.5, from: S } },
  'bein-hashmashos-geonim-13.5': { slot: 'beinHashmashos', opinion: 'End of bein hashmashos, Geonim and Gra: ¾ mil of 18 minutes (13.5 minutes) after sunset', source: 'Biur Halacha 261:2; Mishna Berura 261:23; mil of 18 minutes: Shulchan Aruch OC 459:2', round: up, at: { offset: 13.5, from: S } },
  'bein-hashmashos-geonim-16.875': { slot: 'beinHashmashos', opinion: 'End of bein hashmashos, Geonim: ¾ mil of 22.5 minutes (16.875 minutes) after sunset', source: 'Biur Halacha 261:2; mil of 22.5 minutes: Biur Halacha 459:2', round: up, at: { offset: 16.875, from: S } },
  'bein-hashmashos-geonim-18': { slot: 'beinHashmashos', opinion: 'End of bein hashmashos, Geonim: ¾ mil of 24 minutes (18 minutes) after sunset', source: 'Biur Halacha 261:2; mil of 24 minutes: Shulchan Aruch HaRav 459:10', round: up, at: { offset: 18, from: S } },
  'bein-hashmashos-yereim-18': { slot: 'beinHashmashos', opinion: 'Start of bein hashmashos, Yereim: ¾ mil of 24 minutes (18 minutes) before sunset', source: 'Sefer Yereim 274 (Vilna ed.); Biur Halacha 261:2; Shulchan Aruch HaRav 261:5; mil of 24 minutes: Shulchan Aruch HaRav 459:10', round: down, at: { offset: -18, from: S } },
  'bein-hashmashos-yereim-16.875': { slot: 'beinHashmashos', opinion: 'Start of bein hashmashos, Yereim: ¾ mil of 22.5 minutes (16.875 minutes) before sunset', source: 'Sefer Yereim 274; Biur Halacha 261:2; mil of 22.5 minutes: Biur Halacha 459:2', round: down, at: { offset: -16.875, from: S } },
  'bein-hashmashos-yereim-13.5': { slot: 'beinHashmashos', opinion: 'Start of bein hashmashos, Yereim: ¾ mil of 18 minutes (13.5 minutes) before sunset', source: 'Sefer Yereim 274; Biur Halacha 261:2; mil of 18 minutes: Shulchan Aruch OC 459:2', round: down, at: { offset: -13.5, from: S } },

  // ---- Tzeis ----
  'tzeis-8.5': { slot: 'tzeis', opinion: 'Nightfall at 8.5° (three small stars)', source: 'Shulchan Aruch OC 293:2 (three small stars); 8.5° as calculated in Chabad practice; attribution to R. Tukaczinsky not verified', round: up, at: { angle: 8.5, rising: false } },
  'tzeis-7.083': { slot: 'tzeis', opinion: 'Nightfall at 7.083° (three medium stars, about 29 minutes after sunset in Jerusalem at the equinox)', source: 'Shulchan Aruch OC 562:1 (three medium stars); 7.083° attributed to Dr. Baruch Cohn (not verified: no primary source read)', round: up, at: { angle: 7.083, rising: false } },
  'tzeis-6.45': { slot: 'tzeis', opinion: 'Nightfall at 6.45° (three medium stars; custom in Israel)', source: 'Shulchan Aruch OC 562:1 (three medium stars); 6.45° as the custom of Eretz Yisrael per a published luach (secondary; not verified)', round: up, at: { angle: 6.45, rising: false } },
  'tzeis-42': { slot: 'tzeis', opinion: 'Nightfall 42 fixed minutes after sunset (a custom in the United States)', source: 'Custom; ¾ mil reckoning of the Geonim adapted to latitude (not verified against a printed source)', round: up, at: { offset: 42, from: S } },
  'tzeis-50': { slot: 'tzeis', opinion: 'Nightfall 50 fixed minutes after sunset', source: 'Igros Moshe OC 4:62 (not verified: cited from secondary sources; given for New York)', round: up, at: { offset: 50, from: S } },
  'tzeis-60': { slot: 'tzeis', opinion: 'Nightfall 60 fixed minutes after sunset', source: 'Custom (not verified against a printed source)', round: up, at: { offset: 60, from: S } },
  'tzeis-72': { slot: 'tzeis', opinion: 'Nightfall 72 fixed minutes after sunset (4 mil of 18 minutes)', source: 'Pesachim 94a; Tosafos Shabbos 35a; Shulchan Aruch OC 261:2', round: up, at: { offset: 72, from: S } },
  'tzeis-rabbeinu-tam': { slot: 'tzeis', opinion: 'Nightfall of Rabbeinu Tam: 72 fixed minutes after sunset', source: 'Tosafos Shabbos 35a, Pesachim 94a; Shulchan Aruch OC 261:2', round: up, at: { offset: 72, from: S } },
  'tzeis-baal-hatanya': { slot: 'tzeis', opinion: 'Nightfall of the Baal HaTanya, 6° below the horizon', source: 'Chabad practice; no primary source for 6° was found (not verified)', round: up, at: { angle: 6, rising: false } },
  'tzeis-ateret-torah': { slot: 'tzeis', opinion: 'Nightfall, Ateret Torah: a fixed number of minutes after sunset (default 40)', source: 'Ateret Torah practice (Chacham Yosef Harari-Raful); not verified against a printed source', round: up, at: { offset: { option: 'ateretTorahMinutes', sign: 1 }, from: S } },

  // ---- Shabbos, Yom Tov, Pesach, fasts ----
  'candle-lighting': { slot: 'candleLighting', opinion: 'Candle lighting a fixed number of minutes before sunset, by local custom (18 common; Jerusalem 40)', source: 'Shulchan Aruch OC 261:2 (tosefes Shabbos); the minutes are local custom: Kaf HaChaim 261:23 (a third of an hour); Igros Moshe OC 2:6 and Yabia Omer 5:21 as cited by the OU (not verified)', round: down, at: { offset: { option: 'candleLightingMinutes', sign: -1 }, from: S } },
  'havdala': { slot: 'havdala', opinion: 'End of Shabbos or Yom Tov: three small stars (by degrees) or a fixed number of minutes', source: 'Shulchan Aruch OC 293:2', round: up, at: { angle: 8.5, rising: false } },
  'shabbos-ends-no-havdala': { slot: 'havdala', opinion: 'Shabbos ends (three small stars) before Tisha B\'Av postponed to Sunday: no havdala over a cup tonight; say "Baruch HaMavdil bein kodesh lechol" before melacha', source: 'Shulchan Aruch OC 556:1; Mishnah Berurah 556:2; Shulchan Aruch OC 299:10; Shulchan Aruch OC 293:2', round: up },
  'havdala-after-fast': { slot: 'havdala', opinion: 'Havdala over a cup, without candle or spices, when Tisha B\'Av postponed from Shabbos ends', source: 'Shulchan Aruch OC 556:1', round: up },
  'candle-lighting-second-night': { slot: 'candleLighting', opinion: 'Candles on the second night of Yom Tov, or Yom Tov after Shabbos: after nightfall', source: 'Shulchan Aruch OC 503:1 (no preparing from one day of Yom Tov for the next); lighting after nightfall follows from it and is not stated there', round: up, at: { angle: 8.5, rising: false } },
  'sof-zman-achilas-chametz-gra': { slot: 'chametzEat', opinion: 'Latest time to eat chametz on Erev Pesach, Gra: 4 seasonal hours', source: 'Pesachim 11b; Shulchan Aruch OC 443:1', round: down, at: { hour: 4, of: 'gra' }, onlyOn: 'erev-pesach' },
  'sof-zman-achilas-chametz-mga-72': { slot: 'chametzEat', opinion: 'Latest time to eat chametz, Magen Avraham (72 minutes)', source: 'Pesachim 11b; Shulchan Aruch OC 443:1 with Rema', round: down, at: { hour: 4, of: 'mga-72' }, onlyOn: 'erev-pesach' },
  'sof-zman-biur-chametz-gra': { slot: 'chametzBurn', opinion: 'Latest time to burn chametz on Erev Pesach, Gra: 5 seasonal hours', source: 'Pesachim 11b; Shulchan Aruch OC 443:1', round: down, at: { hour: 5, of: 'gra' }, onlyOn: 'erev-pesach' },
  'sof-zman-biur-chametz-mga-72': { slot: 'chametzBurn', opinion: 'Latest time to burn chametz, Magen Avraham (72 minutes)', source: 'Pesachim 11b; Shulchan Aruch OC 443:1 with Rema', round: down, at: { hour: 5, of: 'mga-72' }, onlyOn: 'erev-pesach' },
  'fast-begins': { slot: 'fast', opinion: 'A minor fast begins at dawn', source: 'Shulchan Aruch OC 564:1', round: down },
  'fast-begins-sunset': { slot: 'fast', opinion: 'Yom Kippur and Tisha B\'Av begin at sunset the evening before (from bein hashmashos)', source: 'Shulchan Aruch OC 553:2, 608:1', round: down },
  'fast-ends': { slot: 'fast', opinion: 'A fast ends at nightfall (three medium stars)', source: 'Shulchan Aruch OC 562:1', round: up },
} as const satisfies Record<string, ZmanDefinition>);

/** The id of a zman in {@link ZMANIM}. */
export type ZmanId = keyof typeof ZMANIM;

/** The ids of the zmanim in one slot. */
export type ZmanIdIn<S extends Slot> = { [K in ZmanId]: (typeof ZMANIM)[K]['slot'] extends S ? K : never }[ZmanId];

/** The definition of a zman by id, or undefined for an unknown id. */
export function zmanDefinition(id: string): ZmanDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(ZMANIM, id) ? (ZMANIM as Record<string, ZmanDefinition>)[id] : undefined;
}

/** A short display label for a zman id (locale key `zman.<id>`), e.g. "סוף זמן קריאת שמע (גר״א)". */
export function zmanLabel(id: string, locale: Locale = he): string {
  return lookupIn(locale, `zman.${id}`, NAMES);
}
