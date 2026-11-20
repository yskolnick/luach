# Learning cycles

```ts
import { HebrewDate } from 'luach';
import { dafYomi, yerushalmiYomi, amudYomi, dafHaShavua, mishnaYomis, nachYomi } from 'luach/learning';

const d = HebrewDate.fromGregorian(2026, 10, 21);
dafYomi(d);            // { tractate: 'Bekhorot', daf: 33, cycle: 14, ... }
mishnaYomis(d)?.text;  // "Oholot 11:6–11:7"
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

`dayLearning(date, locale)` returns the object the day view holds: `dafYomi`, `yerushalmiYomi`,
`amudYomi`, `mishnaYomis`, `nachYomi` and `dafHaShavua`, from one table that `dayLearningDetail` and
`icalLearning` share. `icalLearning(names)` takes the daily cycles, `dafYomi`, `yerushalmiYomi`,
`amudYomi`, `mishnaYomis` and `nachYomi` (not `dafHaShavua`, one portion for a week, which a daily event
would repeat seven times); a plain list of names given to `toICalendar` throws a `TypeError`.
In TypeScript the keys are typed: `LearningCycleName` is the six names (`IcalLearningName` the five),
so `learning.dafYomy` does not compile.

Each cycle is computed from its start date and the structure of its text — no tables. Start
dates and their sources are cited in the code (`src/learning/`).
Cycles that only exist as a publisher's day-by-day table (Chofetz Chaim, Tanya) are not included.

## Dailies by the Hebrew date

```ts
import { tehillimByWeek, shnayimMikra } from 'luach/dailies';

tehillimByWeek(HebrewDate.fromGregorian(2026, 11, 15));  // { text: "Tehillim 1–29", ... }
shnayimMikra(HebrewDate.fromGregorian(2026, 11, 15));    // { parsha: ["vayetzei"], text: "Bereishis 28:10–32:3", shabbos: … }
```

- `tehillimByWeek`: the seven traditional portions, Sunday first.
- `shnayimMikra(date, { israel })`: the whole parsha (or joined parshiyos) the congregation reads on
  the coming Shabbos, with that Shabbos, the time to finish by (Shulchan Aruch OC 285). After the
  year's last parsha, Vezos HaBeracha, read on Hoshana Rabba. No day-by-day split: the sources set
  none.

The dailies are not in `dayLearning` yet. Tanya Yomi and Hayom Yom are not included.
