---
# lambda-logo-calculus-5dnw
title: Style, layout, scene graph and SVG renderer
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-09-30T22:03:17Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-50a9
---

The end of the pipeline: style, layout and the scene graph, plus the first
renderer. Replaces the prototype's string-built SVG and its global mask counter.

## Scope

- Style: the six palettes, opacity and blend per pass, behind a palette
  registry.
- Layout: line wrapping and mark placement by the mark's real outline with the
  6% optical enlargement, as a lockup registration.
- Scene graph: paths, fills, opacity, groups and transforms, as plain data.
- `packages/render-svg`: scene graph to SVG DOM, with stable ids assigned by the
  renderer. Masks are allowed in the live preview only.
- Nothing downstream of the scene graph reaches back into the core.

## Todo

- [ ] Define the scene graph types
- [ ] Port the six palettes behind a palette registry
- [ ] Port line wrapping and mark placement as the first lockup
- [ ] Implement the SVG DOM renderer with stable ids
- [ ] Test that the renderer only reads the scene graph
