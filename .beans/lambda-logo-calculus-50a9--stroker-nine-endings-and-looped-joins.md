---
# lambda-logo-calculus-50a9
title: Stroker, nine endings and looped joins
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-10-01T05:43:56Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-i2r0
---

Skeleton runs become outlines. Ports the support-function stroker with its
360-entry lookup, the nine stroke endings in plain and shape-built form, and the
looped join.

## Scope

- Stroker: support-function offset per direction, 360-entry lookup, nib
  parameterised with the prototype's default of 6.5.
- Two drawing modes: the shape as pen, and a plain pen with ornaments. One
  pipeline, not two; ornaments become a render style.
- Nine endings, each plain and shape-built: round, flat, angled, tapered,
  flared, wedge, slab, hairline, ball.
- Endings registry with `build(end, passContext)`.
- Join registry, with the prototype's loop of the shape, loop radius 11.
- Keep as proven: flat serifs on vertical strokes, balls only on curved ends.

## Todo

- [x] Port the support-function stroker with the 360-entry lookup
- [x] Define the `Ending` interface and the endings registry
- [x] Register the nine endings in plain form
- [x] Register the nine endings in shape-built form
- [x] Define the `Join` interface and register the looped join
- [x] Fold ornaments into the one pipeline as a render style
- [x] Property test: outlines close and contain no NaN

## Summary of Changes

Skeletons become outlines. 216 tests; core at 96% statements and 83% branches.

- The pen is a 360-entry support table, one per degree. A round pen fills every
  entry with half the stroke width; a shape pen projects the base curve's
  sampled points onto each direction and takes the maximum, which is what lets
  the shape act as a nib. Lookup rounds and wraps, so any angle resolves.
- The stroker offsets each run point along its normal by the support value in
  that direction, left and right, and closes the outline. A vertical run under a
  round pen gives exactly the expected rectangle. A closed ring gives two
  contours whose areas match the analytic values for the inner and outer circle,
  so counters stay open.
- Taper and flare are a per-point width factor on the stroker, not geometry
  added at the end. An end that meets another stroke is never profiled. A
  property test confirms the factor never reaches zero.
- All nine endings registered, each in plain and shape-built form: round, flat,
  angled, tapered, flared, wedge, slab, hairline, ball. Flat adds nothing
  because the stroker already ends flat. The angled cut turns with the copy
  index when shape-built. Serifs on a mostly vertical end lie flat and on a
  mostly horizontal end stand upright, proven by comparing their spans. Balls
  appear only on curved runs.
- The looped join places a ring of the base curve on the corner bisector at a
  radius of 11, for corners turning more than 50 degrees. With the shape off it
  is a plain circle; with it on the radius varies with a floor of 0.35.
- `outlineSkeleton` is the one pipeline. Letter style and ornament style produce
  identical geometry and differ only in the style recorded, which is the
  duplicate code path the brief asked to be removed.
- Every one of the 69 glyphs, under both pens and all nine endings, produces
  finite, non-empty, well-formed outlines. That is 1242 combinations in one test.

Two corrections found by testing:

- The wedge ending ignored the shape-built flag, so its two forms were
  identical. The prototype places scaled shape copies there; it now does too.
- A property test failed intermittently, which is exactly what they are for.
  Rings were closed by relying on trig symmetry at 0 and 2 pi, which is not
  exact in floating point. Rings are now closed by construction: sample up to
  but not including the full turn, then repeat the first point. This affected
  the loop join, the round ending and the shape rings.

Two capabilities now have main specs: `stroker` (three requirements, thirteen
scenarios) and `endings-and-joins` (six requirements, fifteen scenarios).

OpenSpec change archived as `2026-10-01-add-stroker-endings-joins`.
