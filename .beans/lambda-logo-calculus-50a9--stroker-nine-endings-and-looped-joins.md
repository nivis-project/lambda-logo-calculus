---
# lambda-logo-calculus-50a9
title: Stroker, nine endings and looped joins
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:37Z
updated_at: 2026-09-30T22:03:17Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-i2r0
---

Skeleton runs become outlines. Ports the support-function stroker with its
360-entry lookup, the nine stroke endings in plain and shape-built form, and the
looped join.

## Scope

- Stroker: support-function offset per direction, 360-entry lookup, nib
  parameterised with the prototype's default of 6.5.
- Two drawing modes: the shape as pen, and a plain pen with ornaments. One
  pipeline, not two; ornaments become a render style.
- Nine endings, each plain and shape-built: round, flat, angled, tapered,
  flared, wedge, slab, hairline, ball.
- Endings registry with `build(end, passContext)`.
- Join registry, with the prototype's loop of the shape, loop radius 11.
- Keep as proven: flat serifs on vertical strokes, balls only on curved ends.

## Todo

- [ ] Port the support-function stroker with the 360-entry lookup
- [ ] Define the `Ending` interface and the endings registry
- [ ] Register the nine endings in plain form
- [ ] Register the nine endings in shape-built form
- [ ] Define the `Join` interface and register the looped join
- [ ] Fold ornaments into the one pipeline as a render style
- [ ] Property test: outlines close and contain no NaN
