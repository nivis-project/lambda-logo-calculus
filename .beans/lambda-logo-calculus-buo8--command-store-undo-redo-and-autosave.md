---
# lambda-logo-calculus-buo8
title: Command store, undo, redo and autosave
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T07:13:56Z
parent: lambda-logo-calculus-02i9
blocked_by:
    - lambda-logo-calculus-kiee
---

One store, every change a command. Undo, redo, autosave and variant snapshots
all come from the command log, so no feature has to implement them again.

## Scope

- Zustand store holding the project state.
- Every edit is a serialisable command; Immer produces the inverse patch.
- Undo and redo across the whole command log.
- Autosave to local storage, debounced.
- Variant snapshots as named points in the log.
- A test that fails when the store is mutated outside a command.

## Todo

- [x] Define the command interface and the command log
- [x] Wire Zustand with Immer patches
- [x] Implement undo and redo
- [x] Implement debounced autosave
- [x] Implement variant snapshots
- [x] Test that fails on a store mutation outside a command

## Summary of Changes

One store, every edit a command. 371 tests.

- New package `packages/store`, depending on the core. It is deliberately not
  part of the core, because it holds mutable state and the core may not.
- `ProjectState` holds everything a rendered logo depends on: template and
  parameters, stage list, ending, join, palette, text, copies, rotation, fit,
  alpha, pen mode, mark settings, locks and seed. It round-trips through JSON
  and is deep-frozen, so a direct mutation throws rather than silently working.
- Fourteen command kinds, each serialisable, applied through Immer so the
  forward and inverse patches are produced rather than hand-written. Every one
  is tested for giving the same result after a round trip through JSON. An
  unknown kind is refused by name, leaving the state alone.
- Undo and redo walk the log. A new command after an undo discards the entries
  ahead of it. A property test over random command sequences confirms that
  applying any sequence and then fully undoing it returns exactly to the
  starting state.
- Variants are named snapshots, and restoring one is itself a command, so it can
  be undone. Several variants survive unrelated edits.
- Autosave writes through a `Storage` interface the store is given, never to
  `localStorage` directly, so the store is testable and the DOM stays out of it.
  It is debounced: three edits inside the window produce one write carrying the
  final state. An unreadable stored project falls back to the defaults and
  reports why, rather than throwing.

`apps/studio` now reads the store rather than a hard-coded parameter set, which
is the first point at which changing anything is possible at all. A second
end-to-end test drives a real command in the browser, watches the wordmark
redraw at three copies instead of six, undoes it, and watches it come back.

One correction: `DEFAULT_PROJECT` was a module constant that never went through
`deepFreeze`, so the freezing test caught that the default state was mutable
while every derived state was not.

The gate's dependency hash moved for zustand and immer, which is the friction
the design predicted and is working as intended.

Capability `command-store` is a main spec with six requirements and twenty-one
scenarios.

OpenSpec change archived as `2026-10-01-add-command-store`.
