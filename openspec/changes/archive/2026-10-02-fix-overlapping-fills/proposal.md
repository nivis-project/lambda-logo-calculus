## Why

Found by opening the studio for the first time, which is what the studio is for.

Where two strokes meet, and at every stroke end, the drawing has small pale
speckles. They are holes.

The scene builder puts every contour of a pass into one path and fills it with
the even-odd rule. That rule is what opens a counter: a contour inside another
cancels it. It cannot tell the difference between a counter, which should be a
hole, and a stamp covering a joint, which should not.

The prototype has no such problem because it never merges them. Each outline,
each ending and each stamp is its own element, and only a bowl's two sides share
one.

## What Changes

- Keep the contours that belong together together, and the ones that do not
  apart. A ring's two sides share a path, because that is what makes the
  counter; everything else gets its own.
- Have the outliner return its outlines grouped, so the builder knows which
  contours are a pair and which are not.

## Capabilities

### Modified Capabilities

- `scene-graph`: a path holds the contours that must interact through the fill
  rule, and no others.

### New Capabilities

<!-- none -->

## Impact

- Changed: `packages/core/src/stroke/outline.ts`,
  `packages/core/src/scene/build.ts`.
- The parity comparison was blind to this: it compares the prototype's path
  coordinates against the port's, and the coordinates were right. What was
  wrong was which of them shared a fill rule, which is not a coordinate.
