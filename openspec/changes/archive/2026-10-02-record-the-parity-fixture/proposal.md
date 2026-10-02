## Why

Epic [lambda-logo-calculus-iri6](../../../.beans/lambda-logo-calculus-iri6--record-the-prototype-as-a-parity-fixture.md),
under milestone 02 The prototype described.

The specs say what the prototype does. They cannot say whether the port agrees
with it, because a spec and an implementation can both be wrong in the same way:
the spec was written by reading the prototype, and the port will be written by
reading the spec.

What closes that loop is the prototype's own output. Drive it, record what it
renders, and compare the port against the recording rather than against anyone's
reading of it.

The recording has to be made now, while the prototype is the only thing that
exists. Made later, after the port, it would be made by someone who knows what
the port produces, and the temptation to record the settings where they already
agree is not one worth leaving lying around.

## What Changes

- Add a recorder that loads the prototype in a real browser, drives its own
  controls, and writes what it renders to a committed fixture.
- Read back the value each control actually took, rather than the value it was
  asked for, so a snapped slider is never compared against an unsnapped
  expectation.
- Fix the container width in the recording, because the prototype's geometry
  depends on it.
- Record a matrix wide enough that it cannot shrink to one easy case, and assert
  that it stays wide.
- Derive the comparison tolerance from the prototype's own rounding and write
  the derivation down with the number.

## Capabilities

### New Capabilities

- `parity`: what is recorded, how it is recorded, what the tolerance is and
  where it comes from, and what keeps the recording honest.

### Modified Capabilities

<!-- none -->

## Impact

- New: `scripts/record-parity.mjs`, `test/parity/prototype-output.json`,
  `packages/core/test/parity-fixture.test.ts`.
- Changed: `package.json` (Playwright, and a `parity:record` script),
  `pnpm-lock.yaml`, `nix/gate.nix` (the dependency hash), `flake.nix` (the
  browser for the dev shell), `AGENTS.md`.
- The fixture is committed rather than regenerated on demand. The prototype is
  frozen and digest-checked, so a recording of it is as current as a fresh run,
  and the gate must not need a browser.
- Nothing compares anything yet. The comparison is milestone 03's, and it will
  be written against this file.
