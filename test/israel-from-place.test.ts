import { describe, expect, it } from 'vitest';
import { HebrewDate, Month, dayInfo, isMelachaForbiddenAt, toICalendar } from '../src/index';
import { israelFor } from '../src/places/israel';

// When a caller gives a place but not `israel`, the place decides. A plain location
// (no `israel` flag of its own) in Jerusalem gets Israel's rules; one in New York, the
// diaspora's; an explicit option always wins; with no place, the diaspora.

const jerusalem = { latitude: 31.7683, longitude: 35.2137, timeZone: 'Asia/Jerusalem' };
const newYork = { latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' };
const acharonShelPesach = new HebrewDate(5787, Month.NISAN, 22); // 29 April 2027
const noonUtc = (h: HebrewDate, offsetHours: number) => {
  const c = h.toCivil();
  return new Date(Date.UTC(c.year, c.month - 1, c.day, 12 - offsetHours));
};

describe('israelFor', () => {
  it('explicit, then the location\'s flag, then its coordinates, then the diaspora', () => {
    expect(israelFor(false, jerusalem)).toBe(false);
    expect(israelFor(true, newYork)).toBe(true);
    expect(israelFor(undefined, { ...newYork, israel: true })).toBe(true);
    expect(israelFor(undefined, jerusalem)).toBe(true);
    expect(israelFor(undefined, newYork)).toBe(false);
    expect(israelFor(undefined, undefined)).toBe(false);
  });
});

describe('a place decides Israel or the diaspora when the caller does not', () => {
  it('dayInfo', () => {
    expect(dayInfo(acharonShelPesach, { location: jerusalem }).israel).toBe(true);
    expect(dayInfo(acharonShelPesach, { location: jerusalem }).events.map((e) => e.id)).not.toContain('pesach');
    expect(dayInfo(acharonShelPesach, { location: newYork }).events.map((e) => e.id)).toContain('pesach');
    expect(dayInfo(acharonShelPesach, { location: jerusalem, israel: false }).events.map((e) => e.id)).toContain('pesach');
    expect(dayInfo(acharonShelPesach).israel).toBe(false);
  });

  it('isMelachaForbiddenAt on the eighth day of Pesach', () => {
    expect(isMelachaForbiddenAt(noonUtc(acharonShelPesach, 3), jerusalem)).toBe(false);
    expect(isMelachaForbiddenAt(noonUtc(acharonShelPesach, -4), newYork)).toBe(true);
    expect(isMelachaForbiddenAt(noonUtc(acharonShelPesach, 3), jerusalem, { israel: false })).toBe(true);
  });

  it('toICalendar', () => {
    const ics = (location: typeof jerusalem, israel?: boolean) =>
      toICalendar(acharonShelPesach, acharonShelPesach, { location, now: new Date(0), ...(israel === undefined ? {} : { israel }) });
    expect(ics(jerusalem)).not.toMatch(/פסח/);
    expect(ics(newYork)).toMatch(/פסח/);
    expect(ics(jerusalem, false)).toMatch(/פסח/);
  });
});
