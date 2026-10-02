## Why

Epic [lambda-logo-calculus-czy6](../../../.beans/lambda-logo-calculus-czy6--repository-documents-and-the-prototype-reference.md),
under milestone 01 Foundations and the ship gate.

Milestone 02 reads `reference/trefoil-type.html` and writes down what it does.
Milestone 03 builds to that description and proves the result matches a
recording of it. Both rest on the prototype being the same file throughout.

Nothing currently guarantees that. A stray edit, a reformat by an editor, a
line-ending change on a checkout: any of them would silently invalidate every
spec written against it and every comparison made with it, and the failure would
surface later as a parity mismatch nobody could explain.

The fix is cheap and belongs here, before anything depends on it.

## What Changes

- Record the prototype's digest and have the gate check it, so a changed
  prototype fails the build rather than quietly moving the ground.
- Say in one place what the prototype is for, what may be done to it, and what
  the procedure is when it genuinely has to change.
- Expand the README from two lines into something that orients someone who has
  just cloned the repository.
- Add an index of the decision records, so the ADRs are findable without
  listing a directory.

## Capabilities

### New Capabilities

- `prototype-reference`: what the frozen prototype is, the guarantee that it
  does not change under the project's feet, and how it is deliberately replaced
  if it ever must be.

### Modified Capabilities

<!-- none -->

## Impact

- New: `reference/DIGEST`, `packages/core/test/prototype.test.ts` or an
  equivalent check the gate runs, `docs/adr/index.md`.
- Changed: `README.md`, `AGENTS.md`.
- The digest check is deliberately in the test suite rather than in a separate
  script, so it runs wherever the suite runs and cannot be forgotten.
- Replacing the prototype becomes a deliberate act with a written procedure.
  That is the point: it should be hard enough that nobody does it by accident
  and easy enough that it is not a reason to avoid an upgrade.
