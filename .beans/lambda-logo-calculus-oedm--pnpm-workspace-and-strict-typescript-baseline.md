---
# lambda-logo-calculus-oedm
title: pnpm workspace and strict TypeScript baseline
status: todo
type: epic
priority: normal
created_at: 2026-09-30T22:01:37Z
updated_at: 2026-09-30T22:01:37Z
parent: lambda-logo-calculus-cste
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

- [ ] Create the pnpm workspace and package manifests
- [ ] Add the shared strict TypeScript config and project references
- [ ] Wire Vite for `apps/studio`
- [ ] Add the ESLint core boundary rule
- [ ] Add the built-bundle import test
- [ ] Prove `pnpm build` and `pnpm lint` are green
