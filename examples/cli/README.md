# The `luach` command

```sh
npx luach today --city lakewood
npx luach date 2027-03-14 --city jerusalem --locale he
npx luach zmanim 2027-03-14 --lat 40.0821 --lon -74.2097 --tz America/New_York --all
npx luach holidays 5787 --israel
npx luach convert 2026-10-21
npx luach convert "14 Adar II 5787"
npx luach ics 2026-09-01 2027-08-31 --city london --learning dafYomi > luach.ics
npx luach cities "bene beraq"
```

Add `--json` for machine-readable output (the same shape as `dayInfo()`;
see `schema/day.schema.json`, shipped as `luach/schema/day.schema.json`).
