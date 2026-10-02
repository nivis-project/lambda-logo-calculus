# glyph-skeletons Specification

## Purpose
What a letter is before the curve touches it: a skeleton of strokes, bowls and
dots on a shared grid. And the four stages that reshape it.

## Requirements

### Requirement: The grid

Every glyph SHALL be drawn on one grid, with these values in font units:

| value          | units |
| -------------- | ----- |
| stroke width   | 10    |
| x-height       | 56    |
| cap height     | 86    |
| descender      | -28   |
| side bearing   | 9     |
| terminal       | 8     |
| dot radius     | 7     |
| word space     | 28    |
| line height    | 150   |

The baseline SHALL be 0. The ascender SHALL be the cap height.

#### Scenario: A glyph's extent

- **WHEN** a glyph is laid out
- **THEN** its box runs from the descender to the cap height

### Requirement: A glyph is data, not drawing

A glyph SHALL be an advance width and a list of parts. A part SHALL be one of
three kinds and nothing else:

- a stroke: an ordered list of points
- a bowl: a centre, two radii, and a list of rectangular cut regions
- a dot: a centre and a radius

A glyph SHALL NOT depend on the amplitude, the rotation, or which switches are
on. Those belong to the stages that reshape it, not to the letter itself.

#### Scenario: Reading a glyph

- **WHEN** a glyph is read
- **THEN** it holds an advance and parts, and no reference to any control

#### Scenario: An unknown character

- **WHEN** a character has no glyph
- **THEN** a notdef glyph is drawn instead, and nothing fails

### Requirement: The alphabet

The glyph set SHALL hold the 26 lowercase letters, the 26 uppercase letters, the
ten digits, the characters `. , ! ? - '`, and a notdef glyph: 69 in all.

#### Scenario: Every character in the set

- **WHEN** the glyph set is read
- **THEN** it holds 69 glyphs, including a notdef

### Requirement: Arcs are stored as arcs

An arc within a stroke SHALL be described by a centre, two radii and a start and
end angle, and sampled into points when it is used. It SHALL NOT be stored as
points that someone has already sampled.

The number of samples SHALL be at least 8, and otherwise one for every 6 degrees
of sweep.

#### Scenario: A stored arc

- **WHEN** a glyph holding an arc is read
- **THEN** the arc's centre, radii and angles are present

#### Scenario: A quarter turn

- **WHEN** an arc sweeps 90 degrees
- **THEN** it is sampled at 16 points

### Requirement: The curves stage warps an arc by the base curve

When the curves switch is on, each point of an arc SHALL have its radius
multiplied by `r(angle) / interpolate(r(startAngle), r(endAngle))`, where `r` is
the base curve evaluated at the amplitude floor and offset by the rotation.

The denominator is a straight interpolation between the curve's value at the
arc's two ends, so the arc still starts and ends exactly where it joins a stem.

The multiplier SHALL be bound to the range 0.5 to 1.5.

#### Scenario: An arc still meets its stem

- **WHEN** an arc is warped
- **THEN** its first and last points are where they were, so the join holds

#### Scenario: The multiplier at its limits

- **WHEN** the ratio would fall below 0.5 or rise above 1.5
- **THEN** the limit is used

#### Scenario: The switch off

- **WHEN** the curves switch is off
- **THEN** the multiplier is 1 everywhere and the arc is a plain ellipse

### Requirement: The bowls stage traces the curve

When the bowls switch is on, a bowl SHALL be built by sampling the base curve,
offset by the rotation and by a further quarter turn, and stretching the result
to the bowl's box inset by 5 units.

The radial factor SHALL be `(A + cos(3(t - phi - 90 degrees))) / (A + 1)`,
floored at 0.35.

A bowl whose cut regions remove no point SHALL be a closed ring. A bowl with
points removed SHALL become one or more open runs, which is how a `c`, a `G` or
an `e` opens.

#### Scenario: An uncut bowl

