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
  it('server caps the iCal range: 400 days with a place (timed events), 5 years without', async () => {
    // @ts-expect-error: a plain JavaScript example without types
    const { handle, MAX_ICS_DAYS_WITH_PLACE, MAX_ICS_DAYS } = await import('../examples/server/handler.mjs');
    expect(MAX_ICS_DAYS_WITH_PLACE).toBe(400);
    expect(MAX_ICS_DAYS).toBe(5 * 366);
    const t0 = Date.now();
    const big = handle('/calendar.ics?from=2020-01-01&to=2030-12-31&city=lakewood');
    expect(Date.now() - t0).toBeLessThan(200);
    expect(big.status).toBe(400);
    expect(big.type).toMatch(/^text\/plain/);
    expect(big.body).toMatch(/at most 400 days/);
    // 400 days inclusive is allowed with a place; 401 is not
    expect(handle('/calendar.ics?from=2027-01-01&to=2028-02-04&city=lakewood').status).toBe(200);
    expect(handle('/calendar.ics?from=2027-01-01&to=2028-02-05&city=lakewood').status).toBe(400);
    // without a place (all-day events only) up to 5 years
    expect(handle('/calendar.ics?from=2027-01-01&to=2031-12-31').status).toBe(200);
    const tooLong = handle('/calendar.ics?from=2027-01-01&to=2032-01-06');
    expect(tooLong.status).toBe(400);
    expect(tooLong.body).toMatch(/at most 1830 days/);
    expect(handle('/calendar.ics?from=2027-01-01').status).toBe(400);
    expect(handle('/calendar.ics?from=2027-02-01&to=2027-01-01').status).toBe(400);
  });
});
