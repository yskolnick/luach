/**
 * A value computed on first use and then cached. Module-level tables are built through this (called with a
 * `@__PURE__` annotation) so that importing one function doesn't run, or bundle, every other module's set-up.
 *
 * @internal
 */
export function lazy<T>(compute: () => T): () => T {
  let done = false;
  let value: T;
  return () => {
    if (!done) {
      value = compute();
      done = true;
    }
    return value;
  };
}
