# Places

Luach ships a small table of about 200 cities as its own import, `luach/places`, and, as another,
every city of 15,000+ people (`luach/places-full`; GeoNames, CC-BY 4.0). The main `luach` import
holds neither table. It never looks anything up over the network.

```ts
import { Zmanim } from 'luach';
import { searchPlaces, getPlace } from 'luach/places';
import { fullPlaces } from 'luach/places-full'; // ~900 KB gzip: import only if you need it

searchPlaces('Bene Beraq')[0].id;        // "bnei-brak"
searchPlaces('בני ברק')[0].name;           // "Bnei Brak"
searchPlaces('Manchester', { places: fullPlaces() });

const z = new Zmanim(getPlace('lakewood')!).on({ year: 2027, month: 3, day: 14 });
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
  const today = new Zmanim(here).at(new Date()); // the day at that place
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

## Candle lighting: the city and the position

A built-in place carries its documented candle-lighting custom (Jerusalem 40 minutes, Haifa 30).
The custom applies when you give the city; Luach never guesses a city from coordinates. Times
are always computed from the location's own coordinates. For a GPS position in a chosen city,
spread the city and set the position:

```ts
const here = { ...getPlace('jerusalem')!, latitude: 31.8, longitude: 35.2, elevation: 700 };
new Zmanim(here).settings.candleLightingMinutes; // 40: Jerusalem's custom, at this position
```

The command line does the same with `--city jerusalem --lat 31.8 --lon 35.2`, and the example server
with `?city=jerusalem&lat=31.8&lon=35.2`: the city, with its custom, at that position (the time zone
is the city's unless `--tz` / `tz` is given).

A location without a documented custom gets the common 18 minutes. For every such location in
Israel (a built-in place such as Tel Aviv, a city of the full table, a record of your own, or bare
coordinates) the candle-lighting zman's opinion ends with a note ("Luach has no documented custom
for this place"), and `nowInfo`'s `settings.candleLightingNote` carries it. Pass the
city (with a position, as above) or `candleLightingMinutes` to choose. Ask your rav.
