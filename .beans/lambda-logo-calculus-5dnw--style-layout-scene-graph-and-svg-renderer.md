---
# lambda-logo-calculus-5dnw
title: Style, layout, scene graph and SVG renderer
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-10-01T05:54:31Z
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

- [x] Define the scene graph types
- [x] Port the six palettes behind a palette registry
- [x] Port line wrapping and mark placement as the first lockup
- [x] Implement the SVG DOM renderer with stable ids
- [x] Test that the renderer only reads the scene graph

## Summary of Changes

The pipeline runs end to end for the first time. 256 tests; core at 94%
statements and 82% branches.

- The scene graph is plain data: a `path` with contours and a style, a `group`
  with children and an optional transform. It round-trips through JSON
  unchanged and carries no element reference, no renderer id and no mask.
- All six palettes ported with the prototype's HSL formulas and a base hue of
  322, checked against hand-computed values. A count of one does not divide by
  zero. A property test confirms every hue stays in range for any index and
  count.
- Opacity per pass is the prototype's `min(1, 0.25 + alpha * 1.25)`.
- Layout: advances with the word space and both side bearings, string width,
  wrapping that breaks mid-word only when it must and reports when it did, and
  the side lockup that sizes the mark against the text block height times 1.06
  and iterates until the line count settles. It switches to a stacked lockup
  when a side lockup would break a word. A layout result carries positions and
  no path data, asserted by its own key list.
- `packages/render-svg` maps a scene to SVG DOM. Its tests build a scene by hand
  and import nothing from the core, which is how the "a renderer only reads the
  scene" requirement is actually proved rather than asserted. Ids come from a
  per-instance counter, so two renderers produce disjoint ids and a redraw
  leaves none behind.
- `buildScene` joins everything: glyph set, stages, stroker, endings, joins,
  palette, advances. The studio now renders "Trefoil Type 26" at six copies with
  the trefoil as the pen, and the end-to-end test asserts 78 real paths with no
  NaN.

Two things found by looking at the output rather than at a test:

- The first render came out upside down. Glyph geometry is in font units with y
  growing up from the baseline; SVG grows down. The flip is now an ordinary
  `scale(1, -1)` transform on the scene's root group, so the renderer needs no
  knowledge of font conventions and any future renderer gets it for free. The
  spec gained a requirement for it.
- `environmentMatchGlobs` no longer exists in Vitest 5. The renderer tests run
  under happy-dom through a test project instead, which keeps the core tests
  running with no DOM, as the boundary requires.

Three capabilities now have main specs: `scene-graph` (five requirements, ten
scenarios), `palette` (two requirements, eight scenarios) and `layout` (four
requirements, fifteen scenarios).

OpenSpec change archived as `2026-10-01-add-scene-graph-and-renderer`.
