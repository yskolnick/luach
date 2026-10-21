/** One row of a city table; see the header of the generated files. */
export type CityRow = readonly [
  geonameId: number,
  name: string,
  hebrewNames: readonly string[],
  latitude: number,
  longitude: number,
  elevation: number,
  zoneIndex: number,
  country: string,
  israel: 0 | 1,
  alternateNames: readonly string[],
  candleLightingMinutes: number,
];
