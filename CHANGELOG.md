# Changelog

All notable changes to Trefoil Studio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The base curve is a registered template rather than a formula written out in
  four places. The trefoil ships as the first one, with the prototype's nesting
  mathematics: `perfectFit` over 720 angles and the effective scale the fit
  slider drives.
- The prototype's four hidden clamps are now declared safety limits that report
  a warning naming the limit and both values, instead of a shape that quietly
  stops responding.
- Parameters are declared once as data: a definition carries its kind, range,
  default, lock and randomize behaviour, and resolution, validation and
  randomize are all derived from it. Randomize respects locks and draws from a
  stored seed, so a result is reproducible.
- A typed registry per extension point, which refuses a duplicate id so a typo
  cannot silently shadow a built-in module.
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

- `packages/templates` now depends on `packages/core` rather than the reverse,
  so the core is a leaf and the application does the wiring. ADR 0008 records
  why; ADR 0002 is marked, not rewritten.
- Shipping now closes the linked bean inside the gated step, so one commit holds
  the code, the archived change, the changelog entry and the bean file together.
