---
# lambda-logo-calculus-sws0
title: Worker offload and the 16 ms budget benchmark
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T12:33:29Z
parent: lambda-logo-calculus-yp20
blocked_by:
    - lambda-logo-calculus-kk6s
---

Hold the budget: a 20-character wordmark at 12 copies re-renders under 16 ms
while a slider is dragged.

## Scope

- Move `perfectFit`, support tables and export into a Web Worker via Comlink.
- Cache each glyph by a hash of the parameters it actually uses.
- While a slider is dragged, sample curves more coarsely; render full quality on
  release.
- Measure every render.
- A benchmark in the gate that fails when the budget is broken.

## Todo

- [ ] Move `perfectFit` and support tables into a worker
- [ ] Move export into a worker
- [ ] Cache glyphs by a parameter hash
- [ ] Coarse sampling while dragging, full quality on release
- [ ] Instrument and report render time
- [ ] Add the 16 ms budget benchmark to the gate
