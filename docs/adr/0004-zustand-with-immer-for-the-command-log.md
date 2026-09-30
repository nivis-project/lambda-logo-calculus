# 0004. Zustand with Immer patches for the command log

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-repository-documents`

## Context

The prototype has no undo. Its `state` object is mutated directly inside event
handlers, so there is no record of what changed or how to reverse it.

`docs/briefing.md` asks for one store where every edit is a command, so that
undo, redo, autosave and variant snapshots all come from the same log rather
than being implemented separately. It names Zustand or a small custom store,
with Immer patches, as candidates. The user chose Zustand when asked.

A designer randomises, likes one result out of six, and wants the other five
back. A variant snapshot is therefore not a separate feature; it is a named
position in the same log that undo walks.

Commands must be serialisable, because a project file has to reopen exactly as
saved and because a variant has to survive a reload.

## Decision

Zustand holds the project state. Every edit goes through a command: a plain
serialisable object describing the change. Immer produces the forward patch and
its inverse, and both go into the command log.

Undo and redo walk the log. Autosave writes the current state on a debounce.
A variant snapshot is a named position in the log.

A store mutation outside a command is a bug, and a test fails on one.

## Consequences

Four features arrive from one mechanism. Nothing that adds a new parameter has
to think about undo, because the parameter is edited through a command like
everything else.

Immer's inverse patches mean undo does not require every command to hand-write
its own reversal, which is where a hand-rolled command pattern usually rots.
Commands stay declarative.

Serialisable commands make the project file and the variant strip the same
problem, and make a future collaborative or replay feature possible without
rearchitecting. The briefing lists collaboration as out of scope but wants the
architecture to leave room; this is the part that does.

The cost is a rule with no compiler behind it. Nothing in TypeScript stops a
component calling `set()` directly, so the constraint rests on a test and on
review. That test is worth writing carefully.

Immer adds a dependency and a small per-edit cost for producing patches. At the
scale of a parameter change on a design tool that cost is invisible, and it is
not in the slider-drag path, which moves geometry rather than store state.

Zustand outside React means the store is testable without rendering anything,
and means a UI framework change would not take the store with it.

## Alternatives considered

**A small custom store.** No dependency, complete control over the log format,
and nothing to learn. Rejected: it is more code to write and, more importantly,
more code to test, and the inverse-patch generation is precisely the part that
is fiddly to get right.

**Redux Toolkit.** The command log is its native idea, and its devtools show the
log directly. Rejected: heavier than this needs, and its ceremony costs most in
exactly the place this project has most of, namely many small parameter edits.

**Immutable snapshots of the whole state per edit.** The simplest possible undo:
keep the last N states. Rejected: a project holds custom formulas, per-glyph
overrides and a full stage list, so whole-state copies per slider tick are
wasteful, and a snapshot list cannot describe what changed, which autosave and
variants both want.

**Immer without Zustand, state held in React.** One dependency fewer. Rejected:
it puts the store inside the UI framework, which ADR 0003 deliberately treats as
replaceable.
