// Generates docs/halacha/opinions.md from the built package: every named zman function, with the opinion and
// source the function itself reports. Run after `npm run build`.
import { writeFileSync } from 'node:fs';
import * as L from '../dist/index.js';

const date = { year: 2026, month: 3, day: 20 };
const loc = { latitude: 40.0821, longitude: -74.2097, elevation: 20, timeZone: 'America/New_York' };

const groups = [
  ['Sunrise and sunset', /^(sunrise|sunset|netz|shkiah)/],
  ['Alos (dawn)', /^alos/],
  ['Misheyakir', /^misheyakir/],
  ['Latest Shema', /^sofZmanShema/],
  ['Latest Shacharis', /^sofZmanTefilla/],
  ['Chatzos', /^chatzos/],
  ['Mincha and Plag', /^(mincha|plag)/],
  ['Bein HaShmashos', /^beinHashmashos/],
  ['Tzeis (nightfall)', /^tzeis/],
  ['Erev Pesach', /^sofZman(Achilas|Biur)/],
];

const fns = Object.entries(L).filter(([name, f]) => typeof f === 'function' && f.length >= 2 && !/^(sofZman(Shema|Tefilla|AchilasChametz|BiurChametz)|mincha(Gedola|Ketana)|plagHamincha|alosAtDegrees|misheyakirAtDegrees|tzeisAtDegrees|tzeisAfterMinutes|shaahZmanis|dayOpinion|candleLighting|havdala|fastStarts|fastEnds|fastTimes|getDay|hebrewDateAt|zmanimICalItems|holidayICalItems|toICalendar|usnoSunEvent|solarAltitude|solarTransit)$/.test(name));

const out = [];
const p = (s = '') => out.push(s);
p('# Halachic notes');
p();
p('> **Ask your rav. This library calculates; it does not rule.**');
p();
p('This page lists every zman Luach names, with the opinion and source each function reports about itself (it is');
p('generated from the code). A source marked "(unverified)" has not yet been checked against the text; please');
p('[open an issue](https://github.com/yskolnick/luach/issues) if you can confirm or correct one.');
p();
p('## Conventions');
p();
p('### Sea level and elevation');
p();
p('Sunrise and sunset are computed at sea level unless you pass `{ elevation: true }`, which adds the dip of the');
p('horizon seen from the location\'s elevation, or `{ horizonDip }` with your own value. Times defined by the sun\'s');
p('depression angle (16.1°, 8.5°…) and the fixed-minute times of the Magen Avraham are always computed at sea level');
p('and geometrically: the angles were chosen to match a level of light at a given place and season, and most luchos');
p('that use them compute them this way. Some luchos (for example in Jerusalem) use elevation for netz and shkiah; that');
p('is a choice for the caller.');
p();
p('### Rounding');
p();
p('An earliest time ("not before": alos, netz, mincha, tzeis) rounds **up** to the next minute; a deadline ("not after":');
p('Shema, Tefilla, chametz, shkiah, candle lighting) rounds **down**. The start of a fast is the deadline for eating and');
p('rounds down. Pass `{ rounding: \'none\' }` for exact times, or `\'up\'`/`\'down\'` to force a direction.');
p();
p('### Proportional hours');
p();
p('Hours in the Shulchan Aruch are proportional ("shaos zmaniyos", Rema OC 233:1): a twelfth of the day, where the day');
p('is defined by the opinion:');
p();
p('| Day | Definition | Source |');
p('|---|---|---|');
for (const k of ['gra', 'ma72', 'ma90', 'ma96', 'ma120', 'ma72z', 'ma90z', 'ma16', 'tanya', 'ateret']) {
  const d = L.dayOpinion(k);
  p(`| \`${k}\` | ${d.label} | ${d.source} |`);
}
p();
p('### When the sun doesn\'t reach the angle');
p();
p('Far from the equator the sun may not get 16.1° (or even 8.5°) below the horizon in summer, and near the poles it may');
p('not rise or set. Luach then returns `time: null` and `reason: \'sun-always-above\'` or `\'sun-always-below\'`; it');
p('never returns a made-up time. An opt-in fallback, `{ highLatitude: \'solar-midnight\' }`, uses the moment the sun is');
p('lowest instead and marks the result `fallback: \'solar-midnight\'`. It is a convenience, not a halachic opinion.');
p();
p('### Misheyakir angles');
p();
p('Luach names misheyakir at 11.5°, 11° and 10.2°. Other angles are printed in some luchos (7.65°, 9.5°, 12.85°), but no');
p('published source tying them to a named authority was found; use `misheyakirAtDegrees(x)` for them on your rav\'s');
p('say-so.');
p();
p('### Candle lighting');
p();
p('Candle lighting is a fixed number of minutes before sunset by local custom: 18 is the common default; Jerusalem 40;');
p('Haifa and Zikhron Ya\'akov 30. These are customs, not rules; pass the number your community uses.');
p();
for (const [title, re] of groups) {
  const rows = fns.filter(([name]) => re.test(name));
  if (!rows.length) continue;
  p(`## ${title}`);
  p();
  p('| Function | Opinion | Source | Rounds |');
  p('|---|---|---|---|');
  for (const [name, f] of rows) {
    const z = f(date, loc);
    p(`| \`${name}\` | ${z.opinion} | ${z.source} | ${z.rounded} |`);
  }
  p();
}
p('## Customs in the calendar');
p();
p('- **Yahrzeit in Adar** (death in a common year, anniversary in a leap year): Rema OC 568:7 (Adar I, "and so is the');
p('  custom"), Shulchan Aruch OC 568:7 (Adar II); Mishna Berura 568:42 on keeping both the first time.');
p('- **30 Cheshvan / 30 Kislev**: Magen Avraham 568:20 (fixed by the first anniversary year), with the next-day and');
p('  last-day customs available.');
p('- **Bar mitzvah in Adar**: Rema OC 55:10 (Adar II for someone born in a common year); Levush vs Magen Avraham 55:10 for');
p('  someone born in Adar I whose 13th year is a leap year.');
p('- **Yom Kippur Katan when Erev Rosh Chodesh is Friday**: Friday (Magen Avraham 417) or Thursday (those who say Selichos).');
p('- **Parsha in Israel after an eighth-day-of-Pesach Shabbos**: Mishna Berura 428:10 records more than one custom; Luach');
p('  follows the one current calendars use.');
p();
writeFileSync('docs/halacha/opinions.md', out.join('\n'));
console.log(`wrote docs/halacha/opinions.md (${fns.length} functions)`);
