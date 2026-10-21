// Smoke test of the built CommonJS package: `node test/runtimes/smoke.cjs` (after `npm run build`).
// Loads dist/index.cjs directly and through the package's own "exports" (self-reference).
// Prints OK or throws.
/* eslint-disable @typescript-eslint/no-require-imports */
const L = require('../../dist/index.cjs');
const { HebrewDate, holidaysForYear, ZmanimCalendar, getPlace, dayInfo, toICalendar, readingCycle, DAY_INFO_SCHEMA_ID } = L;

const d = HebrewDate.fromGregorian(2026, 10, 21);
if (d.toString() !== '5787-8-10') throw new Error('conversion ' + d);
if (holidaysForYear(5787).length < 80) throw new Error('holidays');
if (readingCycle(5787).length < 50) throw new Error('parsha');
const z = new ZmanimCalendar(getPlace('jerusalem'), d);
// kosher-zmanim gives 06:46:35 IDT (sea level) for this day; rounded up: 06:47.
if (z.sunrise().localTime() !== '06:47') throw new Error('sunrise ' + z.sunrise().localTime());
const info = dayInfo(d, { location: getPlace('lakewood') });
if (!info.zmanim.length || info.$schema !== DAY_INFO_SCHEMA_ID) throw new Error('dayInfo');
if (!toICalendar(d, d.addDays(30)).includes('BEGIN:VEVENT')) throw new Error('ics');

// The package's "exports": main entry, places-full and the JSON Schema.
const self = require('luach');
if (self.HebrewDate.fromGregorian(2026, 10, 21).toString() !== '5787-8-10') throw new Error('require("luach")');
const full = require('luach/places-full');
if (!(full.fullPlaces().length > 1000)) throw new Error('require("luach/places-full")');
const schema = require('luach/schema/day.schema.json');
if (schema.$id !== DAY_INFO_SCHEMA_ID) throw new Error('schema $id ' + schema.$id);

console.log('OK (cjs, Node ' + process.versions.node + ')');
