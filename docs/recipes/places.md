# Places and location

```ts
import { findCity, searchCities, nearestCity, isInIsrael } from 'luach';

findCity('Bene Beraq');   // Bnei Brak (spellings, accents and niqqud are folded together)
findCity('בני ברק');      // also Bnei Brak
searchCities('Man', { limit: 5 });
nearestCity(40.08, -74.21); // { city: Lakewood, km: 2.1 }
isInIsrael(31.77, 35.21); // true — a coarse boundary for the Israel calendar; pass an override as the third argument
```

The built-in table has about 180 cities with Jewish communities. The full GeoNames table (34,000 cities) is a separate
import, so it only enters your bundle if you ask for it:

```ts
import { FULL_CITY_TABLE } from 'luach/cities-full';
searchCities('Kiryat Shmona', { table: FULL_CITY_TABLE });
```

## The user's own location

Luach has no geocoder and makes no network calls. Use the platform's location API and pass the coordinates:

```ts
// Browser
navigator.geolocation.getCurrentPosition(({ coords }) => {
  const loc = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  // …use loc with any zman function
});

// React Native (expo-location)
const { coords } = await Location.getCurrentPositionAsync();
```

Location stays on the device unless your app sends it somewhere.

## The Israel boundary

`isInIsrael` uses a coarse polygon around the area whose residents keep the Israel calendar (including the Golan and
Judea and Samaria). It is accurate to a few kilometres, is not a political statement, and only helps you suggest a
default: calendar functions always take `location` explicitly.
