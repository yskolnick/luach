// node examples/node/today.mjs   (with luach installed: npm install luach)
import { HebrewDate, formatHebrewDate, ashkenazi, holidaysBetween, holidayName, getPlace, Zmanim, zmanLabel } from '../../dist/index.js';

const place = getPlace('lakewood');
const today = HebrewDate.today({ timeZone: place.timeZone });
console.log(formatHebrewDate(today, { locale: ashkenazi, form: 'full' }), '/', formatHebrewDate(today));

for (const e of holidaysBetween(today, today.addDays(7))) {
  console.log(e.date.toCivil(), holidayName(e, ashkenazi));
}

// The opinions a user follows; anything left out uses a documented default.
const zmanim = new Zmanim(place, { shema: 'sof-zman-shema-mga-72' });
for (const zman of zmanim.at(new Date()).slots()) {
  console.log(zman.localTime() ?? '—', zmanLabel(zman.id, ashkenazi), `(${zman.source})`);
}
console.log('Next:', zmanim.next(new Date())?.localTime());
