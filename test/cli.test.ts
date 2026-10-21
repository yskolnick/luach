import { describe, expect, it, vi } from 'vitest';
import { main, VERSION } from '../src/cli/cli';
import pkg from '../package.json';

function run(args: string[]): { code: number; out: string } {
  let out = '';
  const spy = vi.spyOn(process.stdout, 'write').mockImplementation((s: string | Uint8Array) => ((out += String(s)), true));
  try {
    return { code: main(args), out };
  } finally {
    spy.mockRestore();
  }
}

describe('cli', () => {
  it('version matches package.json', () => {
    expect(VERSION).toBe(pkg.version);
  });
  it('convert both ways', () => {
    expect(run(['convert', '2026-10-21']).out).toContain('10 Cheshvan 5787');
    expect(run(['convert', '14', 'Adar', 'II', '5787']).out.trim()).toBe('2027-03-23');
  });
  it('day view with a city, and JSON', () => {
    expect(run(['date', '2026-10-23', '--city', 'lakewood']).out).toContain('Candle lighting');
    // Pesach II on a Friday: Shabbos candles before sunset, not after nightfall.
    expect(run(['date', '2027-04-23', '--city', 'new-york']).out).toContain('Candle lighting: 19:25');
    const j = JSON.parse(run(['date', '2026-10-23', '--city', 'jerusalem', '--json']).out);
    expect(j.israel).toBe(true);
  });
  it('zmanim need a place; holidays; ics; cities', () => {
    expect(() => run(['zmanim', '2027-03-14'])).toThrow(/place/);
    expect(run(['zmanim', '2027-03-14', '--lat', '40.08', '--lon', '-74.21', '--tz', 'America/New_York']).out).toContain('Latest Shema (Gra)');
    expect(run(['holidays', '5787', '--israel']).out).toContain('Shemini Atzeres / Simchas Torah');
    expect(run(['ics', '2027-01-01', '2027-01-31']).out).toContain('BEGIN:VCALENDAR');
    expect(run(['cities', 'bene beraq']).out).toContain('bnei-brak');
  });
  it('help and unknown commands', () => {
    expect(run(['--help']).code).toBe(0);
    expect(run([]).code).toBe(1);
  });
});
