# 0003. TypeScript, zero runtime dependencies, tsup, Vitest, ESLint

- Status: proposed (P-02)
- Date: 2026-10-21

## Context

The library must run in Node, browsers, Deno, Bun and React Native (Hermes), be
tree-shakable, and carry no licence risk.

## Options

1. TypeScript compiled by tsup (esbuild) to ESM + CJS + `.d.ts`.
2. Plain JavaScript with JSDoc types.

Test runner: Vitest (MIT) vs Jest (MIT): Vitest runs TypeScript without extra config.

## Proposal

TypeScript (strict), built with tsup to ESM and CJS with declarations, target ES2019 so
older engines and Hermes accept it. Vitest and fast-check (MIT) for unit and property
tests. ESLint with typescript-eslint, plus rules banning `eval`, `new Function` and network
globals in `src/`. **No runtime dependencies.** devDependencies (all build/test only):
typescript, tsup, esbuild, vitest, fast-check, eslint, typescript-eslint, @types/node, and
the oracles `@hebcal/core` (GPL), `kosher-zmanim` (LGPL), `astronomy-engine` (MIT).

## Consequences

Every date, time-zone and astronomy routine is written here. Time zones rely on the
runtime's `Intl.DateTimeFormat`; engines without it can pass a `TimeZoneProvider`.
