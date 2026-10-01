## ADDED Requirements

### Requirement: The browser suite builds what it tests

The browser suite SHALL build the studio before serving it, so it always runs
against the working tree rather than against whatever was built last.

#### Scenario: A change with no rebuild

- **WHEN** the browser suite is run after a source change and no manual build
- **THEN** it builds first, and tests the changed code

#### Scenario: A stale build cannot pass

- **WHEN** the built bundle is older than the source
- **THEN** the suite does not run against it
