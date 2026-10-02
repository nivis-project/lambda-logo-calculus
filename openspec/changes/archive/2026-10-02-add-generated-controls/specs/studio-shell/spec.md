## ADDED Requirements

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
