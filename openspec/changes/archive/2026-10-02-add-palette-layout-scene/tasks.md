## 1. Colour

- [x] 1.1 Add the six palettes as registered modules. Verify each formula
  against the one milestone 02 recorded.
- [x] 1.2 Add the three opacity remaps: letters, ornaments and the mark. Verify
  each against its formula.

## 2. Layout

- [x] 2.1 Add advances and widths. Verify a space advances by the word space,
  unscaled, and a letter by its advance times the width factor plus two side
  bearings.
- [x] 2.2 Add wrapping by words, with a too-wide word broken between characters
  and the break reported. Verify both.
- [x] 2.3 Take the available width as a parameter. Verify the same inputs give
  the same result and that nothing is measured.

## 3. The lockup

- [x] 3.1 Size the mark against the text block, enlarged 6 percent and limited
  to 30 percent of the width. Verify one line and three lines.
- [x] 3.2 Settle the placement by iterating at most four times. Verify it stops
  when the line count stops changing.
- [x] 3.3 Stack the mark above when a side lockup would break a word. Verify the
  switch and that the controls change meaning.
- [x] 3.4 Place the mark by the geometry it draws rather than its view box.
  Verify a lopsided stack is still centred.

## 4. The scene

- [x] 4.1 Add the scene graph: groups, transforms, paths, styles. Verify a scene
  round-trips through JSON.
- [x] 4.2 Verify a scene holds no mask, clip path or filter, and that a counter
  is a contour with the even-odd rule.
- [x] 4.3 Build a scene from a project: glyphs placed, passes coloured, the mark
  placed. Verify the structure.

## 5. The renderer

- [x] 5.1 Render a scene to SVG text, reading nothing but the scene. Verify the
  same scene twice gives identical output.
- [x] 5.2 Verify ids come from the renderer and not from the scene.

## 6. Verification

- [x] 6.1 Verify the gate is green and the core holds its coverage floor.
