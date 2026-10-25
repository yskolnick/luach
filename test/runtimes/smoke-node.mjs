// Node-only smoke test of the built package: `node test/runtimes/smoke-node.mjs` (after
// `npm run build`). Imports the ESM build through the package's own "exports"
// (self-reference), checks the shipped JSON Schema, and runs the built CLI.
// Prints OK or throws. (test/runtimes/smoke.mjs is the part Bun and Deno also run.)
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { HebrewDate, dayInfo, getPlace, DAY_INFO_SCHEMA_ID } from 'luach';
import { fullPlaces } from 'luach/places-full';

if (HebrewDate.fromGregorian(2026, 10, 21).toString() !== '5787-8-10') throw new Error('import "luach"');
if (!(fullPlaces().length > 1000)) throw new Error('import "luach/places-full"');
const schemaPath = createRequire(import.meta.url).resolve('luach/schema/day.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
if (schema.$id !== DAY_INFO_SCHEMA_ID) throw new Error('schema $id ' + schema.$id);
if (dayInfo(HebrewDate.fromGregorian(2026, 10, 23), { location: getPlace('lakewood') }).$schema !== schema.$id) throw new Error('$schema');

// The CLI, as `npx luach` runs it.
const cli = fileURLToPath(new URL('../../dist/cli/cli.js', import.meta.url));
const run = (...args) => {
  const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`luach ${args.join(' ')} exited ${r.status}: ${r.stderr}`);
  return r.stdout;
};
const text = run('date', '2026-10-23', '--city', 'lakewood', '--locale', 'en');
if (!/Heshvan|Cheshvan/.test(text)) throw new Error('cli date: ' + text);
const json = JSON.parse(run('date', '2026-10-23', '--city', 'lakewood', '--json'));
if (json.$schema !== DAY_INFO_SCHEMA_ID || !json.candleLighting) throw new Error('cli --json');
if (!run('--version').includes('.')) throw new Error('cli --version');

console.log('OK (esm via exports + cli, Node ' + process.versions.node + ')');
