## 1. Confirm pnpm 12 can be fetched offline

- [x] 1.1 Establish whether nixpkgs can fetch this workspace's dependencies for
  pnpm 12. Verify by reading the nixpkgs pnpm test suite and by building a
  fetch derivation. Pin to pnpm 11 only if pnpm 12 turns out unsupported, and
  record which way it went in design.md.
- [x] 1.2 Keep `packageManager` in the root `package.json` in step with the dev
  shell's pnpm. Verify `nix develop -c pnpm --version` matches it.
- [x] 1.3 Regenerate `pnpm-lock.yaml` from a clean `node_modules` with the
  chosen pnpm. Verify `pnpm install --frozen-lockfile` then succeeds and
  `pnpm build` is still green.

## 2. Vitest, property tests and coverage

- [x] 2.1 Add `vitest`, `@vitest/coverage-v8` and `fast-check` as root dev
  dependencies, and a `vitest.config.ts` covering the whole workspace. Verify
  `pnpm test` runs Vitest and reports zero failures.
- [x] 2.2 Set coverage thresholds: 70% statements and branches for the
  workspace, 80% for `packages/core`. Verify `pnpm test:cov` reports both and
  exits zero.
- [x] 2.3 Verify the thresholds actually fail: temporarily add an uncovered
  branch to `packages/core` large enough to drop it below 80%, confirm
  `pnpm test:cov` exits non-zero naming the threshold and the measured value,
  then remove it.
- [x] 2.4 Add a first unit test per package asserting its exported value, and a
  first fast-check property test, so the harness is exercised by real tests.
  Verify all pass and coverage is above both thresholds.
- [x] 2.5 Move the core boundary check into a Vitest test that reuses
  `scripts/check-core-boundary.mjs`, keeping the script callable on its own.
  Verify the test fails when a forbidden global is introduced into the built
  core, and passes on the clean tree.

## 3. Playwright

- [x] 3.1 Add `@playwright/test` and `playwright.config.ts` pointing at the
  built studio through Playwright's `webServer`, using the browsers from the dev
  shell rather than a download. Verify `pnpm e2e` launches and reports results.
- [x] 3.2 Write `e2e/smoke.spec.ts`: load the studio and assert the page title
  and the text the entry module renders. Verify it passes, and that changing the
  expected text makes it fail.

## 4. The gate

- [x] 4.1 Add a `nix/` derivation that fetches the workspace dependencies with
  `fetchPnpmDeps` and a pinned hash. Verify the fetch derivation builds and
  that a deliberately wrong hash fails with the expected value.
- [x] 4.2 Add the gate check that runs build, lint, unit and property tests with
  coverage, and the boundary check, inside the sandbox with no network. Verify
  `nix flake check` runs them and passes.
- [x] 4.3 Add the end-to-end suite to the gate. Verify it runs in the sandbox.
  If it cannot, record why in design.md and add it as a check that runs outside
  the sandbox instead, so it stays part of the gate either way.
- [x] 4.4 Verify a red gate: break a test, confirm `nix flake check` exits
  non-zero and names the failing test, then repair it.

## 5. The ship script

- [x] 5.1 Write `scripts/ship-change.sh`, executable, doing in order: reject an
  unknown change name, reject unchecked tasks, stage the tree, run the gate,
  archive the change, commit with `jj` and push `main`. Verify
  `bash scripts/ship-change.sh no-such-change` exits non-zero and changes
  nothing.
- [x] 5.2 Verify it refuses a change with an unchecked task, before staging,
  gating, archiving or committing. Confirm afterwards that the change is still
  active and nothing was committed.
- [x] 5.3 Verify a red gate aborts the ship before archiving: break a test, run
  the script against a change whose tasks are all checked, and confirm it exits
  non-zero, the change is still under `openspec/changes/`, and no commit was
  created.
- [x] 5.4 Verify the commit it creates is authored by Pim Snel
  <post@pimsnel.com> and carries no attribution trailer.

## 6. Documentation

- [x] 6.1 Update `AGENTS.md` and `README.md` with the real commands and the
  gate they run. Verify the command lists in both files still match each other.
- [x] 6.2 Verify the whole gate is green and every task above is checked.
