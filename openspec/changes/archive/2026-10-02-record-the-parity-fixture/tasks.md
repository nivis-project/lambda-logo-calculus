## 1. The browser

- [x] 1.1 Add Playwright to the workspace and its browser to the dev shell from
  nixpkgs, with the download skipped. Verify a browser launches inside
  `nix develop` and does not try to fetch anything.
- [x] 1.2 Update the dependency hash in `nix/gate.nix`. Verify `nix flake check`
  installs offline and passes.

## 2. The recorder

- [x] 2.1 Write `scripts/record-parity.mjs`: load the prototype at a fixed
  container width, drive its controls, read back what each took, and read the
  rendered output from the page. Verify it writes a fixture.
- [x] 2.2 Record both the asked-for and the actual value of every control.
  Verify by asking for a value the step disallows and seeing both in the
  fixture.
- [x] 2.3 Record the container width in the fixture. Verify a second run at the
  same width reproduces the file.
- [x] 2.4 Choose the matrix: several amplitudes, rotations, fit sizes, copy
  counts and endings, over text that exercises bowls, stems, arcs, diagonals,
  descenders and dots. Verify the recorded settings are the ones intended.
- [x] 2.5 Add `pnpm parity:record`. Verify it regenerates the fixture from
  nothing but the prototype.

## 3. Keeping it honest

- [x] 3.1 Add a test that fails when an asked-for value and an actual value
  differ. Verify it by planting a disagreement in a copy of the fixture.
- [x] 3.2 Add a test asserting the matrix's breadth: minimum counts of distinct
  amplitudes, rotations, fit sizes, copy counts and endings. Verify it fails on
  a deliberately narrowed fixture.
- [x] 3.3 Add a test asserting the fixture holds geometry for every recorded
  setting and that none of it is empty or holds `NaN`.

## 4. The tolerance

- [x] 4.1 Write the derivation down with the number, in the testing strategy.
  Verify the arithmetic: two decimal places gives 0.005 per axis, which is
  0.00707 as a distance, and the tolerance is 0.02.

## 5. Verification

- [x] 5.1 Verify the gate launches no browser: run `nix flake check` and confirm
  it passes with the fixture read from the repository.
- [x] 5.2 Verify `openspec validate --strict` passes and the gate is green.
