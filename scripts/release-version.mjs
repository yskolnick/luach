// Sets the release version everywhere it is written, and dates the changelog.
//   node scripts/release-version.mjs 0.1.0
// Updates package.json, package-lock.json, the CLI's VERSION, and turns the CHANGELOG's
// "## Unreleased" heading into "## <version> — <today>" with a fresh Unreleased above it.
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  console.error('usage: node scripts/release-version.mjs <major.minor.patch[-pre]>');
  process.exit(1);
}

function edit(file, change) {
  const before = readFileSync(file, 'utf8');
  const after = change(before);
  if (after === before) {
    console.error(`${file}: nothing to change (already ${version}?)`);
    process.exit(1);
  }
  writeFileSync(file, after);
  console.log(`${file}: ${version}`);
}

for (const file of ['package.json', 'package-lock.json']) {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  json.version = version;
  if (json.packages?.['']) json.packages[''].version = version;
  writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
  console.log(`${file}: ${version}`);
}

edit('src/cli/cli.ts', (s) => s.replace(/export const VERSION = '[^']*';/, `export const VERSION = '${version}';`));

const today = new Date().toISOString().slice(0, 10);
edit('CHANGELOG.md', (s) =>
  s.includes(`## ${version} `) ? s : s.replace(/^## Unreleased$/m, `## Unreleased\n\n## ${version} — ${today}`),
);
