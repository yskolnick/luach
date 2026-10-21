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
