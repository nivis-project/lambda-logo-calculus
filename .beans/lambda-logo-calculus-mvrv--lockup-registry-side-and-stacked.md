---
# lambda-logo-calculus-mvrv
title: 'Lockup registry: side and stacked'
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T10:28:17Z
parent: lambda-logo-calculus-ujb5
blocked_by:
    - lambda-logo-calculus-5w79
---

Lockups as registrations. The mark is placed by its real outline, not its
bounding box, and the layout switches to a stack when space runs out.

## Scope

- `Lockup` interface: mark outline plus text block to positions.
- Side lockup, with distance, height and size controls.
- Stacked lockup, entered automatically when space runs out.
- Mark placement by the real outline with the 6% optical enlargement kept from
  the prototype.
- Layout stays out of drawing; the lockup returns positions only.

## Todo

- [x] Define the `Lockup` interface and registry
- [x] Register the side lockup with distance, height and size
- [x] Register the stacked lockup
- [x] Automatic switch when space runs out
- [x] Mark placement by real outline with the optical enlargement
- [x] Property test: the mark never overlaps the text block

## Summary of Changes

The two lockup artboards now show two different things, which closes the gap
milestone 04 recorded rather than hid. 398 unit tests, 28 browser tests.

- `Lockup` is a registered module with a pure `place(inputs)`. The registry
  holds `side` and `stacked`; a badge, a monogram or a centred stack is a
  registration rather than an edit.
- A placement carries the mark's position and scale, the text block's position
  and one baseline per line, and nothing else. Its key list is asserted, so
  geometry cannot creep in.
- `boundsOfScene` walks a scene's contours through its group transforms and
  reports what is actually drawn. A mark that fills part of its viewBox reports
  the drawn extent, and an empty scene reports that there is nothing to place
  rather than a degenerate box. That is what makes "placed by its real outline"
  true rather than aspirational.
- The side lockup puts the mark left of the text with the gap the distance
  setting produces. The stacked lockup puts it above, both centred on one axis
  to within floating point.
- The automatic switch to stacking when a word would otherwise break is kept,
  along with every existing mark scale, gap and wrapping test.

One thing the spec was silent on and should not have been: which way y points. I
built the placement in a y-up space and composed it into a scene that had
already been flipped to y-down, which put the mark half off the artboard. The
placement is now explicitly y-down, measured from the top left the way SVG
measures, and the spec says so with a scenario that checks no position escapes
the placement's own box. Two tests had encoded the old convention and were
corrected rather than the code bent to fit them.

Three browser tests had been counting paths in `wordmark-defs`, which is now the
side lockup and contains the mark as well. They count the lockup's full content
now. A fourth compared the first path before and after disabling the bend stage;
the first path is the mark, which bend does not touch, so it compared something
that could never change. It hashes the whole scene instead.

Capability `layout` gained six requirements and fourteen scenarios.

OpenSpec change archived as `2026-10-01-add-lockup-registry`.
