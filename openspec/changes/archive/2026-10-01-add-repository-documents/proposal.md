## Why

Epic [lambda-logo-calculus-90rt](../../../.beans/lambda-logo-calculus-90rt--repository-documents-brief-and-prototype.md),
under milestone 01 Project foundations.

Every later epic reads from documents that are not in the repository yet. The
brief lives in a download folder, the prototype that the parity gate compares
against is not tracked at all, and there is no file telling an agent which
architecture rules are non-negotiable or how a piece of work travels from bean
to commit. Until those are committed, every epic after this one starts from
memory rather than from the repository.

## What Changes

- Add `AGENTS.md`: the project overview, the bean and OpenSpec work process, the
  commands, the version-control rules, the architecture rules that reject a
  change when broken, the testing summary and the code style. Add `CLAUDE.md` as
  a symlink to it so the two cannot drift.
- Add `docs/briefing.md`: the authoritative brief, copied verbatim apart from
  typography normalised to straight quotes and plain hyphens, as the repo rules
  require.
- Add `reference/trefoil-type.html`: the prototype, unchanged. Milestone 02
  compares its output against the ported core, so it is a tracked input, not a
  convenience copy.
- Add `docs/testing-strategy.md`: the four kinds of test, what each one proves,
  and the procedure for approving a golden snapshot change.
- Add `docs/adr/0000-template.md`: the template every later ADR fills in.
- Add `CHANGELOG.md` with an `## [Unreleased]` section, which `/mip:ship` writes
  a user-facing bullet into on every ship.
- Extend `README.md` from its two-line placeholder to what the project is, what
  it produces, and how to run it.

## Capabilities

### New Capabilities

None. This change adds documentation and a tracked reference input. No system
behaviour changes, so `.openspec.yaml` sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New files: `AGENTS.md`, `CLAUDE.md` (symlink), `CHANGELOG.md`,
  `docs/briefing.md`, `docs/testing-strategy.md`, `docs/adr/0000-template.md`,
  `reference/trefoil-type.html`.
- Modified: `README.md`.
- No code, no dependencies, no build.
- `reference/trefoil-type.html` is roughly 46 KB of HTML and is committed as-is.
  It is never imported by the build; only the milestone 02 parity harness reads
  it.
- The `CLAUDE.md` symlink means an editor that resolves symlinks writes through
  to `AGENTS.md`. That is the point.
