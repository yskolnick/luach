# 0004. Day count, month numbering and supported range

- Status: proposed (P-03, P-04)
- Date: 2026-10-21

## Context

Conversions need a common day count. Months need numbers. The range must be stated.

## Proposal

- **Day count:** whole days since 1970-01-01 ("epoch days"), the origin of JavaScript `Date`.
  Gregorian ↔ day count uses Howard Hinnant's public-domain era algorithm, re-implemented.
- **Hebrew ↔ day count** is computed directly from the Rambam (KH 6–8): months since
  BaHaRaD, the molad of Tishrei in chalakim, the four dechiyos. One constant ties the
  Rambam's day 0 (the Sunday before the first molad) to the epoch-day count; it is
  checked by tests against published dates.
- **Months** are numbered from Nisan (1) to Adar (12), with Adar II as 13, following the
  Torah and the Rambam. Adar I in a leap year is 12.
- **Range:** Hebrew years 1–9999 (Gregorian 3761 BCE to 6239 CE). Gregorian dates are
  proleptic (the Gregorian rules extended backward), so there is no silent switch to the
  Julian calendar in 1582. Callers who need Julian dates convert separately.
- `HebrewDate` is a whole day with no time. Converting a `Date` uses its civil date;
  `afterSunset: true` gives the next Hebrew date. The zmanim module provides a
  location-aware day boundary.

## Consequences

Integer arithmetic stays exact (chalakim for year 9999 are about 10^11, well within
2^53). Dates outside the range throw a `RangeError` rather than returning nonsense.
