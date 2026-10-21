import { expect, it } from 'vitest';
import { HebrewDate, formatHebrewDate, ashkenazi, gematriya } from '../src/index';

it('README quick start is true', () => {
  const today = HebrewDate.fromGregorian(2026, 10, 21);
  expect([today.year, today.month, today.day]).toEqual([5787, 8, 10]);
  expect(formatHebrewDate(today)).toBe('י׳ חשון תשפ״ז');
  expect(formatHebrewDate(today, { locale: ashkenazi })).toBe('10 Cheshvan 5787');
  expect(gematriya(5787)).toBe('ה׳תשפ״ז');
  expect(HebrewDate.fromGregorian(2026, 10, 21, { afterSunset: true }).day).toBe(11);
});
