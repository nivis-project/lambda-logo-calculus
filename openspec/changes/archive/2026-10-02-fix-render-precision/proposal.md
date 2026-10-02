## Why

The mark's outline is visibly jagged where the prototype's is smooth. The
geometry is right: the contour is sampled 144 times around the curve and the
parity comparison agrees with the prototype to 0.007 font units. The renderer
is what spoils it.

`sceneToSvg` rounds every coordinate to two decimals. For the letters that is
right, because a letter is drawn in font units where two decimals is a
hundredth of a unit out of several hundred. The mark is drawn in unit
coordinates, where its whole radius is 1 and the group that holds it scales it
up by about 400. Two decimals there is a one percent error, scaled up with
everything else: a wobble of several pixels on screen.

Rounding is a decision about what the viewer can see, so it belongs in the
space the viewer sees, not in whatever local space a group happens to use.

## What Changes

- The renderer carries the accumulated scale of the groups it has entered, and
  rounds each path to a precision that is fixed in the root's coordinate space
  rather than in the path's own.
- A group's scale stops being a way to lose precision. A scene that draws a
  shape small and scales it up is as accurate as one that draws it large.
- Nothing changes for the letters, which are drawn at scale 1, so the parity
  comparison and the golden snapshots are untouched.

## Impact

- `packages/render-svg` - the renderer walks with a scale.
- `openspec/specs/scene-graph` - what a renderer must do with a group's scale.
