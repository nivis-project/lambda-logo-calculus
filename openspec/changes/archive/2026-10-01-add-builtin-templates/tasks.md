## 1. Rose

- [x] 1.1 Register the rose: `r = A + cos(k theta)`, amplitude 1 to 20, lobes 2
  to 12, symmetry equal to the lobe count. Verify its radius matches the
  trefoil's at `k` of 3 for the same amplitude, at every sampled angle.
- [x] 1.2 Property test: the rose's curve repeats every full turn over `k`, for
  random amplitude, lobe count and angle.

## 2. Superellipse

- [x] 2.1 Register the superellipse as a polar template solving
  `abs(x/a)^n + abs(y/b)^n = 1` for the radius at each angle, with `a`, `b` and
  the exponent `n` as parameters. Verify it gives a circle at `a` equal to `b`
  and `n` of 2, and approaches a rectangle at a high exponent.
- [x] 2.2 Declare its safety limit on the exponent and verify a value below it
  is raised with a warning naming the limit.

## 3. Supershape

- [x] 3.1 Register the Gielis supershape with `m`, `n1`, `n2`, `n3`, `a` and
  `b`. Verify it reduces to a circle at the parameters that make it one.
- [x] 3.2 Verify its maximum radius is found by sampling, and that its samples
  still fill the unit disc after normalisation.
- [x] 3.3 Declare its safety limits and verify a degenerate parameter set is
  caught rather than producing a non-finite radius.

## 4. Rounded polygon

- [x] 4.1 Register the rounded polygon with sides, corner radius and star depth.
  Verify three sides gives a triangle-like curve with three-fold symmetry and
  that the sides parameter sets the declared symmetry.
- [x] 4.2 Verify a star depth of zero gives a convex polygon and a positive
  depth gives a star.

## 5. The set

- [x] 5.1 Export all five from `packages/templates` and verify the registry
  accepts every one of them.
- [x] 5.2 Property test: every template declaring a symmetry actually has it,
  for random parameters within each template's own ranges.
- [x] 5.3 Property test: every template sampled at random parameters produces
  only finite points, none beyond radius 1 after normalisation.
- [x] 5.4 Verify every template produces no safety warning at its defaults.

## 6. Snapshots

- [x] 6.1 Extend the golden snapshot suite to every built-in template. Verify
  each is deterministic across runs.
- [x] 6.2 Verify the suite fails when any template's output moves.

## 7. Verification

- [x] 7.1 Verify `packages/core` coverage is at or above 80%.
- [x] 7.2 Verify `nix flake check` is green.
