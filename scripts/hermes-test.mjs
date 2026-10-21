// Runs the shared vectors in Node and in Hermes (hermes-engine-cli) and requires identical output,
// except for `intlAvailable`, which documents whether the engine has Intl (the Hermes CLI does not).
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'luach-hermes-'));
const bundle = join(dir, 'vectors.js');
await build({
  entryPoints: ['test/hermes/entry.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2019',
  outfile: bundle,
  logLevel: 'error',
});

const platform = { linux: 'linux64-bin', darwin: 'osx-bin', win32: 'win64-bin' }[process.platform];
const hermes = join('node_modules', 'hermes-engine-cli', platform, process.platform === 'win32' ? 'hermes.exe' : 'hermes');
if (process.platform !== 'win32') chmodSync(hermes, 0o755);

const fromNode = JSON.parse(execFileSync(process.execPath, [bundle], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const fromHermes = JSON.parse(execFileSync(hermes, [bundle], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] }));
writeFileSync(join(dir, 'node.json'), JSON.stringify(fromNode, null, 1));
writeFileSync(join(dir, 'hermes.json'), JSON.stringify(fromHermes, null, 1));

delete fromNode.intlAvailable;
const hermesIntl = fromHermes.intlAvailable;
delete fromHermes.intlAvailable;
const a = JSON.stringify(fromNode);
const b = JSON.stringify(fromHermes);
if (a !== b) {
  const keys = Object.keys(fromNode).filter((k) => JSON.stringify(fromNode[k]) !== JSON.stringify(fromHermes[k]));
  console.error(`✗ Hermes output differs from Node in: ${keys.join(', ')} (see ${dir})`);
  process.exit(1);
}
console.log(`✓ Hermes matches Node on ${Object.keys(fromNode).length} vector groups (Hermes Intl: ${hermesIntl ? 'yes' : 'no — provider path tested'})`);
