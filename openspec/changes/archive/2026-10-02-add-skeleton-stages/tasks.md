## 1. The working skeleton

- [x] 1.1 Define the working skeleton: runs, rings and dots. Verify a stem, a
  bowl, a cut bowl and a dot each produce what they should.

## 2. The stages

- [x] 2.1 Add the curves stage: sample a stroke's arcs, warping each radius by
  the curve and bounding the multiplier to 0.5 and 1.5. Verify an arc still
  starts and ends where it joins its stem.
- [x] 2.2 Add the bowls stage: trace the curve into the bowl's box inset by 5,
  with the radial factor floored at 0.35, and apply cut regions. Verify an uncut
  bowl is a ring and a cut one is runs.
- [x] 2.3 Add the bend stage: bow a straight segment longer than 8 units by a
  sine over its length. Verify both ends stay put and a short segment is left
  straight.
- [x] 2.4 Add the proportions stage: scale width, and remap height in four
  bands. Verify the baseline and the descender are unmoved and the x-height
  moves.
- [x] 2.5 Register all four with their parameters and switches. Verify each can
  be switched off independently.

## 3. The pipeline

- [x] 3.1 Run the stages in order from a list. Verify the order is taken from
  the list rather than fixed in the code.
- [x] 3.2 Verify a stage reads only its input, the glyph and its parameters, by
  running one twice with the same input and getting the same output.

## 4. The invariants

- [x] 4.1 Property test: a point on the baseline stays on the baseline, for
  random amplitude, rotation and fit size.
- [x] 4.2 Property test: a bowl encloses a positive area, for random amplitude
  and rotation.
- [x] 4.3 Property test: no stage produces a coordinate that is not finite.

## 5. Verification

- [x] 5.1 Verify the gate is green and the core holds its coverage floor.
