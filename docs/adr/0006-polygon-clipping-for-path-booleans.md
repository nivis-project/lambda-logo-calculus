# 0006. polygon-clipping for path booleans, with a polyline Bezier fitter

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-repository-documents`

## Context

Exports need two geometric operations the core does not provide.

Boolean operations: the stroker emits one outline per pass, and an export has to
unite them into one shape. Counters, which the live preview draws with SVG
masks, have to become real holes, because masks fail in some tools and cannot be
edited in Illustrator or Figma.

Curve fitting: the stroker works by support-function offset sampled per
direction, so what comes out is a polyline. Exporting thousands of line segments
per glyph produces a file that is large and unpleasant to edit. Something has to
fit Beziers to it.

`docs/briefing.md` names Clipper2 (WASM), polygon-clipping and paper.js as
candidates for booleans, and "a polyline-to-Bezier fitter" for the fitting.

One constraint from this project specifically: the gate runs inside the Nix
sandbox with no network, so every dependency has to build there. A WASM artifact
adds a build step to vendor, hash and verify.

## Decision

`polygon-clipping` for boolean operations, and a polyline-to-Bezier fitter with
a stated error tolerance, both behind interfaces in `packages/export`.

## Consequences

Pure JavaScript, no WASM, no build step, no binary to vendor. The sandboxed gate
gets it through the same `fetchPnpmDeps` path as everything else, and it runs
identically in Node and in a browser.

It operates on polygons, which is exactly what the support-function stroker
emits. There is no conversion layer between the stroker's output and the boolean
engine's input.

The cost is speed and robustness at the edges. Clipper2 is faster and better
tested against degenerate input: coincident edges, self-intersections, near-zero
areas. Glyph outlines at extreme parameter values produce exactly that kind of
input, and this is where the decision is most likely to be wrong.

It is wrong in a bounded way. Booleans run at export time, not in the 16 ms
preview path, so being slower costs a designer a moment on export rather than
making the tool feel bad. And it sits behind an interface, so swapping in
Clipper2 is a replacement of one module.

**This decision is not yet tested.** Nothing exercises it until milestone 06.
It is recorded now because the package layout already assumes it. If degenerate
glyph outlines defeat it, this ADR is superseded rather than edited, and the
reason it looked right today stays on the record.

The curve fitter's error tolerance is a real trade: tighter means larger files,
looser means visible deviation from the preview. The value is set and justified
when the fitter is written, not guessed here.

## Alternatives considered

**Clipper2 through WASM.** The fastest and the most robust against degenerate
input, and it offers polygon offsetting as well, which the stroker could
eventually use. Rejected for now: a WASM artifact has to be vendored, hashed and
made to build in the Nix sandbox, and that cost is not worth paying before the
robustness has been shown to be necessary. This is the first alternative to
revisit.

**paper.js.** Booleans and curve fitting in one library, and it works on real
Beziers rather than polygons, so it could skip the flattening step. Rejected:
it carries its own scene model, document and view, duplicating the scene graph
the core already produces, and it expects a DOM in places. Importing a second
geometry model to avoid writing a fitter is a bad trade.

**Write the booleans by hand.** Full control, no dependency. Rejected: robust
polygon boolean operations are a well-known trap, and the failure mode is subtle
wrong output on rare input rather than an obvious crash.

**Export polylines and skip curve fitting.** Simplest, and geometrically exact.
Rejected: the output is unusable as a logo file. A designer who opens the SVG
expects editable curves, not a few thousand line segments per glyph.
