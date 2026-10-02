## Why

Epic [lambda-logo-calculus-0l4j](../../../.beans/lambda-logo-calculus-0l4j--the-base-curve-and-the-nesting-mathematics.md),
under milestone 03 The faithful port.

The one piece of mathematics everything else is drawn from. The letters are
bent by it, the pen is cut from it, the mark is it, and the stack of copies is
what it can do to itself.

It also carries the decision milestone 02 could not make. The prototype floors
the amplitude at 1.15 where it bends letters and nowhere else, so the bottom
0.15 of that slider is a dead zone in which the mark, the nesting and the
letters each do something different. The port applies the floor everywhere and
says when it is holding.

## What Changes

- Add the base curve as a registered template carrying its own parameters, so a
  second curve later is a registration rather than a branch.
- Add the fit search over 720 samples, with the values that can be derived
  rather than measured pinned as tests.
- Add the effective scale and the per-copy scales.
- Apply the amplitude floor to the shape, the nesting and the letters alike, and
  report every limit that bound a value instead of clamping silently.
- Record that decision in ADR 0002.

## Capabilities

### Modified Capabilities

- `shape-and-nesting`: the port applies the amplitude floor everywhere, and
  reports which limit bound a value and what it would otherwise have been. The
  prototype's own behaviour stays on the record as a description of the
  prototype.

### New Capabilities

<!-- none -->

## Impact

- New: `packages/core/src/template/`, `docs/adr/0002-one-amplitude-floor.md`.
- The parity fixture's lowest amplitude is 1.2, above the floor, so this choice
  does not move anything the fixture measures. It was chosen on its merits
  rather than forced by the comparison, which is why it needs a record.
- The trefoil is registered from inside `packages/core` rather than a separate
  package. Splitting it out is an architecture decision with nothing yet to
  justify it, and would need an ADR of its own.
