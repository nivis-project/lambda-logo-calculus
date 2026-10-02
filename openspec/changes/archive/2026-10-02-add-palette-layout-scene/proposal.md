## Why

Epic [lambda-logo-calculus-iavv](../../../.beans/lambda-logo-calculus-iavv--palette-layout-lockup-and-the-scene-graph.md),
under milestone 03 The faithful port.

Everything so far produces contours at the origin. This is what turns them into
a logo: colour, a line of letters, a mark beside them, and something a renderer
can read.

The scene graph is the part worth being careful about. The prototype builds an
SVG string, so its only consumer is a browser, and its bowls are cut with masks,
which the exports in milestone 04 cannot use. A scene of plain data that
renderers read and nothing writes back to is what makes an exporter possible at
all.

## What Changes

- Add the six palettes, and the three different remaps of the opacity slider
  that milestone 02 found.
- Add advances and wrapping.
- Add the lockup: the mark sized against the text block, placed by the geometry
  it actually draws, and stacked above when the text would otherwise break.
- Add the scene graph: groups, transforms, paths and nothing else. No masks.
- Add a renderer that turns a scene into SVG text and reads nothing but the
  scene.

## Capabilities

### New Capabilities

- `scene-graph`: what a scene holds, what it does not, and what a renderer may
  assume.

### Modified Capabilities

- `layout-and-lockup`: the port's layout takes the available width as a given
  rather than reading it from a container, which is the second defect milestone
  02 recorded.

## Impact

- The gate gained a typecheck step. `tsc --build` only compiles the published
  sources, so a type error in a test file was passing the gate unnoticed. One
  was found and fixed while writing this change.

- New: `packages/core/src/style/`, `packages/core/src/layout/`,
  `packages/core/src/scene/`, `packages/render-svg/`.
- The prototype derives its layout from the width of the element it draws into.
  The port takes a width as a parameter instead, so the same inputs always give
  the same output. The studio will pass its own width in.
- Masks are not in the scene graph at all, so the ornament mode's bowl cutting
  has no home here. That mode is out of scope for the port and is recorded as
  such rather than half-built.
