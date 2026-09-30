---
# lambda-logo-calculus-90rt
title: Repository documents, brief and prototype
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:09:13Z
parent: lambda-logo-calculus-cste
openspec-link: openspec/changes/archive/2026-10-01-add-repository-documents
---

Put the documents a later epic depends on into the repository: the agent
instructions, the authoritative brief, the prototype that acts as the
behavioural spec, the changelog, the testing strategy and the ADR template.

## Scope

- `AGENTS.md` with the architecture rules, the work process and the Beans
  section; `CLAUDE.md` as a symlink to it so the two cannot drift.
- `docs/briefing.md`: the brief, copied verbatim apart from typography
  normalised to straight quotes and plain hyphens.
- `reference/trefoil-type.html`: the prototype, unchanged, as behavioural spec.
- `docs/testing-strategy.md`: the four kinds of test and what each proves.
- `docs/adr/0000-template.md`: the ADR template later epics fill in.
- `CHANGELOG.md` with an `## [Unreleased]` section.
- `README.md` extended with what the project is and how to run it.

## Todo

- [x] Write `AGENTS.md` and symlink `CLAUDE.md` to it
- [x] Copy the brief to `docs/briefing.md` with normalised typography
- [x] Copy the prototype to `reference/trefoil-type.html`
- [x] Write `docs/testing-strategy.md`
- [x] Add `docs/adr/0000-template.md`
- [x] Add `CHANGELOG.md`
- [x] Extend `README.md`

## Summary of Changes

Committed the documents every later epic reads from.

- `AGENTS.md` with the work process, the nine architecture rules, the version
  control rules, the testing summary and the Beans section. `CLAUDE.md` is a
  symlink to it, so the two cannot drift.
- `docs/briefing.md`: the brief, typography normalised to straight quotes and
  plain hyphens, content otherwise unchanged.
- `reference/trefoil-type.html`: the prototype, 46389 bytes, unchanged. Tracked
  because milestone 02 compares the ported core against it.
- `docs/testing-strategy.md`: the four kinds of test, the known values fixed by
  the brief, the coverage thresholds, and the procedure for approving a golden
  snapshot change.
- `docs/adr/0000-template.md`: Status, Context, Decision, Consequences,
  Alternatives considered, plus how a superseded record is marked.
- `CHANGELOG.md` with an `## [Unreleased]` section for `/mip:ship`.
- `README.md` extended from its two-line placeholder.

OpenSpec change archived as `2026-10-01-add-repository-documents`. Specs were
skipped (`skip_specs: true`): documentation only, no behaviour changes.

The gate did not run. `flake.nix` arrives in the Nix flake epic and
`scripts/ship-change.sh` in the test harness and ship gate epic, so this change
was archived and committed by hand following the same order.
