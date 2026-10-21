// Bundle size budget. Fails if the minified+gzipped ESM entry grows past the budget.
// The full city dataset is a separate entry and has its own budget.
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const BUDGETS = [
  { entry: 'dist/index.js', gzipKb: 60 },
];

let failed = false;
for (const { entry, gzipKb } of BUDGETS) {
  if (!existsSync(entry)) {
    console.error(`${entry} missing; run npm run build first`);
    process.exit(1);
  }
  const out = await build({ entryPoints: [entry], bundle: true, minify: true, write: false, format: 'esm' });
  const raw = out.outputFiles[0].contents;
  const gz = gzipSync(raw).length / 1024;
  const line = `${entry}: ${(raw.length / 1024).toFixed(1)} KB min, ${gz.toFixed(1)} KB gzip (budget ${gzipKb} KB)`;
  if (gz > gzipKb) {
    console.error('OVER BUDGET ' + line);
    failed = true;
  } else console.log(line);
}
process.exit(failed ? 1 : 0);
