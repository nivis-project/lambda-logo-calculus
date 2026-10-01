## 1. Quality

- [x] 1.1 Add the sampling quality record with a full and a draft setting, and
  thread it through the pen, the endings, the joins and the nesting search.
  Verify draft samples less finely everywhere.
- [x] 1.2 Verify a scene built with no quality given is identical to what it was
  before quality existed.

## 2. The cache

- [x] 2.1 Cache a glyph's outlines under a hash of what the geometry reads.
  Verify a colour change hits the cache and a parameter change misses it.
- [x] 2.2 Build the pens only on a miss. Verify a fully cached render builds no
  pen.
- [x] 2.3 Verify the hash is stable for the same values in a different order and
  different for a changed value.

## 3. The worker

- [x] 3.1 Build scenes in a worker through Comlink, dropping a render overtaken
  by a newer one. Verify in the browser that the studio stays responsive and
  draws the newest.
- [x] 3.2 Have the browser suite wait for a drawn glyph rather than for an
  element to exist, since a scene now arrives after the markup. Verify the whole
  suite is green.

## 4. The studio

- [x] 4.1 Draw draft while a control is held and full on release. Verify in the
  browser.
- [x] 4.2 Report the time the last render took and the quality it used. Verify
  in the browser.

## 5. The benchmark

- [x] 5.1 Add the budget benchmark: a 20-character wordmark at 12 copies, draft
  quality, a parameter moving between builds, median under 16 ms. Verify a
  cached render is under a millisecond and a full render under 50 ms.
- [x] 5.2 Run the benchmark as its own gate step rather than beside the suite,
  because a wall-clock figure measured under thirty parallel test files is the
  machine's and not the pipeline's. Verify it is stable alone.
- [x] 5.3 Record the measured figures, and what they were before this change, in
  the testing strategy.

## 6. Verification

- [x] 6.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
