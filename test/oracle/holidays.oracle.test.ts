// Oracle: @hebcal/core (GPL-2.0-or-later), used only as an independent check.
import { describe, expect, it } from 'vitest';
import { HebrewCalendar, flags } from '@hebcal/core';
import { holidaysInYear } from '../../src/holidays/holidays.js';
import { gregorianToDayNumber } from '../../src/calendar/gregorian.js';

// hebcal description → Luach id (null: not compared).
function idOf(desc: string): string | null {
  const rules: [RegExp, string | null][] = [
    [/^Erev Rosh Hashana$/, 'erev-rosh-hashana'], [/^Rosh Hashana \d+$/, 'rosh-hashana-1'], [/^Rosh Hashana II$/, 'rosh-hashana-2'],
    [/^Tzom Gedaliah$/, 'tzom-gedalia'], [/^Shabbat Shuva$/, 'shabbos-shuva'], [/^Erev Yom Kippur$/, 'erev-yom-kippur'],
    [/^Yom Kippur$/, 'yom-kippur'], [/^Erev Sukkot$/, 'erev-sukkos'], [/^Sukkot I$/, 'sukkos-1'], [/^Sukkot II$/, 'sukkos-2'],
    [/^Sukkot [IV]+ \(CH''M\)$/, 'chol-hamoed-sukkos'], [/^Sukkot VII \(Hoshana Raba\)$/, 'hoshana-rabba'],
    [/^Shmini Atzeret$/, 'shemini-atzeres'], [/^Simchat Torah$/, 'simchas-torah'],
    [/^Rosh Chodesh /, 'rosh-chodesh'], [/^Chanukah: \d Candles?$/, 'chanukah*'], [/^Chanukah: 8th Day$/, 'chanukah'],
    [/^Asara B'Tevet$/, 'asara-beteves'], [/^Tu BiShvat$/, 'tu-bishvat'], [/^Shabbat Shirah$/, 'shabbos-shira'],
    [/^Purim Katan$/, 'purim-katan'], [/^Shushan Purim Katan$/, 'shushan-purim-katan'],
    [/^Shabbat Shekalim$/, 'shabbos-shekalim'], [/^Shabbat Zachor$/, 'shabbos-zachor'], [/^Ta'anit Esther$/, 'taanis-esther'],
    [/^Erev Purim$/, null], [/^Purim$/, 'purim'], [/^Shushan Purim$/, 'shushan-purim'], [/^Purim Meshulash$/, 'purim-meshulash'],
    [/^Shabbat Parah$/, 'shabbos-parah'], [/^Shabbat HaChodesh$/, 'shabbos-hachodesh'], [/^Shabbat HaGadol$/, 'shabbos-hagadol'],
    [/^Ta'anit Bechorot$/, 'taanis-bechoros'], [/^Erev Pesach$/, 'erev-pesach'], [/^Pesach I$/, 'pesach-1'], [/^Pesach II$/, 'pesach-2'],
    [/^Pesach [IV]+ \(CH''M\)$/, 'chol-hamoed-pesach'], [/^Pesach VII$/, 'pesach-7'], [/^Pesach VIII$/, 'pesach-8'],
    [/^Pesach Sheni$/, 'pesach-sheni'], [/^Lag BaOmer$/, 'lag-baomer'], [/^Erev Shavuot$/, 'erev-shavuos'],
    [/^Shavuot$/, 'shavuos-1'], [/^Shavuot I$/, 'shavuos-1'], [/^Shavuot II$/, 'shavuos-2'],
    [/^Tzom Tammuz$/, 'shiva-asar-betammuz'], [/^Shabbat Chazon$/, 'shabbos-chazon'], [/^Erev Tish'a B'Av$/, 'erev-tisha-beav'],
    [/^Tish'a B'Av( \(observed\))?$/, 'tisha-beav'], [/^Shabbat Nachamu$/, 'shabbos-nachamu'], [/^Tu B'Av$/, 'tu-beav'],
    [/^Yom HaShoah$/, 'yom-hashoah'], [/^Yom HaZikaron$/, 'yom-hazikaron'], [/^Yom HaAtzma'ut$/, 'yom-haatzmaut'],
    [/^Yom Yerushalayim$/, 'yom-yerushalayim'], [/^Yom HaAliyah$/, 'yom-haaliyah'], [/^Sigd$/, 'sigd'],
    [/^Shabbat Mevarchim/, 'shabbos-mevorchim'], [/^Yom Kippur Katan/, 'yom-kippur-katan'], [/^Leil Selichot$/, 'leil-selichos'],
    [/^Chanukah: 1 Candle$/, 'erev-chanukah'],
  ];
  for (const [re, id] of rules) if (re.test(desc)) return id;
  return null;
}

const COMPARED = new Set([
  'erev-rosh-hashana', 'rosh-hashana-1', 'rosh-hashana-2', 'tzom-gedalia', 'shabbos-shuva', 'erev-yom-kippur', 'yom-kippur',
  'erev-sukkos', 'sukkos-1', 'sukkos-2', 'chol-hamoed-sukkos', 'hoshana-rabba', 'shemini-atzeres', 'simchas-torah',
  'rosh-chodesh', 'chanukah', 'asara-beteves', 'tu-bishvat', 'shabbos-shira', 'purim-katan', 'shushan-purim-katan',
  'shabbos-shekalim', 'shabbos-zachor', 'taanis-esther', 'purim', 'shushan-purim', 'purim-meshulash', 'shabbos-parah',
  'shabbos-hachodesh', 'shabbos-hagadol', 'taanis-bechoros', 'erev-pesach', 'pesach-1', 'pesach-2', 'chol-hamoed-pesach',
  'shemini-atzeres-simchas-torah', 'pesach-7', 'pesach-8', 'pesach-sheni', 'lag-baomer', 'erev-shavuos', 'shavuos-1', 'shavuos-2', 'shiva-asar-betammuz',
  'shabbos-chazon', 'erev-tisha-beav', 'tisha-beav', 'shabbos-nachamu', 'tu-beav', 'yom-hashoah', 'yom-hazikaron',
  'yom-haatzmaut', 'yom-yerushalayim', 'yom-haaliyah', 'sigd', 'shabbos-mevorchim', 'yom-kippur-katan', 'leil-selichos',
]);

// Differences that are explained (docs/accuracy.md). Each entry: `${year}:${which}:${key}`.
// - Yom HaShoah: the Sunday→Monday rule applies from 5757/1997 (Hebrew Wikipedia, "יום הזיכרון לשואה ולגבורה");
//   hebcal applies it to earlier years too.
// - Yom HaZikaron: established in 5711/1951; hebcal lists it from 5708.
// - Yom Yerushalayim: declared in 5728/1968; hebcal also lists 28 Iyar 5727 (the day itself in 1967).
function explained(year: number, line: string): boolean {
  return (
    (year < 5757 && /yom-hashoah/.test(line)) ||
    (year < 5711 && /yom-hazikaron/.test(line)) ||
    (year === 5727 && /yom-yerushalayim/.test(line))
  );
}

import { roshHashana } from '../../src/calendar/hebrew.js';

function hebcalSet(year: number, il: boolean): Set<string> {
  const events = HebrewCalendar.calendar({
    year, isHebrewYear: true, il, shabbatMevarchim: true, yomKippurKatan: true, noModern: false, noMinorFast: false,
    noSpecialShabbat: false, noRoshChodesh: false,
  });
  const out = new Set<string>();
  for (const ev of events) {
    let id = idOf(ev.getDesc());
    if (id === null) continue;
    const g = ev.getDate().greg();
    const n = gregorianToDayNumber(g.getFullYear(), g.getMonth() + 1, g.getDate());
    if (n < roshHashana(year) || n >= roshHashana(year + 1)) continue;
    if (id === 'chanukah*') {
      // hebcal names Chanukah by the candles lit that evening; the Hebrew day is the next one.
      id = 'chanukah';
      out.add(`${id}@${n + 1}`);
      continue;
    }
    if (id === 'shavuos-1' && il) id = 'shavuos-1';
    out.add(`${id}@${n}`);
    void flags;
  }
  return out;
}

for (const location of ['diaspora', 'israel'] as const) {
  describe(`holidays vs hebcal, ${location}, 5660–6000`, () => {
    it('agree on every compared day', () => {
      const diffs: string[] = [];
      for (let year = 5660; year <= 6000; year += 1) {
        const theirs = hebcalSet(year, location === 'israel');
        const ours = new Set(
          holidaysInYear(year, { location, modernIsraeli: true, yomKippurKatan: true, yomKippurKatanOnFriday: 'thursday', leilSelichos: true })
            .filter((h) => COMPARED.has(h.id) && !(h.id === 'purim-meshulash' && h.day !== 3))
            .map((h) => `${h.id === 'shemini-atzeres-simchas-torah' ? 'shemini-atzeres' : h.id}@${h.dayNumber}`),
        );
        for (const k of ours) if (!theirs.has(k) && !explained(year, k)) diffs.push(`${year} only Luach: ${k}`);
        for (const k of theirs) if (!ours.has(k) && !explained(year, k)) diffs.push(`${year} only hebcal: ${k}`);
      }
      expect(diffs.slice(0, 40)).toEqual([]);
    });
  });
}
