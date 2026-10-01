## ADDED Requirements

### Requirement: The Split stage breaks runs at sharp turns

A run SHALL be split into separate runs wherever it turns by more than a
declared threshold, defaulting to 25 degrees. Splitting SHALL happen after every
stage that reshapes a run, so the turn measured is the one the stroker will see.

The two runs on either side of a split SHALL share the point they were split at,
so no gap appears between them.

#### Scenario: A run with a sharp turn

- **WHEN** a run that turns by more than the threshold passes through the Split
  stage
- **THEN** it becomes two runs
- **AND** the last point of the first equals the first point of the second

#### Scenario: A run with no sharp turn

- **WHEN** a run that never turns by more than the threshold passes through
- **THEN** it is returned as one run, unchanged

#### Scenario: A run too short to turn

- **WHEN** a run of two points passes through
- **THEN** it is returned unchanged, because two points cannot turn

#### Scenario: The threshold is raised above every turn

- **WHEN** the threshold is set to 180 degrees
- **THEN** no run is split

## MODIFIED Requirements

### Requirement: Stages run in a fixed order and never look forward

The pipeline SHALL run the stages in list order: curves, bowls, bend,
proportions, split. A stage SHALL NOT read the output of a stage that runs after
it.

Splitting runs last, because the turns it measures are the ones the bend and
proportions stages leave behind, and because the stroker works on the runs it
produces.

#### Scenario: The default order is applied

- **WHEN** the default stage list is run
- **THEN** the stages apply in the order curves, bowls, bend, proportions, split

#### Scenario: The list is reordered

- **WHEN** two stages are swapped in the list
- **THEN** the pipeline applies them in the new order
