# Contributing to Luach

Thank you for helping. Reports with a date, a place and the value you expected are the most
useful thing you can send; a wrong zman or date is treated as urgent.

## How to help

- **A wrong result:** open a "Wrong result" issue with the date, the place (or coordinates and
  time zone), the function you called, what Luach gave and what you expected, and where the
  expected value comes from.
- **A question about a source or a halachic choice:** open a "Question about a source" issue.
  Every choice is explained in [`docs/halacha/choices.md`](docs/halacha/choices.md) and every zman's
  source in [`docs/halacha/zmanim.md`](docs/halacha/zmanim.md).
- **A missing opinion, custom or feature:** open a "Feature" issue, and say which work, siman
  and se'if (or page) it comes from.

## Ground rules for code

- **Write it yourself, from sources.** Do not submit code, tables or structure copied or
  adapted from other calendar or zmanim libraries, apps or books, whatever their licence. Work
  from the primary sources: the Rambam, the Shulchan Aruch and its commentaries, named halachic
  works, NOAA and Meeus. Say which source you used.
- **Cite every opinion.** A new zman or custom names the opinion it follows and where it is
  written. The library does not decide between opinions; defaults are conveniences and are
  documented as such.
- **Never invent a time.** When a zman cannot be calculated (the sun never reaches the
  angle), return `null` with a reason.
- **No network, telemetry, `eval` or runtime dependencies** in `src/`.
- By contributing you agree that your contribution is licensed under the Apache License 2.0
  (see `LICENSE`, section 5).
