## Why

Epic [lambda-logo-calculus-buo8](../../../.beans/lambda-logo-calculus-buo8--command-store-undo-redo-and-autosave.md),
under milestone 04 Studio shell and parameter UI.

The core computes a scene from parameters, and `apps/studio` currently hands it
one hard-coded set. Nothing holds state, so nothing can change.

The prototype shows what happens when state is held badly: a `state` object
mutated inside event handlers, with no record of what changed. It has no undo,
and adding one would mean writing a reversal for every control by hand.

ADR 0004 settled the shape: one store, every edit a command, Immer producing the
inverse patch, and undo, redo, autosave and variants all falling out of the same
log. This epic builds it, before any panel exists to drive it.

## What Changes

- Add the project state: template id and parameters, stage list, ending, join,
  palette, text, copies, rotation, fit, alpha, mark settings, locks and seed.
- Add the command interface: a serialisable object describing one edit, applied
  through Immer so the forward and inverse patches are produced rather than
  written.
- Add the command log with undo and redo across it.
- Add a Zustand store holding the state and the log, usable without React.
- Add variant snapshots as named positions in the log.
- Add autosave: debounced, to a storage interface the store is given rather than
  to `localStorage` directly, so the store stays testable and the DOM stays out
  of it.
- Add a test that fails when the state is mutated outside a command.

## Capabilities

### New Capabilities

- `command-store`: what the project state is, how it changes, and what undo,
  redo, autosave and variants are built from.

### Modified Capabilities

None.

## Impact

- New package `packages/store`, depending on the core. It is not part of the
  core, because it holds mutable state and the core may not.
- New dependencies: zustand and immer, both in `packages/store`.
- Storage is an interface with a memory implementation for tests and a
  browser-backed one for the studio. The store never names `localStorage`.
- The store is framework-free. React bindings arrive with the shell in the next
  epic; nothing here imports React.
- `apps/studio` moves from a hard-coded parameter set to reading the store,
  which is the first point at which changing something is possible at all.
