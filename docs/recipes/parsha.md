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
