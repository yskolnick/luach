# Luach

A Hebrew calendar and zmanim library for JavaScript and TypeScript: Hebrew dates, holidays, parsha,
learning cycles and halachic times. Every zman names the opinion it follows and its source.

> **Ask your rav. This library calculates; it does not rule.**
> Defaults are documented as defaults, never as "the" correct time.

- Zero runtime dependencies, tree-shakable ESM with CommonJS and TypeScript types.
- Runs in Node 18+, browsers, Deno, Bun and React Native (Hermes).
- No network calls, no telemetry, no `eval`.
- Clean-room implementation from primary sources (the Rambam, the NOAA solar equations, named halachic works),
  tested against independent implementations.
- Apache-2.0: free for any use, including commercial apps, with credit (see [How to credit](#how-to-credit)).

Status: under construction toward 1.0. See [ROADMAP.md](ROADMAP.md) for what is built.

## Install

```sh
npm install luach
```

## Quick start

```ts
import { gregorianToHebrew, formatHebrewDate, molad, TISHREI } from 'luach';

const today = gregorianToHebrew({ year: 2027, month: 3, day: 23 });
formatHebrewDate(today, { style: 'he' });        // "י״ד אדר ב׳ תשפ״ז" (Purim)
formatHebrewDate(today, { style: 'ashkenazi' }); // "14 Adar II 5787"

const m = molad(5788, TISHREI); // day, hours, chalakim, and the civil (Jerusalem mean time) reading
```

## Concepts

- **Day numbers.** Internally a date is a day number: days since 1970-01-01 (proleptic Gregorian).
  A day number names a calendar date, not an instant.
- **Months count from Nisan** (Shemos 12:2): `NISAN = 1` … `ADAR = 12`, `ADAR_II = 13`. Use the exported constants.
- **A civil date maps to the Hebrew date of its daytime.** The Hebrew date changes at sunset; pass
  `afterSunset: true`, or use the zmanim helpers.
- **Time zones are IANA ids** (`"America/New_York"`), resolved through `Intl` at each instant. On engines
  without `Intl` time-zone support, pass a `TimeZoneProvider`.

## Hebrew text in left-to-right layouts

A Hebrew date placed in left-to-right text can display with its parts reordered, because the Unicode
bidirectional algorithm resolves the punctuation and digits around it by the surrounding direction.
`formatHebrewDate(d, { style: 'he', isolate: true })` wraps the result in a right-to-left isolate
(U+2067 … U+2069), which keeps it intact. It is opt-in because some systems draw the invisible marks as boxes.

## How to credit

Luach is licensed under Apache-2.0. If you redistribute it (including inside an app), keep the
[NOTICE](NOTICE) file's text with it. We also ask, though the licence can't require it, that apps show:

> Built on Luach by Yosef Skolnick

somewhere users can see it, such as an About or Credits screen.

## Not to be confused with

`luach-picker` on npm is an unrelated date-picker UI component. Luach is a calculation library with no UI.

## Licence

Apache-2.0. Copyright 2026 Yosef Skolnick. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
Data sources and their licences: [docs/data-sources.md](docs/data-sources.md).
