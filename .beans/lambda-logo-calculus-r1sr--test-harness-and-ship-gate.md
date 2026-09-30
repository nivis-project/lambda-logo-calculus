---
# lambda-logo-calculus-r1sr
title: Test harness and ship gate
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:39:13Z
parent: lambda-logo-calculus-cste
openspec-link: openspec/changes/archive/2026-10-01-add-test-harness-ship-gate
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

- [x] Configure Vitest with coverage thresholds
- [x] Configure Playwright and a smoke end-to-end test
- [x] Make `nix flake check` run build, lint, tests and coverage
- [x] Write `scripts/ship-change.sh` and make it executable
- [x] Prove a red gate aborts before archiving

## Summary of Changes

`nix flake check` is now the whole gate, and it runs in the Nix sandbox with no
network. This was the first change shipped by `scripts/ship-change.sh` rather
than by hand.

- Vitest 5 with the v8 coverage provider and fast-check. Twelve tests across
  the four packages, including two property tests.
- Coverage thresholds: 70% for the workspace, 80% for `packages/core`. Proven
  to fail: an uncovered function in the core drove it to 25% and the run exited
  non-zero naming both thresholds, the measured value and the glob.
- The built-bundle boundary check became a Vitest test sharing its logic with
  `scripts/check-core-boundary.mjs`, which stays callable on its own. Proven to
  catch a `window` reference the lint rule had been told to ignore.
- Playwright drives Chromium from nixpkgs at 1440x900 against the production
  build. The smoke test asserts the title and the text the core produced.
- `nix/gate.nix` fetches the dependency tree with `fetchPnpmDeps` and a pinned
  hash, then runs build, lint, `test:cov` and the end-to-end suite. The whole
  thing, browser included, works inside the sandbox.
- `scripts/ship-change.sh` verified on all four of its refusals and its success
  path: unknown change name, unchecked tasks, red gate (the change stayed
  active, nothing committed), and a green run that archived, committed as Pim
  Snel with no attribution trailer, and pushed.

One correction worth recording. The plan opened by pinning the project down to
pnpm 11, because `pkgs.pnpm_12` has no `fetchDeps` attribute while
`pkgs.pnpm_11` does. That was the wrong signal: the fetcher is the top-level
`pkgs.fetchPnpmDeps`, which takes pnpm as an argument and supports 12, and
nixpkgs tests exactly that. The downgrade was implemented, then reverted, and
the proposal, design and tasks were rewritten to say what actually happened
rather than what was planned.

One real fix along the way: Vite's preview server binds `localhost`, which
resolves to `::1` only on this machine, so Playwright's `webServer` poll against
`127.0.0.1` timed out. Both servers now bind `127.0.0.1` explicitly.

Capability `quality-gate` is now a main spec at
`openspec/specs/quality-gate/spec.md`, with five requirements and ten scenarios.

OpenSpec change archived as `2026-10-01-add-test-harness-ship-gate`.
