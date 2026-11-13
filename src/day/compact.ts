/**
 * A smaller form of the day and now documents, for APIs that send many of them.
 *
 * @packageDocumentation
 */

import { deepFreeze } from '../util/freeze.js';

/** The opinion and source of a time, stated once in a compact document. */
export interface CompactSource {
  readonly opinion: string;
  readonly source: string;
}

/** A compact document: the input's fields, with `sources` added. */
export type CompactJson<T> = { readonly [K in keyof T]: unknown } & { readonly sources: Readonly<Record<string, CompactSource>> };

const isZman = (o: Record<string, unknown>): boolean =>
  typeof o.id === 'string' && typeof o.opinion === 'string' && typeof o.source === 'string' && typeof o.timeZone === 'string' && 'slot' in o && 'local' in o;

/**
 * `doc` (a `dayInfo` or `nowInfo` result) with each time's `opinion` and `source` moved to one
 * `sources` table by zman id, and its `timeZone` left out (it is the location's, given once in
 * `location.timeZone`). A time whose id has two different texts in the document keeps its own.
 * The full document is unchanged; this returns a new, frozen one. The saving is where times repeat:
 * about a fifth of a `nowInfo` document, two fifths of a month of days given as
 * `compactJson({ days: dayInfoRange(start, 30, options) })`.
 */
export function compactJson<T extends object>(doc: T): CompactJson<T> {
  const copy = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  const texts = new Map<string, string>();
  const conflict = new Set<string>();
  const visit = (o: unknown, act: (z: Record<string, unknown>) => void): void => {
    if (Array.isArray(o)) for (const v of o) visit(v, act);
    else if (o && typeof o === 'object') {
      const r = o as Record<string, unknown>;
      if (isZman(r)) act(r);
      else for (const v of Object.values(r)) visit(v, act);
    }
  };
  visit(copy, (z) => {
    const key = `${z.opinion as string}\u0000${z.source as string}`;
    const seen = texts.get(z.id as string);
    if (seen !== undefined && seen !== key) conflict.add(z.id as string);
    texts.set(z.id as string, key);
  });
  const sources: Record<string, CompactSource> = {};
  visit(copy, (z) => {
    const id = z.id as string;
    delete z.timeZone;
    if (conflict.has(id)) return;
    sources[id] = { opinion: z.opinion as string, source: z.source as string };
    delete z.opinion;
    delete z.source;
  });
  return deepFreeze({ ...copy, sources }) as unknown as CompactJson<T>;
}
