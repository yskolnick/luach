// Renders docs/accuracy.md from the oracle comparison. Run:
//   ACCURACY_OUT=/tmp/acc.jsonl FULL_ORACLE=1 npx vitest run test/zmanim.oracle.test.ts
//   node scripts/accuracy-report.mjs /tmp/acc.jsonl > docs/accuracy-zmanim.md
import { readFileSync } from 'node:fs';

const rows = readFileSync(process.argv[2], 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const zmanim = [...new Set(rows.map((r) => r.zman))];
const cities = [...new Set(rows.map((r) => r.city))];
const by = (c, z) => rows.find((r) => r.city === c && r.zman === z);
let out = '# Zmanim accuracy (generated)\n\n';
out += 'Luach against kosher-zmanim 0.9 (test-only oracle), every day of 2025–2028, 19 cities, rounding off. ';
out += 'Cells: largest difference in seconds. `n` = null on one side only (boundary days when the sun first or last reaches an angle). ';
out += '`g` = days where the sun only grazes the angle (lowest point within 0.5°), where any two methods diverge. ';
out += "kosher-zmanim gives Chatham's times a civil day ahead (its issue #37); the comparison asks it for the neighbouring date that lands on Luach's day. Days where no neighbouring date does (kosher-zmanim's solar transit jumps a day when it falls within seconds of 00:00 UTC) are excluded and counted.\n\n";
out += `Compared values: ${rows.reduce((n, r) => n + r.compared, 0).toLocaleString('en-US')}.\n\n`;
out += '| Zman | ' + cities.join(' | ') + ' |\n|---|' + cities.map(() => '---:').join('|') + '|\n';
for (const z of zmanim) {
  out += `| ${z} | ` + cities.map((c) => {
    const r = by(c, z);
    if (!r) return '';
    let cell = r.compared ? r.maxSeconds.toFixed(0) : '–';
    if (r.nullMismatch) cell += ` n${r.nullMismatch}`;
    if (r.grazing?.length) cell += ` g${r.grazing.length}`;
    return cell;
  }).join(' | ') + ' |\n';
}
const unreachable = cities.map((c) => [c, rows.find((r) => r.city === c)?.unreachable ?? 0]).filter(([, n]) => n);
out += '\nDays kosher-zmanim could not produce (transit day-jump near 00:00 UTC): ' + unreachable.map(([c, n]) => `${c} ${n}`).join(', ') + '.\n';
const grazing = rows.filter((r) => r.grazing?.length).map((r) => `${r.city} ${r.zman}: ${r.grazing.join(', ')}`);
out += '\nGrazing-day differences over 60 s:\n\n' + grazing.map((g) => `- ${g}`).join('\n') + '\n';
process.stdout.write(out);
