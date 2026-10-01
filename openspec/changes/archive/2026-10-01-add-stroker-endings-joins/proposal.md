## Why

Epic [lambda-logo-calculus-50a9](../../../.beans/lambda-logo-calculus-50a9--stroker-nine-endings-and-looped-joins.md),
under milestone 02 Core geometry and prototype parity.

The stages produce skeleton runs and rings. Nothing yet gives them width, so
nothing can be drawn. The stroker is what turns a centre line into an outline,
and it is the part of the prototype most worth keeping: a support-function
offset with a 360-entry lookup, which is what lets the base curve act as the pen.

The nine stroke endings are the other half. The prototype has them in two
versions each, plain and built from the shape, selected by one toggle, and it
builds them inside a function that also emits SVG strings. Separating geometry
from rendering is what makes an exporter possible at all.

The prototype also has two parallel pipelines, `glyphLetter()` and `glyphOrn()`,
with duplicated logic. The brief is explicit that these become one pipeline with
ornaments as a render style.

## What Changes

- Add the support table: 360 entries, one per degree, giving the pen's extent in
  that direction. A round pen fills every entry with half the stroke width; a
  shape pen computes the base curve's support function per copy.
- Add the stroker: for each point of a run, offset left and right along the
  normal by the support value in that direction, producing one closed outline.
  Closed rings produce an outer and an inner contour.
- Add the width profile for tapered and flared ends, applied as a per-point
  factor on the support value, so taper and flare are the stroker's work rather
  than an ending's.
- Add the `Ending` interface and register all nine: round, flat, angled,
  tapered, flared, wedge, slab, hairline and ball, each with a plain and a
  shape-built form.
- Keep the two behaviours the prototype proved: serifs on vertical strokes sit
  flat along the baseline, x-height or cap line, and balls appear only on curved
  ends.
- Add the `Join` interface and register the looped join, a ring of the base curve
  placed along the corner bisector.
- Fold ornaments into the one pipeline as a render style rather than a second
  code path.

## Capabilities

### New Capabilities

- `stroker`: how a centre line becomes an outline, what a pen is, and what the
  width profile does.
- `endings-and-joins`: what an ending and a join are, which ones exist, and the
  rules that decide when each applies.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src/stroke`: the support table, the stroker, the
  width profile, the endings and the joins.
- Endings return geometry, never markup. The prototype returns SVG strings from
  the same function that computes the shape; splitting them is what lets the PDF
  and PNG exporters exist later.
- The ending geometry is returned as outlines in the same form the stroker
  produces, so the style stage and the renderer treat them uniformly.
- A free stroke end is one that does not meet another stroke. Deciding which
  ends are free is the run-splitting the Bend stage already does; this epic
  consumes that and does not change it.
- Still nothing renders. The output is outlines as numbers; the scene graph and
  the renderer are the next epic.
