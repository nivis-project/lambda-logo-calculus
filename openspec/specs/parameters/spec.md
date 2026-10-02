# parameters Specification

## Purpose
Every value a designer can move, what it holds, and what it actually drives.
Several drive more than their label says, and that is the part worth writing
down.

## Requirements

### Requirement: The controls and their ranges

The system SHALL expose these controls, with these ranges, steps and defaults:

| control            | kind   | min  | max | step | default           |
| ------------------ | ------ | ---- | --- | ---- | ----------------- |
| A, the A/B ratio   | number | 1    | 20  | 0.1  | 3                 |
| copies             | int    | 1    | 12  | 1    | 6                 |
| rotation per copy  | angle  | 0    | 180 | 1    | 24 degrees        |
| fit size           | number | -1   | 1   | 0.1  | 0                 |
| transparency       | number | 0.05 | 0.6 | 0.01 | 0.22              |
| palette            | enum   |      |     |      | Analogous         |
| stroke endings     | enum   |      |     |      | Round             |
| distance to text   | number | -1   | 1   | 0.05 | 0                 |
| mark height        | number | -1   | 1   | 0.05 | 0                 |
| mark size          | number | 0.5  | 2   | 0.05 | 1                 |

The palette options SHALL be Monochrome, Analogous, Complementary, Triadic,
Warm and Cool. The ending options SHALL be round, flat, angled, taper, flare,
wedge, slab, hair and ball.

Text SHALL be at most 80 characters and SHALL default to "Trefoil Type 26".

#### Scenario: A control's range

- **WHEN** any control is read
- **THEN** its minimum, maximum, step and default are those in the table

#### Scenario: A value outside the range

- **WHEN** a value outside a control's range is supplied
- **THEN** it is brought into range rather than used

### Requirement: The switches

Seven switches SHALL control what the shape changes, each defaulting to on:
curves, bowls, bent strokes, proportions, looped joins, pen nib, shape endings.

Two drawing modes SHALL exist: letters drawn with the shape as the pen, and a
plain pen with ornaments. In the ornament mode the looped joins, pen nib and
shape endings switches SHALL have no effect, and the ending choice SHALL have no
effect.

#### Scenario: A switch turned off

- **WHEN** a switch is turned off
- **THEN** the step it names stops applying, and the rest of the pipeline is
  unchanged

#### Scenario: Ornament mode

- **WHEN** the ornament mode is chosen
- **THEN** the joins, nib and endings switches and the ending choice are
  inactive

### Requirement: Three controls drive values nobody named

The amplitude, the fit size and the transparency each drive a second value
through arithmetic that is not visible in the interface. These couplings SHALL
be recorded as couplings rather than left inline.

The amplitude SHALL set the letter width, when proportions are on, as
`0.78 + 0.5 * (1 - e^(-(A - 1) / 4))`. At the minimum amplitude that is 0.78 of
nominal width and at the maximum about 1.28.

The fit size SHALL set the x-height, when proportions are on, as
`min(capHeight - 16, xHeight * (1 + 0.22 * fit))`.

The transparency SHALL be remapped three different ways: letters are drawn at
`min(1, 0.25 + alpha * 1.25)`, ornaments at `min(1, 0.45 + alpha * 1.2)`, and
the mark in letter mode at `min(0.9, 0.05 + alpha * 1.5)`. The slider's own
value SHALL NOT be used directly as an opacity anywhere in letter mode.

#### Scenario: Amplitude moves the letter width

- **WHEN** the amplitude changes and proportions are on
- **THEN** the letter width changes by the stated formula

#### Scenario: Fit size moves the x-height

- **WHEN** the fit size changes and proportions are on
- **THEN** the x-height changes by the stated formula

#### Scenario: Proportions off

- **WHEN** proportions are off
- **THEN** the letter width is 1 and the x-height is the grid's 56, whatever the
  amplitude and the fit size are

#### Scenario: One slider, three opacities

- **WHEN** the transparency is set to one value
- **THEN** the letters, the ornaments and the mark are each drawn at their own
  remapping of it, and the three differ

### Requirement: The amplitude also drives three parts of the drawing

Beyond the letter width, the amplitude SHALL drive:

- the amplitude of the bow applied to a straight stroke, as `1 / max(A, 1.15)`,
  so a low amplitude bows more
- the length of a taper, as `10 + 30 / max(A, 1.15)` when shape endings are on
- the strength of a flare, as `min(1, 0.15 + 0.9 / max(A, 1.15))` when shape
  endings are on

#### Scenario: A low amplitude

- **WHEN** the amplitude is near its minimum
- **THEN** strokes bow more, tapers are longer and flares are stronger

#### Scenario: Shape endings off

- **WHEN** shape endings are off
- **THEN** the taper length is a fixed 22 and the flare strength a fixed 0.4,
  and the amplitude does not reach them

### Requirement: The rotation also drives the angled cut

When shape endings are on, the angle of an angled cut SHALL be
`60 + rotation * (copyIndex + 1)` degrees, so each pass is cut differently.

When shape endings are off, every angled cut SHALL be at a fixed 60 degrees.

#### Scenario: Angled ends turn with the passes

- **WHEN** the ending is angled and shape endings are on
- **THEN** each pass is cut at its own angle, derived from the rotation

### Requirement: A locked control is not randomized

Each of the amplitude, copies, rotation, fit size, transparency, palette and
ending SHALL be lockable. Randomize SHALL change every unlocked one of them and
no locked one.

Randomize SHALL draw from these ranges, snapped to these steps: amplitude 1.2 to
8 by 0.1, copies 2 to 10 by 1, rotation 5 to 120 by 1, fit size -0.5 to 0.2 by
0.1, transparency 0.12 to 0.4 by 0.01, and the palette and ending uniformly from
their options.

These ranges are narrower than the controls' own, deliberately: the extremes are
reachable by hand and are not worth landing on by accident.

#### Scenario: A locked control

- **WHEN** a control is locked and randomize runs
- **THEN** its value is unchanged

#### Scenario: Randomize stays inside its own ranges

- **WHEN** randomize runs
- **THEN** every value it sets lies in the randomize range for that control, not
  merely in the control's range

### Requirement: Randomize is not reproducible in the prototype

The prototype's randomize SHALL be recorded as drawing from an unseeded source,
so the same press cannot be repeated and a result cannot be returned to.

This is recorded as what the prototype does. It is a defect rather than a
decision, and the port is not obliged to copy it.

#### Scenario: The same press twice

- **WHEN** randomize is pressed twice with the same state
- **THEN** the prototype gives two different results, and neither can be
  recovered afterwards
