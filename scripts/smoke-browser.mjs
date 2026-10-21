/* global window */
// Loads the built ESM bundle in headless Chromium and runs a smoke test in the page.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const page = `<!doctype html><meta charset="utf-8"><script type="module">
import * as L from '/dist/index.js';
const h = L.gregorianToHebrew({ year: 2027, month: 4, day: 22 });
const z = L.netz({ year: 2026, month: 10, day: 21 }, { latitude: 31.7683, longitude: 35.2137, timeZone: 'Asia/Jerusalem' });
const day = L.getDay({ year: 2026, month: 10, day: 23 }, { location: L.findCity('Lakewood'), calendar: 'diaspora' });
window.result = { hebrew: h, text: L.formatHebrewDate(h, { style: 'he' }), netz: z.time && z.time.toISOString(), candles: day.candleLighting && day.candleLighting.local };
</script>`;

const server = createServer((req, res) => {
  if (req.url === '/') return res.end(page);
  const file = join(process.cwd(), decodeURIComponent(req.url));
  if (!file.startsWith(join(process.cwd(), 'dist')) || !existsSync(file)) return (res.statusCode = 404), res.end();
  res.setHeader('content-type', 'text/javascript');
  res.end(readFileSync(file));
}).listen(0);
const port = server.address().port;

// Use a preinstalled Chromium if one is given (CHROMIUM_PATH) or present; otherwise Playwright's own.
const executablePath = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].find((c) => c && existsSync(c));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  const p = await browser.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`http://localhost:${port}/`);
  await p.waitForFunction(() => window.result || false, null, { timeout: 10_000 });
  const r = await p.evaluate(() => window.result);
  if (errors.length) throw new Error(errors.join('\n'));
  if (r.hebrew.year !== 5787 || r.hebrew.day !== 15) throw new Error(`bad conversion ${JSON.stringify(r)}`);
  if (!r.netz || !r.candles) throw new Error(`missing zmanim ${JSON.stringify(r)}`);
  console.log('smoke ok (browser):', r.text, r.netz, 'candles', r.candles);
} finally {
  await browser.close();
  server.close();
}
