# Dates

`HebrewDate` is an immutable whole day. Months are numbered from Nisan, as the Torah counts
them: Nisan = 1 … Elul = 6, Tishrei = 7 … Adar = 12, Adar II = 13 (`Month.ADAR_II`).

```ts
import { HebrewDate, Month } from 'luach';

const d = new HebrewDate(5787, Month.ADAR_II, 14);  // Purim 5787
d.toCivil();          // { year: 2027, month: 3, day: 23 }
d.dayOfWeek;          // 2 (Tuesday; 0 = Sunday, 6 = Shabbos)
d.isLeapYear;         // true
d.yearType;           // "shleimim" | "kesidran" | "chaserim"
```

**The day starts at nightfall.** `HebrewDate.fromGregorian(2026, 10, 21, { afterSunset: true })`
gives the next Hebrew date. To decide by the actual sunset at a place, use
`hebrewDateAt(new Date(), place)` (see [Zmanim](./zmanim.md)).

**Range:** Hebrew years 1–9999. Gregorian dates are *proleptic*: the Gregorian rules are
extended back before 1582, so there is no silent switch to the Julian calendar.

## Molad

```ts
import { molad, moladAnnouncement, Month } from 'luach';
moladAnnouncement(5787, Month.CHESHVAN);   // "Sunday, 9:43 am and 2 chalakim"
```

## Yahrzeits and birthdays

```ts
import { anniversary, barMitzvahDate, Month } from 'luach';
anniversary({ year: 5786, month: Month.ADAR, day: 10 }, 5787, { kind: 'yahrzeit' });   // 10 Adar I
anniversary({ year: 5786, month: Month.ADAR, day: 10 }, 5787, { kind: 'birthday' });   // 10 Adar II
```

Adar in a leap year and the 30th of Cheshvan/Kislev have customs; both are options
(`adarInLeapYear`, `missingThirtieth`), with sources in the function's documentation.
A birthday for someone born in Adar I, in a leap year, is Adar I by default (the Levush;
Mishna Berura 55:43) or Adar II with `adarI: 'magen-avraham'` (Magen Avraham 55:10). A
birthday whose day is missing (30 Adar I in a common year) is the 1st of the next month,
1 Nisan (Magen Avraham 55:10; Mishna Berura 55:45).

## Gematriya and names

```ts
import { gematriya, parseGematriya, parseHebrewDate } from 'luach';
gematriya(5787);                       // "ה׳תשפ״ז"
gematriya(5787, { thousands: false }); // "תשפ״ז"
parseGematriya('תשפ״ז');               // 787
parseHebrewDate('14 Adar II 5787');    // HebrewDate 5787-13-14
```

Four name tables ship: `he`, `ashkenazi` (Teves, Shabbos), `sephardi` (Tevet, Shabbat) and
`en`. Change any name with `extendLocale(ashkenazi, { 'month.10': 'Tebeth' })`.
