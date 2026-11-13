# At this instant

The questions that come up when you look at a clock: what Hebrew date is it here, is a fast on,
which night is this, what time are the candles, what is left of this month's Kiddush Levana. Each
is one call, built only from the calendar and the times Luach already calculates, with the day
view's own candle and havdala rule, so their times are the day view's. Their states change at the
exact time, while the time you display is the rounded minute (below).

Every function takes the same arguments: the instant (a `Date`), the place and the options, the
same `opinions` and settings as `hebrewDateAt`, `fastTimes` and `isMelachaForbiddenAt` (see
[Zmanim](./zmanim.md)). Each time is a `Zman`, with its id, opinion, source and `explain()`.

```ts
import { getPlace } from 'luach/places';

const place = getPlace('jerusalem')!;      // or any { latitude, longitude, timeZone }
const options = { opinions: { dayBoundary: 'tzeis-8.5' } };   // the same options as `Zmanim`
```

The place is a `DayLocation`: coordinates and a time zone, and optionally `israel` and the place's
own candle-lighting custom, as a built-in place carries. Israel or the diaspora is chosen as in
`dayInfo`: `options.israel` if given, otherwise the place's.

A few rules hold for all of them:

- **Exact times decide.** A state changes at the exact instant of a time (`zman.exact`), the way
  `hebrewDateAt` and `isMelachaForbiddenAt` do. The time you display (`zman.time`) is rounded to
  the minute on the safe side, so in the seconds between the two a state can change a moment before
  the minute shown. `zman.remaining(now)` counts to the displayed minute.
- **No made-up times.** A time that does not occur (the sun does not set, an angle is not
  reached) is a `Zman` with `time: null` and a `reason`. A state that depends on it is `null`.
  (`isMelachaForbiddenAt`, which answers only `true` or `false`, answers by the civil day there:
  see the halachic choices, "Where the havdala time or candle lighting does not occur".)
- **Facts, not rulings.** Each result gives the times and the facts and leaves the question to
  you: which opinion to follow, what is said on which night, and what an unclear moment means.
  Ask your rav.
- **Plain, frozen data.** Results are frozen objects of `HebrewDate`, `HolidayEvent` and `Zman`.
- **The last date.** Luach's dates end at 29 Elul 9999. A function whose answer needs a later date
  throws a `RangeError`.

## The Hebrew date and where it changes: `hebrewDateSpanAt`

```ts
import { hebrewDateSpanAt, formatHebrewDate, ashkenazi } from 'luach';

const span = hebrewDateSpanAt(new Date('2026-11-13T15:00:00Z'), place);
formatHebrewDate(span.date, { locale: ashkenazi });   // "4 Kislev 5787": Friday 17:00 in Jerusalem
span.civil;                                           // { year: 2026, month: 11, day: 13 }
span.begins.localTime({ exact: true });               // "16:40:56": the sunset that began 4 Kislev
span.ends.localTime({ exact: true });                 // "16:40:22": the sunset that ends it
```

`date` is always what `hebrewDateAt` gives with the same arguments. `begins` and `ends` are the
`dayBoundary` opinion (default sunset) on the evening the date began and the evening it ends;
where that time does not occur, the date changes at civil midnight and the `Zman` says why it has
no time. Between sunset and nightfall the date is in doubt: choose the boundary that suits the
question.

## Is a fast on: `fastAt`

```ts
import { fastAt } from 'luach';

const newYork = getPlace('new-york')!;
const f = fastAt(new Date('2027-08-11T19:00:00Z'), newYork)!;   // the afternoon before Tisha B'Av
f.fast.id;                  // "tisha-bav"
f.inProgress;               // false
f.begins.id;                // "fast-begins-sunset"
f.begins.localTime();       // "19:59": tonight's sunset
```

The fast of the place's civil today or tomorrow: the one in progress, else the next to begin, else
today's that has ended; `null` when neither day is a fast day. A fast of the day before is also
found while it may still be on, where its end falls after local midnight or does not occur (far
north in summer). `inProgress` is true from `begins` to `ends`, false before and after, and `null`
where a time it needs does not occur (a fast that begins at a dawn that never comes). Where the end
does not occur (no nightfall), the fast is on from `begins` until the fast day's sunset, and `null`
from then until the end of the next civil day, as `melachaRunAt` does: Luach gives no time at which
it ends there. The times are those of `fastTimes`, by the `fastBegins` and
`fastEnds` opinions.

