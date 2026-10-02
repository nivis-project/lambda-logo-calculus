## Why

Epic [lambda-logo-calculus-hfsz](../../../.beans/lambda-logo-calculus-hfsz--nix-flake-and-dev-shell.md),
under milestone 01 Foundations and the ship gate.

The repository has a process but no road. `scripts/ship-change.sh` calls
`nix flake check`, and that check is a placeholder that fails with a message
explaining it is a placeholder. Nothing can be shipped until it is real.

It is deliberately first. A gate written after the code is a gate written to
pass the code that already exists, which is how a project ends up with a check
that proves nothing. Written before there is any code, it is free to say what
the project actually requires, and the first thing anyone writes has to meet it.

The toolchain is undecided too, and the dev shell cannot carry it until it is.
That is a stack choice, so it gets a decision record rather than a default.

## What Changes

- Record the stack choice: strict TypeScript on pnpm, with Vitest as the test
  runner, in ADR 0001, with the alternatives that lost.
- Add a dev shell carrying that toolchain plus `jj` and `git`, resolved from one
  pinned nixpkgs so every machine and the sandbox agree.
- Replace the placeholder gate with one that builds, lints and tests, running
  inside the Nix sandbox with no network.
- Fetch pnpm dependencies through a fixed-output derivation, with its hash in
  the repository, so the sandboxed gate can install offline.
- Add the minimum workspace those three steps need something to act on: a
  `package.json`, a TypeScript configuration, a lint configuration, a Vitest
  configuration, and one package holding a smoke test that proves the harness
  runs end to end.
- Keep the gate's failure messages worth reading. A red gate names what failed
  and what to do, because the whole point is that nobody is tempted to skip it.

Coverage thresholds are deliberately **not** here. They belong to epic
[lambda-logo-calculus-8yw4](../../../.beans/lambda-logo-calculus-8yw4--test-harness-and-the-coverage-gate.md),
which follows this one. This change gives that epic something to attach to.

## Capabilities

### New Capabilities

- `quality-gate`: what the gate runs, that it runs offline and reproducibly,
  that it cannot be bypassed or satisfied vacuously, and what it reports when it
  is red.
- `dev-environment`: the dev shell, the systems it is built for, the toolchain
  it carries, and the rule that one pinned source resolves every version.

### Modified Capabilities

<!-- none: this is the first change, nothing exists to modify -->

## Impact

- New: `nix/gate.nix`, `scripts/gate.sh`, `package.json`, `pnpm-lock.yaml`,
  `pnpm-workspace.yaml`, `tsconfig.json`, `eslint.config.js`,
  `vitest.config.ts`, `packages/core/`, `docs/adr/0000-template.md`,
  `docs/adr/0001-typescript-on-pnpm.md`.
- `flake.nix` already exists as a placeholder whose check always fails. This
  change replaces it.
- A change that touches `package.json` or `pnpm-lock.yaml` has to update the
  dependency hash in the same change, or the sandboxed gate cannot install.
  That obligation starts here and lasts for the life of the project.
- `packages/core` is created here as a shell with a smoke test, not as the
  geometry core. What goes in it is decided by milestones 02 and 03.
- The smoke test earns its place by proving the harness runs, not by testing
  anything interesting. It should be deleted by whoever writes the first real
  test in that package.
