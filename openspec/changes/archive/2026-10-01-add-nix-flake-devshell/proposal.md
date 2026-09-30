## Why

Epic [lambda-logo-calculus-ri05](../../../.beans/lambda-logo-calculus-ri05--nix-flake-and-dev-shell.md),
under milestone 01 Project foundations.

Nothing can be built or tested yet, because there is no toolchain. `pnpm` is not
on the path on this machine and Node is whatever the system happens to carry.
Every later epic runs `nix develop -c pnpm ...`, and the ship gate runs
`nix flake check`, so the flake has to exist before any of them can start.

The flake is also what makes the gate honest. A gate that runs against a
developer's ambient toolchain proves nothing about anyone else's.

## What Changes

- Add `flake.nix` describing the project's toolchain and its checks.
- Supported systems as a plain list with `nixpkgs.lib.genAttrs` over it.
  `flake-utils` is not used and must not be added, per `AGENTS.md`.
- A dev shell carrying Node 24, pnpm, jj and git, plus Playwright browsers from
  nixpkgs on Linux with the npm browser download switched off.
- `formatter` set to `nixpkgs-fmt`, so `nix fmt` works.
- A `checks` attribute that builds the dev shell, proving the toolchain resolves
  on every supported system. The build, lint, test and coverage checks arrive in
  the test harness and ship gate epic; this epic puts the attribute in place and
  leaves it minimal.
- Add `flake.lock`, committed, so every machine resolves the same nixpkgs.

## Capabilities

### New Capabilities

None. This change adds build tooling. No behaviour of the studio changes, so
`.openspec.yaml` sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New files: `flake.nix`, `flake.lock`.
- Nothing imports either. They are consumed by the `nix` CLI.
- Supported systems: `x86_64-linux`, `aarch64-linux`, `x86_64-darwin`,
  `aarch64-darwin`. The Playwright browser package is Linux only, so the darwin
  shells omit it and Playwright falls back to its own download there. That is
  recorded as a known limitation rather than worked around, because no darwin
  machine is in play yet.
- `nix` must run with flakes enabled. The repository assumes it, since
  `nix flake check` is the ship gate.
- `flake.lock` pins `nixos-unstable`. Updating it is a deliberate act with its
  own change, never a side effect.
