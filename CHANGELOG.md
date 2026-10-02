# Changelog

All notable changes to lambda-logo-calculus are recorded here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries describe what changed for someone using the thing, not what was edited.

## [Unreleased]

### Added

- The port is proved. Compared against the prototype's own recorded output
  across all 27 settings, the worst difference is **0.007050 font units** over
  215,352 compared points. The rounding floor the prototype's two decimals put
  there is 0.0070711, so the two implementations agree exactly and what is left
  is the rounding. The figure is pinned by a test.
- The two hidden couplings are one named function rather than arithmetic buried
  where it is used: the amplitude sets the letter width, the fit size sets the
  x-height.
- The outliner returns its pieces separately, so the comparison knows which
  geometry the prototype writes as coordinates and which it writes as a
  reference. What is not compared is stated rather than left to be noticed.
- Colour, a line of letters, and a mark beside them. All six palettes with the
  formulas the prototype uses, the three different remaps of the opacity slider,
  advances and wrapping, and a lockup that sizes the mark against the text block
  and stacks it above when the text would otherwise break.
- A scene graph of plain, serialisable nodes that renderers read and nothing
  writes back to, with no masks anywhere. The prototype cuts its bowls with SVG
  masks, which cannot be exported to PDF without rasterising; a counter here is
  a second contour drawn with the even-odd rule.
- An SVG renderer that reads only the scene, and takes its ids from where a node
  sits rather than from a counter, so the same scene renders identically twice.
- The layout takes the width it has to work in as an input. The prototype reads
  it from the element it draws into, which is why the same parameters render
  differently in two windows and why no output of it is reproducible without
  also recording the width.
- Letters now have width. The support-function stroker turns a skeleton into an
  outline, and the base curve can act as the pen, so the same shape that draws
  the mark decides how thick each letter is in each direction. Copy `i` of the
  nested stack is the pen for pass `i`.
- All nine stroke endings, each in a shape-built and a plain form, plus the
  looped join. Serifs on vertical stems lie flat; balls appear only on curved
  ends. Taper and flare are a width profile on the stroker rather than added
  geometry, so a tapered end narrows the stroke itself.
- An ending applies to a free end and never to a joint, and a joint is covered
  by a stamp of the pen so two runs read as one stroke.
- The working skeleton carries its corners, measured before the bend stage
  smooths them. A bisector taken after bending is the bisector of a different
  angle, which would have put every loop in the wrong place.
- The four transformations that give the letterforms their character are now an
  ordered, switchable list of pure functions: curves warps arcs by the base
  curve, bowls traces counters from it, bend bows straight runs along it, and
  proportions scales width and remaps height. None of them reads a global, and
  the order comes from a list rather than from where the code happens to sit.
- A stage that is switched off can still have structural work to do. The curves
  stage samples an arc either way; only the warp is optional. That distinction
  is in the interface rather than in a special case.
- The two invariants the prototype's own notes claim are now property tests: a
  point on the baseline stays on the baseline whatever the parameters, and a
  bowl always encloses an area.
- The whole alphabet is data: 69 glyph skeletons of strokes, bowls, dots and cut
  regions on a shared grid. A glyph no longer depends on the amplitude, the
  rotation or which switches are on, because an arc is stored as a centre, two
  radii and two angles rather than as points somebody already sampled with the
  parameters that happened to be in force.
- The alphabet is extracted from the prototype rather than retyped, and a test
  re-runs the extraction and compares, so the two cannot drift apart. The
  extraction caught something a careful transcription would have missed: three
  glyphs splice a second arc on by dropping the point the two share, and that is
  now recorded on the arc rather than lost.
- A glyph set is validated when it is registered, so a malformed glyph is
  refused where it is added rather than where it is drawn, and an unknown
  character falls back to a notdef instead of breaking the render.
- The base curve and the nesting mathematics, agreeing with the prototype's own
  readouts across all 27 recorded settings: the fit, the effective scale and the
  smallest copy, to the three decimals it displays.
- The curve is a registered template rather than a formula written out in four
  places, so a second curve later is a registration and not a branch.
- Every safety limit reports instead of clamping silently. Four of them, each
  naming the value given and the value used, so a slider that has stopped
  responding says so rather than looking broken.
- One amplitude floor, applied everywhere. The prototype floors the amplitude
  where it bends letters and nowhere else, so below 1.15 its mark shows three
  petals, its nesting collapses to nothing and its letters are bent by a curve
  they are not drawn with. ADR 0002 records why the port does not copy that.
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

- Four faults found by the parity comparison, each of which would have passed
  every test written before it. An arc that starts where the previous point ends
  was leaving a segment of no length that the turn tests read as a corner. The
  angled cut was turning by the pass's own rotation instead of the rotation per
  copy, and was borrowing the serif rule for a vertical end. And the join loop
  was turning with each pass, where the prototype builds it once.

- The gate was not typechecking test files. `tsc --build` compiles only the
  published sources, so a type error in a test passed unnoticed; there was one.
  The gate now runs a typecheck step that covers them.
