## 1. Measuring the mark

- [x] 1.1 Write `boundsOfScene`, walking a scene's contours through its group
  transforms. Verify a mark that fills less than its viewBox reports the drawn
  geometry's bounds.
- [x] 1.2 Verify an empty scene reports that there is nothing to place rather
  than a degenerate box.

## 2. The interface and registry

- [x] 2.1 Define `Lockup` with a pure `place(input)` and build its registry.
  Verify a lockup placed twice from equal inputs gives equal results.
- [x] 2.2 Register `side` and `stacked`. Verify the registry contains exactly
  those two.

## 3. Placements

- [x] 3.1 Return a mark position and scale, a text position, and one baseline
  per line. Verify a placement carries all of them and no path data.
- [x] 3.2 Verify a two-line wrap gives two baselines one line height apart.

## 4. The side lockup

- [x] 4.1 Place the mark to the left of the text. Verify the mark's right edge
  is at or before the text's left edge.
- [x] 4.2 Verify raising the distance setting widens the space between them.

## 5. The stacked lockup

- [x] 5.1 Place the mark above the text, both centred. Verify the mark's bottom
  edge is at or above the text's top, and that the centres share an x
  coordinate.

## 6. Keeping what worked

- [x] 6.1 Verify the automatic switch to stacking still happens when a side
  lockup would break a word, and that no side width is reserved then.
- [x] 6.2 Verify the existing mark scale, gap and wrapping tests still pass
  unchanged.

## 7. The studio

- [x] 7.1 Build the three artboards from placements, so the horizontal and
  stacked lockups differ. Verify in the browser that they do.
- [x] 7.2 Verify the mark appears in both lockup artboards and alone in the
  first.

## 8. Verification

- [x] 8.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
