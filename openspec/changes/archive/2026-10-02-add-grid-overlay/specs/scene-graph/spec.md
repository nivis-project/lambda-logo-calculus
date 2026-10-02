## ADDED Requirements

### Requirement: A scene can carry guides beside its artwork

A scene MAY carry a list of guides. A guide SHALL be plain data, SHALL sit
beside the root rather than inside it, and SHALL never be a child of a drawn
node.

A guide SHALL be one of two things: a rule, which is a horizontal line with a
y, a span, whether it is dashed, and an optional label; or a box, which is a
rectangle with a position and a size.

A scene built with guides turned off SHALL carry none, so nothing has to be
stripped out of it later.

#### Scenario: Guides are not artwork

- **WHEN** a scene is built with guides
- **THEN** its root holds exactly the nodes it would hold without them

#### Scenario: An export asks for no guides

- **WHEN** a scene is built with guides turned off
- **THEN** the scene carries no guides at all

### Requirement: The guides describe the grid each line sits on

When guides are built, each line of text SHALL get four rules: the baseline,
the x-height, the cap line and the descender, each spanning the scene's width.

The baseline SHALL be solid and the other three dashed. Only the first line's
rules SHALL be labelled, because the labels repeat.

Every character that draws something SHALL get a box around its advance,
running from the cap line to the descender.

#### Scenario: Two lines

- **WHEN** a scene of two lines is built with guides
- **THEN** there are eight rules, four about each line's baseline, and only the
  first line's four are labelled

#### Scenario: A space

- **WHEN** a line holds a space
- **THEN** no box is built for it, and the next character's box starts past it

### Requirement: The x-height rule follows the modulated x-height

The x-height rule SHALL be drawn at the x-height the letters were actually
built with, not at the grid's nominal x-height.

#### Scenario: The fit size moves

- **WHEN** two scenes are built from the same text at different fit sizes
- **THEN** their x-height rules sit at different heights, while their baselines,
  cap lines and descenders do not move

### Requirement: A renderer draws a guide as a hairline

A renderer SHALL draw a guide at a width that does not grow when the drawing is
scaled, so a guide stays a hairline at any size.

A renderer SHALL draw nothing for a scene that carries no guides.

#### Scenario: A scene without guides

- **WHEN** a scene with no guides is rendered
- **THEN** the output holds no guide markup
