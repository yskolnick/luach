# Decisions

Yosef Skolnick decides everything about Luach. This file holds:

- **D-nn, Decided:** a ruling, with Yosef's own words quoted.
- **Q-nn, Open question:** what is being asked, and what the code does until it is answered.
- **P-nn, Proposal:** a recommendation, why, and the default in effect until Yosef decides.
- ***As built*:** behaviour the code has that nobody chose; listed so it can be chosen or changed.

Entries are added and superseded, never rewritten. Architecture, tooling, dependency and
licence choices also have an ADR in `docs/decisions/`.

## Decided

### D-01. The name is Luach
The npm package is `luach` and the repository is `yskolnick/luach`. Yosef: "use luach".
The name was free on npm on 2026-10-21; Yosef has since reserved it (a placeholder release
held for npm's staged-release review). An unrelated package, `luach-picker`, is a browser
date-picker widget; Luach is a calculation library with no UI (see README).

## Open questions

### Q-00. Unmerged branches
Branches with work not yet on `main`:
- `m0-scaffold`: repository setup and the M1 core calendar (PR pending).

### Q-01. Licence: Apache-2.0 with NOTICE, or MIT
See P-01. **Until decided:** Apache-2.0 with a `NOTICE` file.

### Q-02. How credit should read
**Until decided:** NOTICE says "Built on Luach by Yosef Skolnick".

Q-03 is recorded in the private records repository.

### Q-04. Anniversary rules (30 Adar I, 30 Cheshvan/Kislev defaults)
`anniversary()` offers both customs for the 30th of Cheshvan/Kislev and for Adar of a
common year in a leap year. The defaults are *as built*: Adar I for yahrzeits, Adar II for
birthdays, `'firstAnniversary'` for yahrzeits and `'nextMonth'` for birthdays; 30 Adar I
in a common year becomes 30 Shevat. **Until decided:** these defaults, documented as
defaults, not rulings.

## Proposals

### P-01. Apache-2.0 with a NOTICE file
**Why:** Apache-2.0 requires redistributors to carry the NOTICE text, which is the closest
standard licence to "use it freely, but credit Yosef". It also has an explicit patent
grant. MIT would only require keeping the copyright line inside the licence text.
**Default until decided:** Apache-2.0. If Yosef picks MIT, the `LICENSE` and `NOTICE` files
change and nothing else does. ADR: `docs/decisions/0002-licence-and-clean-room.md`.

### P-02. Zero runtime dependencies; TypeScript, tsup, Vitest, ESLint
**Why:** smallest bundle, no licence risk, works on Hermes. ADR 0003.
**Default until decided:** as proposed.

### P-03. Days counted from 1970-01-01; months numbered from Nisan
**Why:** epoch days line up with JavaScript `Date`; numbering from Nisan follows the Torah
and the Rambam. ADR 0004. **Default until decided:** as proposed.

### P-04. Supported range: Hebrew years 1–9999, proleptic Gregorian
**Why:** covers every practical use; the Rambam's arithmetic is exact over the range;
proleptic Gregorian avoids a silent calendar switch in 1582. ADR 0004.
**Default until decided:** as proposed.

## As built

- *As built:* `gematriya()` writes an exact multiple of 1000 like its units digit (א׳ is 1
  or 1000); `parseGematriya('א׳')` returns 1.
- *As built:* `formatHebrewDate()` omits the year's thousands by default (תשפ״ז).
- *As built:* the plain-English locale (`en`) uses "Tishri, Heshvan, Iyyar" spellings and
  "Saturday".
