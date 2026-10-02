## 1. The grid

- [x] 1.1 Add the grid metrics as named constants. Verify each against the
  prototype: stroke width 10, x-height 56, cap height 86, descender -28, side
  bearing 9, terminal 8, dot radius 7, word space 28, line height 150.

## 2. The alphabet

- [x] 2.1 Write `scripts/extract-glyphs.mjs`, evaluating the prototype's glyph
  table with recording helpers. Verify it yields 69 glyphs.
- [x] 2.2 Emit the alphabet as readable TypeScript source and commit it. Verify
  it type-checks and that arcs are present as arcs.
- [x] 2.3 Add a test that re-runs the extraction and compares. Verify it fails
  on a hand-edited coordinate.

## 3. The glyph set

- [x] 3.1 Define a glyph as an advance and a list of parts: strokes of points
  and arcs, bowls with cut regions, and dots. Verify each kind round-trips.
- [x] 3.2 Register a glyph set, validating every glyph. Verify a set without a
  notdef is refused, and that each malformed case is refused with the character
  named.
- [x] 3.3 Fall back to notdef for an unknown character. Verify nothing throws.

## 4. Verification

- [x] 4.1 Verify no glyph depends on the amplitude, the rotation or any switch,
  by checking the alphabet holds no function and no parameter reference.
- [x] 4.2 Verify the gate is green and the core holds its coverage floor.
