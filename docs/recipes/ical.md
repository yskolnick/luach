# iCal export

```ts
import { toICalendar, holidayICalItems, zmanimICalItems, gregorianToDayNumber, netz, shkiah, findCity } from 'luach';

const from = gregorianToDayNumber(2026, 9, 1);
const to = gregorianToDayNumber(2027, 9, 30);
const ics = toICalendar(holidayICalItems(from, to, { location: 'diaspora', names: 'ashkenazi' }), { name: 'Holidays' });

const zmanim = toICalendar(zmanimICalItems(from, from + 30, findCity('Brooklyn')!, { netz, shkiah }));
```

The files follow RFC 5545: CRLF line endings, lines folded at 75 octets, escaped text, all-day holidays and UTC times
for zmanim. UIDs are stable, so re-importing updates events instead of duplicating them. Each zman's description names
its opinion and source.
