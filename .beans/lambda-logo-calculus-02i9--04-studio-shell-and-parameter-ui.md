---
# lambda-logo-calculus-02i9
title: 04 Studio shell and parameter UI
status: completed
type: milestone
priority: normal
created_at: 2026-09-30T22:01:03Z
updated_at: 2026-10-01T10:06:26Z
---

The studio becomes usable: a store where every edit is a command, undo and redo,
a canvas with artboards and overlays, and panels generated entirely from
parameter definitions. No hand-written slider anywhere.

## Gate

Playwright drives the real UI: change a parameter, undo, redo, lock a parameter,
randomize, and confirm the locked value did not move and the result landed in
the variant strip.

## Summary of Changes

All four epics completed and shipped. The gate is met, and its exact wording is
now a passing browser test.

- Command store, undo, redo and autosave (`2026-10-01-add-command-store`)
- Studio shell, canvas, artboards and overlays (`2026-10-01-add-studio-shell`)
- Generated parameter panels, stage list and gallery
  (`2026-10-01-add-generated-panels`)
- Seeded randomize, locks and the variant strip
  (`2026-10-01-add-randomize-and-variants`)

384 unit tests and 27 browser tests. `packages/core` above both thresholds.

**The rule the milestone existed to prove holds.** Every control in the studio is
derived from a `ParamDef`. The whole letters panel is four definitions rendered
by the same generic panel. Adding a parameter to any registered module produces a
control, a lock, a value readout and a reset with no UI code written. Fourteen
command kinds existed before the panels did, and the panels added none.

Three findings worth carrying forward:

- The first assembly of the shell put 4.3 MB of path data and 1019 DOM nodes on
  the page. `buildScene` was rebuilding the pen for every glyph and every copy
  though it depends only on the copy; hoisting it cut that work thirteenfold
  with byte-identical output. The page is now 454 KB and 182 nodes.
- A `<use>`-based sharing scheme made it worse, not better: each `<use>`
  instantiates a shadow copy of the referenced subtree.
- `randomizeParams` threw on a stored value no definition accepts, which happens
  whenever a registry changes under a saved project. It now degrades to the
  default instead of breaking.

**One thing is unresolved and recorded rather than hidden.** Chromium inside the
Nix build sandbox cannot load the studio page: it commits with HTTP 200 and the
renderer is killed within a second with no error. Eight gate cycles ruled out the
browser, the server, React, `localStorage`, the registries, the pipeline, DOM
volume, `<use>`, blocking the main thread, and which part of the tree renders.
The browser suite therefore runs in the dev shell, still inside
`scripts/ship-change.sh`, so it still gates every ship. ADR 0009 records the
investigation in full so nobody repeats it.

Two gaps are stated rather than implied: the horizontal and stacked artboards
show the same wordmark until the lockup registry lands, and variants are not yet
saved with a project.
