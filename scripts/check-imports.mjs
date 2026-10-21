// Fails if anything under src/ imports a package (only relative imports are allowed,
// because the library has no runtime dependencies), and in particular a devDependency
// such as the GPL/LGPL test oracles. Also bans eval-like constructs and network APIs.
// Comments, strings, template literals and regex literals are told apart by a small
// tokenizer (scripts/lib/js-scan.mjs), so neither can hide code from the check.
// Runs in the current directory (package.json and src/ there).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { scan, findImports, packageName } from './lib/js-scan.mjs';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const runtime = new Set(Object.keys(pkg.dependencies ?? {}));
const dev = new Set(Object.keys(pkg.devDependencies ?? {}));
const errors = [];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|mts|cts|js|mjs|cjs)$/.test(f)) scan1(p);
  }
}

const BANNED = [
  [/\beval\s*\(/, 'eval'],
  [/\bnew\s+Function\s*\(/, 'new Function'],
  [/(?<![.\w$])Function\s*\(/, 'Function()'],
  [/\bfetch\s*\(/, 'fetch'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [/\bWebSocket\b/, 'WebSocket'],
];

function scan1(file) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  const { specs, problems, strings } = findImports(src);
  for (const p of problems) errors.push(`${rel}: ${p}`);
  for (const spec of specs) {
    const name = packageName(spec);
    if (name === null) continue;
    if (dev.has(name)) errors.push(`${rel}: imports devDependency "${spec}"`);
    else if (!runtime.has(name)) errors.push(`${rel}: imports "${spec}", which is not a runtime dependency`);
  }
  // A devDependency's name in a string is a way around the checks above (e.g. a require
  // function under another name); src/ has no reason to mention one.
  for (const s of strings) {
    const name = packageName(s);
    if (name && dev.has(name) && (s === name || s.startsWith(name + '/'))) errors.push(`${rel}: names devDependency "${s}" in a string`);
  }
  const { code } = scan(src);
  for (const [re, what] of BANNED) if (re.test(code)) errors.push(`${rel}: uses ${what}`);
}

walk(join(root, 'src'));
if (errors.length) {
  console.error('Import check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('Import check passed: src/ imports nothing outside the package.');
