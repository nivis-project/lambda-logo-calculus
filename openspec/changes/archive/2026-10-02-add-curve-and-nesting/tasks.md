## 1. The template

- [x] 1.1 Define the shape template: id, version, label, parameters, a radius
  function and a symmetry. Verify the trefoil registers and is fetched by id.
- [x] 1.2 Sample a curve at a given number of points, and find its maximum
  radius. Verify the trefoil's maximum is `A + 1` and its minimum `A - 1`.

## 2. The fit

- [x] 2.1 Implement the fit search over 720 samples, skipping a denominator at
  or below 1e-9. Verify it returns 1 when nothing is finite.
- [x] 2.2 Pin the known values: the fit is 1 at no rotation and 1 at a third of
  a turn, because the curve has three-fold symmetry. Verify both to 9 decimals.
- [x] 2.3 Verify the fit against the prototype's own readouts, which the parity
  fixture records to three decimals, for every recorded setting.

## 3. The scale

- [x] 3.1 Implement the effective scale and the per-copy scales. Verify the
  effective scale equals the fit when the fit size is 0.
- [x] 3.2 Verify the effective scale and the smallest copy against the
  prototype's readouts in the fixture, for every recorded setting.

## 4. The floor and the report

- [x] 4.1 Apply the amplitude floor everywhere the curve is used. Verify the
  shape, the fit and the reshaping all use the floored value below 1.15.
- [x] 4.2 Report every limit that bound a value. Verify an unbound computation
  reports nothing, and that each of the four limits reports when it holds.
- [x] 4.3 Write ADR 0002 recording the decision and the alternatives, including
  what the prototype does and why it was not copied.

## 5. Verification

- [x] 5.1 Property test: the fit is between 0 and 1 for any amplitude and any
  rotation, and never NaN.
- [x] 5.2 Verify the gate is green and the core holds its coverage floor.
