## ADDED Requirements

### Requirement: A path holds only the contours that must interact

A path node SHALL hold the contours that are meant to cut each other through
the fill rule, and no others.

A ring's outside and inside SHALL share a path, because that is what makes its
counter. An outline, an ending and a stamp SHALL each have their own, because
where they overlap they are meant to be solid.

Merging them is how a stamp covering a joint becomes a hole in the letter.

#### Scenario: A ring

- **WHEN** a bowl is drawn
- **THEN** its two sides share one path and the counter is open

#### Scenario: A stamp over a joint

- **WHEN** a stamp is drawn where two runs meet
- **THEN** it is solid, and does not cut a hole in what is under it

#### Scenario: An ending over its stroke

- **WHEN** a round ending overlaps the stroke it caps
- **THEN** the overlap is solid
