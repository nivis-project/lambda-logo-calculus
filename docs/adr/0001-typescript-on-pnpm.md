# 0001. Strict TypeScript on pnpm, tested with Vitest

- Status: accepted
- Date: 2026-10-02
- Change: `openspec/changes/archive/<add-nix-flake-and-gate>`

## Context

`reference/trefoil-type.html` is 791 lines of browser JavaScript in one file. It
works, and nobody can change it safely: there are no types, no tests, no module
boundaries, and several parameters silently drive others through shared mutable
state.

The point of this project is to make that same behaviour extensible. So the
runtime is already settled by the problem. The logo is drawn in a browser, the
prototype is browser JavaScript, and milestone 02 proves the port by driving the
prototype in a real browser and comparing output. A runtime that cannot run
beside it makes that comparison harder, not easier.

What is open is the language on top of that runtime and the tooling around it.

One constraint comes from this project specifically: the gate runs inside the
Nix sandbox with no network, so whatever is chosen has to install offline from
a fixed-output derivation. That is a solved problem for some tools and an
experiment for others, and this project should not be the one running the
experiment.

## Decision

Strict TypeScript, in a pnpm workspace, tested with Vitest.

## Consequences

The prototype's implicit contracts become explicit the moment they are typed.
What shape a glyph is, what a parameter may hold, what a stage returns: these are
currently facts you learn by reading 791 lines, and they become declarations a
compiler checks. For a project whose whole value is that a later change can be
made safely, that is the cheapest test available.

Strict mode is chosen rather than TypeScript's defaults, including the flags
that are off by default: indexing an array gives something possibly undefined,
an optional property is not the same as one set to undefined, and an implicit
`any` is an error. These are irritating on the first day and are the reason the
types still mean something on the hundredth.

pnpm's workspaces let the port be several packages without ceremony, which
matters because the architecture the port is aiming at has a pure core that must
not reach for a DOM. A package boundary is the cheapest way to enforce that, and
it can be checked rather than asked for.

pnpm's content-addressed store is what makes the offline Nix fetch tractable.
`pkgs.fetchPnpmDeps` resolves the whole store for a lockfile in one derivation
with one hash.

The cost is a manual step that lasts the life of the project: a change touching
`package.json` or `pnpm-lock.yaml` must update that hash in the same change, or
the sandboxed gate cannot install. The failure is immediate and names both
hashes, so it is annoying rather than dangerous.

Vitest runs TypeScript without a separate build step, which keeps the gap
between writing a test and running it short. Its coverage provider is v8, which
the next epic needs.

A second cost worth naming: TypeScript is a build step between the source and
the browser. The prototype had none. Debugging the running studio will mean
reading through a source map, which is strictly worse than reading the file you
wrote. That is the price of the checking, and it is being paid knowingly.

## Alternatives considered

**Plain JavaScript with JSDoc types.** Fewer moving parts, no build step, and
the browser runs exactly what was written. TypeScript's checker can read JSDoc,
so the checking is not nothing. Rejected because the checking is weakest exactly
where this project needs it most: generic geometry types, discriminated unions
for pipeline stages, and the readonly annotations that keep a pure core pure are
all painful or impossible to express in JSDoc, and the ones that are possible are
verbose enough that people stop writing them.

**Bun.** Runtime, package manager, test runner and bundler in one tool, and
notably faster. Rejected because its offline story inside the Nix sandbox is
less travelled than pnpm's, and proving it out is work this project would be
doing instead of its own. The speed is not the bottleneck here: the gate's slow
part will be geometry, not module resolution.

**Deno.** Types without a build step, a capability model that would make the
pure core's purity enforceable by the runtime rather than by a lint rule, and a
standard library. Rejected for the same sandbox reason as Bun, plus a smaller
one: the browser build still needs a bundler, so the single-tool advantage does
not survive contact with the actual deliverable.

**Rust or Go compiled to WebAssembly.** By some distance the cleanest core: real
types, real purity, no accidental DOM access possible. Rejected because the port
stops being a port. Every comparison against the prototype would cross a
language boundary, the browser preview needs a bridge layer that is itself
untested code, and milestone 02's parity harness becomes the hardest part of the
project rather than a recording and a diff. The goal is to make the prototype
extensible, not to prove it can be rewritten.

**npm or yarn instead of pnpm.** Both work, and npm needs no extra tool at all.
Rejected because the workspace support is weaker where it matters (hoisting that
lets a package import something it never declared, which is precisely the
boundary this project wants enforced), and because the Nix offline path for pnpm
is the one already proven on this machine.

**Jest instead of Vitest.** More widely known, and more examples to copy.
Rejected because it needs its own transform configuration to read TypeScript,
which is one more thing to maintain and one more place for the test environment
to differ from the build.
