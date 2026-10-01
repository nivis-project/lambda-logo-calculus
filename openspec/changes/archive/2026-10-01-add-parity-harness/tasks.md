## 1. The harness

- [x] 1.1 Run `reference/trefoil-type.html` in a real browser from a committed
  script, and verify the reference file is unmodified afterwards.
- [x] 1.2 Drive the prototype's real controls: amplitude, rotation, copy count,
  fit size and ending. Verify the recording stores the values the sliders
  actually took, and that a test fails when they differ from what was asked.
- [x] 1.3 Record the prototype's rendered geometry into a committed fixture that
  the sandboxed gate compares against, since the prototype cannot be navigated
  to inside the sandbox.

## 2. The comparison

- [x] 2.1 Write a geometric comparison reporting the largest distance between
  corresponding points. Verify identical sets report zero.
- [x] 2.2 Report a mismatch in point count as a mismatch, not as a comparison of
  the common prefix. Verify with sets of different lengths.
- [x] 2.3 Report the largest difference, its location and the tolerance on
  failure. Verify the message contains all three.

## 3. The tolerance

- [x] 3.1 Decide the tolerance, measure what the actual differences are, and
  write the justification into `docs/testing-strategy.md`: the value, the
  reason, and the size of error it still catches.
- [x] 3.2 Verify the tolerance is tight enough to fail on a deliberately
  introduced error of one font unit.

## 4. Parity

- [x] 4.1 Prove `perfectFit` and the copy scales match the prototype exactly,
  not within a tolerance, across a spread of amplitudes, rotations, fit sizes
  and copy counts.
- [x] 4.2 Prove the glyph geometry matches within the tolerance for the
  prototype's default settings.
- [x] 4.3 Prove it across a matrix of amplitude, rotation, copy count, fit size
  and ending. Verify a failure names the combination.
- [x] 4.4 If any part cannot reach parity, report what and why in the bean and
  in design, rather than widening the tolerance.

## 5. Golden snapshots

- [x] 5.1 Render each template against "Hamburgefonstiv 0123" and store the
  result. Verify the stored file is deterministic across runs.
- [x] 5.2 Compare against the stored snapshot on every run. Verify a changed
  result fails.
- [x] 5.3 Write the approval procedure into `docs/testing-strategy.md` and
  verify the failure message points at it.

## 6. Verification

- [x] 6.1 Verify the whole suite is green and `nix flake check` passes.
- [x] 6.2 Verify coverage still meets both thresholds.
