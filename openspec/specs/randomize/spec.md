# randomize Specification

## Purpose
Randomize is how a designer explores. It must never undo their decisions, must
never lose a result, and must be reproducible from what the project stores.

## Requirements

### Requirement: Randomize never moves a locked parameter

Randomize SHALL leave every parameter whose id is in the project's lock list
exactly as it was.

#### Scenario: A locked parameter survives

- **WHEN** a parameter is locked and randomize runs
- **THEN** its value afterwards is exactly what it was before

#### Scenario: Everything is locked

- **WHEN** every randomisable parameter is locked and randomize runs
- **THEN** the project is unchanged apart from its seed

#### Scenario: An unlocked parameter moves

- **WHEN** a parameter is not locked and randomize runs several times
- **THEN** it takes more than one distinct value across those runs

### Requirement: Randomize draws from the declared ranges

Randomize SHALL draw each parameter from the `randomize` range its definition
declares, or from its full range when it declares none. A parameter whose
`randomize` is `false` SHALL NOT be touched.

#### Scenario: A declared randomize range is honoured

- **WHEN** a parameter declares a randomize range narrower than its full range
- **THEN** every randomised value lies inside the narrower range

#### Scenario: A parameter opted out

- **WHEN** a parameter declares `randomize` as false
- **THEN** randomize leaves it alone

### Requirement: Randomize is reproducible from the project

Randomize SHALL draw from the seed stored in the project, and SHALL advance that
seed so a second press differs from the first.

A project restored to a given seed and randomised SHALL produce the same result
it produced before.

#### Scenario: The same seed gives the same result

- **WHEN** two projects with the same seed and the same values are randomised
- **THEN** both produce the same result

#### Scenario: A second press differs

- **WHEN** randomize runs twice in a row
- **THEN** the two results differ

#### Scenario: The seed is recorded in the command

- **WHEN** a randomize command is inspected in the log
- **THEN** it carries the seed it drew from

### Requirement: One randomize is one undo

A randomize SHALL change the project in a single command, so one press is undone
by one undo.

#### Scenario: A randomize is undone

- **WHEN** randomize runs and the designer undoes once
- **THEN** every value it changed returns at once

### Requirement: Every result reaches the variant strip

Each randomize SHALL add its result to the variant strip, so a result is never
lost by randomising again.

#### Scenario: Results accumulate

- **WHEN** randomize runs three times
- **THEN** the strip holds three variants

#### Scenario: A variant is restored

- **WHEN** the designer restores an earlier variant
- **THEN** the project returns to that result
- **AND** the restore can be undone

#### Scenario: A variant is removed

- **WHEN** the designer removes a variant
- **THEN** it leaves the strip and the others stay
