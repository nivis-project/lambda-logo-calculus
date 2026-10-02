## 1. The group

- [x] 1.1 Let a group carry an opacity and a fill. Verify both reach the
  rendered output and that a group without them is unchanged.
- [x] 1.2 Put the pass opacity on the pass group and take it off the paths.
  Verify a pass group carries it and its paths do not.

## 2. Proving it

- [x] 2.1 Verify the mark's copies still carry their own opacity, since each is
  a separate pass meant to blend with the others.
- [x] 2.2 Verify the gate, the browser suite and parity are all still green.
