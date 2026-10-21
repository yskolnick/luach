import { describe, expect, it } from 'vitest';
import { getLeyningOnDate } from '@hebcal/leyning';
import { HDate } from '@hebcal/core';
import { haftaraFor, HebrewDate, Month } from '../src/index';

/** "Isaiah 66:1-24; Isaiah 66:23" and "Isaiah 66:1-24; 66:23" both become "isaiah66:1-24|isaiah66:23". */
function norm(s: string | null | undefined): string | null {
  if (!s) return null;
  let book = '';
  return s
    .replace(/–/g, '-')
    .split(/;\s*|,\s*/)
    .map((seg) => {
      const m = /^([1-2I ]*[A-Za-z][A-Za-z ]*?)\s+(\d.*)$/.exec(seg.trim());
      if (m) {
        book = m[1]!.replace(/^II /, '2 ').replace(/^I /, '1 ').toLowerCase().replace(/\s/g, '');
        return book + m[2];
      }
      return book + seg.trim();
    })
    // Drop a repeated single verse that an earlier segment already contains (the custom of
    // repeating the first verse at the end); merge ranges that run on (54:1-10 + 54:11-55:5).
    .filter((seg, i, all) => {
      const m = /^(.*?)(\d+):(\d+)$/.exec(seg);
      if (!m) return true;
      return !all.slice(0, i).some((prev) => {
        const r = /^(.*?)(\d+):(\d+)-(?:(\d+):)?(\d+)$/.exec(prev);
        if (!r || r[1] !== m[1]) return false;
        const v = +m[2]! * 1000 + +m[3]!;
        return v >= +r[2]! * 1000 + +r[3]! && v <= +(r[4] ?? r[2])! * 1000 + +r[5]!;
      });
    })
    .reduce<string[]>((acc, seg) => {
      const prev = acc[acc.length - 1];
      const a = prev && /^(.*?)(\d+):(\d+)-(?:(\d+):)?(\d+)$/.exec(prev);
      const b = /^(.*?)(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/.exec(seg);
      if (a && b && a[1] === b[1] && +(a[4] ?? a[2])! === +b[2]! && +a[5]! + 1 === +b[3]!) {
        acc[acc.length - 1] = `${a[1]}${a[2]}:${a[3]}-${b[4] ?? b[2]}:${b[5] ?? b[3]}`;
      } else acc.push(seg);
      return acc;
    }, [])
    .join('|');
}

/**
 * Explained differences: genuine variants between published lists, documented in
 * docs/research/2026-10-21-haftaros.md and docs/accuracy.md. Keyed by Luach's haftara key.
 */
const EXPLAINED: Record<string, string> = {
  'ashkenaz kedoshim': 'Kedoshim: Ezekiel 22 ends at 22:16 (Luach) or 22:19 (hebcal); both are in published lists',
  'ashkenaz shabbos-shuva': 'Shabbos Shuva with Haazinu: Luach adds Joel 2:15-27 (Dagul Mervava, MB 428:23), hebcal Micah 7:18-20; both are in use',
  'ashkenaz shavuos-2': 'Shavuos day 2: Habakkuk 2:20 or 3:1 as the opening verse; both are in use',
  'sephardi shabbos-rosh-chodesh-elul': 'Rosh Chodesh Elul on Shabbos Re\'eh: Sephardim keep Re\'eh\'s haftara (research note); hebcal reads Isaiah 66',
  'sephardi ki-seitzei-after-rosh-chodesh-elul': 'Follows from the line above: Sephardim did not skip Re\'eh\'s haftara, so Ki Seitzei is not doubled',
  'sephardi shabbos-rosh-chodesh-and-erev': 'Sephardim add the first and last verses of Machar Chodesh (SA OC 425:1); hebcal follows the Rema',
  'sephardi shabbos-rosh-chodesh-av': 'Sephardim do not add Isaiah 66 verses on Rosh Chodesh Av (Chabad does); hebcal adds them',
  'sephardi simchas-torah': 'Sephardim end at Joshua 1:9 (research note: EnWP, HeWP, AlHaTorah); hebcal reads to 1:18',
  'sephardi shavuos-2': 'Shavuos day 2: Habakkuk 2:20 or 3:1 as the opening verse; both are in use',
};

export function diffs(israel: boolean, minhag: 'ashkenaz' | 'sephardi', from: number, to: number): string[] {
  const out: string[] = [];
  for (let d = new HebrewDate(from, Month.TISHREI, 1).onOrAfter(6); d.year < to; d = d.addDays(7)) {
    const l = getLeyningOnDate(new HDate(d.day, d.month, d.year), israel) as { haftara?: string; sephardic?: string; name?: { en: string } } | undefined;
    const theirs = norm(minhag === 'sephardi' ? l?.sephardic ?? l?.haftara : l?.haftara);
    const h = haftaraFor(d, { israel, minhag });
    const ours = norm(h?.reference);
    // Only the end verse of Kedoshim's Ezekiel 22 is a variant; which haftara is read is checked.
    // Shabbos Shuva: only Luach's Joel (with Haazinu) against hebcal's Micah is explained.
    const shuvaChecked = h?.key === 'shabbos-shuva' && minhag === 'ashkenaz' && !(ours === 'hosea14:2-10|joel2:15-27' && theirs === 'hosea14:2-10|micah7:18-20');
    if (shuvaChecked || (h?.key === 'kedoshim' && minhag === 'ashkenaz' && !(ours === 'ezekiel22:1-16' && theirs === 'ezekiel22:1-19'))) {
      if (ours !== theirs) out.push(`${d} ${l?.name?.en ?? ''}: ours ${h.key} ${ours} | hebcal ${theirs}`);
      continue;
    }
    if (h && EXPLAINED[`${minhag} ${h.key}`]) continue;
    if (ours !== theirs) out.push(`${d} ${l?.name?.en ?? ''}: ours ${h?.key} ${ours} | hebcal ${theirs}`);
  }
  return out;
}

describe('haftara vs @hebcal/leyning (test-only)', () => {
  for (const israel of [false, true]) {
    for (const minhag of ['ashkenaz', 'sephardi'] as const) {
      it(`${minhag} ${israel ? 'Israel' : 'diaspora'} 5660–6000`, () => {
        expect(diffs(israel, minhag, 5660, 6000).slice(0, 40)).toEqual([]);
      });
    }
  }
});
