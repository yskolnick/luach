import { describe, expect, it } from 'vitest';
import { HDate, OmerEvent } from '@hebcal/core';
import {
  HebrewDate,
  Month,
  holidaysOn,
  holidaysForYear,
  holidayName,
  ashkenazi,
  he,
  en,
  sephardi,
  omerDay,
  omerText,
  omerTextEnglish,
  omerSefirah,
  talUmatarStart,
  amidahSeason,
  birkasHachamaDates,
  kiddushLevana,
  moladInstant,
  tefillahOn,
  mourningPeriods,
  isMelachaForbidden,
  fastOn,
  nextHoliday,
  dayOfWeekOfDays,
  civilToDays,
  formatIsoDate,
} from '../src/index';

const g = (y: number, m: number, d: number) => HebrewDate.fromGregorian(y, m, d);
const ids = (d: HebrewDate, israel = false) => holidaysOn(d, { israel }).map((e) => e.id);

describe('known dates (published calendars)', () => {
  it('5787 (2026–27)', () => {
    expect(ids(g(2026, 9, 12))).toContain('rosh-hashana');
    expect(ids(g(2026, 9, 21))).toContain('yom-kippur');
    expect(ids(g(2027, 4, 22))).toContain('pesach');
    // 2027: Tisha B'Av on 9 Av = 12 August 2027 (Thursday).
    expect(ids(g(2027, 8, 12))).toContain('tisha-bav');
  });
  it('Taanis Esther moves to Thursday when 13 Adar is Shabbos (5785: 13 Adar = 13 March 2025, Thursday; normal)', () => {
    // 5781: 13 Adar was Thursday 25 Feb 2021; 5774: 13 Adar II was Thursday 13 March 2014.
    // A year where 13 Adar is Shabbos: 5784 (13 Adar II = Saturday 23 March 2024) → Thursday 21 March.
    expect(ids(g(2024, 3, 21))).toContain('taanis-esther');
    expect(ids(g(2024, 3, 23))).not.toContain('taanis-esther');
  });
  it('Tisha B\'Av nidcheh: 9 Av 5785 on Shabbos? No; 5782 (6 Aug 2022) was Shabbos → Sunday 7 Aug', () => {
    expect(ids(g(2022, 8, 7))).toContain('tisha-bav');
    const e = holidaysOn(g(2022, 8, 7)).find((x) => x.id === 'tisha-bav');
    expect(e?.moved).toBe(true);
    expect(ids(g(2022, 8, 6))).toContain('shabbos-chazon');
  });
  it('Israel vs diaspora', () => {
    expect(ids(g(2027, 4, 23), false)).toContain('pesach');
    expect(ids(g(2027, 4, 23), true)).toContain('pesach-chol-hamoed');
    expect(ids(g(2026, 10, 3), true)).toContain('shemini-atzeres-simchas-torah');
    expect(ids(g(2026, 10, 4), false)).toContain('simchas-torah');
  });
  it('Chanukah candles', () => {
    const y = holidaysForYear(5787).filter((e) => e.id === 'chanukah' || e.id === 'erev-chanukah');
    expect(y.map((e) => e.candlesTonight)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  });
  it('flags', () => {
    expect(isMelachaForbidden(g(2026, 9, 21))).toBe(true);
    expect(fastOn(g(2026, 9, 21))?.flags.fast).toBe('major');
    expect(fastOn(new HebrewDate(5787, Month.TEVES, 10))?.flags.fast).toBe('minor');
    expect(nextHoliday('purim', new HebrewDate(5787, 7, 1))?.date.month).toBe(Month.ADAR_II);
  });
  it('optional events are off by default', () => {
    const y = holidaysForYear(5787).map((e) => e.id);
    expect(y).not.toContain('behab');
    expect(y).not.toContain('yom-kippur-katan');
    expect(y).not.toContain('yom-haatzmaut');
    const opt = holidaysForYear(5787, { behab: true, yomKippurKatan: true, modernIsraeli: true }).map((e) => e.id);
    expect(opt).toContain('behab');
    expect(opt).toContain('yom-kippur-katan');
    expect(opt).toContain('yom-haatzmaut');
  });
  it('BeHaB days are Mon, Thu, Mon', () => {
    const b = holidaysForYear(5787, { behab: true }).filter((e) => e.id === 'behab');
    expect(b.map((e) => e.date.dayOfWeek)).toEqual([1, 4, 1, 1, 4, 1]);
  });
});

describe('names', () => {
  it('in four locales', () => {
    const rc = holidaysOn(new HebrewDate(5787, Month.KISLEV, 1)).find((e) => e.id === 'rosh-chodesh')!;
    expect(holidayName(rc, ashkenazi)).toBe('Rosh Chodesh Kislev');
    expect(holidayName(rc, he)).toBe('ראש חודש כסלו');
    const p7 = holidaysOn(new HebrewDate(5787, Month.NISAN, 21)).find((e) => e.id === 'pesach')!;
    expect(holidayName(p7, ashkenazi)).toBe('Pesach VII');
    expect(holidayName(p7, en)).toBe('Passover, day 7');
    const ch = holidaysOn(new HebrewDate(5787, Month.KISLEV, 27)).find((e) => e.id === 'chanukah')!;
    expect(holidayName(ch, he)).toBe('חנוכה ג׳');
    expect(holidayName(ch, sephardi)).toBe('Chanukah day 3');
  });
  it('every event in 50 years has a name in every locale', () => {
    for (let y = 5760; y < 5810; y++) {
      for (const e of holidaysForYear(y, { behab: true, yomKippurKatan: true, modernIsraeli: true })) {
        for (const l of [he, ashkenazi, sephardi, en]) expect(holidayName(e, l)).not.toMatch(/^holiday\./);
      }
    }
  });
});

describe('Omer', () => {
  it('days match hebcal', () => {
    for (let n = 1; n <= 49; n++) {
      const d = new HebrewDate(5787, Month.NISAN, 15).addDays(n);
      expect(omerDay(d)).toBe(n);
    }
    expect(omerDay(new HebrewDate(5787, Month.NISAN, 15))).toBeNull();
    expect(omerDay(new HebrewDate(5787, Month.SIVAN, 6))).toBeNull();
  });
  it('text', () => {
    expect(omerText(1)).toBe('היום יום אחד לעומר');
    expect(omerText(8)).toBe('היום שמונה ימים שהם שבוע אחד ויום אחד לעומר');
    expect(omerText(7)).toBe('היום שבעה ימים שהם שבוע אחד לעומר');
    expect(omerText(21, 'ashkenaz')).toBe('היום אחד ועשרים יום שהם שלשה שבועות לעומר');
    expect(omerText(21, 'edot-hamizrach')).toBe('היום עשרים ואחד יום לעומר, שהם שלשה שבועות');
    expect(omerText(33, 'sefard')).toBe('היום שלשה ושלשים יום שהם ארבעה שבועות וחמשה ימים בעומר');
    expect(omerText(49)).toBe('היום תשעה וארבעים יום שהם שבעה שבועות לעומר');
    expect(omerTextEnglish(8)).toBe('Today is eight days, which are one week and one day, of the Omer.');
    expect(omerTextEnglish(7)).toBe('Today is seven days, which is one week, of the Omer.');
  });
  it('sefirah matches hebcal for all 49 days', () => {
    for (let n = 1; n <= 49; n++) {
      expect(omerSefirah(n, 'he')).toBe(new OmerEvent(new HDate(), n).sefira('he').replace(/[֑-ׇ]/g, ''));
    }
    expect(omerSefirah(8, 'ashkenazi')).toBe("Chesed sheb'Gevurah");
  });
});

describe('seasonal', () => {
  it('tal umatar outside Israel: Dec 4, or Dec 5 before a Gregorian leap year (1901–2098), later after 2100', () => {
    for (let y = 1901; y <= 2098; y++) {
      const s = talUmatarStart(y + 3761);
      const leapNext = (y + 1) % 4 === 0;
      expect(formatIsoDate(s.eveningOf)).toBe(`${y}-12-0${leapNext ? 5 : 4}`);
    }
    expect(formatIsoDate(talUmatarStart(2100 + 3761).eveningOf)).toBe('2100-12-05');
    expect(formatIsoDate(talUmatarStart(2103 + 3761).eveningOf)).toBe('2103-12-06');
  });
  it('tal umatar in Israel from the evening starting 7 Cheshvan', () => {
    const s = talUmatarStart(5787, { israel: true });
    expect([s.hebrewDate.month, s.hebrewDate.day]).toEqual([Month.CHESHVAN, 7]);
  });
  it('amidah season', () => {
    expect(amidahSeason(new HebrewDate(5787, Month.SHEVAT, 1)).mashivHaruach).toBe(true);
    expect(amidahSeason(new HebrewDate(5787, Month.SIVAN, 1)).mashivHaruach).toBe(false);
    expect(amidahSeason(new HebrewDate(5787, Month.TISHREI, 22)).changesAtMusaf).toBe(true);
    expect(amidahSeason(new HebrewDate(5787, Month.CHESHVAN, 20)).talUmatar).toBe(false);
    expect(amidahSeason(new HebrewDate(5787, Month.CHESHVAN, 20), { israel: true }).talUmatar).toBe(true);
  });
  it('Birkas HaChama: 8 April 1981, 2009, 2037, all Wednesdays', () => {
    const ds = birkasHachamaDates(1950, 2040);
    expect(ds.map(formatIsoDate)).toEqual(['1953-04-08', '1981-04-08', '2009-04-08', '2037-04-08']);
    for (const d of ds) expect(dayOfWeekOfDays(civilToDays(d.year, d.month, d.day))).toBe(3);
  });
  it('molad instant: hebcal molad Tishrei 5787 (Jerusalem mean time)', () => {
    // hebcal gives the molad's clock reading; the instant is that reading minus 2h20m56.5s.
    const t = moladInstant(5787, Month.TISHREI);
    const kl = kiddushLevana(5787, Month.TISHREI);
    expect(kl.earliest.sevenDays.time.getTime() - t.getTime()).toBe(7 * 864e5);
    expect(kl.latest.halfMonth.time.getTime() - t.getTime()).toBeCloseTo((29 * 864e5 + 12 * 36e5 + (793 * 36e5) / 1080) / 2, -1);
  });
});

describe('tefillah', () => {
  it('basics', () => {
    expect(tefillahOn(new HebrewDate(5787, Month.KISLEV, 26)).hallel).toBe('full');
    expect(tefillahOn(new HebrewDate(5787, Month.KISLEV, 26)).alHanissim).toBe(true);
    expect(tefillahOn(new HebrewDate(5787, Month.NISAN, 18)).hallel).toBe('half');
    expect(tefillahOn(new HebrewDate(5787, Month.NISAN, 18)).mizmorLesodah).toBe(false);
    expect(tefillahOn(new HebrewDate(5787, Month.NISAN, 3)).tachanun).toBe(false);
    expect(tefillahOn(new HebrewDate(5787, Month.SIVAN, 10)).tachanun).toBe(false);
    expect(tefillahOn(new HebrewDate(5787, Month.SIVAN, 13)).tachanun).toBe(true);
    expect(tefillahOn(new HebrewDate(5787, Month.TEVES, 15)).tachanun).toBe(new HebrewDate(5787, Month.TEVES, 15).dayOfWeek !== 6);
    expect(tefillahOn(new HebrewDate(5787, Month.TISHREI, 1)).yaalehVyavo).toBe(true);
    expect(tefillahOn(new HebrewDate(5787, Month.TISHREI, 10)).yaalehVyavo).toBe(false);
  });
  it('mourning periods', () => {
    expect(mourningPeriods(new HebrewDate(5787, Month.AV, 3))).toEqual({ threeWeeks: true, nineDays: true, omer: false });
    expect(mourningPeriods(new HebrewDate(5787, Month.IYAR, 3)).omer).toBe(true);
  });
});
