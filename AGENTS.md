# lambda-logo-calculus

A functional, parametric logo creator. A designer picks a base shape, and both
the mark and the wordmark's letters are generated from that one piece of math.

The work here is a conversion, not a greenfield build. `reference/trefoil-type.html`
is a working 791-line prototype that already does this: a generative alphabet
driven by a trefoil curve, with nesting, stroke endings, palettes and a live
preview. It is the only authority on behaviour until milestone 02 is archived.

What it is not is a codebase anyone can extend. There are no specs, no tests, no
seams, and several parameters silently drive others. The goal is to turn it into
something that can take a controlled change: read it, write down what it does,
port it against a recorded fixture, and then prove the loop by adding one thing
it never had.

## How work moves

Every piece of work travels the same road. Do not skip a station.

1. **Bean first.** Milestones and epics live in `.beans` (`beans list`). Work
   belongs to an epic. Set the epic to `in-progress` before writing code.
2. **OpenSpec change.** One change per epic. `/opsx:propose` writes it. No
   implementation starts without a change under `openspec/changes/`.
3. **Ship.** `/mip:ship <change-name>` runs apply, changelog, gate, archive,
   commit and push as one gated step. Underneath it runs:

   ```sh
   bash scripts/ship-change.sh <change-name> "<commit subject>"
   ```

   The script refuses an unknown change name and a change with unchecked tasks,
   each before it stages anything.

The gate is `nix flake check`. It is never bypassed. A red gate means the code
is wrong, not that the gate is wrong.

## Commands

Everything runs inside the dev shell.

```sh
nix develop                       # the dev shell: node, pnpm, jj, git
nix develop -c pnpm install       # install dependencies
nix develop -c pnpm build         # tsc --build across the workspace
nix develop -c pnpm typecheck     # tsc --noEmit, tests included
nix develop -c pnpm lint          # eslint
nix develop -c pnpm test          # vitest
nix develop -c pnpm test:cov      # with the coverage thresholds
nix develop -c pnpm parity:record # re-record the prototype's output
nix develop -c bash scripts/gate.sh   # the gate's own steps, by hand
nix flake check                   # the ship gate, in the sandbox, no network
beans list                        # the milestone and epic tree
openspec list                     # the active changes
```

The gate is `scripts/gate.sh`: build, typecheck, lint, tests, coverage. It
fails when a step fails and names which, and it fails when the suite finds no
tests, because a gate that passes an empty project reports a verdict it did not
reach.

## Testing

`docs/testing-strategy.md` says which kind of test to reach for and what each
proves that the others cannot: known values, property tests, golden snapshots,
parity against the prototype, and end to end.

Coverage floors are 70 percent across the project and 80 percent on
`packages/core/src/**`, on branches as well as lines. They are a floor and not a
target, and the strategy document says what the number is and is not evidence
of.

### The dependency hash

The sandboxed gate installs offline from a fixed-output derivation, whose hash
lives in `nix/gate.nix`. A change that touches `package.json` or
`pnpm-lock.yaml` must update that hash in the same change, or the gate cannot
install.

To update it:

1. Set `pnpmDepsHash = "";` in `nix/gate.nix`.
2. Run `nix flake check`. It fails with a hash mismatch naming both the hash it
   expected and the hash it got.
3. Copy the `got:` value into `pnpmDepsHash`.
4. Run `nix flake check` again.

## The prototype

`reference/trefoil-type.html` is frozen. Its digest is recorded in
`reference/DIGEST` and the test suite checks it, so a changed prototype fails
the gate rather than quietly invalidating every spec written against it.

It is read, driven and recorded. It is never edited, and never partially
reimplemented to make a comparison easier. `reference/README.md` says what may
be done to it and how it is replaced deliberately on the one occasion that is
legitimate.

## Decisions

Write an ADR in `docs/adr/` before every stack or structural choice, using
`docs/adr/0000-template.md`. Number them in sequence, and add it to
`docs/adr/index.md`. An ADR that is superseded is marked, not deleted.

## Code style

No comments in code. The code says what it does; a name that needs a comment is
the wrong name. The exception is a comment that an OpenSpec change, a bean or
this file requires by name.

Prose in this repo uses straight quotes and plain hyphens. No em dash, no en
dash, no curly quotes, in any file.

## When the prototype is ambiguous

Stop and ask. Do not guess a product decision. Guessing an implementation detail
inside an agreed decision is fine and expected.

## Version control

`jj` on a colocated git repo. The working branch is `trefoil-v2`. Remote is
`git@github.com:nivis-project/lambda-logo-calculus.git`. Author is Pim Snel
<post@pimsnel.com>. Never add a `Co-authored-by` trailer, a "Generated with"
line, or any other attribution.

One commit per archived OpenSpec change, written by `scripts/ship-change.sh`.
The commit holds the code, the spec updates, the changelog entry and the bean
files together.

The earlier build of this project lives on the `main` bookmark. It is there to
read, not to copy from.

## Beans

When I refer to issues like lambda-logo-calculus-rn3b checkout the task
in @.beans/lambda-logo-calculus-rn3b-*.md

In this project we will use these tasks as epics for making openspec proposals.

WHEN you create a proposal at a link to this task in the proposal.md.
WHEN a bean is used to create an proposal change the status to "in-progress"
WHEN a proposal is archived add the link to the archived proposal in the frontmatter of this task like this:

```
openspec-link: openspec/changes/archive/....
```

You are allowed to update these statuses in the task frontmatter:

- in-progress
- todo
- draft
- completed
- scrapped

When making changes you are allowed to update the date/time in `updated_at` in the task frontmatter

Besides updating status and openspec-link, you are NOT ALLOWED to modify the contents of the task file.
