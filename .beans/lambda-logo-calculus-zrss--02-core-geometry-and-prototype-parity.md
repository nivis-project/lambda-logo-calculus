---
# lambda-logo-calculus-zrss
title: 02 Core geometry and prototype parity
status: todo
type: milestone
created_at: 2026-09-30T22:01:03Z
updated_at: 2026-09-30T22:01:03Z
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
