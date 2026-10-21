# Zmanim

```ts
import { findCity, alos16_1, netz, sofZmanShemaGra, sofZmanShemaMA72, shkiah, tzeis8_5, shaahZmanis } from 'luach';

const loc = findCity('Jerusalem')!;          // or { latitude, longitude, elevation, timeZone: 'Asia/Jerusalem' }
const date = { year: 2027, month: 3, day: 14 };

const z = sofZmanShemaGra(date, loc);
z.time;     // Date (rounded down: it is a deadline)
z.opinion;  // "Sof zman Shema, Gra: the day from sunrise to sunset"
z.source;   // "SA OC 58:1 (end of 3 hours, a quarter of the day); …"
JSON.stringify(z); // { time, opinion, source, rounded }
```

Every opinion is its own function; see [Halachic notes](/halacha/opinions) for the list and sources. For angles or
minutes Luach doesn't name, use `alosAtDegrees(x)`, `misheyakirAtDegrees(x)`, `tzeisAtDegrees(x)` or
`tzeisAfterMinutes(x)`.

## Options

```ts
netz(date, loc, {
  rounding: 'none',          // 'default' | 'none' | 'up' | 'down'
  elevation: true,           // sunrise/sunset from the location's elevation (sea level by default)
  horizonDip: 0.4,           // or your own visible-horizon dip, in degrees
  highLatitude: 'solar-midnight', // opt-in fallback when an angle isn't reached (marked `fallback`)
});
```

## When there is no time

```ts
alos16_1({ year: 2026, month: 6, day: 21 }, findCity('London')!);
// { time: null, reason: 'sun-always-above', … } — the sun never gets 16.1° below the horizon in London in June.
```

## Showing local times

Use `toZoned(z.time.getTime(), loc.timeZone)`, or `Intl.DateTimeFormat` with `timeZone: loc.timeZone`.
`getDay()` does this for you and returns `local: "HH:MM"`.
