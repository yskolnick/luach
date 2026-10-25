// Writes docs/sources.md: where every time, rule, table and decision in Luach comes from.
// Run after `npm run build` (it reads the ZMANIM table from dist/). A test checks the committed
// file is up to date, so the index cannot drift from the code.
//
// Generated parts: every zman with its source; every citation in the code; every decision and
// ADR; every research note; every test oracle and its licence. Citation-audit results are read
// from docs/research/data/citation-audit-*.json when present.
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { posix } from 'node:path';
import { ZMANIM } from '../dist/index.js';
// Forward slashes on every system, so the file and its links are the same when made on Windows.
const { join } = posix;

const REPO = 'https://github.com/yskolnick/luach/blob/main';
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const link = (path, line) => `[\`${path}${line ? `:${line}` : ''}\`](${REPO}/${path}${line ? `#L${line}` : ''})`;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function firstHeading(path) {
  const m = readFileSync(path, 'utf8').match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : path;
}

// ---- Citation audit (optional data) ----
// Each record: { citation, usedBy: [zman ids], status, url, quote, note, resolution? }.
function loadAudit() {
  const dir = 'docs/research/data';
  const byZman = new Map();
  if (!existsSync(dir)) return byZman;
  for (const f of readdirSync(dir).filter((n) => /^citation-audit-.*\.json$/.test(n)).sort()) {
    for (const c of JSON.parse(readFileSync(join(dir, f), 'utf8'))) {
      for (const id of c.usedBy ?? []) {
        if (!byZman.has(id)) byZman.set(id, []);
        byZman.get(id).push(c);
      }
    }
  }
  return byZman;
}
const AUDIT = loadAudit();
function auditLabel(records) {
  const labels = new Set();
  for (const r of records) {
    if (r.status === 'wrong' || r.status === 'imprecise') labels.add(r.resolution ? 'corrected' : r.status);
    else if (r.status === 'not-read') labels.add('part not verified');
    else if (r.status === 'secondary-read') labels.add('part from a secondary source');
    else if (r.status === 'verified') labels.add('checked');
  }
  return [...labels].join(', ');
}

// ---- Citations in the code ----
const CITE = /\b(SA|Shulchan Aruch|OC|YD|Rambam|Hilchos|MB|Mishna Berura|Mishnah Berurah|Magen Avraham|Rema|Biur Halacha|Taz|Levush|Gemara|Talmud|Berachos|Shabbos \d|Pesachim|Megillah|Rosh Hashana \d|Sukkah|Taanis|Yoma|Beitzah|Shemos|Vayikra|Bamidbar|Devarim|Bereishis|Knesset|Meeus|NOAA|USNO|Hinnant|GeoNames|IANA)\b/;
const SKIP_FILE = /(-data\.ts|labels-data\.ts|opinions\.ts|locales\/)/;

function codeCitations() {
  const rows = [];
  for (const path of walk('src').filter((p) => p.endsWith('.ts') && !SKIP_FILE.test(p))) {
    const lines = readFileSync(path, 'utf8').split('\n');
    let block = null;
    const flush = () => {
      if (block && CITE.test(block.text)) rows.push(block);
      block = null;
    };
    lines.forEach((raw, i) => {
      const t = raw.trim();
      const isComment = t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
      if (!isComment) return flush();
      const text = t.replace(/^(\/\/+|\/\*+|\*+\/?)\s*/, '').replace(/\*\/\s*$/, '').replace(/^-+\s*|\s*-+$/g, '').trim();
      if (!text || text.startsWith('@')) return flush();
      if (block) block.text += ' ' + text;
      else block = { path, line: i + 1, text };
    });
    flush();
  }
  return rows;
}


// ---- Oracles ----
const ROLE = {
  'astronomy-engine': 'Independent solar positions (date-line and grazing-angle cases)',
  'ajv': 'Validates day output against its JSON Schema',
  'ical.js': 'Parses generated iCalendar files',
};
function oracles() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  return Object.keys(pkg.devDependencies ?? {}).sort().map((name) => {
    let licence = 'unknown';
    try {
      const p = JSON.parse(readFileSync(join('node_modules', name, 'package.json'), 'utf8'));
      licence = typeof p.license === 'string' ? p.license : p.license?.type ?? 'unknown';
    } catch { /* not installed */ }
    return { name, licence, role: ROLE[name] };
  });
}

