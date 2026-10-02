## Why

Epic [lambda-logo-calculus-jix4](../../../.beans/lambda-logo-calculus-jix4--the-grid-and-the-alphabet-as-data.md),
under milestone 03 The faithful port.

The alphabet is the one part of the port that is transcription rather than
reasoning: 69 glyphs, each a handful of coordinates. Transcribed by hand it
would be 69 chances to mistype a number, and a mistyped number in a glyph is
invisible until somebody sets the word that uses it.

So it is extracted rather than retyped. The prototype's glyph table is a
JavaScript object literal built from six small helpers. Evaluating that literal
with helpers that record structure instead of sampling gives the alphabet
exactly as the prototype holds it, with no transcription step to get wrong.

It also fixes something the prototype could not. There, an arc inside a glyph is
sampled into points at the moment the table is built, using the amplitude and
the rotation in force at that instant. The table is rebuilt on every change for
exactly that reason. In the port an arc stays an arc, and the glyph stops
depending on the parameters.

## What Changes

- Add the grid metrics as named constants.
- Extract the 69 glyphs from the prototype, with arcs kept as centre, radii and
  angles rather than as points somebody already sampled.
- Add a glyph set as a registered module, with a notdef fallback for a character
  nobody drew.
- Validate a glyph set on registration, so a malformed glyph is refused where it
  is added rather than where it is drawn.
- Keep the extractor, and a test that re-runs it and compares, so the alphabet
  cannot drift from the prototype it came from.

## Capabilities

### Modified Capabilities

- `glyph-skeletons`: the alphabet is extracted rather than transcribed, and a
  glyph set is validated when it is registered.

### New Capabilities

<!-- none -->

## Impact

- New: `packages/core/src/glyph/`, `scripts/extract-glyphs.mjs`.
- The extractor runs against the frozen prototype, so it is reproducible. The
  digest check already fails first if the prototype moves.
- The extracted alphabet is committed as source, not generated at build time. A
  generated file nobody can read is worse than a long one they can.
