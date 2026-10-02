# studio-shell Specification

## Purpose
A page a designer can open: the logo drawn, and redrawn whenever anything that
shapes it changes.

## Requirements

### Requirement: The studio draws the logo from the scene graph

The studio SHALL render what the engine returns and SHALL NOT compute geometry
of its own.

A calculation in the application is a calculation the parity comparison never
sees, so anything that decides where a point goes belongs in the engine.

#### Scenario: The page opens

- **WHEN** the studio is opened
- **THEN** the logo is drawn, with the mark and the letters

#### Scenario: No geometry in the application

- **WHEN** the studio's sources are inspected
- **THEN** they hold no stroking, no nesting and no glyph mathematics

### Requirement: The studio redraws when something changes

Every change that affects the drawing SHALL go through one path that rebuilds
the scene and redraws it. There SHALL NOT be a second way to update the page.

#### Scenario: The text changes

- **WHEN** the text is typed into
- **THEN** the logo redraws with the new text

#### Scenario: One path

- **WHEN** the studio's sources are inspected
- **THEN** one function rebuilds and redraws, and everything that changes state
  calls it

### Requirement: The studio states the width it lays out in

The studio SHALL pass the width it has to the engine, rather than the engine
reading it from anywhere.

#### Scenario: A width is passed

- **WHEN** the studio builds a logo
- **THEN** it supplies the available width as an input

### Requirement: An empty text says so

With no text, the studio SHALL say what to do rather than drawing nothing.

#### Scenario: The field is emptied

- **WHEN** the text field is cleared
- **THEN** the studio shows a prompt instead of an empty frame

### Requirement: Every control is generated from a declaration

A control SHALL be built from a parameter's declaration: its kind decides the
control, its range and step decide the bounds, and its default decides the
reset.

The studio SHALL NOT hold a range, a default or a step of its own. A control
written by hand SHALL be a defect.

#### Scenario: A parameter of each kind

- **WHEN** the controls are generated
- **THEN** a number gives a slider, an integer a stepped slider, an angle a
  slider in degrees, an enumeration a list, and a boolean a checkbox

#### Scenario: A new parameter

- **WHEN** a parameter is added to a registered module
- **THEN** it gets a control, with no change to the interface code

#### Scenario: The bounds come from the declaration

- **WHEN** a control is generated
- **THEN** its minimum, maximum and step are the declaration's

### Requirement: A control shows its value and can be reset

Each control SHALL show the value it currently holds, and SHALL offer a way back
to the declared default.

#### Scenario: The reading

- **WHEN** a control is moved
- **THEN** the value shown changes with it, and the logo redraws

#### Scenario: Reset

- **WHEN** a control is reset
- **THEN** it returns to the declared default

### Requirement: A locked parameter is left alone by randomize

Each lockable parameter SHALL have a lock. Randomize SHALL change every unlocked
parameter and no locked one.

Randomize SHALL draw from the seed the project carries, and SHALL advance that
seed, so a press can be repeated and a result returned to.

#### Scenario: Randomize

- **WHEN** randomize is pressed
- **THEN** the unlocked parameters change and the logo redraws

#### Scenario: A locked parameter

- **WHEN** a parameter is locked and randomize is pressed
- **THEN** its value is unchanged

#### Scenario: The same seed

- **WHEN** the seed is set back and randomize is pressed again
- **THEN** the same result comes back

### Requirement: The advanced controls are out of the way

A parameter declared as advanced SHALL be hidden until asked for, so the panel
shows what a designer reaches for first.

#### Scenario: Advanced hidden

- **WHEN** the studio opens
- **THEN** the advanced controls are not shown

#### Scenario: Advanced shown

- **WHEN** the advanced controls are asked for
- **THEN** they appear, generated the same way as the rest

### Requirement: The grid lines can be shown

The studio SHALL offer a switch that shows the grid lines over the drawing, off
when the page opens.

Turning it on SHALL redraw through the one path that every other change goes
through, and SHALL change nothing about the letters.

#### Scenario: Turning the grid on

- **WHEN** the grid switch is turned on
- **THEN** the rules and the character boxes appear over the drawing

#### Scenario: Turning it off again

- **WHEN** the switch is turned off
- **THEN** no guide is left in the drawing
