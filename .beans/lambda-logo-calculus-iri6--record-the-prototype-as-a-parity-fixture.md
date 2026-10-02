---
# lambda-logo-calculus-iri6
title: Record the prototype as a parity fixture
status: todo
type: epic
priority: normal
created_at: 2026-10-02T10:27:51Z
updated_at: 2026-10-02T10:28:03Z
parent: lambda-logo-calculus-ao85
blocked_by:
    - lambda-logo-calculus-2ujg
---

Drive the prototype in a real browser, through its own controls, and record what it renders.

Nothing of the prototype is reimplemented to produce the fixture. A reimplementation would only prove that two transcriptions agree.

## Scope

- A recorder that loads the prototype, drives its real controls and reads back the values its inputs actually took.
- A matrix wide enough that it cannot shrink to one easy case.
- A committed fixture, regenerable by one command.
- A derived tolerance, with the derivation written down.

## Todo

- [ ] Write the recorder
- [ ] Record a matrix of settings and commit the fixture
- [ ] Derive the tolerance and write down why it is that number
- [ ] Add a test that fails when a coordinate is nudged
