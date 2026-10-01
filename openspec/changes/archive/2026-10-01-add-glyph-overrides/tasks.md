## 1. The ship script

- [x] 1.1 Validate the OpenSpec change before the gate in
  `scripts/ship-change.sh`. Verify a malformed delta stops the ship in seconds
  and a valid one proceeds.

## 2. Patches

- [x] 2.1 Define the per-glyph patch with an offset, a scale, an advance and an
  ending, and nothing else. Verify an inspected patch holds no skeleton.
- [x] 2.2 Apply patches after the stage list and before the stroker. Verify an
  offset moves only its own glyph and that the rest is unchanged.
- [x] 2.3 Verify a patch still applies after a template parameter changes.
- [x] 2.4 Verify an empty patch renders identically to no patch.

## 3. The adjustments

- [x] 3.1 Verify a scale scales about the glyph's own centre, leaving the centre
  where it was.
- [x] 3.2 Verify an advance override moves every glyph after it by the
  difference.
- [x] 3.3 Verify an ending override applies to one glyph only.

## 4. Spacing pairs

- [x] 4.1 Add spacing pairs to the advance computation. Verify a pair applies
  between its two characters in order and not in the other order.
- [x] 4.2 Verify a pair that widens a word past the available width changes the
  wrapping.

## 5. Project state

- [x] 5.1 Put patches and pairs in the project with their own command kinds.
  Verify they round-trip through JSON and that setting a patch undoes.

## 6. Identifying a glyph

- [x] 6.1 Carry the character and index on each glyph group in the scene.
  Verify two of the same character give the same character and different
  indices.
- [x] 6.2 Let a click on the canvas open that glyph's overrides. Verify in the
  browser.

## 7. Verification

- [x] 7.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
