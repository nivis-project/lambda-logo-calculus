## ADDED Requirements

### Requirement: The studio builds its scenes off the painting thread

The studio SHALL build its scenes in a worker, so a slow render arrives late
rather than freezing the window. A render that is overtaken by a newer one SHALL
be dropped rather than drawn.

#### Scenario: The window stays alive during a render

- **WHEN** a parameter is changed
- **THEN** the studio still responds to input while the scene is being built

#### Scenario: Only the newest render is drawn

- **WHEN** several changes arrive faster than they can be rendered
- **THEN** what is drawn is the newest, not the last to finish

### Requirement: The studio draws draft while a control is held

The studio SHALL draw at draft quality while a slider is being dragged and at
full quality when it is released.

#### Scenario: Dragging

- **WHEN** a slider is being dragged
- **THEN** the studio draws at draft quality

#### Scenario: Releasing

- **WHEN** the slider is released
- **THEN** the studio redraws at full quality

### Requirement: The studio reports how long a render took

The studio SHALL show the time the last render took, in milliseconds, and which
quality it was drawn at.

#### Scenario: The reading

- **WHEN** a render finishes
- **THEN** the studio shows how long it took and at which quality

### Requirement: The browser suite waits for a real render

The browser suite SHALL wait for the studio to have drawn before it asserts
anything, rather than for an element to exist. A scene built off the painting
thread arrives after the markup does, so an empty artboard is a normal state
rather than a failure.

#### Scenario: Opening the studio in a test

- **WHEN** a test opens the studio
- **THEN** it waits until a glyph has been drawn before asserting
