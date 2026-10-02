## Why

Epic [lambda-logo-calculus-4x3k](../../../.beans/lambda-logo-calculus-4x3k--parameters-registries-and-the-seeded-random-source.md),
under milestone 03 The faithful port.

The port starts here because everything else in it is shaped by these three
things.

The prototype keeps its state in one object and reads it from wherever it likes.
That is why milestone 02 found three sliders driving values nobody named: there
was no place where a parameter was declared, so there was no place where a
coupling had to be written down. Declaring a parameter as data makes the
coupling impossible to add silently.

The prototype also has no extension points. A new palette is a case in a switch,
a new ending is a branch. Making each a registration is what the rest of the
port is built on.

And its randomize draws from an unseeded source, so a result cannot be
reproduced or returned to. Milestone 02 recorded that as a defect. The port
chooses differently.

## What Changes

- Declare a parameter as data: an id, a kind, a range, a default, and whether it
  can be locked and randomized.
- Resolve values against those definitions, reporting what was out of range and
  what it was brought to, rather than clamping silently.
- Add a typed registry per extension point, which refuses a duplicate id so a
  typo cannot shadow a built-in module.
- Add a seeded random source, so randomize is reproducible and a result can be
  returned to.

## Capabilities

### New Capabilities

- `module-registry`: what a registered module carries and what the registry
  refuses.

### Modified Capabilities

- `parameters`: a parameter is data rather than markup, resolution reports what
  it clamped, and randomize draws from a stored seed. The last of these is the
  port deliberately departing from the prototype.

## Impact

- New: `packages/core/src/params/`, `packages/core/src/registry/`,
  `packages/core/src/random/`.
- The prototype's own randomize behaviour stays on the record as a description
  of the prototype. This change adds what the port does instead; it does not
  claim the prototype did it.
