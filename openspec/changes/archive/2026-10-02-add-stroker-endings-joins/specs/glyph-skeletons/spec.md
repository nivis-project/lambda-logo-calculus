## ADDED Requirements

### Requirement: The working skeleton carries its corners

A working skeleton SHALL carry the corners of its strokes: a point and the
bisector of the angle at it, for each turn sharper than the join threshold.

Corners SHALL be measured on the stroke as sampled and before it is bent,
because bending replaces a straight segment with twelve points and a bisector
measured from those points is the bisector of a different angle.

The stages that move points SHALL move the corners with them: the bend stage
leaves them where they are, and the proportions stage moves the point and
rescales the bisector.

#### Scenario: A sharp corner

- **WHEN** a stroke turns sharply and is run through the stages
- **THEN** the working skeleton holds a corner at that turn

#### Scenario: A shallow corner

- **WHEN** a stroke turns gently
- **THEN** no corner is recorded

#### Scenario: Corners follow the proportions

- **WHEN** the letter width changes
- **THEN** the corner's point moves with the rest of the glyph
