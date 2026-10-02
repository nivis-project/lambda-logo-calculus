## 1. Reading

- [x] 1.1 Read `reference/trefoil-type.html` end to end. Verify by listing every
  function it defines and accounting for each one in a spec.
- [x] 1.2 Compare the prototype's own notes under "How the letters are built"
  against its code. Verify each claim, and record any disagreement with the code
  as authoritative.

## 2. The descriptions

- [x] 2.1 Write `specs/parameters/spec.md`: every control with its range, step
  and default, the switches, the locks and the randomize ranges. Verify every
  number against the markup and the script.
- [x] 2.2 Write `specs/shape-and-nesting/spec.md`: the curve, the fit search,
  the effective scale and the copies. Verify the sample counts and the formulas
  against the code.
- [x] 2.3 Write `specs/glyph-skeletons/spec.md`: the grid, the alphabet, and the
  four reshaping stages. Verify the grid numbers and the glyph count.
- [x] 2.4 Write `specs/stroking/spec.md`: the pen, run splitting, free ends, the
  nine endings in both forms, and the looped join. Verify each ending against
  its branch in the code.
- [x] 2.5 Write `specs/layout-and-lockup/spec.md`: advances, wrapping, the mark
  placement, the palettes and the overlays. Verify the six palette formulas.

## 3. The couplings and the clamps

- [x] 3.1 Name every hidden coupling: what drives what, and by what arithmetic.
  Verify the list covers the amplitude to letter width, the fit size to
  x-height, the amplitude to bend, taper and flare, the rotation to the angled
  cut, and the transparency to its three opacities.
- [x] 3.2 Name every clamp with its value and what it bounds. Verify the list
  covers all of them: the amplitude floor, the perfect fit floor, the effective
  scale ceiling, the copy scale ceiling, the arc multiplier bounds, the bowl
  radial floor, the loop radial floor, and the x-height ceiling.
- [x] 3.3 Record the two defects found by reading: the amplitude floor that
  reaches the letters and not the shape, and the dependence of the rendered
  geometry on the container width. Verify each is written as what the prototype
  does, with the decision left to milestone 03.

## 4. Verification

- [x] 4.1 Verify every formula quoted in the specs appears in the prototype, by
  searching for it.
- [x] 4.2 Verify `openspec validate --strict` passes and `nix flake check` is
  green.
