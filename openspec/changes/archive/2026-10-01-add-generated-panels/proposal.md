## Why

Epic [lambda-logo-calculus-5w79](../../../.beans/lambda-logo-calculus-5w79--generated-parameter-panels-stage-list-and-template-gallery.md),
under milestone 04 Studio shell and parameter UI.

The shell has panels and the panels are empty. The store has fourteen command
kinds and the only ones a designer can reach are the text field and the overlay
toggles.

This is the epic the parameter system was built for. `AGENTS.md` states the rule
plainly: panels, locks and randomize are generated from parameter definitions,
and a hand-written slider is a bug. Everything registered already carries its
`ParamDef`s, so filling the panels should mean writing one control per kind and
nothing per parameter.

That claim is testable, and this epic tests it: a parameter added to a
registration must appear in the UI with no UI code changed.

## What Changes

- Add a control per `ParamDef` kind: `number`, `int`, `angle`, `enum`, `bool`
  and `color`.
- Give every control a lock, its current value, and a reset to its default.
- Let a designer double-click a slider to type an exact value.
- Group controls by their `group`, and hide those marked `advanced` behind a
  disclosure.
- Build the left panel from the active template's parameters plus the nesting
  parameters (copies, rotation, fit, opacity).
- Build the right panel from the ending's, the join's and the active stages'
  parameters, plus the palette and pen choice.
- Add the stage list: switch a stage on or off, reorder it, edit its parameters.
- Add the template gallery with a live thumbnail per template, drawn with the
  project's current copies, rotation and palette.

## Capabilities

### New Capabilities

- `parameter-panels`: how a control is derived from a definition, what every
  control offers, and what happens when a definition changes.

### Modified Capabilities

None.

## Impact

- New under `apps/studio/src/controls`: one component per kind, and the panel
  builder that walks definitions.
- The store gains no new command kinds. Every control dispatches one of the
  fourteen that already exist, which is the point of having made them generic.
- Locks are stored in the project as a list of parameter ids, already present
  and already serialised. The controls read and write it.
- The template gallery renders one small scene per template. Milestone 06's
  budget work is where that gets memoised; it is drawn at two copies and the
  gallery is not redrawn while a slider moves.
- Stage reordering needs the stage list to be writable, which the `setStages`
  command already allows.
