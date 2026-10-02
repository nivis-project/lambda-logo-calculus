## 1. The renderer

- [x] 1.1 Carry the accumulated scale through the walk, taking the larger of a
  group's two axes.
- [x] 1.2 Choose each path's decimals from that scale, so the error in root
  space matches what two decimals gives at scale 1.
- [x] 1.3 Leave a path at scale 1 exactly as it was, mirroring included.

## 2. Verification

- [x] 2.1 Unit test: a contour in a scaled group keeps the decimals the scale
  asks for, and the same contour at scale 1 is unchanged.
- [x] 2.2 Unit test: a rendered coordinate, multiplied back by its group's
  scale, is within the root-space bound of the coordinate it came from.
- [x] 2.3 Verify the parity comparison and the gate are green, and that the
  browser suite still passes.
