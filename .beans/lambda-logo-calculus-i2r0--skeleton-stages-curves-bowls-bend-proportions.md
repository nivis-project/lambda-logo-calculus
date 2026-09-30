---
# lambda-logo-calculus-i2r0
title: 'Skeleton stages: curves, bowls, bend, proportions'
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-09-30T22:03:17Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-7p8s
---

The ordered, reorderable list of pure functions that reshape a skeleton before
it is stroked. Ports the prototype's curves, bowls, bend and proportions, each
receiving an explicit `StageContext` instead of reading globals.

## Scope

- `SkeletonStage` with a pure `apply(skeleton, context)`.
- `StageContext` carrying the resolved template, the nesting result, grid
  metrics and current modulation values.
- Curves: arc warping normalised so arcs still meet their stems.
- Bowls, including the bowl radius safety value of at least 0.35.
- Bend, default 0.22.
- Proportions, including the optical factor of 1.06.
- Named parameters for every magic number, defaults matching the prototype,
  grouped under an Advanced flag.

## Todo

- [ ] Define `SkeletonStage` and `StageContext`
- [ ] Port the Curves stage with normalised arc warping
- [ ] Port the Bowls stage
- [ ] Port the Bend stage
- [ ] Port the Proportions stage
- [ ] Name every magic number as a parameter with the prototype's default
- [ ] Property tests: baseline endpoints survive every stage, bowl counters stay open
