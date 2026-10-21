// Renders every page of the built docs site in Chromium; fails on any page error or 404.
// Screenshots go to $SHOTS (optional) for a human to look at.
//   npm run docs:build && node scripts/render-docs.mjs
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const dist = 'docs/.vitepress/dist';
const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html') && f !== '404.html') pages.push('/' + relative(dist, p).replace(/index\.html$/, '').replace(/\.html$/, ''));
  }
})(dist);

const port = 4199;
const server = spawn('npx', ['vitepress', 'preview', 'docs', '--port', String(port)], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 3000));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const shots = process.env.SHOTS;
if (shots) mkdirSync(shots, { recursive: true });
const failures = [];
for (const scheme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: scheme === 'light' ? { width: 1280, height: 900 } : { width: 390, height: 844 }, colorScheme: scheme });
  page.on('pageerror', (e) => failures.push(`${page.url()}: ${e.message}`));
  for (const p of pages) {
    const res = await page.goto(`http://localhost:${port}${p}`, { waitUntil: 'networkidle' });
    if (!res || res.status() >= 400) failures.push(`${p}: HTTP ${res?.status()}`);
    if ((await page.title()).startsWith('404')) failures.push(`${p}: 404 page`);
    if (shots && (scheme === 'light' || !p.startsWith('/api/'))) await page.screenshot({ path: join(shots, `${scheme}${p.replace(/\W+/g, '_') || '_home'}.png`) });
  }
  await page.close();
}
await browser.close();
process.kill(-server.pid);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Rendered ${pages.length} pages in light (desktop) and dark (phone): no errors.`);