## One night: `nightOf`

```ts
import { HebrewDate, Month, nightOf } from 'luach';

const n = nightOf(new HebrewDate(5787, Month.NISAN, 16), place);
n.omer;                                  // 1: counted on the night that begins 16 Nisan
n.sunset.localTime();                    // the evening's sunset, by the `sunset` opinion
n.tzeis.localTime();                     // its nightfall, by the `tzeis` opinion
n.alos.localTime();                      // the morning's dawn
nightOf(new HebrewDate(5787, Month.KISLEV, 25), newYork).chanukahLights;   // 1
```

The night that begins a Hebrew date: the sunset and nightfall of the evening before, the dawn and
sunrise of that morning, the date's events, the Omer day counted on the night and the Chanukah
lights lit on it. It also gives the candles lit that evening (`candles`), when Shabbos or Yom Tov
ends (`ends`) and havdala (`havdala`), as the day view gives them; when Tisha B'Av is postponed to
Sunday, Shabbos ends without havdala (`ends` only) and havdala comes when the fast ends (`havdala`
on the next night).

`chanukahLights` is the number of lights lit on this evening. The events of a date give the lights
of the *next* evening, so on the night of 25 Kislev this is 1 while the event of 25 Kislev says 2.

Which night a mitzvah belongs to between sunset and nightfall, whether a night ends at dawn or at
sunrise, and how Motzaei Shabbos bears on the count are yours to choose; `nightOf` gives the times.

To ask about the night that follows the current date: `nightOf(hebrewDateAt(now, place).next(), place)`.

### When to light the Chanukah lights: `chanukahLighting`

```ts
const n = nightOf(new HebrewDate(5787, Month.KISLEV, 29), newYork, { chanukahLighting: 'sunset' });
const c = n.chanukahLighting;   // null outside Chanukah
c.lights;                       // 5
c.evening;                      // 'weekday' | 'erev-shabbos' | 'motzaei-shabbos'
c.custom;                       // 'sunset': the custom in force
c.isDefault;                    // false: you chose it (true when you passed no option)
c.earliest.localTime();         // the earliest time by the custom in force
c.customs;                      // every custom Luach offers, each with its opinion and source
c.until.localTime();            // dawn of the morning after
```

During Chanukah, `Night.chanukahLighting` gives the earliest time to light, built only from times
Luach already computes. The customs differ and Luach rules on none; when you choose none, a weekday
evening follows nightfall as a default (`custom` is `'tzeis'` and `isDefault` is `true`), which you
can change with the option below.

- **A weekday evening.** `customs` lists two: `sunset` (from sunset: Rambam, Hilchos Megillah
  vChanukah 4:5; Beur HaGra OC 672:1) and `tzeis` (from nightfall, "the end of sunset", explained
  as when the stars come out: Shulchan Aruch OC 672:1; Mishna Berura 672:1). Each `earliest` is
  the evening's own `sunset` or `tzeis` time, so the nightfall custom follows your `tzeis`
  opinion. Pass the option `chanukahLighting: 'sunset' | 'tzeis'` to choose; `earliest` is then
  that custom's time and `isDefault` is `false`. Without it the default is nightfall: `custom` is
  `'tzeis'`, `isDefault` is `true` and `earliest` is the nightfall time (a default, not a ruling;
  pass `'sunset'` for the other custom). `customs` lists both either way. Any other value is
  rejected with a `RangeError`.
- **Erev Shabbos** (the lights are lit before the Shabbos candles). `earliest` is your `plag`
  time (plag hamincha, with enough oil to burn until half an hour after the stars come out:
  Shulchan Aruch OC 679:1; Mishna Berura 679:2) whichever custom is chosen, and `before` is the
  Shabbos candle lighting. The Mishna Berura reckons plag hamincha here as an hour and a quarter
  before nightfall (672:3), so a plag counted from sunset, as the default is, comes earlier than
  his; the time shown is the plag opinion you chose, which the time itself names. Some plag opinions with a long candle-lighting custom (a 40-minute
  custom with a Magen Avraham plag) put plag after the candles; both times are given as they are,
  and Luach decides nothing.
- **Motzaei Shabbos.** `earliest` is when Shabbos ends (your havdala time), whichever custom is
  chosen. Whether the Chanukah lights or havdala come first is a custom Luach does not choose:
  the lights first in Shulchan Aruch and Rema OC 681:2, havdala first in the Taz, cited in Mishna
  Berura 681:3.
