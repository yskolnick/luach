import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { HDate } from '@hebcal/core';
import {
  HebrewDate,
  Month,
  civilToDays,
  daysToCivil,
  isLeapYear,
  roshHashanaDays,
  yearLength,
  yearType,
  monthLength,
  molad,
  dayOfWeekOfDays,
  hebrewToDays,
} from '../src/index';

// Range required by the plan: Gregorian 1900–2240, Hebrew years 5660–6000.
const FIRST = 5660;
const LAST = 6000;

describe('civil day counts', () => {
  it('matches Date.UTC', () => {
    for (let d = -800000; d <= 800000; d += 997) {
      const c = daysToCivil(d);
      const t = new Date(0);
      t.setUTCFullYear(c.year, c.month - 1, c.day);
      expect(t.getTime() / 86400000).toBe(d);
      expect(civilToDays(c.year, c.month, c.day)).toBe(d);
    }
  });
  it('1970-01-01 is Thursday', () => {
    expect(dayOfWeekOfDays(0)).toBe(4);
  });
});

describe('known dates (published)', () => {
  // Rosh Hashana 5785 was Thursday 3 October 2024; 5787 is Saturday 12 September 2026.
  it('Rosh Hashana anchors', () => {
    expect(daysToCivil(roshHashanaDays(5785))).toEqual({ year: 2024, month: 10, day: 3 });
    expect(daysToCivil(roshHashanaDays(5787))).toEqual({ year: 2026, month: 9, day: 12 });
    expect(daysToCivil(roshHashanaDays(5701))).toEqual({ year: 1940, month: 10, day: 3 });
  });
  it('1 Tishrei of year 1 is a Monday (BaHaRaD)', () => {
    expect(dayOfWeekOfDays(roshHashanaDays(1))).toBe(1);
  });
  it('the date of this session', () => {
    // 21 October 2026 is 10 Cheshvan 5787.
    const d = HebrewDate.fromGregorian(2026, 10, 21);
    expect([d.year, d.month, d.day]).toEqual([5787, Month.CHESHVAN, 10]);
  });
});

describe('oracle: @hebcal/core (test-only)', () => {
  it('every day 1900-01-01 … 2240-12-31 converts identically', () => {
    const start = civilToDays(1900, 1, 1);
    const end = civilToDays(2240, 12, 31);
    for (let d = start; d <= end; d++) {
      const c = daysToCivil(d);
      const ours = HebrewDate.fromEpochDays(d);
      const theirs = new HDate(new Date(c.year, c.month - 1, c.day));
      if (ours.year !== theirs.getFullYear() || ours.month !== theirs.getMonth() || ours.day !== theirs.getDate()) {
        throw new Error(`Mismatch on ${c.year}-${c.month}-${c.day}: ours ${ours}, hebcal ${theirs.getFullYear()}-${theirs.getMonth()}-${theirs.getDate()}`);
      }
    }
  });
  it('year lengths and leap years 1–9999 sampled', () => {
    for (let y = 2; y < 9999; y += 7) {
      expect(isLeapYear(y)).toBe(HDate.isLeapYear(y));
      expect(yearLength(y)).toBe(HDate.daysInYear(y));
    }
  });
});

