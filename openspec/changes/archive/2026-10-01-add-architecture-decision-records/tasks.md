## 1. The decision records

- [x] 1.1 Write `docs/adr/0001-typescript-strict-with-a-pure-core.md`: strict
  TypeScript and a framework-free geometry core, with the alternatives that lost.
  Verify it follows every section of `docs/adr/0000-template.md`.
- [x] 1.2 Write `docs/adr/0002-pnpm-workspaces-and-package-layout.md`: the five
  packages, the dependency direction and why the packages were created empty.
- [x] 1.3 Write `docs/adr/0003-react-for-the-studio.md`: React for
  `apps/studio`, with panels generated from parameter definitions so the UI
  layer stays replaceable. Record Svelte and SolidJS as the alternatives.
- [x] 1.4 Write `docs/adr/0004-zustand-with-immer-for-the-command-log.md`:
  Zustand with Immer patches, commands serialisable, undo and redo from the log.
- [x] 1.5 Write `docs/adr/0005-svg-dom-as-the-first-renderer.md`: SVG DOM first
  behind a renderer interface, Canvas or WebGL added when profiling demands it.
- [x] 1.6 Write `docs/adr/0006-polygon-clipping-for-path-booleans.md`:
  polygon-clipping over Clipper2 WASM and paper.js, and the curve fitter. Mark
  it as a decision whose consequences milestone 06 will test.
- [x] 1.7 Write `docs/adr/0007-scope-of-the-first-release.md`: logos and a brand
  sheet, web only, no font file export, Apache-2.0 from the start. Record the
  four questions from the brief and the answer given to each.
- [x] 1.8 Verify all seven exist, are numbered in sequence with no gap, and that
  each names at least one alternative with the reason it lost.

## 2. The ship script closes the bean

- [x] 2.1 Add an optional third argument to `scripts/ship-change.sh` for a bean
  id, and verify that calling it with an id that names no bean exits non-zero
  before staging, gating, archiving or committing.
- [x] 2.2 Mark the bean completed after the gate passes and before the commit,
  so the archived change and the bean file land in one commit. Verify by
  inspecting the resulting commit's file list.
- [x] 2.3 Verify the script still ships correctly when no bean id is given.
- [x] 2.4 Verify a red gate leaves the bean untouched: break a test, run the
  script with a bean id, and confirm the bean is still in-progress afterwards.

## 3. Documentation and verification

- [x] 3.1 Update `AGENTS.md` with the ship invocation including the bean id, and
  confirm the ADR reference now points at seven real files.
- [x] 3.2 Verify `nix flake check` is green and every task above is checked.
