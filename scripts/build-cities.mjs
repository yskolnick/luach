// Generates src/places/cities-small.ts and src/places/cities-full.ts from a GeoNames dump.
//
// Usage: node scripts/build-cities.mjs /path/to/cities15000.txt /path/to/alt-he.txt
//   alt-he.txt: the lines of GeoNames alternateNamesV2.txt whose language is "he".
//
// Source: GeoNames cities15000 (https://download.geonames.org/export/dump/), CC-BY 4.0. The generated files are
// committed, so building Luach never needs the network. Elevation: GeoNames `elevation`, else its SRTM-derived
// `dem` value. Hebrew names: GeoNames alternate names tagged "he", the preferred name first, then forms
// without niqqud. The Israel flag uses the same boundary as isInIsrael() (src/places/israel-boundary.json).
import { readFileSync, writeFileSync } from 'node:fs';

const [file, heFile] = process.argv.slice(2);
if (!file || !heFile) {
  console.error('usage: node scripts/build-cities.mjs cities15000.txt alt-he.txt');
  process.exit(1);
}

const NIQQUD = /[\u0591-\u05C7]/;
const hebrewById = new Map();
for (const line of readFileSync(heFile, 'utf8').split('\n')) {
  const f = line.split('\t');
  if (f.length < 4 || !/[\u05D0-\u05EA]/.test(f[3]) || /[A-Za-z]/.test(f[3])) continue;
  const id = Number(f[1]);
  const list = hebrewById.get(id) ?? [];
  list.push({ name: f[3], preferred: f[4] === '1', niqqud: NIQQUD.test(f[3]), historic: f[7] === '1' });
  hebrewById.set(id, list);
}
// Hebrew names missing from GeoNames, entered by hand (see docs/data-sources.md).
const HEBREW_SUPPLEMENT = { 8199378: ['מודיעין עילית'], 8199394: ['אריאל'] };

function hebrewNames(id) {
  if (HEBREW_SUPPLEMENT[id]) return HEBREW_SUPPLEMENT[id];
  const list = (hebrewById.get(id) ?? []).filter((x) => !x.historic && !x.niqqud);
  list.sort((a, b) => Number(b.preferred) - Number(a.preferred));
  return [...new Set(list.map((x) => x.name))].slice(0, 2);
}

