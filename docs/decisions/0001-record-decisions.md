# 0001. Record decisions in DECISIONS.md and ADRs

- Status: proposed
- Date: 2026-10-21
- Decision entry: plan §3 (process set by Yosef)

## Context

Yosef owns every decision. Work is done over many sessions by agents who need to resume
from the repository alone.

## Proposal

`DECISIONS.md` holds rulings (D-nn, quoted), open questions (Q-nn, with the interim
behaviour) and proposals (P-nn, with the default). ADRs here hold the reasoning for
architecture, tooling, dependency and licence choices. Entries are superseded, never
rewritten. Private records (session LOG, conversations) live in a separate private repo.

## Consequences

Anyone can see why the code is the way it is, and which parts are still Yosef's call.
