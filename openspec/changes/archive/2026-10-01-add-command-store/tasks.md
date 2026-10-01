## 1. The package

- [x] 1.1 Create `packages/store`, depending on `packages/core`, with zustand
  and immer. Verify it builds and that the core does not depend on it.
- [x] 1.2 Verify `packages/store` is not treated as a pure package by the
  boundary check, since it holds mutable state by design, and that the core
  still is.

## 2. Project state

- [x] 2.1 Define the project state covering template, parameters, stages,
  ending, join, palette, text, copies, rotation, fit, alpha, mark, locks and
  seed. Verify it round-trips through JSON unchanged.
- [x] 2.2 Build a scene from a project state and verify no value comes from
  anywhere else.
- [x] 2.3 Freeze the state so a direct mutation fails. Verify the attempt
  throws.

## 3. Commands

- [x] 3.1 Define the command interface and a reducer per kind, applied through
  Immer to produce the forward and inverse patches. Verify applying a command
  leaves the input state unchanged.
- [x] 3.2 Verify a command serialised and parsed back gives the same result.
- [x] 3.3 Refuse an unknown command kind, naming it, leaving the state
  unchanged.

## 4. Undo and redo

- [x] 4.1 Implement undo and redo over the log. Verify undo restores the
  previous state and redo reapplies it.
- [x] 4.2 Verify undo with nothing to undo and redo with nothing to redo both
  leave the state alone and report it.
- [x] 4.3 Verify a new command after an undo discards the redo entries.
- [x] 4.4 Property test: a sequence of commands applied and then fully undone
  returns exactly to the starting state.

## 5. Variants

- [x] 5.1 Take and restore a named variant. Verify the restored state matches.
- [x] 5.2 Make restoring a variant a command, and verify it can be undone.
- [x] 5.3 Verify several variants survive unrelated edits.

## 6. Autosave

- [x] 6.1 Define the storage interface with a memory implementation. Verify the
  store never names a browser global, by grepping its built output.
- [x] 6.2 Debounce writes. Verify many edits inside the window give one write
  carrying the final state.
- [x] 6.3 Restore from storage on creation. Verify a saved state is picked up.
- [x] 6.4 Verify unreadable stored state falls back to defaults and reports it,
  rather than throwing.

## 7. The studio

- [x] 7.1 Move `apps/studio` from a hard-coded parameter set to reading the
  store. Verify the end-to-end test still sees the wordmark.

## 8. Verification

- [x] 8.1 Verify coverage thresholds hold and `nix flake check` is green.
