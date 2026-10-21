import { describe, expect, it } from 'vitest';
import { haftaraOn, shabbosHaftara } from '../src/parsha/haftara.js';
import { pirkeiAvos } from '../src/parsha/avos.js';
import { dayOfWeek, gregorianToDayNumber as g } from '../src/calendar/gregorian.js';
import { AV, NISAN, TISHREI, hebrewToDayNumber, roshHashana } from '../src/calendar/hebrew.js';
import { holidaysInYear } from '../src/holidays/holidays.js';

const firstShabbos = (n: number) => n + ((6 - dayOfWeek(n) + 7) % 7);

describe('haftara', () => {
  it('parsha, combined parshiyos and the Rema\'s Acharei–Kedoshim rule', () => {
    expect(shabbosHaftara(g(2026, 10, 24), 'diaspora', 'ashkenaz')).toMatchObject({ reason: 'parsha', reference: 'Isaiah 40:27-41:16' });
    // Find a year where Acharei Mos and Kedoshim are read together.
    for (let y = 5780; y < 5800; y += 1) {
      for (let s = firstShabbos(hebrewToDayNumber(y, NISAN, 23)); s < hebrewToDayNumber(y, NISAN, 23) + 60; s += 7) {
        const h = shabbosHaftara(s, 'diaspora', 'ashkenaz');
        if (h.parsha?.join() === 'acharei-mos,kedoshim') {
          expect(h.reference).toBe('Amos 9:7-15'); // Rema OC 428:8
          expect(shabbosHaftara(s, 'diaspora', 'sephardi').reference).toBe('Ezekiel 20:2-20');
          return;
        }
      }
    }
    throw new Error('no combined Acharei–Kedoshim found');
  });
  it('the three of affliction and seven of consolation by date', () => {
    const chazon = (y: number) => {
      const av9 = hebrewToDayNumber(y, AV, 9);
      return av9 - ((dayOfWeek(av9) + 1) % 7);
    };
    expect(shabbosHaftara(chazon(5787), 'diaspora', 'ashkenaz')).toMatchObject({ reason: 'affliction-3', reference: 'Isaiah 1:1-27' });
    expect(shabbosHaftara(chazon(5787) + 7, 'diaspora', 'ashkenaz')).toMatchObject({ reason: 'consolation-1', reference: 'Isaiah 40:1-26' });
  });
  it('Shuva follows the Dagul Mervava by default; other customs selectable', () => {
    const shuva = firstShabbos(hebrewToDayNumber(5787, TISHREI, 3));
    const def = shabbosHaftara(shuva, 'diaspora', 'ashkenaz');
    expect(def.reason).toBe('shuva');
    expect(def.reference).toMatch(/^Hosea 14:2-10; (Micah|Joel)/);
    expect(shabbosHaftara(shuva, 'diaspora', 'ashkenaz', { shuvaAddition: 'both' }).reference).toBe('Hosea 14:2-10; Micah 7:18-20; Joel 2:15-27');
  });
  it('Shabbos HaGadol: Chabad reads Malachi only when it is Erev Pesach', () => {
    for (let y = 5780; y < 5800; y += 1) {
      const hagadol = holidaysInYear(y, { location: 'diaspora' }).find((h) => h.id === 'shabbos-hagadol')!;
      const erev = hagadol.date.day === 14;
      expect(shabbosHaftara(hagadol.dayNumber, 'diaspora', 'chabad').reason === 'hagadol').toBe(erev);
      expect(shabbosHaftara(hagadol.dayNumber, 'diaspora', 'ashkenaz').reason).toBe('hagadol');
    }
  });
  it('Yom Kippur has Shacharis and Mincha; minor fasts have Mincha (Ashkenaz) and none (Sephardi)', () => {
    const yk = haftaraOn(hebrewToDayNumber(5787, TISHREI, 10), 'diaspora', 'ashkenaz');
    expect(yk.map((h) => h.service)).toEqual(['shacharis', 'mincha']);
    expect(yk[1]!.reference).toContain('Jonah');
    const gedalia = holidaysInYear(5787, { location: 'diaspora' }).find((h) => h.id === 'tzom-gedalia')!;
    expect(haftaraOn(gedalia.dayNumber, 'diaspora', 'ashkenaz')[0]!.reference).toBe('Isaiah 55:6-56:8');
    expect(haftaraOn(gedalia.dayNumber, 'diaspora', 'sephardi')[0]!.reference).toBeNull();
    expect(haftaraOn(g(2026, 10, 21), 'diaspora', 'ashkenaz')).toEqual([]); // ordinary Wednesday
  });
  it('rejects a weekday for shabbosHaftara', () => {
    expect(() => shabbosHaftara(g(2026, 10, 21), 'diaspora', 'ashkenaz')).toThrow(RangeError);
  });
});

describe('Pirkei Avos', () => {
  it('until Shavuos: one round of six', () => {
    let n = 0;
    for (let s = firstShabbos(hebrewToDayNumber(5787, NISAN, 23)); s < roshHashana(5788); s += 7) if (pirkeiAvos(s, 'diaspora', 'until-shavuos')) n += 1;
    expect(n).toBeLessThanOrEqual(6);
  });
  it('until Rosh Hashana: the last Shabbos ends with chapters 5–6', () => {
    for (let y = 5780; y < 5800; y += 1) {
      const last = roshHashana(y + 1) - ((dayOfWeek(roshHashana(y + 1)) + 1) % 7 || 7);
      expect(pirkeiAvos(last, 'diaspora')).toEqual([5, 6]);
    }
  });
});
