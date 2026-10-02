## 1. Guides in the scene

- [x] 1.1 Add the guide types and the optional list on a scene.
- [x] 1.2 Build the four rules per line and a box per drawn character, from the
  positions the letters were laid out at.
- [x] 1.3 Draw the x-height rule at the modulated x-height.
- [x] 1.4 Build none when guides are off.

## 2. Drawing a guide

- [x] 2.1 Render a rule, a label and a box, each as a hairline that does not
  grow with the drawing.
- [x] 2.2 Render nothing for a scene with no guides.

## 3. The switch

- [x] 3.1 Add the switch to the studio, off when the page opens, redrawing
  through the one path.

## 4. Verification

- [x] 4.1 Unit tests: the rules per line, the labels on the first line only, no
  box for a space, and an empty scene when guides are off.
- [x] 4.2 Unit test: the x-height rule moves with the fit size and the other
  three do not.
- [x] 4.3 Browser test: the overlay appears only when the switch is on.
- [x] 4.4 Verify the gate and the browser suite are green.
