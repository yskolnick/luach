// Fails if any runtime dependency (direct or transitive) has a licence that is not
// on the permissive allow-list. devDependencies (test oracles) are not checked here:
// they never ship. If dist/ exists, the built files are checked too (see below).
// Runs in the current directory.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findImports, packageName } from './lib/js-scan.mjs';

const ALLOWED = new Set([
  'MIT', 'MIT-0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'Apache-2.0',
  'CC0-1.0', 'Unlicense', 'CC-BY-4.0', 'Public Domain',
]);

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const errors = [];
const seen = new Set();

function check(name) {
  if (seen.has(name)) return;
  seen.add(name);
  const p = join(root, 'node_modules', name, 'package.json');
  if (!existsSync(p)) {
    errors.push(`${name}: not installed, cannot verify licence`);
    return;
  }
  const dep = JSON.parse(readFileSync(p, 'utf8'));
  const lic = typeof dep.license === 'string' ? dep.license : dep.license?.type;
  const parts = String(lic ?? '').replace(/[()]/g, '').split(/\s+OR\s+/);
  if (!parts.some((x) => ALLOWED.has(x.trim()))) {
    errors.push(`${name}: licence "${lic}" is not on the allow-list`);
  }
  for (const d of Object.keys(dep.dependencies ?? {})) check(d);
}

for (const name of Object.keys(pkg.dependencies ?? {})) check(name);
for (const name of Object.keys(pkg.peerDependencies ?? {})) check(name);

// The built package (when dist/ exists): it loads only runtime dependencies (and node:
// built-ins in the CLI), and contains no text from the copyleft test oracles.
// No GPL or LGPL text, no source from node_modules, and no test-only package named (scoped
// packages, and any devDependency whose name is not an ordinary word).
const devNames = Object.keys(pkg.devDependencies ?? {}).filter((n) => n.startsWith('@') || n.includes('-'));
const ORACLE_TEXT = ['GNU General Public', 'GNU Lesser General Public', 'node_modules/', ...devNames];
const runtimeDeps = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const dist = join(root, 'dist');
let distFiles = 0;
if (existsSync(dist)) {
  for (const file of walk(dist)) {
    const rel = relative(root, file);
    const text = readFileSync(file, 'utf8');
    distFiles++;
    for (const marker of ORACLE_TEXT) if (text.includes(marker)) errors.push(`${rel}: contains "${marker}"`);
    if (!/\.(c|m)?js$/.test(file)) continue;
    const { specs, problems } = findImports(text);
    for (const p of problems) errors.push(`${rel}: ${p}`);
    for (const spec of specs) {
      const name = packageName(spec);
      if (name === null || runtimeDeps.has(name)) continue;
      if (spec.startsWith('node:') && rel.startsWith(join('dist', 'cli'))) continue;
      errors.push(`${rel}: loads "${spec}", which is not a runtime dependency`);
    }
  }
}

if (errors.length) {
  console.error('Licence check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`Licence check passed (${seen.size} runtime dependencies${existsSync(dist) ? `; ${distFiles} built files clean` : '; no dist/ to check'}).`);
