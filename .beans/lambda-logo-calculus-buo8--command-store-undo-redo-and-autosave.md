---
# lambda-logo-calculus-buo8
title: Command store, undo, redo and autosave
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-09-30T22:04:45Z
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

- [ ] Define the command interface and the command log
- [ ] Wire Zustand with Immer patches
- [ ] Implement undo and redo
- [ ] Implement debounced autosave
- [ ] Implement variant snapshots
- [ ] Test that fails on a store mutation outside a command
