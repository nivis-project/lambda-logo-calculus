---
# lambda-logo-calculus-lq1t
title: 'Built-in templates: rose, superellipse, supershape, polygon'
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T06:56:47Z
parent: lambda-logo-calculus-eihe
blocked_by:
    - lambda-logo-calculus-kiee
---

Four more built-in templates registered against the same `ShapeTemplate`
interface the trefoil uses, proving the interface is general.

## Scope

- Rose: `r = A + cos(k theta)`, parameters A and lobes k from 2 to 12. Tests the
  symmetry setting.
- Superellipse: `abs(x/a)^n + abs(y/b)^n = 1`, parameters a, b, n.
- Supershape (Gielis): parameters m, n1, n2, n3, a, b.
- Rounded polygon: parameters sides, corner radius, star depth.
- Each declares its own safety metadata and parameter definitions.

## Todo

- [x] Register the rose template
- [x] Register the superellipse template
- [x] Register the supershape template
- [x] Register the rounded polygon template
- [x] Safety metadata and warnings per template
- [x] Golden snapshot per template against "Hamburgefonstiv 0123"

## Summary of Changes

The `ShapeTemplate` interface now has five implementations, which is what turns
it from a description of the trefoil into an interface. 296 tests.

- **Rose**: `r = A + cos(k theta)`, lobes 2 to 12. Proven identical to the
  trefoil at `k` of 3, at every sampled angle across four amplitudes, and a
  property test confirms it repeats its lobe count in a full turn.
- **Superellipse**: solved for the radius at each angle. A circle at equal radii
  and an exponent of 2, approaching a square at 12, stretching correctly with
  its width and height.
- **Supershape**: the full Gielis formula with six parameters. Reduces to a
  circle at the parameters that make it one, has no closed-form maximum radius
  so it takes the sampling path, and a property test over 200 random parameter
  sets confirms it never returns a non-finite radius.
- **Rounded polygon**: sides, corner radius and star depth, with symmetry taken
  from the side count.

Each declares its own safety limits rather than inheriting the trefoil's. The
superellipse guards its squareness exponent, the supershape its pinch. Every
template produces no warning at its defaults.

The trefoil stays a separate registration rather than becoming a rose preset. A
project file stores a template id, and changing what `trefoil` means would break
every file naming it. The relationship is a test instead.

Two things the work required:

- The interface gained `symmetryFor(params)`, because the rose's symmetry is its
  lobe count and the polygon's is its side count. A template declaring both a
  fixed symmetry and a function is now rejected. The Bend stage reads the
  computed form.
- My first star formula shrank the polygon's vertices instead of pulling in its
  edge midpoints, which is backwards. A test comparing the point-to-edge ratio
  against the convex case caught it.

Golden snapshots now cover all five templates. They were 5.7 MB; rounding to two
decimals barely helped, because the bulk is point count rather than precision.
They are now rendered at two copies rather than six, which brings them to 1.7 MB.
A geometry regression shows identically at two copies as at six, since every
stage runs the same way for each. Verified that each of the five still fails
when its output moves.

Capability `shape-template` gained five requirements and fifteen scenarios.

OpenSpec change archived as `2026-10-01-add-builtin-templates`.