- **WHEN** a bowl has no cut regions
- **THEN** it is a closed ring

#### Scenario: A cut bowl

- **WHEN** a bowl's cut regions remove a span of points
- **THEN** the remaining points become open runs

#### Scenario: The radial floor

- **WHEN** the radial factor would fall below 0.35
- **THEN** 0.35 is used, so the counter stays open

#### Scenario: The switch off

- **WHEN** the bowls switch is off
- **THEN** the factor is 1 and the bowl is an ellipse

### Requirement: The bend stage bows a straight run

When the bend switch is on, a straight segment longer than 8 units SHALL be
replaced by 12 points bowed sideways, with the offset at parameter `u` equal to
`amplitude * sin(pi * u)` and the amplitude equal to
`length * 0.22 * cos(3 * angle - phi) / max(A, 1.15)`.

Because the offset is a sine over the segment, both ends stay exactly where they
were, so letters still meet the baseline.

The direction of the bow SHALL come from the segment's own angle and the
rotation, so two segments at different angles bow differently.

#### Scenario: A bowed stem

- **WHEN** a stem longer than 8 units is bent
- **THEN** its middle moves sideways and its two ends do not

#### Scenario: A short segment

- **WHEN** a segment is 8 units or shorter
- **THEN** it is left straight

#### Scenario: The switch off

- **WHEN** the bend switch is off
- **THEN** every segment stays straight

### Requirement: The proportions stage scales width and remaps height

When the proportions switch is on, every point SHALL be scaled horizontally by
the letter width factor, and its height remapped so that:

- a point at or below the baseline keeps its height
- a point between the baseline and the x-height is scaled into the new x-height
- a point between the x-height and the cap height is scaled into what is left
- a point above the cap height keeps its height

#### Scenario: The baseline holds

- **WHEN** a point sits on the baseline
- **THEN** it is unmoved by the height remapping

#### Scenario: The x-height moves

- **WHEN** the x-height is raised and a point sits on it
- **THEN** that point moves to the new x-height

#### Scenario: A descender holds

- **WHEN** a point sits below the baseline
- **THEN** it is unmoved

### Requirement: The stages are ordered and independent

The stages SHALL run in one order: curves, bowls, bend, proportions. A stage
SHALL read only its input and the parameters, never the output of a later stage
and never a global.

In the prototype the proportions stage is applied as a transformation at the
point each part is emitted rather than as a stage in a list. The port SHALL
record that it is making it a stage, and that the order above is what the
prototype's arithmetic amounts to.

#### Scenario: One order

- **WHEN** a glyph is reshaped
- **THEN** the stages run in the stated order

#### Scenario: A stage in isolation

- **WHEN** one stage runs
- **THEN** its result depends only on its input and the parameters

### Requirement: The alphabet is extracted, not transcribed

The glyph data SHALL be produced by evaluating the prototype's own glyph table
with helpers that record structure, rather than by copying coordinates by hand.

A test SHALL re-run the extraction against the frozen prototype and compare it
against the committed alphabet, so the two cannot drift apart.

#### Scenario: The alphabet matches its source

- **WHEN** the extraction is re-run
- **THEN** it produces exactly the committed alphabet

#### Scenario: A hand edit to the alphabet

- **WHEN** a coordinate in the committed alphabet is changed by hand
- **THEN** the comparison fails, naming the glyph

#### Scenario: Arcs survive extraction

- **WHEN** a glyph holding an arc is extracted
- **THEN** the arc is recorded as a centre, two radii and two angles, not as
  sampled points

### Requirement: A glyph set is validated when it is registered

Registering a glyph set SHALL check every glyph, and SHALL refuse the set when
one is malformed, naming the character and what is wrong.

A set SHALL be refused when it defines no notdef glyph, because a set that
cannot answer for an unknown character is a set that fails at render time
instead.

