// Bundle size budget. Fails if the minified+gzipped ESM entry grows past the budget.
// The full city dataset is a separate entry and has its own budget.
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const BUDGETS = [
  { entry: 'dist/index.js', gzipKb: 60 },
  { entry: 'dist/places/full.js', gzipKb: 1200 },
];

// Tree-shaking budgets: what an app pays for importing only part of Luach.
const PARTIAL = [
  { name: 'HebrewDate + formatHebrewDate', code: "import { HebrewDate, formatHebrewDate } from './dist/index.js'; console.log(formatHebrewDate(HebrewDate.today()));", gzipKb: 8 },
  { name: 'ZmanimCalendar', code: "import { ZmanimCalendar } from './dist/index.js'; console.log(new ZmanimCalendar({ latitude: 0, longitude: 0, timeZone: 'UTC' }, { year: 2027, month: 1, day: 1 }).sunrise());", gzipKb: 20 },
  { name: 'holidaysForYear', code: "import { holidaysForYear } from './dist/index.js'; console.log(holidaysForYear(5787));", gzipKb: 25 },
];

let failed = false;
for (const { name, code, gzipKb } of PARTIAL) {
  const out = await build({ stdin: { contents: code, resolveDir: process.cwd() }, bundle: true, minify: true, write: false, format: 'esm', treeShaking: true });
  const gz = gzipSync(out.outputFiles[0].contents).length / 1024;
  const line = `import { ${name} }: ${gz.toFixed(1)} KB gzip (budget ${gzipKb} KB)`;
  if (gz > gzipKb) { console.error('OVER BUDGET ' + line); failed = true; } else console.log(line);
}

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
