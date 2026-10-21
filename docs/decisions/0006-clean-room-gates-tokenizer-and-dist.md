# 0006. Clean-room gates: a tokenizer, and a check of the built files

- Status: as built (no decision entry yet)
- Date: 2026-10-21
- Decision entry: *As built* in `DECISIONS.md`

## Context

`scripts/check-imports.mjs` found imports with regular expressions and stripped comments
with another, before looking for `eval`, `fetch` and similar. That missed
`createRequire(import.meta.url)('@hebcal/core')` and ``import(`@hebcal/core`)``, and a
`"/*"` inside a string made it drop real code (`const s="/*"; eval("1"); const t="*/"`
passed). `scripts/check-licenses.mjs` checked only the licences of runtime dependencies,
not what the build actually contains.

## Options

1. Parse with TypeScript's compiler API: exact, but the checks would depend on a
   devDependency's internals and get slower.
2. A small tokenizer of our own that knows comments, strings, template literals (with
   substitutions) and regex literals; no parser.
3. Keep regular expressions and add cases: each fix opens another gap.

## Proposal

Option 2: `scripts/lib/js-scan.mjs` (about 150 lines, no dependencies). On top of it:

- `check-imports` reads specifiers from `import … from`, `import '…'`, `import(…)` and
  `require(…)` (string or plain template literal); fails on a computed `import()` /
  `require()`, on any `createRequire`, and on a devDependency's name in any string; and
  looks for banned calls in the code with comments and literal contents blanked out.
- `check-licenses` also checks `dist/` when it exists (`npm run check` and CI now build
  before it): every file is free of oracle text (`@hebcal/`, `kosher-zmanim`,
  `GNU General Public`, `GNU Lesser General Public`), and the JavaScript loads only
  runtime dependencies (and `node:` built-ins under `dist/cli`). The text check comes from
  the retired second implementation.
- `test/check-scripts.test.ts` runs both scripts on probe projects in a temporary
  directory.

## Consequences

The tokenizer guesses regex-versus-division from the previous token, as JavaScript tools
commonly do; a pathological case (a regex right after `)`) would be read as division.
Revisit if a check ever has to understand types or scopes; then use the TypeScript API.
