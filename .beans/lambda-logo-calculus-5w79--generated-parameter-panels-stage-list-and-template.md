---
# lambda-logo-calculus-5w79
title: Generated parameter panels, stage list and template gallery
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T09:58:33Z
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

- [x] Build the control set, one per `ParamDef` kind
- [x] Lock, value readout and reset to default on every control
- [x] Double-click to type an exact value
- [x] Generate panel structure from groups and the Advanced flag
- [x] Build the reorderable stage list
- [x] Build the template gallery with live thumbnails
- [x] End-to-end test: a parameter added to a registration appears with no UI change

## Summary of Changes

The panels are generated. 371 unit tests, 21 browser tests.

- One control per `ParamDef` kind, reading its range, step, options and default
  from the definition and nothing else. A `number` and an `angle` give a slider,
  an `int` a stepped slider, an `enum` a choice, a `bool` a checkbox and a
  `color` a colour input. Each control carries its `data-kind`, so the test
  asserts the mapping rather than the appearance.
- Every control shows its value, a lock and a reset. Locking writes the id into
  the project's lock list; a reset dispatches a command and can be undone.
- Double-clicking a slider gives a field for an exact value. 7.25 is taken
  exactly; 500 against a maximum of 20 is clamped to 20 and the control says so.
- Controls are grouped by their `group` and anything `advanced` is hidden until
  revealed. The bowls stage's inset, which defaults to 5, is reachable only
  behind that disclosure, which is what the stages epic declared it should be.
- The stage list switches, reorders and expands each stage, all through existing
  commands, so all three undo. Reordering uses `setStages`, which the store
  already had.
- The gallery shows all five templates with live thumbnails drawn at the
  project's own copies, rotation and palette. Changing the copy count redraws
  every thumbnail. Choosing a template carries that template's resolved
  defaults, so switching to the rose brings its lobe count in at 5.

**The rule is tested, not asserted.** No command kind was added: all fourteen
already existed and every control dispatches one of them. The whole letters
panel, including the ending, join, palette and pen choice, is four `ParamDef`s
declared in the studio and rendered by the same generic panel.

Two defects found by looking at the result rather than at a test. The clamped
notice was wiped by its own effect the moment typing ended, so it never showed;
it now clears when editing starts rather than when it finishes. And a panel
whose single group shared its title rendered the heading twice, while an ending
with no parameters rendered an empty section.

One test assertion was wrong rather than the code: disabling the bend stage
changes the geometry, not the number of paths, so counting paths proved nothing.
It now compares the path data.

Capability `parameter-panels` is a main spec with six requirements and seventeen
scenarios.

OpenSpec change archived as `2026-10-01-add-generated-panels`.
