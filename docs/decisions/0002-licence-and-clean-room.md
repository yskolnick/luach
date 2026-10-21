# 0002. Apache-2.0 and a clean-room implementation

- Status: proposed (P-01, Q-01)
- Date: 2026-10-21

## Context

The goal is a library anyone may use, including commercially, with nothing more than
credit to Yosef. The well-known Jewish-calendar libraries are copyleft:

| Library | Licence (as published) |
|---|---|
| `@hebcal/core` and hebcal | GPL-2.0-or-later |
| KosherJava zmanim | LGPL-2.1 |
| `kosher-zmanim` (npm) | LGPL (package metadata says LGPL-3.0; its tracker issue #35 discusses LGPL-2.1) |
| KosherCocoa | own licence with an anti-copycat clause |
| *Calendrical Calculations* code | own restrictive licence |

Copying code, tables or structure from any of them would make Luach a derivative work.

## Options

1. **Apache-2.0 + NOTICE.** Redistributors must carry the NOTICE text: credit travels with
   the code. Explicit patent grant.
2. **MIT.** Simplest; credit is only the copyright line inside the licence text.

## Proposal

Apache-2.0 with a NOTICE naming Yosef ("Built on Luach by Yosef Skolnick", Q-02).

Clean-room rules:
- Implement from primary or public-domain sources: the Rambam (Hilchos Kiddush HaChodesh),
  the NOAA Solar Calculator (US government work, public domain), Meeus's *Astronomical
  Algorithms* (the method, not anyone's code of it), Howard Hinnant's civil-date
  algorithms (public domain), and named halachic works.
- Copyleft libraries may be installed only as devDependencies and used only as test
  oracles. `scripts/check-imports.mjs` fails the build if `src/` imports any package;
  `scripts/check-licenses.mjs` fails it if a runtime dependency (direct or transitive)
  has a licence outside MIT, ISC, BSD, Apache-2.0, CC0, Unlicense or public domain.
- Data needs a licence too: every dataset is listed in `docs/data-sources.md`.

## Consequences

Tests may compare against GPL code without affecting the shipped package. If Yosef
chooses MIT, only `LICENSE`, `NOTICE` and `package.json#license` change.
