import { describe, expect, it } from 'vitest';
import { gematriya as hebcalGematriya } from '@hebcal/core';
import {
  gematriya,
  parseGematriya,
  formatHebrewDate,
  ashkenazi,
  sephardi,
  en,
  he,
  isolate,
  RLI,
  PDI,
  extendLocale,
  monthName,
  stripBidiControls,
} from '../src/index';

describe('gematriya', () => {
  it('known values', () => {
    expect(gematriya(1)).toBe('א׳');
    expect(gematriya(15)).toBe('ט״ו');
    expect(gematriya(16)).toBe('ט״ז');
    expect(gematriya(115)).toBe('קט״ו');
    expect(gematriya(216)).toBe('רט״ז');
    expect(gematriya(14)).toBe('י״ד');
    expect(gematriya(30)).toBe('ל׳');
    expect(gematriya(500)).toBe('ת״ק');
    expect(gematriya(800)).toBe('ת״ת');
    expect(gematriya(5787)).toBe('ה׳תשפ״ז');
    expect(gematriya(5787, { thousands: false })).toBe('תשפ״ז');
    expect(gematriya(5000)).toBe('ה׳');
    expect(gematriya(5787, { punctuate: false })).toBe('התשפז');
  });
  it('round-trips 1–9999 except exact thousands', () => {
    for (let n = 1; n <= 9999; n++) if (n % 1000) expect(parseGematriya(gematriya(n))).toBe(n);
  });
  it('an exact thousand is written like its units digit (documented ambiguity)', () => {
    expect(gematriya(1000)).toBe('א׳');
    expect(parseGematriya('א׳')).toBe(1);
  });
  it('oracle: hebcal letters agree for 1–999 (ignoring punctuation)', () => {
    const strip = (s: string) => s.replace(/[׳״'"]/g, '');
    for (let n = 1; n <= 999; n++) expect(strip(gematriya(n))).toBe(strip(hebcalGematriya(n)));
  });
  it('rejects junk', () => {
    expect(() => parseGematriya('abc')).toThrow(RangeError);
    expect(() => gematriya(0)).toThrow(RangeError);
  });
  it('parses ASCII punctuation', () => {
    expect(parseGematriya('תשפ"ז')).toBe(787);
    expect(parseGematriya("ה'תשפ\"ז")).toBe(5787);
  });
});

describe('formatHebrewDate', () => {
  const d = { year: 5787, month: 12, day: 14 };
  it('Hebrew', () => {
    expect(formatHebrewDate(d)).toBe('י״ד אדר א׳ תשפ״ז');
    expect(formatHebrewDate({ year: 5786, month: 12, day: 14 })).toBe('י״ד אדר תשפ״ו');
    expect(formatHebrewDate({ year: 5786, month: 12, day: 14 }, { thousands: true })).toBe('י״ד אדר ה׳תשפ״ו');
    expect(formatHebrewDate({ year: 5786, month: 12, day: 14 }, { form: 'short' })).toBe('י״ד אדר');
  });
  it('transliterations', () => {
    expect(formatHebrewDate({ year: 5786, month: 10, day: 10 }, { locale: ashkenazi })).toBe('10 Teves 5786');
    expect(formatHebrewDate({ year: 5786, month: 10, day: 10 }, { locale: sephardi })).toBe('10 Tevet 5786');
    expect(formatHebrewDate({ year: 5787, month: 13, day: 1 }, { locale: en })).toBe('1 Adar II 5787');
    expect(formatHebrewDate({ year: 5787, month: 7, day: 1 }, { locale: ashkenazi, form: 'full' })).toBe('Shabbos, 1 Tishrei 5787');
  });
  it('isolates only when asked', () => {
    const s = formatHebrewDate(d, { isolate: true });
    expect(s.startsWith(RLI) && s.endsWith(PDI)).toBe(true);
    expect(stripBidiControls(s)).toBe(formatHebrewDate(d));
    expect(formatHebrewDate(d, { isolate: true, locale: ashkenazi })).toBe('14 Adar I 5787');
    expect(isolate('x', 'ltr')).toBe('⁦x⁩');
  });
  it('locales are pluggable', () => {
    const mine = extendLocale(ashkenazi, { 'month.10': 'Tebeth' }, 'mine');
    expect(monthName(10, 5786, mine)).toBe('Tebeth');
    expect(monthName(10, 5786, he)).toBe('טבת');
  });
});
