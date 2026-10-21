import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import { readFileSync } from 'node:fs';
import { dayInfo, dayInfoRange, getPlace, HebrewDate, Month, ashkenazi, en, he, sephardi, civilToDays, daysToCivil, DAY_INFO_SCHEMA_ID, ZmanimCalendar, Zman, ZMANIM, type DayLocation } from '../src/index';
import pkg from '../package.json';

const schemaText = readFileSync('schema/day.schema.json', 'utf8');
const schema = JSON.parse(schemaText);
const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, allowUnionTypes: true });
// dayInfo writes Date#toISOString() instants
ajv.addFormat('date-time', /^[+-]?\d{4,6}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
const validate = ajv.compile(schema);
const check = (info: unknown, where: string) => {
  if (!validate(JSON.parse(JSON.stringify(info)))) throw new Error(`${where}: ${ajv.errorsText(validate.errors)}`);
};

/** Every public ZmanimCalendar method that returns a Zman (no arguments needed). */
const ALL_ZMANIM = (() => {
  const z = new ZmanimCalendar(getPlace('lakewood')!, { year: 2027, month: 1, day: 1 });
  return Object.getOwnPropertyNames(ZmanimCalendar.prototype).filter((n) => {
    const f = Object.getOwnPropertyDescriptor(ZmanimCalendar.prototype, n)?.value as unknown;
    if (n === 'constructor' || typeof f !== 'function') return false;
    try {
      const r = (f as () => unknown).call(z);
      return r instanceof Zman && Object.prototype.hasOwnProperty.call(ZMANIM, r.id);
    } catch {
      return false;
    }
  });
})();

describe('day JSON Schema', () => {
  it('ships as schema/day.schema.json, identical to the docs copy', () => {
    expect(readFileSync('docs/schema/day.schema.json', 'utf8')).toBe(schemaText);
    expect(pkg.files).toContain('schema');
    expect((pkg.exports as Record<string, unknown>)['./schema/day.schema.json']).toBe('./schema/day.schema.json');
  });
  it('$id and dayInfo().$schema name a URL that serves the JSON file, not a web page', () => {
    expect(schema.$id).toBe(DAY_INFO_SCHEMA_ID);
    expect(DAY_INFO_SCHEMA_ID).toMatch(/^https:\/\/raw\.githubusercontent\.com\/yskolnick\/luach\/main\/schema\/day\.schema\.json$/);
    expect(dayInfo({ year: 2027, month: 1, day: 1 }).$schema).toBe(DAY_INFO_SCHEMA_ID);
  });
  it('is closed: no object accepts properties it does not describe', () => {
    const walk = (s: unknown, path: string): void => {
      if (!s || typeof s !== 'object') return;
      const o = s as Record<string, unknown>;
      const types = ([] as unknown[]).concat(o.type ?? []);
      if (types.includes('object') && o.properties) expect(o.additionalProperties, path).toBe(false);
      for (const [k, v] of Object.entries(o)) walk(v, `${path}/${k}`);
    };
    walk(schema, '#');
    const info = JSON.parse(JSON.stringify(dayInfo({ year: 2027, month: 1, day: 1 })));
    expect(validate({ ...info, extra: 1 })).toBe(false);
    expect(validate({ ...info, learning: { ...info.learning, extra: 'x' } })).toBe(false);
    expect(validate({ ...info, $schema: 'https://example.com/other.json' })).toBe(false);
  });
  it('validates real output: a year of days, Israel and diaspora, polar places, every zman and locale', () => {
    const svalbard: DayLocation = { name: 'Longyearbyen', latitude: 78.2232, longitude: 15.6267, elevation: 10, timeZone: 'Arctic/Longyearbyen' };
    const mcmurdo: DayLocation = { latitude: -77.846, longitude: 166.676, timeZone: 'Antarctica/McMurdo' };
    const places = [getPlace('jerusalem')!, getPlace('lakewood')!, getPlace('london')!, getPlace('tromso')!, getPlace('sydney')!, svalbard, mcmurdo];
    const locales = [he, ashkenazi, sephardi, en];
    for (let d = civilToDays(2026, 9, 1); d < civilToDays(2027, 9, 1); d++) {
      const date = daysToCivil(d);
      const i = d - civilToDays(2026, 9, 1);
      check(dayInfo(date), JSON.stringify(date));
      check(dayInfo(date, { israel: true }), 'israel');
      const location = places[i % places.length]!;
      check(dayInfo(date, { location, locale: locales[i % locales.length], israel: i % 3 === 0 ? undefined : i % 3 === 1 }), `${location.name ?? location.latitude} ${d}`);
      if (i % 5 === 0) {
        for (const location of [svalbard, mcmurdo]) {
          check(dayInfo(date, { location, zmanim: ALL_ZMANIM, highLatitudeFallback: i % 10 ? 'nearestDay' : 'none' }), `polar all zmanim ${d}`);
        }
      }
    }
    expect(ALL_ZMANIM.length).toBeGreaterThan(50);
  });
});

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
  it('range', () => {
    expect(dayInfoRange({ year: 2026, month: 10, day: 21 }, 7).map((d) => d.weekday)).toEqual([3, 4, 5, 6, 0, 1, 2]);
  });
});
