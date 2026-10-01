## 1. Text in the scene

- [x] 1.1 Add the text node: a position, a size, a fill and a string, anchored
  at its start. Verify the SVG renderer draws it.
- [x] 1.2 Verify measuring a scene ignores its text, and cleaning leaves it
  alone.

## 2. Composition

- [x] 2.1 Place a scene inside another at a position and a scale. Verify the
  geometry lands there and the scene given is unchanged.

## 3. The sheet

- [x] 3.1 Compose the sheet: the mark, both lockups, the clear space and the
  swatches, each under a heading. Verify every section is present and named.
- [x] 3.2 Verify no geometry falls outside the page.
- [x] 3.3 Compute clear space from the mark's drawn outline. Verify a mark twice
  as tall gets twice the clear space, and that a large empty viewBox does not
  change it.
- [x] 3.4 Draw the clear space as a frame. Verify its inner edge is the mark's
  outline and its outer edge that outline grown on every side.
- [x] 3.5 Draw one labelled swatch per palette colour. Verify the count and the
  label.

## 4. The exporters

- [x] 4.1 Write text from the SVG exporter. Verify the string is in the file at
  its position.
- [x] 4.2 Write text from the PDF exporter with a standard font, the right way
  up. Verify the font resource, the text matrix and that a bracket or backslash
  is escaped.
- [x] 4.3 Register the brand sheet exporter. Verify it is in the registry and
  writes a file.

## 5. Snapshot

- [x] 5.1 Golden snapshot of a brand sheet, with the approval procedure the
  testing strategy already describes.

## 6. Verification

- [x] 6.1 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
