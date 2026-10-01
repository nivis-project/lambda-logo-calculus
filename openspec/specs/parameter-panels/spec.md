# parameter-panels Specification

## Purpose
Every control in the studio is derived from a parameter definition. Adding a
parameter to a registration makes a control appear; writing a control by hand is
a defect.

## Requirements

### Requirement: A control is derived from its definition

The studio SHALL render one control per `ParamDef`, chosen by its kind. A
`number` and an `angle` SHALL give a slider, an `int` a stepped slider, an
`enum` a choice, a `bool` a checkbox and a `color` a colour input.

A control SHALL read its range, step, options and default from the definition,
not from anywhere else.

#### Scenario: Each kind gets its control

- **WHEN** a panel is built from definitions covering all six kinds
- **THEN** each renders the control its kind calls for

#### Scenario: The range comes from the definition

- **WHEN** a numeric definition declares a minimum of 1 and a maximum of 20
- **THEN** its slider cannot be moved outside that range

#### Scenario: A parameter is added to a registration

- **WHEN** a parameter is added to a registered module's definitions
- **THEN** a control for it appears in the panel
- **AND** no code under the studio's control layer changed

### Requirement: Every control offers a lock, a value and a reset

Each control SHALL show its current value, a lock, and a reset to its default.

Locking SHALL record the parameter id in the project's lock list. Resetting
SHALL dispatch a command, so it can be undone.

#### Scenario: A value is shown

- **WHEN** a control is rendered
- **THEN** its current value is readable next to it

#### Scenario: A parameter is locked

- **WHEN** the designer locks a parameter
- **THEN** its id is in the project's lock list
- **AND** unlocking removes it

#### Scenario: A parameter is reset

- **WHEN** the designer resets a parameter that was changed
- **THEN** it returns to the default its definition declares
- **AND** the reset can be undone

### Requirement: An exact value can be typed

Double-clicking a slider SHALL offer a field to type an exact value. A value
outside the declared range SHALL be refused or clamped, and the control SHALL
say which.

#### Scenario: A value is typed

- **WHEN** the designer double-clicks a slider and types a value in range
- **THEN** the parameter takes that exact value

#### Scenario: A value outside the range is typed

- **WHEN** the designer types a value outside the declared range
- **THEN** the parameter takes the nearest value inside it and the control says
  it was clamped

### Requirement: Groups and the advanced flag shape the panel

Controls SHALL be grouped by the `group` on their definition. A control marked
`advanced` SHALL be hidden until the designer asks for it.

#### Scenario: Controls are grouped

- **WHEN** definitions declare two different groups
- **THEN** the panel shows two groups, each holding its own controls

#### Scenario: Advanced controls are hidden

- **WHEN** a definition is marked advanced
- **THEN** its control is not shown until advanced controls are revealed

### Requirement: The stage list is switchable and reorderable

The right panel SHALL list the stages in pipeline order. Each SHALL be
switchable, reorderable, and show its own parameters.

Reordering and switching SHALL both go through a command, so both can be undone.

#### Scenario: A stage is switched off

- **WHEN** the designer switches off a stage
- **THEN** the wordmark redraws without it
- **AND** the change can be undone

#### Scenario: A stage is moved

- **WHEN** the designer moves a stage up the list
- **THEN** the list order changes and the wordmark redraws
- **AND** the change can be undone

#### Scenario: A stage's parameters are shown

- **WHEN** a stage is expanded
- **THEN** its own parameter definitions give it controls

### Requirement: The gallery shows every template in context

The left panel SHALL show a gallery with one entry per registered template, each
drawn with the project's current copies, rotation and palette, so a designer
compares them in context rather than in the abstract.

Choosing a template SHALL dispatch a command carrying that template's resolved
defaults.

#### Scenario: The gallery lists every template

- **WHEN** the gallery is rendered
- **THEN** it shows one entry per registered template

#### Scenario: A thumbnail follows the project

- **WHEN** the copy count changes
- **THEN** every thumbnail redraws with the new count

#### Scenario: A template is chosen

- **WHEN** the designer chooses a different template
- **THEN** the project's template id changes and its parameters take that
  template's defaults
- **AND** the change can be undone
