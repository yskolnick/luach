# Decisions

Rulings (D-nn) quote Yosef's own words. Open questions (Q-nn) say what happens until they are answered.
Proposals (P-nn) say why and what the default is. Entries are added and superseded, never rewritten.
Anything the code does that nobody chose is marked **As built** (see the end of this file).

## Q-00. Unmerged branches (kept current)

| Branch | Repo | State |
|---|---|---|
| `claude/exciting-clarke-64dzwd` | luach | Development branch for M1 onward; PR to `main` opened for Yosef to merge (Q-04) |
| `claude/exciting-clarke-64dzwd` | luach-records | Private records; Yosef merges |

## Decided

### D-01. The name is Luach
- Yosef: "use luach".
- npm package `luach`, repo `yskolnick/luach`. The name was free on npm on 2026-10-21 (`npm view luach` returned 404).
- An unrelated package, `luach-picker`, exists; the README says how Luach differs.

### D-02. No demo app in this run; Luach is a package for other apps
- Yosef: "Expo isn't part of this run.  We want a tool that someone else can run as a package the same way people use hebcal.  This should be able to be used in other apps with appropriate credit given etc and in my own apps"
- Consequence: the Expo demo app (brief M7) is removed from this run. The demo is the CLI, the examples in `examples/`, and the docs site.

### D-03. Keep a Hermes test run
- Yosef asked "why do we need a hermes?". After the explanation (React Native's engine; time-zone `Intl` gaps) and the choice "keep it or drop it", Yosef replied: "ok".
- Read as: keep it. If that reading is wrong, see Q-10.

## Open questions

### Q-01. Licence: Apache-2.0 with NOTICE (P-01), or MIT
- Until decided: Apache-2.0 with NOTICE.
- Note: no standard open-source licence can force credit inside an app's UI. Apache-2.0 requires redistributors to carry the NOTICE text, which is the closest standard licence to "give us credit". MIT only requires keeping the copyright line.

### Q-02. How credit should read
- Until decided: "Built on Luach by Yosef Skolnick" in NOTICE and in the README's "How to credit".

### Q-04. Branch and PR model
- The working session is pinned to the branch `claude/exciting-clarke-64dzwd`. The brief asks for a branch per milestone, merged when CI is green.
- Until decided: all work on `claude/exciting-clarke-64dzwd`, one PR to `main`, Yosef merges. (Proposed to Yosef as the default; his reply "ok" may cover it.)

### Q-05. Commit attribution
- Until decided: public commits carry no model names and no session links; session links live only in the private records repo.

### Q-07. Oracle tests as a separate CI job
- The daily zmanim comparison (4 years x 19 cities x every opinion) is slow.
- Until decided: `npm test` runs unit and property tests; `npm run test:oracle` runs the oracle comparisons, as its own CI job.

### Q-08. Visible netz
- Visible sunrise needs terrain (horizon) data, which coordinates alone don't give.
- Until decided: no "visible netz"; sunrise functions accept a caller-supplied horizon depression angle, documented as not computed by Luach.

### Q-09. Misheyakir 12.85°
- No published source for 12.85° was found. 7.65° (attributed to Rav Moshe Feinstein for New York) is widely printed.
- Until decided: ship 10.2°, 11°, 11.5° and 7.65°; add 12.85° only with a source.
- Update 2026-10-21 (research note §6): no published page ties 7.65° (or 9.5°) to a named authority either.
  New default: named functions only for angles with a source; every angle is available through the generic
  `misheyakirAtDegrees(angle)`, so callers can use 7.65°, 9.5° or 12.85° on their own rav's say-so.

### Q-10. Hermes run scope
- The Linux Hermes CLI (`hermes-engine-cli`) has no `Intl` and no `class` syntax. On phones, Hermes gets `Intl` from the platform.
- Until decided: CI runs the whole non-time-zone suite on Hermes, and checks that time-zone code works there through a caller-supplied provider. Library code avoids `class`.

## Proposals

### P-01. Licence Apache-2.0 with a NOTICE naming Yosef
- Why: Apache-2.0 obliges redistributors to keep the NOTICE text (credit), is permissive enough for commercial apps, and has an explicit patent grant.
- Default: Apache-2.0 (in force until Q-01 is answered). If Yosef picks MIT, swap LICENSE and NOTICE; no code changes.

### P-02. No `class` syntax, plain functions and objects
- Why: works on old Hermes builds without Babel, tree-shakes better.
- Default: in force. See ADR-0002.

## As built

Choices made while building that nobody has ruled on. Each can be changed.

- AB-01. Month numbers count from Nisan (Nisan = 1 … Adar = 12, Adar II = 13), following Shemos 12:2. Named constants are exported, so callers need not use numbers.
- AB-02. Gregorian dates before 15 October 1582 are proleptic Gregorian. Supported range: Hebrew years 1–9999 for conversion; validated by property tests over 5660–6000.
- AB-03. A Gregorian civil date maps to the Hebrew date of its daytime. Callers who need the evening (after sunset) date pass `afterSunset: true` or use the zmanim-aware helper.
