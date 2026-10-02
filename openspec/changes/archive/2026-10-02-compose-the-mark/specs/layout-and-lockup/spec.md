## ADDED Requirements

### Requirement: The mark is drawn where the lockup puts it

A scene SHALL hold the mark when it is on, at the scale and position the lockup
computed, in whichever arrangement the lockup chose.

The text SHALL start after the width the lockup reserved, so the letters and the
mark do not overlap.

#### Scenario: Beside the words

- **WHEN** the lockup places the mark beside the text
- **THEN** the scene holds the mark to the left of the first letter, and the
  text begins after the reserved width

#### Scenario: Above the words

- **WHEN** the lockup stacks the mark above the text
- **THEN** the scene holds the mark above the first line, and no width is
  reserved beside it

#### Scenario: The mark is off

- **WHEN** the mark is switched off
- **THEN** the scene holds only the letters, and nothing is reserved

### Requirement: The mark is measured by what it draws

The mark's size and position SHALL be computed from the extent of the geometry
it actually draws, not from the view box it was drawn into and not from the
curve's bounding circle.

A lobed shape does not fill its own bounding circle, and a stack of rotated
copies is not symmetric about its centre, so a mark placed by anything else sits
visibly off.

#### Scenario: A lopsided stack

- **WHEN** the copies are rotated so the stack is not symmetric about its centre
- **THEN** the mark is still centred on the text block by its drawn extent

#### Scenario: Empty corners

- **WHEN** the mark has empty corners
- **THEN** they do not push the words away
