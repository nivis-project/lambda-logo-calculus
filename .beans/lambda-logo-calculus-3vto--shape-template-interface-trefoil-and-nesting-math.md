---
# lambda-logo-calculus-3vto
title: Shape template interface, trefoil and nesting math
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-09-30T22:03:00Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-gkcz
---

The `ShapeTemplate` interface and the trefoil as its first registration, with
the nesting mathematics ported from the prototype.

## Scope

- `ShapeTemplate` with `kind`, `radius`, `point`, `symmetry` and `safety`.
- Trefoil: `r(theta) = A + cos(3 theta)`, parameter A from 1 to 20.
- `perfectFit` as the numeric minimum over theta of `r(theta) / r(theta - phi)`,
  720 samples as in the prototype.
- `effectiveScale`: `s_i = perfectFit^(i (1 - 5 f))`.
- Memoisation keyed by template, parameters and rotation.
- Safety as per-template metadata, not hard-coded clamps: A at least 1.15,
  `perfectFit` at least 0.02, copy scale at most 1.6.

## Todo

- [ ] Define the `ShapeTemplate` interface
- [ ] Register the trefoil template
- [ ] Implement `perfectFit` and `effectiveScale`
- [ ] Move the prototype's clamps into template safety metadata with warnings
- [ ] Memoise by template, parameters and rotation
- [ ] Known values: `perfectFit` is 1 at rotation 0 and at 120 degrees
- [ ] Known value: `effectiveScale` equals `perfectFit` at fit size 0
