# Places

Luach ships a small table of about 200 cities and, as a separate import, every city of
15,000+ people (GeoNames, CC-BY 4.0). It never looks anything up over the network.

```ts
import { searchPlaces, getPlace, ZmanimCalendar } from 'luach';
import { fullPlaces } from 'luach/places-full'; // ~900 KB gzip: import only if you need it

searchPlaces('Bene Beraq')[0].id;        // "bnei-brak"
searchPlaces('בני ברק')[0].name;           // "Bnei Brak"
searchPlaces('Manchester', { places: fullPlaces() });

const z = new ZmanimCalendar(getPlace('lakewood')!, { year: 2027, month: 3, day: 14 });
```

## Your user's own location

Use the platform's location service and the device's time zone; pass the numbers to Luach.
Nothing leaves the device.

```ts
// Browser
navigator.geolocation.getCurrentPosition((pos) => {
  const here = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    elevation: pos.coords.altitude ?? 0,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const z = new ZmanimCalendar(here, HebrewDate.today());
});

// React Native (Expo)
import * as Location from 'expo-location';
const { coords } = await Location.getCurrentPositionAsync({});
const here = { latitude: coords.latitude, longitude: coords.longitude, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
```

To turn a typed address into coordinates, use the geocoder of your platform or map
provider, under its own terms; Luach does not include one.

## Israel or the diaspora

`isInIsrael(lat, lon)` checks a simplified outline (see `ISRAEL_BOUNDARY`) of the area where
one day of Yom Tov is kept.

When you pass a place to `dayInfo`, `toICalendar`, `fastTimes` or `isMelachaForbiddenAt` and
do not pass `israel`, the place decides: a built-in place's own `israel` flag, or otherwise
`isInIsrael` on its coordinates. With no place, the diaspora is the default. Near a border,
or for any halachic question, ask your rav, and pass `{ israel: true }` or
`{ israel: false }` yourself: an explicit option always wins.
