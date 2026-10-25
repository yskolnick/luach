# Working on Luach

Luach is a clean-room Hebrew calendar and zmanim library. Read this and `ROADMAP.md` before
starting.

## Rules

1. **Clean room.** Never copy code, tables or structure from hebcal, KosherJava,
   kosher-zmanim, KosherCocoa or *Calendrical Calculations*. Implement from the Rambam,
   NOAA, Meeus (the method) and named halachic works. GPL/LGPL libraries are
   devDependencies used only as test oracles; `src/` imports nothing.
   `npm run check:imports` and `npm run check:licenses` enforce this.
2. **Accuracy first.** Every feature ships with tests against an independent oracle.
   Never return a made-up time: return `null` with a reason.
3. **The library rules on nothing halachic.** Every zman names its opinion and source.
   Defaults are documented as defaults. "Ask your rav. This library calculates; it does not rule."
4. **Privacy.** No network, telemetry, `eval` or dynamic code in `src/`.
5. **What is public here, and what is not.** This repo is the release: the code, the
   sources, and the halachic choices and calculations, so others can see what is there, ask
   about it and correct it (`docs/halacha/choices.md`, `docs/halacha/zmanim.md`,
   `docs/sources.md`, `docs/accuracy.md`, research notes with their sources). Each choice is
   stated as what Luach does, why, its sources, what it was checked against, how confident
   the reasoning is, and what is open. Nothing else: no conversations, logs, project or
   process decisions, decision numbers, quotes of the owner, personal data, secrets, tokens
   or session links, in files, comments, commit messages or pull requests. Those always go in
   the owner's private records repository, `luach-records`, which also holds a full copy of
   everything here.
6. **Sources.** Research goes in `docs/research/YYYY-MM-DD-topic.md` with sources; datasets
   in `docs/data-sources.md`.
7. **Small green commits,** a branch per milestone, PR, merge when CI is green.
   Never skip or delete a failing test to get green.
8. **Never publish to npm.** The owner publishes (`RELEASING.md`).

## Commands

```sh
npm ci
npm run check      # typecheck, lint, import + licence checks, tests, build, size budget
npm test           # tests only
```
