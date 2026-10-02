## ADDED Requirements

### Requirement: Coverage has a floor the gate enforces

The gate SHALL measure test coverage and SHALL fail when it falls below a
minimum of 70 percent across the project or 80 percent on the core packages.

The floors SHALL apply to branches as well as to lines and statements. A line
that ran once down one of its two paths is not a line that has been tested.

The core floor is higher because the core is pure: there is no excuse for an
untested branch in a function that does no input and no output.

#### Scenario: Below the overall floor

- **WHEN** coverage across the project is under 70 percent
- **THEN** the gate fails, and reports the measured figure against the threshold

#### Scenario: Below the core floor

- **WHEN** a core package is under 80 percent while the project figure is above
  70 percent
- **THEN** the gate still fails, and names the core package

#### Scenario: An untaken branch

- **WHEN** a function has two paths and the tests take one
- **THEN** branch coverage reflects it, and the floors are applied to that
  figure

#### Scenario: Coverage is reported even when it passes

- **WHEN** the gate passes
- **THEN** the measured coverage is in its output, so a number that is drifting
  downward is visible before it crosses the floor

### Requirement: Coverage is a floor, not a target

The project SHALL treat coverage as evidence that nothing was forgotten, not as
evidence that anything was tested well. The gate SHALL NOT be satisfied by
coverage alone: a change that raises coverage while removing assertions SHALL
still be a worse change.

This is a rule about how the number is read, and the testing strategy document
SHALL say so plainly, so that nobody writes a test whose purpose is the
percentage.

#### Scenario: What the strategy says

- **WHEN** the testing strategy is read
- **THEN** it names the kinds of test the project uses, what each is for, and
  states what coverage is and is not evidence of
