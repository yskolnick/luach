import { describe, expect, it } from 'vitest';
import { HebrewDate, Month, mourningPeriods, type MourningOptions } from '../src/index';

// Each expectation is a line of the source named in src/holidays/mourning.ts.
const av = (y: number, d: number) => new HebrewDate(y, Month.AV, d);
const omer = (y: number, n: number) => new HebrewDate(y, Month.NISAN, 15).addDays(n);
const r = (date: HebrewDate, o: MourningOptions) => mourningPeriods(date, o).restrictions!;
const kind = (x: unknown) => (x === null ? null : x === false ? false : (x as { partial?: string }).partial ?? 'all');
/** First year from 5780 whose 9 Av (or Lag BaOmer) is on `dow`. */
const yearWhere = (f: (y: number) => boolean) => { for (let y = 5780; ; y++) if (f(y)) return y; };

describe('mourningPeriods: the calendar spans', () => {
  it('no customs, no restrictions', () => {
    expect(mourningPeriods(av(5787, 3)).restrictions).toBeNull();
    expect(mourningPeriods(av(5787, 3), {}).restrictions).toBeNull();
  });

  it('the week of Tisha B\'Av: Sunday through 9 Av; none when 9 Av is Sunday or Shabbos (SA OC 551:4)', () => {
    // 5787: 9 Av is Thursday 12 August 2027; the week starts Sunday 5 Av.
    expect(av(5787, 9).dayOfWeek).toBe(4);
    expect(mourningPeriods(av(5787, 4)).weekOfTishaBav).toBe(false);
    expect(mourningPeriods(av(5787, 5)).weekOfTishaBav).toBe(true);
    expect(mourningPeriods(av(5787, 9)).weekOfTishaBav).toBe(true);
    expect(mourningPeriods(av(5787, 10)).weekOfTishaBav).toBe(false);
    const sunday = yearWhere((y) => av(y, 9).dayOfWeek === 0);
    const shabbos = yearWhere((y) => av(y, 9).dayOfWeek === 6);
    for (const y of [sunday, shabbos]) for (let d = 1; d <= 10; d++) expect(mourningPeriods(av(y, d)).weekOfTishaBav).toBe(false);
  });

  it('the Three Weeks run to the fast, 10 Av when 9 Av is Shabbos', () => {
    const shabbos = yearWhere((y) => av(y, 9).dayOfWeek === 6);
    expect(mourningPeriods(av(shabbos, 10)).threeWeeks).toBe(true);
    expect(mourningPeriods(av(shabbos, 11)).threeWeeks).toBe(false);
    expect(mourningPeriods(av(5787, 10)).threeWeeks).toBe(false);
  });
});

