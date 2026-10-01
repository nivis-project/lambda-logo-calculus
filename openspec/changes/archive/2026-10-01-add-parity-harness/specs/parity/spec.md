## Purpose

Milestone 02 claimed to port the prototype. This capability is what turns that
claim into a measurement, and defines the point at which the prototype stops
being the thing the project is measured against.

## ADDED Requirements

### Requirement: The prototype is run, not reimplemented

The prototype's own code from `reference/trefoil-type.html` SHALL be executed in
a real browser and the geometry it computes recorded. The comparison SHALL NOT
reimplement the prototype's formulas, because a reimplementation proves only
that two transcriptions agree.

The recording SHALL be made by a committed script, stored in the repository, and
compared against by the gate. `reference/trefoil-type.html` is a frozen
reference file, so a recording of it is as current as re-running it.

The recording SHALL store the settings the prototype's controls actually took,
not the settings that were asked for, because its sliders snap to their step.

#### Scenario: The recording is made

- **WHEN** the recording script runs
- **THEN** it drives the prototype's real controls in a browser
- **AND** writes the values and geometry it produced to a committed file
- **AND** the reference file on disk is unmodified

#### Scenario: A slider snaps

- **WHEN** a setting is asked for that the prototype's slider cannot represent
- **THEN** the recording stores the value the slider took
- **AND** a test fails if that differs from what was asked for, so a snapped
  value is never silently compared against the unsnapped one

#### Scenario: The recording covers a spread

- **WHEN** the recording is inspected
- **THEN** it covers several amplitudes, several rotations and several glyphs

### Requirement: Comparison is geometric, with a stated tolerance

Two results SHALL be compared as geometry, not as text. The comparison SHALL
report the largest distance between corresponding points, in font units.

The tolerance SHALL be stated as a number with a written justification: what it
is, why it is that value, and what size of error it would still catch.

A failure SHALL report the largest difference found, where it was found, and the
tolerance it exceeded.

#### Scenario: Two identical results

- **WHEN** two identical point sets are compared
- **THEN** the reported difference is zero

#### Scenario: A small difference

- **WHEN** two point sets differ by less than the tolerance
- **THEN** the comparison passes and reports the difference it measured

#### Scenario: A difference beyond the tolerance

- **WHEN** two point sets differ by more than the tolerance
- **THEN** the comparison fails, naming the largest difference, its location and
  the tolerance

#### Scenario: Results of different lengths

- **WHEN** two point sets have different numbers of points
- **THEN** the comparison says so rather than comparing the common prefix

### Requirement: The nesting mathematics matches exactly

`perfectFit` and the copy scales are pure arithmetic over the same formula in
both implementations. They SHALL match to floating point equality, not within a
tolerance.

#### Scenario: perfectFit at the default settings

- **WHEN** `perfectFit` is computed by the prototype and by the core for the
  same amplitude and rotation
- **THEN** the two values are exactly equal

#### Scenario: perfectFit across a range

- **WHEN** `perfectFit` is computed across a spread of amplitudes and rotations
- **THEN** every pair is exactly equal

#### Scenario: Copy scales across a range

- **WHEN** the copy scales are computed across a spread of fit sizes and copy
  counts
- **THEN** every pair is exactly equal

### Requirement: Parity holds across a spread of settings, not one

Parity SHALL be proved for the prototype's defaults and for a spread of values
across amplitude, rotation, copy count, fit size and ending. Proving one setting
proves only that setting.

#### Scenario: The default settings

- **WHEN** the harness compares the default settings
- **THEN** the difference is within the tolerance

#### Scenario: A spread of settings

- **WHEN** the harness compares a matrix covering the parameter ranges
- **THEN** every combination is within the tolerance

#### Scenario: A combination fails

- **WHEN** any combination exceeds the tolerance
- **THEN** the suite fails naming that combination, rather than reporting an
  average

### Requirement: Golden snapshots take over as the baseline

Each template SHALL be rendered against the fixed test string
"Hamburgefonstiv 0123" and stored. A stored snapshot SHALL be compared on every
run.

The procedure for approving a snapshot change SHALL be written down. A snapshot
SHALL NOT be regenerated to make a failing run pass.

#### Scenario: A snapshot is stored and compared

- **WHEN** a template is rendered against the test string
- **THEN** the result is compared against the stored snapshot

#### Scenario: A snapshot changes

- **WHEN** a rendered result differs from its stored snapshot
- **THEN** the test fails and points at the approval procedure

#### Scenario: Parity is retired

- **WHEN** milestone 02 is archived
- **THEN** the golden snapshots are the baseline for later milestones
- **AND** the parity suite remains as a record of the port, not as the thing
  later changes are measured against
