/**
 * Freezes an object and everything reachable from it, so a caller cannot change a table
 * that every other caller shares (D-11). Internal; not exported from the package.
 */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as object)) deepFreeze(v);
  }
  return value;
}
