# Luach

A free, open-source Hebrew calendar and zmanim library for JavaScript and TypeScript:
Hebrew dates, holidays, parsha, learning cycles and zmanim. Zero dependencies. Runs in
Node, browsers, Deno, Bun and React Native.

> **Ask your rav. This library calculates; it does not rule.**
> Every zman names the opinion it follows and its source. Defaults are conveniences, not
> rulings.

**Status:** in development. See [ROADMAP.md](ROADMAP.md) for what is built.

## Install

```sh
npm install luach
```

## Quick start

```ts
import { HebrewDate, formatHebrewDate, ashkenazi, gematriya } from 'luach';

const today = HebrewDate.fromGregorian(2026, 10, 21);
today.year;  // 5787
today.month; // 8 (Cheshvan; months are numbered from Nisan = 1)
today.day;   // 10

formatHebrewDate(today);                       // "י׳ חשון תשפ״ז"
formatHebrewDate(today, { locale: ashkenazi }); // "10 Cheshvan 5787"
gematriya(5787);                               // "ה׳תשפ״ז"

// After nightfall it is already the next Hebrew day:
HebrewDate.fromGregorian(2026, 10, 21, { afterSunset: true }); // 11 Cheshvan
```

### Zmanim

```ts
import { ZmanimCalendar, getPlace } from 'luach';

const zmanim = new ZmanimCalendar(getPlace('jerusalem')!, { year: 2026, month: 10, day: 21 });
const shema = zmanim.sofZmanShemaGra();
shema.localTime(); // "09:35" (a deadline, so rounded down)
shema.opinion;     // "Latest Shema, Gra: 3 seasonal hours of a sunrise-to-sunset day"
shema.source;      // "Shulchan Aruch OC 58:1; Mishna Berura 58:4"
```

Every opinion has its own method (`sofZmanShemaMga72`, `tzeis8Point5`, `tzeisRabbeinuTam`
and many more). When the sun never reaches an angle, the method returns `null` with a reason
rather than a guessed time.

### Right-to-left text

A Hebrew date placed inside left-to-right text can appear scrambled: the Unicode bidi
algorithm reorders spaces, digits and punctuation around Hebrew letters. Pass
`{ isolate: true }` to wrap Hebrew output in invisible Unicode isolates (U+2067 … U+2069)
that keep it together. It is opt-in because the isolates are real characters in the string.

## How Luach differs

- **Clean-room and permissive.** Written from primary sources (the Rambam, NOAA, Meeus,
  named halachic works). No code from GPL or LGPL calendar libraries. Apache-2.0.
- **Tested against independent oracles** every day from 1900 to 2240 for the calendar, and
  across many cities, latitudes and time zones for zmanim.
- **Time zones from IANA via `Intl`**, never a derived "standard offset".
- Not to be confused with `luach-picker`, an unrelated date-picker widget. Luach is a
  calculation library with no UI; a picker could be built on it.

## Documentation

The `docs/` folder holds the guides (dates, holidays, parsha, learning, zmanim, places,
outputs, right-to-left text, React Native), every zman with its source, the accuracy
reports and the API reference. Build and open it with `npm run docs:dev`. Runnable examples
are in `examples/`; a demo app is in `apps/demo/`.

## How to credit

Luach is licensed under the [Apache License 2.0](LICENSE). You may use it in any project,
including commercial apps. When you redistribute it (including inside an app), include the
[NOTICE](NOTICE) text, for example on your app's "About" or open-source licences screen:

> Built on Luach by Yosef Skolnick — https://github.com/yskolnick/luach

Luach includes city data from [GeoNames](https://www.geonames.org/) (CC-BY 4.0); the NOTICE
file carries that credit too.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please do not submit code copied or adapted from
other calendar or zmanim libraries. Report security problems privately: see
[SECURITY.md](SECURITY.md). Everyone taking part follows the
[code of conduct](CODE_OF_CONDUCT.md).

## Licence

Apache-2.0. Copyright 2026 Yosef Skolnick. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
