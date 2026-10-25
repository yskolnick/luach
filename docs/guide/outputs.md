# JSON, iCal and the command line

## One call per day

`dayInfo(date, options)` returns a plain JSON object with everything about the day: Hebrew
date, events, parsha and haftara, Omer, tefillah changes, learning, and (with a `location`)
zmanim, candle lighting, havdala and fast times. Its shape is described by a
[JSON Schema](https://raw.githubusercontent.com/yskolnick/luach/main/schema/day.schema.json),
which ships in the package as `luach/schema/day.schema.json`; each object's `$schema` is that
URL (`DAY_INFO_SCHEMA_ID`).

Candle lighting is the usual time before sunset when Shabbos or Yom Tov begins, including a
Yom Tov that falls on Friday (Shabbos begins at sunset, Shulchan Aruch OC 261:2); it is after
nightfall (`candle-lighting-second-night`) only when a Yom Tov night follows Shabbos or Yom
Tov (Shulchan Aruch OC 503:1). When Tisha B'Av falls on Shabbos and the fast is on Sunday,
the Shabbos has `havdala: null`, `shabbosEnds` (the end of Shabbos, when melacha is permitted
after saying "Baruch HaMavdil bein kodesh lechol"; Mishnah Berurah 556:2) and
`fastBeginsTonight` (sunset); the Sunday's `havdala` is over a cup when the fast ends
(`havdala-after-fast`, Shulchan Aruch OC 556:1). `fastBeginsTonight` is also set on the eve
of Yom Kippur and of Tisha B'Av.

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
