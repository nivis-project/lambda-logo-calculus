---
# lambda-logo-calculus-8yw4
title: Test harness and the coverage gate
status: completed
type: epic
priority: normal
created_at: 2026-10-02T10:27:51Z
updated_at: 2026-10-02T10:56:15Z
parent: lambda-logo-calculus-vlhc
blocked_by:
    - lambda-logo-calculus-hfsz
openspec-link: openspec/changes/archive/2026-10-02-add-coverage-gate-and-testing-strategy
---

The thresholds the gate enforces, and the kinds of test this project uses.

## Scope

- A test runner wired into the gate.
- Coverage thresholds: 70% overall, 80% on core packages.
- A written testing strategy naming the kinds of test and when each applies.

## Todo

- [ ] Wire the test runner into the gate
- [ ] Set the coverage thresholds and verify a thin suite fails them
- [ ] Write docs/testing-strategy.md
