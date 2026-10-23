# Working on Luach

Luach is a clean-room Hebrew calendar and zmanim library owned by Yosef Skolnick.
Read this, `ROADMAP.md`, `DECISIONS.md` and the latest entry in `LOG.md`
before starting.

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
5. **Yosef decides.** Proposals go in `DECISIONS.md` as P-nn with a default; questions as
   Q-nn. A *Decided* entry states the decision; his own words, quoted, go in the private
   records repo (`DECISIONS-private.md`). Mark unchosen behaviour *As built*.
6. **Records.** Every decision lands in `DECISIONS.md` in the same commit as the work;
   tooling/dependency/licence choices also get an ADR (`docs/decisions/`). Research goes in
   `docs/research/YYYY-MM-DD-topic.md` with sources; datasets in `docs/data-sources.md`.
   Each session updates the public `LOG.md` with what changed, what was decided and what is
   open. How the work was done (sessions, conversations, quotes, branch housekeeping,
   mistakes along the way) goes only in the private records repo.
7. **No secrets, tokens, session links or personal data** in this repo. Commit messages
   name the model that wrote the change (`Co-Authored-By:`) and may name the model that
   checked it (D-02); nothing else names a model.
8. **Small green commits,** a branch per milestone, PR, merge when CI is green.
   Never skip or delete a failing test to get green.
9. **Never publish to npm.** Yosef publishes (`RELEASING.md`).

## Commands

```sh
npm ci
npm run check      # typecheck, lint, import + licence checks, tests, build, size budget
npm test           # tests only
```
