/**
 * `luach/dailies`: dailies set by the date, each from a rule in its source and the traditional
 * divisions of the text, with no publisher's table: Tehillim by the day of the week and Shnayim
 * Mikra. A separate entry point because Shnayim Mikra needs the aliyos and the week's parsha:
 *
 * ```ts
 * import { tehillimByWeek, shnayimMikra } from 'luach/dailies';
 * ```
 *
 * Ask your rav. This library calculates; it does not rule.
 *
 * @module luach/dailies
 */

export { tehillimByWeek, shnayimMikra, type ShnayimMikraPortion } from '../learning/dailies.js';
export type { LearningPortion } from '../learning/cycles.js';