describe('properties over Hebrew years 5660–6000', () => {
  it('year lengths are 353–355 or 383–385, matching leap years', () => {
    for (let y = FIRST; y <= LAST; y++) {
      const len = yearLength(y);
      if (isLeapYear(y)) expect([383, 384, 385]).toContain(len);
      else expect([353, 354, 355]).toContain(len);
    }
  });
  it('Rosh Hashana is never on Sunday, Wednesday or Friday', () => {
    for (let y = FIRST; y <= LAST; y++) {
      expect([0, 3, 5]).not.toContain(dayOfWeekOfDays(roshHashanaDays(y)));
    }
  });
  it('Yom Kippur is never on Friday or Sunday', () => {
    for (let y = FIRST; y <= LAST; y++) {
      expect([0, 5]).not.toContain(dayOfWeekOfDays(hebrewToDays(y, Month.TISHREI, 10)));
    }
  });
  it('the first day of Pesach falls on the weekday of Tisha B\'Av (at-bash)', () => {
    for (let y = FIRST; y <= LAST; y++) {
      expect(dayOfWeekOfDays(hebrewToDays(y, Month.NISAN, 15))).toBe(dayOfWeekOfDays(hebrewToDays(y, Month.AV, 9)));
    }
  });
  it('year type matches month lengths', () => {
    for (let y = FIRST; y <= LAST; y++) {
      const t = yearType(y);
      const ch = monthLength(y, Month.CHESHVAN);
      const ki = monthLength(y, Month.KISLEV);
      expect(t === 'chaserim' ? [29, 29] : t === 'kesidran' ? [29, 30] : [30, 30]).toEqual([ch, ki]);
    }
  });
  it('round-trips civil → Hebrew → civil (random days)', () => {
    const start = civilToDays(1900, 1, 1);
    const end = civilToDays(2240, 12, 31);
    fc.assert(
      fc.property(fc.integer({ min: start, max: end }), (d) => {
        const h = HebrewDate.fromEpochDays(d);
        const again = new HebrewDate(h.year, h.month, h.day);
        return again.epochDays === d && civilToDays(...(Object.values(h.toCivil()) as [number, number, number])) === d;
      }),
      { numRuns: 20000 },
    );
  });
  it('round-trips over the whole supported range', () => {
    fc.assert(
      fc.property(fc.integer({ min: roshHashanaDays(1), max: roshHashanaDays(10000) - 1 }), (d) => {
        const h = HebrewDate.fromEpochDays(d);
        return new HebrewDate(h.year, h.month, h.day).epochDays === d;
      }),
      { numRuns: 20000 },
    );
  });
});

describe('molad', () => {
  it('first molad is BaHaRaD', () => {
    const m = molad(1, Month.TISHREI);
    expect([m.dayOfWeek, m.hours, m.parts]).toEqual([1, 5, 204]);
  });
  it('matches hebcal molad for 5660–6000 Tishrei and Nisan', async () => {
    const { Molad } = await import('@hebcal/core');
    for (let y = FIRST; y <= LAST; y += 1) {
      for (const mo of [Month.TISHREI, Month.NISAN]) {
        const ours = molad(y, mo);
        const theirs = new Molad(y, mo);
        expect([ours.clock.dayOfWeek, ours.clock.hour, ours.clock.minute, ours.clock.chalakim]).toEqual([
          theirs.getDow(),
          theirs.getHour(),
          theirs.getMinutes(),
          theirs.getChalakim(),
        ]);
      }
    }
  });
});

describe('validation', () => {
  it('rejects impossible dates', () => {
    expect(() => new HebrewDate(5786, Month.ADAR_II, 1)).toThrow(RangeError);
    expect(() => new HebrewDate(5787, Month.TEVES, 30)).toThrow(RangeError);
    expect(() => new HebrewDate(0, 1, 1)).toThrow(RangeError);
    expect(() => new HebrewDate(5784, Month.ADAR_II, 29)).not.toThrow();
  });
});

import { moladAnnouncement, formatTime } from '../src/index';
describe('molad announcement and time formatting', () => {
  it('matches the clock parts', () => {
    // Molad Cheshvan 5787 per the calendar arithmetic; the text renders molad().clock.
    const m = molad(5787, Month.CHESHVAN);
    const s = moladAnnouncement(5787, Month.CHESHVAN);
    expect(s).toContain(`${m.clock.chalakim} chalak`);
    expect(moladAnnouncement(5787, Month.CHESHVAN, 'he')).toContain('חלקים');
  });
  it('the doc example: Tuesday night is ליל רביעי (molad Teves 5784)', () => {
    expect(moladAnnouncement(5784, Month.TEVES)).toBe('Tuesday night, 8:01 pm and 3 chalakim');
    expect(moladAnnouncement(5784, Month.TEVES, 'he')).toBe('ליל רביעי, 20:01 ו־3 חלקים');
  });
  it('formatTime in a zone', () => {
    const t = new Date(Date.UTC(2026, 9, 21, 19, 5, 30));
    expect(formatTime(t, 'Asia/Jerusalem')).toBe('22:05');
    expect(formatTime(t, 'America/New_York', { hour12: true })).toBe('3:05 pm');
    expect(formatTime(t, 'UTC', { seconds: true })).toBe('19:05:30');
  });
});
