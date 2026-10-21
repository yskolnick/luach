# Holidays and fasts

```ts
import { holidaysInYear, holidaysOn, holidayName, fastTimes, hallel, omerDay, omerTextHebrew, omerSefirah, findCity } from 'luach';

const year = holidaysInYear(5787, { location: 'diaspora' });
for (const h of year) console.log(h.dayNumber, holidayName(h, 'ashkenazi'), h.category);

// Filter with the flags on each event:
year.filter((h) => h.yomTov);          // days melacha is forbidden
year.filter((h) => h.fast === 'minor');
year.filter((h) => h.specialShabbos);
```

`location` is required: Israel keeps one day of Yom Tov and the diaspora two, and Isru Chag, Chol Hamoed and the
parsha follow from that.

## Optional customs (off by default)

```ts
holidaysInYear(5787, {
  location: 'israel',
  modernIsraeli: true,  // Yom HaShoah, Yom HaZikaron, Yom HaAtzmaut, Yom Yerushalayim, Yom HaAliyah, Sigd (Knesset rules)
  behab: true,          // Monday–Thursday–Monday after Sukkos and Pesach
  yomKippurKatan: true, yomKippurKatanOnFriday: 'thursday',
  shovavim: true,
  leilSelichos: true,
});
```

## Fast times

```ts
const brooklyn = findCity('Brooklyn')!;
const gedalia = year.find((h) => h.id === 'tzom-gedalia')!;
const { begins, ends } = fastTimes(gedalia, brooklyn); // alos 72 → tzeis 8.5° by default; both opinions named
```

Pass `{ alos, tzeis }` to choose other opinions. Yom Kippur and Tisha B'Av begin at sunset the evening before.

## The Omer, Hallel, rain prayers, Kiddush Levana, Birkas HaChama

```ts
omerDay(n);              // 1–49 or null (the count for day N is said the evening before)
omerTextHebrew(10);      // "היום עשרה ימים שהם שבוע אחד ושלשה ימים לעומר"
omerSefirah(33, 'he');   // "הוד שבהוד"
hallel(n, 'diaspora');   // 'whole' | 'half' | null
```

`rainPrayers(n, location)` says whether "mashiv haruach" and "v'sein tal umatar" are said. The diaspora start date of
tal umatar is computed from Shmuel's tekufa (4 or 5 December in this century, later after 2100), not hard-coded.
`kiddushLevanaEarliest` / `kiddushLevanaLatest` take an opinion (`'3-days'`, `'7-days'`, `'half-month'`, `'15-days'`).
`birkasHachama(year)` returns the date in the years it falls (2037, 2065…).
