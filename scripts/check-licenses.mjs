// Licence gate (ADR-0003):
// 1. src/ may import only relative paths (and node: built-ins in src/cli/).
// 2. Every runtime dependency (and its dependencies) has a permissive licence.
// 3. The published bundle contains no text from the copyleft oracles.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PERMISSIVE = /^(MIT|ISC|BSD-2-Clause|BSD-3-Clause|0BSD|Apache-2\.0|CC0-1\.0|Unlicense|CC-BY-4\.0|BlueOak-1\.0\.0)$/;
let failed = false;
const fail = (msg) => { console.error(`✗ ${msg}`); failed = true; };

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// 1. Imports in src/
const importRe = /^\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)|\brequire\(\s*['"]([^'"]+)['"]\s*\)/gm;
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
for (const file of walk('src').filter((f) => f.endsWith('.ts'))) {
  const text = stripComments(readFileSync(file, 'utf8'));
  for (const m of text.matchAll(importRe)) {
    const spec = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (spec.startsWith('.')) continue;
    if (spec.startsWith('node:') && file.startsWith(join('src', 'cli'))) continue;
    fail(`${file} imports "${spec}" — src/ may only import relative modules`);
  }
}

// 2. Runtime dependencies
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const seen = new Set();
function checkDep(name) {
  if (seen.has(name)) return;
  seen.add(name);
  const p = join('node_modules', name, 'package.json');
  if (!existsSync(p)) return fail(`dependency ${name} is not installed`);
  const dep = JSON.parse(readFileSync(p, 'utf8'));
  const lic = typeof dep.license === 'string' ? dep.license : dep.license?.type;
  const ok = lic && lic.replace(/[()]/g, '').split(/\s+OR\s+/).some((l) => PERMISSIVE.test(l.trim()));
  if (!ok) fail(`runtime dependency ${name} has licence "${lic}"`);
  for (const d of Object.keys(dep.dependencies ?? {})) checkDep(d);
}
for (const d of Object.keys(pkg.dependencies ?? {})) checkDep(d);
if (!PERMISSIVE.test(pkg.license)) fail(`package licence "${pkg.license}" is not in the permissive list`);

// 3. Bundle contents
if (existsSync('dist')) {
  for (const file of walk('dist').filter((f) => /\.(c?js|d\.c?ts)$/.test(f))) {
    const text = readFileSync(file, 'utf8');
    for (const marker of ['@hebcal/', 'kosher-zmanim', 'astronomy-engine', 'GNU General Public', 'GNU Lesser']) {
      if (text.includes(marker)) fail(`${file} contains "${marker}"`);
    }
  }
}

if (failed) process.exit(1);
console.log(`✓ licences: ${Object.keys(pkg.dependencies ?? {}).length} runtime dependencies, src/ imports clean, bundle clean`);
