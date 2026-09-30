---
# lambda-logo-calculus-5ved
title: Architecture decision records 0001 to 0007
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:45:06Z
parent: lambda-logo-calculus-cste
---

Record the decisions already taken so no later epic reopens them by accident.
One ADR per choice, numbered in sequence, using `docs/adr/0000-template.md`.

## Scope

- 0001 TypeScript strict with a framework-free pure core
- 0002 pnpm workspaces and the package layout
- 0003 React for `apps/studio`, with panels generated from parameter definitions
- 0004 Zustand with Immer patches for the command log, undo and redo
- 0005 SVG DOM as the first renderer, behind a renderer interface
- 0006 polygon-clipping for path booleans, and the curve fitter choice
- 0007 Scope of the first release: logos and a brand sheet, web only, no font
  file export, Apache-2.0 from the start

## Todo

- [x] Write ADR 0001
- [x] Write ADR 0002
- [x] Write ADR 0003
- [x] Write ADR 0004
- [x] Write ADR 0005
- [x] Write ADR 0006
- [x] Write ADR 0007

## Summary of Changes

Seven decision records written, and the gap `AGENTS.md` was describing but not
delivering is closed.

- `docs/adr/0001` strict TypeScript with a framework-free pure core
- `docs/adr/0002` pnpm workspaces and the five-package layout
- `docs/adr/0003` React for the studio
- `docs/adr/0004` Zustand with Immer patches for the command log
- `docs/adr/0005` SVG DOM as the first renderer, behind a renderer interface
- `docs/adr/0006` polygon-clipping for path booleans, with a Bezier fitter
- `docs/adr/0007` scope of the first release

Each follows `docs/adr/0000-template.md` and names the alternatives that lost
with the reason. 0006 is marked as a decision whose consequences nothing tests
until milestone 06; it is written now because the package layout already assumes
it, and it will be superseded rather than edited if degenerate glyph outlines
defeat it.

The second half of this epic was not in the original plan. Shipping the previous
epic exposed that `scripts/ship-change.sh` commits before a bean can be closed,
so the claim in `AGENTS.md` that one commit holds the code, the specs, the
changelog and the bean files together was false. The script now takes an
optional bean id and closes it between the gate and the commit.

Verified: an unknown bean id stops the ship before anything is staged or gated;
a red gate leaves the bean `in-progress`, the change active and nothing
committed; and the no-bean-id path still works.

Capability `quality-gate` gained a modified requirement covering the bean
closure and a new requirement covering the unknown-id refusal.

OpenSpec change archived as `2026-10-01-add-architecture-decision-records`.
