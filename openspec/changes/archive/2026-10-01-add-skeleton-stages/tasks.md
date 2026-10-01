## 1. The stage interface

- [x] 1.1 Define `SkeletonStage`, `StageContext` and the working skeleton
  (unconsumed parts, open runs, closed rings, dots). Verify a stage type-checks
  and that the context carries the template, its parameters, the rotation, the
  nesting result, the grid metrics and the modulation values.
- [x] 1.2 Build the stage registry and the ordered, switchable stage list.
  Verify a disabled stage is skipped and that reordering the list changes the
  order of application.
- [x] 1.3 Verify no stage mutates its input, by freezing the input and applying
  each stage.

## 2. Curves

- [x] 2.1 Sample declarative arcs into points, with the prototype's step count.
  Verify a stroke with no arc passes through with its points unchanged.
- [x] 2.2 Apply the warp: the base curve's radius at the sample angle divided by
  the interpolation between its radii at the two end angles, clamped to the
  declared bounds. Verify the warped arc's endpoints land where the unwarped
  ones do.
- [x] 2.3 Property test: for random amplitudes, rotations and arcs, no sample's
  scaling leaves the declared bounds.
- [x] 2.4 Verify the stage disabled still samples arcs but applies no warp.

## 3. Bowls

- [x] 3.1 Implement `shapeRho` and the ring sampling, fitted into the bowl's
  ellipse inset by the inset parameter. Verify `o` yields one closed ring and no
  open run.
- [x] 3.2 Split the ring at cut regions. Verify `c` yields at least one open run
  and no closed ring, and that `e` does too.
- [x] 3.3 Property test: for random amplitudes and rotations, the ring's
  enclosed area is above zero, so the counter never collapses.
- [x] 3.4 Property test: every ring point lies inside the declared ellipse inset
  by the inset parameter.
- [x] 3.5 Verify the stage disabled produces a plain ellipse.

## 4. Bend

- [x] 4.1 Bow each segment perpendicular to itself by the prototype's amplitude
  formula over a half sine. Verify a bent segment keeps its first and last
  points.
- [x] 4.2 Leave a segment shorter than the threshold straight. Verify with a
  segment just under and just over it.
- [x] 4.3 Verify a bend factor of zero leaves runs straight without the stage
  being disabled, and that the stage disabled does the same.
- [x] 4.4 Property test: bending never moves a run's endpoints, for random
  amplitudes and rotations.

## 5. Proportions

- [x] 5.1 Implement the width factor and the modulated x-height with the
  prototype's formulas. Verify both against hand-computed values for the
  prototype's defaults.
- [x] 5.2 Implement the piecewise y remap. Verify the baseline stays at zero,
  the x-height maps to the modulated x-height, and the cap-height does not move.
- [x] 5.3 Property test: the remap is monotonic in y.
- [x] 5.4 Verify the stage disabled leaves every coordinate untouched.

## 6. Parameters

- [x] 6.1 Declare every magic number as a parameter with the prototype's
  default, grouped and marked advanced. Verify the defaults are bowl inset 5,
  bowl radius floor 0.35, bend factor 0.22, bend threshold 8, bend samples 12,
  corner threshold 50, run-split threshold 25, arc warp 0.5 to 1.5.
- [x] 6.2 Verify no numeric literal remains in a stage's transformation that is
  not read from its parameters, by inspection and by a test that changes each
  parameter and sees the output change.

## 7. Invariants

- [x] 7.1 Property test: a run that starts on the baseline still has its first
  point on the baseline after every stage, for random parameters.
- [x] 7.2 Property test: every coordinate produced by every stage is finite, for
  random parameters and every built-in glyph.
- [x] 7.3 Verify running the full stage list over all 69 glyphs produces no
  empty run and no NaN.

## 8. Verification

- [x] 8.1 Verify `packages/core` coverage is at or above 80%.
- [x] 8.2 Verify `nix flake check` is green.