A glyph SHALL be refused when its advance is not a positive finite number, when
a part is of no known kind, when a coordinate is not finite, when a stroke holds
no segments or a single point, or when an arc has a radius that is not positive.

A stroke of a single arc is valid: an arc samples into many points, so one of
them draws a line where one point does not.

#### Scenario: A set with no notdef

- **WHEN** a glyph set without a notdef glyph is registered
- **THEN** it is refused

#### Scenario: A malformed glyph

- **WHEN** a glyph has a negative advance, a non-finite coordinate or a stroke
  of one point
- **THEN** the set is refused and the message names the character

#### Scenario: A stroke that is one arc

- **WHEN** a glyph holds a stroke of a single arc segment
- **THEN** it is accepted, because an arc samples into many points

#### Scenario: An unknown character at render time

- **WHEN** a character with no glyph is drawn from a valid set
- **THEN** the notdef glyph is drawn and nothing fails

### Requirement: A sampled glyph is a working skeleton

Running the stages SHALL produce a working skeleton: open runs of points, closed
rings of points, and dots with a centre and a radius.

Nothing in a working skeleton SHALL still need interpreting. An arc has been
sampled, a bowl has become a ring or runs, and a cut has been applied.

#### Scenario: A stem

- **WHEN** a glyph holding one straight stroke is run through the stages
- **THEN** the working skeleton holds one run and no rings

#### Scenario: A bowl

- **WHEN** a glyph holding an uncut bowl is run through the stages
- **THEN** the working skeleton holds one ring

#### Scenario: A cut bowl

- **WHEN** a glyph holding a bowl with a cut region is run through the stages
- **THEN** the working skeleton holds open runs rather than a ring

#### Scenario: A dot

- **WHEN** a glyph holding a dot is run through the stages
- **THEN** the working skeleton holds that dot, moved by the stages that move it

### Requirement: Each stage is a registered module with a switch

Each of the four stages SHALL be a registered module carrying an id, a label and
its own parameters, and SHALL be switchable on and off independently.

A stage SHALL read only its input, the glyph and the parameters it is given. A
stage SHALL NOT read a global, and SHALL NOT read the output of a stage that
runs after it.

#### Scenario: The four stages

- **WHEN** the stage registry is read
- **THEN** it holds the curves, bowls, bend and proportions stages

#### Scenario: A stage switched off

- **WHEN** a stage is switched off
- **THEN** its transformation does not apply, and the others are unchanged

#### Scenario: Every stage off

- **WHEN** all four are off
- **THEN** the working skeleton is the glyph sampled plainly, at its declared
  coordinates

### Requirement: The stages run in one order

The pipeline SHALL run the stages in the order curves, bowls, bend, proportions.

#### Scenario: The order

- **WHEN** the pipeline runs
- **THEN** the stages run in that order

#### Scenario: A reordered list

- **WHEN** the stage list is given in a different order
- **THEN** the pipeline runs it in the order given, so the order is data rather
  than a rule in the code

### Requirement: A stroke that starts on the baseline ends on the baseline

For any parameters, a point that sits on the baseline before the stages SHALL
sit on the baseline after them.

Letters that do not meet the baseline are not letters, and this is the invariant
the bend and proportions stages are both written to preserve.

#### Scenario: Any parameters

- **WHEN** a glyph with a point on the baseline is run through the stages, for
  any amplitude, rotation and fit size
- **THEN** that point is still on the baseline

#### Scenario: A descender

- **WHEN** a point sits below the baseline
- **THEN** the proportions stage leaves its height alone

### Requirement: A bowl's counter stays open

For any parameters, a bowl SHALL enclose an area. A bowl that closes to nothing
is a letter with no counter.

#### Scenario: Any parameters

- **WHEN** a bowl is traced for any amplitude and rotation
- **THEN** the ring encloses a positive area

#### Scenario: The radial floor holds it open

- **WHEN** the curve's radius would pinch the ring to a point
- **THEN** the floor of 0.35 keeps it open
