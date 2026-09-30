## Why

Epic [lambda-logo-calculus-r1sr](../../../.beans/lambda-logo-calculus-r1sr--test-harness-and-ship-gate.md),
under milestone 01 Project foundations.

Three changes have shipped and none of them was gated. `nix flake check` builds
a dev shell and nothing more, `pnpm test` runs one boundary script, and
`scripts/ship-change.sh` does not exist, so every ship so far was archived and
committed by hand.

Milestone 02 starts writing geometry. That is the code where a wrong number is
invisible until it reaches an exported path, and it is the code the brief says
must be tested like a mathematics library. The harness has to be in place before
the first known-value test is written, not after.

This is also the last epic in which the gate can be added cheaply. Once there
are hundreds of tests, turning on a coverage threshold means a long tail of
retrofitting.

## What Changes

- Keep pnpm 12, once it is established that nixpkgs can fetch this workspace's
  dependencies offline for it. The first reading of nixpkgs suggested otherwise
  and a downgrade to pnpm 11 was planned; it turned out to be unnecessary. See
  design.md.
- Add Vitest with the v8 coverage provider, and fast-check for property tests.
- Add coverage thresholds: 70% for the workspace, 80% for `packages/core`.
- Add Playwright, configured against the built studio, with a smoke test that
  loads the page and asserts what it renders.
- Extend `nix flake check` so it builds the workspace, runs lint, runs the unit
  and property tests with the coverage thresholds, runs the core boundary check
  against the built bundle, and runs the end-to-end suite, all inside the
  sandbox with no network.
- Add `scripts/ship-change.sh`, executable: refuse on unchecked tasks, stage the
  tree, run the gate, archive the change, commit as Pim Snel and push `main`. It
  aborts before archiving when the gate is red.

## Capabilities

### New Capabilities

- `quality-gate`: what must be true before a change can be archived and
  committed, and what the gate does when it is not.

### Modified Capabilities

None. `core-boundary` keeps its requirements; this change only moves its
verification inside the gate.

## Impact

- Modified: `flake.nix` (real checks), `package.json` (scripts and dev
  dependencies), `pnpm-lock.yaml` (regenerated).
- New: `vitest.config.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`, a first
  unit test per package, `scripts/ship-change.sh`, `nix/` helpers if the check
  derivation needs them.
- New dev dependencies: vitest, `@vitest/coverage-v8`, fast-check,
  `@playwright/test`.
- The gate needs a pnpm dependency hash in `flake.nix`. Changing a dependency
  therefore means updating that hash in the same change. This is deliberate
  friction: it is what makes the sandboxed build reproducible.
- Coverage thresholds start enforcing immediately. The packages currently hold
  one exported value each, so the first tests are small; the thresholds are set
  now so milestone 02 cannot start below them.
- The gate builds the whole workspace from a clean store on the first run, which
  takes minutes. Afterwards Nix caches it, and only a changed input rebuilds.
