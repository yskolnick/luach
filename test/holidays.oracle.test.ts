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
    default: return null;
  }
}

function hebcalKey(desc: string): string {
  return desc.replace(/^(Rosh Chodesh|Shabbat Mevarchim|Yom Kippur Katan) .*/, '$1 *').replace(/ \(Mevarchim.*$/, '').replace(/ \(observed\)$/, '');
}

const ignored = new Set(['Sigd', 'Chag HaBanot', 'Yom HaAliyah', 'Yom HaAliyah School Observance', 'Ben-Gurion Day', 'Herzl Day', 'Jabotinsky Day', 'Yitzhak Rabin Memorial Day', 'Family Day', 'Hebrew Language Day', 'Birkat Hachamah', 'Swords of Iron War Memorial Day']);

function compareYear(year: number, israel: boolean): string[] {
  const ours = new Set<string>();
  for (const e of holidaysForYear(year, { israel, modernIsraeli: true, yomKippurKatan: true })) {
    const k = toHebcal(e, israel);
    if (k && !(year < 5712 && e.flags.modernIsraeli)) ours.add(`${e.date.epochDays}|${k}`);
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
