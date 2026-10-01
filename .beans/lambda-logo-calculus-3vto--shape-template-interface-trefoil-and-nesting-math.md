---
# lambda-logo-calculus-3vto
title: Shape template interface, trefoil and nesting math
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-10-01T05:20:22Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-gkcz
---

The `ShapeTemplate` interface and the trefoil as its first registration, with
the nesting mathematics ported from the prototype.

## Scope

- `ShapeTemplate` with `kind`, `radius`, `point`, `symmetry` and `safety`.
- Trefoil: `r(theta) = A + cos(3 theta)`, parameter A from 1 to 20.
- `perfectFit` as the numeric minimum over theta of `r(theta) / r(theta - phi)`,
  720 samples as in the prototype.
- `effectiveScale`: `s_i = perfectFit^(i (1 - 5 f))`.
- Memoisation keyed by template, parameters and rotation.
- Safety as per-template metadata, not hard-coded clamps: A at least 1.15,
  `perfectFit` at least 0.02, copy scale at most 1.6.

## Todo

- [x] Define the `ShapeTemplate` interface
- [x] Register the trefoil template
- [x] Implement `perfectFit` and `effectiveScale`
- [x] Move the prototype's clamps into template safety metadata with warnings
- [x] Memoise by template, parameters and rotation
- [x] Known values: `perfectFit` is 1 at rotation 0 and at 120 degrees
- [x] Known value: `effectiveScale` equals `perfectFit` at fit size 0

## Summary of Changes

The base curve is an interface with one implementation, and the prototype's
nesting mathematics is ported and pinned by tests. 105 tests across the
workspace.

- `ShapeTemplate` carries `kind` (`polar` or `parametric`), `radius` or `point`,
  an optional `symmetry` and its `safety` metadata. The template registry
  refuses a polar template with no `radius`, a parametric one with no `point`,
  and a non-integer symmetry, naming the template in each case.
- The trefoil is registered in `packages/templates`: `r = A + cos(3 theta)`,
  `A` from 1 to 20 default 3, symmetry 3. Its radius is 4 at theta 0, 2 at
  pi/3 and 4 at 2pi/3, and a property test confirms it repeats every 120 degrees
  for any theta and any amplitude.
- `sampleCurve` normalises by the curve's own maximum radius, so the trefoil's
  samples fill the unit disc exactly. It handles parametric templates by finding
  the maximum by sampling when none is declared.
- `perfectFit` is 1 at rotation 0 and 1 at 120 degrees, and lies strictly
  between 0 and 1 at the prototype's default of 24 degrees. It is checked
  against a transcription of the prototype's own loop and matches exactly, not
  within a tolerance.
- `effectiveScale(pf, fit)` equals `perfectFit` at fit size 0. Copy 0 is always
  unscaled, confirmed by a property test over random amplitudes and fit sizes.
- The four clamps the prototype applied silently are now template metadata, and
  `computeNesting` returns a warning per limit applied, naming the limit and
  both values. The prototype defaults produce no warning at all. A template with
  loose limits produces none either, which is how the test proves the numbers
  come from the template rather than the computation.
- `createPerfectFitMemo` is an LRU keyed by template id, version, parameters and
  rotation. An instrumented template proves a repeated question samples the curve
  zero further times, and a 500-step slider drag against a capacity of 16 leaves
  the memo at 16.

Not in the original plan, and the more important half. ADR 0002 had the
dependency between `packages/core` and `packages/templates` pointing the wrong
way. A shape template is not inert data: it implements an interface the core
defines, carries `ParamDef`s and is called by the core. Writing the first real
template made the two directions collide as an import cycle.

The direction is reversed. `packages/core` now has no workspace dependency at
all, `packages/templates` depends on it, and `apps/studio` creates the registry
and registers the built-ins. `docs/adr/0008-templates-depend-on-core.md`
supersedes that part of 0002, which is marked rather than rewritten, because the
reason it got this wrong (it was written before any package had contents) is
the useful part.

The smoke test now asserts a real `perfectFit` rendered by the studio, so the
end-to-end suite proves the ported mathematics reaches the screen.

Capability `shape-template` is a main spec with six requirements and nineteen
scenarios.

OpenSpec change archived as `2026-10-01-add-shape-template-and-nesting`.
