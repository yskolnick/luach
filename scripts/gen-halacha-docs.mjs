// Writes docs/halacha/zmanim.md from the ZMANIM table in dist/ (run after `npm run build`).
// A test checks the committed file is up to date.
import { writeFileSync } from 'node:fs';
import { ZMANIM, zmanLabel, ashkenazi, he } from '../dist/index.js';

export function render() {
  let out = '---\naside: false\n---\n\n# Zmanim: opinions and sources\n\n';
  out += '> Ask your rav. This library calculates; it does not rule.\n\n';
  out += 'Every zman Luach computes, generated from `src/zmanim/opinions.ts`. "Rounding" is how a\n';
  out += 'displayed time is rounded to the minute: earliest times up, deadlines down. Citations were\n';
  out += 'checked against the texts (see `docs/research/2026-10-21-zmanim-opinions.md`); where an\n';
  out += 'attribution could not be checked, the source says "not verified".\n\n';
  out += '| Id | Name | Opinion | Source | Rounding |\n|---|---|---|---|---|\n';
  for (const [id, d] of Object.entries(ZMANIM)) {
    const esc = (s) => s.replace(/\|/g, '\\|');
    // The Hebrew name sits in its own right-to-left span so its parentheses display correctly.
    out += `| \`${id}\` | ${esc(zmanLabel(id, ashkenazi))}<br><span dir="rtl" lang="he">${esc(zmanLabel(id, he))}</span> | ${esc(d.opinion)} | ${esc(d.source)} | ${d.round} |\n`;
  }
  return out;
}

if (process.argv[1]?.endsWith('gen-halacha-docs.mjs')) {
  writeFileSync('docs/halacha/zmanim.md', render());
  console.log('wrote docs/halacha/zmanim.md');
}
