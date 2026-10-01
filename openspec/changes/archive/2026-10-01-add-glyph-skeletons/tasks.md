## 1. Grid and primitives

- [x] 1.1 Define the grid metrics as data, matching the prototype's `G` object.
  Verify x-height 56, cap-height 86, descender -28, stroke width 10, side
  bearing 9, dot radius 7, word space 28 and line height 150.
- [x] 1.2 Define the skeleton primitives: `stroke` of segments, `bowl` with cut
  regions, `dot`. Define a segment as a `point` or a declarative `arc` with
  centre, radii and two angles in degrees. Verify each type-checks and that an
  arc carries no point list.
- [x] 1.3 Write the skeleton validator: reject a bowl with a non-positive
  radius, a stroke yielding fewer than two nodes, a dot with a non-positive
  radius, a non-finite coordinate, an arc spanning no angle, and a cut region
  that is not a rectangle. A point is one node and an arc is two, so a stroke of
  a single arc is valid. Verify each rejection names what is wrong, with a test
  per case, and verify the single-arc stroke is accepted.

## 2. The alphabet

- [x] 2.1 Port `a` to `z` with the prototype's exact coordinates and advance
  widths. Verify `o` is one bowl at 24, 28 with radii 24 and 28 and width 48,
  and that `p` runs from the x-height to -28.
- [x] 2.2 Port `A` to `Z`. Verify `O` is one bowl at 32, 43 with radii 32 and 43
  and width 64.
- [x] 2.3 Port `0` to `9` and the six punctuation marks. Verify `.` is a single
  dot and `?` carries both an arc-bearing stroke and a dot.
- [x] 2.4 Port the notdef glyph. Verify it exists and is a bowl.
- [x] 2.5 Verify the set has 69 entries: 26 plus 26 plus 10 plus 6 plus notdef.

## 3. The glyph set

- [x] 3.1 Build the glyph set registry over the module registry, validating
  every glyph at registration. Verify a set containing a bowl with a negative
  radius is rejected naming the character, and the same for a one-segment
  stroke.
- [x] 3.2 Implement the notdef fallback. Verify an undefined character returns
  the notdef and a defined one does not.
- [x] 3.3 Verify the built-in set registers cleanly and every one of its glyphs
  passes validation.

## 4. Invariants

- [x] 4.1 Property test: every built-in glyph has a finite advance width above
  zero, and every coordinate in every primitive is finite.
- [x] 4.2 Property test: reading any glyph twice returns identical data.
- [x] 4.3 Verify every glyph that should sit on the baseline declares a segment
  at y 0, and that no glyph exceeds the cap-height except the ones that
  deliberately do, naming those.

## 5. Verification

- [x] 5.1 Verify `packages/core` coverage is at or above 80%.
- [x] 5.2 Verify `nix flake check` is green.
