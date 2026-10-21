// Runs test/hermes/entry.ts in Hermes (React Native's JavaScript engine) and in Node, and
// fails unless both print the same thing. The bundle is lowered with Babel the way Metro
// lowers app code (Hermes has no native `class` support).
//   HERMES_BIN=/path/to/hermes node scripts/hermes-test.mjs
import { build } from 'esbuild';
import { transformAsync } from '@babel/core';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const hermes = process.env.HERMES_BIN;
if (!hermes) {
  console.error('Set HERMES_BIN to a Hermes CLI binary (github.com/facebook/hermes/releases).');
  process.exit(1);
}
const res = await build({ entryPoints: ['test/hermes/entry.ts'], bundle: true, write: false, format: 'iife', target: 'es2019', platform: 'neutral' });
const lowered = await transformAsync(res.outputFiles[0].text, {
  babelrc: false,
  configFile: false,
  presets: [['@babel/preset-env', { targets: { ie: '11' }, modules: false, exclude: ['transform-regenerator', 'transform-async-to-generator'] }]],
});
const dir = mkdtempSync(join(tmpdir(), 'luach-hermes-'));
const file = join(dir, 'bundle.js');
writeFileSync(file, lowered.code);
const inHermes = execFileSync(hermes, [file], { encoding: 'utf8', maxBuffer: 64 << 20 }).trim();
const inNode = execFileSync(process.execPath, [file], { encoding: 'utf8', maxBuffer: 64 << 20 }).trim();
if (inHermes !== inNode) {
  console.error('Hermes and Node differ.');
  const a = JSON.parse(inHermes), b = JSON.parse(inNode);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) { console.error(i, JSON.stringify(a[i]).slice(0, 300), '\n', JSON.stringify(b[i]).slice(0, 300)); break; }
  }
  process.exit(1);
}
console.log(`Hermes run passed: ${inHermes.length} bytes of output identical to Node.`);
