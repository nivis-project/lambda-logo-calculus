---
# lambda-logo-calculus-gkcz
title: Parameter definitions, registries and seeded random
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-10-01T05:13:10Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-r1sr
---

The typed vocabulary everything else registers into: `ParamDef`, `Registered`,
the registry container, and the parameter resolution that turns definitions plus
project values into the concrete parameters a pure function receives.

## Scope

- `ParamDef` with id, label, kind (number, int, angle, enum, bool, color), range,
  step, options, default, `lockable`, `randomize` and `group`.
- `Registered<P>` with id, version, label and params.
- A registry that modules register into at start-up, discoverable by kind.
- Parameter resolution and validation against a JSON schema.
- A seeded random source. `Math.random()` is forbidden in `packages/core`.

## Todo

- [x] Define `ParamDef`, `Registered` and the registry container
- [x] Implement parameter resolution with defaults and validation
- [x] Implement the seeded random source
- [x] Add a lint or test that fails on `Math.random()` inside the core
- [x] Known-value and property tests for resolution and the seeded source

## Summary of Changes

The vocabulary every later registration speaks is in place. 70 tests, core
coverage at 100% statements and 98% branches.

- `ParamDef` with six kinds (`number`, `int`, `angle`, `enum`, `bool`, `color`),
  range, step, options, default, `lockable`, `randomize`, `group` and
  `advanced`. `validateParamDef` rejects a numeric definition with no finite
  range, a min above its max, a default outside the range, a fractional default
  for an `int`, a non-positive step, a randomize range that escapes the declared
  range, an enum with no options or a default not among them, an empty id or
  label, and a colour default that is not a colour. Every message names the
  parameter id.
- `resolveParams` fills defaults, clamps out-of-range values and reports the
  clamp with both numbers, and refuses to coerce: a string for a number, a
  fraction for an `int`, a number for a boolean, an unknown enum option, and a
  stored id matching no definition are all rejected by name.
- `createSeededRandom` is an xorshift32 over a FNV-1a mix of the seed, with
  `next`, `nextInRange`, `nextInt` and `pick`. Same seed, same sequence; it does
  not collapse when seeded with zero or an empty string.
- `randomizeParams` skips locked parameters and anything with `randomize: false`,
  draws from a declared randomize range when present and the full range
  otherwise, keeps an `int` integral and an `enum` inside its options, and is
  reproducible for a seed.
- `createRegistry` is one registry per kind. It rejects a module with no id, no
  integer version, no label, an invalid parameter definition (naming both the
  module and the parameter), or a duplicate id. The same id in two registries is
  fine. A miss names the id and the registry. A property test confirms lookups
  and listings do not depend on registration order.

Six property tests, covering resolution leaving in-range values alone, the
generator's bounds for `next`, `nextInRange` and `nextInt`, randomize producing
values valid against their own definitions for any locks and seed, randomize
never moving a locked parameter, and registry order independence.

No new dependency, so the gate's dependency hash is unchanged. The boundary
check confirms no `Math.random()` reached the core.

Two capabilities now have main specs: `parameter-system` (four requirements,
nineteen scenarios) and `module-registry` (three requirements, eight scenarios).

OpenSpec change archived as `2026-10-01-add-param-defs-and-registries`.
