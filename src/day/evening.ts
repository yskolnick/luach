/**
 * The candle-lighting and havdala rule for the evening that follows a Hebrew date's daytime,
 * in one place so every view of the calendar gives the same times.
 *
 * @packageDocumentation
 */

import { HebrewDate } from '../calendar/hebrew-date.js';
import { MAX_DAYS } from '../calendar/year.js';
import { holidaysOn } from '../holidays/holidays.js';
import type { HolidayOptions } from '../holidays/types.js';
import { israelFor } from '../places/israel.js';
import { fastTimes, zmanimFor, type ZmanimOptions } from '../zmanim/day.js';
import type { DayLocation } from '../zmanim/day-location.js';
import { zmanDefinition, type ZmanId } from '../zmanim/opinions.js';
import type { Zman } from '../zmanim/zman.js';
import type { ZmanimDay } from '../zmanim/zmanim.js';

/** The user's `from` opinion as the catalogue entry `id` (havdala at the user's tzeis, ...). */
function as(day: ZmanimDay, id: string, from: ZmanId): Zman {
  const def = zmanDefinition(id)!;
  return day.labelled(id, from, def.opinion, `${def.source}; time: ${day.get(from).opinion}`);
}

function holy(d: HebrewDate, opts: HolidayOptions): boolean {
  return d.isShabbos || holidaysOn(d, opts).some((e) => e.flags.melachaForbidden);
}

/**
 * The times of the evening that follows the daytime of `h`: the candles lit before it (or from
 * an existing flame after nightfall), the end of the day's holiness (havdala), and, when
 * havdala is deferred because Tisha B'Av is postponed to Sunday, when Shabbos ends. Each is
 * null when the evening has none. Israel or the diaspora: `options.israel` if given, otherwise
 * from the location. The place's documented candle-lighting custom applies when
 * `options.candleLightingMinutes` is not given.
 *
 * @internal
 */
export function eveningOf(h: HebrewDate, location: DayLocation, options: ZmanimOptions = {}): { candles: Zman | null; havdala: Zman | null; shabbosEnds: Zman | null } {
  const hopts: HolidayOptions = { ...options, israel: israelFor(options.israel, location) };
  const zopts = { ...options, ...hopts };
  const z = zmanimFor(location, zopts);
  const day = z.on(h);
  let candles: Zman | null = null;
  let havdala: Zman | null = null;
  let shabbosEnds: Zman | null = null;
  const today = holy(h, hopts);
  // After 29 Elul 9999 (the last supported day) comes Rosh Hashana 10000, always Yom Tov.
  const tomorrow = h.epochDays === MAX_DAYS || holy(h.next(), hopts);
  // Lighting after nightfall is only for a second holy night that is Yom Tov: from Shabbos
  // into Yom Tov, or from Yom Tov into Yom Tov (SA OC 503:1). Shabbos itself begins at sunset
  // (SA OC 261:2), so on a Yom Tov that falls on Friday the candles for Shabbos are lit at
  // the usual time before sunset.
  const beforeSunset = tomorrow && (!today || (h.epochDays < MAX_DAYS && h.next().isShabbos));
  // The place's documented custom applies when the caller has not chosen the minutes: Zmanim
  // takes it from the location.
  if (beforeSunset) candles = day.get('candle-lighting');
  else if (tomorrow && today) candles = as(day, 'candle-lighting-second-night', options.secondNightCandles ?? z.opinions.havdala);
  const ft = fastTimes(h, location, zopts);
  const next = h.epochDays < MAX_DAYS ? fastTimes(h.next(), location, zopts) : null;
  // Tisha B'Av postponed from Shabbos to Sunday: no havdala over a cup on Motzaei Shabbos;
  // it is said over a cup, without candle or spices, when the fast ends (SA OC 556:1).
  // Melacha after Shabbos needs "HaMavdil bein kodesh lechol" (MB 556:2; SA OC 299:10).
  const deferred = next?.fast.id === 'tisha-bav' && h.isShabbos;
  if (today && !tomorrow) {
    if (deferred) shabbosEnds = as(day, 'shabbos-ends-no-havdala', z.opinions.havdala);
    else havdala = as(day, 'havdala', z.opinions.havdala);
  }
  if (ft && ft.fast.id === 'tisha-bav' && h.prev().isShabbos) havdala = as(day, 'havdala-after-fast', z.opinions.fastEnds);
  return { candles, havdala, shabbosEnds };
}
