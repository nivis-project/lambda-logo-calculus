## 1. Entries and sources

- [x] 1.1 Define the modulation entry with a source, target, amount and curve.
  Verify it round-trips through JSON and evaluates the same.
- [x] 1.2 Implement the four sources, each normalised to 0 to 1. Verify a
  template parameter at mid-range gives 0.5, the copy index gives 0 then 1
  across six copies, the character position does the same across a word, and a
  seeded source is reproducible and in range.
- [x] 1.3 Verify a single copy or a single character gives 0 rather than
  dividing by zero.
- [x] 1.4 Verify a source with no value in the context is reported rather than
  treated as zero.

## 2. Curves

- [x] 2.1 Implement linear, ease in, ease out, ease in and out, and step.
  Verify each maps 0 to 0 and 1 to 1, that linear is the identity, and that
  ease in at 0.25 is below 0.25.
- [x] 2.2 Property test: every curve stays within 0 to 1 across its domain.

## 3. The default preset

- [x] 3.1 Express the prototype's two links as entries. Verify the default
  preset gives exactly the width factor and x-height the old formulas gave, for
  the prototype's defaults.
- [x] 3.2 Verify it matches exactly across a spread of amplitudes and fit sizes.
- [x] 3.3 Verify the parity recording still matches and every golden snapshot is
  unchanged.

## 4. Into the pipeline

- [x] 4.1 Evaluate the modulation list into the stage context, so the
  Proportions stage reads the values rather than computing them. Verify the
  stage's own tests still pass.
- [x] 4.2 Verify removing the amplitude entry stops the amplitude affecting the
  letter width, and that an amount of zero leaves the target unmodulated.
- [x] 4.3 Verify two entries naming one target combine in list order,
  deterministically.

## 5. The studio

- [x] 5.1 Add the modulation list to the right panel: add, remove, retarget and
  set the amount. Verify each in the browser.
- [x] 5.2 Verify removing the default amplitude link visibly stops the letters
  widening, and that it can be undone.

## 6. Verification

- [x] 6.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
