// The request handler for server.mjs, kept separate from the socket.
import { dayInfo, nowInfo, Zmanim, toICalendar, isInIsrael, parseIsoDate, civilDateAt, civilToDays, he, ashkenazi, sephardi, en, chabad, israeli, yi, extendLocale, parseNames } from '../../dist/index.js';
import { getPlace, searchPlaces } from '../../dist/places/index.js';
import { dayLearning, icalLearning } from '../../dist/learning/index.js';
import { fullPlaces } from '../../dist/places/full.js';

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

const fold = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g, '').toLowerCase().replace(/[\u2018\u2019'`"\u05f4\u05f3\-\u2013.,()\s]/g, '');

/** True if one of the place's names is the query, or starts with it. */
function strongMatch(p, query) {
  const q = fold(query);
  return [p.name, p.nameHe, ...(p.aliases ?? []), p.id].some((n) => n && fold(n).startsWith(q));
}

// A city is found as the command line finds it: a built-in place by name or prefix; then a city of
// the full table (15,000 people and more) by name or prefix; then any looser built-in match; then
// any looser match in the full table.
function findCity(city) {
  const built = getPlace(city) ?? searchPlaces(city)[0];
  if (built && (built.id === city || strongMatch(built, city))) return built;
  const full = searchPlaces(city, { places: fullPlaces() })[0];
  if (full && strongMatch(full, city)) return full;
  return searchPlaces(city)[0] ?? full;
}

// A number as the command line reads one: digits with an optional sign and fraction, nothing else
// (a blank, "0x10" or "1e3" is not a number here, and is not read as 0 or 16).
const NUMBER = /^-?\d+(\.\d+)?$/;
function numberParam(q, name) {
  const v = q.get(name);
  if (v === null) return undefined;
  if (!NUMBER.test(v)) throw new RangeError(`${name} must be a number, not "${v.slice(0, 40)}"`);
  return Number(v);
}

export const MAX_CITY_LENGTH = 100;

function placeFrom(q) {
  const elevation = numberParam(q, 'elevation');
  if (q.get('city')) {
    if (q.get('city').length > MAX_CITY_LENGTH) throw new RangeError(`city is at most ${MAX_CITY_LENGTH} characters`);
    const p = findCity(q.get('city'));
    if (!p) throw new RangeError(`unknown city "${q.get('city')}"`);
    // A city with a position (a GPS fix in a chosen city): the city, with its custom, at that
    // position; the time zone is the city's unless tz is given. A given elevation replaces the city's.
    if (q.get('lat') !== null || q.get('lon') !== null) {
      if (q.get('lat') === null || q.get('lon') === null) throw new RangeError('give both lat and lon');
      return { ...p, latitude: numberParam(q, 'lat'), longitude: numberParam(q, 'lon'), ...(q.get('tz') ? { timeZone: q.get('tz') } : {}), ...(elevation === undefined ? {} : { elevation }) };
    }
    return elevation === undefined ? p : { ...p, elevation };
  }
  if (q.get('lat') !== null || q.get('lon') !== null) {
    if (q.get('lat') === null || q.get('lon') === null) throw new RangeError('give both lat and lon');
    const latitude = numberParam(q, 'lat');
    const longitude = numberParam(q, 'lon');
    if (!q.get('tz')) throw new RangeError('a time zone is required; Luach never guesses it (tz=…, an IANA name such as America/New_York)');
    return { latitude, longitude, elevation: elevation ?? 0, timeZone: q.get('tz'), israel: isInIsrael(latitude, longitude) };
  }
  return undefined;
}

// An instant with an explicit offset (Z or +hh:mm): without one it would be read in the server's zone.
function instantParam(q, name) {
  const v = q.get(name);
  if (v === null || v === '') return new Date();
  const ok = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v);
  const at = ok ? new Date(v) : null;
  if (!at || Number.isNaN(at.getTime())) throw new RangeError(`${name} must be an ISO 8601 instant with an explicit offset (Z or +hh:mm), e.g. 2026-10-23T15:00:00Z`);
  return at;
}

// The opinions of /now: a JSON object in the query, read with Zmanim.parseOpinions. Anything it
// cannot use is a 400 that says what.
function opinionsFrom(q) {
  const text = q.get('opinions');
  if (!text) return {};
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new RangeError('opinions must be a JSON object, e.g. {"tzeis":"tzeis-rabbeinu-tam"}');
  }
  const parsed = Zmanim.parseOpinions(json);
  if (!parsed.ok) throw new RangeError(`opinions: ${parsed.problems.map((p) => (p.key ? `${p.key}: ` : '') + p.problem).join('; ')}`);
  return parsed.value;
}

// The names of /day, /now and /calendar.ics: a JSON object of { key: name } in the query, read with
// parseNames and applied to the chosen locale (he when none is chosen). Anything it cannot use is a
// 400 that says what.
function namesFrom(q) {
  const text = q.get('names');
  if (!text) return undefined;
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new RangeError('names must be a JSON object, e.g. {"term.shabbos":"Shabbes"}');
  }
  const parsed = parseNames(json);
  if (!parsed.ok) throw new RangeError(`names: ${parsed.problems.map((p) => (p.key ? `${p.key}: ` : '') + p.problem).join('; ')}`);
  return parsed.value;
}

