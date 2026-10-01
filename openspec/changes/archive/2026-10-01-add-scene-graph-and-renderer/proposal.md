## Why

Epic [lambda-logo-calculus-5dnw](../../../.beans/lambda-logo-calculus-5dnw--style-layout-scene-graph-and-svg-renderer.md),
under milestone 02 Core geometry and prototype parity.

Outlines exist but nothing can see them. This epic finishes the pipeline:
colour, layout, the scene graph, and the first renderer.

It also removes the prototype's worst structural habit. Its `glyphLetter()`
builds SVG by concatenating strings into `innerHTML`, assigns mask ids from a
module-level counter that collides the moment two renders overlap, and mixes
layout into the same `render()` function that draws. None of that can be
exported, hit-tested or reused.

The scene graph is the boundary the brief puts at the centre of the
architecture: the core produces it, and renderers and exporters only read it.

## What Changes

- Add the scene graph: nodes carrying paths, fills, opacity, groups and
  transforms, as plain JSON-serialisable data with no renderer concepts in it.
- Add the palette registry and port all six schemes with the prototype's exact
  HSL formulas: monochrome, analogous, complementary, triadic, warm and cool.
- Add the style step: palette colour per copy, opacity per pass from the
  prototype's `min(1, 0.25 + alpha * 1.25)`.
- Add the layout step: advance widths, word spacing, line wrapping, and the side
  lockup that sizes the mark against the text block and enlarges it 6%
  optically.
- Add `packages/render-svg`: scene graph to SVG DOM, with ids the renderer
  assigns from its own counter so two renderers never collide.
- Keep masks out of the scene graph. The live preview may use them; the scene
  graph records a cut region as data so an exporter can cut a real hole.

## Capabilities

### New Capabilities

- `scene-graph`: what the core hands to a renderer, and the rules that keep it
  renderer-agnostic.
- `palette`: how a colour is chosen for a copy, and the six built-in schemes.
- `layout`: advance widths, wrapping, and placing the mark beside or above the
  text.

### Modified Capabilities

None.

## Impact

- New under `packages/core/src/scene`, `src/style` and `src/layout`.
- `packages/render-svg` gains its real contents and a DOM-based test, which is
  the first test in the workspace that needs a document. It runs under a DOM
  environment in Vitest, not in the core.
- Ids are assigned by the renderer, not by the core. Two mounted renderers on
  one page produce disjoint ids; the prototype's global counter could not.
- Mark placement needs the mark's real outline bounds, which the nesting result
  already provides. The 6% optical enlargement is kept exactly.
- After this epic the pipeline runs end to end for the first time: parameters in
  at the top, a scene graph out at the bottom, and SVG on a screen.
