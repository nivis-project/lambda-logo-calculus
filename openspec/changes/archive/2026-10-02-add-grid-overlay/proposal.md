## Why

Bean: `.beans/lambda-logo-calculus-i26n-the-grid-overlay.md`

A designer looking at a letter cannot tell whether its bowl sits on the
baseline or a hair above it, whether the x-height line moved when the fit size
slider moved, or how much air a character's advance leaves either side. The
prototype answers all three with four rules and a box per character, behind one
checkbox. The studio has no such thing.

The x-height rule carries most of the value, because the x-height is the one
metric the sliders move: the fit size reshapes it through the modulation, and
with nothing drawn there is no way to see that happen.

## What Changes

- A scene can carry guides: horizontal rules at the baseline, the x-height, the
  cap line and the descender, one set per line of text, and a box around each
  character's advance from the cap line to the descender.
- Guides are data in the scene, beside the artwork and not inside it, so an
  exporter builds a scene without them and never has to strip them out.
- The baseline is drawn solid and the other three dashed, and the first line's
  rules are labelled, as the prototype does.
- The x-height rule is drawn at the modulated x-height, so it follows the fit
  size rather than the grid's nominal value.
- The studio gets a "Show grid lines" switch, off when the page opens.

## Impact

- `packages/core/src/scene` - guides as data, built beside the letters.
- `packages/render-svg` - drawing a guide.
- `apps/studio` - the switch.
- `openspec/specs/scene-graph` - what a guide is and what a renderer does with
  one.
- `openspec/specs/studio-shell` - the switch.
