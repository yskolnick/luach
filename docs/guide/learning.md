# Learning cycles

```ts
import { dafYomi, yerushalmiYomi, amudYomi, dafHaShavua, mishnaYomis, rambamOneChapter,
  rambamThreeChapters, seferHaMitzvosDay, nachYomi, HebrewDate } from 'luach';

const d = HebrewDate.fromGregorian(2026, 10, 21);
dafYomi(d);            // { tractate: 'Bekhorot', daf: 33, cycle: 14, ... }
mishnaYomis(d)?.text;  // "Oholot 11:6–11:7"
rambamThreeChapters(d)?.text;
nachYomi(d)?.text;     // "Jeremiah 39"
```

Each cycle is computed from its start date and the structure of its text — no tables. Start
dates and sources: [research note](https://github.com/yskolnick/luach/blob/main/docs/research/2026-10-21-learning-cycles.md).
Cycles that only exist as a publisher's day-by-day table (Chofetz Chaim, Tanya, Sefer
HaMitzvos content) are not included.
