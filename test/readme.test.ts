import { expect, it } from 'vitest';
import { HebrewDate, formatHebrewDate, ashkenazi, gematriya, ZmanimCalendar, getPlace } from '../src/index';

it('README quick start is true', () => {
  const today = HebrewDate.fromGregorian(2026, 10, 21);
  expect([today.year, today.month, today.day]).toEqual([5787, 8, 10]);
  expect(formatHebrewDate(today)).toBe('י׳ חשון תשפ״ז');
  expect(formatHebrewDate(today, { locale: ashkenazi })).toBe('10 Cheshvan 5787');
  expect(gematriya(5787)).toBe('ה׳תשפ״ז');
  expect(HebrewDate.fromGregorian(2026, 10, 21, { afterSunset: true }).day).toBe(11);
});

it('README zmanim example is true', () => {
  const zmanim = new ZmanimCalendar(getPlace('jerusalem')!, { year: 2026, month: 10, day: 21 });
  const shema = zmanim.sofZmanShemaGra();
  expect(shema.localTime()).toBe('09:35');
  expect(shema.opinion).toBe('Latest Shema, Gra: 3 seasonal hours of a sunrise-to-sunset day');
  expect(shema.source).toBe('Shulchan Aruch OC 58:1; Mishna Berura 58:4');
});
