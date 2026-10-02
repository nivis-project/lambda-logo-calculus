## Why

Epic [lambda-logo-calculus-j1l7](../../../.beans/lambda-logo-calculus-j1l7--controls-generated-from-the-parameter-definitions.md),
under milestone 04 The studio.

The studio draws, and nothing can be changed but the text. Every other value
sits at its default, which makes a generative tool that generates one thing.

The parameters are already declared as data: id, kind, range, default, whether
they can be locked and randomized. A control is a reading of that declaration.
Writing them by hand would mean a second place where a parameter has to be
listed, and a parameter that exists in one place and not the other is exactly
how the prototype ended up with couplings nobody wrote down.

## What Changes

- Generate a control from each parameter declaration, one per kind.
- Show the value, and let it be reset to its default.
- Add the lock, and randomize from the stored seed, so a result can be returned
  to.
- Add the stage switches and the mark's own controls.
- Group the controls, and keep the advanced ones out of the way until asked for.

## Capabilities

### Modified Capabilities

- `studio-shell`: the controls come from the parameter declarations, and a
  parameter added to a module gets one without a line of interface code.

### New Capabilities

<!-- none -->

## Impact

- New: `apps/studio/src/controls.ts`.
- The studio will hold a list of which parameters it shows and in what order,
  because the order is a design decision and a declaration is not the place for
  it. What it will not hold is the range, the default, the step or the kind.
- Randomize needs a seed that changes between presses but is recorded, so the
  project carries the seed and each press advances it.
