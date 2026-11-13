import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';

// The full city table (2.6 MB) ships once: the CommonJS entry requires the ES module that the
// ESM build already has (require of an ES module needs Node 20.19+ or 22.12+; see "engines").
const sharedCityData: Plugin = {
  name: 'shared-city-data',
  setup(build) {
    build.onResolve({ filter: /full-data\.js$/ }, () => ({ path: './places/full-data.js', external: true }));
  },
};

export default defineConfig([
  {
    // ESM: one file per module, so bundlers drop whole unused modules (sideEffects: false).
    entry: ['src/**/*.ts'],
    format: ['esm'],
    bundle: false,
    dts: { entry: { index: 'src/index.ts', 'places-full': 'src/places/full.ts', places: 'src/places/index.ts', learning: 'src/learning/index.ts' } },
    sourcemap: false,
    clean: true,
    target: 'es2019',
  },
  {
    // CommonJS: one bundled file per entry.
    entry: { index: 'src/index.ts', 'places-full': 'src/places/full.ts', places: 'src/places/index.ts', learning: 'src/learning/index.ts' },
    format: ['cjs'],
    esbuildPlugins: [sharedCityData],
    dts: true,
    sourcemap: false,
    target: 'es2019',
  },
]);
