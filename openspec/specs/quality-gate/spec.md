# quality-gate Specification

## Purpose
One command decides whether work is fit to ship. It runs the same way on every
machine and inside a sandbox with no network, and nothing archives or commits
while it is red.

## Requirements

### Requirement: One command gates everything

The project SHALL have a single gate command. The gate SHALL build the project,
lint it and run the test suite. It SHALL report which of those failed.

No other definition of "is this ready" SHALL exist. A check that matters belongs
inside the gate; a check outside it is not a check.

#### Scenario: A healthy project

- **WHEN** the gate runs against a project whose build, lint and tests all pass
- **THEN** it exits zero

#### Scenario: A failing test

- **WHEN** a test fails
- **THEN** the gate exits non-zero and names the failing test

#### Scenario: Lint and build failures are told apart

- **WHEN** the gate fails
- **THEN** its output says which step failed, rather than reporting only that
  the gate failed

### Requirement: The gate cannot pass vacuously

The gate SHALL fail when there is nothing to check. A build with no sources, or
a test run that finds no tests, SHALL be treated as a failure rather than as a
success with nothing to do.

A gate that passes because a project is empty is worse than no gate, because it
reports a verdict it did not reach.

#### Scenario: No tests

- **WHEN** the test suite finds no test files
- **THEN** the gate fails and says that no tests were found

#### Scenario: One passing test

- **WHEN** the suite holds a single test and it passes
- **THEN** the gate passes, having actually run it

### Requirement: The gate runs offline and reproducibly

The gate SHALL run with no network access. Every tool and every dependency it
needs SHALL be resolved from a pinned source, so the gate gives the same answer
on a laptop, on a colleague's machine and in continuous integration.

Dependencies that come from a package registry SHALL be fetched through a
content-addressed step whose expected hash is recorded in the repository.

#### Scenario: No network

- **WHEN** the gate runs with networking unavailable
- **THEN** it completes, because every input was resolved beforehand

#### Scenario: A dependency changed without its hash

- **WHEN** the dependency manifest or lockfile changes and the recorded hash
  does not
- **THEN** the gate fails, and its message names the recorded hash and the hash
  it actually got

#### Scenario: The same commit twice

- **WHEN** the gate runs twice on the same commit
- **THEN** it reaches the same verdict both times

### Requirement: Nothing ships while the gate is red

Archiving an OpenSpec change, closing its bean, committing and pushing SHALL all
happen after the gate passes, and SHALL NOT happen when it fails.

A ship that is stopped by the gate SHALL leave the repository exactly as it
found it.

#### Scenario: The gate fails mid-ship

- **WHEN** the ship script runs and the gate fails
- **THEN** the change is not archived, no bean is closed, nothing is committed
  and nothing is pushed

#### Scenario: The gate passes

- **WHEN** the gate passes
- **THEN** the ship continues to archive, close, commit and push

### Requirement: A red gate says what to do

The gate's failure output SHALL name what failed and what would fix it. A
message that only reports failure teaches people to stop reading it.

#### Scenario: A missing prerequisite

- **WHEN** the gate cannot run because something it depends on is absent
- **THEN** it fails, says plainly what is missing, and does not pass by default
