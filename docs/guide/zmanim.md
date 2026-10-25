# Zmanim

```ts
import { ZmanimCalendar, getPlace } from 'luach';

const z = new ZmanimCalendar(getPlace('lakewood'), { year: 2027, month: 3, day: 14 });
const shema = z.sofZmanShemaGra();
shema.localTime();   // "10:08"
shema.opinion;       // "Latest Shema, Gra: 3 seasonal hours of a sunrise-to-sunset day"
shema.source;        // "Shulchan Aruch OC 58:1; Mishna Berura 58:4"
shema.rounded;       // "down"
```

There is one named method per opinion — see the [full table with sources](../halacha/zmanim.md).
Every method returns a `Zman`: `{ id, time, opinion, source, rounded, reason?, fallback? }`
and `toJSON()`.

## Rounding

Displayed times are rounded to the minute, **earliest times up and deadlines down**, so a
rounded time is never less strict than the exact one. `new ZmanimCalendar(place, date, { rounding: false })`
gives exact times.

## When the sun does not reach the angle

In London in June the sun never gets 16.1° below the horizon. Then `time` is `null` and
`reason` is `"sun-always-above"`; zmanim that depend on it get `"depends-on-missing-zman"`.
Luach never makes a time up. Optional fallbacks (`highLatitudeFallback: 'nearestDay' | 'halfNight'`)
are off by default and marked in `fallback` when used. They apply only when the sun does not
get low enough (`"sun-always-above"`, summer nights). In polar night, when the sun never rises
high enough (`"sun-always-below"`), there is no dawn or nightfall to stand in for, so the time
stays `null` with that reason even with a fallback on.

## Elevation

`sunrise()` and `sunset()` are at sea level by default, as most luchos are; zmanim defined by
degrees are always at sea level, because the depression angle of the sun is the same for
everyone in the area. `useElevation: true` uses elevation-adjusted sunrise and sunset (and
the Gra day built on them); `sunriseElevation()` is always available.

## Checked inputs

Bad numbers throw a `RangeError` rather than produce an invalid time: a civil date that does
not exist (2026-02-30, month 13, a fractional year), a non-finite elevation, and for
`havdala()`, `candleLightingSecondNight()` and the `ends` of `isMelachaForbiddenAt` an angle
that is not more than 0.833° (sunset) and at most 30° below the horizon, or minutes that are
not more than 0 and at most 180 after sunset. Candle-lighting minutes must be 0–180; Ateret
Torah minutes more than 0 and at most 180 (`DEPRESSION_RANGE`, `MINUTES_RANGE`). A missing
time zone is a `TypeError`.

## Time zones

Pass an IANA zone ("America/New_York"). Luach reads offsets from the platform's `Intl`
(the IANA database) and never derives a "standard offset" itself, so places near the date
line get their own day's times. Where `Intl` lacks time zones, pass a `TimeZoneProvider`
such as `fixedOffsetZone(-300)`.

Offsets keep their seconds: before standard time, places kept local mean time (Jerusalem
was +2:20:40 in the runtime's data until 1918), so `offsetMinutes` can be a fraction and
rounded zmanim are rounded to whole minutes of that local clock.

## More

- `hebrewDateAt(instant, place)`: the Hebrew date now, by sunset (or a chosen tzeis).
- `fastTimes(date, place)`: when a fast begins and ends, by opinion.
- `isMelachaForbiddenAt(instant, place)`: Shabbos/Yom Tov by candle lighting and havdala.
