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
import { molad, moladAnnouncement, Month, he, ashkenazi } from 'luach';
moladAnnouncement(5787, Month.CHESHVAN, ashkenazi);   // "Sunday, 9:43 am and 2 chalakim"
moladAnnouncement(5784, Month.TEVES, he);             // "ליל רביעי, 20:01 ו־3 חלקים"
molad(5784, Month.TEVES).clock;
// { date: { year: 2023, month: 12, day: 12 }, dayOfWeek: 2, hour: 20, minute: 1, chalakim: 3, period: 'night' }

// Your own clock and date style, put into the sentence:
moladAnnouncement(5784, Month.TEVES, ashkenazi, {
  date: (d) => `Dec ${d.day}`,
  time: (h, m) => `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`,
});   // "Tuesday night, Dec 12, 8:01 PM and 3 chalakim"
```

`moladAnnouncement` takes a names set like the other name functions (`he` by default). The
weekdays and Motzaei Shabbos come from the set's names (`weekday.N`, `term.motzaei-shabbos`), so
change a word there, never by editing the sentence. For a wording of your own, use
`molad(year, month).clock`: the civil weekday, the hour, minutes and chalakim, and `period`
(`'early-morning'`, `'day'`, or `'night'`, which belongs to the next Hebrew day; on a Saturday,
Motzaei Shabbos).

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

### Cases for a yahrzeit

- **30 Adar I, in a year with one Adar.** The yahrzeit of 30 Adar I of a leap year is on 30 Shevat
  in a common year (the first day of Rosh Chodesh Adar there); a birthday is 1 Nisan.
- **A death after nightfall.** The Hebrew date of the death is the next one. Whether to count a
  death between sunset and nightfall is a question for a rav; `HebrewDate.fromGregorian(y, m, d,
  { afterSunset: true })` gives the next Hebrew date.
- **The evening before.** A Hebrew day begins at sunset, so the observance begins on the evening
  before the date `anniversary` gives: `nightOf(date, place).sunset` is that evening's sunset.

```ts
import { anniversary, HebrewDate, Month, nightOf } from 'luach';
import { getPlace } from 'luach/places';

anniversary({ year: 5784, month: Month.ADAR_I, day: 30 }, 5785, { kind: 'yahrzeit' });  // 30 Shevat 5785
HebrewDate.fromGregorian(2026, 10, 21);                         // 10 Cheshvan 5787
HebrewDate.fromGregorian(2026, 10, 21, { afterSunset: true });  // 11 Cheshvan 5787
nightOf(new HebrewDate(5787, Month.CHESHVAN, 10), getPlace('lakewood')!).sunset.toJSON().local;  // "18:09", on 2026-10-20
```

### Writing and reading a date

`parseHebrewDate(formatHebrewDate(d))` gives `d` back for every year from 1 to 9999 with a locale
that writes the year in digits (`ashkenazi`, `sephardi`, `en`). The Hebrew locale (`he`, the
default) writes the year without its thousands (`תשפ״ז`), so the text reads back as a year from 5001 to
5999, and only those years round-trip. Pass `{ locale: ashkenazi }` to both to round-trip any year.

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
