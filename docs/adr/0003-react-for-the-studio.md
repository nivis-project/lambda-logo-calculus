# 0003. React for the studio application

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-repository-documents`

## Context

`docs/briefing.md` leaves the UI framework open and names React, Svelte and
SolidJS as candidates. The user chose React when asked before any code was
written.

The studio's panels are not hand-built. Every control is generated from a
`ParamDef` carrying an id, a kind, a range, a default and lockable and
randomisable flags. A hand-written slider is a bug by the project's own rules.
That makes the UI layer thin by construction: it maps a small set of parameter
kinds onto a small set of controls, and does layout around a canvas.

The performance-critical path does not go through the framework at all. A slider
drag has a 16 ms budget, and what it moves is the scene graph and the renderer,
not the panel tree.

## Decision

React for `apps/studio`.

The framework is confined to the studio application. `packages/core` cannot
import it, and the renderer packages read a plain scene graph, so neither knows
React exists.

## Consequences

The largest ecosystem of the three: Playwright, testing-library, headless
component primitives and accessible control implementations are all available
without hunting.

React's reconciliation is the slowest of the three candidates, and this is the
decision's real cost. It does not touch the budget that matters, because the
canvas is driven by the renderer rather than by component state, but it does put
a ceiling on how much of the studio can be React before it is felt. If the panel
tree ever becomes the bottleneck, the fix is to move state out of React, not to
optimise React.

Because the framework is confined to one package behind an interface the core
cannot see, replacing it later is a rewrite of the studio, not of the product.
ADR 0001 is what makes that true.

## Alternatives considered

**SolidJS.** Fine-grained reactivity, the best fit of the three for a
slider-drag budget, and a smaller runtime. Rejected: the user chose React, and
the tooling around panels, testing and accessible controls is thinner. This is
the alternative to revisit first if the UI layer ever becomes the constraint.

**Svelte 5.** The least boilerplate, and runes give good performance without
manual memoisation. Rejected: the user chose React. The compiler-based approach
would have suited a UI generated from definitions well.

**No framework, plain DOM.** The panels are generated from data anyway, so a few
hundred lines would cover them. Rejected: variant strips, drag-reorderable stage
lists, per-glyph override popovers and keyboard handling are where a hand-rolled
layer stops being a few hundred lines.
