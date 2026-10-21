import { describe, expect, it } from 'vitest';
import * as luach from '../src/index';
import * as full from '../src/places/full';

// The public API (D-12). Internal helpers are not exported; this list changes only on purpose.
// Removing a name is a breaking change: note it in CHANGELOG.md.

const PUBLIC = ['BAVLI_TRACTATES', 'DAY_INFO_SCHEMA_ID', 'DEFAULT_DAY_ZMANIM', 'DEPRESSION_RANGE', 'HebrewDate', 'ISRAEL_BOUNDARY', 'LOCAL_CANDLE_LIGHTING', 'MAX_YEAR', 'MINUTES_RANGE', 'MIN_YEAR', 'Month', 'PARSHIYOS', 'UTC', 'ZMANIM', 'Zman', 'ZmanimCalendar', 'amidahSeason', 'amudYomi', 'anniversary', 'ashkenazi', 'barMitzvahDate', 'birkasHachamaDates', 'builtInPlaces', 'civilDateAt', 'civilToDays', 'dafHaShavua', 'dafYomi', 'dayInfo', 'dayInfoRange', 'daysToCivil', 'distanceKm', 'en', 'extendLocale', 'fastMinchaHaftara', 'fastOn', 'fastTimes', 'fixedOffsetZone', 'formatHebrewDate', 'formatIsoDate', 'formatTime', 'gematriya', 'getPlace', 'haftaraFor', 'he', 'hebrewDateAt', 'holidayName', 'holidaysBetween', 'holidaysForYear', 'holidaysOn', 'isBirkasHachama', 'isInIsrael', 'isLeapYear', 'isMelachaForbidden', 'isMelachaForbiddenAt', 'isolate', 'kiddushLevana', 'locate', 'mishnaYomis', 'molad', 'moladAnnouncement', 'moladInstant', 'monthLength', 'monthName', 'monthsInYear', 'monthsOfYear', 'mourningPeriods', 'nachYomi', 'nearestPlace', 'nextHoliday', 'offsetMinutes', 'omerDay', 'omerSefirah', 'omerText', 'omerTextEnglish', 'parseGematriya', 'parseHebrewDate', 'parseIsoDate', 'parshaFor', 'parshaName', 'pirkeiAvos', 'rambamOneChapter', 'rambamThreeChapters', 'readingCycle', 'roshChodeshOn', 'searchPlaces', 'seferHaMitzvosDay', 'sephardi', 'stripBidiControls', 'talUmatarStart', 'tefillahOn', 'toICalendar', 'weekdayName', 'yearLength', 'yearType', 'yerushalmiYomi', 'zmanLabel'];

const FULL = ['distanceKm', 'fullPlaces', 'isInIsrael', 'nearestPlace', 'searchPlaces'];

describe('public API', () => {
  it('luach exports exactly the public names', () => {
    expect(Object.keys(luach).sort()).toEqual([...PUBLIC].sort());
  });
  it('luach/places-full exports exactly its public names', () => {
    expect(Object.keys(full).sort()).toEqual([...FULL].sort());
  });
});
