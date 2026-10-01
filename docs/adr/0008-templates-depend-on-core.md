# 0008. The templates package depends on the core, not the other way round

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-shape-template-and-nesting`
- Supersedes the dependency direction stated in [0002](0002-pnpm-workspaces-and-package-layout.md)

## Context

ADR 0002 set the package dependency graph before any package had contents.
It put `packages/templates` upstream of `packages/core`, on the reasoning that
templates are data and data has no dependencies.

Writing the first real template showed that reasoning to be wrong. A shape
template is not inert data. It implements `ShapeTemplate`: it carries parameter
definitions, safety metadata, and a `radius` or `point` function that the core
calls. Every one of those types is defined in the core.

Under 0002's direction, `packages/templates` could not name the interface it
implements, and `packages/core` imported a list of templates it had no reason to
know about. Attempting both at once produces an import cycle, which is how the
error surfaced.

## Decision

`packages/templates` depends on `packages/core`. The core defines the
interfaces; the templates package implements them and exports the built-in set.
The core imports nothing from the templates package.

Wiring the two together is the application's job: `apps/studio` creates the
registry and registers the built-ins into it at start-up.

The resulting direction is:

```text
core  ->  templates  ->  studio
core  ->  render-svg ->  studio
core  ->  export     ->  studio
```

The core is now a leaf with no workspace dependency at all.

## Consequences

The core is a true leaf. Nothing it imports can drag a dependency into it, which
makes the purity rules of ADR 0001 easier to hold rather than merely enforced
after the fact.

Registration moves to the application, which is where the briefing says it
belongs: registries are discovered at start-up, and which modules are present is
a composition decision, not something baked into the core.

A test for the core no longer needs the templates package. It declares a small
template inline, which is both faster and more honest about what is under test.

The cost is one more thing the application has to remember. A template that is
written but never registered simply does not appear, with no compile error.
Milestone 03 adds a test that every built-in template reaches the registry.

## Alternatives considered

**A third package holding only the interfaces**, which both `core` and
`templates` depend on. This is the textbook answer to a cycle. Rejected: the
interfaces and the functions that consume them belong together, and splitting
them would mean a package whose only content is types, imported by everything,
which is a layer with no behaviour to justify it.

**Keep 0002's direction and have templates duplicate the interface shape
structurally.** TypeScript is structurally typed, so this compiles. Rejected: it
is the same contract written twice, with nothing keeping the two in step.

**Edit ADR 0002 in place.** Simpler, and the record would read correctly.
Rejected: `docs/adr/0000-template.md` says a record that turns out wrong is
superseded rather than edited, because the wrong decision and the reason it was
made are the useful part of the history. The reason 0002 got this wrong, that it
was written before any package had contents, is worth keeping.
