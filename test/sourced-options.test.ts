import { describe, expect, it } from 'vitest';
import { HebrewDate, Month, holidaysForYear, tefillahOn } from '../src/index';

// Options added where a rule had no source or the sources differ (D-12).
describe('Tachanun on Pesach Sheni', () => {
  const pesachSheni = new HebrewDate(5787, Month.IYAR, 14);
  it("omitted by default (Kaf HaChaim OC 131:98; Sha'arei Teshuvah 131:19); said with 'say'", () => {
    expect(pesachSheni.isShabbos).toBe(false);
    expect(tefillahOn(pesachSheni).tachanun).toBe(false);
    expect(tefillahOn(pesachSheni, { pesachSheniTachanun: 'say' }).tachanun).toBe(true);
    expect(tefillahOn(pesachSheni.next(), {}).tachanun).toBe(!pesachSheni.next().isShabbos);
  });
});

describe('Tachanun after Sukkos', () => {
  it("'isruChag' resumes after Isru Chag; 'endOfTishrei' after Rosh Chodesh Cheshvan", () => {
    const d = (day: number) => new HebrewDate(5787, Month.TISHREI, day);
    const weekday = [25, 26, 27, 28].find((x) => !d(x).isShabbos)!;
    expect(tefillahOn(d(weekday), { tishreiTachanun: 'isruChag' }).tachanun).toBe(true);
    expect(tefillahOn(d(weekday), { tishreiTachanun: 'endOfTishrei' }).tachanun).toBe(false);
    expect(tefillahOn(d(24), { tishreiTachanun: 'isruChag' }).tachanun).toBe(false); // Isru Chag in the diaspora
  });
});

describe('Yom Kippur Katan before Cheshvan', () => {
  const ykk = (o: { yomKippurKatanCheshvan?: boolean }) =>
    holidaysForYear(5787, { yomKippurKatan: true, ...o }).filter((e) => e.id === 'yom-kippur-katan' && e.date.month === Month.TISHREI);
  it('off by default; with the option, the day before Rosh Chodesh (Kaf HaChaim OC 417:16)', () => {
    expect(ykk({})).toHaveLength(0);
    const [e] = ykk({ yomKippurKatanCheshvan: true });
    expect(e).toBeDefined();
    const erev = new HebrewDate(5787, Month.TISHREI, 29);
    expect(e!.date.epochDays).toBe(erev.dayOfWeek === 6 || erev.dayOfWeek === 5 ? erev.onOrBefore(4).epochDays : erev.epochDays);
  });
  it('never before Iyar or Teves', () => {
    const all = holidaysForYear(5787, { yomKippurKatan: true, yomKippurKatanCheshvan: true }).filter((e) => e.id === 'yom-kippur-katan');
    expect(all.some((e) => e.date.month === Month.NISAN)).toBe(false);
    expect(all.some((e) => e.date.month === Month.KISLEV && e.date.day >= 25)).toBe(false);
  });
});
