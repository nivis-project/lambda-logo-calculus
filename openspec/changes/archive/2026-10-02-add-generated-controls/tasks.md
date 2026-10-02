## 1. The controls

- [x] 1.1 Generate a control from a declaration, one per kind. Verify each kind
  gives the control it should.
- [x] 1.2 Take the bounds, the step and the default from the declaration.
  Verify a control's attributes match its parameter.
- [x] 1.3 Show the value, and reset to the default. Verify both.
- [x] 1.4 Redraw through the one path when a control moves. Verify the logo
  changes.

## 2. What the studio shows

- [x] 2.1 List the parameters the studio shows and in what order, holding no
  range, default or step of its own. Verify by searching the studio for a
  number that belongs to a declaration and finding none.
- [x] 2.2 Add the stage switches and the mark's controls. Verify each takes
  effect.
- [x] 2.3 Keep the advanced controls hidden until asked for. Verify both states.

## 3. Locks and randomize

- [x] 3.1 Add a lock to every lockable parameter. Verify a locked one is left
  alone.
- [x] 3.2 Randomize from the project's seed, advancing it each press. Verify a
  press changes the unlocked values and that setting the seed back repeats it.

## 4. Verification

- [x] 4.1 Browser tests: each kind of control appears, moving one redraws, reset
  returns to the default, a lock holds through randomize, advanced hides and
  shows.
- [x] 4.2 Verify the gate and the browser suite are green.