describe('the Sefirah', () => {
  it("'sa-until-34': through day 33, and the night of 34 (SA OC 493:2; MB 493:6)", () => {
    const y = 5787;
    expect(kind(r(omer(y, 33), { sefirah: 'sa-until-34' }).haircut)).toBe(omer(y, 33).dayOfWeek === 5 ? false : 'all');
    expect(kind(r(omer(y, 34), { sefirah: 'sa-until-34' }).haircut)).toBe('until-sunrise');
    expect(kind(r(omer(y, 35), { sefirah: 'sa-until-34' }).weddings)).toBe(false);
    const lagFriday = yearWhere((x) => omer(x, 33).dayOfWeek === 5);
    expect(r(omer(lagFriday, 33), { sefirah: 'sa-until-34' }).haircut).toBe(false);
    expect(kind(r(omer(lagFriday, 33), { sefirah: 'sa-until-34' }).weddings)).toBe('all');
  });

  it("'rema-until-lag': Lag from sunrise; Friday before a Sunday Lag (Rema OC 493:2)", () => {
    const y = 5787;
    expect(kind(r(omer(y, 32), { sefirah: 'rema-until-lag' }).haircut)).toBe('all');
    expect(kind(r(omer(y, 33), { sefirah: 'rema-until-lag' }).haircut)).toBe('until-sunrise');
    expect(r(omer(y, 34), { sefirah: 'rema-until-lag' }).haircut).toBe(false);
    const lagSunday = yearWhere((x) => omer(x, 33).dayOfWeek === 0);
    expect(r(omer(lagSunday, 31), { sefirah: 'rema-until-lag' }).haircut).toBe(false);
    expect(kind(r(omer(lagSunday, 31), { sefirah: 'rema-until-lag' }).weddings)).toBe('all');
  });

  it("'rema-from-rosh-chodesh-iyar': 2 Iyar to Erev Shavuos (Rema OC 493:3; MB 493:14–15)", () => {
    const o = { sefirah: 'rema-from-rosh-chodesh-iyar' } as const;
    expect(r(new HebrewDate(5787, Month.IYAR, 1), o).haircut).toBe(false);
    expect(kind(r(new HebrewDate(5787, Month.IYAR, 2), o).haircut)).toBe('all');
    expect(kind(r(new HebrewDate(5787, Month.IYAR, 18), o).haircut)).toBe('until-sunrise');
    expect(kind(r(new HebrewDate(5787, Month.SIVAN, 5), o).weddings)).toBe('all');
    expect(r(new HebrewDate(5787, Month.NISAN, 20), o).weddings).toBe(false);
  });

  it("'iyar-to-hagbalah': 30 Nisan to the morning of 3 Sivan, Lag allowed (MB 493:15)", () => {
    const o = { sefirah: 'iyar-to-hagbalah' } as const;
    expect(r(new HebrewDate(5787, Month.NISAN, 29), o).haircut).toBe(false);
    expect(kind(r(new HebrewDate(5787, Month.NISAN, 30), o).haircut)).toBe('all');
    expect(r(new HebrewDate(5787, Month.IYAR, 18), o).haircut).toBe(false);
    expect(kind(r(new HebrewDate(5787, Month.SIVAN, 3), o).haircut)).toBe('until-sunrise');
    expect(r(new HebrewDate(5787, Month.SIVAN, 4), o).haircut).toBe(false);
  });

  it("'except-rosh-chodesh-lag-sivan' (MB 493:15)", () => {
    const o = { sefirah: 'except-rosh-chodesh-lag-sivan' } as const;
    expect(kind(r(new HebrewDate(5787, Month.NISAN, 20), o).haircut)).toBe('all');
    expect(r(new HebrewDate(5787, Month.NISAN, 30), o).haircut).toBe(false);
    expect(r(new HebrewDate(5787, Month.IYAR, 1), o).haircut).toBe(false);
    expect(kind(r(new HebrewDate(5787, Month.IYAR, 2), o).haircut)).toBe('all');
    expect(r(new HebrewDate(5787, Month.IYAR, 18), o).haircut).toBe(false);
    expect(r(new HebrewDate(5787, Month.SIVAN, 1), o).haircut).toBe(false);
  });

  it("'arizal': haircuts until Erev Shavuos; weddings not settled (Kaf HaChaim OC 493:13)", () => {
    const o = { sefirah: 'arizal' } as const;
    expect(kind(r(new HebrewDate(5787, Month.IYAR, 18), o).haircut)).toBe('all');
    expect(kind(r(new HebrewDate(5787, Month.SIVAN, 4), o).haircut)).toBe('all');
    expect(r(new HebrewDate(5787, Month.SIVAN, 5), o).haircut).toBe(false);
    expect(r(new HebrewDate(5787, Month.IYAR, 18), o).weddings).toBeNull();
  });

  it('a period with no custom given is null; outside every period, false', () => {
    expect(r(omer(5787, 10), { meatWine: 'week-only' }).haircut).toBeNull();
    expect(r(omer(5787, 10), { meatWine: 'week-only' }).meatWine).toBe(false);
    expect(r(new HebrewDate(5787, Month.ELUL, 10), { sefirah: 'arizal' })).toEqual({ haircut: false, weddings: false, meatWine: false, laundry: false });
    expect(r(av(5787, 3), { sefirah: 'arizal' }).haircut).toBeNull();
  });
});

