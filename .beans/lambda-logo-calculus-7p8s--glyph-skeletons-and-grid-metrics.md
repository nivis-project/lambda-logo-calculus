---
# lambda-logo-calculus-7p8s
title: Glyph skeletons and grid metrics
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-09-30T22:03:17Z
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

- [ ] Define grid metrics and skeleton primitives with a JSON schema
- [ ] Port a to z from the prototype as skeletons
- [ ] Port A to Z as skeletons
- [ ] Port 0 to 9 and the punctuation marks as skeletons
- [ ] Register the glyph set
- [ ] Property test: strokes that start on the baseline are stated on the baseline
