# Concepts

## Day numbers

Internally a date is a **day number**: the count of days since 1970-01-01 in the proleptic Gregorian calendar.
It names a calendar date, not an instant, and has no time zone. Convert with `gregorianToDayNumber`,
`dayNumberToGregorian`, `hebrewToDayNumber` and `dayNumberToHebrew`. Most functions accept either a day number or a
`{ year, month, day }` object.

Supported range: Hebrew years 1–9999. Dates before 15 October 1582 use the proleptic Gregorian calendar (the Gregorian
rules extended backwards); the Julian calendar is available through `julianToDayNumber` where a rule needs it
(Shmuel's tekufos).

## Months count from Nisan

Following Shemos 12:2, `NISAN = 1` … `ELUL = 6`, `TISHREI = 7` … `ADAR = 12`, and `ADAR_II = 13`. In a leap year,
month 12 is Adar I. Use the exported constants rather than numbers.

## When the Hebrew date changes

A Hebrew day begins at sunset. `gregorianToHebrew()` gives the Hebrew date of the civil date's *daytime*. For the date at
a particular moment and place, use `hebrewDateAt(instant, location)`, which switches at sunset (or another boundary you
choose).

## Opinions, sources and defaults

Every zman is a `Zman` object:

```ts
{ time: Date | null, opinion: string, source: string, rounded: 'up' | 'down' | 'none', reason?, fallback?, toJSON() }
```

- `time` is `null` when the sun doesn't reach the angle that day; `reason` says why. Luach never invents a time.
- Earliest times ("not before") round **up** to the minute; deadlines ("not after") round **down**. Pass
  `{ rounding: 'none' }` for exact times.
- Times based on the sun's angle are computed at sea level. Sunrise and sunset are at sea level unless you pass
  `{ elevation: true }` (see [Halachic notes](/halacha/opinions#sea-level-and-elevation)).

> Ask your rav. This library calculates; it does not rule.