- **`until`** is the dawn of the morning after: the lights may be lit all night, until dawn (Rema
  OC 672:2; Mishna Berura 672:11, with the berachah while the household is awake). The proper
  time to light is about half an hour from the earliest time (Shulchan Aruch OC 672:2: "about
  half an hour"), which Luach does not turn into a clock time.

Where a time does not occur (far north, in the polar night, for instance), that `Zman` has no
time and says why; nothing is made up. Other customs, such as lighting shortly after sunset as in
Chabad practice, and Rabbeinu Tam's sunset, are not offered yet. `nowInfo` carries the same in
`night.chanukahLighting` and `nextNight.chanukahLighting`, with `settings.chanukahLighting` (the
custom in force) and `settings.chanukahLightingIsDefault`; the command line's `luach now` prints it
during Chanukah (`--chanukah-lighting sunset|tzeis`) and marks the line "(your choice)" or
"(Luach's default)". Ask your rav.

### The night now: `nightAt`

`nightAt(instant, place, options)` is the `nightOf` night whose span, from its sunset to its dawn
(the `alos` opinion; sunrise where there is no dawn), contains the instant, or `null` between dawn
and sunset. Each night has `omerFrom`, the earliest time to count the Omer: by default the later
of nightfall and the end of Shabbos or Yom Tov, or nightfall alone with `omerFrom: 'tzeis'`.

## Kiddush Levana: `kiddushLevanaAt`

```ts
import { kiddushLevanaAt } from 'luach';

const k = kiddushLevanaAt(new Date('2026-11-13T15:00:00Z'), place);
k.month;                                   // 9: Kislev
k.earliest.threeDays.time;                 // every opinion, none chosen
k.latest.halfMonth.time;
k.nights.length;                           // 13 nights overlap the window
k.nights.filter((n) => n.shabbos || n.events.some((e) => e.flags.melachaForbidden));   // the holy nights in it
```

The month whose latest time has not passed (this month's, or the next once it has), the molad, all
four times of `kiddushLevana`, and every night whose span from sunset to sunrise overlaps the window
from the earliest of the earliest times to the latest of the latest. Whether Kiddush Levana is said
on a night that is Shabbos or Yom Tov, at night only, or on Motzaei Shabbos is for your rav; each
night says whether it is Shabbos and what its events are.

`previous` is the month before `month`, with its `latest` times and `closed` (the later of them):
once this month's window has closed and `month` has moved on to the next, it still says when the
last one closed.

## The part of the day: `dayPartAt`

```ts
import { dayPartAt } from 'luach';

const p = dayPartAt(new Date('2026-11-12T22:00:00Z'), newYork);   // 5:00 PM
p.part;                 // "bein-hashmashos": after sunset (16:40), before nightfall (17:24)
p.tzeis.id;             // "tzeis-8.5": the person's tzeis opinion
```

`part` is `'before-sunrise'` (midnight to sunrise), `'day'`, `'bein-hashmashos'` (sunset to
nightfall) or `'night'` (nightfall to midnight), by the person's `sunrise`, `sunset` and `tzeis`
opinions: where night begins is their `tzeis` (default `tzeis-8.5`, a default, not a ruling).
`sunrise`, `sunset` and `tzeis` are the times compared with, and `date` the civil date they belong
to: the day before, while that day's sunset or nightfall, falling after local midnight far north,
has not come. `part` is `null` where a time it needs does not occur: no sunrise or sunset (polar
day or night), or no nightfall, from sunset until the next sunrise.

## The events in force: `eventsAt`

```ts
import { eventsAt } from 'luach';

const r = eventsAt(new Date('2026-09-21T23:10:00Z'), newYork);   // 7:10 PM after Yom Kippur
r.date.toString();      // "5787-7-11": the Hebrew date has changed at sunset
r.events[0].event.id;   // "yom-kippur": its fast ends at 19:28
r.events[0].inProgress; // true
```

The events of the Hebrew date now (`date`, by the `dayBoundary` opinion), always, each with
`from`, `until` and `inProgress`; before them the events of the date before that are still in force,
and after them those of the next date already in force. A Yom Tov is in force from its candles
until its havdala (or until the date's boundary when another holy day follows); a fast from its
start to its end (`fastTimes`); Isru Chag from the end of the Yom Tov before it; any other event
from the boundary that begins its date to the one that ends it. `inProgress` is `null` where a
time it needs does not occur.

## Davening windows: `tefillaAt`

```ts
import { tefillaAt } from 'luach';

const r = tefillaAt(new Date('2026-11-12T21:30:00Z'), newYork);   // 4:30 PM
r.service;                       // "mincha"
const m = r.windows.find((w) => w.id === 'mincha')!;
m.closes.localTime();            // "16:40": sunset
m.preferredFrom!.localTime();    // "14:36": Mincha Ketana
m.bedieved.closes!.id;           // "tzeis-8.5": after the fact, to nightfall
```

The windows are last night's Maariv while it is still open after the fact (until dawn), today's
Shacharis and Mincha, Neilah on Yom Kippur and tonight's Maariv. Each has `opens` and `closes` (from
the start), `bedieved` (how far it extends after the fact), `inProgress`, `bedievedInProgress`, and
its `opinion` and `source`; all its times are the person's own zmanim. Neilah's `opens` is `null`:
Luach has no time for "when the sun is on the treetops". `service` is the first window in progress
from the start, else the first in progress after the fact, else `null`.

## Shabbos and Yom Tov: `melachaRunAt`

```ts
import { melachaRunAt } from 'luach';

const run = melachaRunAt(new Date('2028-09-21T16:00:00Z'), newYork);   // Rosh Hashana 5789, Thursday noon
run.days.map((d) => d.date.toString());   // ["5789-7-1", "5789-7-2", "5789-7-3"]: Thursday, Friday, Shabbos
run.days.map((d) => d.candles.id);        // ["candle-lighting", "candle-lighting-second-night", "candle-lighting"]
run.inProgress;                           // true
run.ends.id;                              // "havdala"
// The next edge to show. Check null first: `if (run.inProgress)` would read "unknown" as "not now".
const edge = run.inProgress === null ? null : run.inProgress ? run.ends : run.begins;
```

The run of consecutive days on which melacha is forbidden (Shabbos, Yom Tov, Yom Kippur) that is in
progress, or else the next to begin. It gives the eve and its events, each day with its events and
the candles that begin it, `kinds` (what the run holds: `'shabbos'`, `'yom-tov'`, `'yom-kippur'`,
in that order), `begins` (the first candles) and `ends` (the `havdala` opinion, or
`shabbos-ends-no-havdala` before Tisha B'Av postponed to Sunday). Candle lighting follows the
place's custom or `candleLightingMinutes`, as the day view does.

`inProgress` is true from `begins` to `ends`, false before and after, and `null` exactly when it
depends on a time that does not occur: on the eve's civil date when the candles do not occur; after
the last day's sunset when `ends` does not occur (far north in summer), through the end of the civil
day after the last day; and on the last day's civil date when its sunset does not occur. Luach
gives no time at which the day ends there; set `highLatitudeFallback` to get a time, marked in
`Zman.fallback`. Wherever `inProgress` is not `null` it is what `isMelachaForbiddenAt` says.
Compare with `=== true`, `=== false` and `=== null`: a plain `if (run.inProgress)` treats "Luach has
no time here" as "not Shabbos". The same holds for `fastAt`'s `inProgress`.

It does not say what is said or not said on these days, or what may be prepared from one day for
the next. Israel or the diaspora is chosen as in `isMelachaForbiddenAt`. Past 29 Elul 9999 a run
that would begin on 1 Tishrei 10000 throws a `RangeError`.

## Every time in a range: `timesBetween`

```ts
import { timesBetween } from 'luach';

// Friday's candles and Shabbos's havdala, nothing else:
timesBetween(new Date('2026-11-13T00:00:00Z'), new Date('2026-11-15T00:00:00Z'), newYork, { which: [] })
  .map((x) => `${x.zman.id} ${x.zman.localTime()} (${x.date})`);
// ["candle-lighting 16:21 (5787-9-3)", "havdala 17:22 (5787-9-4)"]

// The zmanim you choose, with the calendar's times, in time order:
timesBetween(from, to, place, { which: ['shema', 'plag', 'chatzosHalayla'] });
```

Every time in `[from, to)` in time order, each with the Hebrew date whose day view gives it: the
zmanim in `which` (slots, opinions or ids, as `Zmanim#between` takes them; by default all the
day's slots; `[]` for none) and the calendar's own times: candle lighting, havdala or the end of
Shabbos, and the start and end of a fast. Times that do not occur are left out.
