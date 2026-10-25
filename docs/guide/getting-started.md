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
import { dayInfo, getPlace } from 'luach';

const info = dayInfo({ year: 2026, month: 10, day: 23 }, { location: getPlace('lakewood') });
info.candleLighting?.local;  // "17:47"
info.parsha?.name;           // "לך לך"
```

> **Ask your rav. This library calculates; it does not rule.** Every zman names its opinion
> and source; defaults (sea-level sunrise, 18-minute candle lighting, the Omer in Nusach
> Ashkenaz…) are conveniences, documented with each option.

## What is where

| You want | Use | Guide |
|---|---|---|
| Hebrew ↔ Gregorian, molad, yahrzeits, gematriya | `HebrewDate`, `molad`, `anniversary`, `gematriya` | [Dates](./dates) |
| Holidays, fasts, Omer, Tachanun… | `holidaysForYear`, `holidaysOn`, `omerText`, `tefillahOn` | [Holidays](./holidays) |
| Parsha and haftara | `parshaFor`, `haftaraFor` | [Parsha](./parsha) |
| Daf Yomi and other cycles | `dafYomi`, `mishnaYomis`, … | [Learning](./learning) |
| Zmanim | `ZmanimCalendar` | [Zmanim](./zmanim) |
| Cities, Israel or not | `searchPlaces`, `isInIsrael` | [Places](./places) |
| JSON, iCal, the command line | `dayInfo`, `toICalendar`, `luach` | [Outputs](./outputs) |
| Right-to-left text | `isolate` option | [RTL](./rtl) |
| React Native | | [React Native](./react-native) |
