# Migrating from 0.2

Everything in the next release that needs a change in your code, with what to write instead. The
[changelog](https://github.com/yskolnick/luach/blob/main/CHANGELOG.md) lists every change, the additions too. Three of these change an
answer without any change to your code: the candle lighting of a place with a documented custom,
when melacha begins (`isMelachaForbiddenAt`, `melachaRunAt`), and the calendar file's event IDs. Read those first.

## Answers that change without a change to your code

**Candle lighting at a place with a documented custom.** `new Zmanim(place)` now uses the place's
custom when you do not give the minutes, as the day view already did: Jerusalem is 40 minutes
before sunset, not 18. To keep the old value:

```ts
new Zmanim(place, opinions, { candleLightingMinutes: 18 });
```

**When melacha begins.** `isMelachaForbiddenAt`, `melachaRunAt` and `nowInfo().melacha` count
melacha as forbidden from shkiah (sunset), not from candle lighting, and no setting brings the old
answer back: candle lighting is the custom's time to light, not the time melacha begins.
`melacha.begins` is the shkiah `Zman` (id `sunset`); the candles are in `melacha.days[0].candles`.
Whether to keep to an earlier time is for your rav.

**The calendar file's event IDs.** Candle lighting, havdala, the end of Shabbos and added zmanim
carry a short tag of the place and settings in their `UID`, so two feeds for two places no longer
overwrite each other. A calendar subscribed to a 0.2 feed shows those events once as new.
Holidays, parsha and learning keep their IDs.

## Imports

The city table and the learning cycles have their own imports, so an app that uses neither does
not carry them.

```ts
// 0.2
import { getPlace, dafYomi, Zmanim } from 'luach';
// now
import { Zmanim } from 'luach';
import { getPlace } from 'luach/places';
import { dafYomi } from 'luach/learning';
```

`luach/places`: `builtInPlaces`, `getPlace`, `searchPlaces`, `nearestPlace`, `distanceKm`,
`LOCAL_CANDLE_LIGHTING`, `Place`, `CandleLightingCustom`, `SearchOptions`. `isInIsrael` stays in
`luach`. `luach/learning`: `dafYomi`, `locate`, `BAVLI_TRACTATES`, `yerushalmiYomi`, `amudYomi`,
`dafHaShavua`, `mishnaYomis`,
`nachYomi` and their types.

## Learning in the day view and the calendar file

`dayInfo` and `nowInfo` give `learning: null` unless you pass the plug-in; `toICalendar` takes the
plug-in rather than a list of names.

```ts
import { dayLearning, icalLearning } from 'luach/learning';
dayInfo(date, { location, learning: dayLearning });
toICalendar(from, to, { learning: icalLearning(['dafYomi']) });
```

## Results are frozen

A `HebrewDate`, holiday events, reading cycles, what `parshaFor` returns, and every `Zman` are
frozen; changing one throws a `TypeError`. Copy before you change:

```ts
const order = [...parshaFor(date).parsha].reverse();
```

A `Zman`'s `time` and `exact` give a new `Date` on each read. Compare instants with `getTime()`,
not `===`.

## Inputs that are now refused

- A year that is not a whole number from 1 to 9999 throws a `RangeError` in `yearLength`,
  `yearType`, `monthLength`, `monthsOfYear`, `isLeapYear` and `monthsInYear`.
- A place whose `candleLighting` is not `{ minutes, custom, source }` throws a `RangeError` in
  `new Zmanim`. To give only the minutes, pass `candleLightingMinutes` in the settings.
- `isMelachaForbiddenAt` takes a `DayLocation` (a place, with its `candleLighting` if it has one).

## The command line

An option a command does not know, an option without its value, a value given to a switch,
`--israel` with `--diaspora`, an unknown `--locale` and an argument a command does not take are
errors (exit 1), where they were ignored. Check scripts that pass options to every command alike:
`--chanukah-lighting` applies only to `now`, `--learning` only to `ics`. A place can now be given
as an argument: `luach now jerusalem`.

## The example server

`/day` and `/now` give `learning` only with `learning=1`. An unknown or repeated query parameter
is a 400 naming it; a request over 4,096 characters is a 414; `/calendar.ics` takes at most six
learning cycles. It is an example, not hardened for the open internet: keep it on a home network
or behind a reverse proxy with limits.
