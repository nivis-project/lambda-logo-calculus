---
# lambda-logo-calculus-oedm
title: pnpm workspace and strict TypeScript baseline
status: completed
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:22:31Z
parent: lambda-logo-calculus-cste
openspec-link: openspec/changes/archive/2026-10-01-add-pnpm-workspace-typescript
blocked_by:
    - lambda-logo-calculus-ri05
---

The pnpm workspace and the TypeScript baseline every package inherits, with the
package boundaries the architecture rules demand.

## Scope

- pnpm workspace with `packages/core`, `packages/render-svg`, `packages/export`,
  `packages/templates` and `apps/studio`. Packages may start near-empty but must
  build.
- TypeScript in `strict` mode with `noUncheckedIndexedAccess`, a shared base
  config, project references.
- Vite for `apps/studio`.
- ESLint with a boundary rule that fails when `packages/core` imports React, the
  DOM, or any renderer.
- A test that fails when a forbidden import appears in the built core bundle.

## Todo

- [x] Create the pnpm workspace and package manifests
- [x] Add the shared strict TypeScript config and project references
- [x] Wire Vite for `apps/studio`
- [x] Add the ESLint core boundary rule
- [x] Add the built-bundle import test
- [x] Prove `pnpm build` and `pnpm lint` are green

## Summary of Changes

The workspace exists and the core boundary is enforced twice.

- pnpm workspace with `packages/core`, `packages/render-svg`,
  `packages/export`, `packages/templates` and `apps/studio`, all scoped
  `@trefoil/*`. Dependency direction: `templates` to `core` to
  `render-svg` and `export` to `studio`. No cycle.
- `tsconfig.base.json` with `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`
  and project references. Proven to bite: a bare `xs[0]` returned as `number`
  fails the build with TS2322.
- Vite builds the studio and serves it on port 5173. Verified with a live
  request returning 200.
- ESLint 10 with `typescript-eslint` `strictTypeChecked`. The core boundary
  rules fire with the file, the line and the reason for a `react` import, a
  `document` reference and a `Math.random()` call.
- `scripts/check-core-boundary.mjs` reads the built bundle, walks its imports
  and globals, and loads the core in a DOM-free Node process. Proven to catch a
  `Math.random()` that a lint-disable comment let through, quoting the
  surrounding code.

Two deviations from the plan, both recorded here rather than silently:

- `restrict-template-expressions` is configured with `allowNumber: true`. A
  project that builds SVG path data from coordinates would otherwise need a
  `String()` around every number.
- `@eslint/js` and `eslint` resolve to 10.x, not the 9.x first written. 9.40
  does not exist; 10.0.1 is current.

Capability `core-boundary` is now a main spec at
`openspec/specs/core-boundary/spec.md`, with four requirements and nine
scenarios covering imports, DOM globals, determinism and the strict compiler
settings.

OpenSpec change archived as `2026-10-01-add-pnpm-workspace-typescript`.
