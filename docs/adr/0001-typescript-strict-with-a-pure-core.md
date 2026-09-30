# 0001. Strict TypeScript with a framework-free geometry core

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-pnpm-workspace-typescript`

## Context

Trefoil Studio generates an entire alphabet from one curve. The mathematics is
the product: nesting, arc warping, the support-function stroker, nine stroke
endings, lockup placement by a real outline. The user interface around it is
comparatively ordinary.

The prototype (`reference/trefoil-type.html`) put both in one file. A global
`state` object was read by the geometry and written by event handlers, the base
curve `cos(3 theta)` was spelled out in four separate functions, and SVG was
assembled as strings into `innerHTML`. The mathematics is sound; the structure
is what makes it impossible to extend.

The same geometry has to run in three places: a browser, a Node test runner, and
eventually a Web Worker. Anything that works in only one of them is a defect.

`docs/briefing.md` fixes TypeScript and a framework-free core as the two
decisions not up for discussion, and leaves the rest open.

## Decision

Geometry lives in `packages/core` as pure functions from parameters to geometry
in font units. The core imports no UI framework, no DOM global and no renderer,
and it never calls `Math.random()` or reads the clock. Randomness comes from a
seed the caller passes in.

TypeScript runs in `strict` mode with `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes` and `noImplicitOverride`, set once in
`tsconfig.base.json` and inherited by every package. A package may not relax
them.

The boundary is enforced twice: an ESLint rule while the code is written, and a
test that reads the built bundle and cannot be disabled by editing a lint
config. Both are in the gate.

## Consequences

The core is testable like a mathematics library. A known-value test needs no
DOM, no mock and no fixture; it calls a function and compares numbers. Property
tests can generate thousands of parameter sets because nothing has to be set up
between runs.

Determinism makes golden snapshots meaningful. A snapshot that changes changed
because the geometry changed, never because a random seed moved.

The cost is verbosity. `noUncheckedIndexedAccess` turns every `points[i]` into a
possibly-undefined value, and geometry code indexes constantly. Each of those is
a real case the code has to answer for, but the code is longer and noisier than
it would be otherwise.

A second cost is indirection. The core cannot reach for `document` to measure
anything or `Math.random()` to jitter anything, so both have to be passed in.
That is more plumbing than a single-file prototype needs.

The benefit that decides it: any later change of UI framework, renderer or
bundler leaves the geometry untouched. The thing that is expensive to rewrite is
the thing that is isolated from churn.

## Alternatives considered

**Keep geometry and UI together, as the prototype does.** It is smaller and
faster to write, and for a single-file demo it was the right call. It loses
undo, testability and any renderer that is not SVG strings, and the briefing
asks for all three. Rejected.

**A pure core, but without the enforced boundary.** Write the rule in
`AGENTS.md` and trust it. Cheaper, and it holds until someone needs a quick
measurement from the DOM at five in the afternoon. A rule with no gate behind it
describes an intention, not a constraint. Rejected.

**JavaScript with JSDoc types instead of TypeScript.** No build step for the
core, and the types are still checkable. Rejected: the briefing fixes
TypeScript, and the parameter system depends on types that JSDoc expresses
poorly.

**`strict` without `noUncheckedIndexedAccess`.** Much less noise. Rejected: the
failure it prevents is `undefined` entering a coordinate and surfacing as a
`NaN` in an exported path long afterwards, which is exactly the bug class this
codebase will otherwise produce.
