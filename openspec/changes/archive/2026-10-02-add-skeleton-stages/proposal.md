## Why

Epic [lambda-logo-calculus-gqqf](../../../.beans/lambda-logo-calculus-gqqf--the-four-skeleton-stages.md),
under milestone 03 The faithful port.

Four transformations give the letterforms their character: arcs warped by the
curve, bowls traced from it, straight runs bowed along it, and the whole thing
scaled in width and remapped in height.

In the prototype they are not four things. The curve warp lives inside the arc
sampler, the bowl trace inside the bowl builder, the bow inside the stroke
processor, and the proportions inside a transform applied as each part is
emitted. Each reads the shared state object directly, which is why the glyph
table has to be rebuilt every time a slider moves.

Making them an ordered list of pure functions is what lets a fifth be added
later, and what lets each be tested on its own.

## What Changes

- Add the working skeleton: what a glyph becomes once it is sampled. Runs,
  closed rings and dots, and nothing that still has to be interpreted.
- Add the four stages as registered modules, each with its own parameters and
  its own switch.
- Run them in one order through a pipeline, with each stage reading only its
  input, the glyph and the parameters.
- Pin the invariants that the prototype's own notes claim: a stroke that starts
  on the baseline still ends on it, and a bowl's counter stays open.

## Capabilities

### Modified Capabilities

- `glyph-skeletons`: the stages are registered modules run through a pipeline,
  and the proportions stage is one of them rather than a transform applied at
  emit time.

### New Capabilities

<!-- none -->

## Impact

- New: `packages/core/src/stage/`.
- The prototype applies proportions as each part is written out. Making it the
  fourth stage is the port saying what that arithmetic amounts to, which
  milestone 02 recorded.
- Nothing here draws anything. A stage ends at a polyline; width arrives with
  the stroker.
