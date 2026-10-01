## Why

Epic [lambda-logo-calculus-4ht4](../../../.beans/lambda-logo-calculus-4ht4--brand-sheet-exporter.md),
under milestone 06 Export, brand sheet and performance.

A designer who exports an SVG has a logo. A client who receives one has a file
and no idea how to use it. The brief asks for the sheet that answers the
questions a logo always raises on the other end: what the mark is on its own,
how it sits beside and above the words, how much space to leave around it, and
what the colours are.

It is one more exporter, not a new kind of thing. What it needs that the studio
does not yet have is a way to put several scenes on one page, and a way to write
a word on that page.

## What Changes

- Add a text node to the scene graph. A sheet with unlabelled swatches is a sheet
  nobody can use, and the renderers already read every other node from the same
  data.
- Add a composition layer that places several scenes on one page at chosen
  positions and sizes, returning one scene.
- Compute the clear space from the mark's drawn outline rather than from the box
  it was rendered into, and draw it as a frame around the mark.
- Render the palette as swatches, each labelled with the colour it holds.
- Register the brand sheet as one more exporter, so it writes through the same
  interface as SVG, PNG and PDF, and snapshot one.

## Capabilities

### New Capabilities

- `brand-sheet`: what the sheet holds, how it is laid out, how clear space is
  computed, and what a swatch shows.

### Modified Capabilities

- `scene-graph`: a text node, with a position, a size, a colour and a string.
  Composing one scene into another at a position and a scale.
- `exporters`: the SVG and PDF exporters write text. The PDF uses a standard
  font rather than embedding one.

## Impact

- New under `packages/export/src`.
- Text is deliberately the smallest node that can carry a label: a position, a
  size, a fill and a string, anchored at its start. No anchor, no alignment, no
  wrapping. A PDF has no text anchor without font metrics, and a sheet that
  renders differently in SVG and PDF is worse than one that only left-aligns.
- The sheet composes the scenes the studio already builds, so it cannot drift
  from what is on screen: there is no second layout path.
- Clear space is a fraction of the mark's own height, taken from the geometry it
  draws. A trefoil's empty corners would otherwise make the rule generous on two
  sides and tight on the others.
