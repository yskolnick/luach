import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2019',
    treeshake: true,
    splitting: false,
  },
  {
    // Data-only entry: no sourcemap (it would be several MB of JSON positions).
    entry: { 'cities-full': 'src/cities-full.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,
    clean: false,
    target: 'es2019',
    treeshake: true,
    splitting: false,
  },
]);
