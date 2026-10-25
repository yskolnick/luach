/* global window */
// Loads the built ESM package (dist/index.js and the modules it imports) in headless
// Chromium from a local server and runs a smoke test in the page: `node
// test/runtimes/smoke-browser.mjs` after `npm run build`. Fails on any page error.
// Uses Playwright's Chromium (or CHROMIUM_PATH); it never downloads a browser itself.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../../', import.meta.url));
const dist = join(root, 'dist');

const page = `<!doctype html><meta charset="utf-8"><title>luach smoke</title><script type="module">
import * as L from '/dist/index.js';
const d = L.HebrewDate.fromGregorian(2026, 10, 21);
const z = new L.ZmanimCalendar(L.getPlace('jerusalem'), d);
const day = L.dayInfo(L.HebrewDate.fromGregorian(2026, 10, 23), { location: L.getPlace('lakewood') });
window.result = {
  hebrew: d.toString(),
  text: L.formatHebrewDate(d),
  sunrise: z.sunrise().localTime(),
  candles: day.candleLighting && day.candleLighting.local,
  ics: L.toICalendar(d, d.addDays(7)).includes('BEGIN:VEVENT'),
};
</script>`;

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (url === '/') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.end(page);
  }
  const file = join(root, url);
  if (!file.startsWith(dist + sep) || !existsSync(file)) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('content-type', 'text/javascript; charset=utf-8');
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

// CHROMIUM_PATH, else Playwright's own Chromium, else a preinstalled one at /opt/pw-browsers.
const executablePath = [process.env.CHROMIUM_PATH, chromium.executablePath(), '/opt/pw-browsers/chromium'].find((c) => c && existsSync(c));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  const p = await browser.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
  p.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForFunction(() => window.result, null, { timeout: 20_000 }).catch(() => {});
  const r = await p.evaluate(() => window.result);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!r) throw new Error('the page did not finish');
  if (r.hebrew !== '5787-8-10') throw new Error(`conversion ${JSON.stringify(r)}`);
  // kosher-zmanim gives 06:46:35 IDT (sea level); rounded up: 06:47 (as in smoke.mjs).
  if (r.sunrise !== '06:47') throw new Error(`sunrise ${JSON.stringify(r)}`);
  if (!r.candles || !r.ics) throw new Error(`missing results ${JSON.stringify(r)}`);
  console.log(`OK (browser, ${browser.version()}):`, r.text, 'sunrise', r.sunrise, 'candles', r.candles);
} finally {
  await browser.close();
  server.close();
}
