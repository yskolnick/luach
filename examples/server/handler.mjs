// The request handler for server.mjs, separate so it can be tested without a socket.
import { dayInfo, toICalendar, getPlace, searchPlaces, isInIsrael, parseIsoDate, civilDateAt, civilToDays } from '../../dist/index.js';

// A public endpoint should not compute (or send) years of events per request: with a
// place, every day needs candle lighting and havdala; without one, only all-day events.
export const MAX_ICS_DAYS_WITH_PLACE = 400;
export const MAX_ICS_DAYS = 5 * 366;

function icsRange(q, withPlace) {
  if (!q.get('from') || !q.get('to')) throw new RangeError('from and to are required (YYYY-MM-DD)');
  const from = parseIsoDate(q.get('from'));
  const to = parseIsoDate(q.get('to'));
  const days = civilToDays(to.year, to.month, to.day) - civilToDays(from.year, from.month, from.day) + 1;
  if (days < 1) throw new RangeError('to is before from');
  const max = withPlace ? MAX_ICS_DAYS_WITH_PLACE : MAX_ICS_DAYS;
  if (days > max) {
    throw new RangeError(`The range is ${days} days; ask for at most ${max} days${withPlace ? ' with a place (it adds candle lighting and havdala)' : ''}, and make several requests for more.`);
  }
  return [from, to];
}

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
      const [from, to] = icsRange(q, Boolean(place));
      const body = toICalendar(from, to, place ? { location: place } : {});
      return { status: 200, type: 'text/calendar; charset=utf-8', body };
    }
    return { status: 404, type: 'text/plain', body: 'Try /day?date=YYYY-MM-DD&city=lakewood or /calendar.ics?from=…&to=…' };
  } catch (e) {
    return { status: 400, type: 'text/plain', body: String(e.message ?? e) };
  }
}
