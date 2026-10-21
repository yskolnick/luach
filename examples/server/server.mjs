// Your own zmanim API in a few lines: node examples/server/server.mjs, then
//   curl 'http://localhost:8080/day?date=2027-03-14&city=lakewood'
//   curl 'http://localhost:8080/calendar.ics?from=2027-01-01&to=2027-12-31&city=london'
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
