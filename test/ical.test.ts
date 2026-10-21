import { describe, expect, it } from 'vitest';
import ICAL from 'ical.js';
import { toICalendar, icalFold, icalEscape, getPlace, ashkenazi, rambamThreeChapters, HebrewDate, daysToCivil, civilToDays } from '../src/index';

describe('iCalendar export', () => {
  const ics = toICalendar({ year: 2026, month: 9, day: 1 }, { year: 2026, month: 12, day: 31 }, {
    location: getPlace('lakewood')!, learning: ['dafYomi', 'mishnaYomis'], zmanim: ['sofZmanShemaGra'], now: new Date(Date.UTC(2026, 9, 21)), locale: ashkenazi,
  });
  it('parses with an independent parser (ical.js) and has the expected events', () => {
    const comp = new ICAL.Component(ICAL.parse(ics));
    const events = comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v));
    const summaries = events.map((e) => e.summary);
    expect(summaries).toContain('Rosh Hashana I');
    expect(summaries).toContain('Parshas Lech Lecha');
    expect(summaries).toContain('Candle lighting');
    expect(summaries.some((s) => s.startsWith('Daf Yomi:'))).toBe(true);
    const yk = events.find((e) => e.summary === 'Yom Kippur')!;
    expect(yk.startDate.toString()).toBe('2026-09-21');
    expect(yk.startDate.isDate).toBe(true);
    const uids = new Set(events.map((e) => e.uid));
    expect(uids.size).toBe(events.length);
  });
  it('is RFC 5545-shaped: CRLF, folded at 75 octets, escaped', () => {
    for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(icalEscape('a,b;c\nd\\')).toBe('a\\,b\\;c\\nd\\\\');
    const long = 'SUMMARY:' + 'א'.repeat(60);
    expect(icalFold(long).split('\r\n ').every((p) => new TextEncoder().encode(p).length <= 75)).toBe(true);
  });
  it('reproducible with a fixed timestamp', () => {
    const a = toICalendar({ year: 2027, month: 1, day: 1 }, { year: 2027, month: 1, day: 31 }, { now: new Date(0) });
    const b = toICalendar({ year: 2027, month: 1, day: 1 }, { year: 2027, month: 1, day: 31 }, { now: new Date(0) });
    expect(a).toBe(b);
  });
  it('Yom Tov on Friday: candles for Shabbos before sunset (same rule as dayInfo)', () => {
    const ics = toICalendar({ year: 2027, month: 4, day: 23 }, { year: 2027, month: 4, day: 23 }, { location: getPlace('new-york')!, now: new Date(0), locale: ashkenazi });
    const comp = new ICAL.Component(ICAL.parse(ics));
    const candles = comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v)).find((e) => e.summary === 'Candle lighting')!;
    expect(candles.startDate.toJSDate().toISOString()).toBe('2027-04-23T23:25:00.000Z');
  });
  it('Tisha B\'Av postponed from Shabbos: Shabbos ends without havdala; havdala after the fast', () => {
    const ics = toICalendar({ year: 2025, month: 8, day: 2 }, { year: 2025, month: 8, day: 3 }, { location: getPlace('new-york')!, now: new Date(0), locale: ashkenazi, holidays: false, parsha: false });
    const comp = new ICAL.Component(ICAL.parse(ics));
    const events = comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v));
    expect(events.map((e) => [e.summary, e.startDate.toJSDate().toISOString()])).toEqual([
      ['Shabbos ends (no havdala)', '2025-08-03T00:56:00.000Z'],
      ['Havdala (after the fast)', '2025-08-04T00:46:00.000Z'],
    ]);
  });
  it('escapes backslash, semicolon, comma and every line break (RFC 5545 §3.3.11)', () => {
    expect(icalEscape('a;b')).toBe('a\\;b');
    expect(icalEscape('a\\b')).toBe('a\\\\b');
    expect(icalEscape('a,b')).toBe('a\\,b');
    expect(icalEscape('a\r\nb\nc\rd')).toBe('a\\nb\\nc\\nd');
    expect(icalEscape('\\;')).toBe('\\\\\\;');
  });
  it('round-trips the calendar name and Rambam summaries through ical.js', () => {
    const name = 'My;Cal\rX, \\ "q"\r\nnext\nlast';
    const start = { year: 2026, month: 10, day: 1 };
    const end = { year: 2027, month: 3, day: 31 };
    const out = toICalendar(start, end, {
      name, holidays: false, parsha: false, learning: ['rambamThreeChapters'], locale: ashkenazi, now: new Date(0),
    });
    // no raw CR or LF except as the CRLF line separator
    expect(out.split('\r\n').join('')).not.toMatch(/[\r\n]/);
    // X-WR-CALNAME is a de-facto TEXT property; ical.js leaves unknown properties unescaped
    // unless told their type.
    const props = ICAL.design.defaultSet.property as Record<string, { defaultType: string }>;
    props['x-wr-calname'] ??= { defaultType: 'text' };
    const comp = new ICAL.Component(ICAL.parse(out));
    expect(comp.getFirstPropertyValue('x-wr-calname')).toBe('My;Cal\nX, \\ "q"\nnext\nlast');
    const summaries = comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v).summary);
    const expected: string[] = [];
    for (let d = civilToDays(start.year, start.month, start.day); d <= civilToDays(end.year, end.month, end.day); d++) {
      const r = rambamThreeChapters(HebrewDate.fromCivil(daysToCivil(d)));
      if (r) expected.push(r.text);
    }
    expect(summaries).toEqual(expected);
    expect(expected.some((s) => s.includes(';'))).toBe(true);
    expect(expected.some((s) => s.includes(','))).toBe(true);
  });
  it('rejects an invalid DTSTAMP time', () => {
    expect(() => toICalendar({ year: 2027, month: 1, day: 1 }, { year: 2027, month: 1, day: 2 }, { now: new Date(NaN) })).toThrow(RangeError);
  });
  it('accepts only zman methods in the zmanim option', () => {
    const s = { year: 2027, month: 1, day: 1 };
    const location = getPlace('lakewood')!;
    for (const bad of ['constructor', 'make', 'rise', 'angle', 'riseSet', 'erevPesach', 'nextDay', 'hebrewDate', 'toString', 'hasOwnProperty', '__proto__', 'shaahZmanisGra', 'nope']) {
      expect(() => toICalendar(s, s, { location, zmanim: [bad], now: new Date(0) }), bad).toThrow(new RangeError(`${bad} is not a zman`));
    }
    const ok = toICalendar(s, s, { location, zmanim: ['sofZmanShemaGra', 'sunset', 'havdala'], now: new Date(0), candleLighting: false, holidays: false });
    expect(ok.match(/BEGIN:VEVENT/g)).toHaveLength(3);
  });
});
