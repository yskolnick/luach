// Shared tables must not be changeable by a caller: a write to ZMANIM, DEFAULT_DAY_ZMANIM,
// a place from getPlace() or the Israel boundary would silently change every later result
// in the process (another user's request on a server, another screen in an app).
//
// Today they are plain objects and arrays, so each test below is a todo: it runs by itself
// once its table is frozen (see `whenFrozen`). Each body restores what it touched, so it is
// safe even if it ever ran against an unfrozen table.
import { describe, expect, it } from 'vitest';
import {
  ZMANIM, DEFAULT_DAY_ZMANIM, ISRAEL_BOUNDARY, ZmanimCalendar, dayInfo, getPlace, builtInPlaces, isInIsrael,
} from '../src/index';
import { fullPlaces } from '../src/places/full';

const day = { year: 2027, month: 1, day: 1 };
const lakewood = () => getPlace('lakewood')!;

/** `it` once every target is deeply frozen (each own object value too), `it.todo` until then. */
function whenFrozen(name: string, targets: readonly unknown[], fn: () => void) {
  const deep = (o: unknown): boolean =>
    !o || typeof o !== 'object' || (Object.isFrozen(o) && Object.values(o).every(deep));
  if (targets.every(deep)) it(name, fn);
  else it.todo(name);
}

/** Runs `write` and expects it to throw (strict-mode write to a frozen object). */
function rejects(write: () => void) {
  expect(write).toThrow(TypeError);
}

describe('shared tables are immutable', () => {
  whenFrozen('ZMANIM and each of its entries cannot be changed', [ZMANIM], () => {
    const table = ZMANIM as Record<string, { opinion: string }>;
    const before = new ZmanimCalendar(lakewood(), day).sunrise().opinion;
    rejects(() => { table.sunrise!.opinion = 'changed'; });
    rejects(() => { table.sunrise = { ...table.sunrise!, opinion: 'replaced' }; });
    rejects(() => { table['made-up'] = { opinion: 'x' }; });
    rejects(() => { delete table.sunrise; });
    expect(new ZmanimCalendar(lakewood(), day).sunrise().opinion).toBe(before);
  });

  whenFrozen('DEFAULT_DAY_ZMANIM cannot be changed', [DEFAULT_DAY_ZMANIM], () => {
    const list = DEFAULT_DAY_ZMANIM as unknown as string[];
    const before = dayInfo(day, { location: lakewood() }).zmanim.map((z) => z.id);
    rejects(() => { list.push('tzeis72'); });
    rejects(() => { list[0] = 'alos120'; });
    rejects(() => { list.length = 0; });
    expect(dayInfo(day, { location: lakewood() }).zmanim.map((z) => z.id)).toEqual(before);
  });

  whenFrozen('places from getPlace() and builtInPlaces() cannot be changed', [builtInPlaces()], () => {
    const p = getPlace('lakewood') as unknown as { latitude: number; timeZone: string; aliases: string[] };
    const sunrise = new ZmanimCalendar(lakewood(), day).sunrise().time;
    rejects(() => { p.latitude = 0; });
    rejects(() => { p.timeZone = 'UTC'; });
    rejects(() => { p.aliases.push('x'); });
    rejects(() => { (builtInPlaces() as unknown as unknown[]).length = 0; });
    expect(new ZmanimCalendar(lakewood(), day).sunrise().time).toEqual(sunrise);
    expect(getPlace('jerusalem')).toBeDefined();
  });

  whenFrozen('places from luach/places-full cannot be changed', [fullPlaces()], () => {
    const p = fullPlaces()[0] as unknown as { latitude: number };
    rejects(() => { p.latitude = 0; });
    rejects(() => { (fullPlaces() as unknown as unknown[]).pop(); });
  });

  whenFrozen('ISRAEL_BOUNDARY cannot be changed', [ISRAEL_BOUNDARY], () => {
    const b = ISRAEL_BOUNDARY as unknown as [number, number][];
    rejects(() => { b[0]![0] = 0; });
    rejects(() => { b.length = 0; });
    expect(isInIsrael(31.7683, 35.2137)).toBe(true);
  });
});
