## Why

Epic [lambda-logo-calculus-gkcz](../../../.beans/lambda-logo-calculus-gkcz--parameter-definitions-registries-and-seeded-random.md),
under milestone 02 Core geometry and prototype parity.

`packages/core` exports two constants and a function that counts an empty array.
Every epic after this one registers something into it: a shape template, a
skeleton stage, an ending, a join, a palette, a lockup, an exporter. They all
need the same three things first, and inventing them twice would mean rewriting
the first one.

The prototype shows what happens without them. Every slider is written by hand,
the lock state is a separate object keyed by parameter name, and randomize is a
function that knows each parameter's range by heart. Adding a parameter means
editing four places and remembering the fifth.

## What Changes

- Add `ParamDef`: id, label, kind (`number`, `int`, `angle`, `enum`, `bool`,
  `color`), range, step, options, default, `lockable`, `randomize` and `group`,
  plus an `advanced` hint.
- Add parameter resolution: given a set of definitions and a project's stored
  values, produce the concrete parameters a pure function receives, filling
  defaults, clamping to range and rejecting a value of the wrong kind.
- Add `Registered<P>`: id, version, label, params. Add a typed registry that
  modules register into and that is queried by kind.
- Add a seeded random source: a small deterministic generator and the
  `randomize` operation built on it, which skips locked parameters and draws
  each remaining one from its own declared range.
- Add JSON schema validation for parameter values, so a project file that has
  been edited by hand is rejected with a message rather than producing geometry
  from nonsense.

## Capabilities

### New Capabilities

- `parameter-system`: how a tunable value is declared, resolved, validated,
  locked and randomised.
- `module-registry`: how a feature is registered and found.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src`: the parameter types and resolution, the
  registry, the seeded source. All pure, all testable without a DOM.
- No new runtime dependency. The schema validation is written against the
  `ParamDef` set rather than pulling in a general JSON schema library, because
  the definitions already describe every constraint a value can have.
- `packages/core` gains real coverage, so the 80% threshold starts to mean
  something.
- The UI does not exist yet, so nothing consumes the `group`, `advanced` or
  `lockable` hints in this change. They are defined now because the registering
  epics in milestone 02 have to declare them, and inventing them later would
  mean revisiting every registration.
