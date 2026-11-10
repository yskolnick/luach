# Zmanim

```ts
import { Zmanim, getPlace } from 'luach';

// A place and the opinions its user follows. Anything left out uses a documented default.
const zmanim = new Zmanim(getPlace('lakewood')!, { shema: 'sof-zman-shema-mga-72', tzeis: 'tzeis-72' });

const day = zmanim.on({ year: 2027, month: 3, day: 14 }); // a civil date
const today = zmanim.at(new Date());                        // the day *at the place* now

const shema = day.slot('shema');   // the user's opinion for Shema
shema.localTime();                 // "09:32"  (a deadline, so rounded down)
shema.localTime({ exact: true });  // "09:32:16"
shema.opinion;                     // "Latest Shema, Magen Avraham: 3 seasonal hours …"
shema.source;                      // "Magen Avraham OC 58:1, 233:3; Mishna Berura 58:4; …"

day.get('sof-zman-shema-gra');     // any opinion, by id
day.slots();                       // the day's times in order, each by the user's opinion
day.slots('morning');              // 'morning' | 'afternoon' | 'evening'
```

Every opinion has an id, listed with its source in the
[table of zmanim](../halacha/zmanim.md). The [halachic choices](../halacha/choices.md) explain
the defaults; they are conveniences, not rulings.

## Opinions

The opinions are one plain object, so an app can store it and sync it as JSON. Each choice takes
an id of the right kind; TypeScript rejects `{ shema: 'tzeis-8.5' }`, and so does the
constructor at run time.

| Choice | Takes | Default |
|---|---|---|
| `alos`, `misheyakir`, `sunrise`, `shema`, `tefilla`, `chatzos`, `minchaGedola`, `minchaKetana`, `plag`, `sunset`, `tzeis` | that time of the day | `Zmanim.defaults` |
| `havdala` | a tzeis | `tzeis-8.5` |
| `fastBegins` | an alos | `alos-72` |
| `fastEnds` | a tzeis | `tzeis-7.083` |
| `dayBoundary` (when the Hebrew date changes) | sunset or a tzeis | `sunset` |

`Zmanim.choices('tzeis')` lists every id a user can pick for one choice, for a settings
screen. `zmanName(id, locale)` splits a name into the time and the opinion
(`{ slot: "Latest Shema", qualifier: "Gra" }`), for a heading and a label.

To read opinions back from storage, use `Zmanim.parseOpinions(json)`. It never throws: it
keeps what is valid, reports what is not, and reads the method names of Luach 0.1
(`"sofZmanShemaMga72"`).

Settings that are facts about the place or the user rather than opinions go in the third
argument: `candleLightingMinutes` (a local custom; default 18), `useElevation`,
`ateretTorahMinutes`, `highLatitudeFallback`, `algorithm`.

## Next, and a range

```ts
zmanim.next(new Date());                            // the next of the day's times, across midnight
zmanim.next(new Date(), ['shema', 'tefilla']);      // the next of these
zmanim.between(from, to, ['sunrise', 'sunset']);    // every one in a range, in time order
zmanim.hebrewDateAt(new Date());                    // the Hebrew date now, by dayBoundary
```

Candle lighting, havdala and fasts depend on the calendar as well as the sun; they come from
`dayInfo`, `fastTimes` and `isMelachaForbiddenAt` (below), which take the same opinions.

## How a time was calculated

```ts
shema.explain().text;
// "Sunrise at sea level: 07:10:11. 72 minutes before that: 05:58:11. Sunset at sea level:
//  19:02:33. 72 minutes after that: 20:14:33. 3 seasonal hours into the day from 05:58:11
//  to 20:14:33 (Magen Avraham: a twelfth of alos 72 to tzeis 72; an hour is 71.4 min
//  today): 09:32:16. Shown as 09:32: rounded down, because it is a deadline."
```

`explain().steps` gives the same steps as data (what each step did, its numbers and its exact
time), with the opinion and the source.

## Rounding

`time` is rounded to the minute on the safe side: **earliest times up, deadlines down**, so a
displayed time is never less strict than the exact one, and `time` can be shown by cutting off
the seconds. `exact` is the exact instant. `remaining(now)` counts down in whole minutes, never
generously: down to a deadline, up to an earliest time.

## When the sun does not reach the angle

In London in June the sun never gets 16.1° below the horizon. Then `time` is `null` and
`reason` is `"sun-always-above"`; zmanim that depend on it get `"depends-on-missing-zman"`.
Luach never makes a time up. Optional fallbacks (`highLatitudeFallback: 'nearestDay' | 'halfNight'`)
are off by default and marked in `fallback` when used. They apply only when the sun does not
get low enough (`"sun-always-above"`, summer nights). In polar night, when the sun never rises
high enough (`"sun-always-below"`), there is no dawn or nightfall to stand in for, so the time
stays `null` with that reason even with a fallback on.

## Elevation

Sunrise and sunset are at sea level by default, as most luchos are; zmanim defined by
degrees are always at sea level, because the depression angle of the sun is the same for
everyone in the area. `useElevation: true` uses elevation-adjusted sunrise and sunset (and the
Gra day built on them); `sunrise-elevation` and `sunset-elevation` are always available by id.

## Checked inputs

Mistakes in code throw a `RangeError` rather than produce an invalid time: an opinion of the
wrong kind or an unknown id, a civil date that does not exist (2026-02-30, month 13, a
fractional year), a non-finite elevation, candle-lighting minutes outside 0–180, Ateret Torah
minutes outside more than 0 and at most 180. A missing time zone is a `TypeError`. Once a
`Zmanim` exists, asking it for a time never throws.

## Time zones

Pass an IANA zone ("America/New_York"). Luach reads offsets from the platform's `Intl`
(the IANA database) and never derives a "standard offset" itself, so places near the date
line get their own day's times. Where `Intl` lacks time zones, pass a `TimeZoneProvider`
such as `fixedOffsetZone(-300)`.

Offsets keep their seconds: before standard time, places kept local mean time (Jerusalem
was +2:20:40 in the runtime's data until 1918), so `offsetMinutes` can be a fraction and
rounded zmanim are rounded to whole minutes of that local clock.

## More

These take the same `opinions` and settings as `Zmanim`:

- `hebrewDateAt(instant, place, { opinions })`: the Hebrew date now, by `dayBoundary`.
- `fastTimes(date, place, { opinions })`: when a fast begins and ends.
- `isMelachaForbiddenAt(instant, place, { opinions, candleLightingMinutes })`: Shabbos or Yom Tov,
  from candle lighting to the `havdala` opinion.
- `dayInfo(date, { location, opinions, zmanim: ['shema', 'sunset', 'tzeis-72'] })`: everything about
  a day; `zmanim` takes the day's slots (by the user's opinion) or ids.
