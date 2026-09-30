## 1. Workspace

- [x] 1.1 Add `pnpm-workspace.yaml` listing `packages/*` and `apps/*`, and a
  root `package.json` with `private: true` and the `build`, `lint`, `test` and
  `dev` scripts. Verify `pnpm -r list` reports the workspace root.
- [x] 1.2 Add a `package.json` for `packages/core`, `packages/render-svg`,
  `packages/export`, `packages/templates` and `apps/studio`, each scoped
  `@trefoil/<name>`, with `type: module`. Verify `pnpm -r list --depth -1`
  lists all five plus the root.
- [x] 1.3 Declare the dependency direction: `render-svg` and `export` depend on
  `core`, `core` depends on `templates`, and `apps/studio` depends on all of
  them. Verify `pnpm install` resolves the workspace links without a cycle.

## 2. TypeScript

- [x] 2.1 Add `tsconfig.base.json` with `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, ES2023 target, `NodeNext`
  resolution and `composite` enabled. Verify a file that reads `arr[0]` and
  passes it where a non-optional value is expected fails `pnpm build`.
- [x] 2.2 Add a `tsconfig.json` per package extending the base, with project
  references matching the dependency direction from 1.3. Verify
  `pnpm build` type-checks every package in dependency order.
- [x] 2.3 Add a near-empty entry point per package that exports one real value,
  so each package emits output. Verify `dist/index.js` and `dist/index.d.ts`
  exist for every package after `pnpm build`.

## 3. Vite for the studio

- [x] 3.1 Add `apps/studio/vite.config.ts` and an `index.html` that loads the
  entry module. Verify `pnpm --filter @trefoil/studio build` produces a `dist`
  with an HTML file and a hashed asset.
- [x] 3.2 Add the root `dev` script running the studio dev server. Verify it
  starts and serves the page on a local port, then stops cleanly.

## 4. The core boundary

- [x] 4.1 Add `eslint.config.js` with the TypeScript parser and the project's
  base rules, applied across the workspace. Verify `pnpm lint` runs and reports
  no errors on the current tree.
- [x] 4.2 Add the boundary rule for `packages/core`: no import of `react`,
  `react-dom`, `packages/render-*` or `packages/export`, and no reference to
  `document`, `window`, `navigator`, `localStorage` or `HTMLElement`. Verify
  that adding `import 'react'` to a core file makes `pnpm lint` fail with the
  file name and the rule, and that removing it makes lint pass again.
- [x] 4.3 Add the determinism rule: no `Math.random()` and no `Date.now()` in
  `packages/core`. Verify a core file calling `Math.random()` fails `pnpm lint`
  naming the file and the call.
- [x] 4.4 Write the built-bundle boundary test: build the core, walk the emitted
  module graph, and fail on a forbidden import or global, reporting the matched
  context. Verify it passes on the clean tree, and that it fails when a
  forbidden import is introduced with the lint rule disabled by a comment.
- [x] 4.5 Verify the built core loads in a Node process with no DOM globals
  defined and its exported value is readable.

## 5. Lock and verification

- [x] 5.1 Commit `pnpm-lock.yaml`. Verify `pnpm install --frozen-lockfile`
  succeeds from a clean `node_modules`.
- [x] 5.2 Verify `pnpm build`, `pnpm lint` and the boundary test are all green,
  and that `node_modules` and `dist` are ignored by version control.
