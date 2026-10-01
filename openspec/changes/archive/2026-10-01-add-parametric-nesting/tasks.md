## 1. Geometry predicates

- [x] 1.1 Write a point-in-polygon predicate. Verify a point inside a convex
  polygon, a point outside it, a point in the notch of a concave polygon, and a
  point on a vertex.
- [x] 1.2 Make the on-edge case stable rather than dependent on floating point
  noise, and verify it with a point placed exactly on an edge.
- [x] 1.3 Write polygon containment over the predicate, and verify a polygon
  wholly inside, wholly outside and partly overlapping.

## 2. Validation

- [x] 2.1 Write curve validation reporting closure, non-negativity and
  star-shapedness as separate findings rather than one boolean. Verify the
  trefoil reports all three as satisfied.
- [x] 2.2 Verify a curve with a negative radius is reported, naming an angle
  where it fails.
- [x] 2.3 Verify a parametric curve that doubles back is reported as not
  star-shaped, and one whose ends are far apart as not closed.

## 3. Parametric nesting

- [x] 3.1 Implement the binary search for the largest scale at which the rotated
  copy fits inside its parent. Verify the copy fits at the returned scale and
  does not fit slightly above it.
- [x] 3.2 Verify a rotation of zero returns 1.
- [x] 3.3 Property test: the search terminates and returns a finite value
  between 0 and 1, for random curves and rotations.

## 4. Route selection

- [x] 4.1 Choose the polar route when validation says star-shaped and the
  parametric route otherwise, and report which was taken with a reason.
- [x] 4.2 Verify the trefoil takes the polar route and its `perfectFit` is
  unchanged from the polar computation alone.
- [x] 4.3 Verify a non star-shaped curve takes the parametric route and carries
  a reason.
- [x] 4.4 Verify the reason travels alongside the safety warnings.

## 5. Memoisation

- [x] 5.1 Extend the memo to the parametric route, keyed identically. Verify a
  repeat does not resample, by counting calls through an instrumented template.

## 6. No regression

- [x] 6.1 Verify the parity recording still matches, so no polar result moved.
- [x] 6.2 Verify every golden snapshot is unchanged.
- [x] 6.3 Verify `packages/core` coverage is at or above 80% and
  `nix flake check` is green.
