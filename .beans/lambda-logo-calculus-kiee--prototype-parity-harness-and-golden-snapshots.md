---
# lambda-logo-calculus-kiee
title: Prototype parity harness and golden snapshots
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:02:38Z
updated_at: 2026-09-30T22:03:17Z
parent: lambda-logo-calculus-zrss
blocked_by:
    - lambda-logo-calculus-5dnw
---

Prove the port. The core rendering the default settings must reproduce
`reference/trefoil-type.html` within an agreed tolerance, and the golden
snapshot suite must be in place before milestone 03 starts changing anything.

## Scope

- A harness that extracts the prototype's output for a fixed set of settings.
- A comparison that reports geometric difference, with a stated tolerance and a
  justification for it.
- Golden snapshots of the trefoil template against the test string
  "Hamburgefonstiv 0123", stored and reviewed on purpose.
- A documented procedure for approving a snapshot change.

## Todo

- [ ] Build the prototype extraction harness
- [ ] Define and justify the parity tolerance
- [ ] Prove parity for the default settings
- [ ] Prove parity across a spread of parameter values
- [ ] Add the golden snapshot suite and the approval procedure
