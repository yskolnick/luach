# Contributing to Luach

Thank you for helping. Luach is used to decide when to pray and when Shabbos begins, so accuracy comes first.

## Ground rules

- **Clean room.** Don't copy code, tables or structure from hebcal, KosherJava, kosher-zmanim, KosherCocoa, or the code of
  *Calendrical Calculations*. Implement from primary sources (the Rambam, the Shulchan Aruch and its commentaries, the
  NOAA equations, Meeus) and cite them. Copyleft libraries may be used only as test oracles (see
  `docs/decisions/0003-test-oracles.md`).
- **Sources.** Every halachic rule names its source (book, siman, se'if). If you couldn't check the text, write
  "(unverified)".
- **No ruling.** Luach offers opinions; callers choose. Add a new opinion as its own named function or option, never as a
  silent change to a default.
- **No made-up times.** When something can't be computed, return null with a reason.
- **No runtime dependencies, no network, no `eval`, no `class` syntax** (the Hermes test build lacks it).

## Workflow

```sh
npm ci
npm run check        # what CI runs on every push
npm run test:oracle  # the long comparisons; run before touching calendar, holiday, parsha or zmanim logic
```

1. Write the test first: against an oracle, or against values from a published luach entered by hand with their source.
2. Implement.
3. Update `ROADMAP.md`, the docs, and `DECISIONS.md` if you made a choice someone should know about.
4. Open a pull request. Small, green commits.

## Reporting a wrong time or date

Use the "Wrong time or date" issue form: give the date, place, the opinion, what Luach says, and what your source says
(name the luach or posek). We compare, and either fix it or explain the difference in the accuracy report.

## Data

Every dataset and its licence is listed in `docs/data-sources.md`. Only add data you are allowed to redistribute.
