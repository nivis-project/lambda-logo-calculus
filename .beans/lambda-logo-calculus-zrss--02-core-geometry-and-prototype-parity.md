---
# lambda-logo-calculus-zrss
title: 02 Core geometry and prototype parity
status: completed
type: milestone
priority: normal
created_at: 2026-09-30T22:01:03Z
updated_at: 2026-10-01T06:17:04Z
---

Port the prototype's mathematics into a pure, framework-free core and prove the
port reproduces the original. Nothing in this milestone improves on the
prototype; it only moves it onto a structure that can be extended.

Covers pipeline steps 1 to 9 for the single trefoil template: shape template,
nesting, glyph set, skeleton stages, stroker, endings and joins, style, layout
and scene graph, plus the first renderer.

## Gate

The ported core renders the default settings to a scene graph that matches
`reference/trefoil-type.html` within the agreed tolerance, and the known-value
and property tests in `docs/testing-strategy.md` are green.

## Summary of Changes

All seven epics completed and shipped. The gate is met, with a number attached.

- Parameter definitions, registries and seeded random
  (`2026-10-01-add-param-defs-and-registries`)
- Shape template interface, trefoil and nesting math
  (`2026-10-01-add-shape-template-and-nesting`)
- Glyph skeletons and grid metrics (`2026-10-01-add-glyph-skeletons`)
- Skeleton stages (`2026-10-01-add-skeleton-stages`)
- Stroker, nine endings and looped joins (`2026-10-01-add-stroker-endings-joins`)
- Style, layout, scene graph and SVG renderer
  (`2026-10-01-add-scene-graph-and-renderer`)
- Prototype parity harness and golden snapshots (`2026-10-01-add-parity-harness`)

**Parity: the worst difference across fifteen settings is 0.006953 font units.**
The prototype rounds its output to two decimals, which puts a floor of 0.007071
on any comparison against it. The port and the prototype agree exactly; what
remains is the prototype's own rounding.

270 tests. `packages/core` at 94% statements and 82% branches, both above their
thresholds. Nine capabilities now have main specs.

The pipeline runs end to end: parameters in at the top, a wordmark on screen at
the bottom, drawn with the trefoil as the pen.

Four things were found by building rather than by planning, and each is recorded
in the epic that found it:

- ADR 0002 had the core and templates dependency pointing the wrong way. A
  template implements an interface the core defines, so the direction had to
  reverse. ADR 0008 supersedes it; 0002 is marked, not rewritten.
- A disabled stage does not always mean "pass through". Curves disabled must
  still sample arcs and Bowls disabled must still build an ellipse, or a
  disabled stage deletes the glyph.
- Run splitting at turns over 25 degrees was declared as a parameter in the
  stages epic and never implemented. Nothing noticed until the parity harness
  compared a multi-run glyph.
- Rings were closed by relying on trig symmetry at 0 and 2 pi, which a property
  test caught intermittently. They are now closed by construction.

Milestone 03 can start. The prototype stops being authoritative from here; the
golden snapshots are the baseline.
