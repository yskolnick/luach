// Smoke test of the built CommonJS package.
const L = require('../dist/index.cjs');

const h = L.gregorianToHebrew({ year: 2027, month: 4, day: 22 });
if (h.year !== 5787 || h.day !== 15) throw new Error('bad conversion');
console.log('smoke ok (cjs):', L.formatHebrewDate(h, { style: 'ashkenazi' }));
