// Today's Hebrew date, holidays, parsha and a few zmanim for a city.
//   node examples/node/today.mjs [CITY]
import { findCity, getDay, dayNumberInZone } from '../../dist/index.js';

const city = findCity(process.argv[2] ?? 'Jerusalem');
if (!city) throw new Error('city not found');

const today = dayNumberInZone(Date.now(), city.timeZone);
const day = getDay(today, {
  location: city,
  calendar: city.israel ? 'israel' : 'diaspora', // the user should be able to change this
  candleLightingMinutes: city.candleLightingMinutes ?? 18,
});

console.log(`${day.gregorian}  ${day.hebrew.text}  ${day.hebrew.textHebrew}  (${city.name}, ${day.calendar})`);
for (const h of day.holidays) console.log(`  ${h.name}`);
console.log(`Parsha: ${day.parsha.name}`);
for (const key of ['alos72', 'netz', 'sofZmanShemaMA72', 'sofZmanShemaGra', 'shkiah', 'tzeis8_5']) {
  const z = day.zmanim[key];
  console.log(`  ${z.local ?? '--:--'}  ${z.opinion}`);
}
if (day.candleLighting) console.log(`  ${day.candleLighting.local}  ${day.candleLighting.opinion}`);
console.log('Built on Luach by Yosef Skolnick. Ask your rav.');
