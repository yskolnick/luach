# Changelog

All notable changes for users of the `luach` package. This project follows
[Semantic Versioning](https://semver.org/).

## Unreleased

### Added
- Hebrew ↔ Gregorian conversion for Hebrew years 1–9999 (`HebrewDate`), computed from
  the Rambam's rules; molad; leap years; year types; month and year lengths.
- Yahrzeit and birthday dates (`anniversary`, `barMitzvahDate`) with a choice of customs.
- Hebrew numerals (`gematriya`, `parseGematriya`).
- Names in Hebrew, Ashkenazi, Sephardi and English (`he`, `ashkenazi`, `sephardi`, `en`),
  pluggable; `formatHebrewDate`; opt-in Unicode isolates for right-to-left text.
