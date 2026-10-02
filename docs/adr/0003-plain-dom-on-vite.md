# 0003. Plain DOM on Vite for the studio, with no framework

- Status: accepted
- Date: 2026-10-02
- Change: `openspec/changes/archive/<add-studio-shell>`

## Context

The engine is done and has no interface. The studio needs a page, a dev server
that serves TypeScript, and a build.

What it does not need is most of what a framework is for. The studio has one
piece of state, which is the project, and one thing to do with it, which is to
rebuild a scene and draw it. There are no routes, no server data, no lists that
reorder, no optimistic updates and no components shared between screens.

Its controls are generated from parameter definitions, which are already data.
Generating a control from a declaration is a loop, whichever tool writes it.

One constraint comes from the architecture rather than from taste: the studio
must hold no geometry. Anything that decides where a point goes lives in the
engine, where the parity comparison can see it. That keeps the application layer
thin by construction, which is exactly the case where a framework earns least.

## Decision

Vite for the dev server and the build. Plain DOM for the interface, with no
framework.

## Consequences

The dependency list stays short, which matters because every dependency has to
come through the fixed-output derivation the sandboxed gate installs from, and
each one is a hash somebody has to update.

The redraw is explicit. One function rebuilds the scene and replaces what is on
the page, and everything that changes state calls it. That is cruder than a
framework's reconciliation and it is also the whole of the update logic, written
in one place where it can be read.

The cost arrives if the interface grows past what one redraw can carry:
variants, an export dialog, undo. At that point a framework starts to pay, and
this decision gets superseded rather than worked around. The signal to watch for
is the first time the redraw has to become partial to stay fast.

Vite still brings a build step between the source and the browser, so debugging
reads through a source map. ADR 0001 already accepted that cost for TypeScript.

## Alternatives considered

**React.** What the earlier build of this project used, and what most people
would reach for. Rejected because the studio's state is one object and its
update is one redraw: reconciliation, hooks and a component tree are machinery
for a problem this page does not have. It is also a real dependency with a real
hash, and it would need a Vite plugin whose version has to track Vite's.

**Svelte or Solid.** Smaller than React and compile away most of themselves, so
the runtime cost is close to nothing. Rejected for the same reason as React
rather than a different one: the problem is not big enough to need them. Both
also add a compiler to the build, which is another thing to pin.

**Lit, or web components by hand.** No framework in the usual sense, and the
controls would become reusable elements. Rejected because the controls are
generated from data rather than written out, so there is nothing to reuse: the
loop that builds a control from a declaration is the reuse.

**No bundler: plain ES modules served as files.** Fewest moving parts of all,
and no build step. Rejected because the TypeScript would still need compiling
and the import graph resolving, so the step comes back under a different name,
without the dev server that makes the loop fast.
