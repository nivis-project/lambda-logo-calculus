# Trefoil Studio

A full-screen logo creator. A designer picks a base shape, and both the mark and
the wordmark's letters are generated from that one piece of math.

The authoritative brief is `docs/briefing.md`. Read it before planning anything.
Where this file and the brief disagree, the brief wins on product questions and
this file wins on process questions.

The user is one designer at a screen of 1440 px or wider, with mouse and
keyboard. The outputs are logo files (SVG, PNG, PDF), a brand sheet, and a
project file that reopens exactly as saved.

## How work moves

Every piece of work travels the same road. Do not skip a station.

1. **Bean first.** Milestones and epics live in `.beans` (`beans list`). Work
   belongs to an epic. Set the epic to `in-progress` before writing code.
2. **OpenSpec change.** One change per epic. `/opsx:propose` writes it. No
   implementation starts without a change under `openspec/changes/`.
3. **Ship.** `/mip:ship <change-name>` runs apply, changelog, gate, archive,
   commit, push and bean closure as one gated step.

The gate is `nix flake check`. It is never bypassed. A red gate means the code
is wrong, not that the gate is wrong.

## Commands

Everything runs inside the dev shell.

```sh
nix develop -c pnpm install
nix develop -c pnpm dev           # the studio on 127.0.0.1:5173
nix develop -c pnpm test          # vitest: unit, property and boundary tests
nix develop -c pnpm test:cov      # with the coverage thresholds
nix develop -c pnpm e2e           # playwright against the built studio
nix develop -c pnpm lint          # eslint, includes the core boundary rules
nix develop -c pnpm build
nix flake check                   # the ship gate, in the sandbox, no network
```

The gate runs build, lint, the test suite with coverage, the built-bundle
boundary check and the end-to-end suite. The dependency hash it needs lives in
`nix/gate.nix`; a change that touches `package.json` or `pnpm-lock.yaml` updates
that hash in the same change.

## Version control

`jj` on a colocated git repo. Remote is
`git@github.com:nivis-project/lambda-logo-calculus.git`. Author is Pim Snel
<post@pimsnel.com>. Never add a `Co-authored-by` trailer, a "Generated with"
line, or any other attribution.

One commit per archived OpenSpec change, written by `scripts/ship-change.sh`.
The commit holds the code, the spec updates, the changelog entry and the bean
files together.

## Architecture rules

These are not style preferences. A change that breaks one of them is rejected.

- **`packages/core` imports nothing from UI, DOM, or a renderer.** No `react`,
  no `document`, no `window`. Enforced by an eslint boundary rule and by a test
  that fails on a forbidden import in the built bundle.
- **Pure functions only in the core.** Same parameters in, same geometry out.
  Randomness comes from a seed stored in the project, never from `Math.random()`.
- **The pipeline runs one way.** template, nesting, glyph set, skeleton stages,
  stroker, endings and joins, style, layout, scene graph. A stage never reads a
  later stage's output and never reads global state.
- **Everything is data.** Templates, skeletons, palettes, endings and settings
  are JSON-serialisable and validated against a schema. A project file is that
  data plus a version number.
- **Features are registrations.** A new ending, stage, template, palette,
  lockup or exporter is one module registered with a typed interface. Growing a
  `switch` statement instead is a bug.
- **Parameters are first-class.** Every tunable value is a `ParamDef` with id,
  kind, range, default, lockable and randomisable flags. Panels, locks and
  randomize are generated from those definitions. A hand-written slider is a bug.
- **Every edit is a command.** Undo, redo, autosave and variants come from the
  command log. A store mutation outside a command is a bug.
- **No `eval`.** Custom formulas go through a restricted parser with a function
  whitelist.
- **16 ms budget.** A 20-character wordmark at 12 copies re-renders under 16 ms
  while a slider is dragged. A change that breaks the budget benchmark is a bug.

## Decisions

Write an ADR in `docs/adr/` before every stack or structural choice, using
`docs/adr/0000-template.md`. Number them in sequence. An ADR that is superseded
is marked, not deleted.

The choices already made are in ADRs 0001 to 0007. Do not reopen them without
writing a superseding ADR.

## Testing

Four kinds, described in `docs/testing-strategy.md`:

- known values (the math has answers we can write down)
- property tests (invariants that hold for random parameters)
- golden snapshots (each template against a fixed test string)
- end-to-end (Playwright, against the real UI)

Milestone 01 additionally proves parity with the prototype within tolerance.

## Code style

No comments in code. The code says what it does; a name that needs a comment is
the wrong name. The exception is a comment that an OpenSpec change, a bean or
this file requires by name.

Prose in this repo uses straight quotes and plain hyphens. No em dash, no en
dash, no curly quotes, in any file.

## When the brief is ambiguous

Stop and ask. Do not guess a product decision. Guessing an implementation detail
inside an agreed decision is fine and expected.

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
