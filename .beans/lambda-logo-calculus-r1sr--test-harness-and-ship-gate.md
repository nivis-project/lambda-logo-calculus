---
# lambda-logo-calculus-r1sr
title: Test harness and ship gate
status: in-progress
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:22:44Z
parent: lambda-logo-calculus-cste
blocked_by:
    - lambda-logo-calculus-oedm
---

The test harness and the gate that `/mip:ship` runs. After this epic no change
reaches `main` without a green build, lint, test run and coverage check.

## Scope

- Vitest for unit and property tests, with fast-check available.
- Playwright for end-to-end tests against the built studio.
- Coverage thresholds: 70% overall, 80% on `packages/core`.
- `nix flake check` extended to run build, lint, tests and the coverage
  thresholds inside the sandbox, with dependencies fetched reproducibly.
- `scripts/ship-change.sh`, executable, jj variant: refuse on unchecked tasks,
  stage, gate, archive, commit as Pim Snel, push `main`.

## Todo

- [ ] Configure Vitest with coverage thresholds
- [ ] Configure Playwright and a smoke end-to-end test
- [ ] Make `nix flake check` run build, lint, tests and coverage
- [ ] Write `scripts/ship-change.sh` and make it executable
- [ ] Prove a red gate aborts before archiving
