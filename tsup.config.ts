import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // ESM: one file per module, so bundlers drop whole unused modules (sideEffects: false).
    entry: ['src/**/*.ts'],
    format: ['esm'],
    bundle: false,
    dts: { entry: { index: 'src/index.ts', 'places-full': 'src/places/full.ts' } },
    sourcemap: true,
    clean: true,
    target: 'es2019',
  },
  {
    // CommonJS: one bundled file per entry.
    entry: { index: 'src/index.ts', 'places-full': 'src/places/full.ts' },
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    target: 'es2019',
  },
]);
