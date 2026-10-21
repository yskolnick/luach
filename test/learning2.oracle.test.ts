import { describe, expect, it } from 'vitest';
import { HDate } from '@hebcal/core';
import * as L from '@hebcal/learning';
import { yerushalmiYomi, amudYomi, dafHaShavua, mishnaYomis, rambamOneChapter, rambamThreeChapters, nachYomi, seferHaMitzvosDay, civilToDays, daysToCivil, formatIsoDate, type LearningPortion } from '../src/index';

const SKIP = { day: -1 } as const;

/** Compares numbers exactly and requires the name to change on the same days. */
function compare(from: [number, number, number], to: [number, number, number], ours: (d: number) => LearningPortion | { day: number } | null | typeof SKIP, theirs: (hd: HDate) => { name: string; nums: string } | null) {
  const diffs: string[] = [];
  let lastO = '';
  let lastT = '';
  for (let d = civilToDays(...from); d <= civilToDays(...to); d++) {
    const c = daysToCivil(d);
    const hd = new HDate(new Date(c.year, c.month - 1, c.day));
    const o = ours(d);
    const t = theirs(hd);
    if (o === SKIP) continue;
    if ((o === null) !== (t === null)) { diffs.push(`${formatIsoDate(c)} ours ${JSON.stringify(o)} theirs ${JSON.stringify(t)}`); continue; }
    if (!o || !t) continue;
    const oText = 'text' in o ? o.text : String(o.day);
    const oNums = (oText.match(/\d+/g) ?? []).join(',');
    const oName = oText.split(/ \d| chapter| part/)[0]!;
    const tNums = (t.nums.match(/\d+/g) ?? []).join(',');
    if (oNums !== tNums) diffs.push(`${formatIsoDate(c)} ours ${oText} theirs ${t.name} ${t.nums}`);
    else if ((oName !== lastO) !== (t.name !== lastT)) diffs.push(`${formatIsoDate(c)} name change mismatch: ours ${oName} theirs ${t.name}`);
    lastO = oName;
    lastT = t.name;
    if (diffs.length > 10) break;
  }
  return diffs;
}

describe('learning cycles vs @hebcal/learning (test-only)', () => {
  it('Yerushalmi Yomi (Vilna) 1980–2060', () => {
    expect(compare([1980, 2, 2], [2060, 12, 31], yerushalmiYomi, (hd) => {
      const r = L.yerushalmiYomi(hd, L.vilna);
      return r ? { name: r.name, nums: String(r.blatt) } : null;
    })).toEqual([]);
  });
  it('Amud HaYomi 2023–2037', () => {
    expect(compare([2023, 10, 16], [2037, 12, 31], amudYomi, (hd) => {
      const r = L.calculateDirshuAmud(hd);
      return r ? { name: r.name, nums: String(r.amud) } : null;
    })).toEqual([]);
  });
  it('Daf HaShavua 2005–2060', () => {
    expect(compare([2005, 3, 6], [2060, 12, 31], dafHaShavua, (hd) => {
      const r = L.dafWeekly(hd);
      return { name: r.name, nums: String(r.blatt) };
    })).toEqual([]);
  });
  it('Mishna Yomis 1990–2060', () => {
    const idx = new L.MishnaYomiIndex();
    expect(compare([1990, 1, 1], [2060, 12, 31], mishnaYomis, (hd) => {
      const r = idx.lookup(hd);
      return { name: r[0]!.k, nums: [r[0]!.v, r[1]!.v].join(',').replace(/:/g, ',') };
    })).toEqual([]);
  });
  it('Rambam one chapter, chapter days 1985–2060', () => {
    expect(compare([1985, 1, 1], [2060, 12, 31], (d) => {
      const r = rambamOneChapter(d)!;
      // Intro days are labelled differently; the Haggadah day has no chapter number.
      return r.day <= 12 || r.text.endsWith('Haggadah') ? SKIP : r;
    }, (hd) => {
      const r = L.dailyRambam1(hd);
      return { name: r.name, nums: String(r.perek) };
    })).toEqual([]);
  });
  it('Rambam three chapters 1985–2060', () => {
    expect(compare([1985, 1, 1], [2060, 12, 31], (d) => {
      const r = rambamThreeChapters(d)!;
      return r.day <= 4 || r.text.includes('Haggadah') || r.text.includes('Order of Prayer') ? SKIP : r;
    }, (hd) => {
      const r = L.dailyRambam3(hd);
      return { name: r[0]!.name, nums: r.map((x) => x.perek).join(',') };
    })).toEqual([]);
  });
  it('Nach Yomi 2007–2060', () => {
    const idx = new L.NachYomiIndex();
    expect(compare([2007, 11, 1], [2060, 12, 31], nachYomi, (hd) => {
      const r = idx.lookup(hd);
      return { name: r.k, nums: String(r.v) };
    })).toEqual([]);
  });
  it('Sefer HaMitzvos day number 1985–2060', () => {
    expect(compare([1985, 1, 1], [2060, 12, 31], (d) => seferHaMitzvosDay(d), (hd) => {
      const r = L.seferHaMitzvot(hd);
      return { name: String(r.day), nums: String(r.day) };
    })).toEqual([]);
  });
});
