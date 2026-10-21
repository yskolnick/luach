// Oracle: @hebcal/leyning (BSD-2-Clause), used only as an independent check.
import { describe, expect, it } from 'vitest';
import { HDate } from '@hebcal/core';
import { getLeyningOnDate } from '@hebcal/leyning';
import { shabbosHaftara } from '../../src/parsha/haftara.js';
import { dayNumberToGregorian, dayOfWeek } from '../../src/calendar/gregorian.js';
import { roshHashana } from '../../src/calendar/hebrew.js';
import { writeReport } from './report.js';

// Same content, different notation: "Isaiah 27:6-28:13; Isaiah 29:22-23" = "Isaiah 27:6-28:13, 29:22-23", and a
// verse repeated at the end ("Isaiah 66:1-24; Isaiah 66:23") is listed by Luach but not by the oracle.
function norm(s: string | null | undefined): string {
  const parts: { book: string; range: string }[] = [];
  for (const piece of (s ?? '').replace(/–/g, '-').split(/;\s*/)) {
    for (const [i, r] of piece.split(/,\s*/).entries()) {
      const m = /^(.*?)\s*(\d[\d:-]*)$/.exec(r.trim());
      if (!m) continue;
      parts.push({ book: m[1] || (i > 0 ? parts[parts.length - 1]?.book ?? '' : ''), range: m[2] });
    }
  }
  const inside = (verse: string, range: string) => {
    const [a, b] = range.split('-');
    const [vc, vv] = verse.split(':').map(Number);
    const [ac, av] = a.split(':').map(Number);
    const [bc, bv] = (b ?? a).includes(':') ? (b ?? a).split(':').map(Number) : [ac, Number(b ?? a)];
    return (vc > ac || (vc === ac && vv >= av)) && (vc < bc || (vc === bc && vv <= bv));
  };
  const kept = parts.filter((p, i) => !(i > 0 && !p.range.includes('-') && parts.slice(0, i).some((q) => q.book === p.book && inside(p.range, q.range))));
  return kept.map((p) => `${p.book} ${p.range}`).join('; ');
}

for (const location of ['diaspora', 'israel'] as const) {
  describe(`haftara (Ashkenaz) vs @hebcal/leyning, ${location}, every Shabbos 5737–5800`, () => {
    it('agrees except for documented readings', () => {
      const groups = new Map<string, number>();
      let n0 = roshHashana(5737);
      n0 += (6 - dayOfWeek(n0) + 7) % 7;
      let count = 0;
      for (let n = n0; n < roshHashana(5801); n += 7) {
        const g = dayNumberToGregorian(n);
        const theirs: any = getLeyningOnDate(new HDate(new Date(g.year, g.month - 1, g.day)), location === 'israel');
        const ours = shabbosHaftara(n, location, 'ashkenaz');
        count += 1;
        const t = norm(theirs?.haftara);
        const o = norm(ours.reference);
        if (t !== o) {
          const key = `${ours.reason}${ours.parsha ? `:${ours.parsha.join('-')}` : ''} | ours=${o} | theirs=${t}`;
          groups.set(key, (groups.get(key) ?? 0) + 1);
        }
      }
      const list = [...groups.entries()].sort((a, b) => b[1] - a[1]);
      // Explained: Shavuos day 2 begins at Habakkuk 2:20 (SA OC 494:2); the oracle begins at 3:1, as many chumashim do.
      const unexplained = list.filter(([k]) => !k.startsWith('shavuos-2 | ours=Habakkuk 2:20-3:19 | theirs=Habakkuk 3:1-19'));
      writeReport(`haftara-${location}`, { oracle: '@hebcal/leyning', shabbosos: count, unexplained: unexplained.length, differences: Object.fromEntries(list) });
      expect(count).toBeGreaterThan(3000);
      expect(unexplained.map(([k, v]) => `${v}× ${k}`)).toEqual([]);
    });
  });
}

describe('haftara (Sephardi) vs @hebcal/leyning, diaspora, every Shabbos 5737–5800', () => {
  it('agrees except for documented readings', () => {
    const groups = new Map<string, number>();
    let n0 = roshHashana(5737);
    n0 += (6 - dayOfWeek(n0) + 7) % 7;
    let count = 0;
    for (let n = n0; n < roshHashana(5801); n += 7) {
      const g = dayNumberToGregorian(n);
      const theirs: any = getLeyningOnDate(new HDate(new Date(g.year, g.month - 1, g.day)), false);
      const ours = shabbosHaftara(n, 'diaspora', 'sephardi');
      count += 1;
      const t = norm(theirs?.sephardic ?? theirs?.haftara);
      const o = norm(ours.reference);
      if (t !== o) {
        const key = `${ours.reason}${ours.parsha ? `:${ours.parsha.join('-')}` : ''} | ours=${o} | theirs=${t}`;
        groups.set(key, (groups.get(key) ?? 0) + 1);
      }
    }
    const list = [...groups.entries()].sort((a, b) => b[1] - a[1]);
    // Explained (see the accuracy report):
    // - Rosh Chodesh Elul on Re'eh: Luach's Sephardi default follows the Mechaber (SA OC 425:1: "עניה סוערה"); the
    //   oracle follows the Rema's custom for Sephardim too, which also adds Re'eh's haftara to Ki Seitzei.
    // - Rosh Chodesh Av: the oracle adds the first and last verses of Isaiah 66 for Sephardim (a custom; no source found).
    const explained = (k: string) =>
      /^consolation-3 \| ours=Isaiah 54:11-55:5 \| theirs=Isaiah 66:1-24$/.test(k) ||
      /^consolation-5 \| ours=Isaiah 54:1-10 \| theirs=Isaiah 54:1-10; Isaiah 54:11-55:5$/.test(k) ||
      /^affliction-2 \| .* theirs=Jeremiah 2:4-28; Jeremiah 4:1-2; Isaiah 66:1; Isaiah 66:23$/.test(k);
    const unexplained = list.filter(([k]) => !explained(k));
    writeReport('haftara-sephardi', { oracle: '@hebcal/leyning', shabbosos: count, unexplained: unexplained.length, differences: Object.fromEntries(list) });
    expect(unexplained.map(([k, v]) => `${v}× ${k}`)).toEqual([]);
  });
});
