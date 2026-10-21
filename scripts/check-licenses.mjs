// Fails if any runtime dependency (direct or transitive) has a licence that is not
// on the permissive allow-list. devDependencies (test oracles) are not checked here:
// they never ship. See docs/decisions/0002-licence-and-clean-room.md.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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

if (errors.length) {
  console.error('Licence check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`Licence check passed (${seen.size} runtime dependencies).`);
