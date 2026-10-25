import { describe, expect, it } from 'vitest';
import { HDate } from '@hebcal/core';
import { DafYomi } from '@hebcal/learning';
import { dafYomi, daysToCivil, civilToDays, formatIsoDate } from '../src/index';
import { dafYomiCycleStart } from '../src/learning/bavli';

// hebcal spellings → ours (test-only; names are plain transliterations).
const NAME_MAP: Record<string, string> = {
  Berachot: 'Berakhot', 'Rosh Hashana': 'Rosh Hashanah', Gitin: 'Gittin', 'Baba Kamma': 'Bava Kamma',
  'Baba Metzia': 'Bava Metzia', 'Baba Batra': 'Bava Batra', Bechorot: 'Bekhorot', Arachin: 'Arakhin', Midot: 'Middot',
};

describe('Daf Yomi: oracle @hebcal/core, every day 1923-09-11 … 2240-12-31', () => {
  it('matches', () => {
    const diffs: string[] = [];
    for (let d = civilToDays(1923, 9, 11); d <= civilToDays(2240, 12, 31); d++) {
      const c = daysToCivil(d);
      const ours = dafYomi(d)!;
      const theirs = new DafYomi(new Date(c.year, c.month - 1, c.day));
      const tName = NAME_MAP[theirs.getName()] ?? theirs.getName();
      if (ours.daf !== theirs.getBlatt() || ours.tractate.replace(/[^a-z]/gi, '').toLowerCase() !== tName.replace(/[^a-z]/gi, '').toLowerCase()) {
        diffs.push(`${formatIsoDate(c)} ours ${ours.tractate} ${ours.daf} hebcal ${theirs.getName()} ${theirs.getBlatt()}`);
        if (diffs.length > 20) break;
      }
    }
    expect(diffs).toEqual([]);
  });
  it('published siyum dates', () => {
    // Siyum HaShas of the 13th cycle: 4 January 2020; 14th cycle began 5 January 2020.
    expect(formatIsoDate(daysToCivil(dafYomiCycleStart(14)))).toBe('2020-01-05');
    expect(formatIsoDate(daysToCivil(dafYomiCycleStart(15) - 1))).toBe('2027-06-07');
    void HDate;
  });
});
