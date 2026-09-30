## 1. Agent instructions

- [x] 1.1 Write `AGENTS.md` covering the project overview, the bean and OpenSpec
  work process, the commands, the `jj` rules, the architecture rules, the ADR
  rule, the testing summary, the code style and the Beans section. Verify every
  architecture rule in `docs/briefing.md` under "Guiding principles" has a
  counterpart in the file.
- [x] 1.2 Create `CLAUDE.md` as a symlink to `AGENTS.md` and verify
  `readlink CLAUDE.md` prints `AGENTS.md` and `cat CLAUDE.md` prints the
  instructions.

## 2. Brief and prototype

- [x] 2.1 Copy the brief to `docs/briefing.md` and verify
  `grep -c $'—\|–\|“\|”\|‘\|’' docs/briefing.md`
  reports 0, with the content otherwise unchanged.
- [x] 2.2 Copy the prototype to `reference/trefoil-type.html` unchanged and
  verify it still contains `perfectFit`, `effectiveScale`, `shapeRho`,
  `ringPts` and `buildGlyphs`, and that it opens in a browser as a working page.

## 3. Testing and decision templates

- [x] 3.1 Write `docs/testing-strategy.md` describing known values, property
  tests, golden snapshots and end-to-end tests, what each proves, the coverage
  thresholds the gate enforces, and the procedure for approving a snapshot
  change. Verify it names the concrete known values from the brief (`perfectFit`
  is 1 at rotation 0 and at 120 degrees; `effectiveScale` equals `perfectFit` at
  fit size 0) and the test string "Hamburgefonstiv 0123".
- [x] 3.2 Write `docs/adr/0000-template.md` with Status, Context, Decision,
  Consequences and Alternatives considered, plus a note on how a superseded ADR
  is marked. Verify the file exists and is referenced from `AGENTS.md`.

## 4. Changelog and readme

- [x] 4.1 Add `CHANGELOG.md` with a Keep a Changelog header and an
  `## [Unreleased]` section. Verify `grep -q '## \[Unreleased\]' CHANGELOG.md`
  succeeds, since `/mip:ship` writes into that section.
- [x] 4.2 Extend `README.md` with what Trefoil Studio is, what it produces, the
  repository layout and how to run it through `nix develop`. Verify the commands
  it lists match the ones in `AGENTS.md`.

## 5. Verification

- [x] 5.1 Verify no file added by this change contains an em dash, an en dash or
  a curly quote, outside `reference/trefoil-type.html` which is committed
  unchanged.
- [x] 5.2 Verify `openspec validate add-repository-documents` passes and every
  task above is checked.
