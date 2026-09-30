## Purpose

Defines the single check that stands between an implemented change and the main
branch: what it verifies, where it runs, and what it refuses to do when
something is wrong. Everything the project claims about its own correctness
rests on this gate being unskippable.

## ADDED Requirements

### Requirement: One command is the whole gate

`nix flake check` SHALL be the complete gate. It SHALL verify, in the Nix
sandbox with no network access:

- every package type-checks and builds
- lint passes across the workspace, including the core boundary rules
- the unit and property tests pass
- coverage meets its thresholds
- the built core bundle contains no forbidden import, global or
  non-deterministic call
- the end-to-end suite passes against the built studio

No part of the gate SHALL depend on a tool, a browser or a package that is not
resolved by the flake.

#### Scenario: A developer runs the gate on a clean tree

- **WHEN** `nix flake check` runs on a tree where every check would pass
- **THEN** it exits zero and reports that all checks passed

#### Scenario: A test fails

- **WHEN** a unit or property test fails
- **THEN** `nix flake check` exits non-zero and the failing test's name and
  message appear in its output

#### Scenario: The machine has no network

- **WHEN** `nix flake check` runs with no network access and a populated Nix
  store
- **THEN** it completes, because every dependency is fetched by a fixed-output
  derivation before the sandbox is entered

### Requirement: Coverage thresholds are enforced, not reported

The gate SHALL fail when coverage falls below 70% of statements and branches
across the workspace, or below 80% of statements and branches in
`packages/core`. The higher core threshold reflects that the core is pure and
has no IO to excuse an untested branch.

#### Scenario: Core coverage drops below its threshold

- **WHEN** a change lowers `packages/core` statement coverage to 79%
- **THEN** the gate fails and names the threshold, the measured value and the
  package

#### Scenario: Coverage is above both thresholds

- **WHEN** workspace coverage is at or above 70% and core coverage is at or
  above 80%
- **THEN** the coverage step passes

### Requirement: A change with unfinished tasks cannot be shipped

The ship script SHALL refuse to run when the change's `tasks.md` still contains
an unchecked task. It SHALL refuse before staging, gating, archiving or
committing anything.

#### Scenario: A task is still unchecked

- **WHEN** `scripts/ship-change.sh <change>` runs and `tasks.md` contains at
  least one `- [ ]` line
- **THEN** the script exits non-zero, naming the file
- **AND** the change is not archived, nothing is committed and nothing is pushed

#### Scenario: The named change does not exist

- **WHEN** the script is given a change name with no directory under
  `openspec/changes/`
- **THEN** it exits non-zero, saying so, and changes nothing

### Requirement: A red gate stops the ship before it is irreversible

The ship script SHALL run the gate before archiving. When the gate fails, the
script SHALL stop, and the change SHALL remain active, uncommitted and unpushed,
so the failure can be fixed and the ship retried.

#### Scenario: The gate fails mid-ship

- **WHEN** `nix flake check` exits non-zero during a ship
- **THEN** the script exits non-zero
- **AND** the change is still present under `openspec/changes/`, not under
  `openspec/changes/archive/`
- **AND** no commit was created and nothing was pushed

#### Scenario: The gate passes

- **WHEN** the gate exits zero
- **THEN** the change is archived, one commit is created, and `main` is pushed

### Requirement: Commits carry no attribution to a tool

Every commit the ship script creates SHALL be authored by Pim Snel
<post@pimsnel.com> and SHALL NOT contain a `Co-authored-by` trailer, a
"Generated with" line, or any other attribution to an assistant or a vendor.

#### Scenario: A change is shipped

- **WHEN** the ship script commits
- **THEN** the commit author is Pim Snel <post@pimsnel.com>
- **AND** the commit message contains no attribution trailer
