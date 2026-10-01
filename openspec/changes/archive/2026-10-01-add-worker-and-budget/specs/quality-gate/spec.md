## ADDED Requirements

### Requirement: The gate runs the budget benchmark

The gate SHALL run the render budget benchmark, so a change that makes the
pipeline slower than the budget fails the build rather than being noticed later.

#### Scenario: A slow change

- **WHEN** a change makes the draft render slower than the budget
- **THEN** the gate fails and names the measurement
