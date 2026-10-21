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
  it('Kedoshim reads Acharei Mos\'s haftara when Acharei Mos\'s was displaced (MB 428:26)', () => {
    // 5700: Acharei Mos is Shabbos HaGadol (12 Nisan), Kedoshim is 26 Nisan.
    const k5700 = haftaraFor(new HebrewDate(5700, Month.NISAN, 26))!;
    expect(k5700.reference).toBe('Amos 9:7-15');
    expect(k5700.key).toBe('acharei-mos');
    // 5782: Acharei Mos on 29 Nisan reads Machar Chodesh (the case MB 428:26 names).
    expect(haftaraFor(new HebrewDate(5782, Month.NISAN, 29))?.key).toBe('machar-chodesh');
    expect(haftaraFor(new HebrewDate(5782, Month.IYAR, 6))?.reference).toBe('Amos 9:7-15');
    // 5784: Acharei Mos read its own haftara, so Kedoshim reads Ezekiel 22.
    expect(haftaraFor(new HebrewDate(5784, Month.NISAN, 26))?.reference).toBe('Amos 9:7-15');
    expect(haftaraFor(new HebrewDate(5784, Month.IYAR, 3))?.reference).toBe('Ezekiel 22:1-16');
    // Only Ashkenaz: Sephardim read Ezekiel 22 on Acharei Mos and Ezekiel 20 on Kedoshim.
    expect(haftaraFor(new HebrewDate(5700, Month.NISAN, 26), { minhag: 'sephardi' })?.reference).toBe('Ezekiel 20:2-20');
  });
  it('Shabbos Shuva (Ashkenaz): Micah with Vayelech, Joel with Haazinu (MB 428:23, Dagul Mervava)', () => {
    const vayelech = new HebrewDate(5786, Month.TISHREI, 5);
    const haazinu = new HebrewDate(5787, Month.TISHREI, 8);
    expect(haftaraFor(vayelech)?.reference).toBe('Hosea 14:2-10; Micah 7:18-20');
    expect(haftaraFor(haazinu)?.reference).toBe('Hosea 14:2-10; Joel 2:15-27');
    expect(haftaraFor(vayelech, { shuvaAddition: 'joel' })?.reference).toBe('Hosea 14:2-10; Joel 2:15-27');
    expect(haftaraFor(haazinu, { shuvaAddition: 'micah' })?.reference).toBe('Hosea 14:2-10; Micah 7:18-20');
    expect(haftaraFor(haazinu, { shuvaAddition: 'both' })?.segments).toEqual(['Hosea 14:2-10', 'Joel 2:15-27', 'Micah 7:18-20']);
    expect(haftaraFor(haazinu, { minhag: 'sephardi' })?.reference).toBe('Hosea 14:2-10; Micah 7:18-20');
  });
  it('Rosh Chodesh Av on Shabbos: Shim\'u by default (MB 425:8), Isaiah 66 as an option (Rema 425:1)', () => {
    const rcAv = new HebrewDate(5781, Month.AV, 1);
    expect(rcAv.isShabbos).toBe(true);
    expect(haftaraFor(rcAv)?.reference).toBe('Jeremiah 2:4-28; Jeremiah 3:4');
    expect(haftaraFor(rcAv, { roshChodeshAv: 'affliction' })?.key).toBe('shabbos-rosh-chodesh-av');
    const rc = haftaraFor(rcAv, { roshChodeshAv: 'roshChodesh' })!;
    expect(rc.key).toBe('shabbos-rosh-chodesh');
    expect(rc.reference).toBe('Isaiah 66:1-24; Isaiah 66:23');
  });
  it('Rosh Chodesh Elul on Shabbos Re\'eh: by minhag, or chosen (SA and Rema OC 425:1, MB 425:7)', () => {
    const reeh = new HebrewDate(5782, Month.AV, 30);
    const kiSeitzei = reeh.addDays(14);
    expect(reeh.isShabbos).toBe(true);
    // Defaults: Ashkenaz reads Isaiah 66 and makes up Re'eh's on Ki Seitzei; Sephardim keep Re'eh's.
    expect(haftaraFor(reeh)?.reference).toBe('Isaiah 66:1-24; Isaiah 66:23');
    expect(haftaraFor(kiSeitzei)?.reference).toBe('Isaiah 54:1-55:5');
    expect(haftaraFor(reeh, { minhag: 'sephardi' })?.reference).toBe('Isaiah 54:11-55:5');
    expect(haftaraFor(kiSeitzei, { minhag: 'sephardi' })?.reference).toBe('Isaiah 54:1-10');
    // Ashkenaz choosing the Mechaber's custom: no displacement, nothing to make up.
    const a = { roshChodeshElul: 'consolation' } as const;
    expect(haftaraFor(reeh, a)?.key).toBe('consolation-3');
    expect(haftaraFor(reeh, a)?.reference).toBe('Isaiah 54:11-55:5');
    expect(haftaraFor(kiSeitzei, a)?.key).toBe('consolation-5');
    expect(haftaraFor(kiSeitzei, a)?.reference).toBe('Isaiah 54:1-10');
    // Sephardi choosing the Rema's: Rosh Chodesh's haftara, Re'eh's added on Ki Seitzei.
    const s = { minhag: 'sephardi', roshChodeshElul: 'roshChodesh' } as const;
    expect(haftaraFor(reeh, s)?.key).toBe('shabbos-rosh-chodesh-and-erev');
    expect(haftaraFor(kiSeitzei, s)?.key).toBe('ki-seitzei-after-rosh-chodesh-elul');
    expect(haftaraFor(kiSeitzei, s)?.segments).toEqual(['Isaiah 54:1-10', 'Isaiah 54:11-55:5']);
    // The explicit default changes nothing.
    expect(haftaraFor(reeh, { roshChodeshElul: 'roshChodesh' })).toEqual(haftaraFor(reeh));
  });
  it('Teimani gaps are null, not guessed', () => {
    const d = HebrewDate.fromGregorian(2026, 11, 7); // Chayei Sarah
    const t = haftaraFor(d, { minhag: 'teimani' })!;
    expect(t.reference).toBeNull();
    expect(t.segments).toEqual([]);
  });
});
