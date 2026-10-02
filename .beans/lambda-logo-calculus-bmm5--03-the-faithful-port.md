---
# lambda-logo-calculus-bmm5
title: 03 The faithful port
status: completed
type: milestone
priority: normal
created_at: 2026-10-02T10:27:26Z
updated_at: 2026-10-02T12:30:00Z
blocked_by:
    - lambda-logo-calculus-ao85
---

Build to the specs from milestone 02, and prove the result matches the prototype within the stated tolerance.

The port is finished when the fixture says so, not when it looks right.

## Scope

- The pipeline built to the specs, one stage at a time, each with its own change.
- A parity suite comparing the port against the recorded fixture.
- Golden snapshots taking over as the baseline once parity is archived.
- Known-value tests for the mathematics that has answers we can write down.
- Property tests for the invariants that must hold for every parameter set.
