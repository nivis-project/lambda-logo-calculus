## Why

Epic [lambda-logo-calculus-zj8d](../../../.beans/lambda-logo-calculus-zj8d--the-parity-comparison.md),
under milestone 03 The faithful port.

The port is built. Nothing has yet compared it against the thing it is a port
of, so nothing yet knows whether it is one.

The recording from milestone 02 exists for exactly this. Comparing against it
closes the loop that the specs alone cannot: the specs were written by reading
the prototype and the port was written by reading the specs, so the two can be
wrong together. The prototype's own output cannot be.

## What Changes

- Add the modulation: the hidden couplings milestone 02 found, as a function
  from the parameters to the letter width and the x-height, rather than as
  arithmetic buried where it is used.
- Compare the port against every recorded setting, within the derived tolerance.
- Report the worst difference measured, so the margin is known rather than
  assumed.
- Prove the comparison can fail, by nudging a coordinate.
- Hand the baseline over: once this is archived the golden snapshots take over
  and the prototype stops being authoritative for anything but reading.

## Capabilities

### Modified Capabilities

- `parameters`: the couplings from the amplitude to the letter width and from
  the fit size to the x-height are one function, named, rather than arithmetic
  repeated where it is needed.
- `parity`: what the comparison compares, and what it means when it passes.

### New Capabilities

<!-- none -->

## Impact

- New: `packages/core/src/style/modulation.ts`, `test/parity.test.ts`.
- `outlineSkeleton` now returns its pieces separately: the outlines the
  prototype writes as paths, the shapes it writes as uses, and the stamps. The
  comparison needs to know which is which, and the distinction is real rather
  than invented for the test.
- The comparison covers the geometry the prototype writes as path data. The
  shapes it writes as `use` elements reference a definition and a transform
  rather than coordinates, and comparing those would mean reimplementing the
  prototype's own `use` resolution, which is the thing the recording exists to
  avoid.
