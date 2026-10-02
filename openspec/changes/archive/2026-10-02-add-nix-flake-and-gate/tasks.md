## 1. The decision record

- [x] 1.1 Add `docs/adr/0000-template.md` with the sections every later ADR
  uses: status, date, change, context, decision, consequences, alternatives
  considered. Verify by writing 0001 from it in the next task without needing a
  section the template lacks.
- [x] 1.2 Write `docs/adr/0001-typescript-on-pnpm.md` recording strict
  TypeScript on pnpm with Vitest, and the alternatives from design.md with the
  reason each lost. Verify it names at least four alternatives and that each
  carries a reason rather than a preference.

## 2. The workspace

- [x] 2.1 Add the root `package.json` and `pnpm-workspace.yaml` declaring a
  `packages/*` workspace, and `pnpm-lock.yaml` from a real install. Verify
  `pnpm install` completes in the dev shell and the lockfile is committed.
- [x] 2.2 Add `tsconfig.json` in strict mode, with the strictness flags the ADR
  names. Verify `pnpm exec tsc --noEmit` passes and that removing a type
  annotation that would be implicitly `any` makes it fail.
- [x] 2.3 Add `eslint.config.js` and a `lint` script. Verify `pnpm lint` passes
  and that an unused variable makes it fail.
- [x] 2.4 Add `vitest.config.ts` and a `test` script. Verify `pnpm test` runs
  and reports the number of test files it found.
- [x] 2.5 Create `packages/core` with its own `package.json` and `tsconfig.json`,
  a version constant in `src/index.ts`, and a smoke test asserting it. Verify
  `pnpm test` finds and passes exactly that one test, and that the test file
  carries the note saying it is scaffolding to delete.

## 3. The flake and the dev shell

- [x] 3.1 Replace `flake.nix` with one that pins nixpkgs to an exact revision
  and uses `genAttrs` over the four supported systems, with no `flake-utils`.
  Verify `nix flake metadata` shows the pinned revision and that `flake.lock` is
  committed.
- [x] 3.2 Put Node, pnpm, `jj` and `git` in the dev shell, and have its greeting
  name the project and the toolchain versions. Verify `nix develop -c node
  --version` and `nix develop -c pnpm --version` report the pinned versions.
- [x] 3.3 Verify the dev shell and the gate agree: the Node and pnpm versions
  read inside `nix develop` match the ones the gate build logs report.

## 4. The gate

- [x] 4.1 Write `scripts/gate.sh` running build, then lint, then tests, each
  announced before it runs and each stopping the script on failure. Verify
  running it inside `nix develop` passes, and that breaking the build, the lint
  and a test each fail it with that step named.
- [x] 4.2 Add `nix/gate.nix` fetching pnpm dependencies through
  `pkgs.fetchPnpmDeps` with the hash recorded in the file, installing offline
  and calling `scripts/gate.sh`. Verify `nix flake check` passes.
- [x] 4.3 Make the gate fail when the suite finds no tests. Verify by moving the
  smoke test aside and confirming the gate fails saying no tests were found,
  rather than passing.
- [x] 4.4 Verify a stale dependency hash fails with both hashes in the message:
  change `package.json`, leave the hash, and read what the gate prints.
- [x] 4.5 Record the dependency hash procedure in `AGENTS.md`, under Commands.
  Verify the written steps produce a green gate when followed from a
  deliberately blanked hash.

## 5. Verification

- [x] 5.1 Verify the gate runs offline: `nix flake check` passes on a machine
  with networking disabled, or with the Nix sandbox confirmed to have no network
  access.
- [x] 5.2 Verify the gate is reproducible: run `nix flake check` twice on the
  same commit and confirm the same verdict both times.
- [x] 5.3 Verify the ship road end to end: run
  `bash scripts/ship-change.sh add-nix-flake-and-gate` with a deliberately
  broken test and confirm nothing is archived, no bean is closed and nothing is
  committed, then restore the test.
- [x] 5.4 Update `AGENTS.md` Commands with the real commands this change
  created. Verify every command listed there runs.
