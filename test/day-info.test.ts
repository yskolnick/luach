import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import { readFileSync } from 'node:fs';
import { dayInfo, dayInfoRange, getPlace, HebrewDate, Month, ZmanimCalendar, ashkenazi, civilToDays, daysToCivil } from '../src/index';

const schema = JSON.parse(readFileSync('docs/schema/day.schema.json', 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

describe('dayInfo', () => {
  it('validates against the JSON Schema every day of a year, with and without a place', () => {
    const lakewood = getPlace('lakewood')!;
    const jerusalem = getPlace('jerusalem')!;
    for (let d = civilToDays(2026, 9, 1); d < civilToDays(2027, 9, 1); d++) {
      for (const info of [dayInfo(daysToCivil(d)), dayInfo(daysToCivil(d), { location: d % 2 ? lakewood : jerusalem, locale: ashkenazi })]) {
        const ok = validate(JSON.parse(JSON.stringify(info)));
        if (!ok) throw new Error(`${info.gregorian}: ${ajv.errorsText(validate.errors)}`);
      }
    }
  });
  it('Friday has candle lighting, Shabbos havdala; Yom Tov second night after tzeis', () => {
    const where = { location: getPlace('lakewood')! };
    expect(dayInfo({ year: 2026, month: 10, day: 23 }, where).candleLighting?.id).toBe('candle-lighting');
    expect(dayInfo({ year: 2026, month: 10, day: 24 }, where).havdala?.id).toBe('havdala');
    expect(dayInfo(new HebrewDate(5787, Month.NISAN, 15), where).candleLighting?.id).toBe('candle-lighting-second-night');
  });
  it('Yom Tov on Friday: candles before sunset for Shabbos, not after nightfall', () => {
    // Shabbos begins at sunset (SA OC 261:2) and nothing may be prepared on Yom Tov for the
    // next day after dark (SA OC 503:1), so Friday's candles are lit at the usual time.
    const ny = { location: getPlace('new-york')! };
    const fri = dayInfo({ year: 2027, month: 4, day: 23 }, ny); // Pesach II
    expect(fri.events.map((e) => e.id)).toContain('pesach');
    expect(fri.candleLighting?.id).toBe('candle-lighting');
    expect(fri.candleLighting?.local).toBe('19:25');
    // Thursday (Pesach I) still lights for the second night after nightfall.
    expect(dayInfo({ year: 2027, month: 4, day: 22 }, ny).candleLighting?.id).toBe('candle-lighting-second-night');
  });
  it('Shabbos before Yom Tov lights after Shabbos ends; Yom Tov on Friday lights before sunset', () => {
    // Every Shabbos followed by Yom Tov, and every Yom Tov on a Friday, over four years.
    const ny = { location: getPlace('new-york')! };
    let found = 0;
    for (let d = civilToDays(2026, 9, 1); d < civilToDays(2030, 9, 1); d++) {
      const info = dayInfo(daysToCivil(d), ny);
      const next = dayInfo(daysToCivil(d + 1), ny);
      if (info.weekday === 6 && next.events.some((e) => e.flags.melachaForbidden)) {
        expect(info.candleLighting?.id, info.gregorian).toBe('candle-lighting-second-night');
        expect(info.havdala, info.gregorian).toBeNull();
        found++;
      }
      if (info.weekday === 5 && info.events.some((e) => e.flags.melachaForbidden)) {
        expect(info.candleLighting?.id, info.gregorian).toBe('candle-lighting');
        found++;
      }
    }
    expect(found).toBeGreaterThan(4);
  });
  it('Tisha B\'Av postponed from Shabbos: no havdala Motzaei Shabbos; havdala after the fast', () => {
    // SA OC 556:1: havdala over a cup on the night after the fast; MB 556:2 and SA OC 299:10:
    // "HaMavdil bein kodesh lechol" before melacha on Motzaei Shabbos.
    const ny = { location: getPlace('new-york')! };
    const sat = dayInfo({ year: 2025, month: 8, day: 2 }, ny); // 9 Av 5785 on Shabbos
    expect(sat.weekday).toBe(6);
    expect(sat.havdala).toBeNull();
    expect(sat.shabbosEnds?.id).toBe('shabbos-ends-no-havdala');
    expect(sat.shabbosEnds?.local).toBe('20:56');
    expect(sat.fastBeginsTonight?.id).toBe('tisha-bav');
    expect(sat.fastBeginsTonight?.begins.id).toBe('fast-begins-sunset');
    expect(sat.fastBeginsTonight?.begins.local).toBe('20:10');
    const sun = dayInfo({ year: 2025, month: 8, day: 3 }, ny);
    expect(sun.fast?.id).toBe('tisha-bav');
    expect(sun.havdala?.id).toBe('havdala-after-fast');
    expect(sun.havdala?.time).toBe(sun.fast?.ends.time);
    // An ordinary Shabbos keeps its havdala and has no shabbosEnds entry.
    const plain = dayInfo({ year: 2025, month: 8, day: 9 }, ny);
    expect(plain.havdala?.id).toBe('havdala');
    expect(plain.shabbosEnds).toBeNull();
    // Erev Yom Kippur shows the fast beginning at sunset too.
    const erevYk = dayInfo(new HebrewDate(5787, Month.TISHREI, 9), ny);
    expect(erevYk.fastBeginsTonight?.id).toBe('yom-kippur');
    expect(dayInfo({ year: 2025, month: 8, day: 1 }, ny).fastBeginsTonight).toBeNull();
  });
  it('israel comes from the place unless given explicitly', () => {
    expect(dayInfo({ year: 2026, month: 10, day: 21 }, { location: getPlace('jerusalem')! }).israel).toBe(true);
    expect(dayInfo({ year: 2026, month: 10, day: 21 }, { location: getPlace('jerusalem')!, israel: false }).israel).toBe(false);
  });
  it('fasts carry their times', () => {
    const f = dayInfo(new HebrewDate(5787, Month.TEVES, 10), { location: getPlace('london')! }).fast!;
    expect(f.id).toBe('asarah-bteves');
    expect(f.begins.time! < f.ends.time!).toBe(true);
  });
  it("a place's documented candle-lighting custom applies unless the caller sets minutes", () => {
    const fri = { year: 2026, month: 10, day: 23 };
    const jerusalem = getPlace('jerusalem')!;
    expect(jerusalem.candleLighting?.minutes).toBe(40);
    const c = dayInfo(fri, { location: jerusalem }).candleLighting!;
    expect(c.time).toBe(new ZmanimCalendar(jerusalem, fri).candleLighting(40).toJSON().time);
    expect(c.opinion).toMatch(/40 minutes.*Jerusalem/);
    expect(c.source).toMatch(/Peninei Halakha/);
    // The caller's choice wins.
    const own = dayInfo(fri, { location: jerusalem, candleLightingMinutes: 18 }).candleLighting!;
    expect(own.time).toBe(new ZmanimCalendar(jerusalem, fri).candleLighting(18).toJSON().time);
    // Haifa 30; a place without a documented custom keeps the default.
    const haifa = getPlace('haifa')!;
    expect(dayInfo(fri, { location: haifa }).candleLighting!.time).toBe(new ZmanimCalendar(haifa, fri).candleLighting(30).toJSON().time);
    const tlv = getPlace('tel-aviv')!;
    expect(tlv.candleLighting).toBeUndefined();
    expect(dayInfo(fri, { location: tlv }).candleLighting!.time).toBe(new ZmanimCalendar(tlv, fri).candleLighting(18).toJSON().time);
  });
  it('range', () => {
    expect(dayInfoRange({ year: 2026, month: 10, day: 21 }, 7).map((d) => d.weekday)).toEqual([3, 4, 5, 6, 0, 1, 2]);
  });
});
