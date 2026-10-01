## 1. The interface

- [x] 1.1 Define the `Exporter` interface and its registry, with a media type,
  an extension and parameter definitions on each exporter. Verify a duplicate id
  is refused and a fourth exporter runs through the same call.

## 2. SVG

- [x] 2.1 Write the scene as SVG text without a DOM, cleaning the geometry
  first. Verify the output holds cubic commands and a non-zero fill rule.
- [x] 2.2 Derive ids from the scene. Verify exporting the same scene twice gives
  identical bytes.
- [x] 2.3 Verify the output holds no mask, no clip path and no use element.

## 3. PNG

- [x] 3.1 Take the rasteriser from the export context, and offer 1x, 2x and 4x.
  Verify the rasteriser is asked for the right pixel size at each scale.
- [x] 3.2 Verify a PNG asked for without a rasteriser is refused with a message
  naming what is missing.

## 4. PDF

- [x] 4.1 Write a single-page vector PDF with a correct cross-reference table.
  Verify the header, the trailer and every object offset.
- [x] 4.2 Write each pass's colour, and its opacity as an external graphics
  state. Verify the state is present and carries the alpha.
- [x] 4.3 Verify the content stream holds path operators and no image.

## 5. The gate

- [x] 5.1 Build the studio before the browser suite serves it. Verify a source
  change with no manual build is what the suite tests.

## 6. The fitter

- [x] 6.1 Hold the fit to the tolerance in both directions, and write a span of
  two points as a line. Verify a ring with a spike in it no longer strays, and
  re-record the measured figures in the testing strategy.

## 7. The studio

- [x] 7.1 Generate the export panel from the chosen exporter's parameter
  definitions. Verify in the browser that choosing an exporter changes the
  controls.
- [x] 7.2 Export from the studio. Verify in the browser that a file is written
  with the chosen extension.
- [x] 7.3 Verify in the browser that the exported SVG matches the preview: the
  viewBox, the glyph count, the fills, the opacities, and each glyph's extent
  within the fitter's tolerance plus the file's rounding. Measure the extent by
  walking both paths, because a browser's own bounding box for a curve includes
  its control points and would compare a fitted path against a polyline on
  different terms.

## 8. Verification

- [x] 8.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
