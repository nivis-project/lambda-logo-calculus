## 1. Composing

- [x] 1.1 Build the mark as its own scene from the same pipeline, and measure
  what it draws. Verify the measurement is the geometry's extent.
- [x] 1.2 Place it at the lockup's scale and position, beside the words. Verify
  the text starts after the reserved width.
- [x] 1.3 Place it above the words when the lockup stacks it. Verify nothing is
  reserved beside it.
- [x] 1.4 Draw nothing when the mark is off. Verify the scene holds only
  letters.

## 2. Taking the lines from the lockup

- [x] 2.1 Build the scene from the lines the lockup wrapped, rather than from
  lines the caller supplies. Verify the wrapping and the reservation agree.

## 3. Verification

- [x] 3.1 Verify a lopsided stack is still centred on the text block.
- [x] 3.2 Verify the gate is green and parity still passes.
