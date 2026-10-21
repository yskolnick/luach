import { describe, expect, it } from 'vitest';
import { hebrewDateAt, fastTimes, isMelachaForbiddenAt, HebrewDate, Month, zonedToInstant } from '../src/index';

const NY = { latitude: 40.6782, longitude: -73.9442, timeZone: 'America/New_York' };
const at = (y: number, m: number, d: number, h: number, mi: number) => new Date(zonedToInstant({ year: y, month: m, day: d }, h * 60 + mi, NY.timeZone));

describe('Hebrew date at an instant', () => {
  it('changes at sunset', () => {
    expect(hebrewDateAt(at(2026, 10, 21, 12, 0), NY).day).toBe(10);
    expect(hebrewDateAt(at(2026, 10, 21, 20, 0), NY).day).toBe(11);
    expect(hebrewDateAt(at(2026, 10, 21, 18, 5), NY, { boundary: 'tzeis-72' }).day).toBe(10);
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

describe('melacha at an instant (Motzaei Shabbos is not assur)', () => {
  it('Shabbos 24 Oct 2026', () => {
    expect(isMelachaForbiddenAt(at(2026, 10, 23, 12, 0), NY)).toBe(false); // Friday noon
    expect(isMelachaForbiddenAt(at(2026, 10, 23, 18, 0), NY)).toBe(true); // Friday evening
    expect(isMelachaForbiddenAt(at(2026, 10, 24, 12, 0), NY)).toBe(true);
    expect(isMelachaForbiddenAt(at(2026, 10, 24, 21, 0), NY)).toBe(false); // Motzaei Shabbos
  });
});
