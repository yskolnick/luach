// Your own zmanim API in a few lines: node examples/server/server.mjs, then
//   curl 'http://localhost:8080/day?date=2027-03-14&city=lakewood'
//   curl 'http://localhost:8080/now?city=lakewood'
//   curl 'http://localhost:8080/calendar.ics?from=2027-01-01&to=2027-12-31&city=london'
// /now answers "what is true at this moment": the Hebrew date, whether melacha is forbidden and
// until when, the fast, tonight, what comes next. It needs a place (city=…, or lat=…&lon=…&tz=…)
// and takes at=<ISO instant> (default: now) and opinions=<JSON object>, e.g.
//   curl 'http://localhost:8080/now?city=jerusalem&opinions=%7B%22tzeis%22%3A%22tzeis-rabbeinu-tam%22%7D'
// Its shape is schema/now.schema.json. It does not rule: ask your rav.
// city=… with lat=… and lon=… is that city (with its own candle-lighting custom, if it has one) at
// that position; tz is the city's unless given.
// /day and /now include the daily learning (daf yomi and the other cycles) only with learning=1;
// /calendar.ics takes the cycles by name, e.g. learning=dafYomi,mishnaYomis.
// /day, /now and /calendar.ics also take your choices: opinions=<JSON object>, candleMinutes=<0-180>,
// highLatitude=none|nearestDay|halfNight and locale=he|ashkenazi|sephardi|en|chabad|israeli|yi, and
// names=<JSON object> to change names within the locale, e.g. names={"term.shabbos":"Shabbes"}. An unknown city, or
// lat and lon without tz, is a 400 (Luach never guesses a time zone).
// /calendar.ics serves at most 400 days with a place and 5 years without; a longer range
// gets a 400 Bad Request that says so.
// Luach makes no network calls; this server only answers yours.
import { createServer } from 'node:http';
import { handle } from './handler.mjs';

createServer((req, res) => {
  const { status, type, body } = handle(req.url ?? '/');
  res.writeHead(status, { 'content-type': type });
  res.end(body);
}).listen(Number(process.env.PORT ?? 8080));
