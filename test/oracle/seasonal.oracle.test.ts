// Oracles: kosher-zmanim (LGPL) for the molad instant and Kiddush Levana; @hebcal/core (GPL) for the Omer.
// Used only as independent checks; never imported by src/.
import { describe, expect, it } from 'vitest';
import * as KZ from 'kosher-zmanim';
import { HDate, OmerEvent, HebrewCalendar } from '@hebcal/core';
import { kiddushLevanaEarliest, kiddushLevanaLatest, moladInstant, omerDay } from '../../src/calendar/seasonal.js';
import { monthsInOrder } from '../../src/calendar/hebrew.js';
import { gregorianToDayNumber } from '../../src/calendar/gregorian.js';

describe('molad instant and Kiddush Levana vs kosher-zmanim, every month 5660–6000', () => {
  it('agree to the millisecond', () => {
    let n = 0;
    for (let y = 5660; y <= 6000; y += 1) {
      for (const m of monthsInOrder(y)) {
        const jc = new KZ.JewishCalendar(y, m, 1);
        const ms = (d: { toMillis?: () => number } | Date | null) => (d instanceof Date ? d.getTime() : (d as { toMillis: () => number }).toMillis());
        expect(moladInstant(y, m)).toBeCloseTo(ms(jc.getMoladAsDate() as never), -1);
        expect(kiddushLevanaEarliest(y, m, '3-days').time.getTime()).toBeCloseTo(ms(jc.getTchilasZmanKidushLevana3Days() as never), -1);
        expect(kiddushLevanaEarliest(y, m, '7-days').time.getTime()).toBeCloseTo(ms(jc.getTchilasZmanKidushLevana7Days() as never), -1);
        expect(kiddushLevanaLatest(y, m, 'half-month').time.getTime()).toBeCloseTo(ms(jc.getSofZmanKidushLevanaBetweenMoldos() as never), -1);
        expect(kiddushLevanaLatest(y, m, '15-days').time.getTime()).toBeCloseTo(ms(jc.getSofZmanKidushLevana15Days() as never), -1);
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(4200);
  });
});

describe('Omer vs hebcal, 5660–6000', () => {
  it('day numbers agree', () => {
    for (let y = 5660; y <= 6000; y += 1) {
      const evs = HebrewCalendar.calendar({ year: y, isHebrewYear: true, omer: true, noHolidays: true });
      for (const ev of evs) {
        if (!(ev instanceof OmerEvent)) continue;
        const g = (ev.getDate() as HDate).greg();
        expect(omerDay(gregorianToDayNumber(g.getFullYear(), g.getMonth() + 1, g.getDate()))).toBe(ev.omer);
      }
    }
  });
});
