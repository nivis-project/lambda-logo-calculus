---
# lambda-logo-calculus-02i9
title: 04 Studio shell and parameter UI
status: todo
type: milestone
created_at: 2026-09-30T22:01:03Z
updated_at: 2026-09-30T22:01:03Z
---

The studio becomes usable: a store where every edit is a command, undo and redo,
a canvas with artboards and overlays, and panels generated entirely from
parameter definitions. No hand-written slider anywhere.

## Gate

Playwright drives the real UI: change a parameter, undo, redo, lock a parameter,
randomize, and confirm the locked value did not move and the result landed in
the variant strip.
