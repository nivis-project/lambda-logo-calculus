---
# lambda-logo-calculus-cste
title: 01 Project foundations
status: completed
type: milestone
priority: normal
created_at: 2026-09-30T22:00:09Z
updated_at: 2026-09-30T22:45:48Z
---

Everything a later epic assumes is in place: the agent instructions, the brief
and the prototype in the repo, a Nix dev shell, a pnpm workspace under strict
TypeScript, a test harness, the recorded stack decisions, and a ship gate that
cannot be bypassed.

## Gate

`nix flake check` builds the workspace, runs lint (including the core boundary
rule), runs the test suite and enforces coverage of 70% overall and 80% on
`packages/core`. `scripts/ship-change.sh` refuses to archive when the gate is
red.

## Summary of Changes

All five epics completed and shipped, each as one OpenSpec change and one
commit.

- Repository documents, brief and prototype (`2026-10-01-add-repository-documents`)
- Nix flake and dev shell (`2026-10-01-add-nix-flake-devshell`)
- pnpm workspace and strict TypeScript (`2026-10-01-add-pnpm-workspace-typescript`)
- Test harness and ship gate (`2026-10-01-add-test-harness-ship-gate`)
- Architecture decision records 0001 to 0007 (`2026-10-01-add-architecture-decision-records`)

The gate is met. `nix flake check` builds all five packages, runs ESLint with
the core boundary and determinism rules, runs twelve Vitest tests including two
property tests and the built-bundle boundary check, enforces both coverage
thresholds, and drives the studio in Chromium at 1440x900. All of it runs inside
the Nix sandbox with no network, which was the part expected to be hard and was
not.

Two capabilities now have main specs: `core-boundary` (four requirements, nine
scenarios) and `quality-gate` (six requirements, twelve scenarios).

Two things were found by doing rather than by planning, and both are recorded in
the epics that found them. nixpkgs does support offline dependency fetching for
pnpm 12, through the top-level `fetchPnpmDeps` rather than an attribute on the
pnpm package, so a planned downgrade to pnpm 11 was implemented and then
reverted. And shipping the fourth epic exposed that `scripts/ship-change.sh`
committed before a bean could be closed, making `AGENTS.md` describe something
that was not true; the fifth epic fixed it.

Milestone 02 can start. The prototype is in `reference/trefoil-type.html` and
the parity harness is its last epic.
