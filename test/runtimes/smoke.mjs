// Smoke test for Deno and Bun: `deno run test/runtimes/smoke.mjs` / `bun test/runtimes/smoke.mjs`.
// Uses the built ESM (dist/). Prints OK or throws.
import { HebrewDate, holidaysForYear, ZmanimCalendar, getPlace, dayInfo, toICalendar, readingCycle } from '../../dist/index.js';
const d = HebrewDate.fromGregorian(2026, 10, 21);
if (d.toString() !== '5787-8-10') throw new Error('conversion ' + d);
if (holidaysForYear(5787).length < 80) throw new Error('holidays');
if (readingCycle(5787).length < 50) throw new Error('parsha');
const z = new ZmanimCalendar(getPlace('jerusalem'), d);
// kosher-zmanim gives 06:46:35 IDT (sea level) for this day; rounded up: 06:47.
if (z.sunrise().localTime() !== '06:47') throw new Error('sunrise ' + z.sunrise().localTime());
JSON.stringify(dayInfo(d, { location: getPlace('sydney') }));
if (!toICalendar(d, d.addDays(30)).includes('BEGIN:VEVENT')) throw new Error('ics');
console.log('OK');
