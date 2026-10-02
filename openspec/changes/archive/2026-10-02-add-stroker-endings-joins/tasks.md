## 1. The corners

- [x] 1.1 Measure corners on the sampled stroke before it is bent, and carry
  them on the working skeleton. Verify a sharp turn is recorded and a gentle one
  is not.
- [x] 1.2 Move corners through the later stages. Verify the point follows the
  letter width and the bisector is rescaled with it.

## 2. The pen

- [x] 2.1 Build the pen as a support table of 360 directions. Verify a round pen
  reads the same in every direction, and that the shape pen does not.
- [x] 2.2 Offset a run by the support at its normal on each side. Verify an
  asymmetric pen gives two different offsets.
- [x] 2.3 Verify the pen for pass `i` is copy `i` of the stack, turned by its
  own rotation.

## 3. Runs and ends

- [x] 3.1 Split a stroke into runs at turns over 25 degrees, and mark which ends
  are free. Verify a T gives the right runs and the right free ends.
- [x] 3.2 Decide whether a run is curved from its total turning. Verify an arc
  is curved and a stem is not.

## 4. The endings

- [x] 4.1 Add all nine endings in both forms, registered. Verify the registry
  holds nine and that each builds both ways.
- [x] 4.2 Apply taper and flare as a width profile along the run. Verify the
  stroke itself narrows and widens.
- [x] 4.3 Lay serifs flat on a vertical end and upright on a horizontal one.
  Verify both.
- [x] 4.4 Verify the ball ending applies to a curved run and not to a straight
  one.

## 5. The join and the stamps

- [x] 5.1 Add the looped join at corners over 50 degrees. Verify it appears and
  that switching it off removes it.
- [x] 5.2 Stamp the pen at every joint and at every dot. Verify a split stroke
  gets a stamp where it meets.

## 6. The invariants

- [x] 6.1 Property test: every contour closes, holds three points or more, and
  holds no value that is not finite, over random glyphs and parameters.
- [x] 6.2 Verify a ring outlines to two contours so the counter stays open.

## 7. Verification

- [x] 7.1 Verify the gate is green and the core holds its coverage floor.