describe('the Three Weeks', () => {
  const tammuz = (y: number, d: number) => new HebrewDate(y, Month.TAMMUZ, d);

  it("'ashkenaz': weddings and haircuts from 17 Tammuz, laundry from Rosh Chodesh (Rema OC 551:2–4)", () => {
    const o = { beinHametzarim: 'ashkenaz' } as const;
    expect(r(tammuz(5787, 16), o)).toEqual({ haircut: false, weddings: false, meatWine: false, laundry: false });
    expect(kind(r(tammuz(5787, 17), o).haircut)).toBe('all');
    expect(kind(r(tammuz(5787, 17), o).weddings)).toBe('all');
    expect(r(tammuz(5787, 17), o).laundry).toBe(false);
    expect(kind(r(av(5787, 1), o).laundry)).toBe('all');
    expect(r(av(5787, 1), o).meatWine).toBeNull();
  });

  it("'ashkenaz' on 10 Av: until midday, except Friday or after a Sunday fast (MB 558:3–4)", () => {
    const o = { beinHametzarim: 'ashkenaz', meatWine: 'from-rosh-chodesh' } as const;
    const tuesday = yearWhere((y) => av(y, 9).dayOfWeek === 2);
    expect(kind(r(av(tuesday, 10), o).haircut)).toBe('until-chatzos');
    expect(kind(r(av(tuesday, 10), o).meatWine)).toBe('until-chatzos');
    expect(r(av(tuesday, 10), o).weddings).toBeNull();
    expect(r(av(tuesday, 11), o).meatWine).toBe(false);
    expect(r(av(5787, 10), o).laundry).toBe(false); // Friday
    expect(kind(r(av(5787, 10), o).meatWine)).toBe('until-chatzos');
    const shabbos = yearWhere((y) => av(y, 9).dayOfWeek === 6);
    expect(kind(r(av(shabbos, 10), o).haircut)).toBe('all'); // the fast itself
    expect(r(av(shabbos, 11), o).haircut).toBe(false);
    expect(kind(r(av(shabbos, 11), o).meatWine)).toBe('night-only');
    expect(r(av(shabbos, 9), o).meatWine).toBe(false); // Shabbos
  });

  it("'sephard': weddings from Rosh Chodesh, haircuts and laundry in the week only (SA OC 551:2–4)", () => {
    const o = { beinHametzarim: 'sephard', meatWine: 'week-only' } as const;
    expect(r(tammuz(5787, 20), o).weddings).toBe(false);
    expect(kind(r(av(5787, 1), o).weddings)).toBe('all');
    expect(r(av(5787, 4), o).haircut).toBe(false);
    expect(r(av(5787, 4), o).meatWine).toBe(false);
    expect(kind(r(av(5787, 5), o).haircut)).toBe('all');
    expect(kind(r(av(5787, 5), o).meatWine)).toBe('all');
    expect(r(av(5787, 10), o).haircut).toBe(false);
    expect(r(av(5787, 10), o).weddings).toBe(false);
    expect(kind(r(av(5787, 10), o).meatWine)).toBe('all'); // night and day of 10 Av (SA OC 558:1)
    const sunday = yearWhere((y) => av(y, 9).dayOfWeek === 0);
    expect(r(av(sunday, 5), o).haircut).toBe(false);
    expect(r(av(sunday, 5), o).meatWine).toBe(false);
  });

  it('meat and wine: where each custom starts; never on Shabbos (SA OC 551:9; MB 551:58–59)', () => {
    const on = (d: HebrewDate, meatWine: MourningOptions['meatWine']) => kind(r(d, { meatWine }).meatWine);
    const weekday = (d: HebrewDate) => (d.isShabbos ? d.next() : d);
    expect(on(weekday(tammuz(5787, 20)), 'from-17-tammuz')).toBe('all');
    expect(on(weekday(tammuz(5787, 20)), 'from-rosh-chodesh')).toBe(false);
    expect(on(av(5787, 1), 'from-rosh-chodesh')).toBe('all');
    expect(on(av(5787, 1), 'from-2-av')).toBe(false);
    expect(on(av(5787, 2), 'from-2-av')).toBe('all');
    const shabbos = av(5787, 1).onOrAfter(6);
    expect(on(shabbos, 'from-17-tammuz')).toBe(false);
    expect(on(av(5787, 10), 'from-17-tammuz')).toBeNull(); // the end depends on beinHametzarim
  });
});
