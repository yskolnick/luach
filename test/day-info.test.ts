import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import { readFileSync } from 'node:fs';
import { dayInfo, dayInfoRange, getPlace, HebrewDate, Month, ashkenazi, civilToDays, daysToCivil } from '../src/index';

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
  it('israel comes from the place unless given explicitly', () => {
    expect(dayInfo({ year: 2026, month: 10, day: 21 }, { location: getPlace('jerusalem')! }).israel).toBe(true);
    expect(dayInfo({ year: 2026, month: 10, day: 21 }, { location: getPlace('jerusalem')!, israel: false }).israel).toBe(false);
  });
  it('fasts carry their times', () => {
    const f = dayInfo(new HebrewDate(5787, Month.TEVES, 10), { location: getPlace('london')! }).fast!;
    expect(f.id).toBe('asarah-bteves');
    expect(f.begins.time! < f.ends.time!).toBe(true);
  });
  it('range', () => {
    expect(dayInfoRange({ year: 2026, month: 10, day: 21 }, 7).map((d) => d.weekday)).toEqual([3, 4, 5, 6, 0, 1, 2]);
  });
});
