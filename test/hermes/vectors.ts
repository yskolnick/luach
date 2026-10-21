// Shared test vectors: computed in Node and in Hermes, and the two outputs must be identical.
// Grows with each milestone. Time-zone-dependent code uses a fixed provider here, because the
// Hermes command-line build has no Intl.
import * as L from '../../src/index.js';

// A fixed-offset provider for the vectors (+02:00 / +03:00 by a simple rule, purely for testing).
const fakeJerusalem: L.TimeZoneProvider = (_tz, ms) => {
  const g = L.dayNumberToGregorian(Math.floor(ms / 86_400_000));
  return g.month >= 4 && g.month <= 10 ? 180 : 120;
};

export function computeVectors(): unknown {
  const out: Record<string, unknown> = {};
  const conv: string[] = [];
  for (let n = L.gregorianToDayNumber(1900, 1, 1); n <= L.gregorianToDayNumber(2240, 12, 31); n += 37) {
    const h = L.dayNumberToHebrew(n);
    conv.push(`${n}:${h.year}-${h.month}-${h.day}`);
  }
  out.conversion = conv;
  const years: string[] = [];
  for (let y = 5660; y <= 6000; y += 1) {
    const m = L.molad(y, L.TISHREI);
    years.push(`${y}:${L.roshHashana(y)}:${L.daysInYear(y)}:${L.yearType(y)}:${m.dayOfWeek}/${m.hours}/${m.chalakim}`);
  }
  out.years = years;
  out.gematriya = [1, 15, 16, 115, 613, 787, 5787].map((n) => L.gematriya(n));
  out.format = L.formatHebrewDate({ year: 5787, month: L.ADAR_II, day: 14 }, { style: 'he', length: 'long', isolate: true });
  out.yahrzeit = L.yahrzeit({ year: 5783, month: L.ADAR, day: 7 }, 5784).map((a) => a.custom + a.dayNumber);
  out.zoned = L.toZoned(Date.UTC(2026, 0, 15, 22, 30), 'Asia/Jerusalem', fakeJerusalem);
  out.fromZoned = L.fromZoned(L.gregorianToDayNumber(2026, 7, 1), 43_200_000, 'Asia/Jerusalem', fakeJerusalem);
  let intlError = 'none';
  try {
    L.offsetMinutes('Asia/Jerusalem', 0, L.intlTimeZoneProvider);
  } catch (e) {
    intlError = String((e as Error).message).slice(0, 40);
  }
  const loc = { latitude: 31.7683, longitude: 35.2137, elevation: 754, timeZone: 'Asia/Jerusalem' };
  const zmanim: (string | null)[] = [];
  for (let n = L.gregorianToDayNumber(2026, 1, 1); n <= L.gregorianToDayNumber(2026, 12, 31); n += 7) {
    for (const f of [L.alos16_1, L.alos72, L.netz, L.sofZmanShemaGra, L.sofZmanShemaMA72, L.chatzos, L.plagHaminchaGra, L.shkiah, L.tzeis8_5]) {
      const z = f(n, loc, { timeZoneProvider: fakeJerusalem, rounding: 'none' });
      zmanim.push(z.time ? z.time.toISOString() : null);
    }
  }
  out.zmanim = zmanim;
  out.parsha = L.parshiyosOfYear(5787, 'diaspora').map((r) => (r.parsha ? r.parsha.join('-') : r.special));
  out.holidays = L.holidaysInYear(5787, { location: 'israel', modernIsraeli: true }).map((h) => `${h.id}@${h.dayNumber}`);
  out.intlAvailable = typeof Intl !== 'undefined' && intlError === 'none';
  return out;
}
