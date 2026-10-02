# lambda-logo-calculus

A functional, parametric logo creator. A designer picks a base shape, and both
the mark and the wordmark's letters are generated from that one piece of math.

## What state this is in

A working prototype and a road to turn it into something extensible.

`reference/trefoil-type.html` is 791 lines of browser JavaScript that already
does the job: a generative alphabet driven by a trefoil curve, with nesting,
stroke endings, palettes and a live preview. What it is not is a codebase anyone
can safely change. There are no specs, no tests and no seams.

The work is a conversion, in four milestones: build the gate, describe the
prototype, port it against a recording of its own output, then prove the loop by
adding one thing it never had. `beans list` shows where that stands.

## Getting started

```sh
nix develop                       # node, pnpm, jj, git, all pinned
nix develop -c pnpm install
nix flake check                   # the gate: build, lint, test, offline
```

`nix flake check` is the only question that matters. It builds, lints and tests
inside a sandbox with no network, and nothing is archived, committed or pushed
while it is red.

## Finding your way

| where | what |
| ----------------------- | ----------------------------------------------- |
| `AGENTS.md`             | how work moves here, and the rules it moves under |
| `reference/README.md`   | the prototype: what it is, and that it is frozen |
| `docs/adr/index.md`     | the decisions, and the alternatives that lost    |
| `openspec/specs/`       | what the system must do                          |
| `openspec/changes/`     | what is being changed right now                  |
| `.beans/`               | milestones and epics                             |
| `CHANGELOG.md`          | what changed, for someone using the thing        |

## Licence

See `LICENSE`.
