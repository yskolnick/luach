# 0005. Per-module ESM output and per-module name tables

- Status: proposed (P-07)
- Date: 2026-10-21

## Context

Apps that use one feature (say, Hebrew dates) should not pay for the others. A single
bundled `dist/index.js` defeats tree-shaking: bundlers keep module-level computations they
cannot prove pure. Name tables (holidays, parshiyos, zmanim) in the locale objects were
pulled in by every date format.

## Proposal

- The ESM build is one file per source module (tsup `bundle: false`); `package.json` has
  `sideEffects: false`, so bundlers drop whole modules. Relative imports carry `.js` so Node
  resolves them. CommonJS stays one bundled file per entry.
- `luach/places-full` (34,000 cities) is a separate entry point.
- Holiday, parsha and zman names live in per-module tables keyed by the locale's `base`
  style; a locale's own `names` still override them.
- Budgets enforced in CI (`scripts/check-size.mjs`): `HebrewDate` + formatting ≤ 8 KB gzip,
  `ZmanimCalendar` ≤ 20 KB, `holidaysForYear` ≤ 25 KB, the whole main entry ≤ 60 KB, the
  full city table ≤ 1.2 MB.

## Consequences

Measured: 3.4 KB, 9.4 KB and 5.4 KB for those three imports. Custom locales must keep a
`base` (via `extendLocale`) to find the module tables.
