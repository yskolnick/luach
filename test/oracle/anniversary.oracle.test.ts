// Oracle: @hebcal/core (GPL-2.0-or-later), used only as an independent check.
// hebcal follows one custom per case; we compare against the matching Luach custom and count the rest.
import { describe, expect, it } from 'vitest';
import { HDate, HebrewCalendar } from '@hebcal/core';

const { getYahrzeit, getBirthdayOrAnniversary } = HebrewCalendar;
import { dayNumberToHebrew, roshHashana, daysInYear } from '../../src/calendar/hebrew.js';
import { hebrewBirthday, yahrzeit } from '../../src/calendar/anniversary.js';
import { dayNumberToGregorian } from '../../src/calendar/gregorian.js';

const iso = (n: number) => {
  const g = dayNumberToGregorian(n);
  return `${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
};
const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('anniversaries vs hebcal', () => {
  it('yahrzeit: every death date in 5740–5760, anniversaries 5761–5800', () => {
    const differ = new Map<string, number>();
    let same = 0;
    for (let y = 5740; y <= 5760; y += 1) {
      for (let k = 0; k < daysInYear(y); k += 1) {
        const death = dayNumberToHebrew(roshHashana(y) + k);
        for (let target = 5761; target <= 5800; target += 1) {
          const theirs = getYahrzeit(target, new HDate(death.day, death.month, death.year));
          if (!theirs) continue;
          const ours = yahrzeit(death, target, { adar: 'rema', day30: 'magen-avraham' });
          if (ours.some((o) => iso(o.dayNumber) === isoOf(theirs.greg()))) same += 1;
          else {
            const key = `${death.month}/${death.day}`;
            differ.set(key, (differ.get(key) ?? 0) + 1);
          }
        }
      }
    }
    // hebcal follows the Rema (Adar I) and the Magen Avraham (30 Cheshvan/Kislev); with those customs we must agree exactly.
    expect(Object.fromEntries(differ)).toEqual({});
    expect(same).toBeGreaterThan(300_000);
  });

  it('birthday: every birth date in 5740–5760, anniversaries +1..+40', () => {
    const differ = new Map<string, number>();
    let same = 0;
    for (let y = 5740; y <= 5760; y += 1) {
      for (let k = 0; k < daysInYear(y); k += 1) {
        const birth = dayNumberToHebrew(roshHashana(y) + k);
        for (let target = y + 1; target <= y + 40; target += 1) {
          const theirs = getBirthdayOrAnniversary(target, new HDate(birth.day, birth.month, birth.year));
          if (!theirs) continue;
          const ours = hebrewBirthday(birth, target, { adarI: 'levush' });
          if (ours.some((o) => iso(o.dayNumber) === isoOf(theirs.greg()))) same += 1;
          else {
            const key = `${birth.month}/${birth.day}`;
            differ.set(key, (differ.get(key) ?? 0) + 1);
          }
        }
      }
    }
    // hebcal keeps an Adar I birthday in Adar I (the Levush's view).
    expect(Object.fromEntries(differ)).toEqual({});
    expect(same).toBeGreaterThan(300_000);
  });
});
