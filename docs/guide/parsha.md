# Parsha and haftara

```ts
import { parshaFor, parshaName, haftaraFor, HebrewDate, ashkenazi } from 'luach';

const shabbos = HebrewDate.fromGregorian(2026, 10, 24);
parshaName(parshaFor(shabbos)?.parsha ?? null, ashkenazi);   // "Lech Lecha"
haftaraFor(shabbos).reference;                      // "Isaiah 40:27-41:16"
haftaraFor(shabbos, { minhag: 'sephardi' }).reference;
```

On a weekday, `parshaFor` returns the coming Shabbos. On a Shabbos that is Yom Tov or Chol
Hamoed, `parsha` is `null` and `holiday` names the day; `haftaraFor` returns that day's
haftara.

Haftaros are references only (no text), for Ashkenaz, Sephardi, Chabad and Teimani
(`null` where no reliable source was found). Special haftaros (the four parshiyos, Rosh
Chodesh, Machar Chodesh, Chanukah, the three and the seven) follow the order of
precedence documented on `haftaraFor`.
