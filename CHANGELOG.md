# Changelog

All notable changes to lambda-logo-calculus are recorded here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries describe what changed for someone using the thing, not what was edited.

## [Unreleased]

### Added

- The prototype is described rather than assumed. All 791 lines read, and what
  it does written down as requirements the port will have to meet: every control
  with its range and default, the curve and the nesting search, the grid and the
  69 glyphs, the four reshaping stages, the nine stroke endings in both their
  forms, the layout and the six palettes.
- Every hidden coupling named as a coupling. Three sliders quietly drive values
  nobody named: the amplitude sets letter width, bend, taper length and flare
  strength; the fit size sets the x-height; the transparency is remapped three
  different ways for letters, ornaments and the mark.
- Every clamp named as a safety limit, with its value: eight of them, sitting
  inline with no explanation, each one able to make a slider stop responding
  without saying so.
- Two defects recorded rather than quietly fixed. The amplitude floor of 1.15
  reaches the letters but not the shape they are drawn with, so below it the
  mark and the letters disagree about what curve they are made of. And the
  rendered geometry depends on the width of the window, so the same parameters
  draw differently in two browsers.
- The gate measures coverage and holds a floor: 70 percent across the project,
  80 percent on the core, on branches as well as lines. A branch nobody took is
  what coverage is actually for, and line coverage alone will happily call it
  tested. The figures are printed whether the gate passes or fails, so a number
  drifting downward is visible before it crosses.
- A testing strategy written before the port rather than during it, naming the
  five kinds of test this project uses and what each proves that the others
  cannot. It also says plainly what coverage is not evidence of, so the number
  does not become the goal.
- The prototype cannot change under the project's feet. Its digest is recorded
  and the suite checks it, so an edit, a reformat or a stray newline fails the
  gate saying that everything measured against it is now suspect, rather than
  surfacing later as a parity mismatch nobody can explain. Replacing it
  deliberately has a written procedure, and both halves have to land together.
- A README that orients someone who has just cloned the repository, and an index
  of the decision records.
- A gate that is real rather than a placeholder. One command builds, lints and
  tests the project inside a Nix sandbox with no network, and refuses to pass
  when there is nothing to check: a suite that finds no tests fails, because a
  gate that passes an empty project reports a verdict it did not reach. When it
  is red it names which of the three steps failed and what to run to see it.
- A dev shell carrying the same toolchain the gate uses, from one pinned
  nixpkgs, built for Linux and macOS on x86 and ARM from a single definition.
- The stack is decided and written down: strict TypeScript on pnpm, tested with
  Vitest, with the five alternatives that lost and the reason each lost.
- The repository is set up for spec-driven work: OpenSpec for changes, beans for
  milestones and epics, a gate that cannot be skipped, and a ship script that
  refuses to archive anything while the gate is red.

### Changed

### Fixed
