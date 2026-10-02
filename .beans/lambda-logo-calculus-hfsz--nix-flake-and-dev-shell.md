---
# lambda-logo-calculus-hfsz
title: Nix flake and dev shell
status: completed
type: epic
priority: normal
created_at: 2026-10-02T10:27:51Z
updated_at: 2026-10-02T10:48:57Z
parent: lambda-logo-calculus-vlhc
openspec-link: openspec/changes/archive/2026-10-02-add-nix-flake-and-gate
---

A flake with a dev shell carrying the toolchain, so every machine and every check resolve the same versions.

## Scope

- Plain nix with `genAttrs` over the supported systems. No flake-utils.
- A dev shell with the language toolchain, the test runner, jj and git.
- `nix flake check` wired to a gate derivation, running in the sandbox with no network.

## Todo

- [ ] Write the flake with a dev shell
- [ ] Add the gate derivation that `nix flake check` runs
- [ ] Verify the gate runs offline in the sandbox
