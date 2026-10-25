import { describe, expect, it } from 'vitest';
import { parseHebrewDate, formatHebrewDate, HebrewDate, ashkenazi, sephardi, en, he } from '../src/index';

describe('parseHebrewDate', () => {
  it('Hebrew and transliterated forms', () => {
    expect(parseHebrewDate('י״ד אדר תשפ״ו').toString()).toBe('5786-12-14');
    expect(parseHebrewDate('י"ד אדר ב\' תשפ"ז').toString()).toBe('5787-13-14');
    expect(parseHebrewDate('14 Adar II 5787').toString()).toBe('5787-13-14');
    expect(parseHebrewDate('14 Adar 5787').toString()).toBe('5787-12-14');
    expect(parseHebrewDate('10 Teves 5787').toString()).toBe('5787-10-10');
    expect(parseHebrewDate('10 Tevet 5787').toString()).toBe('5787-10-10');
    expect(parseHebrewDate('1 Marcheshvan 5787').toString()).toBe('5787-8-1');
    expect(parseHebrewDate('ט״ו בשבט תשפ״ז').toString()).toBe('5787-11-15');
    expect(parseHebrewDate('ה׳ באייר ה׳תשפ״ז').toString()).toBe('5787-2-5');
  });
  it('round-trips every format over two years', () => {
    for (let d = new HebrewDate(5786, 7, 1); d.year < 5788; d = d.next()) {
      for (const locale of [he, ashkenazi, sephardi, en]) {
        expect(parseHebrewDate(formatHebrewDate(d, { locale })).equals(d)).toBe(true);
      }
    }
  });
  it('rejects junk', () => {
    expect(() => parseHebrewDate('hello world')).toThrow(RangeError);
    expect(() => parseHebrewDate('1 Adar II 5786')).toThrow(RangeError);
    expect(() => parseHebrewDate('31 Tishrei 5787')).toThrow(RangeError);
  });
});
