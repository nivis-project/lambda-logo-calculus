# Changelog

All notable changes to lambda-logo-calculus are recorded here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries describe what changed for someone using the thing, not what was edited.

## [Unreleased]

### Added

- A gate that is real rather than a placeholder. One command builds, lints and
  tests the project inside a Nix sandbox with no network, and refuses to pass
  when there is nothing to check: a suite that finds no tests fails, because a
  gate that passes an empty project reports a verdict it did not reach. When it
  is red it names which of the three steps failed and what to run to see it.
- A dev shell carrying the same toolchain the gate uses, from one pinned
  nixpkgs, built for Linux and macOS on x86 and ARM from a single definition.
- The stack is decided and written down: strict TypeScript on pnpm, tested with
  Vitest, with the five alternatives that lost and the reason each lost.
- The repository is set up for spec-driven work: OpenSpec for changes, beans for
  milestones and epics, a gate that cannot be skipped, and a ship script that
  refuses to archive anything while the gate is red.

### Changed

### Fixed
