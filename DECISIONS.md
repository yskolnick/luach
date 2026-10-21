# Decisions

Rulings (D-nn) quote Yosef's own words. Open questions (Q-nn) say what happens until they are answered.
Proposals (P-nn) say why and what the default is. Entries are added and superseded, never rewritten.
Anything the code does that nobody chose is marked **As built** (see the end of this file).

## Q-00. Unmerged branches (kept current)

| Branch | Repo | State |
|---|---|---|
| `claude/exciting-clarke-64dzwd` | luach | Independent implementation of M1–M8, not merged; see Q-13 (a second implementation is on `main`) |
| `claude/exciting-clarke-64dzwd` | luach-records | Private records; Yosef merges |

## Decided

### D-01. The name is Luach
- Yosef: "use luach".
- npm package `luach`, repo `yskolnick/luach`. The name was free on npm on 2026-10-21 (`npm view luach` returned 404).
- An unrelated package, `luach-picker`, exists; the README says how Luach differs.

### D-02. No demo app in this run; Luach is a package for other apps
- Yosef: "Expo isn't part of this run.  We want a tool that someone else can run as a package the same way people use hebcal.  This should be able to be used in other apps with appropriate credit given etc and in my own apps"
- Consequence: the Expo demo app (brief M7) is removed from this run. The demo is the CLI, the examples in `examples/`, and the docs site.

