## Why

Epic [lambda-logo-calculus-lq1t](../../../.beans/lambda-logo-calculus-lq1t--built-in-templates-rose-superellipse-supershape-polygon.md),
under milestone 03 Templates and registries.

The `ShapeTemplate` interface has exactly one implementation, so nothing yet
proves it is an interface rather than a description of the trefoil. Four more
templates is the test.

The brief is explicit that the base curve stops being hard-coded and becomes
something a designer picks from a gallery. That only means anything once there
is something to pick between.

Each of the four also probes a different part of the interface. The rose
generalises the trefoil and exercises the symmetry setting. The superellipse and
the supershape are the first templates whose maximum radius is not a closed
form. The rounded polygon is the first whose parameters change its topology
rather than just its proportions.

## What Changes

- Register the rose: `r = A + cos(k theta)`, with lobes `k` from 2 to 12. The
  trefoil is the rose at `k` of 3, which is the point.
- Register the superellipse: `abs(x/a)^n + abs(y/b)^n = 1`, as a polar template
  solved for the radius at each angle.
- Register the supershape (Gielis) with its six parameters `m`, `n1`, `n2`,
  `n3`, `a` and `b`.
- Register the rounded polygon with sides, corner radius and star depth.
- Give each its own safety metadata rather than inheriting the trefoil's.
- Add a golden snapshot per template against "Hamburgefonstiv 0123".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shape-template`: the built-in set grows from one to five, each declaring its
  own symmetry and safety limits, and the registry gains a rule that a
  template's declared symmetry must match the curve it actually draws.

## Impact

- New under `packages/templates/src/shapes`: four modules, one per template.
- The trefoil stays as its own registration rather than becoming a preset of the
  rose. A project file stores a template id, and changing the trefoil's identity
  would break every file that names it. The relationship is recorded in a test
  instead.
- `maxRadius` is declared in closed form where one exists and left to sampling
  otherwise. The sampling path already exists and is already tested.
- Four more golden snapshots at roughly 800 KB each. They shrink when milestone
  06 adds curve fitting.
- Nesting for these templates still uses the polar route. Templates that are not
  star-shaped about their centre are the next epic's problem, and the rounded
  polygon with a deep star is the case that will need it.
