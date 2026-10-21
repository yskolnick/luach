// Smoke test of the built ESM package in Node, Bun and Deno.
import * as L from '../dist/index.js';

const h = L.gregorianToHebrew({ year: 2027, month: 4, day: 22 });
if (h.year !== 5787 || h.month !== L.NISAN || h.day !== 15) throw new Error(`bad conversion ${JSON.stringify(h)}`);
const off = L.offsetMinutes('Asia/Jerusalem', Date.UTC(2026, 0, 15));
if (off !== 120) throw new Error(`bad offset ${off}`);
console.log('smoke ok (esm):', L.formatHebrewDate(h, { style: 'he' }));
