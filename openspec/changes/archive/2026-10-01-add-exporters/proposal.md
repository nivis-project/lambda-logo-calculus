## Why

Epic [lambda-logo-calculus-kk6s](../../../.beans/lambda-logo-calculus-kk6s--svg-png-and-pdf-exporters.md),
under milestone 06 Export, brand sheet and performance.

The geometry is clean and the project saves, and a designer still cannot hand
anyone a logo. The brief names three formats as the deliverable: SVG, PNG at
three scales, and PDF. Nothing in the studio produces a file anyone else can
open.

The three are one problem, not three. Each is a scene turned into bytes, each
has its own handful of settings, and a dialog written by hand for each of them
is the switch statement this project does not allow. One interface, three
registrations, and a dialog generated from the parameter definitions the way
every other panel already is.

## What Changes

- Add the `Exporter` interface and its registry, each exporter carrying its own
  parameter definitions.
- Register the SVG exporter: the cleaned scene written as SVG text, with ids
  that depend on the scene rather than on how many times the renderer has run,
  and no masks.
- Register the PNG exporter at 1x, 2x and 4x. Rasterising needs a canvas, so the
  exporter asks the host for one through the export context rather than reaching
  for a DOM the core may not have.
- Register the PDF exporter: one page, vector paths, the palette's colours, and
  opacity through a graphics state rather than baked into the colour.
- Generate the export panel from the exporters' parameter definitions, and let a
  designer export from the studio.

## Capabilities

### New Capabilities

- `exporters`: the interface, the registry, what each of the three formats
  writes, and what "the export matches the screen" means and how it is checked.

### Modified Capabilities

- `studio-shell`: an export panel, generated from the chosen exporter's
  parameter definitions, that writes a file.
- `quality-gate`: the browser suite builds the studio before serving it. It did
  not, so an end-to-end run could pass against a bundle built before the change
  under test, which is how a fitter bug survived a green suite long enough to be
  noticed by hand.
- `curve-fitting`: the fit is held to the tolerance in both directions, and a
  span of two points is written as a line. Comparing the export against the
  preview is what found the fitted path bulging away from the input between two
  points it passed close to.

## Impact

- New under `packages/export/src`, with the panel in `apps/studio`.
- The SVG is written as text rather than through the DOM renderer, because an
  exporter that needs a browser cannot be tested in the gate and cannot later
  move into a worker. The DOM renderer stays what the screen uses.
- Rasterising is the one thing that genuinely needs a browser. It enters through
  the export context as a function the host supplies, so the PNG exporter is
  testable with a stub and the studio passes the real one.
- "Matches the screen" is checked rather than asserted: the exported SVG is
  compared against the rendered preview for its viewBox, its glyph count, its
  fills, its opacities, and each glyph's bounding box within the fitter's
  tolerance.
