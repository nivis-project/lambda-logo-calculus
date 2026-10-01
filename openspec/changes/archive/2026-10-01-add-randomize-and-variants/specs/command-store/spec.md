## MODIFIED Requirements

### Requirement: Variants are named positions in the log

A variant snapshot SHALL record a name, the state at that moment, and a
thumbnail of what that state renders. Restoring a variant SHALL be itself a
command, so it can be undone.

A variant SHALL be removable. Variants SHALL live in the store rather than in
the project, so they do not enter a saved project file.

#### Scenario: A variant is taken and restored

- **WHEN** a variant is taken, the state changed, and the variant restored
- **THEN** the state equals what it was when the variant was taken

#### Scenario: Restoring a variant can be undone

- **WHEN** a variant is restored and then undone
- **THEN** the state equals what it was before the restore

#### Scenario: Variants survive unrelated edits

- **WHEN** several variants are taken and unrelated commands applied
- **THEN** every variant still restores the state it recorded

#### Scenario: A variant carries a thumbnail

- **WHEN** a variant is taken with a thumbnail
- **THEN** that thumbnail is readable from the variant

#### Scenario: A variant is removed

- **WHEN** a variant is removed by name
- **THEN** it is gone and the others remain

## ADDED Requirements

### Requirement: Randomize is a command kind

The store SHALL accept a `randomize` command carrying the definitions to draw
from, the seed to use, and the next seed to store. Applying it SHALL produce one
log entry.

#### Scenario: A randomize command is applied

- **WHEN** a randomize command is applied
- **THEN** the project's values change and its seed advances
- **AND** exactly one entry is added to the log

#### Scenario: A randomize command round-trips

- **WHEN** a randomize command is serialised and parsed back
- **THEN** applying the parsed command gives the same result
