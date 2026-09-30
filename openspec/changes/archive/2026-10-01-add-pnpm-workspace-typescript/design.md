## Context

See proposal.md for motivation, and `specs/core-boundary/spec.md` for the
contract this design has to satisfy.

The repository has a Nix dev shell with Node 24 and pnpm 12, and nothing else.
No package manifests, no compiler config, no source. Everything here is being
decided for the first time, so the constraint is not an existing codebase but
the architecture rules in `AGENTS.md` and the layout suggested in
`docs/briefing.md`.

One fact shapes the whole design: the core is consumed in three very different
places. A browser bundle, a Node test runner, and a Web Worker (milestone 06).
Anything that only works in one of them is a defect, not a limitation.

## Goals / Non-Goals

**Goals:**

- The boundary is impossible to break silently. A violation fails the gate, with
  a message that names the file.
- Adding a package later is mechanical: copy a manifest, extend the base config,
  add a reference.
- The type settings are decided once and cannot be relaxed per package.

**Non-Goals:**

- No real code. Each package gets an entry point that exports something trivial,
  enough to build and to give the boundary test something to read. The geometry
  arrives in milestone 02.
- No test runner. Vitest and Playwright belong to the test harness and ship gate
  epic, which is also where the coverage thresholds and `nix flake check` gain
  teeth.
- No bundling decisions for the studio beyond "Vite". How the studio is built
  for production is a milestone 06 concern.

## Decisions

### Two layers of enforcement, not one

The spec requires the boundary to hold against the built bundle, not only the
source. So there are two mechanisms, and they fail for different reasons.

The **lint rule** catches the common case at the moment of writing, with a good
message pointing at the import. It is fast and it runs in the editor. It is also
disableable: a comment, a config edit, or a dependency that pulls React in
three levels down all get past it.

The **bundle test** catches what the lint rule cannot. It builds the core and
reads the output for forbidden identifiers. It is slower, it has a worse error
message, and it cannot be switched off by editing a lint config.

Alternative considered: lint only. Rejected because the rule that matters most
is the one that must survive someone trying to get around it, and because a
transitive dependency is invisible to an import rule.

Alternative considered: bundle test only. Rejected because a failure arrives
minutes after the mistake, with no line number.

### Determinism is enforced as a lint rule, not a runtime check

`Math.random()` and `Date.now()` are banned in `packages/core` by a
`no-restricted-globals` and `no-restricted-properties` rule, not by shadowing
them at runtime. A runtime guard would change the core's behaviour depending on
how it was loaded, which is the opposite of what the rule is for.

The seeded source the core uses instead is defined in milestone 02. This change
only closes the door.

### `noUncheckedIndexedAccess` is on, and stays on

Almost every function in the core indexes into an array of points. This setting
turns "I assumed there were at least three points" into a compile error. It is
noisy in exactly the places where the noise is the point.

It is set in `tsconfig.base.json`, which every package extends. A package that
overrides it fails the gate, per the spec.

Alternative considered: leave it off and rely on tests. Rejected: a property
test finds the empty-array case eventually, the compiler finds it now.

### Packages exist before they have contents

Five packages are created empty. This is deliberate. The boundary can only be
enforced between things that exist, and the cost of moving a file with imports
into a new package later is exactly the cost this avoids.

### The studio is not wired to the core yet

`apps/studio` builds with Vite and renders nothing of substance. Connecting it
to the pipeline is milestone 04. Wiring it now would mean inventing the store
and the panel system ahead of their epics.

## Risks / Trade-offs

- **The bundle test greps for identifiers, so it can produce a false positive.**
  A string literal containing the word `document` in a data file would trip it.
  Mitigation: the test looks for import statements and global references in the
  emitted module graph rather than raw substrings, and its own failure message
  shows the matched context so a false positive is obvious rather than
  mysterious.

- **`pnpm build` becomes a prerequisite of `pnpm test`, which slows the loop.**
  Mitigation: the boundary test is the only test that needs the build. It is
  tagged so `pnpm test` in a watch loop can skip it, while the gate always runs
  it.

- **Five empty packages look like over-engineering to someone arriving now.**
  Mitigation: the README already names what each one holds, and every one of
  them is filled by a named epic in the bean tree.

- **Strict settings plus `noUncheckedIndexedAccess` will make the geometry code
  more verbose.** This is the trade accepted knowingly: the alternative is
  silent `undefined` propagating into a coordinate, which surfaces as a `NaN` in
  an exported path hours later.

## Migration Plan

Not applicable. There is nothing to migrate from.
