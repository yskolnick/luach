// Renders every screen of the web build at phone size, in English and Hebrew, light and
// dark, and fails on any page error. Run from apps/demo after `npx expo export --platform web
// --output-dir web-build`:  node scripts/screenshots.mjs [outDir]
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const root = 'web-build';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.ico': 'image/x-icon', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(root, path === '/' ? 'index.html' : path);
  const f = existsSync(file) ? file : join(root, 'index.html');
  res.writeHead(200, { 'content-type': types[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(4300);

const out = process.argv[2] ?? 'screenshots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const errors = [];
let n = 0;
for (const scheme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: scheme });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const locale of ['ashkenazi', 'he']) {
    for (const tab of ['today', 'zmanim', 'week', 'settings']) {
      await page.goto(`http://localhost:4300/?tab=${tab}&locale=${locale}&date=2026-12-04&city=lakewood`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: join(out, `${scheme}-${locale}-${tab}.png`), fullPage: true });
      n++;
    }
  }
  await page.close();
}
await browser.close();
server.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Rendered ${n} screens with no errors into ${out}/`);