const LOCALES = { he, ashkenazi, sephardi, en, chabad, israeli, yi };

// The caller's choices, from the query: opinions (a JSON object), candleMinutes (0-180),
// highLatitude (none | nearestDay | halfNight), chanukahLighting (sunset | tzeis), locale (he | ashkenazi | sephardi | en | chabad | israeli | yi) and
// names (a JSON object of { key: name }, applied to the locale). Anything
// else is a 400 that says what.
function choicesFrom(q) {
  const out = {};
  const opinions = opinionsFrom(q);
  if (Object.keys(opinions).length) out.opinions = opinions;
  if (q.get('candleMinutes') !== null) {
    const n = NUMBER.test(q.get('candleMinutes')) ? Number(q.get('candleMinutes')) : NaN;
    if (!(n >= 0 && n <= 180)) throw new RangeError('candleMinutes must be a number of minutes from 0 to 180');
    out.candleLightingMinutes = n;
  }
  // An elevation given (for a city too) turns on the elevation-adjusted sunrise and sunset.
  if (numberParam(q, 'elevation') !== undefined) out.useElevation = true;
  if (q.get('highLatitude') !== null) {
    if (!['none', 'nearestDay', 'halfNight'].includes(q.get('highLatitude'))) throw new RangeError('highLatitude must be none, nearestDay or halfNight');
    out.highLatitudeFallback = q.get('highLatitude');
  }
  if (q.get('chanukahLighting') !== null) {
    if (!['sunset', 'tzeis'].includes(q.get('chanukahLighting'))) throw new RangeError('chanukahLighting must be sunset or tzeis');
    out.chanukahLighting = q.get('chanukahLighting');
  }
  if (q.get('locale') !== null) {
    if (!Object.hasOwn(LOCALES, q.get('locale'))) throw new RangeError('locale must be he, ashkenazi, sephardi, en, chabad, israeli or yi');
    out.locale = LOCALES[q.get('locale')];
  }
  const names = namesFrom(q);
  if (names) out.locale = extendLocale(out.locale ?? he, { ...names });
  return out;
}

// learning=1 includes the daily learning in /day and /now; /calendar.ics takes the cycles by name,
// e.g. learning=dafYomi,mishnaYomis.
function learningFor(q, ics) {
  const v = q.get('learning');
  if (v === null) return {};
  if (ics) return { learning: icalLearning(v.split(',').filter(Boolean)) };
  if (v !== '1' && v !== '0') throw new RangeError('learning must be 1 (include it) or 0');
  return v === '1' ? { learning: dayLearning } : {};
}

/**
 * Returns { status, type, body } for a URL like "/day?date=2027-03-14&city=lakewood" or
 * "/now?city=jerusalem". /now takes `at`, an ISO instant with an explicit offset (Z or +hh:mm). /day, /now and /calendar.ics take the
 * caller's choices: `opinions` (a JSON object), `candleMinutes`, `highLatitude`, `chanukahLighting` (`sunset` or `tzeis`), `locale` and `names` (a JSON object); and `learning` (1 for /day and /now, or cycle names such as
 * `dafYomi,mishnaYomis` for /calendar.ics).
 */
export function handle(url) {
  const u = new URL(url, 'http://localhost');
  const q = u.searchParams;
  try {
    const place = placeFrom(q);
    if (u.pathname === '/day') {
      const date = q.get('date') ? parseIsoDate(q.get('date')) : civilDateAt(Date.now(), place?.timeZone ?? 'UTC');
      const choices = choicesFrom(q);
      // With opinions given the day lists the person's own time for each part of the day (as nowInfo and `luach date` do).
      return { status: 200, type: 'application/json; charset=utf-8', body: JSON.stringify(dayInfo(date, { ...choices, ...(choices.opinions ? { zmanim: Zmanim.order } : {}), ...learningFor(q, false), ...(place ? { location: place } : {}) })) };
    }
    if (u.pathname === '/now') {
      if (!place) throw new RangeError('/now needs a place: city=…, or lat=…&lon=…&tz=…');
      const at = instantParam(q, 'at');
      return { status: 200, type: 'application/json; charset=utf-8', body: JSON.stringify(nowInfo(at, place, { ...choicesFrom(q), ...learningFor(q, false) })) };
    }
    if (u.pathname === '/calendar.ics') {
      const [from, to] = icsRange(q, Boolean(place));
      const body = toICalendar(from, to, { ...choicesFrom(q), ...learningFor(q, true), ...(place ? { location: place } : {}) });
      return { status: 200, type: 'text/calendar; charset=utf-8', body };
    }
    return { status: 404, type: 'text/plain', body: 'Try /day?date=YYYY-MM-DD&city=lakewood, /now?city=lakewood or /calendar.ics?from=…&to=…' };
  } catch (e) {
    return { status: 400, type: 'text/plain', body: String(e.message ?? e) };
  }
}
