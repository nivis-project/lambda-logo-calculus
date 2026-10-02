---
# lambda-logo-calculus-vlhc
title: 01 Foundations and the ship gate
status: completed
type: milestone
priority: normal
created_at: 2026-10-02T10:27:02Z
updated_at: 2026-10-02T10:56:26Z
---

The scaffolding every later milestone depends on: a Nix flake with a dev shell, a test harness, and a gate that cannot be skipped.

Nothing is ported until the road is built. The gate is `nix flake check`: build, lint, tests, and the coverage thresholds. A red gate means the code is wrong, not that the gate is wrong.

## Scope

- A flake with a dev shell carrying the toolchain, pinned, so every machine resolves the same thing.
- A test harness with the coverage thresholds wired in: 70% overall, 80% on core.
- `scripts/ship-change.sh` proved end to end on a real change.
- The repository documents a later milestone reads from.
