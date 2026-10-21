import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

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
  {
    // The command-line tool: one self-contained file.
    entry: { cli: 'src/cli/index.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    clean: false,
    target: 'node18',
    platform: 'node',
    banner: { js: '#!/usr/bin/env node' },
    define: { __LUACH_VERSION__: JSON.stringify(version) },
    splitting: false,
    // Use the library files next to it in dist/ instead of bundling a second copy.
    esbuildPlugins: [
      {
        name: 'cli-uses-dist',
        setup(build) {
          build.onResolve({ filter: /^\.\.\/(index|cities-full)\.js$/ }, (args) => ({
            path: `./${args.path.slice(3)}`,
            external: true,
          }));
        },
      },
    ],
  },
]);
