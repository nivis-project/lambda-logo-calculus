---
# lambda-logo-calculus-549o
title: 04 The studio
status: completed
type: milestone
priority: normal
created_at: 2026-10-02T12:42:54Z
updated_at: 2026-10-02T13:41:47Z
blocked_by:
    - lambda-logo-calculus-bmm5
---

The prototype's own interface, rebuilt on the ported engine. A page a designer can open, with the controls the prototype has, drawing live.

Milestone 03 proved the geometry. This is what makes it usable: parameters in a panel rather than in a function call, a preview that redraws, and the mark placed beside the words.

## Scope

- A page that renders the wordmark and redraws when anything changes.
- Controls generated from the parameter definitions, not written by hand.
- The mark composed into the scene through the lockup that already computes its placement.
- Randomize and locks, drawing from the stored seed.
- The grid overlay.

## What is deliberately not here

The ornament mode. It is a second drawing path in the prototype that duplicates the layout and cuts its bowls with masks, and the scene graph has no masks by design. Reproducing it needs a decision that has not been made.
