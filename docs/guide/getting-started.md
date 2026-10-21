# Getting started

```sh
npm install luach
```

```ts
import { gregorianToHebrew, formatHebrewDate, findCity, getDay } from 'luach';

const date = gregorianToHebrew({ year: 2027, month: 3, day: 23 });
formatHebrewDate(date, { style: 'he' });        // "י״ד אדר ב׳ תשפ״ז"
formatHebrewDate(date, { style: 'ashkenazi' }); // "14 Adar II 5787"

const lakewood = findCity('Lakewood')!;
const day = getDay({ year: 2027, month: 3, day: 23 }, { location: lakewood, calendar: 'diaspora' });
day.holidays;           // [{ id: 'purim', name: 'Purim', … }]
day.zmanim.netz.local;  // "06:56"
day.zmanim.netz.opinion // "Netz HaChama"
```

## What you must choose

Luach decides nothing halachic. Three things are always the caller's choice:

1. **Israel or the diaspora.** Holiday and parsha functions take `location: 'israel' | 'diaspora'` (or `calendar` in
   `getDay`). There is no default, because the answer differs. `isInIsrael(lat, lon)` can help you suggest one.
2. **Which opinion.** Each zman is a separately named function: `sofZmanShemaGra`, `sofZmanShemaMA72`, and so on.
3. **Customs.** Where poskim differ (a yahrzeit in Adar, candle-lighting minutes), the options name the custom, and when
   you don't choose, Luach returns every candidate, each labelled.

## Runtimes

Node 18+, modern browsers, Deno, Bun and React Native (Hermes). See [Time zones and React Native](./time-zones).

## Next

- [Concepts](./concepts): day numbers, months from Nisan, when the Hebrew date changes.
- [Recipes](/recipes/dates) for each feature.
- [Halachic notes](/halacha/opinions): every opinion and its source.
