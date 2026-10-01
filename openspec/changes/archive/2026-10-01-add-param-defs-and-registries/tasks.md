## 1. Parameter definitions

- [x] 1.1 Define the `ParamDef` type and its six kinds in `packages/core`.
  Verify a definition of each kind type-checks and that an invalid combination
  does not.
- [x] 1.2 Write `validateParamDef`, rejecting a numeric definition with no
  range, a default outside its range, and an enum with no options or a default
  not among them. Verify each rejection names the parameter id, with a test per
  case.
- [x] 1.3 Verify a valid definition of every kind is accepted.

## 2. Resolution

- [x] 2.1 Write `resolveParams(defs, stored)`, filling defaults for missing
  values. Verify a missing value resolves to its default.
- [x] 2.2 Clamp an out-of-range value and report the clamp with both values.
  Verify the result holds the bound and the report names the parameter.
- [x] 2.3 Reject a value of the wrong kind, a fraction for an `int`, and an id
  matching no definition. Verify each failure names the parameter and what was
  wrong, with a test per case.
- [x] 2.4 Property test: for random definitions and random in-range values,
  resolution returns those values unchanged and reports no clamp.

## 3. Seeded random

- [x] 3.1 Write a seeded generator. Verify two generators with the same seed
  produce identical sequences and two with different seeds do not.
- [x] 3.2 Property test: across many draws from many seeds, every value is at
  least 0 and below 1.
- [x] 3.3 Verify `packages/core` still passes the boundary check, so no
  `Math.random()` reached it.

## 4. Randomize

- [x] 4.1 Write `randomizeParams(defs, values, locked, seed)`. Verify a locked
  parameter keeps its exact value and that locking everything returns the input
  unchanged.
- [x] 4.2 Draw from the declared `randomize` range when present and from the
  full range otherwise, and skip a parameter whose `randomize` is `false`.
  Verify each with a test.
- [x] 4.3 Verify an enum parameter is randomized to one of its options, and that
  the same seed gives the same result twice.
- [x] 4.4 Property test: for random definitions, locks and seeds, every
  resulting value is valid against its own definition.

## 5. Registries

- [x] 5.1 Define `Registered<P>` and a typed registry with register, get and
  list. Verify a registered module is retrievable by id.
- [x] 5.2 Reject a module missing an id, a version or a label, and one carrying
  an invalid parameter definition. Verify each rejection names what is wrong.
- [x] 5.3 Reject a duplicate id within one registry, and verify the same id in
  two different registries is accepted.
- [x] 5.4 Verify an unknown id reports a miss naming the id and the registry.
- [x] 5.5 Property test: registering the same set in different orders gives the
  same lookups and the same listing.

## 6. Verification

- [x] 6.1 Verify `packages/core` coverage is at or above 80% and the workspace
  at or above 70%.
- [x] 6.2 Verify `nix flake check` is green with the dependency hash unchanged,
  since this change adds no dependency.
