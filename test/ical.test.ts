import { describe, expect, it } from 'vitest';
import { foldLine, escapeText, holidayICalItems, toICalendar, zmanimICalItems } from '../src/ical/ical.js';
import { gregorianToDayNumber } from '../src/calendar/gregorian.js';
import { netz, shkiah } from '../src/zmanim/zmanim.js';
import { findCity } from '../src/places/places.js';

const stamp = new Date(Date.UTC(2026, 9, 21, 12, 0, 0));
const octets = (s: string) => new TextEncoder().encode(s).length;

describe('iCalendar', () => {
  it('escapes and folds by octets without splitting characters', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    const long = 'SUMMARY:' + 'ראש השנה '.repeat(20);
    const folded = foldLine(long);
    for (const line of folded.split('\r\n')) expect(octets(line)).toBeLessThanOrEqual(75);
    expect(folded.split('\r\n').map((l, i) => (i ? l.slice(1) : l)).join('')).toBe(long);
  });
  it('a holiday calendar is well formed', () => {
    const start = gregorianToDayNumber(2026, 9, 1);
    const end = gregorianToDayNumber(2027, 8, 31);
    const ics = toICalendar(holidayICalItems(start, end, { location: 'diaspora', names: 'he' }), { name: 'Luach', timestamp: stamp });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/); // CRLF only
    expect(ics.match(/BEGIN:VEVENT/g)!.length).toBe(ics.match(/END:VEVENT/g)!.length);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260912'); // Rosh Hashana 5787
    const uids = [...ics.matchAll(/^UID:(.*)$/gm)].map((m) => m[1]);
    expect(new Set(uids).size).toBe(uids.length); // unique, stable UIDs
    for (const line of ics.split('\r\n')) expect(octets(line)).toBeLessThanOrEqual(75);
  });
  it('zmanim are UTC instants with opinion and source', () => {
    const n = gregorianToDayNumber(2026, 10, 21);
    const ics = toICalendar(zmanimICalItems(n, n, findCity('Brooklyn')!, { netz, shkiah }), { timestamp: stamp });
    expect(ics).toMatch(/DTSTART:20261021T\d{6}Z/);
    expect(ics.replace(/\r\n /g, '')).toContain('Source: SA OC 58:1');
  });
});

import ICAL from 'ical.js';

describe('iCalendar parses with an independent parser (ical.js)', () => {
  it('round-trips holidays and zmanim', () => {
    const start = gregorianToDayNumber(2026, 9, 1);
    const end = gregorianToDayNumber(2026, 10, 31);
    const items = [...holidayICalItems(start, end, { location: 'israel', names: 'he' }), ...zmanimICalItems(start, start + 2, findCity('Jerusalem')!, { netz })];
    const comp = new ICAL.Component(ICAL.parse(toICalendar(items, { timestamp: stamp })));
    const events = comp.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v));
    expect(events.length).toBe(items.length);
    expect(events.some((e) => e.summary === 'ראש השנה א׳' && e.startDate.toString() === '2026-09-12')).toBe(true);
    expect(events.filter((e) => !e.startDate.isDate).length).toBe(3);
  });
});
