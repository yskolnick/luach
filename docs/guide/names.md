# Names and name sets

Every name Luach shows (months, weekdays, holidays, parshiyos, zmanim and the everyday words
such as Shabbos and Havdala) comes from a name set, called a locale. Pass one to the function
that formats the name:

```ts
import { holidayName, monthName, termName, ashkenazi, sephardi } from 'luach';

monthName(10, 5786, ashkenazi); // "Teves"
monthName(10, 5786, sephardi); // "Tevet"
termName('shabbos', ashkenazi); // "Shabbos"
termName('shabbos', sephardi); // "Shabbat"
```

The names follow Luach's own convention. Where a set has no name of its own for something, it
uses the name from the set it is based on. Luach does not guess a name: a name is added to a
set only from a written source.

## The sets

| Set | Based on | Direction | Numerals | What it is |
|---|---|---|---|---|
| `he` | itself | right to left | Hebrew letters | Hebrew |
| `ashkenazi` | itself | left to right | digits | Ashkenazi transliteration: Teves, Shabbos, Sukkos |
| `sephardi` | itself | left to right | digits | Sephardi transliteration: Tevet, Shabbat, Sukkot |
| `en` | itself | left to right | digits | Conventional English: Passover, Hanukkah |
| `chabad` | `ashkenazi` | left to right | digits | Chabad spellings |
| `israeli` | `sephardi` | left to right | digits | Modern Israeli spellings |
| `yi` | `he` | right to left | Hebrew letters | Yiddish, in Hebrew letters |

`chabad`, `israeli` and `yi` currently follow their base set, except where listed below: every
name in them is the base set's name, and none has an override yet. Names are added to them only
from a written source, so the list below grows as sources are found. `yi` writes months,
holidays and parshiyos with the Hebrew spellings, because Yiddish keeps the traditional
spelling of words of Hebrew and Aramaic origin; the weekday names and the everyday words that
`he` does not name in Hebrew letters are those of `he` for now.

## The everyday words: `termName`

`termName(key, locale)` gives the everyday words that are not dates or zmanim. The locale
defaults to `he`, as the other name functions do.

| Key | Meaning |
|---|---|
| `shabbos` | Shabbos |
| `motzaei-shabbos` | The night after Shabbos |
| `yom-tov` | Yom Tov |
| `shacharis`, `mincha`, `maariv`, `musaf` | The services |
| `sefiras-haomer` | The counting of the Omer |
| `menorah` | The Chanukah menorah |
| `parshas` | The word before a parsha's name in the calendar file ("Parshas Bereshis") |
| `parsha` | The word "Parsha" in the command line's day text |
| `omer` | The word "Omer" in the command line's day text |
| `erev-shabbos` | The eve of Shabbos |
| `erev-yom-tov` | The eve of a Yom Tov |
| `motzaei-yom-tov` | The night after a Yom Tov |

`termName('havdala', locale)` and `termName('candle-lighting', locale)` also work, but they are not
separate words: each has one name, the zman's. They give the name of `zman.havdala` and
`zman.candle-lighting`, so a change to that key shows wherever the word appears, in the calendar
file and the command line text too. They are listed once, under the zmanim, not among the everyday words.

```ts
termName('mincha', ashkenazi); // "Mincha"
termName('mincha', he); // "מנחה"
termName('sefiras-haomer', sephardi); // "Sefirat HaOmer"
```

A word comes from the locale's own `names` first (the key is `term.<key>`, for example
`term.shabbos`), then from its `fallback` locales, then from the table of its base set, then from
the next set in this order: `he`, `sephardi` and `en` fall back to `ashkenazi` (`en` by way of
`sephardi`). A word that no table has comes back as its key, `term.<key>`, as the other name
functions do.

### Which set has which word

In `he` (and so `yi`), יום טוב, מוסף, ספירת העומר, מנורה, פרשה and עומר are plain Hebrew chosen for Luach, no
written source yet.

A dagger (†) marks a word the set does not name itself and shows from another set, as described
above. `chabad`, `israeli` and `yi` show exactly what their base set shows.

| Key | `he` | `ashkenazi` | `sephardi` | `en` |
|---|---|---|---|---|
| `shabbos` | שבת | Shabbos | Shabbat | Shabbat † |
| `motzaei-shabbos` | מוצאי שבת | Motzei Shabbos | Motzei Shabbos † | Motzei Shabbos † |
| `yom-tov` | יום טוב | Yom Tov | Yom Tov | Yom Tov † |
| `shacharis` | שחרית | Shacharis | Shacharis | Shacharis † |
| `mincha` | מנחה | Mincha | Mincha | Mincha † |
| `maariv` | ערבית | Maariv | Maariv | Maariv † |
| `musaf` | מוסף | Musaf | Musaf | Musaf † |
| `sefiras-haomer` | ספירת העומר | Sefiras HaOmer | Sefirat HaOmer | Sefirat HaOmer † |
| `menorah` | מנורה | Menorah | Menorah | Menorah |
| `parshas` | פרשת | Parshas | Parshas † | Parshas † |
| `parsha` | פרשה | Parsha | Parsha † | Parsha † |
| `omer` | עומר | Omer | Omer † | Omer † |
| `erev-shabbos` | ערב שבת | Erev Shabbos | Erev Shabbat | Erev Shabbat † |
| `erev-yom-tov` | ערב יום טוב | Erev Yom Tov | Erev Yom Tov | Erev Yom Tov † |
| `motzaei-yom-tov` | מוצאי יום טוב | Motzei Yom Tov | Motzei Yom Tov † | Motzei Yom Tov † |

