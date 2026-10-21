import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { getDay } from '../src/day/day.js';
import { findCity } from '../src/places/places.js';
import { gregorianToDayNumber } from '../src/calendar/gregorian.js';

const schema = JSON.parse(readFileSync('schema/day.schema.json', 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

describe('getDay', () => {
  it('validates against the JSON Schema for every day of a year, in 4 places', () => {
    for (const [name, calendar] of [['Jerusalem', 'israel'], ['Lakewood', 'diaspora'], ['London', 'diaspora'], ['Tromsø', 'diaspora']] as const) {
      const loc = findCity(name)!;
      for (let n = gregorianToDayNumber(2027, 1, 1); n <= gregorianToDayNumber(2027, 12, 31); n += 1) {
        const d = JSON.parse(JSON.stringify(getDay(n, { location: loc, calendar, ...(n % 2 ? { minhag: 'ashkenaz' as const } : {}) })));
        if (!validate(d)) throw new Error(`${name} ${d.gregorian}: ${ajv.errorsText(validate.errors)}`);
      }
    }
  });
  it('candle lighting and havdala around Yom Tov and Shabbos', () => {
    const loc = findCity('Lakewood')!;
    const day = (y: number, m: number, d: number) => getDay({ year: y, month: m, day: d }, { location: loc, calendar: 'diaspora' });
    expect(day(2027, 4, 21).candleLighting?.opinion).toContain('18 minutes before sunset'); // Erev Pesach
    expect(day(2027, 4, 22).candleLighting?.opinion).toContain('after nightfall'); // second night
    expect(day(2027, 4, 23).candleLighting?.opinion).toContain('before sunset'); // Yom Tov Friday → Shabbos
    expect(day(2027, 4, 24).havdala).not.toBeNull(); // Shabbos Chol Hamoed
    expect(day(2026, 10, 2).candleLighting).not.toBeNull(); // Hoshana Rabba → Shemini Atzeres
    expect(day(2026, 10, 21).candleLighting).toBeNull(); // ordinary Wednesday
  });
  it('fast day times', () => {
    const d = getDay({ year: 2026, month: 9, day: 14 }, { location: findCity('Brooklyn')!, calendar: 'diaspora' }); // Tzom Gedalia 5787 (3 Tishrei on Monday)
    expect(d.holidays.map((h) => h.id)).toContain('tzom-gedalia');
    expect(d.fast?.begins.opinion).toContain('Fast begins');
  });
  it('Omer and Shabbos Mevorchim molad', () => {
    const loc = findCity('Brooklyn')!;
    expect(getDay({ year: 2027, month: 5, day: 25 }, { location: loc, calendar: 'diaspora' }).omer?.day).toBeGreaterThan(30);
    const mev = getDay({ year: 2026, month: 11, day: 7 }, { location: loc, calendar: 'diaspora' });
    expect(mev.molad).toMatch(/^Molad Kislev/);
  });
});
