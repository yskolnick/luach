import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

// These run against dist/, so they need a build first (CI runs `npm run build` before).
const built = (() => { try { execFileSync(process.execPath, ['-e', "require('./dist/index.cjs')"]); return true; } catch { return false; } })();

describe.skipIf(!built)('examples (against dist/)', () => {
  it('node example runs', () => {
    const out = execFileSync(process.execPath, ['examples/node/today.mjs'], { encoding: 'utf8' });
    expect(out).toMatch(/\d{2}:\d{2}/);
  });
  it('server handler answers JSON and iCal', async () => {
    // @ts-expect-error: a plain JavaScript example without types
    const { handle } = await import('../examples/server/handler.mjs');
    const day = handle('/day?date=2027-03-14&city=lakewood');
    expect(day.status).toBe(200);
    expect(JSON.parse(day.body).hebrew.formatted).toBeTruthy();
    const ics = handle('/calendar.ics?from=2027-01-01&to=2027-01-31&city=london');
    expect(ics.body).toContain('BEGIN:VCALENDAR');
    expect(handle('/nope').status).toBe(404);
    expect(handle('/day?date=junk').status).toBe(400);
  });
});
