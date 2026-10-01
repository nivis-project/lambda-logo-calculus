## 1. The pen

- [x] 1.1 Build the 360-entry support table with a round pen and a shape pen.
  Verify a round pen for stroke width 10 has every entry at 5, and that a shape
  pen from the trefoil varies with direction and never goes below zero.
- [x] 1.2 Write the direction lookup, rounding to the nearest degree and
  wrapping. Verify 361, -1 and radian angles all resolve to the right entry.
- [x] 1.3 Property test: for any angle, the lookup returns an entry from the
  table.

## 2. The stroker

- [x] 2.1 Offset each run point along its normal by the pen's support in that
  direction, left and right, and close the outline. Verify a vertical run
  stroked by a round pen gives a rectangle of the expected width and height.
- [x] 2.2 Stroke a closed ring into an outer and an inner contour. Verify a
  stroked ring yields two contours and the counter stays open.
- [x] 2.3 Verify a run of fewer than two points produces no outline.
- [x] 2.4 Property test: every outline closes and contains no NaN, for random
  runs and both pens.

## 3. The width profile

- [x] 3.1 Accept a per-point width factor in the stroker and multiply the
  support by it. Verify the unprofiled factor of 1 leaves the outline unchanged.
- [x] 3.2 Implement the taper profile over the prototype's taper length. Verify
  a free end is narrower than the middle and a non-free end is not narrowed.
- [x] 3.3 Implement the flare profile over the prototype's flare length. Verify
  a free end is wider than the middle.
- [x] 3.4 Property test: the width factor never reaches zero, for any
  parameters.

## 4. Endings

- [x] 4.1 Define the `Ending` interface and the endings registry, returning
  geometry and never markup. Verify an ending's result contains no string.
- [x] 4.2 Register round, flat and angled, in plain and shape-built form. Verify
  flat adds no geometry and that the angled cut turns with the copy rotation in
  shape-built form.
- [x] 4.3 Register tapered and flared, which delegate to the width profile.
  Verify they add no extra outline of their own in plain form.
- [x] 4.4 Register wedge, slab and hairline. Verify a serif on a mostly vertical
  end lies flat and one on a mostly horizontal end stands upright.
- [x] 4.5 Register ball. Verify it produces geometry on a curved run and nothing
  on a straight one.
- [x] 4.6 Verify all nine are registered, and that each differs between its
  plain and its shape-built form.

## 5. Joins

- [x] 5.1 Detect corners where a run turns by more than the threshold,
  defaulting to 50 degrees, and compute the bisector. Verify a sharp corner is
  detected and a shallow one is not.
- [x] 5.2 Register the looped join: a ring of the base curve on the bisector at
  the loop radius, defaulting to 11. Verify the radius varies with the base
  curve with a floor of 0.35, and is a plain circle when that behaviour is off.
- [x] 5.3 Property test: a loop ring closes, encloses an area above zero, and
  contains no NaN.

## 6. One pipeline

- [x] 6.1 Produce outlines for a glyph through one path, with the style chosen
  afterwards. Verify letter style and ornament style come from the same stroker
  and endings output.
- [x] 6.2 Verify no second code path exists for ornaments, by inspection and by
  a test that both styles share their geometry.

## 7. Verification

- [x] 7.1 Run the whole pipeline over all 69 glyphs with both pens and every
  ending. Verify no NaN, no empty outline and no unclosed contour.
- [x] 7.2 Verify `packages/core` coverage is at or above 80%.
- [x] 7.3 Verify `nix flake check` is green.
