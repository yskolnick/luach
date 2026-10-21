// A tiny self-hosted Luach API using only Node's built-in http module. Not part of the npm package.
//
//   npm run build && node examples/http-server/server.mjs
//   curl 'http://localhost:8080/day?date=2027-03-14&city=Lakewood'
//   curl 'http://localhost:8080/day?lat=31.77&lon=35.21&tz=Asia/Jerusalem&calendar=israel'
//   curl 'http://localhost:8080/holidays?year=5787&calendar=israel'
//
// Luach makes no network calls; this server only answers yours. Ask your rav: it calculates, it does not rule.
import { createServer } from 'node:http';
import * as L from '../../dist/index.js';

const PORT = Number(process.env.PORT ?? 8080);

function location(q) {
  if (q.get('city')) return L.findCity(q.get('city'));
  if (q.get('lat') && q.get('lon')) {
    return { latitude: Number(q.get('lat')), longitude: Number(q.get('lon')), elevation: Number(q.get('elevation') ?? 0), timeZone: q.get('tz') ?? 'UTC' };
  }
  return undefined;
}

function calendarFor(q, loc) {
  const c = q.get('calendar');
  if (c === 'israel' || c === 'diaspora') return c;
  return loc && L.isInIsrael(loc.latitude, loc.longitude) ? 'israel' : 'diaspora';
}

function dayNumber(q, zone) {
  const s = q.get('date');
  if (!s) return L.dayNumberInZone(Date.now(), zone);
  const [y, m, d] = s.split('-').map(Number);
  if (!L.isValidGregorian(y, m, d)) throw new RangeError(`bad date ${s}`);
  return L.gregorianToDayNumber(y, m, d);
}

const routes = {
  '/day': (q) => {
    const loc = location(q);
    if (!loc) throw new RangeError('pass city=NAME or lat, lon, tz');
    return L.getDay(dayNumber(q, loc.timeZone), { location: loc, calendar: calendarFor(q, loc), names: q.get('names') ?? 'en' });
  },
  '/holidays': (q) => {
    const year = Number(q.get('year') ?? L.dayNumberToHebrew(L.dayNumberInZone(Date.now(), 'UTC')).year);
    return L.holidaysInYear(year, { location: calendarFor(q) });
  },
  '/convert': (q) => {
    const n = dayNumber(q, 'UTC');
    return { gregorian: L.dayNumberToGregorian(n), hebrew: L.dayNumberToHebrew(n), text: L.formatHebrewDate(L.dayNumberToHebrew(n), { style: 'he' }) };
  },
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const route = routes[url.pathname];
  try {
    if (!route) throw Object.assign(new Error(`routes: ${Object.keys(routes).join(', ')}`), { status: 404 });
    const body = JSON.stringify(route(url.searchParams));
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
    res.end(body);
  } catch (e) {
    res.writeHead(e.status ?? 400, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: e.message }));
  }
}).listen(PORT, () => console.log(`Luach API on http://localhost:${PORT} — built on Luach by Yosef Skolnick`));
