## Why

Epic [lambda-logo-calculus-gt9k](../../../.beans/lambda-logo-calculus-gt9k--the-stroker-the-endings-and-the-looped-join.md),
under milestone 03 The faithful port.

Up to here a letter is a line with no width. This is where it gets some.

The interesting part is that the pen is the same curve the mark is drawn from.
Copy `i` of the nested stack, scaled down, is the pen for pass `i`, so the
thickness of a stroke in a given direction is the shape's own reach in that
direction. That is the whole idea the prototype is built on, and it is three
lines of code buried in a function that also does eight other things.

## What Changes

- Add the pen as a support table: how far it reaches in each of 360 directions.
- Offset a run by looking the support up at its normal, on each side, so an
  asymmetric pen makes one side thicker than the other.
- Split a stroke into runs at its corners, and know which ends are free.
- Add the nine endings, each in a shape-built form and a plain one.
- Add the looped join, and carry the corners a join needs from where they can
  still be measured.

## Capabilities

### Modified Capabilities

- `stroking`: the pen, the runs, the free ends, the endings and the join, as
  described in milestone 02.
- `glyph-skeletons`: the working skeleton carries the corners a join needs,
  because they can only be measured before the bend stage smooths them.

### New Capabilities

<!-- none -->

## Impact

- New: `packages/core/src/stroke/`.
- The working skeleton gains a corner list. The prototype measures corners on
  the sampled stroke before it is bent, and a corner measured after bending
  would give a different bisector, so the measurement has to happen where the
  prototype does it.
- Nothing is laid out or coloured yet. A stroked glyph is still a set of
  contours at the origin.
