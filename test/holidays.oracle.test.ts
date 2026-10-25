import { describe, expect, it } from 'vitest';
import { HebrewCalendar, HDate } from '@hebcal/core';
import { holidaysForYear, type HolidayEvent } from '../src/index';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Our event → the description hebcal uses, or null when hebcal has no counterpart. */
function toHebcal(e: HolidayEvent, israel: boolean): string | null {
  const n = e.day ?? 0;
  switch (e.id) {
    case 'rosh-hashana': return n === 1 ? `Rosh Hashana ${e.date.year}` : 'Rosh Hashana II';
    case 'erev-rosh-hashana': return 'Erev Rosh Hashana';
    case 'tzom-gedalia': return 'Tzom Gedaliah';
    case 'shabbos-shuva': return 'Shabbat Shuva';
    case 'erev-yom-kippur': return 'Erev Yom Kippur';
    case 'yom-kippur': return 'Yom Kippur';
    case 'erev-sukkos': return 'Erev Sukkot';
    case 'sukkos': return `Sukkot ${ROMAN[n]}`;
    case 'sukkos-chol-hamoed': return `Sukkot ${ROMAN[n]} (CH''M)`;
    case 'hoshana-rabba': return 'Sukkot VII (Hoshana Raba)';
    case 'shemini-atzeres': case 'shemini-atzeres-simchas-torah': return 'Shmini Atzeret';
    case 'simchas-torah': return 'Simchat Torah';
    case 'erev-chanukah': return 'Chanukah: 1 Candle';
    case 'chanukah': return n === 8 ? 'Chanukah: 8th Day' : `Chanukah: ${n + 1} Candles`;
    case 'asarah-bteves': return "Asara B'Tevet";
    case 'tu-bshvat': return 'Tu BiShvat';
    case 'purim-katan': return 'Purim Katan';
    case 'shushan-purim-katan': return 'Shushan Purim Katan';
    case 'shabbos-shekalim': return 'Shabbat Shekalim';
    case 'shabbos-zachor': return 'Shabbat Zachor';
    case 'taanis-esther': return "Ta'anit Esther";
    case 'erev-purim': return 'Erev Purim';
    case 'purim': return 'Purim';
    case 'shushan-purim': return 'Shushan Purim';
    case 'purim-meshulash': return 'Purim Meshulash';
    case 'shabbos-parah': return 'Shabbat Parah';
    case 'shabbos-hachodesh': return 'Shabbat HaChodesh';
    case 'shabbos-hagadol': return 'Shabbat HaGadol';
    case 'taanis-bechoros': return "Ta'anit Bechorot";
    case 'erev-pesach': return 'Erev Pesach';
    case 'pesach': return `Pesach ${ROMAN[n]}`;
    case 'pesach-chol-hamoed': return `Pesach ${ROMAN[n]} (CH''M)`;
    case 'pesach-sheni': return 'Pesach Sheni';
    case 'lag-baomer': return 'Lag BaOmer';
    case 'erev-shavuos': return 'Erev Shavuot';
    case 'shavuos': return israel ? 'Shavuot' : `Shavuot ${ROMAN[n]}`;
    case 'shiva-asar-btammuz': return 'Tzom Tammuz';
    case 'erev-tisha-bav': return "Erev Tish'a B'Av";
    case 'tisha-bav': return "Tish'a B'Av";
    case 'shabbos-chazon': return 'Shabbat Chazon';
    case 'shabbos-shira': return 'Shabbat Shirah';
    case 'shabbos-nachamu': return 'Shabbat Nachamu';
    case 'tu-bav': return "Tu B'Av";
    case 'rosh-hashana-labehemos': return 'Rosh Hashana LaBehemot';
    case 'leil-selichos': return 'Leil Selichot';
    case 'rosh-chodesh': return 'Rosh Chodesh *';
    case 'shabbos-mevorchim': return 'Shabbat Mevarchim *';
    case 'yom-kippur-katan': return 'Yom Kippur Katan *';
    case 'yom-hashoah': return 'Yom HaShoah';
    case 'yom-hazikaron': return 'Yom HaZikaron';
    case 'yom-haatzmaut': return "Yom HaAtzma'ut";
    case 'yom-yerushalayim': return 'Yom Yerushalayim';
    case 'sigd': return 'Sigd';
    case 'yom-haaliyah': return 'Yom HaAliyah School Observance';
    case 'yom-herzl': return 'Herzl Day';
    case 'yom-ben-gurion': return 'Ben-Gurion Day';
    case 'yom-jabotinsky': return 'Jabotinsky Day';
    case 'yom-rabin': return 'Yitzhak Rabin Memorial Day';
    case 'yom-hamishpacha': return 'Family Day';
    case 'yom-zikaron-7-oktober': return 'Swords of Iron War Memorial Day';
    default: return null;
  }
}

