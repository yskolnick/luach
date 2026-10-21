// The request handler for server.mjs, separate so it can be tested without a socket.
import { dayInfo, toICalendar, getPlace, searchPlaces, isInIsrael, parseIsoDate, civilDateAt } from '../../dist/index.js';

function placeFrom(q) {
  if (q.get('city')) return getPlace(q.get('city')) ?? searchPlaces(q.get('city'))[0];
  if (q.get('lat') && q.get('lon')) {
    const latitude = Number(q.get('lat'));
    const longitude = Number(q.get('lon'));
    return { latitude, longitude, elevation: Number(q.get('elevation') ?? 0), timeZone: q.get('tz') ?? 'UTC', israel: isInIsrael(latitude, longitude) };
  }
  return undefined;
}

/** Returns { status, type, body } for a URL like "/day?date=2027-03-14&city=lakewood". */
export function handle(url) {
  const u = new URL(url, 'http://localhost');
  const q = u.searchParams;
  try {
    const place = placeFrom(q);
    if (u.pathname === '/day') {
      const date = q.get('date') ? parseIsoDate(q.get('date')) : civilDateAt(Date.now(), place?.timeZone ?? 'UTC');
      return { status: 200, type: 'application/json; charset=utf-8', body: JSON.stringify(dayInfo(date, place ? { location: place } : {})) };
    }
    if (u.pathname === '/calendar.ics') {
      const body = toICalendar(parseIsoDate(q.get('from')), parseIsoDate(q.get('to')), place ? { location: place } : {});
      return { status: 200, type: 'text/calendar; charset=utf-8', body };
    }
    return { status: 404, type: 'text/plain', body: 'Try /day?date=YYYY-MM-DD&city=lakewood or /calendar.ics?from=…&to=…' };
  } catch (e) {
    return { status: 400, type: 'text/plain', body: String(e.message ?? e) };
  }
}
