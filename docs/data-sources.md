# Data sources

Every dataset or table that ships in Luach, where it came from, and its licence.
Nothing ships unless its licence allows redistribution with credit.

| Data | Where in Luach | Source | Licence | Credit |
|---|---|---|---|---|
| Calendar constants (molad BaHaRaD, month length 29d 12h 793p, leap positions, dechiyos) | `src/calendar/year.ts` | Rambam, Hilchos Kiddush HaChodesh 6–8 | Public domain (12th-century work) | cited in code |
| Civil-date arithmetic | `src/time/civil.ts` | Howard Hinnant, "chrono-Compatible Low-Level Date Algorithms" | Public domain (author's dedication) | cited in code |
| Month and weekday names | `src/locales/*.ts` | Common usage; written for Luach | Apache-2.0 (ours) | — |
| Time-zone rules | not shipped; read at run time from the platform's `Intl` (IANA tz database) | IANA | Public domain | — |

Datasets planned (not yet shipped):

| Data | Source | Licence | Notes |
|---|---|---|---|
| City table (coordinates, elevation, zone) | GeoNames | CC-BY 4.0 | credit in NOTICE when shipped |
| Solar position formulas | NOAA Solar Calculator | US government work, public domain | method re-implemented |
| Learning-cycle start dates and tractate lengths | published calendars of each cycle | facts (not copyrightable) | sources listed per cycle |
| Haftara references | published Chumashim (references only, no text) | facts | sources listed per minhag |
