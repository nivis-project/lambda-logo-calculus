---
# lambda-logo-calculus-cste
title: 01 Project foundations
status: todo
type: milestone
created_at: 2026-09-30T22:00:09Z
updated_at: 2026-09-30T22:00:09Z
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
