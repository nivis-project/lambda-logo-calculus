---
# lambda-logo-calculus-7p8s
title: Glyph skeletons and grid metrics
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-10-01T05:27:24Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-gkcz
---

The alphabet as data. Every glyph becomes a JSON skeleton on a shared grid,
replacing the prototype's literal coordinates mixed with `arc()` calls that read
global state.

## Scope

- Grid metrics: baseline, x-height, cap-height, descender, in font units.
- Skeleton primitives: line, arc, bowl, dot, cut region.
- Coverage: a to z, A to Z, 0 to 9 and the six punctuation marks the prototype
  has.
- A glyph set registry, so alternates and accents can be added later as
  registrations.
- Skeletons carry no hidden inputs; arc warping moves to the Curves stage.

## Todo

- [x] Define grid metrics and skeleton primitives with a JSON schema
- [x] Port a to z from the prototype as skeletons
- [x] Port A to Z as skeletons
- [x] Port 0 to 9 and the punctuation marks as skeletons
- [x] Register the glyph set
- [x] Property test: strokes that start on the baseline are stated on the baseline

## Summary of Changes

The alphabet is separated from the mathematics that reshapes it. 142 tests.

- Grid metrics as data, matching the prototype's `G` exactly: stroke width 10,
  x-height 56, cap-height 86, descender -28, side bearing 9, trim 8, dot radius
  7, word space 28, line height 150.
- Primitives: a `stroke` of segments, a `bowl` with cut regions, a `dot`. A
  segment is a `point` or an `arc` declared by centre, radii and two angles in
  degrees. Nothing is pre-sampled.
- All 69 glyphs ported with the prototype's exact coordinates and advance
  widths: 26 lower case, 26 upper case, 10 digits, six punctuation marks and the
  notdef.
- The validator rejects a non-positive advance, a glyph with no parts, a stroke
  yielding fewer than two nodes, a non-finite coordinate, a bowl or dot or arc
  with a non-positive radius, an arc spanning no angle, and a cut region with no
  positive extent. Every message names the character.
- `createGlyphSetRegistry` validates every glyph at registration and refuses a
  set with no notdef. `glyphFor` falls back to the notdef rather than throwing.

This is the epic where the prototype's real structural problem becomes visible.
Its `buildGlyphs()` calls `arc()` while it runs, and `arc()` reads four globals:
the curves toggle, the amplitude, the rotation and the derived `rc()` radius. A
glyph in the prototype is therefore not data but the output of the curves stage,
frozen at whatever moment `buildGlyphs()` last ran, which is why the prototype
reruns it on every change. The ported skeletons have no such inputs, which is
what lets the next epic make arc warping an explicit stage.

Two corrections found by implementation:

- The rule "a stroke needs at least two segments" was wrong. In the prototype
  `S(...arc(...))` spreads an arc's sampled points, so a stroke built from one
  arc has many segments. Declaratively it has one. The rule is now about nodes:
  a point is one, an arc is two, so a single-arc stroke is valid. Glyphs `r`,
  `s`, `5`, `6`, `9` and `S` depend on this. The spec scenario was rewritten
  rather than the code bent to fit it.
- The descender test used `cy - ry` as an arc's lowest point, which is the
  bounding ellipse rather than the drawn arc. Glyph `6` has an arc whose ellipse
  reaches -4 but which only spans 80 to 180 degrees and never goes below the
  baseline. The test now samples the arc across its actual angular span.

Capability `glyph-set` is a main spec with five requirements and fourteen
scenarios.

OpenSpec change archived as `2026-10-01-add-glyph-skeletons`.
