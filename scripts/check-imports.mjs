// Fails if anything under src/ imports a package (only relative imports are allowed,
// because the library has no runtime dependencies), and in particular a devDependency
// such as the GPL/LGPL test oracles. Also bans eval-like constructs and network APIs.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const runtime = new Set(Object.keys(pkg.dependencies ?? {}));
const dev = new Set(Object.keys(pkg.devDependencies ?? {}));
const errors = [];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|mjs|cjs|json)$/.test(f)) scan(p);
  }
}

const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s*['"]([^'"]+)['"]/gm;
const BANNED = [
  [/\beval\s*\(/, 'eval'],
  [/\bnew\s+Function\s*\(/, 'new Function'],
  [/\bfetch\s*\(/, 'fetch'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [/\bWebSocket\b/, 'WebSocket'],
];

function scan(file) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  for (const m of src.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (!spec || spec.startsWith('.')) continue;
    const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
    if (dev.has(name)) errors.push(`${rel}: imports devDependency "${spec}"`);
    else if (!runtime.has(name)) errors.push(`${rel}: imports "${spec}", which is not a runtime dependency`);
  }
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const [re, what] of BANNED) if (re.test(code)) errors.push(`${rel}: uses ${what}`);
}

walk(join(root, 'src'));
if (errors.length) {
  console.error('Import check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('Import check passed: src/ imports nothing outside the package.');
