// Every concrete value shown in the docs and README, checked. If one of these fails, fix the docs too.
import { describe, expect, it } from 'vitest';
import * as L from '../src/index.js';

describe('values shown in the docs', () => {
  it('README and getting started', () => {
    const date = L.gregorianToHebrew({ year: 2027, month: 3, day: 23 });
    expect(L.formatHebrewDate(date, { style: 'he' })).toBe('י״ד אדר ב׳ תשפ״ז');
    expect(L.formatHebrewDate(date, { style: 'ashkenazi' })).toBe('14 Adar II 5787');
    const day = L.getDay({ year: 2027, month: 3, day: 23 }, { location: L.findCity('Lakewood')!, calendar: 'diaspora' });
    expect(day.holidays.map((h) => h.id)).toEqual(['purim']);
    expect(day.zmanim.netz.local).toBe('06:56');
    expect(day.zmanim.netz.opinion).toBe('Netz HaChama');
  });
  it('dates recipe', () => {
    expect(L.gregorianToHebrew({ year: 2026, month: 10, day: 21 })).toEqual({ year: 5787, month: 8, day: 10 });
    expect(L.hebrewToGregorian({ year: 5787, month: 1, day: 15 })).toEqual({ year: 2027, month: 4, day: 22 });
    expect(L.formatHebrewDate({ year: 5787, month: 8, day: 10 }, { style: 'he' })).toBe('י׳ חשון תשפ״ז');
    expect(L.formatHebrewDate({ year: 5787, month: 8, day: 10 }, { style: 'sephardi', length: 'long' })).toBe('Wednesday, 10 Heshvan 5787');
    expect(L.gematriya(15)).toBe('ט״ו');
    expect(L.gematriya(5787)).toBe('ה׳תשפ״ז');
    expect(L.parseHebrewYear('תשפ״ז')).toBe(5787);
    expect([L.isLeapYear(5787), L.daysInYear(5787), L.yearType(5787)]).toEqual([true, 385, 'sheleima']);
    expect(L.moladAnnouncement(5787, L.TISHREI)).toBe('Molad Tishrei: Friday, 8:59 pm and 1 chelek');
  });
  it('holidays, parsha, places recipes', () => {
    expect(L.omerTextHebrew(10)).toBe('היום עשרה ימים שהם שבוע אחד ושלשה ימים לעומר');
    expect(L.omerSefirah(33, 'he')).toBe('הוד שבהוד');
    expect(L.birkasHachama(2037 + 3760)).not.toBeNull();
    expect(L.birkasHachama(2065 + 3760)).not.toBeNull();
    const r = L.parshaOn(L.gregorianToDayNumber(2026, 10, 24), 'diaspora');
    expect(r.parsha).toEqual(['lech-lecha']);
    expect(L.readingName(r, 'he')).toBe('לך לך');
    expect(L.parshaOn(L.gregorianToDayNumber(2027, 4, 24), 'diaspora')).toMatchObject({ parsha: null, special: 'pesach-chol-hamoed' });
    expect(L.findCity('Bene Beraq')!.name).toBe('Bnei Brak');
    expect(L.findCity('בני ברק')!.name).toBe('Bnei Brak');
    const near = L.nearestCity(40.08, -74.21)!;
    expect([near.city.name, Math.round(near.km * 10) / 10]).toEqual(['Lakewood', 2.1]);
    expect(L.isInIsrael(31.77, 35.21)).toBe(true);
  });
  it('zmanim recipe', () => {
    expect(L.sofZmanShemaGra({ year: 2027, month: 3, day: 14 }, L.findCity('Jerusalem')!).opinion).toBe('Sof zman Shema, Gra: the day from sunrise to sunset');
    expect(L.alos16_1({ year: 2026, month: 6, day: 21 }, L.findCity('London')!)).toMatchObject({ time: null, reason: 'sun-always-above' });
  });
});