### D-03. Keep a Hermes test run
- Yosef asked "why do we need a hermes?". After the explanation (React Native's engine; time-zone `Intl` gaps) and the choice "keep it or drop it", Yosef replied: "ok".
- Read as: keep it. If that reading is wrong, see Q-10.

## Open questions

### Q-01. Licence: Apache-2.0 with NOTICE (P-01), or MIT
- Until decided: Apache-2.0 with NOTICE.
- Note: no standard open-source licence can force credit inside an app's UI. Apache-2.0 requires redistributors to carry the NOTICE text, which is the closest standard licence to "give us credit". MIT only requires keeping the copyright line.

### Q-02. How credit should read
- Until decided: "Built on Luach by Yosef Skolnick" in NOTICE and in the README's "How to credit".

### Q-04. Branch and PR model
- The working session is pinned to the branch `claude/exciting-clarke-64dzwd`. The brief asks for a branch per milestone, merged when CI is green.
- Until decided: all work on `claude/exciting-clarke-64dzwd`, one PR to `main`, Yosef merges. (Proposed to Yosef as the default; his reply "ok" may cover it.)

### Q-05. Commit attribution
- Until decided: public commits carry no model names and no session links; session links live only in the private records repo.

### Q-07. Oracle tests as a separate CI job
- The daily zmanim comparison (4 years x 19 cities x every opinion) is slow.
- Until decided: `npm test` runs unit and property tests; `npm run test:oracle` runs the oracle comparisons, as its own CI job.

### Q-08. Visible netz
- Visible sunrise needs terrain (horizon) data, which coordinates alone don't give.
- Until decided: no "visible netz"; sunrise functions accept a caller-supplied horizon depression angle, documented as not computed by Luach.

### Q-09. Misheyakir 12.85°
- No published source for 12.85° was found. 7.65° (attributed to Rav Moshe Feinstein for New York) is widely printed.
- Until decided: ship 10.2°, 11°, 11.5° and 7.65°; add 12.85° only with a source.
- Update 2026-10-21 (research note §6): no published page ties 7.65° (or 9.5°) to a named authority either.
  New default: named functions only for angles with a source; every angle is available through the generic
  `misheyakirAtDegrees(angle)`, so callers can use 7.65°, 9.5° or 12.85° on their own rav's say-so.

### Q-10. Hermes run scope
- The Linux Hermes CLI (`hermes-engine-cli`) has no `Intl` and no `class` syntax. On phones, Hermes gets `Intl` from the platform.
- Until decided: CI runs the whole non-time-zone suite on Hermes, and checks that time-zone code works there through a caller-supplied provider. Library code avoids `class`.

### Q-12. Learning cycles that need a table or a decision
- Research (docs/research/2026-10-21-learning-cycles.md) found that these are not rule-based, or not public:
  Sefer HaMitzvos daily (Chabad's table, all rights reserved); Chofetz Chaim and Shemiras HaLashon yomi (a fixed
  table by Hebrew date, published in a copyrighted book); Tanya Yomi (Hayom Yom table, Kehot 1943); Halacha Yomis
  (no public start date); Daf HaYomi B'Halacha (Dirshu's page map not public); Amud Yomi (day mapping does not match
  Dirshu's published anchor by one day); the Schottenstein Yerushalmi cycle (skip days and order not published).
- Until decided: not shipped; marked blocked in the roadmap. Options for Yosef: get permission to use a table
  (Chabad, the Chofetz Chaim Heritage Foundation, Dirshu, ArtScroll), or approve deferring them past 1.0.

### Q-13. Two parallel implementations
- On 2026-10-21 a second working session built Luach from the same brief on branches `m0-scaffold` … `m5-places`;
  PRs #1–#4 were merged into `main`, #5 and #6 are open. This branch (`claude/exciting-clarke-64dzwd`) is an
  independent implementation of M1–M8 and has not been merged.
- Until decided: no further feature work on this branch; nothing here touches `main` or the other branches.

## Proposals

### P-01. Licence Apache-2.0 with a NOTICE naming Yosef
- Why: Apache-2.0 obliges redistributors to keep the NOTICE text (credit), is permissive enough for commercial apps, and has an explicit patent grant.
- Default: Apache-2.0 (in force until Q-01 is answered). If Yosef picks MIT, swap LICENSE and NOTICE; no code changes.

### P-02. No `class` syntax, plain functions and objects
- Why: works on old Hermes builds without Babel, tree-shakes better.
- Default: in force. See ADR-0002.

## As built

Choices made while building that nobody has ruled on. Each can be changed.

- AB-01. Month numbers count from Nisan (Nisan = 1 … Adar = 12, Adar II = 13), following Shemos 12:2. Named constants are exported, so callers need not use numbers.
- AB-02. Gregorian dates before 15 October 1582 are proleptic Gregorian. Supported range: Hebrew years 1–9999 for conversion; validated by property tests over 5660–6000.
- AB-03. A Gregorian civil date maps to the Hebrew date of its daytime. Callers who need the evening (after sunset) date pass `afterSunset: true` or use the zmanim-aware helper.
- AB-04. Parsha joins after Pesach: beyond the joins forced by "Bamidbar before Shavuos", pairs are joined in the order
  Tazria–Metzora, Acharei–Kedoshim, Matos–Masei, Behar–Bechukosai, Chukas–Balak (common years) and
  Matos–Masei, Chukas–Balak, Acharei–Kedoshim, Behar–Bechukosai (leap years). In Israel, when the diaspora's
  eighth day of Pesach is Shabbos, this keeps Israel a week ahead until Behar/Bechukosai (common) or
  Matos/Masei (leap). Mishna Berura 428:10 records other customs (splitting Tazria–Metzora instead); Luach
  follows the one that agrees with current calendars and the oracle for every Shabbos 5660–6000.
- AB-05. Jerusalem mean time for the molad uses longitude 35.2354° E (UTC+2:20:56.5). Kiddush Levana times
  match kosher-zmanim to the millisecond with this value.
- AB-06. Yom Kippur Katan when Erev Rosh Chodesh is Friday: default `'friday'` (Magen Avraham 417); `'thursday'`
  available. Months excluded: Tishrei, Cheshvan, Teves, Iyar.
- AB-07. Omer text: number words in Nusach Ashkenaz; ending לעומר by default, בעומר as an option.
- AB-08. Modern Israeli days start in the year each was established (Yom HaZikaron 5711, Yom Yerushalayim 5728,
  Yom HaShoah Sunday rule 5757, Sigd 5769, Yom HaAliyah 5777). hebcal lists some earlier; see the accuracy report.
- AB-09. Purim Meshulash is listed on all three days (14–16 Adar) when 15 Adar is Shabbos.
- AB-10. Zmanim defaults: sunrise/sunset at sea level; the Magen Avraham's days, fixed-minute alos/tzeis and degree
  times always at sea level; the Gra's day, netz and shkiah follow the `elevation`/`horizonDip` options.
  Havdala default 8.5°; fast start default alos 72 minutes, end tzeis 8.5°; candle lighting default 18 minutes.
- AB-11. High-latitude fallback: `'solar-midnight'` only, off by default, marked `fallback` on the result.
- AB-12. `isInIsrael()` uses a coarse hand-drawn polygon (Golan and Judea and Samaria included) for the Israel
  calendar; the city table's Israel flag uses the same boundary. Calendar functions never infer location.
- AB-13. `hallel()` follows the Shulchan Aruch and leaves Yom HaAtzmaut / Yom Yerushalayim (custom) out. Tachanun
  moved to post-1.0 (HOL-19).
- AB-14. The brief's example citation "Shulchan Aruch Harav 89:1" for 72 minutes / 16.1° does not say that
  (it is about instituting the three prayers). Luach cites Magen Avraham 58:1 and Pesachim 94a instead.
- AB-15. Haftara defaults (all overridable): Rosh Chodesh Av → Shim'u (MB 425:8, the Gra); Rosh Chodesh Elul → Rema for
  Ashkenaz/Chabad, Mechaber for Sephardi/Teimani (SA OC 425:1); Shabbos HaGadol → every year, except Chabad (only on
  Erev Pesach); Ashkenaz Shuva → Dagul Mervava (MB 428:23). getDay() includes the haftara and Pirkei Avos only when a
  minhag is passed.
- AB-16. Pirkei Avos: until Rosh Hashana for Ashkenaz/Chabad, until Shavuos for Sephardi/Teimani; at the end of the summer
  the last weeks read two chapters so the year ends with chapters 5–6 (matches the oracle every year 5660–6000).
