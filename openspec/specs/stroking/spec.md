# stroking Specification

## Purpose
How a skeleton becomes something with width: the pen, the runs it is dragged
along, the ends it leaves, and the nine ways those ends can be finished.

## Requirements

### Requirement: The pen is a support table

A pen SHALL be represented by its support function: for each of 360 whole
degrees, the furthest the pen reaches in that direction from its own centre.

Offsetting a run SHALL look up the support at the run's normal angle on one side
and at that angle plus half a turn on the other, so an asymmetric pen makes one
side of a stroke thicker than the other.

Looking up a direction SHALL round it to the nearest whole degree.

#### Scenario: A round pen

- **WHEN** the pen nib switch is off
- **THEN** every entry of the support table is half the stroke width, 5 units,
  and the stroke has the same thickness in every direction

#### Scenario: The shape as the pen

- **WHEN** the pen nib switch is on
- **THEN** copy `i` of the nested stack, scaled to a nib size of 6.5, is the pen
  for pass `i`, so each pass has its own thickness and its own direction of
  contrast

#### Scenario: An asymmetric pen

- **WHEN** the pen reaches further in one direction than the opposite one
- **THEN** the two sides of the stroke are offset by different amounts

### Requirement: A stroke is split into runs at its corners

A stroke SHALL be split into runs wherever the turn between three consecutive
points exceeds 25 degrees. Each run SHALL be stroked separately.

A run SHALL know whether each of its two ends is free, meaning it is the start
or end of the original stroke, or a joint, meaning it meets another run.

#### Scenario: A stem with an arm

- **WHEN** a stroke turns sharply
- **THEN** it becomes two runs that share a point

#### Scenario: Which ends are free

- **WHEN** a stroke is split into three runs
- **THEN** the first run's start and the last run's end are free, and the four
  interior ends are joints

### Requirement: Endings apply to free ends only

A stroke ending SHALL be applied to a free end and never to a joint. An end that
meets another stroke SHALL stay joined.

A joint SHALL be covered by a stamp of the pen, so the two runs read as one
stroke rather than two abutting ones.

#### Scenario: The arm of a T

- **WHEN** a T is drawn
- **THEN** the four outer ends take the chosen ending and the junction does not

#### Scenario: A joint is covered

- **WHEN** two runs meet
- **THEN** a stamp of the pen is drawn at the meeting point

### Requirement: A run knows whether it is curved

A run SHALL be counted as curved when the total turning along it exceeds 20
degrees. The ball ending SHALL apply only to curved runs, which is what most
ball-terminal faces do.

#### Scenario: A ball on a curve

- **WHEN** the ending is ball and a run is curved
- **THEN** that run's free ends get balls

#### Scenario: A ball on a stem

- **WHEN** the ending is ball and a run is straight
- **THEN** that run's free ends get no ball and are cut flat

### Requirement: The nine endings

Each ending SHALL have two forms: built from the shape when the shape endings
switch is on, and a plain geometric form when it is off.

| ending | shape-built                        | plain                       |
| ------ | ---------------------------------- | --------------------------- |
| round  | a copy of the shape at the nib size | a circle at the half width |
| flat   | nothing added                       | nothing added               |
| angled | cut at 60 degrees plus the rotation times the pass index | cut at a fixed 60 degrees |
| taper  | a small copy of the shape at the tip, with the run narrowed over its last `10 + 30 / A` units | narrowed over a fixed 22 units |
| flare  | widened near the end by `min(1, 0.15 + 0.9 / A)` | widened by a fixed 0.4 |
| wedge  | two copies of the shape, one each side | two triangles |
| slab   | a copy of the shape, 6 units thick | a rectangle 6 units thick |
| hair   | a copy of the shape, 1.6 units thick | a rectangle 1.6 units thick |
| ball   | a copy of the shape at 1.35 of the half width, offset outward | a circle at 1.35 of the half width |

The taper and flare SHALL be applied as a width profile along the run rather
than as added geometry, so a tapered end narrows the stroke itself.

A run SHALL be resampled at a 3-unit step before a taper or a flare, so the
profile has points to act on.

#### Scenario: Two forms of one ending

- **WHEN** the shape endings switch is turned off
- **THEN** every ending keeps its name and changes to its plain form

#### Scenario: A taper narrows the stroke

- **WHEN** the ending is taper
- **THEN** the stroke itself narrows towards the end, rather than a shape being
  drawn over it

#### Scenario: Flat adds nothing

- **WHEN** the ending is flat
- **THEN** the run's outline ends square with no extra geometry

### Requirement: Serifs on a vertical end lie flat

A slab, hairline or wedge ending on an end whose outward direction is more
vertical than horizontal SHALL be laid flat along the baseline, the x-height or
the cap line, rather than square to the stroke.

On a horizontal end, such as the arms of a T, an E or a Z, it SHALL stand
upright.

This is what serif faces do, and a serif square to a slightly angled stem reads
as a mistake.

#### Scenario: A stem

- **WHEN** a slab serif sits on a vertical stem
- **THEN** it lies flat

#### Scenario: An arm

- **WHEN** a slab serif sits on a horizontal arm
- **THEN** it stands upright

### Requirement: The looped join

When the looped joins switch is on, a corner whose turn exceeds 50 degrees SHALL
receive a loop of the base curve, tucked inside the angle along the bisector at
0.9 of the join radius, with a join radius of 11 units.

The loop SHALL be sampled at 72 points, with its radial factor floored at 0.35
when the curves switch is on and flat at 1 when it is off.

The bisector SHALL be scaled horizontally by the letter width factor before it
is normalised, so a loop sits correctly in a letter that has been widened.

#### Scenario: A sharp corner

- **WHEN** a corner turns more than 50 degrees and joins are on
- **THEN** a loop of the curve is drawn inside the angle

#### Scenario: A shallow corner

- **WHEN** a corner turns 50 degrees or less
- **THEN** no loop is drawn

#### Scenario: Joins off

- **WHEN** the looped joins switch is off
- **THEN** no loop is drawn at any corner

### Requirement: Bowls are drawn once per pass with that pass's pen

A closed bowl SHALL be stroked as a closed ring, offset on both sides by the
pass's own pen, and drawn as two contours so the counter stays open.

#### Scenario: A counter stays open

- **WHEN** an o is drawn with any pen
- **THEN** the inside of the bowl is not filled

### Requirement: Every emitted coordinate is rounded to two decimals

The prototype SHALL be recorded as rounding every coordinate it writes to two
decimal places.

This sets a floor on how closely any port can be compared against it: a
coordinate can be out by up to 0.005 in each axis for reasons that have nothing
to do with correctness, which is a distance of about 0.00707 font units.

#### Scenario: The rounding floor

- **WHEN** a port is compared against the prototype's output
- **THEN** no tolerance tighter than about 0.00707 font units is meaningful