function hebcalKey(desc: string): string {
  return desc.replace(/^(Rosh Chodesh|Shabbat Mevarchim|Yom Kippur Katan) .*/, '$1 *').replace(/ \(Mevarchim.*$/, '').replace(/ \(observed\)$/, '');
}

// Explained: Yom HaAliyah's law sets only 7 Cheshvan (10 Nisan is in its purpose clause);
// Hebrew Language Day is moved at a minister's discretion; Birkas HaChama is a separate API.
// Chag HaBanot: hebcal lists the first day of Rosh Chodesh Teves (30 Kislev when there are
// two); Luach lists 1 Teves, the date the Ministry of Education gives (research note).
const COMMEMORATION = new Set(['Sigd', 'Yom HaAliyah School Observance', 'Herzl Day', 'Ben-Gurion Day', 'Jabotinsky Day', 'Yitzhak Rabin Memorial Day', 'Family Day', 'Swords of Iron War Memorial Day']);
/** The first year hebcal lists each commemoration (either locale). */
const FIRST_YEAR = new Map<string, number>();
for (let y = 5660; y <= 6000; y++) {
  for (const ev of HebrewCalendar.calendar({ year: y, isHebrewYear: true, il: true, sedrot: false, omer: false, noModern: false })) {
    const d = ev.getDesc();
    if (COMMEMORATION.has(d) && !FIRST_YEAR.has(d)) FIRST_YEAR.set(d, y);
  }
}
// Compare from the later of the two first years (hebcal and Luach start some of these a
// year apart; Luach starts each from its law, per the research note).
const OURS_FROM: Record<string, number> = { 'Sigd': 5769, 'Yom HaAliyah School Observance': 5777, 'Herzl Day': 5765, 'Ben-Gurion Day': 5737, 'Jabotinsky Day': 5765, 'Yitzhak Rabin Memorial Day': 5758, 'Family Day': 5734, 'Swords of Iron War Memorial Day': 5785 };
for (const [d, y] of Object.entries(OURS_FROM)) FIRST_YEAR.set(d, Math.max(y, FIRST_YEAR.get(d) ?? y));
const ignored = new Set(['Yom HaAliyah', 'Hebrew Language Day', 'Birkat Hachamah', 'Chag HaBanot']);

function compareYear(year: number, israel: boolean): string[] {
  const ours = new Set<string>();
  for (const e of holidaysForYear(year, { israel, modernIsraeli: true, yomKippurKatan: true, israeliCommemorations: true })) {
    const k = toHebcal(e, israel);
    if (e.id === 'yom-haaliyah' && e.moved) continue;
    if (k && !(year < 5712 && e.flags.modernIsraeli) && !(year < 5757 && e.id === 'yom-hashoah') && !(COMMEMORATION.has(k) && (!israel || year < (FIRST_YEAR.get(k) ?? 1e9)))) ours.add(`${e.date.epochDays}|${k}`);
  }
  const theirs = new Set<string>();
  const evs = HebrewCalendar.calendar({ year, isHebrewYear: true, il: israel, sedrot: false, omer: false, yomKippurKatan: true, shabbatMevarchim: true, noModern: false });
  for (const ev of evs) {
    const desc = ev.getDesc();
    if (ignored.has(desc) || /Candle lighting|Havdalah|Fast/.test(desc)) continue;
    const hd: HDate = ev.getDate();
    if (hd.getFullYear() !== year) continue;
    // Modern days: compared from 5712 (1951/2); before that the first observances differ by
    // listing convention (see docs/accuracy.md).
    if (year < 5712 && /Yom Ha/.test(desc)) continue;
    if (year < 5728 && desc === 'Yom Yerushalayim') continue;
    // Explained difference: hebcal moves a Sunday Yom HaShoah to Monday in every year; the
    // Knesset adopted that rule in 1997 (5757), so earlier Sunday years stay on Sunday.
    if (year < 5757 && desc === 'Yom HaShoah') continue;
    // Commemorations: first years differ by listing convention; compared from hebcal's first year.
    // Yom HaAliyah on a Friday: the 2016 law moves it to the Wednesday before; hebcal does not.
    if (desc === 'Yom HaAliyah School Observance' && hd.getDay() === 5) continue;
    if (COMMEMORATION.has(desc) && (!israel || year < (FIRST_YEAR.get(desc) ?? 1e9))) continue;
    const days = Math.round((hd.greg().getTime() - new Date(hd.greg().getFullYear(), hd.greg().getMonth(), hd.greg().getDate()).getTime()) / 864e5) +
      Math.round(Date.UTC(hd.greg().getFullYear(), hd.greg().getMonth(), hd.greg().getDate()) / 864e5);
    theirs.add(`${days}|${hebcalKey(desc)}`);
  }
  const diff: string[] = [];
  for (const x of ours) if (!theirs.has(x)) diff.push(`only ours: ${x}`);
  for (const x of theirs) if (!ours.has(x)) diff.push(`only hebcal: ${x}`);
  return diff;
}

describe('holidays: oracle @hebcal/core, 5660–6000 (1899–2240)', () => {
  for (const israel of [false, true]) {
    it(israel ? 'Israel' : 'diaspora', () => {
      const all: string[] = [];
      for (let y = 5660; y <= 6000; y++) all.push(...compareYear(y, israel).map((s) => `${y}: ${s}`));
      expect(all.slice(0, 30)).toEqual([]);
    });
  }
});
