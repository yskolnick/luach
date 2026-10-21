# JSON, iCal and the command line

## One call per day

`dayInfo(date, options)` returns a plain JSON object with everything about the day: Hebrew
date, events, parsha and haftara, Omer, tefillah changes, learning, and (with a `location`)
zmanim, candle lighting, havdala and fast times. Its shape is described by a
[JSON Schema](https://github.com/yskolnick/luach/blob/main/docs/schema/day.schema.json).

## iCal

```ts
import { toICalendar, getPlace } from 'luach';
const ics = toICalendar({ year: 2026, month: 9, day: 1 }, { year: 2027, month: 8, day: 31 }, {
  location: getPlace('london'), learning: ['dafYomi'],
});
```

## Command line

```sh
npx luach today --city lakewood
npx luach zmanim 2027-03-14 --lat 40.08 --lon -74.21 --tz America/New_York --all
npx luach holidays 5787 --israel
npx luach convert "14 Adar II 5787"
npx luach ics 2026-09-01 2027-08-31 --city london > luach.ics
```

## Your own API

`examples/server/` in the repository: a few lines with Node's built-in `http` that serve
`/day` as JSON and `/calendar.ics`.
