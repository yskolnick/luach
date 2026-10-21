/** Every output value quoted in docs/guide/*.md, checked. */
import { describe, expect, it } from 'vitest';
import {
  HebrewDate, Month, formatHebrewDate, ashkenazi, dayInfo, getPlace, moladAnnouncement, anniversary, gematriya,
  parseGematriya, parseHebrewDate, holidaysOn, omerText, omerSefirah, talUmatarStart, tefillahOn, parshaFor, parshaName,
  haftaraFor, dafYomi, mishnaYomis, nachYomi, ZmanimCalendar,
} from '../src/index';

describe('docs/guide examples', () => {
  it('getting started', () => {
    const d = HebrewDate.fromGregorian(2026, 10, 21);
    expect(d.toString()).toBe('5787-8-10');
    expect(formatHebrewDate(d)).toBe('י׳ חשון תשפ״ז');
    expect(formatHebrewDate(d, { locale: ashkenazi })).toBe('10 Cheshvan 5787');
    const info = dayInfo({ year: 2026, month: 10, day: 23 }, { location: getPlace('lakewood')! });
    expect(info.candleLighting?.local).toBe('17:47');
    expect(info.parsha.name).toBe('לך לך');
  });
  it('dates', () => {
    const d = new HebrewDate(5787, Month.ADAR_II, 14);
    expect(d.toCivil()).toEqual({ year: 2027, month: 3, day: 23 });
    expect(d.dayOfWeek).toBe(2);
    expect(d.isLeapYear).toBe(true);
    expect(moladAnnouncement(5787, Month.CHESHVAN)).toBe('Sunday, 9:43 am and 2 chalakim');
    expect(anniversary({ year: 5786, month: Month.ADAR, day: 10 }, 5787, { kind: 'yahrzeit' }).month).toBe(Month.ADAR_I);
    expect(anniversary({ year: 5786, month: Month.ADAR, day: 10 }, 5787, { kind: 'birthday' }).month).toBe(Month.ADAR_II);
    expect(gematriya(5787)).toBe('ה׳תשפ״ז');
    expect(gematriya(5787, { thousands: false })).toBe('תשפ״ז');
    expect(parseGematriya('תשפ״ז')).toBe(787);
    expect(parseHebrewDate('14 Adar II 5787').toString()).toBe('5787-13-14');
  });
  it('holidays', () => {
    expect(holidaysOn(HebrewDate.fromGregorian(2027, 3, 23)).map((e) => e.id)).toEqual(['purim']);
    expect(omerText(8)).toBe('היום שמונה ימים שהם שבוע אחד ויום אחד לעומר');
    expect(omerSefirah(8, 'ashkenazi')).toBe("Chesed sheb'Gevurah");
    expect(talUmatarStart(5787).eveningOf).toEqual({ year: 2026, month: 12, day: 4 });
    const t = tefillahOn(HebrewDate.fromGregorian(2026, 12, 6));
    expect(t.tachanun).toBe(false);
    expect(t.hallel).toBe('full');
  });
  it('parsha and learning', () => {
    const shabbos = HebrewDate.fromGregorian(2026, 10, 24);
    expect(parshaName(parshaFor(shabbos).parsha, ashkenazi)).toBe('Lech Lecha');
    expect(haftaraFor(shabbos)?.reference).toBe('Isaiah 40:27-41:16');
    const d = HebrewDate.fromGregorian(2026, 10, 21);
    expect(dafYomi(d)).toMatchObject({ tractate: 'Bekhorot', daf: 33, cycle: 14 });
    expect(mishnaYomis(d)?.text).toBe('Oholot 11:6–11:7');
    expect(nachYomi(d)?.text).toBe('Jeremiah 39');
  });
  it('zmanim', () => {
    const z = new ZmanimCalendar(getPlace('lakewood')!, { year: 2027, month: 3, day: 14 });
    const shema = z.sofZmanShemaGra();
    expect(shema.localTime()).toBe('10:08');
    expect(shema.rounded).toBe('down');
    expect(shema.source).toBe('Shulchan Aruch OC 58:1; Mishna Berura 58:4');
  });
});
