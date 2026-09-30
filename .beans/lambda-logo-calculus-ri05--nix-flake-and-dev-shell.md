---
# lambda-logo-calculus-ri05
title: Nix flake and dev shell
status: todo
type: epic
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:01:37Z
parent: lambda-logo-calculus-cste
---

A Nix flake that gives every contributor and every check the same toolchain.

## Scope

- `flake.nix` with a plain `genAttrs` over a `supportedSystems` list. Never
  `flake-utils`.
- Systems: `x86_64-linux`, `aarch64-linux`, `x86_64-darwin`, `aarch64-darwin`.
- Dev shell with Node 24, pnpm, jj and git; Playwright browsers from nixpkgs on
  Linux, with the download skipped.
- `formatter` set, and a `checks` attribute that at minimum builds the dev
  shell. The real gate arrives in the ship-gate epic.
- `flake.lock` committed.

## Todo

- [ ] Write `flake.nix` with `genAttrs` over `supportedSystems`
- [ ] Add the dev shell with Node 24, pnpm, jj, git and Playwright browsers
- [ ] Set `formatter` and a dev shell build check
- [ ] Commit `flake.lock`
- [ ] Prove `nix flake check` is green on this machine
