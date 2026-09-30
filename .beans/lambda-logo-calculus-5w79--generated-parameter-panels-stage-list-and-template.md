---
# lambda-logo-calculus-5w79
title: Generated parameter panels, stage list and template gallery
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
parent: lambda-logo-calculus-02i9
blocked_by:
    - lambda-logo-calculus-9szv
---

Panels generated entirely from parameter definitions. A hand-written slider is a
bug. Adding a parameter to a registration makes it appear in the UI with no UI
code change.

## Scope

- A control per `ParamDef` kind: number, int, angle, enum, bool, color.
- Every control shows a lock, its value and a reset to default.
- Double-click a slider to type an exact value.
- Groups and the Advanced flag drive the panel structure.
- The stage list: switch a stage on or off, reorder it, edit its parameters.
- The template gallery with live thumbnails, drawn with the project's current
  copies, rotation and palette.

## Todo

- [ ] Build the control set, one per `ParamDef` kind
- [ ] Lock, value readout and reset to default on every control
- [ ] Double-click to type an exact value
- [ ] Generate panel structure from groups and the Advanced flag
- [ ] Build the reorderable stage list
- [ ] Build the template gallery with live thumbnails
- [ ] End-to-end test: a parameter added to a registration appears with no UI change
