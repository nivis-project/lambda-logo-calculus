## Purpose

A new ending, stage, template, palette, lockup or exporter is added by writing
one module and registering it. This capability is the registration mechanism:
what a registered module must carry, how it is found, and what happens when two
modules claim the same name.

## ADDED Requirements

### Requirement: A registered module carries its own description

Every registered module SHALL carry an id, a version, a label and its parameter
definitions. The id SHALL be stable across versions, because a project file
stores it.

#### Scenario: A module is registered

- **WHEN** a module with an id, a version, a label and parameter definitions is
  registered
- **THEN** it can be retrieved from the registry by its id

#### Scenario: A module omits a required field

- **WHEN** a module is registered without an id, a version or a label
- **THEN** the registration is rejected, saying which field is missing

#### Scenario: A module declares a malformed parameter

- **WHEN** a module is registered carrying a parameter definition that is itself
  invalid
- **THEN** the registration is rejected, naming the module and the parameter

### Requirement: Registries are separate per kind and reject duplicates

Each extension point SHALL have its own registry. Registering two modules with
the same id into the same registry SHALL be rejected, so a typo that shadows a
built-in module fails at start-up instead of changing a project's output.

#### Scenario: Two modules claim one id

- **WHEN** a module is registered with an id already present in that registry
- **THEN** the registration is rejected, naming the id

#### Scenario: One id in two registries

- **WHEN** a template and an ending are both registered with the id `trefoil`
- **THEN** both registrations succeed, because the registries are separate

#### Scenario: A registry is listed

- **WHEN** a registry holding several modules is listed
- **THEN** every registered module is returned, each with its id, version and
  label

#### Scenario: An unknown id is requested

- **WHEN** a module is requested by an id that was never registered
- **THEN** the lookup reports that it is missing, naming the id and the registry

### Requirement: Registration does not depend on load order

The result of looking up a module SHALL NOT depend on the order in which modules
were registered. A registry SHALL hold no mutable state beyond its own contents.

#### Scenario: Modules are registered in a different order

- **WHEN** the same set of modules is registered into two registries in
  different orders
- **THEN** looking up any id returns the same module from both
- **AND** listing both returns the same set
