## 1. The decision

- [x] 1.1 Write ADR 0003 recording the interface stack and the alternatives
  that lost. Verify it names at least three.

## 2. The application

- [x] 2.1 Add `apps/studio` with a page that builds a logo and draws it from the
  scene graph. Verify it builds and the page shows the logo.
- [x] 2.2 Add the text field, redrawing through one path. Verify typing
  redraws.
- [x] 2.3 Show a prompt when the text is empty. Verify it appears and goes away.
- [x] 2.4 Verify the studio holds no geometry: search its sources for stroking,
  nesting and glyph mathematics and find none.

## 3. The browser suite

- [x] 3.1 Add Playwright against the built studio, building before it serves.
  Verify the suite builds the working tree.
- [x] 3.2 Write the first tests: the page draws, typing redraws, an empty text
  prompts. Verify all three pass.
- [x] 3.3 Have the ship run the suite after the gate. Verify a failing suite
  stops the ship before anything is archived.

## 4. Verification

- [x] 4.1 Update the dependency hash, and verify `nix flake check` is green.
- [x] 4.2 Update `AGENTS.md` with the new commands. Verify each runs.
