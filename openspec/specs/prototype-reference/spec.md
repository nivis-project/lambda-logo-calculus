# prototype-reference Specification

## Purpose
The prototype is the authority this project is measured against. It is read,
driven and recorded, and it does not change while anything depends on it.

## Requirements

### Requirement: The prototype is frozen and the gate proves it

The repository SHALL hold a recorded digest of the prototype, and the gate SHALL
compare the file against it. A prototype whose content differs from the recorded
digest SHALL fail the gate.

#### Scenario: The prototype is unchanged

- **WHEN** the gate runs and the prototype matches its recorded digest
- **THEN** the check passes

#### Scenario: The prototype changed

- **WHEN** a byte of the prototype changes and the digest does not
- **THEN** the gate fails, and says that the prototype changed and that
  everything measured against it is now suspect

#### Scenario: The prototype is missing

- **WHEN** the prototype file is absent
- **THEN** the gate fails rather than treating a missing file as a match

### Requirement: Replacing the prototype is deliberate

Changing the prototype SHALL require updating the recorded digest in the same
change, and SHALL state in that change what moved and what has to be
re-recorded as a result.

#### Scenario: A deliberate replacement

- **WHEN** a change replaces the prototype and updates the digest together
- **THEN** the gate passes

#### Scenario: Half a replacement

- **WHEN** a change updates the digest but not the prototype, or the prototype
  but not the digest
- **THEN** the gate fails

### Requirement: The prototype is never edited to make a comparison easier

The prototype SHALL NOT be modified to suit the port, and SHALL NOT be partially
reimplemented in place of being run. A recording of the prototype SHALL be
produced by driving the prototype itself.

#### Scenario: A comparison that is hard

- **WHEN** comparing the port against the prototype is awkward
- **THEN** the port changes, or the comparison changes, and the prototype does
  not
