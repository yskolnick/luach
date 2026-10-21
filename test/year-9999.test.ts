import { describe, expect, it } from 'vitest';
import { fastMinchaHaftara, haftaraFor, HebrewDate, holidaysOn, Month, parshaFor, pirkeiAvos, readingCycle, yearLength } from '../src/index';

// Year 9999 is the last supported year (P-04). Its parsha cycle ends in Tishrei 10000, which
// is outside the range: what lies in 9999 must still be computed.
const LAST = new HebrewDate(9999, Month.ELUL, 29);
const lastShabbos = LAST.onOrBefore(6);

describe('year 9999', () => {
  it('readingCycle(9999) is the cycle of a year of the same type, up to the last Shabbos of 9999', () => {
    const cycle = readingCycle(9999);
    // A year with the same Rosh Hashana weekday and length has the same schedule.
    let twin = 9999 - 1;
    const rh = new HebrewDate(9999, Month.TISHREI, 1).dayOfWeek;
    while (new HebrewDate(twin, Month.TISHREI, 1).dayOfWeek !== rh || yearLength(twin) !== yearLength(9999)) twin--;
    const theirs = readingCycle(twin).map((r) => r.parsha?.join('-') ?? r.holiday);
    const ours = cycle.map((r) => r.parsha?.join('-') ?? r.holiday);
    expect(ours.length).toBeGreaterThan(40);
    expect(ours).toEqual(theirs.slice(0, ours.length));
    expect(cycle[cycle.length - 1]!.date.equals(lastShabbos)).toBe(true);
    expect(readingCycle(9999, { israel: true }).at(-1)!.date.equals(lastShabbos)).toBe(true);
  });

  it('every day from Elul 9998 to 29 Elul 9999 has an answer', () => {
    const errors: string[] = [];
    for (let e = new HebrewDate(9998, Month.ELUL, 1).epochDays; e <= LAST.epochDays; e++) {
      const d = HebrewDate.fromEpochDays(e);
      const shabbosInRange = e <= lastShabbos.epochDays || d.isShabbos;
      for (const israel of [false, true]) {
        try {
          if (shabbosInRange) parshaFor(d, { israel });
          holidaysOn(d, { israel });
          pirkeiAvos(d, { israel });
          pirkeiAvos(d, { israel, cycle: 'doubled' });
          fastMinchaHaftara(d, { israel });
          for (const minhag of ['ashkenaz', 'sephardi', 'chabad', 'teimani'] as const) haftaraFor(d, { israel, minhag });
        } catch (err) {
          errors.push(`${d} ${israel}: ${(err as Error).message}`);
        }
      }
    }
    expect(errors.slice(0, 10)).toEqual([]);
  });

  it('the last Shabbos of 9999 has its parsha, haftara and Pirkei Avos', () => {
    expect(parshaFor(lastShabbos)?.parsha?.[0]).toBe('nitzavim');
    expect(haftaraFor(lastShabbos)?.key).toBe('consolation-7');
    expect(pirkeiAvos(lastShabbos)).not.toBeNull();
  });

  it('a weekday whose Shabbos is in year 10000 has no parsha to give', () => {
    const after = lastShabbos.next();
    expect(parshaFor(after)).toBeNull();
    expect(haftaraFor(after)).toBeNull();
  });
});
