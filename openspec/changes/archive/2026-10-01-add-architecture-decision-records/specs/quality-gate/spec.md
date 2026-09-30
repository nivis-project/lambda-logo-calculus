## MODIFIED Requirements

### Requirement: A red gate stops the ship before it is irreversible

The ship script SHALL run the gate before archiving. When the gate fails, the
script SHALL stop, and the change SHALL remain active, uncommitted and unpushed,
so the failure can be fixed and the ship retried.

When the gate passes, the script SHALL archive the change, close the linked bean
if one was named, and create exactly one commit holding the code, the archived
change, the spec updates, the changelog entry and the bean files together.

#### Scenario: The gate fails mid-ship

- **WHEN** `nix flake check` exits non-zero during a ship
- **THEN** the script exits non-zero
- **AND** the change is still present under `openspec/changes/`, not under
  `openspec/changes/archive/`
- **AND** no commit was created and nothing was pushed
- **AND** the linked bean is not marked completed

#### Scenario: The gate passes

- **WHEN** the gate exits zero
- **THEN** the change is archived, one commit is created, and `main` is pushed

#### Scenario: A bean id is given and the gate passes

- **WHEN** the ship script is given the id of a bean that exists, and the gate
  passes
- **THEN** the bean is marked completed before the commit is created
- **AND** the single commit contains both the archived change and the updated
  bean file

## ADDED Requirements

### Requirement: An unknown bean id stops the ship before it starts

When the ship script is given a bean id, it SHALL verify the bean exists before
staging, gating, archiving or committing anything. An id that names no bean
SHALL stop the ship with a message saying so.

#### Scenario: The bean id names nothing

- **WHEN** the ship script is given a bean id with no matching bean
- **THEN** it exits non-zero, naming the id
- **AND** nothing is staged, gated, archived, committed or pushed

#### Scenario: No bean id is given

- **WHEN** the ship script is called with only a change name and a commit
  subject
- **THEN** it ships without touching any bean, as before
