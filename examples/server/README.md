# Luach as a small HTTP server

Your own zmanim and calendar API in a few lines of Node's built-in `http`:

```sh
npm run build                  # the server imports the built library from dist/
node examples/server/server.mjs   # PORT sets the port, default 8080

curl 'http://localhost:8080/day?date=2027-03-14&city=lakewood'
curl 'http://localhost:8080/now?city=lakewood'
curl 'http://localhost:8080/calendar.ics?from=2027-01-01&to=2027-12-31&city=london'
```

## Not for the open internet

This is an example, not a hardened service. It has no rate limiting, no authentication and no
TLS, and it is a single process. Keep it on a home network, or put it behind a reverse proxy that
limits request rates and sizes. It refuses oversized requests (over 4,096 characters), bounds the
iCal range and checks every parameter, but that is not a substitute for a proxy.

## Endpoints and parameters

| Endpoint | Answers | Parameters it reads |
|---|---|---|
| `/day` | the day as JSON | `date` (YYYY-MM-DD, default today) and the common ones |
| `/now` | the `nowInfo` document for a moment | `at` (an ISO instant with `Z` or `+hh:mm`, default now) and the common ones; needs a place |
| `/calendar.ics` | an iCalendar file | `from` and `to` (YYYY-MM-DD, required; at most 400 days with a place, 5 years without) and the common ones |

The common ones: `city`, `lat`, `lon`, `tz`, `elevation`, `opinions` (a JSON object),
`candleMinutes` (0 to 180), `highLatitude` (`none`, `nearestDay` or `halfNight`),
`chanukahLighting` (`sunset` or `tzeis`), `locale` (`he`, `ashkenazi`, `sephardi`, `en`, `chabad`,
`israeli` or `yi`), `names` (a JSON object of changed names) and `learning` (`1` or `0` for `/day`
and `/now`; for `/calendar.ics` up to five cycle names, such as `dafYomi,mishnaYomis`).

A place is `city=…`, or `lat=…&lon=…&tz=…` (the time zone is required: Luach never guesses it).
`city` with `lat` and `lon` is that city, with its own candle-lighting custom, at that position.

A parameter the endpoint does not read is a `400` that names it and, when one is close, the
parameter you probably meant (`candleMinuts` gives "did you mean candleMinutes?"). It is never
ignored in favour of a default. A parameter given twice is also a `400`.

## Errors

- `400`: the request is wrong; the message says how (plain text).
- `414`: the request is longer than 4,096 characters.
- `404`: no such endpoint.
- `500`: a fault in the server; the message is always "Internal server error".

Every response carries `X-Content-Type-Options: nosniff`.

The server reports times and dates. It does not rule: ask your rav.
