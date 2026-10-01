## ADDED Requirements

### Requirement: The ship script validates the change before it gates

The ship script SHALL validate the OpenSpec change before running the gate. A
malformed delta SHALL stop the ship in seconds, rather than after the build,
the lint, the test suite and the browser suite have all run.

#### Scenario: A malformed delta

- **WHEN** the ship script is given a change whose delta does not validate
- **THEN** it exits non-zero before running the gate, reporting what is wrong

#### Scenario: A valid change

- **WHEN** the change validates
- **THEN** the ship proceeds to the gate as before
