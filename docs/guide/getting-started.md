# Getting started

```sh
npm install luach
```

```ts
import { HebrewDate, formatHebrewDate, ashkenazi } from 'luach';

const d = HebrewDate.fromGregorian(2026, 10, 21);
d.toString();                                  // "5787-8-10"
formatHebrewDate(d);                           // "י׳ חשון תשפ״ז"
formatHebrewDate(d, { locale: ashkenazi });    // "10 Cheshvan 5787"
```

Everything about a day, as JSON:

```ts
import { dayInfo } from 'luach';
import { getPlace } from 'luach/places';

const info = dayInfo({ year: 2026, month: 10, day: 23 }, { location: getPlace('lakewood') });
info.candleLighting?.local;  // "17:47"
info.parsha?.name;           // "לך לך"
```

> **Ask your rav. This library calculates; it does not rule.** Every zman names its opinion
> and source; defaults (sea-level sunrise, candle lighting by the place's documented custom or
> else 18 minutes, the Omer in Nusach Ashkenaz…) are conveniences, documented with each option.

## What is where

| You want | Use | Guide |
|---|---|---|
| Hebrew ↔ Gregorian, molad, yahrzeits, gematriya | `HebrewDate`, `molad`, `anniversary`, `gematriya` | [Dates](./dates.md) |
| Holidays, fasts, Omer, Tachanun… | `holidaysForYear`, `holidaysOn`, `omerText`, `tefillahOn` | [Holidays](./holidays.md) |
| Parsha and haftara | `parshaFor`, `haftaraFor` | [Parsha](./parsha.md) |
| Daf Yomi and other cycles (`luach/learning`) | `dafYomi`, `mishnaYomis`, … | [Learning](./learning.md) |
| Zmanim, by the user's opinions | `Zmanim` | [Zmanim](./zmanim.md) |
| Cities (`luach/places`), Israel or not | `searchPlaces`, `isInIsrael` | [Places](./places.md) |
| JSON, iCal, the command line | `dayInfo`, `nowInfo`, `toICalendar`, `luach` | [Outputs](./outputs.md) |
| Names in other spellings | `termName`, `extendLocale`, the sets | [Names](./names.md) |
| Right-to-left text | `isolate` option | [RTL](./rtl.md) |
| React Native | | [React Native](./react-native.md) |
