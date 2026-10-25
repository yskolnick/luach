# Contributing to Luach

Thank you for helping. Bug reports with a date, a place and the value you expected are the
most useful thing you can send; a wrong zman or date is treated as urgent.

## Ground rules

- **Write it yourself, from sources.** Do not submit code, tables or structure copied or
  adapted from other calendar or zmanim libraries, apps or books, whatever their licence. Work from
  the primary sources: the Rambam, the Shulchan Aruch and its commentaries, named halachic
  works, NOAA and Meeus. Say which source you used in the pull request.
- **Cite every opinion.** A new zman or custom names the opinion it follows and where it is
  written (work, siman, se'if or page). The library does not decide between opinions;
  defaults are conveniences and are documented as such.
- **Test against something independent.** New calculations come with tests, ideally against
  an independent oracle or published tables over many dates and places. Explain every
  difference over a minute.
- **Never invent a time.** When a zman cannot be calculated (the sun never reaches the
  angle), return `null` with a reason.
- **No network, telemetry, `eval` or runtime dependencies** in `src/`.
- By contributing you agree that your contribution is licensed under the Apache License 2.0
  (see `LICENSE`, section 5).

## Setting up

```sh
git clone https://github.com/yskolnick/luach.git
cd luach
npm ci
npm run check      # typecheck, lint, import and licence checks, build, tests, size budgets
```

Useful while working:

```sh
npm test -- test/holidays.test.ts   # one test file
npm run docs:dev                    # the documentation site, locally
```

`AGENTS.md` describes how the project is organised; `ROADMAP.md` lists what is built and
planned.

## Pull requests

- One topic per pull request; keep commits small, each one passing `npm run check`.
- Add a line to `## Unreleased` in `CHANGELOG.md` for anything a user would notice.
- If you change behaviour or add an option, document it where the option is defined and in the guide.
- CI must be green before a merge. Do not skip or delete a test to get there.
