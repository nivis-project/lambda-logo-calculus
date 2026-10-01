## 1. The boolean engine

- [x] 1.1 Add `polygon-clipping` to `packages/export` and update the gate's
  dependency hash in the same change. Verify `nix flake check` is green.
- [x] 1.2 Define the boolean engine interface and its registry, and register the
  polygon-clipping engine. Verify a second engine can be registered and used by
  the same calling code.

## 2. Cleaning a pass

- [x] 2.1 Turn a pass's contours into polygons with real holes, by the even-odd
  rule the preview fills with. Verify a counter comes back as a hole inside its
  outer ring.
- [x] 2.2 Verify the cleaned polygons hold exactly the points the even-odd
  interior holds, over a grid of sample points across a real glyph.
- [x] 2.3 Drop degenerate contours rather than failing on them. Verify a
  two-point contour and an empty pass both return without throwing.
- [x] 2.4 Property test: over random parameters, every cleaned ring closes,
  holds three distinct points or more, and contains no `NaN` and no infinity.
- [x] 2.5 Snap coordinates before the underlying library sees them, retry at
  coarser steps, and throw a named error when every step fails. Write ADR 0010
  recording the failure the property test found and why snapping is the answer.
  Verify the finest step is a thousand times below the fit tolerance.

## 3. The fitter

- [x] 3.1 Implement the polyline-to-Bezier fitter, splitting a segment that does
  not fit rather than accepting it. Verify every input point lies within the
  tolerance.
- [x] 3.2 State the default tolerance as a named constant with its reasoning,
  overridable per call. Verify the default is used when none is given.
- [x] 3.3 Verify a tighter tolerance never deviates more and never emits fewer
  segments.
- [x] 3.4 Verify a ring of three points comes back as lines, not a curve.
- [x] 3.5 Verify a fitted wordmark holds fewer than half as many segments as it
  held points and that its path data is smaller, and record the measured
  reduction, and what limits it, in the testing strategy.

## 4. The scene

- [x] 4.1 Let a path node carry fitted curve contours alongside its polylines,
  and have the SVG renderer draw the curves when they are there. Verify a scene
  without curves renders as before.
- [x] 4.2 Verify measuring a scene with curves gives the same bounds as before
  fitting.
- [x] 4.3 Clean a scene for export: unite, fit, non-zero fill. Verify the
  cleaned scene keeps every transform, colour and opacity, and that the scene
  given is unchanged.

## 5. Verification

- [x] 5.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
