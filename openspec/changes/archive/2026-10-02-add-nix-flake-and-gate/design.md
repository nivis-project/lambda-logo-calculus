## Context

See proposal.md for motivation. The constraints that shape the approach:

- `flake.nix` exists already, with a check that always fails and a dev shell
  carrying only `jj` and `git`. This change replaces both halves of it.
- `scripts/ship-change.sh` already calls `nix flake check` and already refuses
  to archive when it fails. The ship road is built; only the gate is hollow.
- The Nix sandbox has no network. Anything a package registry would supply has
  to be fetched beforehand, through a derivation whose output hash is known.
- There is no TypeScript in the repository yet, so the gate's build, lint and
  test steps have nothing to act on until this change gives them something.
- The prototype at `reference/trefoil-type.html` is not touched. Nothing here
  depends on reading it.

## Goals / Non-Goals

**Goals:**

- `nix flake check` is the one gate, green, running build, lint and tests
  offline.
- `nix develop` gives a developer the same toolchain the gate uses.
- The stack choice is recorded with its alternatives, so the next person can
  tell a decision from an accident.
- The workspace is the minimum shape the gate needs, and no more.

**Non-Goals:**

- Coverage thresholds. Epic `lambda-logo-calculus-8yw4` owns them.
- Any geometry, any glyph, any rendering. `packages/core` is created empty of
  meaning here.
- Continuous integration configuration. The gate is one command; wiring it into
  a service is a later and smaller problem.
- A browser test runner. Nothing in this change renders anything.

## Decisions

### Strict TypeScript on pnpm, with Vitest

The prototype is browser JavaScript, and the target is a browser application, so
the runtime is settled by the problem. What is open is the language and the
tooling around it.

TypeScript, in strict mode, because the port's whole value is that a later
change can be made safely. A type error caught at the keyboard is the cheapest
test this project will ever get, and the prototype's implicit contracts (what
shape a glyph is, what a parameter may hold) become explicit the moment they are
typed.

pnpm because the port will be several packages and pnpm's workspaces are the
least ceremonious way to have them. It also has a content-addressed store, which
is what makes the offline Nix fetch tractable.

Vitest because it runs TypeScript without a separate build step, and because its
coverage is the v8 one, which epic `8yw4` will want.

**Alternatives considered.** Plain JavaScript with JSDoc types: fewer moving
parts, and rejected because the checking is weaker exactly where this project
needs it most. Bun or Deno: one tool instead of four, and rejected because
neither is as well travelled inside the Nix sandbox, and proving that is not
work this project should be doing. Rust or Go compiled to wasm: the cleanest
core by some distance, and rejected because the browser preview then needs a
bridge, the port stops being a port and becomes a rewrite, and milestone 02's
parity comparison gets harder rather than easier. npm or yarn instead of pnpm:
workable, and rejected because the Nix offline story for pnpm is the one already
proven on this machine.

### The gate is a derivation, not a script someone remembers to run

`nix flake check` builds a derivation that runs the gate. That is what makes it
reproducible and offline: the inputs are fixed before it starts, and it cannot
quietly reach for the network or for a tool the developer happens to have.

`scripts/gate.sh` holds the actual steps, and the derivation calls it. Keeping
the steps in a shell script rather than inline in Nix means a developer can run
the same thing by hand inside `nix develop` and get the same answer, which
matters when the gate is red and they are trying to find out why.

**Alternative considered.** Putting the steps directly in `nix/gate.nix`. One
less file, and rejected because then the only way to reproduce a failure is to
rebuild the derivation, which is slower and tells you less.

### Dependencies come through a fixed-output derivation

`pkgs.fetchPnpmDeps` fetches the pnpm store for the lockfile and verifies it
against a hash recorded in `nix/gate.nix`. The gate then installs offline from
that store.

The cost is a manual step: a change that touches `package.json` or
`pnpm-lock.yaml` must update that hash. The procedure is to blank the hash, let
the build fail, and copy the hash it reports. That obligation is written into
`AGENTS.md` in this change so it is not rediscovered painfully later.

**Alternative considered.** Vendoring `node_modules` into the repository. No
hash to maintain, and rejected for the obvious reason.

### The workspace ships with one smoke test, which is meant to be deleted

The gate must fail when there is nothing to check, and a test run that finds no
tests is exactly that. So the workspace cannot ship empty.

`packages/core` is created with a version constant and a test asserting it. That
test proves nothing about the project and is not meant to: its job is to show
that the toolchain compiles TypeScript, that the runner finds a test, and that
the gate turns green for the right reason. The proposal says plainly that
whoever writes the first real test in that package should delete it.

**Alternatives considered.** Running the suite with a flag that tolerates an
empty run: rejected, because it is the vacuous pass the spec forbids, and the
flag would outlive the reason for it. Writing a genuinely useful first module
instead: attractive, and rejected because every candidate is a port decision
that milestones 02 and 03 own, and making it here would pre-empt the specs those
milestones exist to write.

### `packages/core` is a name, not yet a thing

The package is created so the workspace has a member and the gate has a target.
What belongs in it is decided by reading the prototype, which has not happened.

Naming it `core` now rather than later costs nothing and avoids a rename when
milestone 03 starts filling it.

## Risks / Trade-offs

**The dependency hash is a manual step that will be forgotten.** → The gate
fails loudly with both hashes in the message, and `AGENTS.md` records the
procedure. It is annoying rather than dangerous: the failure is immediate and
the fix is mechanical.

**A smoke test that asserts a constant is the kind of test that teaches bad
habits.** → It is labelled, in the proposal and in design, as scaffolding with a
deletion instruction attached. If it survives into milestone 03 with real code
around it, that is a review failure worth catching.

**The sandbox may not behave like the dev shell for something later.** → It
already did not, in the previous build of this project, for a browser. Nothing
in this change needs a browser, so the divergence has no bite yet. When it does,
it gets an ADR of its own rather than a workaround.

**Pinning nixpkgs to one revision means security updates need a deliberate
bump.** → Accepted. Reproducibility is the point, and an unpinned input would
make the gate's verdict depend on the day.

## Migration Plan

There is nothing deployed and nothing to migrate. The one replacement is
`flake.nix`, whose current check always fails, so no behaviour anyone depends on
changes.

Rollback is to revert the change. The ship script would then call a gate that
fails, which is where the repository is today.
