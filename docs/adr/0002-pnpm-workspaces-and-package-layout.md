# 0002. pnpm workspaces and the five-package layout

- Status: accepted
- Date: 2026-10-01
- Change: `openspec/changes/archive/2026-10-01-add-pnpm-workspace-typescript`

## Context

ADR 0001 requires a boundary between the geometry core and everything else, and
requires it to be enforced by a tool rather than by discipline. A boundary can
only be enforced between units the tooling recognises.

`docs/briefing.md` suggests a layout: a pure core, a renderer per target, an
export package, a templates package and the studio application. It names pnpm
workspaces as a candidate without fixing it.

The project ships one application. It does not publish libraries, so version
ranges between the packages carry no information.

## Decision

A pnpm workspace with five packages:

```text
packages/templates     built-in template and glyph-set data
packages/core          templates, nesting, glyph sets, stages, stroker,
                       endings, lockup, scene graph
packages/render-svg    scene graph to SVG DOM
packages/export        SVG, PNG, PDF and brand sheet exporters
apps/studio            panels, canvas, store, history, project files
```

Dependencies run one way: `templates` to `core`, `core` to `render-svg` and
`export`, and all four to `studio`. TypeScript project references mirror that
graph, so `tsc --build` compiles in dependency order and refuses a cycle.

All five packages are created now, empty apart from one exported value each,
before any of them has real contents.

## Consequences

The boundary rules of ADR 0001 have something to attach to. `@trefoil/core`
importing `@trefoil/render-svg` is a violation a lint rule can name, rather than
a layering idea in a document.

`tsc --build` gives incremental compilation for free, and a change to
`packages/core` rebuilds only what depends on it.

Five packages holding one constant each look like over-engineering to anyone
arriving today, and they are: the structure is being paid for before it is used.
The alternative is paying later, when the files being moved already have
imports pointing the wrong way.

pnpm's workspace protocol (`workspace:*`) keeps the packages linked without
version numbers that would mean nothing. It also means these packages cannot be
published as they stand, which is correct for now and a deliberate step to undo
if that ever changes.

A cost that showed up immediately: build-script approval. pnpm blocks
postinstall scripts by default, and the key that allows them (`allowBuilds` in
`pnpm-workspace.yaml`) moved between pnpm majors. That configuration now has to
be tracked alongside the pnpm version.

## Alternatives considered

**npm workspaces.** Already present wherever Node is, one less tool in the
flake. Rejected: pnpm's content-addressed store makes the repeated clean
installs this project does in its gate substantially cheaper, and nixpkgs has a
fixed-output fetcher for pnpm that makes the sandboxed gate possible at all.

**A single package with directories instead of workspaces.** Much simpler, no
manifests, no link resolution. Rejected: a directory is not a boundary any
import rule can defend, and path-based lint rules break the first time a file
moves.

**Nx or Turborepo.** Task orchestration, caching, dependency graphs. Rejected:
five packages and one application do not need an orchestrator, and
`tsc --build` already does the ordering. Reconsider if the build gets slow.

**Create packages lazily, as each is needed.** Less scaffolding up front, and
nothing empty in the tree. Rejected: it defers the boundary past the point where
code starts crossing it, which is exactly when the boundary is worth having.
