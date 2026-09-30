## Why

Epic [lambda-logo-calculus-5ved](../../../.beans/lambda-logo-calculus-5ved--architecture-decision-records-0001-to-0007.md),
under milestone 01 Project foundations.

Seven stack and structural choices are already live in the repository and none
of them is recorded. `AGENTS.md` instructs that an ADR is written before every
such choice and points at ADRs 0001 to 0007 as settled; that reference currently
points at nothing.

The reason to write them now rather than at the start is not laziness. Four of
the seven were decided by the user before any code existed, and three were
settled by what the previous epics actually found: which package manager the
sandbox can fetch, which lint settings survive a geometry codebase, which
renderer the first milestone needs. A decision record written before the
evidence would have recorded a guess.

This epic also closes a gap the previous one opened. `AGENTS.md` states that one
commit holds the code, the spec updates, the changelog entry and the bean files
together. `scripts/ship-change.sh` commits before the bean can be closed, so
that is not true today.

## What Changes

- Add `docs/adr/0001` through `docs/adr/0007`, each filling in
  `docs/adr/0000-template.md`, each recording one decision with the
  alternatives that lost and the consequences accepted.
- Extend `scripts/ship-change.sh` with an optional bean id. When given, the
  script marks the bean completed after the gate passes and before it commits,
  so the code, the archived change, the changelog and the bean land in one
  commit.
- Update the `quality-gate` capability: shipping now includes closing the linked
  bean in the same commit, and the script must still refuse when the bean id it
  was given does not exist.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `quality-gate`: the requirement covering what a successful ship does gains the
  bean closure, and a new requirement covers refusing an unknown bean id.

## Impact

- New: seven files under `docs/adr/`.
- Modified: `scripts/ship-change.sh`, `openspec/specs/quality-gate/spec.md` via
  a delta, `AGENTS.md` if the ship invocation changes shape.
- No production code and no dependencies change, so the dependency hash in
  `nix/gate.nix` stays as it is.
- ADR 0006 records a decision whose consequences are not yet proven: polygon
  booleans and curve fitting are not exercised until milestone 06. It is written
  now because the choice is already encoded in the package layout, and it will
  be superseded rather than edited if it turns out wrong.
