import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const built = (() => { try { execFileSync(process.execPath, ['-e', "require('./dist/index.cjs')"]); return true; } catch { return false; } })();

it.skipIf(!built)('docs/sources.md is generated from the current code, decisions and research notes', async () => {
  // @ts-expect-error: a plain JavaScript script without types
  const { render } = await import('../scripts/gen-sources.mjs');
  expect(readFileSync('docs/sources.md', 'utf8')).toBe(render());
});
