## Why

The letters look fuzzy. Their edges have a soft halo, overlaps go darker than
they should, and seams show where a stroke meets its own ending.

The cause is where the transparency is applied. A pass is drawn at about half
opacity, and the port puts that on every path: the stroke, each ending, each
stamp. Semi-transparent shapes that overlap each other blend twice, so every
overlap inside a single pass darkens and every seam shows.

The prototype puts the opacity on the group instead. The whole pass composites
as one shape first and is made transparent afterwards, so its own overlaps do
not show at all.

This is the second fault found by looking at the thing rather than at a test,
and like the first, the coordinates were never wrong.

## What Changes

- Let a group carry an opacity and a fill, so a pass can be composited as one
  shape and then made transparent.
- Put the pass opacity on the pass group, and take it off the paths.

## Capabilities

### Modified Capabilities

- `scene-graph`: a group can carry an opacity, which composites its children
  together before applying it.

### New Capabilities

<!-- none -->

## Impact

- Changed: `packages/core/src/scene/types.ts`,
  `packages/core/src/scene/build.ts`, `packages/core/src/scene/logo.ts`,
  `packages/render-svg/src/index.ts`.
- Group opacity is not a style flourish; it changes what the drawing means. On
  a path it is "make this shape transparent". On a group it is "draw these,
  flatten them, then make the result transparent". The second is what nested
  passes need, and the difference is visible.
