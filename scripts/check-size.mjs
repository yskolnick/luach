// Bundle size budget (gzip). Raise a budget only with a note in the PR explaining why.
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const BUDGETS = {
  'dist/index.js': 60_000,
  'dist/cities-full.js': 1_200_000,
};
let failed = false;
for (const [file, budget] of Object.entries(BUDGETS)) {
  if (!existsSync(file)) { console.error(`✗ ${file} missing; run npm run build`); failed = true; continue; }
  const size = gzipSync(readFileSync(file)).length;
  const ok = size <= budget;
  console.log(`${ok ? '✓' : '✗'} ${file}: ${size} bytes gzip (budget ${budget})`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);

// Tree-shaking: an app that imports only a few functions must not pull in the whole library.
import { build } from 'esbuild';
const SHAKE = [
  ['gregorianToHebrew + formatHebrewDate', 'export { gregorianToHebrew, formatHebrewDate } from "./dist/index.js";', 6_500],
  ['netz (zmanim only)', 'export { netz } from "./dist/index.js";', 4_500],
  ['holidaysInYear', 'export { holidaysInYear } from "./dist/index.js";', 9_000],
];
for (const [name, contents, budget] of SHAKE) {
  const r = await build({ stdin: { contents, resolveDir: process.cwd(), loader: 'js' }, bundle: true, minify: true, format: 'esm', write: false, logLevel: 'error' });
  const size = gzipSync(r.outputFiles[0].contents).length;
  const ok = size <= budget;
  console.log(`${ok ? '✓' : '✗'} tree-shaken "${name}": ${size} bytes gzip (budget ${budget})`);
  if (!ok) process.exitCode = 1;
}