const BOUNDARY = JSON.parse(readFileSync('src/places/israel-boundary.json', 'utf8')).points;
function inIsrael(lat, lon) {
  let inside = false;
  for (let i = 0, j = BOUNDARY.length - 1; i < BOUNDARY.length; j = i, i += 1) {
    const [yi, xi] = BOUNDARY[i];
    const [yj, xj] = BOUNDARY[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const LATIN = /^[\p{Script=Latin}0-9 .'’\-()]+$/u;

const rows = readFileSync(file, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const f = line.split('\t');
    const alt = (f[3] || '').split(',').filter(Boolean);
    const elevation = f[15] ? Number(f[15]) : Number(f[16]);
    return {
      id: Number(f[0]),
      name: f[1],
      ascii: f[2],
      hebrew: hebrewNames(Number(f[0])),
      latin: alt.filter((a) => LATIN.test(a) && a !== f[1] && a !== f[2]),
      lat: Number(f[4]),
      lon: Number(f[5]),
      country: f[8],
      admin1: f[10],
      population: Number(f[14]),
      elevation: Number.isFinite(elevation) && elevation > -500 ? Math.round(elevation) : 0,
      tz: f[17],
    };
  });

// Curated default table: [search name, country, admin1 (optional), extra fields].
// Candle-lighting minutes only where a documented local custom exists (see docs/data-sources.md).
const CURATED = [
  ['Jerusalem', 'IL', null, { candleLightingMinutes: 40 }],
  ['Tel Aviv', 'IL'], ['Bnei Brak', 'IL'], ['Haifa', 'IL', null, { candleLightingMinutes: 30 }],
  ['Petah Tiqva', 'IL'], ['Ashdod', 'IL'], ['Netanya', 'IL'], ['Beersheba', 'IL'], ['Bet Shemesh', 'IL'],
  ['Safed', 'IL'], ['Tiberias', 'IL'], ['Eilat', 'IL'], ['Rehovot', 'IL'], ['Ramat Gan', 'IL'], ['Herzliya', 'IL'],
  ["Ra'anana", 'IL'], ['Holon', 'IL'], ['Bat Yam', 'IL'], ['Rishon LeTsiyyon', 'IL'], ['Ashkelon', 'IL'],
  ["Karmi'el", 'IL'], ['Afula', 'IL'], ['Hadera', 'IL'], ['Kfar Saba', 'IL'], ['Hod HaSharon', 'IL'],
  ["Zikhron Ya'aqov", 'IL', null, { candleLightingMinutes: 30 }], ["Modi'in Makkabbim Re'ut", 'IL'],
  ["Ma'ale Adummim", 'PS'], ['Modiin Ilit', 'IL'], ["El'ad", 'IL'], ['Kiryat Gat', 'IL'],
  ['Nazareth', 'IL'], ['Acre', 'IL'], ['Nahariyya', 'IL'], ['Dimona', 'IL'], ['Sderot', 'IL'], ['Ariel', 'IL'],
  ['New York City', 'US', 'NY'], ['Brooklyn', 'US', 'NY'], ['Queens', 'US', 'NY'], ['Lakewood', 'US', 'NJ'],
  ['Monsey', 'US', 'NY'], ['Spring Valley', 'US', 'NY'], ['Kiryas Joel', 'US', 'NY'], ['Teaneck', 'US', 'NJ'],
  ['Passaic', 'US', 'NJ'], ['Toms River', 'US', 'NJ'], ['Baltimore', 'US', 'MD'], ['Silver Spring', 'US', 'MD'],
  ['Washington', 'US', 'DC'], ['Philadelphia', 'US', 'PA'], ['Pittsburgh', 'US', 'PA'], ['Scranton', 'US', 'PA'],
  ['Boston', 'US', 'MA'], ['Chicago', 'US', 'IL'], ['Skokie', 'US', 'IL'], ['Detroit', 'US', 'MI'],
  ['Southfield', 'US', 'MI'], ['Cleveland', 'US', 'OH'], ['Cincinnati', 'US', 'OH'], ['Columbus', 'US', 'OH'],
  ['Atlanta', 'US', 'GA'], ['Miami', 'US', 'FL'], ['Miami Beach', 'US', 'FL'], ['Boca Raton', 'US', 'FL'],
  ['Hollywood', 'US', 'FL'], ['Orlando', 'US', 'FL'], ['Dallas', 'US', 'TX'], ['Houston', 'US', 'TX'],
  ['Austin', 'US', 'TX'], ['Denver', 'US', 'CO'], ['Phoenix', 'US', 'AZ'], ['Las Vegas', 'US', 'NV'],
  ['Los Angeles', 'US', 'CA'], ['San Diego', 'US', 'CA'], ['San Francisco', 'US', 'CA'], ['Seattle', 'US', 'WA'],
  ['Portland', 'US', 'OR'], ['St. Louis', 'US', 'MO'], ['Minneapolis', 'US', 'MN'], ['Milwaukee', 'US', 'WI'],
  ['Memphis', 'US', 'TN'], ['Nashville', 'US', 'TN'], ['Charlotte', 'US', 'NC'], ['New Haven', 'US', 'CT'],
  ['Stamford', 'US', 'CT'], ['Providence', 'US', 'RI'], ['Albany', 'US', 'NY'], ['Buffalo', 'US', 'NY'],
  ['Honolulu', 'US', 'HI'], ['Anchorage', 'US', 'AK'],
  ['Toronto', 'CA'], ['Montreal', 'CA'], ['Vancouver', 'CA'], ['Winnipeg', 'CA'], ['Ottawa', 'CA'], ['Calgary', 'CA'],
  ['Mexico City', 'MX'], ['Buenos Aires', 'AR'], ['São Paulo', 'BR'], ['Rio de Janeiro', 'BR'], ['Santiago', 'CL'],
  ['Panama City', 'PA'], ['Caracas', 'VE'], ['Bogotá', 'CO'], ['Lima', 'PE'], ['Montevideo', 'UY'],
  ['London', 'GB'], ['Manchester', 'GB'], ['Salford', 'GB'], ['Gateshead', 'GB'], ['Leeds', 'GB'], ['Glasgow', 'GB'],
  ['Birmingham', 'GB'], ['Liverpool', 'GB'], ['Dublin', 'IE'],
  ['Paris', 'FR'], ['Marseille', 'FR'], ['Lyon', 'FR'], ['Nice', 'FR'], ['Strasbourg', 'FR'], ['Antwerp', 'BE'],
  ['Brussels', 'BE'], ['Amsterdam', 'NL'], ['Berlin', 'DE'], ['Frankfurt am Main', 'DE'], ['Munich', 'DE'],
  ['Vienna', 'AT'], ['Zürich', 'CH'], ['Geneva', 'CH'], ['Basel', 'CH'], ['Milan', 'IT'], ['Rome', 'IT'],
  ['Madrid', 'ES'], ['Barcelona', 'ES'], ['Lisbon', 'PT'], ['Prague', 'CZ'], ['Budapest', 'HU'], ['Warsaw', 'PL'],
  ['Kraków', 'PL'], ['Moscow', 'RU'], ['Saint Petersburg', 'RU'], ['Kyiv', 'UA'], ['Odesa', 'UA'], ['Dnipro', 'UA'],
  ['Minsk', 'BY'], ['Riga', 'LV'], ['Vilnius', 'LT'], ['Stockholm', 'SE'], ['Copenhagen', 'DK'], ['Oslo', 'NO'],
  ['Helsinki', 'FI'], ['Athens', 'GR'], ['Istanbul', 'TR'], ['Bucharest', 'RO'], ['Reykjavík', 'IS'], ['Tromsø', 'NO'],
  ['Johannesburg', 'ZA'], ['Cape Town', 'ZA'], ['Durban', 'ZA'], ['Casablanca', 'MA'], ['Cairo', 'EG'],
  ['Melbourne', 'AU'], ['Sydney', 'AU'], ['Perth', 'AU'], ['Brisbane', 'AU'], ['Adelaide', 'AU'],
  ['Auckland', 'NZ'], ['Wellington', 'NZ'],
  ['Hong Kong', 'HK'], ['Singapore', 'SG'], ['Shanghai', 'CN'], ['Beijing', 'CN'], ['Tokyo', 'JP'], ['Mumbai', 'IN'],
  ['New Delhi', 'IN'], ['Bangkok', 'TH'], ['Dubai', 'AE'], ['Tbilisi', 'GE'], ['Baku', 'AZ'], ['Tashkent', 'UZ'],
];

function find(name, country, admin1) {
  const n = name.toLowerCase();
  const matches = rows.filter(
    (r) =>
      r.country === country &&
      (!admin1 || r.admin1 === admin1) &&
      (r.name.toLowerCase() === n || r.ascii.toLowerCase() === n),
  );
  matches.sort((a, b) => b.population - a.population);
  return matches[0];
}

const small = [];
const missing = [];
for (const [name, country, admin1, extra] of CURATED) {
  const r = find(name, country, admin1);
  if (!r) {
    missing.push(`${name} (${country}${admin1 ? ` ${admin1}` : ''})`);
    continue;
  }
  small.push({ ...r, extra: extra ?? {} });
}
if (missing.length) console.error(`not found in GeoNames: ${missing.join(', ')}`);

// Israel flag: inside the isInIsrael() boundary. For convenience only; callers decide.
const israeli = (r) => inIsrael(r.lat, r.lon);

function encode(list, withAlternates) {
  const zones = [...new Set(list.map((r) => r.tz))].sort();
  const lines = list.map((r) => {
    const alt = withAlternates ? r.latin.slice(0, 6) : [];
    const fields = [
      r.id,
      r.name,
      r.hebrew.slice(0, 2),
      Math.round(r.lat * 1e4) / 1e4,
      Math.round(r.lon * 1e4) / 1e4,
      r.elevation,
      zones.indexOf(r.tz),
      r.country,
      israeli(r) ? 1 : 0,
      alt,
      r.extra?.candleLightingMinutes ?? 0,
    ];
    return JSON.stringify(fields);
  });
  return { zones, lines };
}

const header = (what) => `// Generated by scripts/build-cities.mjs from GeoNames cities15000 (CC-BY 4.0, https://www.geonames.org).
// Do not edit by hand. ${what}
// Row: [geonameId, name, hebrewNames, latitude, longitude, elevationMetres, zoneIndex, country, israel, alternateNames, candleLightingMinutes]
`;

const s = encode(small, true);
writeFileSync(
  'src/places/cities-small.ts',
  `${header(`${small.length} curated cities.`)}import type { CityRow } from './types.js';

export const ZONES: readonly string[] = ${JSON.stringify(s.zones)};

export const ROWS: readonly CityRow[] = [
${s.lines.map((l) => `  ${l},`).join('\n')}
];
`,
);

const full = rows.slice().sort((a, b) => b.population - a.population).map((r) => ({ ...r, extra: small.find((x) => x.id === r.id)?.extra ?? {} }));
const f = encode(full, false);
writeFileSync(
  'src/places/cities-full-data.ts',
  `${header(`${full.length} cities with population ≥ 15,000, largest first.`)}import type { CityRow } from './types.js';

export const ZONES: readonly string[] = ${JSON.stringify(f.zones)};

export const ROWS: readonly CityRow[] = [
${f.lines.map((l) => `${l},`).join('\n')}
];
`,
);
console.log(`small: ${small.length} cities; full: ${full.length} cities`);
