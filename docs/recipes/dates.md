# Dates and formatting

```ts
import {
  gregorianToHebrew, hebrewToGregorian, formatHebrewDate, gematriya, parseHebrewYear,
  molad, moladAnnouncement, isLeapYear, daysInYear, yearType, TISHREI, KISLEV,
} from 'luach';

gregorianToHebrew({ year: 2026, month: 10, day: 21 });  // { year: 5787, month: 8, day: 10 }
hebrewToGregorian({ year: 5787, month: 1, day: 15 });   // { year: 2027, month: 4, day: 22 }

formatHebrewDate({ year: 5787, month: 8, day: 10 }, { style: 'he' });                    // "י׳ חשון תשפ״ז"
formatHebrewDate({ year: 5787, month: 8, day: 10 }, { style: 'sephardi', length: 'long' }); // "Wednesday, 10 Heshvan 5787"

gematriya(15);                  // "ט״ו"
gematriya(5787);                // "ה׳תשפ״ז"
parseHebrewYear('תשפ״ז');       // 5787

isLeapYear(5787);               // true
daysInYear(5787);               // 385
yearType(5787);                 // "sheleima"

molad(5787, KISLEV);            // { dayOfWeek, hours, chalakim, civilHour, minutes, … }
moladAnnouncement(5787, TISHREI); // "Molad Tishrei: Friday, 8:59 pm and 1 chelek"
```

## Name styles

`'he'` (Hebrew), `'ashkenazi'` (Teves, Shabbos), `'sephardi'` (Tevet, Shabbat), `'en'` (plain English). Pass your own
table to change any name: `{ ...NAMES.ashkenazi, 'month.cheshvan': 'Marcheshvan' }`.

## Yahrzeits and birthdays

```ts
import { yahrzeit, hebrewBirthday, ADAR } from 'luach';

// Died 7 Adar 5783 (a common year); the yahrzeit in 5784, a leap year:
yahrzeit({ year: 5783, month: ADAR, day: 7 }, 5784);
// → two dates, labelled: Adar I (custom 'rema', Rema OC 568:7) and Adar II ('mechaber', SA OC 568:7)
yahrzeit({ year: 5783, month: ADAR, day: 7 }, 5784, { adar: 'rema' }); // just one
```

The rules for 30 Cheshvan and 30 Kislev follow the Magen Avraham 568:20 by default, with the other customs available.
Bar mitzvah: `hebrewBirthday(birth, birth.year + 13)`; for someone born in Adar I whose 13th year is also a leap year,
both the Levush's and the Magen Avraham's dates are returned (MA 55:10).
