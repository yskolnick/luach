# 0007. Smoke tests of the built package on every supported runtime

- Status: as built (no decision entry yet)
- Date: 2026-10-21
- Decision entry: *As built* in `DECISIONS.md`

## Context

`package.json` says `"engines": { "node": ">=18" }`, but CI ran the tests on Node 20 and
22 only, against the TypeScript sources. Nothing loaded `dist/index.cjs`, the package's
`exports` map, the built CLI, or the build in a browser; Bun and Deno ran one ESM smoke
test.

## Options

1. Run the whole Vitest suite on Node 18: the dev tools (Vitest 3, ESLint 9) no longer
   support it, and the suite tests the sources, not the build.
2. Build once on Node 22, then run small smoke scripts against `dist/` on each runtime.

## Proposal

Option 2, ported from the retired second implementation's smoke scripts and adapted to
this API. In `test/runtimes/`:

- `smoke.mjs` (existing): the ESM build; Node, Bun and Deno.
- `smoke.cjs`: `dist/index.cjs`, then `require('luach')`, `luach/places-full` and
  `luach/schema/day.schema.json` through the package's own `exports`; Node and Bun.
- `smoke-node.mjs`: `import 'luach'` and `luach/places-full` through `exports`, the shipped
  schema's `$id`, and the built CLI (`date`, `--json`, `--version`).
- `smoke-browser.mjs`: serves `dist/` locally and loads it in headless Chromium through
  Playwright (already a devDependency); fails on any page error or failed request. It uses
  `CHROMIUM_PATH`, Playwright's browser, or a preinstalled one at `/opt/pw-browsers`.

CI: a `node-versions` job (Node 18, 20, 22) and a `browser` job; `deno-bun` also runs the
CommonJS script in Bun.

## Consequences

A break in packaging (exports map, CJS output, the CLI's shebang or imports, a syntax
newer than Node 18) fails CI. Dropping Node 18 from `engines` would drop it from the
matrix.
