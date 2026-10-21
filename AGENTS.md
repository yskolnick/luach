# Rules for agents working on Luach

Luach is a free Hebrew calendar and zmanim library (npm `luach`), Apache-2.0, owned by Yosef Skolnick.
Read `ROADMAP.md`, `DECISIONS.md` and the latest entry in the private records repo's `LOG.md` before you start.

## Licence hygiene (clean room)
- Never copy code, tables or structure from hebcal (GPL), KosherJava / kosher-zmanim (LGPL), KosherCocoa, or the code of *Calendrical Calculations*.
- Algorithms are facts; implement them from primary or public-domain sources: the Rambam (Hilchos Kiddush HaChodesh), the NOAA Solar Calculator, Meeus (method only), named halachic works.
- GPL/LGPL libraries may be devDependencies **used only as test oracles**. Nothing in `src/` imports a devDependency (`npm run check:licenses` enforces this).
- Runtime dependencies: none. Adding one needs a permissive licence and an ADR.
- Every dataset and its licence goes in `docs/data-sources.md`.

## Accuracy
- A wrong zman or Yom Tov is worse than a missing one. Every feature has tests against an independent oracle or hand-entered published values (with their source).
- When a zman cannot be computed, return `time: null` with a reason. Never invent a time.
- Time zones only through IANA ids (Intl or a caller-supplied provider). Never derive a "standard offset".
- A red test is never skipped or deleted to get green.

## Halacha
- The library calculates; it does not rule. Every zman names its opinion and source. Defaults are documented as defaults, never as "the" time.
- Every citation must be checked. Unverified citations are marked `(unverified)`.

## Code
- TypeScript, ESM, no runtime deps, no `class` syntax (the Hermes CLI used in CI lacks it), no `eval`, no network, no telemetry.
- Small pure functions; tree-shakable; `sideEffects: false`.
- Run `npm run check` before every commit: typecheck, lint, tests, build, Hermes, licence check, size budget.

## Process
- Yosef decides. Suggestions are proposals (P-nn) or questions (Q-nn) with a default; continue on the default.
- A Decided entry (D-nn) quotes Yosef's own words. Anything nobody chose is marked **As built**.
- `DECISIONS.md`: add and supersede, never rewrite. Architecture/tooling/dependency/licence choices also get an ADR in `docs/decisions/`.
- Private things (session links, conversation text, Yosef's email, his other projects) go only in `yskolnick/luach-records`, never here.
- No secrets, tokens, model names or model identifiers in commits, docs or code.
- Every working session leaves a LOG entry in the records repo; list unmerged branches there and in Q-00.
