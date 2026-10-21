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
