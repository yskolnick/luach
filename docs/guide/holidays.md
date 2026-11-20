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
`behab`, `yomKippurKatan`, `modernIsraeli`, `shovavim`, `chabad`, `yizkor` (Yom Kippur, and in the
diaspora the last day of Pesach, the second day of Shavuos and Shemini Atzeres: Mishna Berura
494:17, 668:15). When Erev Rosh Chodesh is Friday,
Yom Kippur Katan is on Thursday by default (Mishna Berura 417:4, for those who say Selichos);
`yomKippurKatanOnFriday: 'friday'` keeps it on Friday (Magen Avraham 417:3; MB 417:4 for those
who don't say Selichos).

`chabad: true` adds the 23 Chabad days that Luach has read in a sefer (ids
`chabad-<day>-<month>`, such as `chabad-19-kislev`), on their Hebrew dates in every year. The English
name says what the sefer says the day marks; the Hebrew name is the date. Four days are not offered
because no sefer was read for them: 1 Kislev, 5 Teves, 22 Shevat and 25 Adar
([the choices](../halacha/choices.md#the-chabad-days)).

Moved fasts carry `moved: true` (Tisha B'Av on Sunday, Taanis Esther on Thursday, …).

Every event says when its day `begins`: `'sunset'`, the evening before, as every day of the Hebrew
calendar begins (so Purim begins with the Megillah at night: Megillah 4a; Shulchan Aruch OC 687:1),
or `'dawn'` for a minor fast (Shulchan Aruch OC 564:1).

## Is tonight an eve, does a fast begin tonight

`dayInfo` answers both for a day, with a place. `erev` lists the eves the day is (`erev-shabbos`,
`erev-yom-tov`, `erev-yom-kippur`; empty on any other day), and `fastBeginsTonight` is the fast
that begins at sunset this evening (Yom Kippur, Tisha B'Av), or `null`. Test the ids, not the
names.

```ts
import { dayInfo } from 'luach';
import { getPlace } from 'luach/places';

const lakewood = getPlace('lakewood')!;
const eve = dayInfo({ year: 2026, month: 9, day: 20 }, { location: lakewood });
eve.erev.map((e) => e.id);        // ["erev-yom-kippur"]
eve.fastBeginsTonight?.id;        // "yom-kippur"
eve.fastBeginsTonight?.begins.local;       // tonight's sunset, as "HH:mm"

dayInfo({ year: 2027, month: 4, day: 21 }, { location: lakewood }).erev.map((e) => e.id);  // ["erev-yom-tov"]
```

A fast's own result says whether it begins the evening before: `beginsEvening` is true for Yom
Kippur and Tisha B'Av, and false for a minor fast, which begins at dawn. It is on `fastTimes`,
`fastAt`, and `fast` in the day and now views.

## Rosh Hashana's first night is in the year before

The candles for the first night of Rosh Hashana are lit on 29 Elul, the eve, which belongs to the
Hebrew year that is ending: `holidaysForYear(5787)` starts at 1 Tishrei, and the candles are on a
day of 5786. A year of reminders that starts at 1 Tishrei misses them. Start the range at the eve:

```ts
import { HebrewDate, Month, dayInfo, dayInfoRange } from 'luach';
import { getPlace } from 'luach/places';

const lakewood = getPlace('lakewood')!;
const eve = new HebrewDate(5786, Month.ELUL, 29);
const [erev, first, second] = dayInfoRange(eve, 3, { location: lakewood });
erev.date;                          // "2026-09-11" (a Friday: the candles are for Shabbos and Yom Tov)
erev.candleLighting?.local;         // "18:54"
first.candleLighting?.id;           // "candle-lighting-second-night" (the second night, after nightfall)
```

## The Omer, seasons, tefilla

```ts
import { omerDay, omerText, omerSefirah, talUmatarStart, tefillaOn, HebrewDate } from 'luach';

omerText(8);             // "היום שמונה ימים שהם שבוע אחד ויום אחד לעומר"
omerSefirah(8, 'ashkenazi'); // "Chesed sheb'Gevurah"
talUmatarStart(5787).eveningOf; // { year: 2026, month: 12, day: 4 }
tefillaOn(HebrewDate.fromGregorian(2026, 12, 6)); // { tachanun: false, hallel: 'full', ... } (Chanukah)
```

Tachanun customs differ; the defaults follow common Ashkenazi practice and are options.
A community's own days go in `noTachanunDays`:

```ts
import { tefillaOn, HebrewDate, Month } from 'luach';

tefillaOn(new HebrewDate(5787, Month.SHEVAT, 3), { noTachanunDays: [{ month: Month.SHEVAT, day: 3 }] }).tachanun; // false
```

`walledCity` is Purim on 15 Adar, as in a city walled since Yehoshua (Mishna Megillah 1:1; Shulchan Aruch OC
688:1-3). In `dayInfo` and `nowInfo` it is `true` for a built-in place that has `walledCity` (Jerusalem) and `false`
otherwise; pass `walledCity` to choose. It moves Al HaNissim, the Megillah and Tachanun in `tefillaOn` to the 15th,
and Purim Meshulash (Friday, Shabbos and Sunday, when 15 Adar is Shabbos) is in the list only when it is `true`.
Cities whose walls in Yehoshua's days are in doubt are not included: ask your rav.

`minhag: 'chabad'` follows the Chabad custom as read in Sefer HaMinhagim and Hayom Yom: no Tachanun on 10,
19 and 20 Kislev, 12 and 13 Tammuz and 7 Adar, nor at the Mincha before them (`tachanunOmittedAtMincha`),
and none from erev Yom Kippur to the end of Tishrei, so it is said again on 2 Cheshvan
([the choices](../halacha/choices.md#tachanun-by-the-chabad-custom)).

`mizmorLesodah: 'sephardi'` says Mizmor L'Sodah on Erev Pesach, Chol Hamoed Pesach and Erev Yom
Kippur (Kaf HaChaim OC 51:51–52). `amidahSeason(date, { nusach: 'edot-hamizrach' }).barchenu` gives
the Sephardi summer text of the blessing of the years (Kaf HaChaim OC 117:1).
