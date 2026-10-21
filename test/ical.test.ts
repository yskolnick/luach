import { describe, expect, it } from 'vitest';
import ICAL from 'ical.js';
import { toICalendar, icalFold, icalEscape, getPlace, ashkenazi } from '../src/index';

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
    expect(icalEscape('a,b;c\nd\\')).toBe('a\\,b\;c\\nd\\\\');
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
});
