## 1. The modulation

- [x] 1.1 Add the modulation as one function from the parameters to the letter
  width and the x-height. Verify both formulas and the ceiling.
- [x] 1.2 Verify it returns 1 and 56 when proportions are off.

## 2. The pieces

- [x] 2.1 Have the outliner return its pieces separately: the outlines the
  prototype writes as path data, the shapes it writes as references, and the
  stamps. Verify the existing tests still pass.

## 3. The comparison

- [x] 3.1 Compare the port against every recorded setting, glyph by glyph and
  pass by pass. Verify every recording is covered.
- [x] 3.2 Report the worst difference measured. Verify it is below the
  tolerance and record it in the testing strategy.
- [x] 3.3 Prove the comparison can fail, by nudging a coordinate by one font
  unit. Verify it is caught and the message names the setting.
- [x] 3.4 State what is not compared and why. Verify the statement is in the
  test and in the testing strategy.

## 4. Handing over

- [x] 4.1 Record in the testing strategy that parity is now a one-time gate and
  the snapshots take over.

## 5. Verification

- [x] 5.1 Verify the gate is green.
