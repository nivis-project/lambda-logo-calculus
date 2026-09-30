## Why

Epic [lambda-logo-calculus-oedm](../../../.beans/lambda-logo-calculus-oedm--pnpm-workspace-and-strict-typescript-baseline.md),
under milestone 01 Project foundations.

There is a toolchain but nothing to run it on. Every epic from milestone 02
onwards writes TypeScript into `packages/core` and expects the compiler settings,
the package boundaries and the lint rules to already be decided.

The boundary between the core and everything else is the one decision the whole
architecture rests on. The brief puts it first: geometry lives in a pure,
framework-free core, and UI, renderers and exporters plug into it. A rule that
lives only in a document gets broken by the third contributor, so it becomes a
lint rule and a test that reads the built bundle.

## What Changes

- Add a pnpm workspace with `packages/core`, `packages/render-svg`,
  `packages/export`, `packages/templates` and `apps/studio`. Packages start
  near-empty, but each builds and each is wired into the workspace.
- Add a shared TypeScript base config in `strict` mode with
  `noUncheckedIndexedAccess`, extended by every package, with project references
  so an incremental build knows the graph.
- Add Vite for `apps/studio`.
- Add ESLint with a boundary rule that fails when `packages/core` imports React,
  the DOM, a renderer or any other package that is not itself pure.
- Add a test that reads the built core bundle and fails on a forbidden import,
  so the rule survives a lint config someone disabled.
- Add the root scripts `build`, `lint`, `test` and `dev`.

## Capabilities

### New Capabilities

- `core-boundary`: the purity contract of `packages/core`. What it may import,
  what it may not, how the rule is enforced, and what happens when it is broken.

### Modified Capabilities

None.

## Impact

- New: `pnpm-workspace.yaml`, `package.json` at the root and per package,
  `tsconfig.base.json`, a `tsconfig.json` per package,
  `eslint.config.js`, `apps/studio/vite.config.ts`, and a near-empty entry point
  per package.
- New dependencies: typescript, eslint with its TypeScript plugin, vite, and the
  import-resolution plugin the boundary rule needs. Vitest and Playwright are
  added by the test harness epic, not here.
- `pnpm-lock.yaml` is committed.
- Packages that exist but do nothing are deliberate. Creating them now fixes the
  boundary before any code can cross it; creating them later means moving files
  that already have imports.
- The boundary test needs a built bundle, so `pnpm build` becomes a prerequisite
  of `pnpm test`. That cost is accepted: a rule that only runs when someone
  remembers to run it is not a rule.
