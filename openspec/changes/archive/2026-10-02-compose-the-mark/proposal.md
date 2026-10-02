## Why

Epic [lambda-logo-calculus-985x](../../../.beans/lambda-logo-calculus-985x--the-mark-composed-into-the-scene.md),
under milestone 04 The studio.

`layoutLockup` works out where the mark goes, at what size, and whether it sits
beside the words or above them. Nothing applies the answer. A scene built today
holds letters and no mark, which is half a logo.

## What Changes

- Compose the mark into the scene at the scale and position the lockup returns,
  in both arrangements.
- Measure the mark by the geometry it draws rather than by the box it was drawn
  into, so a three-lobed shape with empty corners sits where it looks centred.
- Take the lines from the lockup, so the mark's width reservation is what the
  wrapping actually used.

## Capabilities

### Modified Capabilities

- `layout-and-lockup`: the placement is applied, not only computed.

### New Capabilities

<!-- none -->

## Impact

- Changed: `packages/core/src/scene/build.ts`, which gains the mark and takes
  its lines from the lockup rather than from its caller.
- The mark is the nested stack itself, scaled and placed, so it costs nothing
  new.
- One visual difference from the prototype remains and is not fixed here. The
  prototype draws each copy of the mark with a thin stroke as well as a fill,
  which gives each lobe a crisp edge. The scene graph has fills and no strokes,
  so the port's mark reads a little softer. Giving a path a stroke is a change
  to the scene graph, and belongs with the shell epic that will show it rather
  than being slipped in here.
