## ADDED Requirements

### Requirement: A lockup is a registered module

A lockup SHALL be a registered module carrying an id, a version, a label and its
parameter definitions, with a pure `place(input)` returning positions.

The registry SHALL contain `side` and `stacked`.

#### Scenario: Both built-in lockups are registered

- **WHEN** the lockup registry is listed
- **THEN** it contains exactly `side` and `stacked`

#### Scenario: A lockup is pure

- **WHEN** a lockup is placed twice from equal inputs
- **THEN** both results are equal

### Requirement: A placement says where the mark and the text block go

A placement SHALL carry the mark's position and scale, the text block's
position, and the baseline position of each line.

Positions SHALL be measured downward from the placement's top left corner, the
way SVG measures, so a larger y is further down. The first baseline is therefore
a cap height below the text block's top, and each later one a line height below
the last.

It SHALL carry no geometry: no contours, no colours and no scene nodes.

#### Scenario: A placement is inspected

- **WHEN** a placement is produced
- **THEN** it carries a mark position and scale, a text position, and one
  baseline per line
- **AND** it contains no path data

#### Scenario: The lines come from the wrap

- **WHEN** the text wraps to two lines
- **THEN** the placement carries two baselines, the second one line height below
  the first

#### Scenario: Positions measure downward

- **WHEN** a placement is produced
- **THEN** no position is above the top edge and no baseline is below the
  placement's height

### Requirement: The side lockup puts the mark to the left of the text

The side lockup SHALL place the mark to the left of the text block, separated by
the gap the distance setting produces, with the text starting after the reserved
width.

#### Scenario: The mark is left of the text

- **WHEN** the side lockup places a mark and a one-line text
- **THEN** the mark's right edge is at or before the text's left edge

#### Scenario: The distance setting widens the gap

- **WHEN** the distance setting is raised
- **THEN** the space between the mark and the text grows

### Requirement: The stacked lockup puts the mark above the text

The stacked lockup SHALL place the mark above the text block, with both centred
on the same vertical axis.

#### Scenario: The mark is above the text

- **WHEN** the stacked lockup places a mark and a text
- **THEN** the mark's bottom edge has a y at or below the text block's top edge,
  which in a downward-measuring space means the mark sits above it

#### Scenario: Both are centred

- **WHEN** the stacked lockup places a mark and a text
- **THEN** the centre of the mark and the centre of the text block share an x
  coordinate, to within tolerance

### Requirement: The mark is measured by its outline, not its box

The mark's extent SHALL be computed from the geometry it actually draws, not
from the viewBox it was rendered into.

#### Scenario: A mark with empty space in its box

- **WHEN** a mark whose drawn geometry fills less than its viewBox is measured
- **THEN** its reported bounds match the drawn geometry, not the viewBox

#### Scenario: An empty mark

- **WHEN** a scene with no geometry is measured
- **THEN** the measurement reports that there is nothing to place rather than
  returning a degenerate box

### Requirement: The layout still stacks when a side lockup would break a word

The automatic switch to stacking SHALL be kept: when a side lockup would force a
word to break mid-word, the layout SHALL stack instead and reserve no side
space.

#### Scenario: Space runs out

- **WHEN** the available width is too narrow for a side lockup without breaking
  a word
- **THEN** the placement is the stacked one
- **AND** no width is reserved to the side
