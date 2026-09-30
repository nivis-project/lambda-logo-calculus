# Trefoil Studio

A functional, parametric logo creator.

A designer picks a base shape, and both the mark and the wordmark's letters are
generated from that one piece of math. Change the shape and the whole identity
follows: the counters, the terminals, the joins, the proportions of every letter.

The outputs are logo files (SVG, PNG, PDF), a brand sheet, and a project file
that reopens exactly as saved.

## The idea

One curve drives everything. The default is the trefoil,
`r(theta) = A + cos(3 theta)`, drawn as nested rotated copies. That same curve
becomes the pen that strokes the letters, the shape of their terminals, and the
loop in their joins.

Swap the trefoil for a rose, a superellipse, a supershape, a rounded polygon or
a formula you type yourself, and the alphabet is redrawn from it.

## Repository layout

```text
packages/core          pure TS: templates, nesting, glyph sets, stages,
                       stroker, endings, lockup, scene graph
packages/render-svg    scene graph to SVG DOM
packages/export        SVG, PNG, PDF and brand sheet exporters
packages/templates     built-in template and glyph-set data
apps/studio            the UI: panels, canvas, store, history, project files
docs/adr               one decision record per stack or structural choice
docs/briefing.md       the authoritative brief
reference/             the prototype, used as behavioural spec
```

`packages/core` imports nothing from a UI, the DOM or a renderer. Everything
else plugs into it.

## Running it

Everything runs inside the Nix dev shell.

```sh
nix develop -c pnpm install
nix develop -c pnpm dev           # the studio on 127.0.0.1:5173
nix develop -c pnpm test          # unit, property and boundary tests
nix develop -c pnpm test:cov      # with the coverage thresholds
nix develop -c pnpm e2e           # Playwright against the built studio
nix develop -c pnpm lint
nix develop -c pnpm build
nix flake check                   # the whole gate, in the Nix sandbox
```

## How the work is organised

Milestones and epics live in `.beans`. Every epic gets one OpenSpec change under
`openspec/changes/`, implemented and shipped as a single gated step. The rules an
agent follows are in `AGENTS.md`.

## Licence

Apache-2.0. See `LICENSE`.
