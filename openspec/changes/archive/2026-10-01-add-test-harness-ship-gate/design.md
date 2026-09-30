## Context

See proposal.md for motivation and `specs/quality-gate/spec.md` for the
contract.

Two facts constrain everything here.

First, the Nix sandbox has no network. Anything the gate needs must arrive as a
store path, which for a Node project means the whole dependency tree has to be
fetched by a fixed-output derivation with a known hash before the sandbox is
entered.

Second, that fetcher is nixpkgs' `fetchPnpmDeps`, which takes the pnpm package
as an argument. It supports pnpm 12; nixpkgs carries a test for exactly that
(`pkgs/test/pnpm/pnpm_12_v4`). The workspace stays on pnpm 12.

## Goals / Non-Goals

**Goals:**

- The gate runs the same checks whether it is invoked by a developer, by the
  ship script, or on a machine that has never seen this project.
- A failure names what failed clearly enough to act on without rerunning
  anything.
- The ship script is boring: it does the steps in order and stops on the first
  problem.

**Non-Goals:**

- No CI configuration. There is no CI yet, and `nix flake check` is what CI
  would run anyway.
- No test content beyond what proves the harness works. The real tests belong to
  the epics that write the code they test.
- No release process. `CHANGELOG.md` keeps an `[Unreleased]` section and nothing
  promotes it yet.

## Decisions

### One pnpm version, 12, in the dev shell and in the sandbox

This change started from a wrong reading. `pkgs.pnpm_12` has no `fetchDeps`
attribute while `pkgs.pnpm_11` does, which looked like pnpm 12 being
unsupported, and a downgrade to pnpm 11 was implemented before the top-level
`pkgs.fetchPnpmDeps` was found. That function takes the pnpm package as an
argument and works with 12; nixpkgs tests it directly. The downgrade was
reverted.

The reasoning that would have justified a downgrade still stands and is worth
keeping, because it decides what happens when a future pnpm really is
unsupported: one pnpm version, in the dev shell and in the sandbox both. Two
versions sharing one `pnpm-lock.yaml` means a lockfile written by one major and
read by another, which either fails or is silently rewritten by the version
nobody is watching. A downgrade of the whole project is the lesser evil.

Alternative considered: vendor `node_modules` into the repository. Rejected.
It is large, it is platform-specific, and it moves the reproducibility problem
rather than solving it.

Alternative considered: run the gate outside the sandbox with network access, as
an impure check. Rejected. A gate whose result depends on what npm served that
minute is not a gate, and `nix flake check` refuses impure derivations by
default for exactly this reason.

### The dependency hash lives in the flake, and changing a dependency changes it

`fetchPnpmDeps` needs a `hash` for the fetched dependency store. Adding or
upgrading a dependency changes that hash, so the same change that touches
`package.json` must also update `flake.nix`.

This is friction, and it is the point. A dependency that appears without the
hash being updated fails the gate immediately rather than working on one machine
and not another.

### The end-to-end suite runs in the sandbox

Playwright browsers come from `playwright-driver.browsers` in nixpkgs, which is
a store path, so the suite can run offline. It needs the studio built first and
served, which the derivation does with Playwright's own `webServer` against the
production build.

This was expected to be the risky part: a headless browser in a Nix sandbox is a
well-known source of obscure failures (no `/dev/shm`, no fonts, no user
namespace). It worked on the first attempt with the browsers from nixpkgs and
`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS` set. One thing did need fixing:
Vite's preview server binds to `localhost`, which on this machine resolves to
`::1` only, so Playwright's `webServer` poll against `127.0.0.1` timed out. Both
the preview and dev servers now bind `127.0.0.1` explicitly.

### Coverage thresholds are two, not one

Vitest applies per-glob thresholds. The workspace gets 70%, `packages/core` gets
80%. The core is pure functions over numbers: an uncovered branch there is an
untested case, not an untestable one.

The thresholds are set now, while there is almost no code, rather than after
milestone 02. Raising a threshold onto existing code means a retrofit; starting
above it means never being below it.

### The boundary check becomes part of the test run

`scripts/check-core-boundary.mjs` was a standalone script wired to `pnpm test`.
It becomes a Vitest test that invokes the same logic, so that one command runs
every check and one report covers them. The script stays callable on its own for
a fast manual check.

## Risks / Trade-offs

- **The gate becomes slow enough that people stop running it locally.** Every
  ship runs it, so a slow gate is felt every time. Mitigation: the dev shell
  keeps fast paths (`pnpm test`, `pnpm lint`) for the inner loop; the sandbox
  gate is what runs before archiving, once.

- **A dependency hash that someone updates by pasting the value from a failed
  build defeats its own purpose if they do not look at what changed.**
  Unavoidable with fixed-output derivations. Mitigation: the hash lives next to
  a comment saying it must move in the same change as `package.json`.

- **Coverage thresholds on near-empty packages are trivially met, so they prove
  nothing today.** True. They are placed now for milestone 02, not for today.

## Migration Plan

`pnpm-lock.yaml` is regenerated in this change. Anyone with an existing
`node_modules` removes it and reinstalls; the dev shell carries the right pnpm,
so `nix develop -c pnpm install` is the whole procedure.

Rollback is `jj` reverting this change. Nothing here writes outside the
repository.
