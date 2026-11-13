# Luach in Home Assistant

Sensors for "is melacha forbidden now", the next candle lighting and havdala, the Hebrew date,
tonight's Omer count and "is a fast on", read from Luach's `/now` document.

**Not tested against a live Home Assistant.** Read `configuration.yaml` before you use it, and
expect to adjust it.

## How it works

A standard Home Assistant install has no Node.js, so Luach runs somewhere else and Home Assistant
asks it over HTTP:

1. Run [`examples/server`](../server) on a small machine or in a container that Home Assistant can
   reach (`node examples/server/server.mjs`; `PORT` sets the port, default 8080). The server
   imports the built library from `dist/`, so run `npm run build` in a checkout first. Luach makes
   no network calls of its own; the server only answers yours.
2. Put [`configuration.yaml`](configuration.yaml) in your Home Assistant configuration. It uses
   Home Assistant's generic `rest` integration with one resource, so one request a minute
   (`scan_interval: 60`) feeds every sensor, all from the same instant.
3. Change `YOUR-SERVER:8080` and the place. The place is `city=…` (a built-in place) or
   `lat=…&lon=…&tz=…` (the time zone is required). An unknown city is an error. Optional `opinions=` is a JSON object in the query, for example
   `opinions={"tzeis":"tzeis-rabbeinu-tam"}` (URL-encoded), `candleMinutes=`, `highLatitude=` and
   `locale=`; `at=` is an ISO instant with an explicit offset (`Z` or `+hh:mm`), for trying a date; `elevation=` (metres) turns on the elevation-adjusted sunrise and sunset.

Try the address in a browser or with `curl` before you restart Home Assistant. The document is
described by [`schema/now.schema.json`](../../schema/now.schema.json).

## The sensors

| Entity | Reads | State |
|---|---|---|
| Luach melacha in effect (binary) | `melacha.inProgress` | on, off, or unavailable |
| Luach fast in progress (binary) | `fast.inProgress` | on, off, or unavailable |
| Luach candle lighting (timestamp) | `melacha.begins.time` | the candle lighting of the Shabbos or Yom Tov run that is on, or else the next |
| Luach havdala (timestamp) | `melacha.ends.time` | the end of that run |
| Luach Hebrew date | `hebrewDate.formatted` | text, in Hebrew (add `&locale=en` to the address for English) |
| Luach Omer tonight | `night.omer`, `nextNight.omer` | the day being counted: the night in progress until its morning (alos in the file; change it to suit), then the coming night's; or `none` |

Timestamps are the displayed minute, rounded on the safe side; the exact instant is in the
document as `exact`.

## Automate on the timestamps

The on/off sensors are read once a minute (`scan_interval: 60`), so an automation on "melacha in
effect" can run up to a minute late. For an automation that must run at a moment (the candles, the
end of Shabbos), use a time trigger on the timestamp sensors: "Luach candle lighting" and "Luach
havdala" (or an offset from them). The state of "Luach melacha in effect" is for display and for
conditions ("only if melacha is not in effect"), not for the moment of change. When a Motzaei
Shabbos scene may run is yours and your rav's to decide: take the timestamp and add what you want.

## `null` is unavailable, never off

In far-north summers, and in a few other places and seasons, the sun does not reach the angle that a
time is defined by, so Luach has no time. Then `melacha.inProgress` is `null`. That is not "no":
treating it as off would let an automation turn on the lights on Shabbos or run a scene at the
wrong time. So each sensor that can be `null` has an `availability` template and shows as
unavailable when it is. Build automations on the state `on` / `off` and let `unavailable` do
nothing, or ask for a decision from a person.

## Things to know

- `availability` on a `rest` entity needs a Home Assistant version that has it. If yours reports
  the key as unknown, update, or remove the line and handle `none` in your own template. This is the
  part of the file most worth checking first.
- The file reports times; it makes no decisions. How long before candles is "erev Shabbos", and
  when your Motzaei Shabbos scene may run, are for you and your rav to decide: compare the instants.
- Opinions and customs (nightfall, havdala, candle-lighting minutes) are Luach's defaults unless you
  pass `opinions=`. Defaults are not rulings. Ask your rav.
