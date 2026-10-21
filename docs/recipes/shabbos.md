# Shabbos and Yom Tov times

```ts
import { candleLighting, havdala, sofZmanAchilasChametzGra, sofZmanBiurChametzMA72, findCity } from 'luach';

const loc = findCity('Jerusalem')!;
candleLighting(friday, loc, loc.candleLightingMinutes ?? 18);
havdala(saturday, loc);                    // 8.5° by default
havdala(saturday, loc, { minutes: 72 });   // or { degrees: 7.083 }
sofZmanAchilasChametzGra(erevPesach, loc);
sofZmanBiurChametzMA72(erevPesach, loc);
```

## Candle-lighting minutes are a custom

18 minutes before sunset is the common default. Jerusalem keeps 40, and Haifa and Zikhron Ya'akov 30; the built-in
city table carries `candleLightingMinutes` where a custom is documented. Luach found no published source for a fixed
Tzfas figure and leaves it to the caller.

`getDay()` applies the rules for you: candles before sunset on Erev Shabbos and Erev Yom Tov (and before Shabbos even
when Friday is Yom Tov); after nightfall on the second night of Yom Tov; havdala when Shabbos or Yom Tov ends.
