// node examples/node/today.mjs   (after `npm run build` in the repository, or with luach installed)
import { HebrewDate, formatHebrewDate, ashkenazi, holidaysBetween, holidayName, getPlace, ZmanimCalendar, zmanLabel } from '../../dist/index.js';

const place = getPlace('lakewood');
const today = HebrewDate.today({ timeZone: place.timeZone });
console.log(formatHebrewDate(today, { locale: ashkenazi, form: 'full' }), '/', formatHebrewDate(today));

for (const e of holidaysBetween(today, today.addDays(7))) {
  console.log(e.date.toCivil(), holidayName(e, ashkenazi));
}

const z = new ZmanimCalendar(place, today);
for (const zman of [z.alos72(), z.sunrise(), z.sofZmanShemaMga72(), z.sofZmanShemaGra(), z.sunset(), z.tzeis8Point5()]) {
  console.log(zman.localTime(), zmanLabel(zman.id, ashkenazi), `(${zman.source})`);
}
