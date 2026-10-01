## MODIFIED Requirements

### Requirement: One command is the whole gate

The gate SHALL verify, before any change is archived:

- every package type-checks and builds
- lint passes across the workspace, including the core boundary rules
- the unit, property, snapshot and parity tests pass
- coverage meets its thresholds
- the built core bundle contains no forbidden import, global or
  non-deterministic call
- the end-to-end suite passes against the built studio

`nix flake check` SHALL run everything in that list except the end-to-end suite,
in the Nix sandbox with no network access. The end-to-end suite SHALL run in the
dev shell, which the flake itself pins.

`scripts/ship-change.sh` SHALL run both, and SHALL stop on either failing.

Chromium inside the Nix build sandbox cannot load the studio page; the reason is
recorded in ADR 0009 along with what was ruled out. When that is solved, the
suite moves back inside and this requirement returns to one command.

#### Scenario: A developer runs the gate on a clean tree

- **WHEN** `nix flake check` and `nix develop -c pnpm e2e` both run on a tree
  where every check would pass
- **THEN** both exit zero

#### Scenario: A test fails

- **WHEN** a unit or property test fails
- **THEN** `nix flake check` exits non-zero and the failing test's name and
  message appear in its output

#### Scenario: A browser test fails

- **WHEN** an end-to-end test fails
- **THEN** the ship script exits non-zero before archiving anything

#### Scenario: The machine has no network

- **WHEN** `nix flake check` runs with no network access and a populated Nix
  store
- **THEN** it completes, because every dependency is fetched by a fixed-output
  derivation before the sandbox is entered
