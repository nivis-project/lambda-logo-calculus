---
# lambda-logo-calculus-koee
title: Parametric nesting and curve validation
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T07:00:48Z
parent: lambda-logo-calculus-eihe
blocked_by:
    - lambda-logo-calculus-lq1t
---

Nesting must work for templates that are not star-shaped polar curves. For
parametric templates, find the largest scale at which the rotated copy still
sits inside its parent by binary search with a point-in-polygon test.

## Scope

- Parametric nesting by binary search plus point-in-polygon.
- Validation on save: the curve closes, stays non-negative, and for polar
  nesting stays star-shaped around its centre.
- When validation fails, warn the designer and offer the parametric route.
- Memoisation extended to the parametric path.

## Todo

- [x] Implement point-in-polygon and the binary search for maximum copy scale
- [x] Implement curve validation: closure, non-negativity, star-shapedness
- [x] Warn and offer the parametric route when polar nesting does not apply
- [x] Extend memoisation to parametric nesting
- [x] Property test: a nested copy never crosses its parent outline

## Summary of Changes

Nesting works for curves the polar ratio cannot describe. 320 tests.

- `pointInPolygon` with a tested on-edge case: a point on an edge or a vertex is
  inside, and the answer does not depend on floating point noise. A point in the
  notch of a concave polygon is outside. `polygonInPolygon` is built on it, with
  wholly-inside, wholly-outside and partly-overlapping all tested.
- `validateCurve` reports closure, non-negativity and star-shapedness as three
  separate findings rather than one boolean, with a message naming what failed
  and where. A negative radius names the angle; a curve that doubles back says
  so; a curve that cannot be sampled at all is caught.
- `parametricFit` binary-searches for the largest scale at which the rotated
  copy fits inside its parent. Proven to fit at the scale it returns and not at
  0.05 above it. A rotation of zero returns 1.
- `fitForCurve` picks the route: polar when the curve validates as a star-shaped
  polar curve, parametric otherwise, with the reason carried on the nesting
  result alongside the safety warnings rather than thrown away.
- The memo covers both routes, keyed identically. An instrumented template
  proves a repeat resamples the curve zero further times, on either route.

**No polar result moved.** The parity recording still matches the prototype at
0.006953 font units and all five golden snapshots are unchanged, which is what
makes "the existing route keeps its values" a fact rather than an intention.

One correction. A curve whose points enclose no area returned 0 from the
parametric search, which claims nothing fits. `perfectFit` returns 1 in the
equivalent case, so the parametric route now does too, guarded by a signed-area
check. The spec gained a scenario for it.

Capability `shape-template` gained five requirements and eighteen scenarios.

OpenSpec change archived as `2026-10-01-add-parametric-nesting`.
