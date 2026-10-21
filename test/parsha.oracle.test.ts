import { describe, expect, it } from 'vitest';
import { HDate, Sedra } from '@hebcal/core';
import { readingCycle, HebrewDate } from '../src/index';
import { PARSHIYOS } from '../src/parsha/parsha';

const HEBCAL_NAMES = ['Bereshit','Noach','Lech-Lecha','Vayera','Chayei Sara','Toldot','Vayetzei','Vayishlach','Vayeshev','Miketz','Vayigash','Vayechi','Shemot','Vaera','Bo','Beshalach','Yitro','Mishpatim','Terumah','Tetzaveh','Ki Tisa','Vayakhel','Pekudei','Vayikra','Tzav','Shmini','Tazria','Metzora','Achrei Mot','Kedoshim','Emor','Behar','Bechukotai','Bamidbar','Nasso',"Beha'alotcha","Sh'lach",'Korach','Chukat','Balak','Pinchas','Matot','Masei','Devarim','Vaetchanan','Eikev',"Re'eh",'Shoftim','Ki Teitzei','Ki Tavo','Nitzavim','Vayeilech',"Ha'azinu",'Vezot Haberakhah'];

describe('parsha: oracle @hebcal/core, every Shabbos 5660–6000', () => {
  for (const israel of [false, true]) {
    it(israel ? 'Israel' : 'diaspora', () => {
      const diffs: string[] = [];
      for (let y = 5660; y <= 5999; y++) {
        for (const r of readingCycle(y, { israel })) {
          const hd = new HDate(r.date.day, r.date.month, r.date.year);
          const theirs = new Sedra(r.date.year, israel).lookup(hd);
          const t = theirs.chag ? null : theirs.parsha.join('-');
          const o = r.parsha ? r.parsha.map((p) => HEBCAL_NAMES[PARSHIYOS.indexOf(p)]).join('-') : null;
          if (o !== t) diffs.push(`${r.date} ours ${o} hebcal ${t}`);
        }
      }
      expect(diffs.slice(0, 20)).toEqual([]);
    });
  }
});
