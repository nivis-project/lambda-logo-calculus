## 1. The command

- [x] 1.1 Add a `randomize` command kind carrying the definitions, the seed and
  the next seed. Verify it produces one log entry and advances the seed.
- [x] 1.2 Verify it round-trips through JSON and gives the same result.
- [x] 1.3 Verify one randomize is undone by one undo, returning every value it
  changed at once.

## 2. Locks and ranges

- [x] 2.1 Verify a locked parameter is untouched, and that locking everything
  leaves the project unchanged apart from its seed.
- [x] 2.2 Verify an unlocked parameter takes more than one value across repeated
  runs.
- [x] 2.3 Verify a declared randomize range is honoured and a parameter opting
  out with `randomize: false` is left alone.

## 3. The seed

- [x] 3.1 Verify two projects with the same seed and values randomise to the
  same result.
- [x] 3.2 Verify two presses in a row differ.
- [x] 3.3 Verify the command in the log carries the seed it drew from.

## 4. Variants

- [x] 4.1 Add a thumbnail and a removal to variants. Verify a variant carries
  its thumbnail and that removing one leaves the others.
- [x] 4.2 Add each randomize result to the strip automatically. Verify three
  runs give three variants.
- [x] 4.3 Verify restoring a variant returns the project and can be undone.

## 5. The studio

- [x] 5.1 Add the randomize action to the top bar. Verify it redraws the
  wordmark and can be undone with one press.
- [x] 5.2 Add the variant strip to the bottom with a thumbnail per variant,
  restore on click and remove. Verify all three in the browser.
- [x] 5.3 Verify a locked parameter visibly survives a randomize in the browser.

## 6. Verification

- [x] 6.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
