# Luach

A Hebrew calendar and zmanim library for JavaScript and TypeScript: Hebrew dates, holidays, parsha and haftara,
learning cycles and halachic times. Every zman names the opinion it follows and its source.

> **Ask your rav. This library calculates; it does not rule.**
> Defaults are documented as defaults, never as "the" correct time.

- Zero runtime dependencies; tree-shakable ESM, CommonJS and TypeScript types.
- Runs in Node 18+, browsers, Deno, Bun and React Native (Hermes).
- No network calls, no telemetry, no `eval`.
- Clean-room implementation from primary sources (the Rambam, the Shulchan Aruch and its commentaries, the NOAA solar
  equations), checked day by day against independent implementations. See the [accuracy report](docs/accuracy.md).
- Apache-2.0: free for any use, including commercial apps, with credit (see [How to credit](#how-to-credit)).

## Install

```sh
npm install luach
```

## Quick start

```ts
import { gregorianToHebrew, formatHebrewDate, findCity, getDay, molad, TISHREI } from 'luach';

const today = gregorianToHebrew({ year: 2027, month: 3, day: 23 });
formatHebrewDate(today, { style: 'he' });        // "י״ד אדר ב׳ תשפ״ז" (Purim)
formatHebrewDate(today, { style: 'ashkenazi' }); // "14 Adar II 5787"

const day = getDay({ year: 2027, month: 3, day: 23 }, { location: findCity('Lakewood')!, calendar: 'diaspora' });
day.holidays;          // [{ id: 'purim', name: 'Purim', … }]
day.zmanim.netz;       // { time, local: "06:56", opinion: "Netz HaChama", source: "SA OC 58:1, 89:1", rounded: "up" }
day.learning.dafYomi;  // { text: "…", textHebrew: "…" }

const m = molad(5788, TISHREI); // day, hours, chalakim, and the clock reading
```

```sh
npx luach today --city Lakewood
```

## What's included

| Area | Highlights |
|---|---|
| Calendar | Conversion for Hebrew years 1–9999; molad; leap years and dechiyos; yahrzeits and birthdays with each custom labelled; gematriya; names in Hebrew, Ashkenazi, Sephardi and English; RTL isolates |
| Holidays | Yomim Tovim, fasts with postponements, Chanukah, Purim (incl. Meshulash), Rosh Chodesh, special Shabbosos, optional customs and modern Israeli days; Omer; Hallel; rain prayers; Birkas HaChama; Kiddush Levana |
| Readings | Parsha for Israel and the diaspora; haftara by custom; Pirkei Avos; Daf Yomi (Bavli, Yerushalmi), Mishna Yomis, Rambam, Nach Yomi, Daf HaShavua |
| Zmanim | ~45 named opinions with sources; null with a reason when an angle isn't reached; documented rounding; sea level or elevation |
| Places | ~180 cities with Hebrew names and search; 34,000 more as `luach/cities-full`; `isInIsrael()` |
| Outputs | `getDay()` JSON with a JSON Schema; iCalendar export; command-line tool |

Documentation: getting started, recipes, halachic notes and the API reference are in [`docs/`](docs/) (build the site
with `npm run docs:build`).

## Concepts in one minute

- **Israel or diaspora is always your choice.** Calendar functions take `location: 'israel' | 'diaspora'`; there is no
  default.
- **Day numbers.** Internally a date is a count of days since 1970-01-01. Most functions also accept `{ year, month, day }`.
- **Months count from Nisan** (Shemos 12:2): `NISAN = 1` … `ADAR = 12`, `ADAR_II = 13`. Use the exported constants.
- **A civil date maps to the Hebrew date of its daytime.** For "the Hebrew date now" at a place, use `hebrewDateAt()`,
  which changes at sunset.
- **Time zones are IANA ids**, resolved through `Intl` at each instant; on engines without it, pass a provider.

## Hebrew text in left-to-right layouts

A Hebrew date placed in left-to-right text can display with its parts reordered, because the Unicode bidirectional
algorithm resolves the punctuation and digits around it by the surrounding direction.
`formatHebrewDate(d, { style: 'he', isolate: true })` wraps the result in a right-to-left isolate (U+2067 … U+2069),
which keeps it intact. It is opt-in because some systems draw the invisible marks as boxes.

## How to credit

Luach is licensed under Apache-2.0. If you redistribute it (including inside an app), keep the text of the
[NOTICE](NOTICE) file with it. We also ask, though the licence can't require it, that apps show:

> Built on Luach by Yosef Skolnick

somewhere users can see it, such as an About or Credits screen.

## Not to be confused with

`luach-picker` on npm is an unrelated date-picker UI component. Luach is a calculation library with no UI.

## Contributing, security, releases

[CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) ·
[CHANGELOG.md](CHANGELOG.md) · [RELEASING.md](RELEASING.md) · [ROADMAP.md](ROADMAP.md) · [DECISIONS.md](DECISIONS.md)

## Licence

Apache-2.0. Copyright 2026 Yosef Skolnick. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
Data sources and their licences: [docs/data-sources.md](docs/data-sources.md).
