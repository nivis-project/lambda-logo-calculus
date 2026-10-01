## Why

Epic [lambda-logo-calculus-7p8s](../../../.beans/lambda-logo-calculus-7p8s--glyph-skeletons-and-grid-metrics.md),
under milestone 02 Core geometry and prototype parity.

The alphabet is the second half of the product. The prototype has all of it, as
69 entries built by a function that calls `arc()` while it runs, and `arc()`
reads four pieces of global state: whether the curves stage is on, the
amplitude, the rotation, and the derived `rc()` radius.

That means a glyph in the prototype is not data. It is the result of running the
curves stage, frozen at the moment `buildGlyphs()` happened to be called, and
the prototype calls it again every time any of those globals changes.

Separating the two is what makes the rest of milestone 02 possible. A skeleton
becomes a declarative shape with no hidden inputs, and the warping that the
prototype does inside `arc()` becomes the Curves stage in the next epic, with
an explicit context.

## What Changes

- Add grid metrics as data: stroke width 10, x-height 56, cap-height 86,
  descender -28, side bearing 9, dot radius 7, word space 28, line height 150,
  all in font units, matching the prototype's `G` object.
- Add the skeleton primitives: a `stroke` of segments, a `bowl` with optional
  cut regions, and a `dot`. A stroke segment is either a `point` or an `arc`
  declared by centre, radii and a pair of angles, never pre-sampled.
- Port all 69 glyphs: a to z, A to Z, 0 to 9, the six punctuation marks the
  prototype has, and the notdef it falls back to. Each keeps its advance width.
- Add a glyph set registry, so an alternate `a`, an accented glyph or a ligature
  is a registration later rather than an edit here.
- Add a JSON schema for a skeleton, and validate every built-in glyph against it
  in a test, so a malformed port is caught rather than drawn.

## Capabilities

### New Capabilities

- `glyph-set`: what a glyph skeleton is, what grid it sits on, what a glyph set
  must provide, and what happens for a character it does not have.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src/glyph`: the metrics, the primitives, the schema
  and the registry.
- New under `packages/templates/src/glyphs`: the 69 ported glyphs.
- An arc is stored as centre, radii and two angles in degrees, exactly as the
  prototype writes it. Sampling and warping it is the Curves stage's job, which
  is the whole point of the separation.
- The prototype's `arc()` applies its warp while sampling, so the ported
  skeletons are not yet geometrically identical to the prototype's. They become
  identical once the Curves stage exists. The parity epic is where that is
  proved; nothing here claims it.
- Coordinates are kept exactly as the prototype writes them, including the ones
  that look arbitrary. Changing a single number would make the parity epic's job
  impossible to interpret.
