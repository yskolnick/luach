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
5. **Nothing private in this repo.** No decisions, logs, discussions, conversation records,
   rationale notes, decision numbers, personal data, secrets, tokens or session links: not in
   files, comments, commit messages or pull requests. Every conversation, log entry,
   decision, rationale note and architecture record always goes in the owner's private
   records repository, `luach-records`, and nowhere else. Research notes here hold sources
   and findings only.
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
