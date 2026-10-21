# ADR-0003: Copyleft libraries as test oracles only

- Status: as built (follows the brief's ground rules)
- Date: 2026-10-21

## Context
Accuracy needs independent implementations to compare against. The best ones are copyleft: @hebcal/core (GPL-2.0-or-later), kosher-zmanim (LGPL-3.0). @hebcal/learning is BSD-2-Clause; astronomy-engine is MIT.

## Decision
These are devDependencies, imported only from `test/`. Nothing in `src/` imports any devDependency, and the published package (`files: dist, NOTICE, LICENSE, README, CHANGELOG`) contains none of them. `scripts/check-licenses.mjs` enforces both in CI. Code is never copied from them; they are run, and their outputs compared.

## Consequences
Test failures may come from oracle bugs; each disagreement is investigated against a primary source and documented in the accuracy report.
