## Purpose

The stroker gives a skeleton width. It is what makes the base curve usable as a
pen: the same shape that draws the mark decides how thick each letter is in each
direction.

## ADDED Requirements

### Requirement: A pen is a support table of 360 directions

A pen SHALL be a table of 360 entries, one per whole degree, where each entry is
the pen's extent from its centre in that direction. Looking up a direction SHALL
round to the nearest degree and wrap, so any angle resolves to an entry.

A round pen SHALL fill every entry with half the stroke width. A shape pen SHALL
fill each entry with the maximum, over the base curve's sampled points, of the
point projected onto that direction.

#### Scenario: A round pen is built

- **WHEN** a round pen is built for a stroke width of 10
- **THEN** all 360 entries are 5

#### Scenario: A shape pen follows the base curve

- **WHEN** a shape pen is built from the trefoil
- **THEN** its entries vary with direction
- **AND** no entry is below zero

#### Scenario: A direction is looked up

- **WHEN** the pen is asked for an angle of 361 degrees, of -1 degrees, or of
  any angle in radians
- **THEN** it returns the entry for the equivalent direction in 0 to 359

### Requirement: The stroker offsets a run along its normal

For each point of an open run, the stroker SHALL compute the direction from the
previous point to the next, take the normal to it, and offset the point by the
pen's support value in the normal's direction on one side and in the opposite
direction on the other.

The two offset sides SHALL join into one closed outline: the left side forward
then the right side backward.

#### Scenario: A straight run is stroked by a round pen

- **WHEN** a vertical run of length L is stroked by a round pen of half-width h
- **THEN** the outline is a rectangle of width 2h and height L, to within
  tolerance

#### Scenario: A closed ring is stroked

- **WHEN** a closed ring is stroked
- **THEN** two contours result, an outer and an inner, so the counter stays open

#### Scenario: Every outline closes

- **WHEN** any run or ring is stroked with any pen
- **THEN** the resulting outline's first and last points coincide

#### Scenario: No outline contains a non-finite coordinate

- **WHEN** any run or ring is stroked with any pen
- **THEN** every coordinate is finite

#### Scenario: A run of one point

- **WHEN** a run with fewer than two points is stroked
- **THEN** no outline is produced, rather than a degenerate one

### Requirement: Tapered and flared ends are a width profile, not an ending

The stroker SHALL accept a per-point width factor and multiply the pen's support
value by it. Tapered and flared ends SHALL be expressed through that factor
rather than by adding geometry.

A tapered end SHALL narrow towards a free end over a taper length. A flared end
SHALL widen towards a free end over a flare length. An end that is not free
SHALL NOT be tapered or flared, because it meets another stroke.

#### Scenario: A tapered free end narrows

- **WHEN** a run with a free start is stroked with a tapered profile
- **THEN** the outline's width at the free end is less than at the middle

#### Scenario: A flared free end widens

- **WHEN** a run with a free start is stroked with a flared profile
- **THEN** the outline's width at the free end is greater than at the middle

#### Scenario: An end that is not free is untouched

- **WHEN** a run whose start meets another stroke is stroked with a tapered
  profile
- **THEN** the width at that end is the unprofiled width

#### Scenario: The width factor never reaches zero

- **WHEN** a tapered profile is applied with any parameters
- **THEN** every width factor stays above zero, so the outline never collapses
