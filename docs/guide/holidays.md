# Holidays

```ts
import { holidaysForYear, holidaysOn, holidayName, HebrewDate, ashkenazi } from 'luach';

for (const e of holidaysForYear(5787, { israel: false })) {
  console.log(e.date.toCivil(), holidayName(e, ashkenazi), e.flags.yomTov);
}
holidaysOn(HebrewDate.fromGregorian(2027, 3, 23)).map((e) => e.id); // ["purim"]
```

**Israel or the diaspora** (`israel: true | false`) decides Yom Tov Sheni, Chol Hamoed and Isru
Chag. The functions that take only a date, such as `holidaysForYear`, use the diaspora unless
you say otherwise. The ones that take a place (`dayInfo`, `toICalendar`, `fastTimes`,
`isMelachaForbiddenAt`) decide from the place when you don't say: see
[Places](./places.md#israel-or-the-diaspora). An explicit option always wins.

Every event has the same flags, so you can filter: `yomTov`, `melachaForbidden`,
`cholHamoed`, `fast` (`'major' | 'minor' | null`), `roshChodesh`, `modernIsraeli`, `minor`,
`specialShabbos`, `erev`, `isruChag`, `optional`. Optional events are off by default:
`behab`, `yomKippurKatan`, `modernIsraeli`, `shovavim`. When Erev Rosh Chodesh is Friday,
Yom Kippur Katan is on Thursday by default (Mishna Berura 417:4, for those who say Selichos);
`yomKippurKatanOnFriday: 'friday'` keeps it on Friday (Magen Avraham 417:3; MB 417:4 for those
who don't say Selichos).

Moved fasts carry `moved: true` (Tisha B'Av on Sunday, Taanis Esther on Thursday, …).

## The Omer, seasons, tefillah

```ts
import { omerDay, omerText, omerSefirah, talUmatarStart, tefillahOn, HebrewDate } from 'luach';

omerText(8);             // "היום שמונה ימים שהם שבוע אחד ויום אחד לעומר"
omerSefirah(8, 'ashkenazi'); // "Chesed sheb'Gevurah"
talUmatarStart(5787).eveningOf; // { year: 2026, month: 12, day: 4 }
tefillahOn(HebrewDate.fromGregorian(2026, 12, 6)); // { tachanun: false, hallel: 'full', ... } (Chanukah)
```

Tachanun customs differ; the defaults follow common Ashkenazi practice and are options.
