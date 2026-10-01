## 1. React

- [x] 1.1 Add react, react-dom and their types to `apps/studio` only, with the
  Vite React plugin. Verify the core boundary check still passes, so react did
  not reach the core.
- [x] 1.2 Add a hook binding the store to React, re-rendering on change. Verify
  a command dispatched outside React updates the view.

## 2. The shell

- [x] 2.1 Build the top bar, left panel, canvas, right panel and bottom strip.
  Verify all five are present and that the canvas is wider than either panel at
  1440 pixels.
- [x] 2.2 Add the undo and redo controls, disabled when there is nothing to do.
  Verify both states.

## 3. Artboards

- [x] 3.1 Render three labelled artboards: mark, side lockup, stacked lockup.
  Verify all three are present and labelled.
- [x] 3.2 Verify a command redraws all three.

## 4. Zoom and pan

- [x] 4.1 Implement zoom, pan and reset. Verify zooming in then out returns the
  scale, and that reset restores both scale and offset.
- [x] 4.2 Bound the zoom. Verify repeated zooming stays within the bounds.

## 5. Overlays

- [x] 5.1 Add the grid overlay drawing the baseline, x-height, cap-height and
  descender from the grid metrics. Verify the lines land at those positions.
- [x] 5.2 Add the skeleton, nib, bounds and optical box overlays, each
  switchable independently. Verify only the ones switched on are drawn.
- [x] 5.3 Make the scene builder report the working skeleton, so the skeleton
  overlay draws the real one. Verify disabling a stage changes what it draws.

## 6. The bottom strip

- [x] 6.1 Add the text field, dispatching a command on change. Verify typing
  redraws the wordmark and that it can be undone.
- [x] 6.2 Add the small-size preview at 16, 32, 64 and 128 pixels on light and
  dark. Verify all eight are present.

## 7. Shortcuts

- [x] 7.1 Bind undo, redo, zoom in, zoom out, reset zoom and the overlay
  toggles. Verify undo and redo from the keyboard.
- [x] 7.2 Suppress shortcuts while typing in a field. Verify the character is
  typed and the shortcut does not fire.

## 8. Verification

- [x] 8.1 Verify the end-to-end suite covers the shell, the artboards, an
  overlay, typing and a keyboard undo.
- [x] 8.2 Verify coverage thresholds hold and `nix flake check` is green.
