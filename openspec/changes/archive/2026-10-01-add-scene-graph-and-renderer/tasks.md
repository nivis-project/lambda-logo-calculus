## 1. The scene graph

- [x] 1.1 Define the scene node types: `path` with contours and style, `group`
  with children and an optional transform. Verify a scene round-trips through
  JSON unchanged.
- [x] 1.2 Verify no node type can carry an element reference, a renderer id or a
  mask, by inspection of the types and by a test over a produced scene.
- [x] 1.3 Carry the font-units-to-screen flip as a transform on the scene's root
  group, and set the viewBox to the flipped range. Verify the rendered wordmark
  reads the right way up rather than mirrored.
- [x] 1.4 Record a counter as a contour with its own winding rather than a mask.
  Verify a glyph with a counter produces two contours in one path node.

## 2. Palettes

- [x] 2.1 Define the `Palette` interface and the registry. Verify a count of one
  does not divide by zero and that a palette is deterministic.
- [x] 2.2 Port all six schemes with the prototype's formulas and a base hue of
  322. Verify each against a hand-computed value.
- [x] 2.3 Verify monochrome keeps its hue and lightens, and complementary
  alternates by 180 degrees.
- [x] 2.4 Property test: for any index and count, the reported hue is at least 0
  and below 360.

## 3. Style

- [x] 3.1 Apply the palette per copy and the prototype's opacity formula
  `min(1, 0.25 + alpha * 1.25)`. Verify the opacity at alpha 0, 0.22 and 1.
- [x] 3.2 Verify style produces a colour for every copy and never an undefined.

## 4. Layout

- [x] 4.1 Implement advances, the word space and string width. Verify a space
  advances by the word space, a glyph by its width plus two side bearings, and
  an empty string by zero.
- [x] 4.2 Implement wrapping with a mid-word break and a report flag. Verify
  text that fits, text that wraps at a space, and a word wider than the maximum.
- [x] 4.3 Property test: no wrapped line exceeds the maximum, except a single
  character that cannot be broken.
- [x] 4.4 Implement the side lockup: size the mark against the text block height
  times 1.06, reserve space, and iterate until the line count settles. Verify a
  two-line block gives a taller mark than a one-line block.
- [x] 4.5 Switch to the stacked lockup when a side lockup would break a word.
  Verify the switch happens and that no space is reserved afterwards.
- [x] 4.6 Verify a layout result contains positions and no path data.

## 5. The SVG renderer

- [x] 5.1 Implement `packages/render-svg`: mount, draw, and a scene to SVG DOM
  mapping. Verify a hand-built scene with no core involved renders correctly.
- [x] 5.2 Assign ids from the renderer's own counter. Verify two renderer
  instances produce disjoint ids and that redrawing does not leave stale ids.
- [x] 5.3 Verify the renderer reads only the scene, by rendering a scene built
  by hand in a test that imports nothing from the core.
- [x] 5.4 Verify drawing the same scene twice gives identical geometry.
- [x] 5.5 Add a DOM test environment for `packages/render-svg` only, leaving the
  core tests running without a DOM.

## 6. End to end

- [x] 6.1 Run the whole pipeline for the prototype's default settings and
  produce a scene. Verify it has one path node per copy per glyph and that every
  contour is finite.
- [x] 6.2 Render that scene in the studio and show it. Verify the end-to-end
  test sees real geometry on the page.

## 7. Verification

- [x] 7.1 Verify `packages/core` coverage is at or above 80%.
- [x] 7.2 Verify `nix flake check` is green.
