# Learning cycles

```ts
import { HebrewDate } from 'luach';
import { dafYomi, yerushalmiYomi, amudYomi, dafHaShavua, mishnaYomis, rambamOneChapter, rambamThreeChapters, seferHaMitzvosDay, nachYomi } from 'luach/learning';

const d = HebrewDate.fromGregorian(2026, 10, 21);
dafYomi(d);            // { tractate: 'Bekhorot', daf: 33, cycle: 14, ... }
mishnaYomis(d)?.text;  // "Oholot 11:6–11:7"
rambamThreeChapters(d)?.text;
nachYomi(d)?.text;     // "Jeremiah 39"
```

## In the day view and in iCal

The day view and iCal do not carry the learning tables unless you pass them in, so an app that
shows neither does not pay for them:

```ts
import { dayInfo, toICalendar, en } from 'luach';
import { dayLearning, icalLearning } from 'luach/learning';

dayInfo(d, { learning: dayLearning, locale: en }).learning;   // { dafYomi: "Bekhorot 33", mishnaYomis: "Oholot 11:6–11:7", ... }
dayInfo(d).learning;                                          // null
toICalendar(from, to, { learning: icalLearning(['dafYomi', 'mishnaYomis']) });
```

`dayLearning(date, locale)` returns the object the day view holds. `icalLearning(names)` takes
`dafYomi`, `yerushalmiYomi`, `mishnaYomis`, `rambamOneChapter`, `rambamThreeChapters` and
`nachYomi`; a plain list of names given to `toICalendar` throws a `TypeError`.

Each cycle is computed from its start date and the structure of its text — no tables. Start
dates and their sources are cited in the code (`src/learning/`).
Cycles that only exist as a publisher's day-by-day table (Chofetz Chaim, Tanya, Sefer
HaMitzvos content) are not included.
