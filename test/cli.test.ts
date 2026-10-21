import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

const run = (...args: string[]) =>
  execFileSync(process.execPath, ['--import', 'tsx', 'src/cli/index.ts', ...args], { encoding: 'utf8', env: { ...process.env, TZ: 'UTC' } });

describe('CLI', () => {
  it('date with a city: header, calendar note, parsha, zmanim with opinions', () => {
    const s = run('date', '2026-10-21', '--city', 'Lakewood');
    expect(s).toContain('10 Cheshvan 5787');
    expect(s).toContain('diaspora calendar (from the location');
    expect(s).toContain('Parsha: Lech Lecha');
    expect(s).toMatch(/\d\d:\d\d {2}Netz HaChama/);
    expect(s).toContain('Ask your rav');
  });
  it('zmanim by coordinates, JSON', () => {
    const j = JSON.parse(run('zmanim', '2027-03-14', '--lat', '40.08', '--lon', '-74.21', '--tz', 'America/New_York', '--json'));
    expect(j.hebrew).toMatchObject({ year: 5787, month: 13, day: 5 });
    expect(j.zmanim.netz.local).toMatch(/^07:/);
  });
  it('Israel city picks the Israel calendar; flags override', () => {
    expect(run('parsha', '2027-04-24', '--city', 'Jerusalem')).toContain('Israel calendar');
    expect(run('parsha', '2027-04-24', '--city', 'Jerusalem', '--diaspora')).toContain('diaspora calendar');
  });
  it('convert both ways', () => {
    expect(run('convert', '5787-8-10', '--hebrew')).toContain('= 2026-10-21');
    expect(run('convert', '2026-10-21')).toContain('10 Cheshvan 5787');
  });
  it('ical and cities', () => {
    const ics = run('ical', 'holidays', '--from', '2026-09-01', '--to', '2026-09-30', '--diaspora');
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(run('cities', 'bene beraq')).toContain('Bnei Brak (בני ברק)');
  });
  it('bad input exits non-zero with a message', () => {
    expect(() => run('date', '2026-02-30')).toThrow(/no such date/);
  });
});
