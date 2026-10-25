// The clean-room gates (scripts/check-imports.mjs, scripts/check-licenses.mjs) run against
// probe projects in a temporary directory; nothing here touches src/ or dist/.
import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';

const SCRIPTS = resolve('scripts');
const PKG = { name: 'probe', license: 'Apache-2.0', devDependencies: { '@hebcal/core': '*', 'kosher-zmanim': '*' } };

function run(script: string, files: Record<string, string>): { ok: boolean; out: string } {
  const dir = mkdtempSync(join(tmpdir(), 'luach-probe-'));
  try {
    writeFileSync(join(dir, 'package.json'), JSON.stringify(PKG));
    mkdirSync(join(dir, 'src'));
    for (const [p, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, p)), { recursive: true });
      writeFileSync(join(dir, p), text);
    }
    const r = spawnSync(process.execPath, [join(SCRIPTS, script)], { cwd: dir, encoding: 'utf8' });
    return { ok: r.status === 0, out: r.stdout + r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const imports = (code: string) => run('check-imports.mjs', { 'src/probe.ts': code });

describe('check-imports', () => {
  it('passes clean code, and text inside strings, comments, templates and regexes', () => {
    const r = imports([
      "import { a } from './a.js';",
      "export * from './b.js';",
      "const s = 'eval(1) fetch(x) require(\"@hebcal/core\")';",
      '// eval(1) import("@hebcal/core")',
      '/* new Function("x") */',
      'const t = `a ${s} eval( b`;',
      'const re = /eval\\(|\\/\\*/g;',
      "const m = import.meta;",
      'const d = 4 / 2 / 1;',
    ].join('\n'));
    expect(r.out).toContain('passed');
    expect(r.ok).toBe(true);
  });
  for (const [what, code, message] of [
    ['a static import of an oracle', "import { HDate } from '@hebcal/core';", 'imports devDependency "@hebcal/core"'],
    ['a dynamic import', "const m = await import('kosher-zmanim');", 'imports devDependency "kosher-zmanim"'],
    ['a template-literal dynamic import', 'const m = await import(`@hebcal/core`);', 'imports devDependency "@hebcal/core"'],
    ['a computed dynamic import', "const n = '@heb' + 'cal/core'; const m = await import(n);", 'import() with a computed specifier'],
    ['createRequire', "import { createRequire } from 'node:module';\nconst x = createRequire(import.meta.url)('@hebcal/core');", 'uses createRequire'],
    ['an oracle named in a string', "const name = '@hebcal/core'; declare const r: (s: string) => unknown; r(name);", 'names devDependency "@hebcal/core"'],
    ['require', "const k = require('kosher-zmanim');", 'imports devDependency "kosher-zmanim"'],
    ['a package that is not a dependency', "import x from 'left-pad';", 'not a runtime dependency'],
    ['eval hidden between "/*" and "*/" in strings', 'const s="/*"; eval("1"); const t="*/";', 'uses eval'],
    ['eval after a regex holding "/*"', 'const r = /a\\/*/; eval("1"); const t = "*/";', 'uses eval'],
    ['eval after a template holding "//"', 'const u = `http://x`; eval("1");', 'uses eval'],
    ['eval inside a template substitution', 'const u = `${eval("1")}`;', 'uses eval'],
    ['new Function', 'const f = new Function("return 1");', 'uses new Function'],
    ['Function()', 'const f = Function("return 1");', 'uses Function()'],
    ['fetch', "fetch('https://example.com');", 'uses fetch'],
  ] as const) {
    it(`fails on ${what}`, () => {
      const r = imports(code);
      expect(r.ok, r.out).toBe(false);
      expect(r.out).toContain(message);
    });
  }
});

describe('check-licenses on dist/', () => {
  it('passes a clean build', () => {
    const r = run('check-licenses.mjs', { 'dist/index.js': "import { a } from './a.js';\nexport const b = a;\n", 'dist/index.cjs': "'use strict';\nconst a = require('./a.cjs');\n" });
    expect(r.out).toContain('built files clean');
    expect(r.ok).toBe(true);
  });
  for (const [what, file, text, message] of [
    ['oracle package text', 'dist/index.js', '// adapted from @hebcal/core\nexport const x = 1;', 'contains "@hebcal/"'],
    ['kosher-zmanim text in a map', 'dist/index.js.map', '{"sources":["../node_modules/kosher-zmanim/x.ts"]}', 'contains "kosher-zmanim"'],
    ['GPL text', 'dist/index.d.ts', '/* GNU General Public License */ export {};', 'contains "GNU General Public"'],
    ['a require of a package', 'dist/index.cjs', "const x = require('left-pad');", 'loads "left-pad"'],
    ['createRequire', 'dist/index.js', "import { createRequire } from 'node:module'; const r = createRequire(import.meta.url);", 'uses createRequire'],
  ] as const) {
    it(`fails on ${what}`, () => {
      const r = run('check-licenses.mjs', { [file]: text });
      expect(r.ok, r.out).toBe(false);
      expect(r.out).toContain(message);
    });
  }
});
