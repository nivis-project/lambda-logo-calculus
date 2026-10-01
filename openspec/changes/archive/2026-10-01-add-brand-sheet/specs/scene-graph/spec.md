## ADDED Requirements

### Requirement: A scene can hold text

A scene SHALL be able to hold a text node carrying a position, a size, a fill
and a string. Text SHALL be anchored at its start, because a PDF cannot centre
text without font metrics and a sheet that differs between formats is worse than
one that only left-aligns.

Measuring a scene SHALL ignore text, because its extent depends on a font the
scene does not carry.

#### Scenario: Text in a rendered scene

- **WHEN** a scene holding text is rendered
- **THEN** the text appears at its position, in its size and its fill

#### Scenario: Text does not move the bounds

- **WHEN** a scene holding text is measured
- **THEN** the bounds are those of its paths alone

#### Scenario: Cleaning leaves text alone

- **WHEN** a scene holding text is cleaned for export
- **THEN** the text is unchanged

### Requirement: A scene can be composed into another

A scene SHALL be placeable inside another at a position and a scale, as a group
carrying that transform. Composing SHALL NOT change the scene being placed.

#### Scenario: Placing a scene

- **WHEN** a scene is placed at a position and a scale
- **THEN** its geometry appears there, scaled by that amount

#### Scenario: The placed scene is untouched

- **WHEN** a scene is placed
- **THEN** the scene that was given is unchanged
