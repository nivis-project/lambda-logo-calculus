## 1. The interface

- [x] 1.1 Define `ShapeTemplate` with `kind`, `radius`, `point`, `symmetry` and
  `safety`, extending `Registered`. Verify a polar and a parametric template
  both type-check.
- [x] 1.2 Create the template registry and reject a polar template with no
  `radius` and a parametric one with no `point`. Verify each rejection names the
  template.

## 2. The trefoil

- [x] 2.1 Register the trefoil in `packages/templates`: `r = A + cos(3 theta)`,
  parameter `A` from 1 to 20 default 3, symmetry 3. Verify its radius is 4 at
  theta 0, 2 at theta pi/3 and 4 at theta 2pi/3 with `A` of 3.
- [x] 2.2 Property test: the trefoil radius at theta equals its radius at
  theta plus 2pi/3, for random theta and random `A`.
- [x] 2.3 Declare the trefoil's safety limits: minimum `A` 1.15, minimum
  `perfectFit` 0.02, maximum effective scale 1.5, maximum copy scale 1.6.
  Verify they are readable from the registered template.

## 3. Sampling

- [x] 3.1 Write `sampleCurve(template, params, count)` returning points
  normalised by the curve's maximum radius, each carrying its angle. Verify 144
  samples of the trefoil give 144 points, none beyond radius 1, with at least
  one at radius 1.
- [x] 3.2 Verify sampling the same template and parameters twice gives identical
  results.
- [x] 3.3 Property test: for random `A` and random sample counts, every sampled
  point is finite and no radius exceeds 1.

## 4. Nesting

- [x] 4.1 Write `perfectFit`, sampling 720 angles, skipping a denominator at or
  below zero, never returning below zero, and returning 1 when nothing is
  finite. Verify it is 1 at rotation 0 and 1 at 120 degrees for the trefoil.
- [x] 4.2 Verify `perfectFit` at 24 degrees with `A` of 3 lies strictly between
  0 and 1, and matches the prototype's value for those settings.
- [x] 4.3 Write `effectiveScale(pf, fit)` as `pf^(1 - 5 fit)`. Verify it equals
  `perfectFit` at fit size 0.
- [x] 4.4 Write the per-copy scale as `effectiveScale^i`. Verify copy 0 is
  always 1.
- [x] 4.5 Property test: for random parameters within every safety limit, copy
  `i + 1` never has a larger radius than copy `i` at any sampled angle.

## 5. Safety as data

- [x] 5.1 Apply the template's declared limits in the nesting computation and
  return a warning per limit applied, naming the limit and both values. Verify
  `A` of 0.5 uses 1.15 and warns with both numbers.
- [x] 5.2 Verify a copy scale driven above 1.6 is capped and warned about.
- [x] 5.3 Verify the prototype's defaults (`A` 3, 6 copies, 24 degrees, fit 0)
  produce no warning at all.
- [x] 5.4 Verify no clamp constant appears in the nesting code itself; every one
  is read from the template's safety metadata.

## 6. Memoisation

- [x] 6.1 Memoise `perfectFit` by template id, version, parameters and rotation.
  Verify a repeated question returns an identical result and samples the curve
  only once, by counting calls through an instrumented template.
- [x] 6.2 Verify a changed parameter produces a fresh result rather than the
  cached one.
- [x] 6.3 Verify the memo is bounded, so a long session dragging a slider cannot
  grow it without limit.

## 7. Dependency direction

- [x] 7.1 Reverse the dependency so `packages/templates` depends on
  `packages/core` and the core depends on no workspace package. Verify
  `pnpm build` succeeds and that `packages/core/package.json` has no
  `dependencies` field.
- [x] 7.2 Move registration of the built-in templates into `apps/studio`.
  Verify the studio renders the registered count and a computed `perfectFit`,
  and that the end-to-end test asserts both.
- [x] 7.3 Write `docs/adr/0008-templates-depend-on-core.md` and mark ADR 0002 as
  partly superseded rather than editing its decision. Verify 0002 still states
  what it originally decided, with the correction marked.

## 8. Verification

- [x] 8.1 Verify `packages/core` coverage is at or above 80%.
- [x] 8.2 Verify `nix flake check` is green.
