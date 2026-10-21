import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// Every entry in DECISIONS.md has a rationale section in docs/rationale.md, and every
// rationale section names its sources and its confidence.

const decisions = readFileSync('DECISIONS.md', 'utf8');
const rationale = readFileSync('docs/rationale.md', 'utf8');

const decisionIds = [
  ...[...decisions.matchAll(/^### ([DQP]-\d\d)\./gm)].map((m) => m[1]!),
  ...[...decisions.matchAll(/^- \*\*(AB-\d\d)\*\*/gm)].map((m) => m[1]!),
];
const sections = rationale.split(/^### /m).slice(1);
const rationaleIds = sections.map((s) => /^([DQP]-\d\d|AB-\d\d)\b/.exec(s)?.[1]);

it('every decision has a rationale entry, and nothing else does', () => {
  expect(decisionIds.length).toBeGreaterThan(40);
  expect(rationaleIds.filter((id) => id === undefined)).toEqual([]);
  expect([...rationaleIds].sort()).toEqual([...decisionIds].sort());
});

it('every rationale entry states its sources and confidence', () => {
  for (const s of sections) {
    const id = s.slice(0, 5);
    expect(s, id).toMatch(/\*\*Sources:\*\*/);
    expect(s, id).toMatch(/\*\*Confidence:\*\* (High|Medium|Low|Not applicable)\b/);
  }
});
