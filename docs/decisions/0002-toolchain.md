# ADR-0002: Toolchain and code style

- Status: as built
- Date: 2026-10-21

## Context
The library must run in Node, browsers, Deno, Bun and React Native (Hermes), tree-shake well, and have zero runtime dependencies.

## Decision
- TypeScript (strict), source in `src/`, ESM-first.
- Build: tsup (MIT, esbuild-based) emitting ESM, CJS and `.d.ts`.
- Tests: Vitest (MIT) and fast-check (MIT) for property tests.
- Lint: ESLint 9 with typescript-eslint (MIT). Lint rules forbid `class`, `eval`, `new Function`, `fetch` and other network globals in `src/`.
- No `class` syntax: the Hermes CLI used in CI (`hermes-engine-cli` 0.12) rejects it, and plain functions tree-shake better.
- Time zones through `Intl.DateTimeFormat`, or a caller-supplied provider where `Intl` is missing (Hermes CLI has no `Intl`).

## Alternatives considered
- Jest: slower ESM support. Rollup: more config for the same output.
- Classes with Babel down-levelling for Hermes: adds a build step only for tests.

## Consequences
Dev dependencies are all permissive except the test oracles (ADR-0003).
