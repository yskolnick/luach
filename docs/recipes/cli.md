# Command line

```sh
npx luach today --city Lakewood
npx luach zmanim 2027-03-14 --lat 40.08 --lon -74.21 --tz America/New_York
npx luach holidays 5787 --israel
npx luach parsha 2026-10-24 --diaspora
npx luach convert 2026-10-21
npx luach convert 5787-8-10 --hebrew
npx luach ical holidays --from 2026-09-01 --to 2027-09-30 > holidays.ics
npx luach cities "bnei brak"
```

`--json` prints the same data as `getDay()`. With a city, the Israel or diaspora calendar is taken from the city and the
output says so; `--israel` or `--diaspora` overrides it.
