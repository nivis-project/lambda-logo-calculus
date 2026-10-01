## 1. Controls

- [x] 1.1 Write one control per `ParamDef` kind, reading range, step, options
  and default from the definition. Verify each kind renders its own control.
- [x] 1.2 Verify a numeric control cannot be moved outside its declared range.
- [x] 1.3 Add the value readout, the lock and the reset to every control.
  Verify locking records the id in the project and unlocking removes it, and
  that a reset returns the default and can be undone.
- [x] 1.4 Add typing an exact value by double-clicking. Verify an in-range value
  is taken exactly and an out-of-range one is clamped with the control saying so.

## 2. Panels

- [x] 2.1 Build the panel from a list of definitions, grouping by `group` and
  hiding `advanced` behind a disclosure. Verify two groups render separately and
  that an advanced control is hidden until revealed.
- [x] 2.2 Build the left panel from the template's parameters and the nesting
  parameters. Verify every one appears.
- [x] 2.3 Build the right panel from the ending, the join, the palette, the pen
  and the stage parameters. Verify every one appears.
- [x] 2.4 Verify adding a parameter to a registration makes a control appear
  with no change under the studio's control layer.

## 3. The stage list

- [x] 3.1 List the stages in pipeline order, each switchable. Verify switching
  one off redraws the wordmark and can be undone.
- [x] 3.2 Allow reordering through the `setStages` command. Verify the order
  changes, the wordmark redraws, and it can be undone.
- [x] 3.3 Show each stage's own parameters when it is expanded. Verify they come
  from its definitions.

## 4. The gallery

- [x] 4.1 Render one thumbnail per registered template, drawn with the project's
  current copies, rotation and palette. Verify every template appears.
- [x] 4.2 Verify a thumbnail follows the project when the copy count changes.
- [x] 4.3 Choose a template through a command carrying its resolved defaults.
  Verify the template changes, its parameters take its defaults, and it can be
  undone.

## 5. Verification

- [x] 5.1 Verify the browser suite covers a control of each kind, a lock, a
  reset, a typed value, the stage list and the gallery.
- [x] 5.2 Verify coverage thresholds hold, `nix flake check` is green and
  `pnpm e2e` is green.
