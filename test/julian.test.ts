import { expect, it } from 'vitest';
import { julianToDays, civilToDays } from '../src/index';

it('Julian 1582-10-05 is Gregorian 1582-10-15 (the reform)', () => {
  expect(julianToDays(1582, 10, 5)).toBe(civilToDays(1582, 10, 15));
  expect(julianToDays(1582, 10, 4)).toBe(civilToDays(1582, 10, 14));
  expect(julianToDays(2026, 1, 1)).toBe(civilToDays(2026, 1, 14));
  expect(julianToDays(1900, 2, 29)).toBe(civilToDays(1900, 3, 13));
});
