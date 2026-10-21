import { describe, expect, it } from 'vitest';
import { haftaraFor, fastMinchaHaftara, HebrewDate, Month, holidaysForYear } from '../src/index';

describe('haftara', () => {
  it('weekly, by minhag', () => {
    const d = HebrewDate.fromGregorian(2026, 10, 24); // Lech Lecha
    expect(haftaraFor(d)?.reference).toBe('Isaiah 40:27-41:16');
    expect(haftaraFor(d, { minhag: 'chabad' })?.reference).toBeTruthy();
    expect(haftaraFor(d.addDays(-3))).toBeNull(); // a Wednesday
  });
  it('Chabad adds verses of a displaced haftara', () => {
    const shekalim = holidaysForYear(5787).find((e) => e.id === 'shabbos-shekalim')!.date;
    const a = haftaraFor(shekalim, { minhag: 'chabad' })!;
    expect(a.key.startsWith('shekalim')).toBe(true);
  });
  it('Shabbos HaGadol custom', () => {
    const sg = holidaysForYear(5787).find((e) => e.id === 'shabbos-hagadol')!.date;
    expect(haftaraFor(sg)?.key).toBe('shabbos-hagadol');
    expect(haftaraFor(sg, { shabbosHagadol: 'never' })?.key).not.toBe('shabbos-hagadol');
    expect(haftaraFor(sg, { minhag: 'chabad' })?.key).not.toBe('shabbos-hagadol'); // Erev Pesach is not Shabbos in 5787
  });
  it('holidays and fasts', () => {
    expect(haftaraFor(new HebrewDate(5787, Month.NISAN, 21))?.key).toBe('pesach-7');
    expect(haftaraFor(new HebrewDate(5787, Month.TISHREI, 10))?.key).toBe('yom-kippur-shacharis');
    expect(fastMinchaHaftara(new HebrewDate(5787, Month.TEVES, 10))?.key).toBe('fast-day-mincha');
    expect(fastMinchaHaftara(new HebrewDate(5787, Month.TEVES, 10), { minhag: 'sephardi' })).toBeNull();
    // Taanis Bechoros is the firstborn's fast (SA OC 470:1), not a communal one (SA OC 566:1): no reading.
    expect(fastMinchaHaftara(new HebrewDate(5786, Month.NISAN, 14))).toBeNull();
    expect(fastMinchaHaftara(new HebrewDate(5785, Month.NISAN, 12))).toBeNull(); // moved to Thursday
  });
  it('Teimani gaps are null, not guessed', () => {
    const d = HebrewDate.fromGregorian(2026, 11, 7); // Chayei Sarah
    const t = haftaraFor(d, { minhag: 'teimani' })!;
    expect(t.reference).toBeNull();
    expect(t.segments).toEqual([]);
  });
});
