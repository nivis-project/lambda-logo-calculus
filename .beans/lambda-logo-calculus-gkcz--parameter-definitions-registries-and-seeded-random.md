---
# lambda-logo-calculus-gkcz
title: Parameter definitions, registries and seeded random
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-09-30T22:04:44Z
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

- [ ] Define `ParamDef`, `Registered` and the registry container
- [ ] Implement parameter resolution with defaults and validation
- [ ] Implement the seeded random source
- [ ] Add a lint or test that fails on `Math.random()` inside the core
- [ ] Known-value and property tests for resolution and the seeded source
