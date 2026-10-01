## Why

Epic [lambda-logo-calculus-i2r0](../../../.beans/lambda-logo-calculus-i2r0--skeleton-stages-curves-bowls-bend-proportions.md),
under milestone 02 Core geometry and prototype parity.

The glyph skeletons are now declarative, which means nothing yet turns them into
the shapes the prototype draws. Four transformations do that, and in the
prototype all four read global state: `arc()` reads the curves toggle, the
amplitude and the rotation; `bowlSkeleton()` reads the amplitude, the rotation
and the bowls toggle; `processStroke()` reads the bend toggle, the amplitude and
the rotation; and `tf()` reads a module-level `M` that `computePrim()` wrote.

This epic makes all four pure functions with an explicit context, and makes the
list of them data a designer can reorder and switch off.

It also brings eight magic numbers into the open. The prototype hard-codes a
bowl inset of 5, a bend amplitude of 0.22, a bend threshold of 8, 12 bend
samples, a corner threshold of 50 degrees, a run-split threshold of 25 degrees,
an arc warp clamped to 0.5 and 1.5, and a bowl radius floor of 0.35. Each
becomes a named parameter with the prototype's value as its default.

## What Changes

- Add `SkeletonStage` with a pure `apply(skeleton, context)`, and `StageContext`
  carrying the resolved template, its parameters, the rotation, the nesting
  result, the grid metrics and the current modulation values.
- Add the working skeleton the stages pass between each other: the declarative
  parts not yet consumed, plus the open runs, closed rings and dots produced so
  far.
- Add the Curves stage: sample each declarative arc, warping its radius by
  `rc(angle) / interpolated endpoint radius`, clamped, so an arc still meets the
  stems it joins.
- Add the Bowls stage: sample the base curve by `shapeRho`, fit it into the
  bowl's ellipse inset by the inset parameter, and split it where a cut region
  removes part of it.
- Add the Bend stage: bow each straight run perpendicular to itself by an
  amplitude the base curve's direction drives.
- Add the Proportions stage: scale width by a factor the amplitude drives and
  remap height through the modulated x-height.
- Add the stage registry and an ordered stage list, each stage switchable.

## Capabilities

### New Capabilities

- `skeleton-stages`: what a stage is, what it may read, the order they run in,
  and what each of the four built-in stages does.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src/stage`: the interface, the context, the working
  skeleton, the four stages and the stage list.
- The modulation values (`sx` and the modulated x-height) arrive in the context
  as numbers. Where they come from is milestone 05's modulation list; until then
  the Proportions stage computes the prototype's formulas itself, which is what
  parity requires.
- Stage order matters and is fixed for now: curves, bowls, bend, proportions.
  Reordering is a milestone 04 feature; the list is data from here so that
  feature is a UI change rather than a rewrite.
- A stage that is switched off is skipped entirely, matching the prototype's
  toggles, so the parity epic can compare each one independently.
- Nothing is stroked yet. The output is still skeleton geometry, one step closer
  to outlines.
