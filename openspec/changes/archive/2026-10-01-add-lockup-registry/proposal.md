## Why

Epic [lambda-logo-calculus-mvrv](../../../.beans/lambda-logo-calculus-mvrv--lockup-registry-side-and-stacked.md),
under milestone 05 Lockup, modulation and project files.

The studio shows three artboards and two of them are the same picture. The
horizontal and stacked lockups differ only in their caption, which milestone 04
recorded as a stated gap rather than pretending otherwise. This epic closes it.

A logo is a mark and a wordmark placed against each other. `layoutLockup`
already computes the mark scale, the gap and the line breaks, including the
switch to stacking when a word would otherwise break. What it does not do is
return positions a renderer can use, and nothing places the mark by its real
outline.

The brief is specific about that last point: the mark is placed by its outline,
not its bounding box, and enlarged 6% optically. A mark whose silhouette is a
trefoil has a lot of empty space in its box, and placing it by the box leaves a
visible hole.

## What Changes

- Add the `Lockup` interface and its registry, so a centred stack, a badge or a
  monogram is a registration later rather than an edit.
- Register the side lockup: mark left, wordmark right, with distance, height and
  size controls.
- Register the stacked lockup: mark above, wordmark below, centred.
- Compute the mark's real outline bounds from its scene rather than its viewBox,
  so the placement follows the silhouette.
- Return positions and sizes, never geometry, and build the artboard scenes from
  them.
- Keep the automatic switch to stacking when a side lockup would break a word.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `layout`: lockups become registered modules returning placements, the mark is
  measured by its outline rather than its box, and the result is enough to draw
  from.

## Impact

- New under `packages/core/src/layout`: the interface, the registry and the two
  built-ins.
- `layoutLockup` keeps its behaviour and gains a placement in its result. The
  existing tests for the scale, the gap and the stacking switch still hold.
- `apps/studio` builds three distinct artboards. The mark artboard keeps showing
  the mark alone; the other two now differ.
- Measuring the real outline means walking the mark's scene once per layout.
  That is cheap next to building the scene, and the memo for it belongs with the
  budget work in milestone 06.
