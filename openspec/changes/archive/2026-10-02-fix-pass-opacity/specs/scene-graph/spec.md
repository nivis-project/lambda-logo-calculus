## ADDED Requirements

### Requirement: A group can carry an opacity

A group node SHALL be able to carry an opacity. Its children SHALL be drawn
and flattened together, and the opacity applied to the result.

A group SHALL also be able to carry a fill, which its children inherit unless
they set their own.

Opacity on a group and opacity on each of its children are different drawings.
On the children, overlaps between them blend twice and show as seams and dark
patches. On the group, they do not.

#### Scenario: Two overlapping shapes in a group

- **WHEN** two semi-transparent shapes overlap inside a group whose opacity is
  set
- **THEN** their overlap is the same shade as each of them alone

#### Scenario: Two overlapping shapes with their own opacity

- **WHEN** the same two shapes each carry the opacity instead
- **THEN** their overlap is darker, which is why a pass sets it on its group

#### Scenario: A pass

- **WHEN** a pass of a glyph is built
- **THEN** its opacity is on the group, and its paths carry none
