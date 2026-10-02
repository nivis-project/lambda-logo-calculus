---
# lambda-logo-calculus-j1l7
title: Controls generated from the parameter definitions
status: completed
type: epic
priority: normal
created_at: 2026-10-02T12:43:11Z
updated_at: 2026-10-02T13:31:37Z
parent: lambda-logo-calculus-549o
blocked_by:
    - lambda-logo-calculus-f3o5
openspec-link: openspec/changes/archive/2026-10-02-add-generated-controls
---

Every control comes from a declaration. A hand-written slider is a defect.

## Scope

- A control per parameter kind: number, integer, angle, enumeration, boolean.
- The value shown, and a reset.
- Locks, and randomize from the stored seed.
- The switches for the four stages.

## Todo

- [ ] Generate a control from each parameter kind
- [ ] Locks and randomize, drawing from the seed
- [ ] The stage switches
- [ ] End-to-end test: a parameter added to a module gets a control with no UI code
