# Changelog

All notable changes to Trefoil Studio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Seven architecture decision records covering the stack and structural choices
  the project already runs on, each with the alternatives that lost.
- A gate that cannot be skipped: `nix flake check` builds, lints, runs the test
  suite with coverage thresholds and drives the studio in a real browser, all
  inside the Nix sandbox with no network.
- `scripts/ship-change.sh`, which refuses to archive or commit anything when the
  gate is red, a task is still unchecked, or the bean it was given does not
  exist.
- A pnpm workspace under strict TypeScript, with the geometry core's purity
  enforced twice: a lint rule while you type, and a test that reads the built
  bundle and cannot be switched off by editing a config.
- A Nix flake with a dev shell carrying Node 24, pnpm, jj, git and Playwright
  browsers, so every machine and every check resolve the same toolchain.
- The documents every later epic reads from: agent instructions, the brief, the
  prototype that the parity gate compares against, the testing strategy and the
  decision record template.

### Changed

- Shipping now closes the linked bean inside the gated step, so one commit holds
  the code, the archived change, the changelog entry and the bean file together.
