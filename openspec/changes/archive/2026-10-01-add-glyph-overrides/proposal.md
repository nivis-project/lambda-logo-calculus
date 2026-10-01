## Why

Epic [lambda-logo-calculus-efhp](../../../.beans/lambda-logo-calculus-efhp--per-glyph-overrides-and-spacing-pairs.md),
under milestone 05 Lockup, modulation and project files.

Everything in the studio so far changes every letter at once. That is what makes
the system a system, and it is also why a designer cannot use it: in a real
wordmark one letter is always wrong. The `a` sits too close to the `v`, one bowl
is a shade heavy, one terminal wants a different ending.

The brief is explicit: per-glyph overrides are stored as small patches on top of
the generated skeleton, keyed by character, so they survive parameter changes. A
designer nudges one letter and the rest of the system keeps working.

Spacing pairs are the same problem between letters rather than inside one.

## What Changes

- Add the per-glyph patch: a character, and the small set of adjustments that
  can be made to it.
- Apply patches after the stage list and before the stroker, so a patch sits on
  top of whatever the parameters produced rather than replacing it.
- Support nudging a glyph, scaling it, overriding its advance width, and
  choosing a different ending for it.
- Add spacing pairs: an extra advance between two named characters.
- Store both in the project, so they serialise, they undo, and they survive a
  parameter change.
- Let a designer click a letter on the canvas to open its overrides.

## Capabilities

### New Capabilities

- `glyph-overrides`: what may be overridden per glyph, what a spacing pair is,
  and the guarantee that an override survives a parameter change.

### Modified Capabilities

- `quality-gate`: the ship script validates the OpenSpec change before running
  the gate, so a malformed delta is caught in seconds rather than after the
  whole suite has run.

## Impact

- New under `packages/core/src/overrides`.
- A patch is deliberately small. It adjusts what the pipeline produced; it does
  not replace a glyph's skeleton, because a replaced skeleton would stop
  responding to the template and that is the thing worth keeping.
- Clicking a letter needs the renderer to say which glyph was hit. The scene
  already groups by glyph, so the group carries the character and the index.
- Spacing pairs change advances, which changes wrapping and the lockup, so they
  run inside layout rather than being added afterwards.
