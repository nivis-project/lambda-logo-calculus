# endings-and-joins Specification

## Purpose
What happens at the end of a free stroke and at a sharp corner. Nine endings and
one join, each a registration rather than a branch, each available in a plain
form and a form built from the base curve.

## Requirements

### Requirement: An ending is a registration that returns geometry

An ending SHALL be a registered module with a pure `build(end, context)`
returning geometry. It SHALL NOT return markup, because the same geometry is
read by the live renderer and by every exporter.

The end context SHALL carry the end point, the outward direction, the half-width
there, and whether the run is curved.

#### Scenario: An ending returns geometry

- **WHEN** any ending is built
- **THEN** it returns outlines as coordinates, containing no markup string

#### Scenario: An ending is deterministic

- **WHEN** an ending is built twice from equal inputs
- **THEN** both results are equal

### Requirement: Nine endings are registered, each plain and shape-built

The endings registry SHALL contain `round`, `flat`, `angled`, `tapered`,
`flared`, `wedge`, `slab`, `hairline` and `ball`.

Each SHALL have a plain form and a form built from the base curve. The plain
forms are circles, rectangles, triangles, a fixed angled cut, a fixed flare and
a fixed taper. The shape-built forms use copies of the base curve, and the
angled cut turns with each copy's rotation.

#### Scenario: All nine are present

- **WHEN** the endings registry is listed
- **THEN** it contains exactly the nine named endings

#### Scenario: Both forms exist for each

- **WHEN** each ending is built with shape endings on and then off
- **THEN** both produce geometry, and the two differ

#### Scenario: A flat end adds nothing

- **WHEN** the `flat` ending is built
- **THEN** it adds no geometry, because the stroker's own outline already ends
  flat

### Requirement: Serifs on vertical strokes lie flat

For the `slab`, `hairline` and `wedge` endings, when the outward direction is
more vertical than horizontal, the serif SHALL be laid flat along the baseline,
the x-height or the cap line rather than square to the stroke.

#### Scenario: A serif on a vertical stem

- **WHEN** a slab serif is built on an end whose outward direction is mostly
  vertical
- **THEN** the serif's long axis is horizontal

#### Scenario: A serif on a horizontal arm

- **WHEN** a slab serif is built on an end whose outward direction is mostly
  horizontal
- **THEN** the serif's long axis is vertical, standing upright

### Requirement: Balls appear only on curved ends

The `ball` ending SHALL produce geometry only when the run it ends is curved.
On a straight run it SHALL produce nothing, so a stem is cut flat as most
ball-terminal faces do.

#### Scenario: A ball on a curved end

- **WHEN** the `ball` ending is built on a curved run
- **THEN** it produces a ball placed outward from the end point

#### Scenario: A ball on a straight end

- **WHEN** the `ball` ending is built on a straight run
- **THEN** it produces nothing

### Requirement: A join is a registration applied at sharp corners

A join SHALL be a registered module with a pure `build(corner, context)`. A
corner SHALL be detected where a run turns by more than a declared threshold,
defaulting to 50 degrees.

The looped join SHALL place a ring of the base curve along the corner's bisector,
at a declared loop radius defaulting to 11.

#### Scenario: A sharp corner produces a loop

- **WHEN** a run turns by more than the threshold
- **THEN** the looped join produces a closed ring at that corner

#### Scenario: A shallow corner produces nothing

- **WHEN** a run turns by less than the threshold
- **THEN** no join geometry is produced there

#### Scenario: The loop follows the base curve

- **WHEN** the looped join is built with the curves behaviour on
- **THEN** the ring's radius varies with the base curve, with a floor of 0.35

#### Scenario: The loop is a plain circle when the shape is not used

- **WHEN** the looped join is built with the curves behaviour off
- **THEN** the ring is a circle of the loop radius

### Requirement: One pipeline, with ornaments as a style

There SHALL be one pipeline from skeleton to outline. Ornaments SHALL be a style
applied to that pipeline's output, not a second path through it.

#### Scenario: Ornament style and letter style share a pipeline

- **WHEN** the same glyph is produced in letter style and in ornament style
- **THEN** both come from the same stroker and the same endings, differing only
  in the style applied
