# A whole day as JSON

```ts
import { getDay, findCity } from 'luach';

const day = getDay({ year: 2027, month: 4, day: 21 }, { location: findCity('Lakewood')!, calendar: 'diaspora' });
```

The result is plain JSON: the Gregorian and Hebrew dates, holidays, the coming Shabbos's parsha, the Omer, Hallel,
the rain prayers, the molad on Shabbos Mevorchim, the zmanim (each with `time`, `local`, `opinion` and `source`),
candle lighting and havdala when they apply, and fast times on a fast day.

Its shape is published as a JSON Schema: `luach/schema/day.schema.json`.

The default zmanim are listed in `DEFAULT_DAY_ZMANIM`. That list is a default, not a recommendation; pass `zmanim` to
choose your own:

```ts
import { netz, shkiah, tzeis72 } from 'luach';
getDay(date, { location, calendar: 'israel', zmanim: { netz, shkiah, tzeis72 } });
```
