# Parsha

```ts
import { parshaOn, parshiyosOfYear, readingName, readingsDiffer, gregorianToDayNumber } from 'luach';

const r = parshaOn(gregorianToDayNumber(2026, 10, 24), 'diaspora');
r.parsha;                 // ['lech-lecha']
readingName(r, 'he');     // "לך לך"

// A Shabbos that is Yom Tov or Chol Hamoed has no parsha; `special` names the festival reading.
parshaOn(gregorianToDayNumber(2027, 4, 24), 'diaspora'); // { parsha: null, special: 'pesach-chol-hamoed' }

readingsDiffer(n);        // true on the weeks Israel is a parsha ahead of the diaspora
```

The rules follow Shulchan Aruch OC 428:4 and Mishna Berura 428:6 and 428:10. Every Shabbos from 5660 to 6000 matches
an independent implementation in both Israel and the diaspora ([accuracy report](/accuracy)).

## Haftara

```ts
import { shabbosHaftara, haftaraOn } from 'luach';

shabbosHaftara(n, 'diaspora', 'ashkenaz');  // { reference: 'Isaiah 40:27-41:16', reason: 'parsha', parsha: ['lech-lecha'] }
haftaraOn(yomKippur, 'diaspora', 'sephardi'); // Shacharis and Mincha
```

Customs: `'ashkenaz'`, `'sephardi'`, `'chabad'` and `'teimani'` (where a source was found). References only, no text.
Precedence follows the Shulchan Aruch: Yom Tov, then Shuva and the three of affliction and seven of consolation, then the
four parshiyos and Chanukah, then Shabbos HaGadol, Rosh Chodesh and Machar Chodesh, then the parsha. The disputed cases are
options: `roshChodeshAv`, `roshChodeshElul`, `shabbosHagadol`, `shuvaAddition`.

## Pirkei Avos

```ts
import { pirkeiAvos } from 'luach';
pirkeiAvos(shabbos, 'diaspora');                  // [3] — or [5, 6] on the last Shabbos before Rosh Hashana
pirkeiAvos(shabbos, 'diaspora', 'until-shavuos'); // one round only
```
