---
# lambda-logo-calculus-ri05
title: Nix flake and dev shell
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:13:38Z
parent: lambda-logo-calculus-cste
openspec-link: openspec/changes/archive/2026-10-01-add-nix-flake-devshell
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

- [x] Write `flake.nix` with `genAttrs` over `supportedSystems`
- [x] Add the dev shell with Node 24, pnpm, jj, git and Playwright browsers
- [x] Set `formatter` and a dev shell build check
- [x] Commit `flake.lock`
- [x] Prove `nix flake check` is green on this machine

## Summary of Changes

`flake.nix` and `flake.lock` committed. The toolchain now resolves identically
on every machine and inside every check.

- Systems built with `nixpkgs.lib.genAttrs` over a `supportedSystems` list:
  `x86_64-linux`, `aarch64-linux`, `x86_64-darwin`, `aarch64-darwin`.
  `flake-utils` is absent and `nixpkgs` is the only input.
- Dev shell: Node 24.21.0, pnpm 12.3.4, jujutsu, git.
- Playwright browsers come from nixpkgs on Linux (chromium 1243, firefox 1543,
  webkit 2359, plus the headless shell and ffmpeg) with the npm download
  switched off. On darwin the package does not exist, so Playwright falls back
  to its own download there. Recorded as a known limitation; no darwin machine
  is in play yet.
- `formatter` is `nixpkgs-fmt`. `nix fmt -- --check flake.nix` reports nothing
  to reformat.
- `checks.devshell-builds` builds the dev shell. `nix flake check` is green.
- `flake.lock` pins `nixos-unstable` at `b4fd65b1` (2026-09-29).

`checks` is deliberately minimal here. Build, lint, tests and the coverage
thresholds are added by the test harness and ship gate epic, which is where the
gate `/mip:ship` documents actually takes shape.

OpenSpec change archived as `2026-10-01-add-nix-flake-devshell`. Specs were
skipped (`skip_specs: true`): build tooling, no behaviour change.
