## Why

Epic [lambda-logo-calculus-sws0](../../../.beans/lambda-logo-calculus-sws0--worker-offload-and-the-16-ms-budget-benchmark.md),
under milestone 06 Export, brand sheet and performance.

The architecture rules carry a number: a 20-character wordmark at 12 copies
re-renders under 16 ms while a slider is dragged. Nothing has ever measured it.
Measured now, it takes 19 ms on this machine, so the rule has been broken for
most of the project and nobody could have known.

Where it goes is not where it looks. Nesting is a tenth of a millisecond and the
skeleton stages under one. The cost is the stroker, called once per glyph per
copy, and the pens, rebuilt from the curve for every copy of every render.

The brief names three answers and they are all right: sample more coarsely while
a slider moves and go back to full quality on release, cache a glyph by the
parameters it actually uses, and get the work off the thread that paints.

## What Changes

- Add a sampling quality: a record of how finely the pen, the endings, the joins
  and the nesting search sample, with a full and a draft setting. The studio
  draws draft while a control is being dragged and full when it is let go.
- Cache a glyph's outlines under a hash of what they depend on, so a change to
  the palette, the opacity or the text redraws without touching the geometry.
- Build the pens only when something actually misses the cache, so a colour
  change costs nothing.
- Measure every render and show the number, so the budget is visible rather than
  asserted.
- Move the scene building into a worker through Comlink, so a slow render shows
  as a late frame rather than a frozen window.
- Add the budget benchmark to the gate, so a change that breaks the rule fails
  the build.

## Capabilities

### New Capabilities

- `render-budget`: the sampling quality, the glyph cache, what the budget is,
  how it is measured, and what the benchmark asserts.

### Modified Capabilities

- `studio-shell`: the studio draws draft while dragging and full on release,
  builds its scenes in a worker, and reports the time each render took.
- `quality-gate`: the gate runs the budget benchmark.

## Impact

- New under `packages/core/src/perf`, with the worker in `apps/studio`.
- The quality record is data, not a flag. A later renderer that needs its own
  trade adds a quality rather than another boolean.
- The cache key is a hash of everything the geometry reads and nothing else. The
  palette, the opacity and the artboard are not in it, which is the whole point.
- The cache is handed in by the caller rather than held in a module, because a
  worker, the studio and a test each want their own, and a module-level cache
  shared between them would make a benchmark measure the test before it.
- Draft quality is visibly coarser if you look for it: a stroke's end is a
  24-sided ring rather than a 64-sided one. That is the trade the brief asked
  for, and it lasts only while a control is held.
