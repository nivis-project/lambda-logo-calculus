---
# lambda-logo-calculus-mvrv
title: 'Lockup registry: side and stacked'
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-ujb5
blocked_by:
    - lambda-logo-calculus-5w79
---

Lockups as registrations. The mark is placed by its real outline, not its
bounding box, and the layout switches to a stack when space runs out.

## Scope

- `Lockup` interface: mark outline plus text block to positions.
- Side lockup, with distance, height and size controls.
- Stacked lockup, entered automatically when space runs out.
- Mark placement by the real outline with the 6% optical enlargement kept from
  the prototype.
- Layout stays out of drawing; the lockup returns positions only.

## Todo

- [ ] Define the `Lockup` interface and registry
- [ ] Register the side lockup with distance, height and size
- [ ] Register the stacked lockup
- [ ] Automatic switch when space runs out
- [ ] Mark placement by real outline with the optical enlargement
- [ ] Property test: the mark never overlaps the text block