export function render() {
  let o = '';
  o += '---\naside: false\n---\n\n# Sources\n\n';
  o += '> Ask your rav. This library calculates; it does not rule.\n\n';
  o += 'Luach is built in public. This page says where every time, rule, table and default comes\n';
  o += 'from, so anyone can check it. Most of it is generated from the code by\n';
  o += '`scripts/gen-sources.mjs`, and a test fails if it falls out of date.\n\n';
  o += 'The **Audit** column records an independent second check of each zman\'s citations against\n';
  o += 'the texts (`docs/research/2026-10-21-citation-audit-zmanim.md`, data in\n';
  o += '`docs/research/data/citation-audit-zmanim.json`): **checked** means the passage was read and\n';
  o += 'says what Luach claims; **corrected** means the check found a problem and the source was\n';
  o += 'fixed; **part from a secondary source** means a modern work citing it was read instead;\n';
  o += '**part not verified** means part of the source could not be read, and the source says so.\n\n';
  o += '## How a time is calculated\n\n';
  o += '1. **The sun\'s position.** The NOAA Solar Calculator equations, which implement the\n';
  o += '   low-precision solar theory of Jean Meeus, *Astronomical Algorithms* (2nd ed., 1998), chapters\n';
  o += '   25 and 28. NOAA\'s method is a US Government work in the public domain; Luach re-implements it\n';
  o += `   from the published description. Code: ${link('src/zmanim/solar.ts')}.\n`;
  o += '   - NOAA Solar Calculator: <https://gml.noaa.gov/grad/solcalc/>; calculation details:\n';
  o += '     <https://gml.noaa.gov/grad/solcalc/calcdetails.html>\n';
  o += '2. **Sunrise and sunset** are when the sun\'s centre is 90°50′ from the zenith: 34′ for\n';
  o += '   atmospheric refraction plus 16′ for the sun\'s semi-diameter, the standard almanac\n';
  o += '   convention. **A zman at *d* degrees** below the horizon uses the sun\'s centre at 90° + *d*,\n';
  o += '   geometric, with no refraction.\n';
  o += '3. **Elevation** (only where a zman says so) lowers the horizon by the dip angle\n';
  o += '   arccos(R / (R + h)), with R = 6,371 km, the earth\'s mean radius (*As built*).\n';
  o += '4. **Proportional hours** (*sha\'os zmaniyos*) divide the day between the two times that\n';
  o += '   the opinion names, into twelve.\n';
  o += '5. **Rounding** to the minute is up for earliest times and down for deadlines, so a displayed\n';
  o += `   time never moves in the lenient direction. It can be switched off. Code: ${link('src/zmanim/zman.ts')}.\n`;
  o += '6. **Civil time** comes from the IANA time-zone database through the platform\'s `Intl`, or a\n';
  o += '   provider the caller passes. Luach never derives a "standard offset" from a zone or a\n';
  o += `   longitude. Code: ${link('src/time/zone.ts')}. IANA: <https://www.iana.org/time-zones>.\n`;
  o += '7. **When the sun never reaches an angle** (high latitudes), the time is `null` with a reason.\n';
  o += '   Fallbacks are opt-in and marked on the result.\n';
  o += '8. **A second algorithm** for cross-checking: the US Naval Observatory\'s *Almanac for\n';
  o += `   Computers* (1990, public domain). Code: ${link('src/zmanim/usno.ts')}.\n\n`;
  o += 'Accuracy against independent implementations is in [accuracy](./accuracy) and\n';
  o += '[zmanim accuracy](./accuracy-zmanim).\n\n';

  o += '## Every zman and its source\n\n';
  o += `Generated from ${link('src/zmanim/opinions.ts')}. The research behind them is in\n`;
  o += `${link('docs/research/2026-10-21-zmanim-opinions.md')}.\n\n`;
  o += '| Id | Opinion | Source | Rounding | Audit |\n|---|---|---|---|---|\n';
  for (const [id, d] of Object.entries(ZMANIM)) {
    const audit = auditLabel(AUDIT.get(id) ?? []);
    o += `| \`${id}\` | ${esc(d.opinion)} | ${esc(d.source)} | ${d.round} | ${audit} |\n`;
  }
  o += '\n';

  o += '## The calendar\n\n';
  o += '- **Molad, month length, leap years, the four dechiyos and year types:** the Rambam, Hilchos\n';
  o += '  Kiddush HaChodesh, chapters 6–8. Molad BaHaRaD, the month of 29 days, 12 hours and 793\n';
  o += `  chalakim, and the 19-year cycle. Code: ${link('src/calendar/year.ts')}.\n`;
  o += '- **Civil dates:** Howard Hinnant, "chrono-Compatible Low-Level Date Algorithms"\n';
  o += '  (<https://howardhinnant.github.io/date_algorithms.html>), public domain.\n';
  o += `  Code: ${link('src/time/civil.ts')}.\n`;
  o += '- **Holidays, fasts and their postponements, readings, haftaros, tefillah changes, learning\n';
  o += '  cycles:** each rule cites its source in the code. Every such citation is listed in the next\n';
  o += '  section.\n\n';

  o += '## Every citation in the code\n\n';
  o += 'Comments in `src/` that cite a halachic, legal or technical source, generated by scanning\n';
  o += 'the code. Zmanim are in the table above; verse references for haftaros are in\n';
  o += `${link('src/parsha/haftaros-data.ts')} and the [haftaros research note](${REPO}/docs/research/2026-10-21-haftaros.md).\n\n`;
  o += '| Where | Citation |\n|---|---|\n';
  for (const r of codeCitations()) o += `| ${link(r.path, r.line)} | ${esc(r.text)} |\n`;
  o += '\n';

  o += '## Data that ships\n\n';
  o += 'Every table in the package, its source and licence, is in [data sources](./data-sources).\n';
  o += 'In short: calendar constants from the Rambam; city coordinates, elevations, time zones and\n';
  o += 'Hebrew names from GeoNames (<https://www.geonames.org/>, CC-BY 4.0, credited in NOTICE);\n';
  o += 'learning-cycle structure (counts and order, no text) from Sefaria\'s public structure data,\n';
  o += 'checked against the cycles\' published calendars; haftara verse references from the sources\n';
  o += 'in the haftaros research note.\n\n';

  o += '## Clean room\n\n';
  o += 'Luach is written from primary and public-domain sources. Code, tables and structure from\n';
  o += 'other calendar and zmanim libraries and books are never copied. Nothing in `src/` imports any\n';
  o += 'package (`npm run check:imports` and `npm run check:licenses` enforce this).\n\n';
  o += '### Test oracles and tools\n\n';
  o += 'Development dependencies only; none ships in the package.\n\n';
  o += '| Package | Licence | Used for |\n|---|---|---|\n';
  for (const d of oracles()) o += `| \`${d.name}\` | ${esc(d.licence)} | ${d.role ?? 'Build, test or docs tooling'} |\n`;
  o += '\n';

  o += '## Research notes and reports\n\n';
  o += 'Each note records what was read, where, and what was concluded.\n\n';
  for (const f of readdirSync('docs/research').filter((n) => n.endsWith('.md')).sort()) {
    o += `- ${link(`docs/research/${f}`)}: ${esc(firstHeading(join('docs/research', f)))}\n`;
  }
  for (const f of ['docs/accuracy.md', 'docs/accuracy-zmanim.md', 'docs/data-sources.md', 'ROADMAP.md']) {
    if (existsSync(f)) o += `- ${link(f)}: ${esc(firstHeading(f))}\n`;
  }
  o += '\n';
  return o;
}

if (process.argv[1]?.endsWith('gen-sources.mjs')) {
  writeFileSync('docs/sources.md', render());
  console.log('wrote docs/sources.md');
}
