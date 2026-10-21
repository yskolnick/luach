import { describe, expect, it } from 'vitest';
import { gematriya, hebrewYearNumeral, parseGematriya, parseHebrewYear } from '../src/format/gematriya.js';
import { formatHebrewDate, isolateRtl } from '../src/format/format.js';
import { monthName } from '../src/format/names.js';
import { ADAR, ADAR_II, NISAN, TEVES } from '../src/calendar/hebrew.js';

describe('gematriya', () => {
  it.each([
    [1, 'א׳'], [10, 'י׳'], [11, 'י״א'], [14, 'י״ד'], [15, 'ט״ו'], [16, 'ט״ז'], [17, 'י״ז'], [30, 'ל׳'],
    [100, 'ק׳'], [115, 'קט״ו'], [116, 'קט״ז'], [400, 'ת׳'], [500, 'ת״ק'], [613, 'תרי״ג'], [787, 'תשפ״ז'],
    [999, 'תתקצ״ט'], [5787, 'ה׳תשפ״ז'], [1001, 'א׳א׳'],
  ])('%i → %s', (n, s) => {
    expect(gematriya(n)).toBe(s);
    expect(parseGematriya(s)).toBe(n);
  });
  it('round-trips 1–9999 except exact thousands', () => {
    for (let n = 1; n <= 9999; n += 1) if (n % 1000 !== 0) expect(parseGematriya(gematriya(n))).toBe(n);
  });
  it('exact thousands print as a letter with a geresh, which reads back as units (documented ambiguity)', () => {
    expect(gematriya(5000)).toBe('ה׳');
    expect(parseGematriya('ה׳')).toBe(5);
  });
  it('ascii and none punctuation', () => {
    expect(gematriya(15, { punctuation: 'ascii' })).toBe('ט"ו');
    expect(gematriya(5787, { punctuation: 'ascii' })).toBe('ה\'תשפ"ז');
    expect(gematriya(14, { punctuation: 'none' })).toBe('יד');
  });
  it('years with and without thousands', () => {
    expect(hebrewYearNumeral(5787)).toBe('תשפ״ז');
    expect(hebrewYearNumeral(5787, { thousands: true })).toBe('ה׳תשפ״ז');
    expect(parseHebrewYear('תשפ״ז')).toBe(5787);
    expect(parseHebrewYear('ה׳תשפ״ז')).toBe(5787);
  });
  it('rejects junk', () => {
    expect(parseGematriya('abc')).toBeNaN();
    expect(() => gematriya(0)).toThrow(RangeError);
  });
});

describe('formatting', () => {
  it('Hebrew style', () => {
    expect(formatHebrewDate({ year: 5787, month: ADAR_II, day: 14 }, { style: 'he' })).toBe('י״ד אדר ב׳ תשפ״ז');
    expect(formatHebrewDate({ year: 5786, month: ADAR, day: 14 }, { style: 'he' })).toBe('י״ד אדר תשפ״ו');
    expect(formatHebrewDate({ year: 5786, month: ADAR, day: 14 }, { style: 'he', length: 'short' })).toBe('י״ד אדר');
  });
  it('transliterations', () => {
    const d = { year: 5786, month: TEVES, day: 10 };
    expect(formatHebrewDate(d, { style: 'ashkenazi' })).toBe('10 Teves 5786');
    expect(formatHebrewDate(d, { style: 'sephardi' })).toBe('10 Tevet 5786');
    expect(formatHebrewDate(d)).toBe('10 Tevet 5786');
  });
  it('long form adds the weekday', () => {
    // 15 Nisan 5787 = Thursday 22 April 2027
    expect(formatHebrewDate({ year: 5787, month: NISAN, day: 15 }, { style: 'ashkenazi', length: 'long' })).toBe('Thursday, 15 Nissan 5787');
  });
  it('isolates are opt-in', () => {
    const d = { year: 5786, month: ADAR, day: 14 };
    expect(formatHebrewDate(d, { style: 'he', isolate: true })).toBe(isolateRtl('י״ד אדר תשפ״ו'));
    expect(isolateRtl('x')).toBe('⁧x⁩');
  });
  it('custom name table overrides', () => {
    expect(monthName(5787, NISAN, { 'month.nisan': 'Aviv' })).toBe('Aviv');
    expect(monthName(5787, ADAR, 'ashkenazi')).toBe('Adar I');
  });
});
