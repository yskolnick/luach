import { describe, expect, it } from 'vitest';
import { hebrewDateAt, fastTimes, isMelachaForbiddenAt, HebrewDate, Month } from '../src/index';
import { zonedToInstant } from '../src/time/zone';

const NY = { latitude: 40.6782, longitude: -73.9442, timeZone: 'America/New_York' };
const at = (y: number, m: number, d: number, h: number, mi: number) => new Date(zonedToInstant({ year: y, month: m, day: d }, h * 60 + mi, NY.timeZone));

describe('Hebrew date at an instant', () => {
  it('changes at sunset', () => {
    expect(hebrewDateAt(at(2026, 10, 21, 12, 0), NY).day).toBe(10);
    expect(hebrewDateAt(at(2026, 10, 21, 20, 0), NY).day).toBe(11);
    expect(hebrewDateAt(at(2026, 10, 21, 18, 5), NY, { boundary: 'tzeis-72' }).day).toBe(10);
  });
  it('before a boundary that falls after local midnight, the date is still the previous day\'s', () => {
    // Anchorage, 10 June 2026 (25 Sivan): 72 minutes after sunset is about 00:48 on 11 June.
    const ANC = { latitude: 61.2181, longitude: -149.9003, timeZone: 'America/Anchorage' };
    const anc = (d: number, h: number, mi: number) => new Date(zonedToInstant({ year: 2026, month: 6, day: d }, h * 60 + mi, ANC.timeZone));
    expect(hebrewDateAt(anc(10, 12, 0), ANC).day).toBe(25);
    expect(hebrewDateAt(anc(11, 0, 38), ANC, { boundary: 'tzeis-72' }).day).toBe(25);
    expect(hebrewDateAt(anc(11, 1, 30), ANC, { boundary: 'tzeis-72' }).day).toBe(26);
    // Tromsø, 17 May 2026 (1 Sivan): sunset is about 00:29 on 18 May.
    const TOS = { latitude: 69.6492, longitude: 18.9553, timeZone: 'Europe/Oslo' };
    const tos = (d: number, h: number, mi: number) => new Date(zonedToInstant({ year: 2026, month: 5, day: d }, h * 60 + mi, TOS.timeZone));
    expect(hebrewDateAt(tos(18, 0, 15), TOS).day).toBe(1);
    expect(hebrewDateAt(tos(18, 1, 0), TOS).day).toBe(2);
  });
});

describe('fast times', () => {
  it('a minor fast from alos to tzeis; Yom Kippur from sunset the day before', () => {
    const tevet = fastTimes(new HebrewDate(5787, Month.TEVES, 10), NY)!;
    expect(tevet.fast.id).toBe('asarah-bteves');
    expect(tevet.begins.rounded).toBe('down');
    expect(tevet.ends.time!.getTime()).toBeGreaterThan(tevet.begins.time!.getTime());
    const yk = fastTimes(new HebrewDate(5787, Month.TISHREI, 10), NY)!;
    expect(yk.fast.flags.fast).toBe('major');
    expect(yk.ends.time!.getTime() - yk.begins.time!.getTime()).toBeGreaterThan(24 * 36e5);
    expect(fastTimes(new HebrewDate(5787, Month.TEVES, 11), NY)).toBeNull();
  });
});

describe('melacha when Shabbos ends after local midnight', () => {
  it('Anchorage, Shabbos 9 May 2026: 8.5° is reached at about 00:14 on Sunday', () => {
    const ANC = { latitude: 61.2181, longitude: -149.9003, timeZone: 'America/Anchorage' };
    const anc = (d: number, h: number, mi: number) => new Date(zonedToInstant({ year: 2026, month: 5, day: d }, h * 60 + mi, ANC.timeZone));
    expect(isMelachaForbiddenAt(anc(9, 23, 30), ANC)).toBe(true);
    expect(isMelachaForbiddenAt(anc(10, 0, 5), ANC)).toBe(true);
    expect(isMelachaForbiddenAt(anc(10, 0, 30), ANC)).toBe(false);
    expect(hebrewDateAt(anc(10, 0, 5), ANC, { boundary: 'tzeis-8.5' }).isShabbos).toBe(true);
  });
});

describe('melacha at an instant (Motzaei Shabbos is not assur)', () => {
  it('Shabbos 24 Oct 2026', () => {
    expect(isMelachaForbiddenAt(at(2026, 10, 23, 12, 0), NY)).toBe(false); // Friday noon
    expect(isMelachaForbiddenAt(at(2026, 10, 23, 18, 0), NY)).toBe(true); // Friday evening
    expect(isMelachaForbiddenAt(at(2026, 10, 24, 12, 0), NY)).toBe(true);
    expect(isMelachaForbiddenAt(at(2026, 10, 24, 21, 0), NY)).toBe(false); // Motzaei Shabbos
  });
});
