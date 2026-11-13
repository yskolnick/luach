# JSON, iCal and the command line

## Which output for which job

| You are building | Use | Read |
|---|---|---|
| A JavaScript app | the functions: `Zmanim`, `hebrewDateSpanAt`, `melachaRunAt`, … | [Zmanim](./zmanim.md), [At this instant](./at-this-instant.md) |
| A server, or an app in another language | `dayInfo` (a day) or `nowInfo` (an instant) as JSON, each with a schema; or run `examples/server` | [One call per day](#one-call-per-day), [Everything at an instant](#everything-at-an-instant-nowinfo), [Your own API](#your-own-api) |
| A home-automation platform, or a display | `/now` from `examples/server`, read by a REST sensor | `examples/home-assistant` in the repository |
| A calendar | iCal | [iCal](#ical) |
| A person, or a shell script | the `luach` command; `--json` for a script | [Command line](#command-line) |

## One call per day

`dayInfo(date, options)` returns a plain JSON object with everything about the day: Hebrew
date, events, parsha and haftara, Omer, tefillah changes, learning (when you pass it, see below),
and (with a `location`) zmanim, candle lighting, havdala and fast times. Its shape is described by a
[JSON Schema](https://raw.githubusercontent.com/yskolnick/luach/v0.5.0/schema/day.schema.json),
which ships in the package as `luach/schema/day.schema.json`; each object's `$schema` is that
URL (`DAY_INFO_SCHEMA_ID`).

The learning (daf yomi and the other cycles) is not part of the main import, so a day view without
it keeps your bundle small: `learning` is `null`. To include it, pass the plug-in from
`luach/learning`; `nowInfo` takes the same option and passes it to its `day`:

```ts
import { dayInfo, en } from 'luach';
import { dayLearning } from 'luach/learning';

dayInfo(date, { location, learning: dayLearning, locale: en }).learning; // { dafYomi: "Bekhorot 33", ... }
dayInfo(date, { location }).learning;                                    // null
```

`erev` says whether the day is an eve: an array, usually empty, of `{ id, name }` with `id`
`erev-shabbos`, `erev-yom-tov` or `erev-yom-kippur` and `name` the everyday word in your `locale` (see
[Names](./names.md)). It is a fact about the civil day, not about an instant. The day is an eve
when it is not itself Shabbos or a Yom Tov on which melacha is forbidden (Yom Kippur counts), and
the next day is Shabbos (`erev-shabbos`) or such a Yom Tov for the day's Israel or diaspora
setting (`erev-yom-tov`). Both can apply, `erev-shabbos` first: the Friday before a Yom Tov that
falls on Shabbos. The eve of Yom Kippur has `erev-yom-kippur` only, never `erev-yom-tov` (the
sources name that day "Erev Yom Kippur"), named as the day's own event is; when Yom Kippur falls
on Shabbos, `erev-shabbos` comes first. A day that is itself Shabbos or Yom Tov gets an empty array even when another
holy day follows; that case is left out. It is separate from the `erev` flag on a holiday event
(the eve of Pesach, say), and from the candle lighting, which `candleLighting` gives. On the
command line, `luach today` and `luach date` print the name under the weekday line.

The day's own kind is in four fields, so a reader need not scan `events[].flags`: `shabbos`;
`yomTov` (one of the day's events is a Yom Tov where it is kept; Yom Kippur counts);
`melachaForbidden` (Shabbos, Yom Tov or Yom Kippur); and `fastKind` (`'major'`, `'minor'` or
`null`). `followedBy` says what the next day is on every day, including a day that is itself holy:
`'shabbos'`, then `'yom-kippur'` or `'yom-tov'`. Shavuos on a Friday in the diaspora has
`erev: []` and `followedBy: ['shabbos', 'yom-tov']`.

Each event has `begins`: `'sunset'` (the evening before, as every Hebrew day begins, so Purim
begins with the Megillah at night) or `'dawn'` for a minor fast. Rosh Chodesh, Shabbos Mevorchim
and Yom Kippur Katan also carry `month` and `monthYear`, the month concerned.

Candle lighting is the usual time before sunset when Shabbos or Yom Tov begins, including a
Yom Tov that falls on Friday (Shabbos begins at sunset, Shulchan Aruch OC 261:2); it is after
nightfall (`candle-lighting-second-night`) only when a Yom Tov night follows Shabbos or Yom
Tov (Shulchan Aruch OC 503:1). When Tisha B'Av falls on Shabbos and the fast is on Sunday,
the Shabbos has `havdala: null`, `shabbosEnds` (the end of Shabbos, when melacha is permitted
after saying "Baruch HaMavdil bein kodesh lechol"; Mishnah Berurah 556:2) and
`fastBeginsTonight` (sunset); the Sunday's `havdala` is over a cup when the fast ends
(`havdala-after-fast`, Shulchan Aruch OC 556:1). `fastBeginsTonight` is also set on the eve
of Yom Kippur and of Tisha B'Av.

## Everything at an instant: `nowInfo`

`dayInfo` answers about a day. A display, a Shabbos clock or a home-automation platform asks about
the moment: is melacha forbidden now, until when, when are the next candles, what is tonight's Omer
count. After sunset the Hebrew date has moved on, a run of holy days spans several days, and the
answer depends on the instant, not the date. `nowInfo(instant, place, options)` answers all of it as
one plain JSON document, from one instant, so its parts agree with each other.

```ts
import { nowInfo, en } from 'luach';
import { getPlace } from 'luach/places';

const now = nowInfo(new Date('2026-10-23T15:00:00Z'), getPlace('jerusalem')!, { locale: en });
now.clock;                       // { date: "2026-10-23", time: "18:00:00", weekday: 5, timeZone: "Asia/Jerusalem", … }
now.hebrewDate.formatted;        // "13 Heshvan 5787": the Hebrew date now, Shabbos, though the clock says Friday
now.day.candleLighting?.local;   // "17:18": the civil day is still Friday, with tonight's candles
now.melacha.inProgress;          // true
now.melacha.begins.local;        // "17:18": the candles (Jerusalem's custom is 40 minutes before sunset)
now.melacha.ends.local;          // "18:35": havdala, on Saturday evening
now.melacha.ends.time;           // "2026-10-24T15:35:00.000Z": the minute shown, rounded on the safe side; `exact` is the instant
```

The instant is a `Date`; over HTTP or on the command line it is an ISO 8601 string with an explicit
offset (`Z` or `+hh:mm`), because a string without one would be read in the server's or the
computer's zone. `options` are the zmanim options (`opinions`, `candleLightingMinutes`, `israel`, the holiday
options, …) and `locale` for the names; the default locale is Hebrew, as in `dayInfo`. The shape is
described by a [JSON Schema](https://raw.githubusercontent.com/yskolnick/luach/v0.5.0/schema/now.schema.json),
which ships as `luach/schema/now.schema.json`; the `day` part is the
[day schema](https://raw.githubusercontent.com/yskolnick/luach/v0.5.0/schema/day.schema.json), which a
validator needs alongside it. Every zman, event and Hebrew date in the document has one shape, and
every zman names its opinion and source.

### Validating

Register the day schema before the now schema (the now schema refers to it by its `$id`). Validate
with the schemas shipped in the package version you use (`luach/schema/now.schema.json` and
`luach/schema/day.schema.json`), not with a copy of another version: a minor version can add
fields, and the schemas are closed, so an older schema rejects them.

### The `location` is for display

The `location` in `dayInfo` and `nowInfo` shows the place (name, coordinates, elevation, time
zone). It does not carry the place's own candle-lighting custom or its id: a document built from it
alone would compute 18 minutes for Jerusalem. To compute for the same place again, keep the
`Place` object (or its id and look it up), not the JSON. `nowInfo`'s `settings` says which minutes
and custom were in force.

### Where each answer is

| The question | The path |
|---|---|
| Is melacha forbidden now? `true`, `false`, or `null` | `melacha.inProgress` |
| When do the candles and the havdala fall; when does this run begin and end | `melacha.begins`, `melacha.ends` |
| Which days is the run, what is each, which candles begin each | `melacha.eve`, `melacha.days[]` (`date`, `hebrewDate`, `shabbos`, `events`, `candles`) |
| Is a fast on, or the next one today or tomorrow | `fast`: `null`, or `event`, `hebrewDate`, `inProgress`, `begins`, `ends` |
| The place's clock: date, time, day of the week, offset | `clock` |
| The Hebrew date now, and when it began and changes | `hebrewDate`, `hebrewDate.begins`, `hebrewDate.ends` |
| Everything about today at the place (the civil day): holidays, parsha, haftara, Omer, tefillah, learning, zmanim, tonight's candles and havdala, today's fast | `day` (the whole [day JSON](#one-call-per-day)) |
| What the answers follow: the opinions in force, the candle-lighting minutes, the other settings | `settings` |
| Until when the document is good: ask again at this instant | `validUntil` |
| What is counted and lit: the night in progress, and the coming night | `night`, `nextNight`: `hebrewDate`, `sunset`, `tzeis`, `alos`, `sunrise`, `omer`, `chanukahLights`, `chanukahLighting` |
| What comes next, in order, for a countdown or timeline | `upcoming[]`: `zman`, `hebrewDate` |
| The next zman of the day, by the user's opinions (by the exact time) | `nextZman` |
| Kiddush Levana: the month, the molad, four named times | `kiddushLevana` |
| The place, and Israel or the diaspora | `location`, `israel` |

There is no "erev" or "motzei" flag. When "erev" starts, and when a Motzaei Shabbos scene may run,
is a choice; the document gives the instants and the reader compares them.

### Where two paths overlap

- **`day` is the place's civil day (`clock.date`), not the Hebrew date now.** It is what a luach
  page shows for today: today's zmanim, tonight's `candleLighting` and `havdala`, today's `fast`.
  So on Friday after sunset `day` is still Friday, with the candles just lit, and `hebrewDate` is
  already Shabbos; on Motzaei Shabbos before havdala `day.havdala` is tonight's and
  `melacha.inProgress` is `true`; on a fast day after sunset `day.fast` is the fast and
  `fast.inProgress` is `true` until it ends. Its `candleLighting`, `havdala` and `shabbosEnds` are
  that day's evening; `melacha.begins` and `melacha.ends` are those of the run, which may be days
  apart. For the Hebrew date now, which changes at sunset, use `hebrewDate`; for its own day view,
  `dayInfo` of that date.
- **`night` and `nextNight` are the night of the Hebrew date now, and the one after it.** Once the
  Hebrew date has begun (after its boundary, sunset by default) `night` is the night in progress:
  at 21:00 in New York on 3 May 2027 `night.omer` is the count being made and `nextNight.omer` is the
  next evening's. During the day `night` is last night, and `nextNight` is the night that begins
  this evening, so "what is counted tonight" is `night` while the night lasts and `nextNight`
  after it. When a night ends (at dawn, at sunrise) is the reader's choice: each night carries its
  `sunset`, `tzeis`, `alos` and `sunrise` to compare with. `day.omer` is the count of the civil
  day's date. `nextNight.chanukahLights` equals the `candlesTonight` of the Chanukah event of the
  Hebrew date now (`hebrewDate`), `null` where that is 0 or absent.
- **`chanukahLighting` says when the Chanukah lights may first be lit, by custom.** It is `null`
  outside Chanukah (when `chanukahLights` is `null`). Otherwise it has `lights`, `evening`
  (`weekday`, `erev-shabbos` or `motzaei-shabbos`), `custom` (the custom in force, `sunset` or
  `tzeis`), `isDefault`, `customs` (each with an `id`, `sunset` or `tzeis`, the `earliest` time,
  and its `opinion` and `source`), `earliest`, `before` and `until`. `earliest` is the time of the
  custom in force. When you set none, nightfall is Luach's default (`custom` is `tzeis` and
  `isDefault` is `true`; `settings.chanukahLighting` and `settings.chanukahLightingIsDefault` say
  the same), a default and not a ruling; `customs` lists both either way.
  On Erev Shabbos `earliest` is plag hamincha and `before` the Shabbos candle lighting; on Motzaei
  Shabbos `earliest` is when Shabbos ends. `until` is the dawn of the morning after. See
  [At this instant](./at-this-instant.md).
- **`upcoming` is every calendar time after the instant, to the end of the seventh civil day after
  it.** Seven days always hold the next Shabbos. It contains `melacha.begins` and `melacha.ends`
  when they fall in that span, and the fast's `begins` and `ends` likewise.
- The Hebrew date's own times are `hebrewDate.begins` and `hebrewDate.ends`.
- **After local midnight `day` is the new civil day.** It may not hold the havdala of a run that
  ended after midnight (far north in summer) or the end of a fast that runs past it. The ends of
  the run and of the fast in the document are always `melacha.ends` and `fast.ends`: use them, not
  `day.havdala` or `day.fast`, for "until when".
- **`validUntil`** is the earliest instant after `instant` at which anything in the document
  changes: the exact times of `melacha.begins` and `ends`, `fast.begins` and `ends`,
  `hebrewDate.ends`, `nextZman`, the first of `upcoming`, the sunset of the run's last day, the turn
  of the Kiddush Levana month, and the start of the next civil day. A sensor, a widget timeline or a cache asks again then.
- **A zman's `local` is the wall-clock time only** (HH:MM, no date). A time can fall on another
  civil day than the one asked about (a fast that ends at 00:04, candles after midnight far north),
  so compare `time`, the instant, and take the date from it in the place's zone.

### `null` means "no time", never "off"

Far north in summer the sun may not reach the angle a time is defined by, and Luach does not make
up a time. Then a time is `{ time: null, … , reason }`, and a state that needs it is `null`:
`melacha.inProgress` and `fast.inProgress` are `true`, `false` or `null`. Compare with `=== null`
first; a plain `if (now.melacha.inProgress)` treats "Luach has no time here" as "not Shabbos". Show
"unknown", or make the entity unavailable; never "off".

`nowInfo` throws a `RangeError` for an invalid instant, and in the last two weeks of year 9999 (the
last supported date is 29 Elul 9999), where tonight, the next run or the next month's Kiddush Levana
falls in year 10000. It decides nothing: ask your rav.

### Smaller JSON: `compactJson`

Each time in a document carries its opinion and source, so it can be shown on its own. Where the
same times repeat (a `nowInfo` document, or many days), `compactJson` states each opinion and source
once, in a `sources` table by zman id, and leaves out each time's `timeZone` (the location's):

```ts
import { compactJson, dayInfoRange } from 'luach';

const month = compactJson({ days: dayInfoRange(start, 30, { location }) }); // about 40% smaller
month.sources['sunrise']; // { opinion: 'Sunrise (netz hachama), at sea level', source: '…' }
```

The full documents are unchanged; both forms are described by the same schemas.

### Learning as data

With `learning: dayLearning`, a day has `learning` (the text of each cycle) and `learningDetail`:
the same cycles as data, with the cycle, its number, the day within it and its length, and for daf
yomi the tractate and the daf (`dayLearningDetail` from `luach/learning` gives it on its own).

### Newer fields

The schemas let a reader ignore fields it does not know: a later version may add fields, and a
document from it still validates against an earlier schema.

## iCal

```ts
import { toICalendar } from 'luach';
import { getPlace } from 'luach/places';
import { icalLearning } from 'luach/learning';
const ics = toICalendar({ year: 2026, month: 9, day: 1 }, { year: 2027, month: 8, day: 31 }, {
  location: getPlace('london'), learning: icalLearning(['dafYomi']),
});
```

## Command line

```sh
npx luach today --city lakewood
npx luach now --city jerusalem               # the moment: Hebrew date, melacha now and until when, fast, the night, what is next
npx luach now --city jerusalem --json        # the nowInfo document, for a script
npx luach zmanim 2027-03-14 --lat 40.08 --lon -74.21 --tz America/New_York --all
npx luach holidays 5787 --israel
npx luach convert "14 Adar II 5787"
npx luach ics 2026-09-01 2027-08-31 --city london > luach.ics
```

## Your own API

`examples/server/` in the repository: a few lines with Node's built-in `http` that serve
`/day` as JSON, `/now` (the `nowInfo` document, for a place and an optional `at` instant and
`opinions`) and `/calendar.ics`. `examples/home-assistant` in the repository
has Home Assistant sensors that read `/now`.
