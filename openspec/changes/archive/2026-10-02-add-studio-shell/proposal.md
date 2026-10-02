## Why

Epic [lambda-logo-calculus-f3o5](../../../.beans/lambda-logo-calculus-f3o5--the-studio-shell-and-the-live-preview.md),
under milestone 04 The studio.

There is nothing to open. The engine is proved against the prototype and has no
face, so the only way to see what it draws is to write a script.

That is the gap this milestone exists to close, and the shell is the first half
of it: a page that renders the logo and redraws when something changes. The
controls follow in the next epic; this one is the surface they will sit on.

## What Changes

- Add a studio application: one page, the logo drawn from the scene graph, and
  a text field.
- Redraw through one path, so every later control has somewhere to call.
- Record the interface stack in ADR 0003.
- Add a browser suite, and have the ship run it after the gate.

## Capabilities

### New Capabilities

- `studio-shell`: what the page holds, how it redraws, and the rule that it
  reads the scene graph and nothing else.

### Modified Capabilities

- `quality-gate`: the ship runs a browser suite after the gate, because a page
  that renders cannot be proved by a unit test.

## Impact

- New: `apps/studio/`, `playwright.config.ts`, `e2e/`,
  `docs/adr/0003-plain-dom-on-vite.md`.
- Changed: `scripts/ship-change.sh`, `package.json`, `pnpm-lock.yaml`,
  `nix/gate.nix` for the dependency hash.
- The browser suite runs in the dev shell rather than inside the Nix sandbox.
  The sandbox has no browser and getting one in is a separate problem; the
  suite still gates every ship because the ship script runs it.
- The studio holds no geometry of its own. It resolves parameters, calls the
  engine and draws the scene. A calculation in the application layer would be a
  calculation the parity comparison never sees.
