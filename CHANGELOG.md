# Changelog

All notable changes to lambda-logo-calculus are recorded here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries describe what changed for someone using the thing, not what was edited.

## [Unreleased]

### Added

- Parameters are declared once, as data: an id, a kind, a range, a default, and
  whether they can be locked and randomized. Resolution reports what it clamped
  and names both numbers, where the prototype clamps silently and lets a slider
  stop responding without saying so.
- A typed registry per extension point, refusing a duplicate id so a typo cannot
  shadow a built-in module.
- Randomize draws from a stored seed, so the same seed gives the same result and
  a logo can be returned to. The prototype draws unseeded and cannot. That is a
  deliberate departure, and the reason is written down.
- The prototype's own output is recorded, across 27 settings that vary the
  amplitude, the rotation, the fit size, the copy count, all nine endings and
  all six palettes. The recorder drives the real prototype in a real browser;
  nothing of it is reimplemented, because a reimplementation would prove only
  that two transcriptions agree.
- Three guards keep the recording honest. It stores what each control actually
  took as well as what it was asked for, so a snapped slider is never compared
  against an unsnapped expectation. It fixes and records the container width,
  because the prototype's geometry depends on it. And a test asserts the breadth
  of the matrix, so the fixture cannot quietly shrink to the one case that
  passes.
- The parity tolerance is derived rather than chosen: the prototype rounds to
  two decimals, which puts a floor of 0.00707 font units under any comparison,
  and the tolerance is 0.02. A test checks the arithmetic, so it cannot drift
  away from the rounding it came from.
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