The eve of Shabbos and the eve of a Yom Tov appear in the day view as `erev` (see
[Outputs](./outputs.md)), named from these words, so changing `term.erev-shabbos` or
`term.erev-yom-tov` changes what that field and the command line's day text show. The night after
a Yom Tov (`motzaei-yom-tov`) is a word you can name; Luach does not show it in its own output.
Holidays and their eves have their own names, which `holidayName` gives; the eve of Yom Kippur appears in `erev` under that name (`erev-yom-kippur`), not as the eve of a Yom Tov.

## Changing a name

Start from any set with `extendLocale` and give the key the name you want. Your names win over
the set's:

```ts
import { ashkenazi, extendLocale, monthName, termName } from 'luach';

const mine = extendLocale(ashkenazi, {
  'term.shabbos': 'Shabbes',
  'month.10': 'Tevet',
});

termName('shabbos', mine); // "Shabbes"
monthName(10, 5786, mine); // "Tevet"
termName('mincha', mine); // "Mincha" (from ashkenazi)
```

A locale is a plain object, so you can also write one from scratch; give it a `base` and
holidays, parshiyos and zmanim that it does not name are found in that base set's tables.
See [Right-to-left text](./rtl.md) for the Hebrew sets.

## Change any name

Every name Luach gives can be changed one at a time, within the set you chose.
`nameEntries(locale)` lists them all, each with its key, its group and the name the set gives now.
Show that list on a settings screen, save what the person changes as `{ key: name }`, read it back
with `parseNames` and apply it with `extendLocale`:

```ts
import { ashkenazi, extendLocale, nameEntries, parseNames, termName } from 'luach';

// 1. The screen: one row per name, grouped.
const rows = nameEntries(ashkenazi); // [{ key: 'term.shabbos', group: 'term', name: 'Shabbos', changed: false }, ...]
rows.filter((r) => r.group === 'term').map((r) => `${r.key}: ${r.name}`);

// 2. Save only what the person changed.
const saved = JSON.stringify({ 'term.shabbos': 'Shabbes', 'month.10': 'Tevet' });

// 3. Read it back. Never throws; keeps every valid name and reports the rest.
const parsed = parseNames(JSON.parse(saved));
if (!parsed.ok) console.warn(parsed.problems); // [{ key, value, problem }, ...]

// 4. Use it everywhere a name is shown.
const mine = extendLocale(ashkenazi, { ...parsed.value });
termName('shabbos', mine); // "Shabbes"
nameEntries(mine).filter((r) => r.changed).map((r) => r.key); // ["month.10", "term.shabbos"]
```

An entry is `{ key, group, name, changed }`. `changed` is true when the name differs from the
built-in set the locale is based on. The groups and their keys, in the order `nameEntries` lists
them:

| Group | Keys | Count |
|---|---|---|
| `month` | `month.1` to `month.12` (Nisan first, as Luach numbers months), then `month.12.leap` (Adar I) and `month.13.leap` (Adar II) | 14 |
| `weekday` | `weekday.0` (Sunday) to `weekday.6` (Shabbos) | 7 |
| `holiday` | `holiday.<id>`, or `holiday.<id>.<day>` for one day of a holiday | 80 |
| `zman` | `zman.<id>`, one for each zman in the catalogue | 96 |
| `parsha` | `parsha.<id>` in reading order, then `parsha.join`, the separator of a double reading | 55 |
| `term` | `term.<key>`, the everyday words above | 15 |

In a leap year `month.12.leap` and `month.13.leap` name the two Adars; in other years `month.12`
names Adar. A holiday name may hold `{n}` (the day's number) and `{month}`; keep them in the
name where the number or the month should appear. Names are text without line breaks or other
control characters, and may not be empty.

`parseNames` takes the parsed JSON, not the string. Keys it does not know, values that are not text,
empty values, values with control characters and values that drop a placeholder the name has
(`{n}`, `{month}`) or add one it does not are left out of `value` and listed in `problems`.
`term.havdala` and `term.candle-lighting` are also reported, with the zman key to use instead.

The command line takes the same JSON as `--names '<json>'` (with `--locale`), and the example
server as a `names` query parameter; both answer with the problems when a name cannot be used.

*Ask your rav. This library calculates; it does not rule.* Which spelling a community uses is
its own custom; Luach offers the sets above and lets you change any name.
