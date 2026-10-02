# module-registry Specification

## Purpose
One way to add a template, a palette, an ending, a stage or a glyph set: write a
module and register it. Not a new branch in a switch.

## Requirements

### Requirement: A registered module carries its own identity and parameters

A registered module SHALL carry an id, an integer version, a human-readable
label, and its own parameter definitions.

A feature SHALL be added by registering a module. Growing a switch statement
instead SHALL be a defect.

#### Scenario: A module is registered

- **WHEN** a module with an id, a version, a label and parameters is registered
- **THEN** it can be fetched by its id

#### Scenario: A module missing its identity

- **WHEN** a module without an id, without an integer version or without a label
  is registered
- **THEN** it is refused, and the message says which is missing

### Requirement: The registry refuses a duplicate id

Registering a module whose id is already taken SHALL be refused, so a typo
cannot silently shadow a built-in module.

#### Scenario: A duplicate

- **WHEN** a second module with an existing id is registered
- **THEN** it is refused and the first is unchanged

#### Scenario: An unknown id

- **WHEN** a module is fetched by an id nobody registered
- **THEN** the failure names the id and the kind of module expected

### Requirement: A registry knows its own kind

Each registry SHALL be for one kind of module, and SHALL name that kind in
whatever it reports, so a failure says what was being registered.

#### Scenario: A failure names the kind

- **WHEN** a palette registry refuses something
- **THEN** the message says it was a palette
