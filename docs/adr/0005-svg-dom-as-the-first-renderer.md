# 0005. SVG DOM as the first renderer, behind a renderer interface

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-repository-documents`

## Context

The core produces a scene graph: paths, fills, opacity, groups and transforms,
as plain data. Something has to put that on a screen.

The prototype built SVG as strings into `innerHTML`, with mask ids drawn from a
global counter. That works and it is what the designer has been looking at, so
it is the known-good baseline. It also cannot be hit-tested, cannot reuse
anything, and produces ids that collide the moment two renders overlap.

Two requirements pull in different directions. Exports must match the screen
exactly, which favours rendering the same way for both. And a 20-character
wordmark at 12 copies must re-render under 16 ms while a slider is dragged,
which at 240 glyph instances is where SVG DOM starts to be doubted.

`docs/briefing.md` suggests SVG DOM first and a Canvas or WebGL renderer behind
the same interface when profiling shows it is needed.

## Decision

`packages/render-svg` renders the scene graph to SVG DOM, with stable ids the
renderer assigns. It is the first and, for the first release, the only renderer.

It sits behind a `Renderer` interface (`mount`, `draw`, optional `hitTest`) so a
Canvas 2D or WebGL renderer can be added later without the core, the store or
the exporters knowing.

Masks are allowed in the live preview only. Exports cut counters as real holes
through boolean path operations, because masks fail in some tools and cannot be
edited afterwards.

## Consequences

Export fidelity is close to free. The SVG exporter and the live preview read the
same scene graph and produce the same geometry, so "matches the screen exactly"
is the default rather than something to chase.

Hit-testing a letter to open its per-glyph overrides is a DOM event on a real
element, not a geometric search. Overlay layers (grid, skeletons, nib shape,
outline bounds, optical box) are groups that can be toggled.

Real DOM nodes also mean the browser handles antialiasing, zoom and text
rendering at the quality a designer expects, which a Canvas renderer would have
to reproduce.

The risk is the 16 ms budget. 240 glyph instances with several passes each is
plausibly thousands of DOM nodes, and SVG DOM has no good answer if it becomes
too many. The mitigations planned are coarser curve sampling while dragging,
per-glyph caching keyed by a parameter hash, and moving the expensive
computations into a worker. If all of those are not enough, the renderer
interface is the escape hatch, and adding a Canvas renderer is the milestone 06
answer rather than a redesign.

Stable ids assigned by the renderer remove the prototype's global counter. Two
renderers or two mounted instances no longer collide.

## Alternatives considered

**Canvas 2D from the start.** Faster with many shapes and no DOM node explosion.
Rejected: no hit-testing without reimplementing it, no free overlay toggling,
and an export path that has to reproduce the canvas rendering rather than share
it. Speed is a problem to solve if it appears; fidelity is a requirement from
the start.

**WebGL, through PixiJS or regl.** Fastest by a wide margin, and 240 glyph
instances would not be a concern. Rejected as premature: a large dependency and
a shader pipeline to debug, for a budget that has not yet been shown to be a
problem. It stays behind the same interface as the Canvas option.

**Keep the prototype's string-built SVG.** Zero porting risk, since it is
literally the baseline. Rejected: no hit-testing, no reuse, colliding ids, and
string concatenation as a rendering strategy is where the prototype's structural
problems live.

**Render twice, Canvas for the preview and SVG for export.** Speed and fidelity
both. Rejected: two renderers is two sets of bugs and a permanent risk of the
preview and the export disagreeing, which is the one thing that must never
happen.
