---
# lambda-logo-calculus-i2r0
title: 'Skeleton stages: curves, bowls, bend, proportions'
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-10-01T05:34:32Z
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

- [x] Define `SkeletonStage` and `StageContext`
- [x] Port the Curves stage with normalised arc warping
- [x] Port the Bowls stage
- [x] Port the Bend stage
- [x] Port the Proportions stage
- [x] Name every magic number as a parameter with the prototype's default
- [x] Property tests: baseline endpoints survive every stage, bowl counters stay open

## Summary of Changes

The four transformations are pure functions with an explicit context, and the
list of them is data. 172 tests.

- `SkeletonStage` with `apply(skeleton, context)`. `StageContext` carries the
  resolved template, its parameters, the rotation, the nesting result, the grid
  metrics and the modulation values. Nothing else is reachable.
- The working skeleton carries the declarative parts not yet consumed plus the
  open runs, closed rings and dots produced so far, so each stage declares what
  it consumes rather than everything being rebuilt.
- Curves samples declarative arcs and scales each sample by
  `rc(angle) / interpolate(rc(a0), rc(a1))`, clamped to 0.5 and 1.5. Because the
  divisor is the interpolation between the endpoint radii, the scaling is 1 at
  both ends, so a warped arc still meets its stems. Proven to nine decimal
  places.
- Bowls samples the base curve by `shapeRho` with a floor of 0.35, fits it into
  the bowl's box inset by 5, and splits it at cut regions. `o` yields one closed
  ring, `c` yields open runs. A property test confirms the enclosed area is
  never zero, so a counter never collapses.
- Bend bows each segment over a half sine by
  `length * 0.22 * cos(3 * angle - rotation) / A`, skipping segments under 8
  units. A property test confirms a run's endpoints never move.
- Proportions multiplies x by `0.78 + 0.5 (1 - e^-((A-1)/4))` and remaps y
  piecewise through the modulated x-height. The baseline and the cap-height
  stay put, and a property test confirms the remap is monotonic.
- Eight magic numbers are now parameters with the prototype's defaults: bowl
  inset 5, bowl radius floor 0.35, bend factor 0.22, bend threshold 8, bend
  samples 12, arc warp 0.5 to 1.5, plus the proportions constants.

Three corrections, all found by writing the tests:

- A disabled stage does not always mean "pass through". Curves disabled must
  still sample arcs into points, and Bowls disabled must still build a plain
  ellipse, or a disabled stage would delete the glyph. The interface gained an
  optional `applyDisabled`, which is honest about some stages being structural
  as well as decorative. Bend and Proportions declare none and are simply
  skipped.
- The spec claimed every bowl ring point lies inside the inset ellipse. It does
  not, and cannot: the ring is normalised by its own bounding extent before
  being fitted, so it fills the inset box and touches all four sides, which at
  45 degrees is outside the inscribed ellipse. The spec now states the box
  invariant, which is both true and the one that matters.
- The x-height headroom cap (`capHeight - 16`) never binds across the fit
  slider's own range: at fit 1 the gain term reaches 68.32 against a cap of 70.
  It is defensive, and the spec and tests now say so rather than asserting a
  clamp that never fires.

Capability `skeleton-stages` is a main spec with seven requirements and
twenty-four scenarios.

OpenSpec change archived as `2026-10-01-add-skeleton-stages`.
