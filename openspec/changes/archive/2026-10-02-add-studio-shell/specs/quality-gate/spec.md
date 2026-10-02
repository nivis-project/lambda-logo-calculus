## ADDED Requirements

### Requirement: The ship runs the browser suite

A ship SHALL run the browser suite after the gate, and SHALL stop when either
fails.

The browser suite SHALL build the studio before serving it, so it always tests
the working tree rather than whatever was built last.

#### Scenario: A broken page

- **WHEN** the studio does not render and a ship is attempted
- **THEN** the ship stops before archiving, closing a bean or committing

#### Scenario: A stale build

- **WHEN** the built bundle is older than the source
- **THEN** the suite builds first and tests the change

#### Scenario: Where it runs

- **WHEN** the browser suite runs
- **THEN** it runs in the development environment, not inside the sandbox,
  because the sandbox carries no browser
