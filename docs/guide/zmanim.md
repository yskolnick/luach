# Zmanim

```ts
import { Zmanim } from 'luach';
import { getPlace } from 'luach/places';

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
keeps what is valid and reports what is not. Each key is a role (`shema`, `havdala` …) and each
value a zman id (`"sof-zman-shema-mga-72"`), exactly as `Zmanim.choices(role)` lists them; any
other key or value is a problem and that role keeps its default. Store opinions in this form.

Settings that are facts about the place or the user rather than opinions go in the third
argument: `candleLightingMinutes` (a local custom; default the place's documented custom, such
as Jerusalem's 40 minutes on the built-in place, otherwise 18), `useElevation`,
`beginningsSunset`, `ateretTorahMinutes`, `highLatitudeFallback`, `algorithm`, `round` (`'none'` for exact times
with seconds).

To store or send these, with the customs the at-instant functions take (`chanukahLighting`,
`secondNightCandles`, `omerFrom`), use `settingsToJSON(settings)` and read them back with
`parseSettings(json)`, which, like `parseOpinions`, never throws: it keeps what is valid and
reports each problem.

## Every zman

`ZMANIM` is the catalogue: one entry per id, each with its slot, its opinion and its source.
`Object.keys(ZMANIM)` lists every id; `Zmanim.choices(role)` lists those a person may choose for
one role (`'tzeis'`, `'alos'`…).

```ts
import { ZMANIM, Zmanim } from 'luach';
Object.keys(ZMANIM).length;   // 122
Zmanim.choices('tzeis').length; // 17
```

Five ids are in the catalogue but are not times of the sun alone, so `day.get(id)` throws a
`RangeError` for them: `fast-begins`, `fast-begins-sunset`, `fast-ends`, `havdala-after-fast` and
`shabbos-ends-no-havdala`. They depend on the calendar, and only `dayInfo` (`fast`, `havdala`,
`shabbosEnds`) and `fastTimes` compute them.

Where candle lighting has no time because there is no sunset to count from, its `reason` is
`no-sunset` (the reason of the sunset it is counted from), not `depends-on-missing-zman`. A time
that a `highLatitudeFallback` gives carries `date`, the civil date at the place that the time falls
on, because the fallback can place it on another day than the one asked about and `local` has no
date.

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

## Why a time is null

A `Zman` whose `time` is `null` says why in `reason`: one of these eight values
(`ZmanUnavailableReason`). Luach never makes a time up.

| `reason` | Meaning |
|---|---|
| `sun-always-above` | The sun does not get as low as the angle that day (far north in summer): no dawn or nightfall by that angle. The fallbacks apply (below). |
| `sun-always-below` | The sun does not get as high as the angle that day (polar night). No fallback stands in for it. |
| `no-sunrise` | The sun does not rise that day (polar night): sunrise itself and the times counted from it. |
| `no-sunset` | The sun does not set that day (midnight sun): sunset itself and the times counted from it. |
| `depends-on-missing-zman` | The time is made from another time that has none (nightfall 72 minutes after a sunset that does not occur). |
| `not-applicable-today` | The time exists on one day of the year only, and this is not that day: the chametz times, outside Erev Pesach. |
| `date-skipped-in-zone` | The time zone skipped this civil date (see below). |
| `requires-terrain-data` | Not computed: it needs the terrain around the place, which Luach does not have (`sunrise-visible`). |

## When the sun does not reach the angle

In London in June the sun never gets 16.1° below the horizon. Then `time` is `null` and
`reason` is `"sun-always-above"`; zmanim that depend on it get `"depends-on-missing-zman"`.
Luach never makes a time up. Optional fallbacks (`highLatitudeFallback: 'nearestDay' | 'halfNight'`)
are off by default and marked in `fallback` when used. They apply only when the sun does not
get low enough (`"sun-always-above"`, summer nights). In polar night, when the sun never rises
high enough (`"sun-always-below"`), there is no dawn or nightfall to stand in for, so the time
stays `null` with that reason even with a fallback on.

Where a place in polar night has a havdala time but no sunset, melacha stays forbidden until the
civil day ends, the cautious side; B'Mareh HaBazak V:1 gives midday for the polar winter. Ask your
rav. In northern summers (London and Antwerp from about mid-April to the end of August; Montreal
mainly June and July) the default alos, 72 minutes before sunrise, falls after the default
misheyakir at 11°; every source read puts alos first and none says which is primary when they
cross. Ask your rav.

Without turning a fallback on, such a time carries `fallbacks`: `{ halfNight, nearestDay }`, each
the `Zman` that rule gives (exactly what setting it would give), so you can show one rule's time
for one use, the end of a fast, say, without computing anything. Which rule applies to which use is
a question for a rav; the [halachic choices](../halacha/choices.md#far-north-which-rule-for-which-use)
page lists what the sources say for each.

## A date the zone skipped

When a time zone moves across the date line it skips a civil date (Samoa, 30 December 2011).
That date has no local day, so every time on it is `null` with the reason `"date-skipped-in-zone"`;
Luach never gives the next day's times as its own. Times that depend on them, such as candle
lighting, are `null` too. The date itself still has what does not depend on the sun: the Hebrew
date, the day's events and the parsha are given as for any other day.

## Elevation

Sunrise and sunset are at sea level by default, as most luchos are; zmanim defined by
degrees are always at sea level, because the depression angle of the sun is the same for
everyone in the area. `useElevation: true` uses elevation-adjusted sunrise and sunset (and the
Gra day built on them); `sunrise-elevation` and `sunset-elevation` are always available by id.

Candle lighting and the start of Yom Kippur and Tisha B'Av still count from the sea-level sunset
by default when `useElevation` is on: the earlier sunset is the cautious one for a beginning
(4–8 minutes in high places). `beginningsSunset: 'elevation'` counts them from the elevated
sunset instead. Beside candle lighting, show the sunset it was counted from:
`candleLighting.countedFrom`: on a `Zman`, `{ minutes: -18, zman }` with the whole sunset `Zman`; in
the day and now documents, a smaller `{ id, minutes, time, local }`, typed on every time there,
not the day's own sunset, which with elevation on is the later one. Every time that is a fixed
number of minutes from sunrise or sunset has `countedFrom` (dawn 72 minutes, nightfall 72 minutes
and so on). Which sunset these beginnings count from is a question for your rav; see the
[halachic choices](../halacha/choices.md#beginnings-at-the-sea-level-sunset).

```ts
const jerusalem = getPlace('jerusalem')!;                 // 786 m
fastTimes(new HebrewDate(5788, Month.TISHREI, 10), jerusalem, { useElevation: true }).begins;
// 18:13, from the sea-level sunset (the default)
fastTimes(new HebrewDate(5788, Month.TISHREI, 10), jerusalem, { useElevation: true, beginningsSunset: 'elevation' }).begins;
// 18:17, from the sunset seen at 786 m
```

## Checked inputs

Mistakes in code throw a `RangeError` rather than produce an invalid time: an opinion of the
wrong kind or an unknown id, a civil date that does not exist (2026-02-30, month 13, a
fractional year), a latitude outside -90 to 90, a longitude outside -180 to 180, an elevation that is
not a finite number or is more than 10,000 metres or less than -500, candle-lighting minutes outside 0–180, Ateret Torah
minutes outside more than 0 and at most 180, a `beginningsSunset` other than `'sea-level'` or
`'elevation'`. A location that is not an object, a coordinate that is not a number and a missing
time zone are a `TypeError`. Every function that takes a location makes these checks first, and
the message shows the value as received (`NaN` says `NaN`). A negative elevation down to -500 m is
accepted and read as sea level; below -500 m is a `RangeError`. A time zone provider whose offset is
not a finite number of minutes within ±24 hours, and `fixedOffsetZone` with such an offset, throw a
`RangeError`. A `Date` outside the supported years throws a `RangeError` naming the function. Once a `Zmanim` exists, asking it for a time never throws.

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
- `isMelachaForbiddenAt(instant, place, { opinions })`: Shabbos or Yom Tov, from shkiah to the
  `havdala` opinion. Candle lighting is a time shown, not the start of melacha.
- `dayInfo(date, { location, opinions, zmanim: ['shema', 'sunset', 'tzeis-72'] })`: everything about
  a day; `zmanim` takes the day's slots (by the user's opinion) or ids.

The questions an app asks at an instant take the same arguments, and are in
[At this instant](./at-this-instant.md): `hebrewDateSpanAt` (the Hebrew date with the times that
began and end it), `fastAt`, `nightOf`, `kiddushLevanaAt`, `melachaRunAt` (Shabbos or Yom Tov
now or next, and until when) and `timesBetween` (every zman and calendar time in a range).
