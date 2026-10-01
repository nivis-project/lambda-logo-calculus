---
# lambda-logo-calculus-eihe
title: 03 Templates and registries
status: completed
type: milestone
priority: normal
created_at: 2026-09-30T22:01:03Z
updated_at: 2026-10-01T07:06:19Z
---

The base curve stops being hard-coded. A designer picks a template from a
gallery, tunes its parameters, and can duplicate any template into an editable
custom formula. Nesting works for polar and parametric templates alike.

Built-in templates for the first release: trefoil, rose, superellipse,
supershape, rounded polygon and custom formula.

## Gate

Every built-in template renders the fixed test string to an approved golden
snapshot, nesting holds for parametric templates, and a custom formula typed by
the designer is parsed, validated and rendered without `eval`.

## Summary of Changes

All three epics completed and shipped. The gate is met.

- Built-in templates (`2026-10-01-add-builtin-templates`)
- Parametric nesting and curve validation (`2026-10-01-add-parametric-nesting`)
- Custom formula parser (`2026-10-01-add-custom-formula-parser`)

Five built-in templates plus the custom one. The `ShapeTemplate` interface now
has six implementations, which is what turns it from a description of the
trefoil into an interface. The trefoil is the rose at three lobes, proven by
test rather than asserted.

Nesting takes the route the curve allows. A curve that is not star-shaped about
its centre, which the polar ratio silently gets wrong, is nested by binary
search for the largest scale at which the rotated copy still fits. The studio is
told which route was taken and why.

The custom formula is parsed into an expression tree and walked, never executed.
Eighteen named escape attempts are refused, a name that exists in the host but
is not whitelisted is refused, and the built-bundle check now bans `eval`, the
`Function` constructor and dynamic `import` in the core.

347 tests. `packages/core` at 95% statements and 82% branches. Golden snapshots
cover all five built-in templates, rendered at two copies rather than six, which
brought them from 5.7 MB to 1.7 MB without weakening what they catch.

**No polar result moved.** Parity with the prototype still measures 0.006953
font units and every snapshot is unchanged, which is what makes "the existing
route keeps its values" a fact.

Three corrections, each recorded in the epic that found it: the polygon's star
term shrank its vertices instead of pulling in its edge midpoints; a degenerate
curve returned 0 from the parametric search rather than 1; and the interface
needed `symmetryFor(params)` because the rose's symmetry is its lobe count.
