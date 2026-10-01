## Why

Epic [lambda-logo-calculus-txdw](../../../.beans/lambda-logo-calculus-txdw--path-booleans-and-curve-fitting.md),
under milestone 06 Export, brand sheet and performance.

What the studio draws is not what a designer can hand over. The stroker works by
sampling a support function per direction, so every glyph leaves it as a dense
polyline, and a counter is a second contour that only looks like a hole because
the renderer is told to fill with the even-odd rule. Open that in Illustrator and
the hole is a guess about fill rules, and a letter is two thousand line segments
nobody can edit.

Export needs the geometry cleaned twice over: the passes united into real shapes
with real holes, and the polylines fitted to Beziers within a stated tolerance.
ADR 0006 already chose `polygon-clipping` and a hand-written fitter, and said
the fitter's tolerance would be justified when the fitter was written. This is
that change.

## What Changes

- Add a boolean engine as a registered interface, with `polygon-clipping` behind
  it, so the WASM engine ADR 0006 names as the first alternative is a
  replacement of one module rather than a rewrite.
- Turn each pass's contours into polygons with real holes, by taking the
  even-odd interior the preview already fills, so the exported shape is what is
  on screen and a counter is a hole rather than a fill rule a later tool has to
  agree with.
- Add a polyline-to-Bezier fitter with a stated, justified error tolerance.
- Let a scene's path node carry the fitted curves alongside its polylines, so a
  renderer draws whichever the export asked for and the preview is unchanged.
- Clean a scene for export: combine, fit, and set the fill rule to non-zero,
  leaving the live scene as it was.

## Capabilities

### New Capabilities

- `path-booleans`: the boolean engine interface, the registry, turning a pass
  into polygons with real holes, and what is guaranteed of the result.
- `curve-fitting`: fitting a polyline to cubic Beziers inside a tolerance, and
  what that tolerance is and why.

### Modified Capabilities

- `scene-graph`: a path node may carry a fitted curve form alongside its
  polyline contours. Renderers draw the curves when they are there.

## Impact

- New under `packages/export/src`, which ADR 0006 already named as the home for
  both. `packages/core` does not gain the dependency, because booleans run at
  export time and the core stays a leaf with no third-party geometry in it.
- The live preview is untouched. It keeps its polylines and its even-odd fill,
  because uniting on every slider drag would break the 16 ms budget and buy
  nothing a viewer can see.
- A cleaned pass can produce several polygons where there was one contour, and
  several holes where there was one counter. That is the correct answer, and it
  means an exporter counts shapes rather than assuming one per glyph.
- Even-odd rather than union is the operation, and that is deliberate. Union
  would fill every counter, because the stroker emits a bowl as two rings and
  leaves the fill rule to say which is the hole. Reproducing the rule the
  preview uses is also what makes "the export matches the screen" checkable
  rather than a hope.
