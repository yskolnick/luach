# ADR-0001: Licence Apache-2.0 with a NOTICE naming Yosef

- Status: proposed (P-01); in force until Yosef answers Q-01
- Date: 2026-10-21

## Context
Luach must be usable in any app, including commercial ones, with nothing more than credit. No copyleft code may enter it.

## Decision
Apache-2.0, with a NOTICE file ("Built on Luach by Yosef Skolnick"). Apache-2.0 §4(d) requires redistributors to include the NOTICE text.

## Alternatives considered
- MIT: shorter and better known; only the copyright line must be kept, so credit is weaker. If chosen, swap LICENSE and NOTICE; no code changes.
- A custom "credit required in UI" licence: not OSI-approved, would scare off adopters, and is hard to enforce.

## Consequences
- Third-party data with attribution licences (GeoNames, CC-BY 4.0) is credited in NOTICE.
- No standard licence can force on-screen credit; README asks for it politely in "How to credit".
