---
# lambda-logo-calculus-420e
title: Seeded randomize, locks and the variant strip
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:04:36Z
updated_at: 2026-10-01T10:06:04Z
parent: lambda-logo-calculus-02i9
blocked_by:
    - lambda-logo-calculus-5w79
---

Randomize that respects locks and never loses a good result.

## Scope

- Randomize driven by the `randomize` range on each `ParamDef`.
- Locked parameters are never touched.
- The seed is stored in the project, so a random result is reproducible.
- Every randomize result is added to the variant strip.
- Variants can be compared side by side and restored.

## Todo

- [x] Implement randomize from parameter definitions
- [x] Respect locks
- [x] Store the seed in the project
- [x] Add each result to the variant strip
- [x] Side-by-side variant comparison and restore
- [x] End-to-end test: lock a value, randomize, confirm it did not move

## Summary of Changes

Randomize reaches the locks that have been sitting unread since milestone 02.
384 unit tests, 27 browser tests.

- A `randomize` command kind carrying the definitions to draw from, the seed it
  used and the seed to store next. One press is one log entry and one undo,
  which returns every value it changed at once.
- Locked parameters are untouched. The browser test locks the copy count at 4
  and the amplitude at 9, randomises five times, and watches both hold. With
  everything locked the project is unchanged apart from its seed.
- Declared randomize ranges are honoured and a parameter with `randomize: false`
  is left alone, both checked across six seeds.
- The seed is drawn from the project and advanced, so the same seed and values
  give the same result, a second press differs, and the command in the log
  carries the seed it used.
- Every randomize result goes to the variant strip automatically. Variants carry
  a rasterised thumbnail, restore on click, can be kept by hand, and can be
  removed. Restoring is a command, so it undoes.

One real robustness finding. `randomizeParams` resolves the values it is given
against the definitions, so a stored value that no definition accepts made
randomize throw. That happens for real whenever a registry changes under a saved
project. The reducer now keeps only the values that validate and lets the rest
fall back to their defaults, so randomize degrades rather than breaking. The
same guard drops values whose parameter the caller did not declare at all.

Variants live in the store rather than the project, so they do not enter a saved
file. Whether they should be saved is a milestone 05 question, when the project
format is written.

Capability `randomize` is a main spec with five requirements and thirteen
scenarios. `command-store` gained the thumbnail and removal on variants, and
randomize as a command kind.

OpenSpec change archived as `2026-10-01-add-randomize-and-variants`.
