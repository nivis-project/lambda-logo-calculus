## Purpose

One command puts a developer in the same environment the gate runs in, with the
same tool versions, on any supported machine.

## ADDED Requirements

### Requirement: One command enters the development environment

Entering the development environment SHALL be one command that requires no prior
installation beyond Nix itself. It SHALL need no manual setup step, no version
manager and no instruction to install anything by hand.

#### Scenario: A fresh machine

- **WHEN** someone with only Nix installed enters the development environment
- **THEN** every tool the project uses is on the path, with no further setup

#### Scenario: What the shell says

- **WHEN** the development environment is entered
- **THEN** it names the project and the versions of the toolchain it carries

### Requirement: The environment and the gate resolve the same versions

The development environment and the gate SHALL draw every tool from the same
pinned source. A tool version available to a developer SHALL be the version the
gate uses.

#### Scenario: A version in both places

- **WHEN** a tool's version is read inside the development environment and
  inside the gate
- **THEN** the two agree

#### Scenario: Pinning is explicit

- **WHEN** the pinned source is inspected
- **THEN** it names an exact revision, not a moving reference

### Requirement: The environment is built for four systems

The development environment and the gate SHALL be defined for 64-bit Linux and
macOS, on both x86 and ARM. The definition SHALL be written once and applied
across those systems rather than repeated per system.

#### Scenario: A supported system

- **WHEN** the environment is entered on any of the four supported systems
- **THEN** it builds and provides the same toolchain

#### Scenario: Adding a system later

- **WHEN** a fifth system is added
- **THEN** it is added in one place, and the definitions do not have to be
  duplicated

### Requirement: The environment carries the project's tools

The development environment SHALL carry the language runtime, the package
manager, the test runner, the linter and the version control tools the project
uses.

#### Scenario: Running the suite by hand

- **WHEN** a developer runs the test suite inside the development environment
- **THEN** it runs, without installing anything first

#### Scenario: Version control

- **WHEN** a developer commits inside the development environment
- **THEN** the version control tools the project uses are available
