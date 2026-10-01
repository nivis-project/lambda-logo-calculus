---
# lambda-logo-calculus-txdw
title: Path booleans and curve fitting
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T11:37:40Z
parent: lambda-logo-calculus-yp20
blocked_by:
    - lambda-logo-calculus-0ocs
---

Clean geometry for export. Counters become real holes rather than masks, and
polylines become compact Beziers so the result stays editable in Illustrator and
Figma.

## Scope

- polygon-clipping for path booleans: unite passes, cut counters as real holes.
- A polyline-to-Bezier fitter with a stated error tolerance.
- The live preview may keep masks; exports may not.
- Both run behind interfaces so a WASM boolean engine can replace them later.

## Todo

- [ ] Integrate polygon-clipping behind a boolean interface
- [ ] Unite passes and cut counters as real holes
- [ ] Implement the polyline-to-Bezier fitter with an error tolerance
- [ ] Property test: exported paths close and contain no NaN
- [ ] Test that exported counters are holes, not masks
