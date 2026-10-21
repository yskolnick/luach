/**
 * Runs in Hermes (React Native's engine) and in Node; scripts/hermes-test.mjs compares the
 * two outputs. The Hermes command-line VM has no Intl, so time zones use a fixed-offset
 * provider, exactly as an app on an engine without Intl time zones would.
 */
import {
  HebrewDate, Month, holidaysForYear, readingCycle, dafYomi, mishnaYomis, rambamThreeChapters, nachYomi,
  ZmanimCalendar, fixedOffsetZone, gematriya, formatHebrewDate, ashkenazi, haftaraFor, searchPlaces, omerText,
  parseGematriya, holidayName, parshaName, anniversary, talUmatarStart, isInIsrael,
} from '../../src/index';

declare const print: ((s: string) => void) | undefined;
const out: unknown[] = [];

for (let d = -20000; d <= 40000; d += 997) {
  const h = HebrewDate.fromEpochDays(d);
  out.push([h.year, h.month, h.day, h.dayOfWeek, formatHebrewDate(h), formatHebrewDate(h, { locale: ashkenazi, form: 'full' })]);
}
for (const y of [5786, 5787, 5790]) {
  out.push(holidaysForYear(y, { israel: y % 2 === 0, modernIsraeli: true }).map((e) => [e.id, e.date.toString(), holidayName(e, ashkenazi)]));
  out.push(readingCycle(y).map((r) => [r.date.toString(), parshaName(r.parsha, ashkenazi)]));
}
const day = HebrewDate.fromGregorian(2026, 10, 21);
out.push(dafYomi(day), mishnaYomis(day), rambamThreeChapters(day), nachYomi(day), haftaraFor(day.onOrAfter(6)));
const z = new ZmanimCalendar({ latitude: 31.778, longitude: 35.2354, elevation: 754, timeZone: fixedOffsetZone(180, 'IDT') }, { year: 2026, month: 10, day: 21 });
out.push([z.alos16Point1(), z.sunrise(), z.sofZmanShemaGra(), z.sofZmanShemaMga72(), z.chatzos(), z.plagHaminchaGra(), z.sunset(), z.tzeis8Point5()].map((x) => x.toJSON()));
out.push(gematriya(5787), parseGematriya('ה׳תשפ״ז'), omerText(33), searchPlaces('Bene Beraq').map((p) => p.id));
out.push(anniversary({ year: 5784, month: Month.ADAR_II, day: 7 }, 5786, { kind: 'yahrzeit' }).toString(), talUmatarStart(5787).eveningOf, isInIsrael(31.77, 35.21));

const text = JSON.stringify(out);
if (typeof print === 'function') print(text);
else console.log(text);
