// Bundle size budget. Fails if the minified+gzipped ESM entry grows past the budget.
// The full city dataset, the city table and the learning cycles are separate entries with their own budgets.
import { existsSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const BUDGETS = [
  { entry: 'dist/index.js', gzipKb: 60 },
  { entry: 'dist/places/full.js', gzipKb: 1200 },
  { entry: 'dist/places/index.js', gzipKb: 12 },
  { entry: 'dist/learning/index.js', gzipKb: 12 },
  // The CLI loads the full city table and the learning cycles only when needed (dynamic imports), so they are left out.
  // 62: the option table and the checks on every date argument (about 2 KB) are worth their size.
  { entry: 'dist/cli/cli.js', gzipKb: 62, external: ['../places/full.js', '../learning/index.js'] },
];

// Tree-shaking budgets: what an app pays for importing only part of Luach.
const PARTIAL = [
  { name: 'HebrewDate + formatHebrewDate', code: "import { HebrewDate, formatHebrewDate } from './dist/index.js'; console.log(formatHebrewDate(HebrewDate.today()));", gzipKb: 8 },
  { name: 'Zmanim', code: "import { Zmanim } from './dist/index.js'; console.log(new Zmanim({ latitude: 0, longitude: 0, timeZone: 'UTC' }).on({ year: 2027, month: 1, day: 1 }).slot('sunrise'));", gzipKb: 20 },
  { name: 'melachaRunAt', code: "import { melachaRunAt } from './dist/index.js'; console.log(melachaRunAt(new Date(0), { latitude: 0, longitude: 0, timeZone: 'UTC' }));", gzipKb: 23 },
  { name: 'nowInfo', code: "import { nowInfo } from './dist/index.js'; console.log(nowInfo(new Date(0), { latitude: 0, longitude: 0, timeZone: 'UTC' }));", gzipKb: 39 },
  { name: 'holidaysForYear', code: "import { holidaysForYear } from './dist/index.js'; console.log(holidaysForYear(5787));", gzipKb: 25 },
];

let failed = false;
for (const { name, code, gzipKb } of PARTIAL) {
  const out = await build({ stdin: { contents: code, resolveDir: process.cwd() }, bundle: true, minify: true, write: false, format: 'esm', treeShaking: true });
  const gz = gzipSync(out.outputFiles[0].contents).length / 1024;
  const line = `import { ${name} }: ${gz.toFixed(1)} KB gzip (budget ${gzipKb} KB)`;
  if (gz > gzipKb) { console.error('OVER BUDGET ' + line); failed = true; } else console.log(line);
}

for (const { entry, gzipKb, external = [] } of BUDGETS) {
  if (!existsSync(entry)) {
    console.error(`${entry} missing; run npm run build first`);
    process.exit(1);
  }
  const out = await build({ entryPoints: [entry], bundle: true, minify: true, write: false, format: 'esm', external });
  const raw = out.outputFiles[0].contents;
  const gz = gzipSync(raw).length / 1024;
  const line = `${entry}: ${(raw.length / 1024).toFixed(1)} KB min, ${gz.toFixed(1)} KB gzip (budget ${gzipKb} KB)`;
  if (gz > gzipKb) {
    console.error('OVER BUDGET ' + line);
    failed = true;
  } else console.log(line);
}
// The CommonJS city entry requires the ESM city table instead of carrying a second copy.
const cjsFull = statSync('dist/places-full.cjs').size / 1024;
if (cjsFull > 100) {
  console.error(`OVER BUDGET dist/places-full.cjs: ${cjsFull.toFixed(0)} KB (budget 100 KB): the city table is bundled twice`);
  failed = true;
} else console.log(`dist/places-full.cjs: ${cjsFull.toFixed(1)} KB (budget 100 KB; the city table is shared)`);
process.exit(failed ? 1 : 0);
